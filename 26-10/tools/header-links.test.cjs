const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const menuIds = ['saHeaderSplitMenu', 'saHeaderMoreButtonsMenu', 'saHeaderUserManagementMenu', 'saHeaderMoreLinksMenu'];
test('four independent header menus preserve static items and collect overflow groups', async () => {
	const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
	try {
		const page = await browser.newPage({ viewport: { width: 1920, height: 900 } });
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		await page.goto('http://localhost/jonathan-git/26-10/header-links');
		await page.evaluate(() => document.fonts.ready);
		await page.waitForTimeout(300);
		assert.deepEqual(errors, []);
		assert.equal(await page.locator('[data-sa-responsive-header] .saContextMenu').count(), 8);
		assert.equal(await page.locator('.saButtonSplit .saContextMenu .saOptionWrapper').filter({ hasText: /^\s*Export data\s*$/ }).count(), 0);
		assert.equal(await page.locator('[data-sa-menu-icon]').count(), 0);
		await page.locator('#toggleHalfItems').click();
		for (const width of [1920, 280]) {
			await page.setViewportSize({ width, height: 900 });
			await page.waitForTimeout(300);
			const header = page.locator(width <= 640 ? '.saSmallScreenHeader' : '.saDesktopHeader');
			for (const rowSelector of ['.saActionLinks', '.saTopLinks > ul']) {
				const half = await header.evaluate((view, selector) => {
					const row = view.querySelector(selector);
					const more = row.querySelector('.saMoreButton, .saMoreLinks').closest('li');
					const items = [...row.children].filter(li => li !== more);
					const excluded = items.filter(li => li.hasAttribute('data-sa-header-excluded'));
					const menu = more.querySelector('.saContextMenu');
					return {
						total: items.length, excluded: excluded.length,
						excludedHidden: excluded.every(li => li.hidden), moreHidden: more.hidden,
						leaked: excluded.some(li => {
							const nested = li.querySelector('.saContextMenu');
							const label = li.querySelector(':scope > .saTopButton, :scope > .saTopLink').textContent.trim();
							return [...menu.querySelectorAll('[data-sa-header-overflow]')].some(copy =>
								copy.textContent.trim() === label || (nested && copy.dataset.saHeaderOverflow === nested.id));
						})
					};
				}, rowSelector);
				assert.equal(half.excluded, Math.floor(half.total / 2));
				assert.equal(half.excludedHidden, true);
				assert.equal(half.moreHidden, false);
				assert.equal(half.leaked, false);
			}
		}
		await page.evaluate(() => document.getElementById('toggleHalfItems').click());
		await page.setViewportSize({ width: 1920, height: 900 });
		await page.waitForTimeout(300);
		assert.equal(await page.locator('.saDesktopHeader [data-sa-header-excluded]').count(), 0);
		assert.equal(await page.locator('#toggleHalfItems').getAttribute('aria-pressed'), 'false');
		assert.equal(await page.locator('#toggleArrows').getAttribute('aria-pressed'), 'true');
		assert.equal(await page.locator('#toggleLinkIcons').getAttribute('aria-pressed'), 'true');
		assert.equal(await page.evaluate(() => [...document.querySelectorAll('.fa-arrow-up-right, .saTopLink > .saIcon:not(.fa-angle-down)')]
			.every(icon => getComputedStyle(icon).display === 'none')), true);
		await page.locator('#toggleArrows').click();
		await page.locator('#toggleLinkIcons').click();
		await page.locator('#toggleLinkIcons').click();
		await page.setViewportSize({ width: 280, height: 900 });
		await page.waitForTimeout(300);
		assert.equal(await page.evaluate(() => [...document.querySelectorAll('.saTopLinks > ul > li > .saTopLink > .saIcon:not(.fa-arrow-up-right, .fa-angle-down)')]
			.every(icon => getComputedStyle(icon).display === 'none')), true);
		assert.equal(await page.evaluate(() => [...document.querySelectorAll('.saContextMenu .saOptionIcon:not(.fa-arrow-up-right), .fa-arrow-up-right')]
			.every(icon => getComputedStyle(icon).display !== 'none')), true);
		await page.evaluate(() => document.getElementById('toggleLinkIcons').click());
		await page.setViewportSize({ width: 1920, height: 900 });
		await page.waitForTimeout(300);
		assert.equal(await page.locator('#toggleLinkIcons').getAttribute('aria-pressed'), 'false');
		await page.locator('#toggleArrows').click();
		await page.setViewportSize({ width: 280, height: 900 });
		await page.waitForTimeout(300);
		assert.equal(await page.evaluate(() => [...document.querySelectorAll('.fa-arrow-up-right')]
			.every(icon => getComputedStyle(icon).display === 'none')), true);
		assert.equal(await page.locator('#toggleArrows').getAttribute('aria-pressed'), 'true');
		assert.equal(await page.evaluate(() => [...document.querySelectorAll('.saTopLink > .saIcon:not(.fa-arrow-up-right, .fa-angle-down)')]
			.every(icon => getComputedStyle(icon).display !== 'none')), true);
		await page.evaluate(() => document.getElementById('toggleArrows').click());
		await page.setViewportSize({ width: 1920, height: 900 });
		await page.waitForTimeout(300);
		assert.equal(await page.locator('#toggleArrows').getAttribute('aria-pressed'), 'false');
		assert.equal(await page.evaluate(() => [...document.querySelectorAll('.fa-arrow-up-right')]
			.every(icon => getComputedStyle(icon).display !== 'none')), true);
		await page.locator('#togglePills').click();
		await page.setViewportSize({ width: 280, height: 900 });
		await page.waitForTimeout(300);
		assert.equal(await page.evaluate(() => [...document.querySelectorAll('.saMenuItemPill, .saPill')]
			.every(pill => getComputedStyle(pill).display === 'none')), true);
		assert.equal(await page.locator('#togglePills').getAttribute('aria-pressed'), 'true');
		await page.evaluate(() => document.getElementById('togglePills').click());
		await page.setViewportSize({ width: 1920, height: 900 });
		await page.waitForTimeout(300);
		assert.equal(await page.locator('#togglePills').getAttribute('aria-pressed'), 'false');
		assert.equal(await page.evaluate(() => [...document.querySelectorAll('.saMenuItemPill, .saPill')]
			.every(pill => getComputedStyle(pill).display !== 'none')), true);
		const rowsAreLinksFirst = () => page.evaluate(() => [...document.querySelectorAll('.saDesktopHeader, .saSmallScreenHeader')].every(view => {
			const links = view.querySelector('.saTopLinks');
			const actions = view.querySelector('.saActionLinkBar') || view.querySelector('.saActionLinks');
			return !!(links.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING);
		}));
		await page.locator('#flip').click();
		assert.equal(await rowsAreLinksFirst(), true);
		await page.setViewportSize({ width: 640, height: 900 });
		await page.waitForTimeout(300);
		assert.equal(await page.locator('.saSmallScreenHeader').evaluate(view =>
			view.querySelector('.saTopLinks').getBoundingClientRect().bottom <= view.querySelector('.saActionLinkBar').getBoundingClientRect().top), true);
		await page.evaluate(() => document.getElementById('flip').click());
		assert.equal(await rowsAreLinksFirst(), false);
		assert.equal(await page.locator('#flip').getAttribute('aria-pressed'), 'false');
		await page.setViewportSize({ width: 1920, height: 900 });
		await page.waitForTimeout(300);
		for (const id of menuIds) {
			const trigger = page.locator('.saDesktopHeader [aria-controls="' + id + '"]');
			await trigger.focus();
			await page.keyboard.press('ArrowDown');
			assert.equal(await page.locator('#' + id).getAttribute('aria-hidden'), 'false');
			assert.equal(await page.locator('.saDesktopHeader .saContextMenu.saOpen').count(), 1);
			await page.keyboard.press('End');
			assert.equal(await page.locator('#' + id + ' :focus').count(), 1);
			await page.keyboard.press('Escape');
			assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
		}
		for (const width of [1920, 1440, 1150, 1000, 800, 641, 640, 480, 375, 320, 280, 375, 640, 641, 1000, 1920]) {
			await page.setViewportSize({ width, height: 900 });
			await page.waitForTimeout(300);
			const small = width <= 640;
			const header = page.locator(small ? '.saSmallScreenHeader' : '.saDesktopHeader');
			assert.equal(await header.locator('.saTopLinks > ul > li > a > .saIcon:not(.fa-arrow-up-right)').count(),
				await header.locator('.saTopLinks > ul > li > a').count());
			const suffix = small ? '-small' : '';
			for (const [rowSelector, menuId, nestedId] of [
				['.saActionLinks', menuIds[1], menuIds[0]],
				['.saTopLinks > ul', menuIds[3], menuIds[2]]
			]) {
				const state = await header.evaluate((view, args) => {
					const row = view.querySelector(args.rowSelector);
					const bounds = row.getBoundingClientRect();
					const menu = view.querySelector('#' + args.menuId);
					const nested = view.querySelector('#' + args.nestedId);
					const nestedItem = nested.closest('li');
					const available = row.parentElement;
					const style = getComputedStyle(available);
					const list = menu.querySelector(':scope > ul');
					return {
						width: bounds.width, right: bounds.right,
						available: available.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
						staticItems: list.querySelectorAll(':scope > li:not([data-sa-header-overflow])').length,
						nestedHidden: nestedItem.hidden,
						nestedCount: nested.querySelectorAll('.saOptionWrapper').length,
						copiedNestedCount: [...list.children].filter(li => li.dataset.saHeaderOverflow === args.nestedId).length,
						firstNestedText: [...list.children].find(li => li.dataset.saHeaderOverflow === args.nestedId)?.textContent.trim(),
						primaryGrouped: !![...list.children].find(li => li.dataset.saHeaderOverflow === args.nestedId)?.nextElementSibling?.querySelector('.saOptionWrapper'),
						separators: list.querySelectorAll(':scope > li > hr').length,
						lastSeparator: !!list.lastElementChild.querySelector('hr'),
						staticSeparator: !!list.querySelector(':scope > li:not([data-sa-header-overflow])').previousElementSibling?.querySelector('hr'),
						staticLast: !list.lastElementChild.hasAttribute('data-sa-header-overflow'),
						moreHidden: menu.closest('li').hidden,
						misplacedArrows: [...menu.querySelectorAll('.fa-arrow-up-right')].filter(icon =>
							!icon.classList.contains('saOptionIcon') || !icon.parentElement.classList.contains('saOption') || icon !== icon.parentElement.lastElementChild).length,
						missingDestinationIcons: args.rowSelector === '.saTopLinks > ul'
							? [...menu.querySelectorAll('.saOptionWrapper')].filter(item => !item.querySelector('.saOption > .saOptionIcon:first-child')).length : 0,
						invalidDestinationIcons: args.rowSelector === '.saTopLinks > ul'
							? [...menu.querySelectorAll('i.saOptionIcon')].filter(icon => ['none', 'normal', '""'].includes(getComputedStyle(icon, '::before').content)).length : 0,
						hidden: [...row.children].filter(li => li.hidden).length
					};
				}, { rowSelector, menuId: menuId + suffix, nestedId: nestedId + suffix });
				assert.ok(state.width <= state.available + 1, rowSelector + ' exceeds available width at ' + width);
				assert.ok(state.right <= width + 1, rowSelector + ' exceeds viewport at ' + width);
				assert.equal(state.staticItems, 1);
				assert.equal(state.moreHidden, false);
				assert.equal(state.misplacedArrows, 0);
				assert.equal(state.missingDestinationIcons, 0);
				assert.equal(state.invalidDestinationIcons, 0);
				assert.equal(state.lastSeparator, false);
				assert.equal(state.staticSeparator, false);
				assert.equal(state.staticLast, true);
				if (state.nestedHidden) {
					assert.equal(state.copiedNestedCount, state.nestedCount + (rowSelector === '.saActionLinks' ? 1 : 0));
					if (rowSelector === '.saActionLinks') {
						assert.equal(state.firstNestedText, 'Export data');
						assert.equal(state.primaryGrouped, true);
					}
					assert.ok(state.separators > 0);
				} else assert.equal(state.copiedNestedCount, 0);
				if (width === 1920) assert.equal(state.hidden, 0);
				if (width === 280) assert.equal(state.nestedHidden, true);
				const trigger = header.locator('[aria-controls="' + menuId + suffix + '"]');
				await trigger.click();
				assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
				await page.keyboard.press('Escape');
			}
			if (small) {
				assert.equal(await page.evaluate(() => document.querySelector('.saInputPage').getBoundingClientRect().top >= document.querySelector('.saSmallScreenHeader').getBoundingClientRect().bottom), true);
			}
		}
		assert.equal(await page.evaluate(() => {
			const ids = [...document.querySelectorAll('[data-sa-responsive-header] [id]')].map(element => element.id);
			return ids.length === new Set(ids).size;
		}), true);
		await page.setViewportSize({ width: 280, height: 900 });
		await page.waitForTimeout(300);
		for (const [sourceSelector, moreSelector, copiedSelector] of [
			['.saButtonSplit > button:first-child', '.saMoreButton', '[data-sa-header-overflow="saHeaderSplitMenu-small"] .saOptionWrapper'],
			['#saHeaderUserManagementMenu-small .saOptionWrapper', '.saMoreLinks', '[data-sa-header-overflow="saHeaderUserManagementMenu-small"] .saOptionWrapper']
		]) {
			const header = page.locator('.saSmallScreenHeader');
			const source = header.locator(sourceSelector).first();
			await source.evaluate(source => { source.addEventListener('click', () => { source.dataset.activated = 'true'; }); });
			await header.locator(moreSelector).click();
			await header.locator(copiedSelector).first().click();
			assert.equal(await source.getAttribute('data-activated'), 'true');
			assert.equal(await header.locator(moreSelector).getAttribute('aria-expanded'), 'false');
		}
		for (const width of [1000, 280]) {
			await page.setViewportSize({ width, height: 900 });
			await page.waitForTimeout(300);
			const header = page.locator(width <= 640 ? '.saSmallScreenHeader' : '.saDesktopHeader');
			for (const theme of ['light', 'dark']) {
				await page.evaluate(theme => { document.body.dataset.theme = theme; }, theme);
				for (const more of ['.saMoreButton', '.saMoreLinks']) {
					await header.locator(more).click();
					if (process.env.HEADER_LINKS_SCREENSHOT_DIR) {
						await page.waitForTimeout(150);
						await page.screenshot({ path: process.env.HEADER_LINKS_SCREENSHOT_DIR + '/four-menus-' + width + '-' + theme + '-' + more.slice(1) + '.png' });
					}
					await page.keyboard.press('Tab');
					assert.equal(await header.locator(more).getAttribute('aria-expanded'), 'false');
				}
			}
		}
		assert.deepEqual(errors, []);
	} finally { await browser.close(); }
});
