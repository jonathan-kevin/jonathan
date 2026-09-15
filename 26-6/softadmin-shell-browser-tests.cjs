// Fresh browser context; all AI calls are mocked, including the first generation.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
	const browser = await chromium.launch({ channel: 'msedge', headless: true });
	try {
		const context = await browser.newContext({ viewport: { width: 1800, height: 1300 } });
		const page = await context.newPage();
		page.setDefaultTimeout(10000);
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		let requestSpec;
		let calls = 0;
		await context.route('**/.netlify/functions/softadmin-spec', async route => {
			if (route.request().method() === 'OPTIONS') {
				await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST', 'access-control-allow-headers': 'content-type' } });
				return;
			}
			requestSpec = route.request().postDataJSON().currentSpec;
			const spec = structuredClone(requestSpec);
			if (++calls === 1) {
				spec.frame = { ...spec.frame, title: 'Customer overview', actions: [{ label: 'Open', icon: 'eye' }, { label: 'Export', icon: 'download' }, { label: 'Remove', icon: 'trash' }] };
				spec.components = [{ type: 'Multipart', parts: [{ component: { type: 'NewEdit', sections: [{ heading: 'Contact', fields: [{ control: 'textbox', label: 'Name', value: 'Anna' }] }] } }] }];
			} else {
				spec.components[0].parts[0].component.sections[0].fields.push({ control: 'textbox', label: `Added by AI ${calls}` });
			}
			await route.fulfill({ json: { spec }, headers: { 'access-control-allow-origin': '*' } });
		});
		await page.goto(process.env.SOFTADMIN_TEST_URL || 'http://localhost/jonathan-git/26-6/');
		const menu = page.locator('.saSideBarBody [data-softadmin-shell-kind="item"]').filter({ hasText: 'Rooms' });
		await menu.locator('.saItemInner > span').fill('Resource bookings');
		const generate = async () => {
			await page.locator('#SoftadminPrompt').fill('Add one field to the form. Keep everything else.');
			await page.locator('#SoftadminGenerate').click();
			await page.waitForFunction(() => document.querySelector('#SoftadminPromptStatus').textContent.startsWith('AI spec:'));
		};
		await generate();
		assert.ok(requestSpec.sidebar.groups.some(group => group.items.some(item => item.title === 'Resource bookings')), 'Pre-generation edits must be in the request.');
		const renamed = page.locator('.saSideBarBody [data-softadmin-shell-kind="item"]').filter({ hasText: 'Resource bookings' });
		const menuId = await renamed.getAttribute('data-softadmin-shell-id');
		await renamed.locator('.saItemInner > span').click();
		await page.locator('[data-softadmin-selection-action="move-down"]').click();
		await page.locator('[data-softadmin-selection-action="duplicate"]').click();
		await page.locator('[data-softadmin-selection-action="delete"]').click();
		const sourcePoint = await page.locator(`[data-softadmin-shell-id="${menuId}"] .saItemInner > span`).boundingBox();
		const targetPoint = await page.locator('.saSideBarFavorites .saItemInner > span').last().boundingBox();
		await page.mouse.move(sourcePoint.x + 10, sourcePoint.y + 5);
		await page.mouse.down();
		await page.mouse.move(targetPoint.x + 10, targetPoint.y + targetPoint.height - 1, { steps: 15 });
		await page.mouse.up();
		assert.equal(await page.locator(`.saSideBarFavorites [data-softadmin-shell-id="${menuId}"]`).count(), 1);
		await page.locator('.saSideBarGroup > h3').filter({ hasText: 'Resources' }).fill('Resource pool');
		await page.locator('.saAccountName').fill('Mira Andersson');
		const header = page.locator('#pageheader > .saDesktopHeader');
		await header.locator('.saHeaderText').fill('My customer page');
		await header.locator('.saTopLink').filter({ hasText: 'Open' }).locator('.saButtonText').fill('View customer');
		await header.locator('.saTopLink').filter({ hasText: 'Remove' }).locator('.saButtonText').click();
		await page.locator('[data-softadmin-selection-action="delete"]').click();
		const shellState = () => page.evaluate(() => ({
			account: document.querySelector('.saAccountName').textContent,
			title: document.querySelector('#pageheader .saHeaderText').textContent,
			actions: Array.from(document.querySelectorAll('#pageheader > .saDesktopHeader .saTopLink')).map(node => ({ id: node.dataset.softadminShellId, label: node.textContent.trim() })),
			groups: Array.from(document.querySelectorAll('.saSideBarBody .saSideBarGroup')).map(group => ({
				heading: group.querySelector('h3, .saButtonFavorites span')?.textContent,
				items: Array.from(group.querySelectorAll('li[data-softadmin-shell-id]')).map(node => ({ id: node.dataset.softadminShellId, title: node.textContent.trim() }))
			}))
		}));
		const before = await shellState();
		assert.equal(before.actions.length, 2);
		const fieldCount = await page.locator('[data-softadmin-field-id]').count();
		await generate();
		assert.deepEqual(await shellState(), before);
		assert.equal(requestSpec.frame.title, 'My customer page');
		assert.equal(requestSpec.frame.actions.some(action => action.label === 'Remove'), false);
		assert.equal(requestSpec.sidebar.favorites.items.find(item => item._shellId === menuId).title, 'Resource bookings');
		assert.equal(await page.locator('[data-softadmin-field-id]').count(), fieldCount + 1);
		await page.locator('#SoftadminUndo').click();
		assert.deepEqual(await shellState(), before);
		assert.equal(await page.locator('[data-softadmin-field-id]').count(), fieldCount);
		await page.locator('#SoftadminRedo').click();
		assert.deepEqual(await shellState(), before);
		page.once('dialog', dialog => dialog.accept('Shell lifecycle test'));
		await page.locator('#SoftadminSavePage').click();
		await page.evaluate(() => {
			const key = 'softadmin.mockup.savedPages.v1';
			const saved = JSON.parse(localStorage.getItem(key));
			saved[0].state.headerHtml = saved[0].state.headerHtml.replaceAll('My customer page', 'Stale header');
			saved[0].state.sidebarHtml = saved[0].state.sidebarHtml.replaceAll('Resource bookings', 'Stale menu');
			localStorage.setItem(key, JSON.stringify(saved));
		});
		await page.reload();
		const savedOption = page.locator('#SoftadminSavedPages option').filter({ hasText: 'Shell lifecycle test' });
		await page.locator('#SoftadminSavedPages').selectOption(await savedOption.getAttribute('value'));
		await page.locator('#SoftadminOpenPage').click();
		assert.deepEqual(await shellState(), before);
		await generate();
		assert.deepEqual(await shellState(), before);
		assert.equal(await page.locator('#pageheader > .saSmallScreenHeader .saTopLink').count(), 2);
		await header.locator('.saCollectorWrapper').click();
		await page.locator('[data-softadmin-selection-action="delete"]').click();
		assert.equal(await page.locator('#pageheader .saCollectorWrapper').count(), 0);
		await generate();
		assert.equal(requestSpec.frame.moreActions, false);
		assert.equal(await page.locator('#pageheader .saCollectorWrapper').count(), 0);
		for (let index = 0; index < 2; index += 1) {
			await header.locator('.saTopLink .saButtonText').first().click();
			await page.locator('[data-softadmin-selection-action="delete"]').click();
		}
		assert.equal(await page.locator('#pageheader .saTopLink').count(), 0);
		assert.equal(await page.locator('body').evaluate(node => node.classList.contains('saLargeScreenHasTopButtons') || node.classList.contains('saSmallScreenHasTopButtons')), false);
		await generate();
		assert.deepEqual(requestSpec.frame.actions, []);
		assert.equal(await page.locator('#pageheader .saTopLink').count(), 0);
		await page.locator('#SoftadminUndo').click();
		await page.locator('#SoftadminUndo').click();
		assert.equal(await header.locator('.saTopLink').count(), 1);
		await page.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'softadmin-shell-lifecycle.png') });
		assert.deepEqual(errors, []);
		console.log('Passed shell lifecycle: pre-generation rename, move, duplicate/delete, title/action edits, AI form revision, undo/redo, save/reload/reopen, follow-up. No Azure calls.');
	} finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
