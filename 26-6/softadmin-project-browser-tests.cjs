// Isolated local browser checks. No AI requests or real project storage.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const key = 'softadmin.mockup.projects.v1';
const url = process.env.SOFTADMIN_TEST_URL || 'http://localhost/jonathan-git/26-6/';

(async () => {
	const browser = await chromium.launch({ channel: 'msedge', headless: true });
	try {
		const context = await browser.newContext({ viewport: { width: 1800, height: 1300 } });
		let aiRequests = 0;
		await context.route('**/.netlify/functions/softadmin-spec', route => { aiRequests += 1; return route.abort(); });
		const page = await context.newPage();
		page.setDefaultTimeout(10000);
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		const saved = () => page.locator('#SoftadminAutosaveStatus[data-state="saved"]').waitFor();
		const read = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
		await page.goto(url);
		assert.equal(await read(), null, 'Opening an untouched page must not create a project.');
		assert.equal(await page.locator('#SoftadminSavePage, #SoftadminOpenPage').count(), 0);
		await page.locator('#SoftadminComponentSelectionMode label').filter({ hasText: 'Manual selection' }).click();
		await page.locator('label.saMockComponentCard').filter({ has: page.locator('input[value="NewEdit"]') }).click();
		const fields = page.locator('[data-softadmin-field-id]');
		await fields.first().waitFor();
		const field = fields.first().locator('input.saInputText').first();
		await field.fill('Keep this project value');
		await page.locator('#SoftadminPrompt').fill('Continue here next week');
		// No debounce wait: beforeunload must flush the current draft and form.
		await page.reload();
		await saved();
		assert.equal(await field.inputValue(), 'Keep this project value');
		assert.equal(await page.locator('#SoftadminPrompt').inputValue(), 'Continue here next week');
		const first = await read();
		const firstId = first.activeId;
		const fixture = first.projects[0];
		assert.equal(first.projects.length, 1);
		await page.locator('#SoftadminPrompt').fill('Edited draft');
		await saved();
		assert.equal((await read()).projects.length, 1, 'Edits update the same project.');
		await page.locator('#SoftadminNewProject').click();
		await saved();
		assert.equal(await fields.count(), 0);
		assert.equal(await page.locator('#SoftadminPrompt').inputValue(), '');
		assert.equal(await page.locator('#SoftadminUndo').isDisabled(), true);
		const secondId = (await read()).activeId;
		await page.locator('#SoftadminPrompt').fill('Second project draft');
		// Selecting another project flushes pending changes and opens immediately.
		await page.locator('#SoftadminProjectHistory').selectOption(firstId);
		assert.equal(await field.inputValue(), 'Keep this project value');
		assert.equal(await page.locator('#SoftadminPrompt').inputValue(), 'Edited draft');
		assert.equal(await page.locator('#SoftadminUndo').isDisabled(), true);
		await page.locator('#SoftadminProjectHistory').selectOption(secondId);
		assert.equal(await page.locator('#SoftadminPrompt').inputValue(), 'Second project draft');
		await page.reload();
		await saved();
		assert.equal((await read()).activeId, secondId);
		assert.equal(await fields.count(), 0);

		// A quota failure must leave saved data intact and block a destructive switch.
		await page.evaluate(key => {
			const original = Storage.prototype.setItem;
			window.testStorageFull = true;
			Storage.prototype.setItem = function (name, value) {
				if (name === key && window.testStorageFull) throw new DOMException('Full', 'QuotaExceededError');
				return original.call(this, name, value);
			};
		}, key);
		await page.locator('#SoftadminPrompt').fill('Unsaved but still here');
		await page.locator('#SoftadminAutosaveStatus[data-state="error"]').waitFor();
		await page.locator('#SoftadminProjectHistory').selectOption(firstId);
		assert.equal(await page.locator('#SoftadminProjectHistory').inputValue(), secondId);
		assert.equal(await page.locator('#SoftadminPrompt').inputValue(), 'Unsaved but still here');
		assert.equal((await read()).projects.find(project => project.id === secondId).prompt, 'Second project draft');
		await page.evaluate(() => { window.testStorageFull = false; window.dispatchEvent(new Event('pagehide')); });
		await saved();
		assert.equal((await read()).projects[0].prompt, 'Unsaved but still here');

		for (let index = 0; index < 8; index += 1) await page.locator('#SoftadminNewProject').click();
		assert.equal((await read()).projects.length, 10);
		await page.locator('#SoftadminProjectHistory').selectOption(firstId);
		await page.locator('#SoftadminPrompt').fill('Recently edited first project');
		await saved();
		await page.locator('#SoftadminNewProject').click();
		const capped = await read();
		assert.equal(capped.projects.length, 10);
		assert.ok(capped.projects.some(project => project.id === firstId), 'Recently edited project is retained.');
		assert.ok(!capped.projects.some(project => project.id === secondId), 'Oldest edited project is removed.');
		const otherTab = await context.newPage();
		await otherTab.goto(url);
		await otherTab.locator('#SoftadminAutosaveStatus[data-state="saved"]').waitFor();
		await page.locator('#SoftadminPrompt').fill('Newer version in first tab');
		await saved();
		await otherTab.locator('#SoftadminPrompt').fill('Stale version in second tab');
		await otherTab.locator('#SoftadminAutosaveStatus[data-state="error"]').waitFor();
		assert.match(await otherTab.locator('#SoftadminAutosaveStatus').innerText(), /another tab/);
		assert.equal((await read()).projects[0].prompt, 'Newer version in first tab');
		await otherTab.close();
		await page.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'softadmin-project-history-desktop.png') });
		await page.setViewportSize({ width: 390, height: 844 });
		await page.locator('#SoftadminAutosaveStatus').scrollIntoViewIfNeeded();
		const bounds = await page.locator('#SoftadminProjectHistory').boundingBox();
		assert.ok(bounds && bounds.width > 100 && bounds.x >= 0 && bounds.x + bounds.width <= 390);
		await page.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'softadmin-project-history-mobile.png') });
		assert.deepEqual(errors, []);
		assert.equal(aiRequests, 0);

		const legacyContext = await browser.newContext();
		await legacyContext.addInitScript(({ fixture }) => {
			const legacy = Array.from({ length: 12 }, (_, index) => ({ ...fixture, id: `legacy-${index}`, name: `Legacy ${index}`, savedAt: new Date(2026, 0, index + 1).toISOString() }));
			localStorage.setItem('softadmin.mockup.savedPages.v1', JSON.stringify(legacy));
		}, { fixture });
		const legacyPage = await legacyContext.newPage();
		await legacyPage.goto(url);
		await legacyPage.locator('#SoftadminAutosaveStatus[data-state="saved"]').waitFor();
		const migrated = await legacyPage.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
		assert.equal(migrated.projects.length, 10);
		assert.equal(migrated.activeId, 'legacy-11');
		assert.equal(await legacyPage.locator('#SoftadminPrompt').inputValue(), fixture.prompt);
		assert.equal(await legacyPage.evaluate(() => JSON.parse(localStorage.getItem('softadmin.mockup.savedPages.v1')).length), 12);
		console.log('Passed project browser lifecycle: autosave, immediate reload, switching, new project, drafts, isolated undo, quota protection, 10-project retention, mobile width, legacy migration. No Azure calls.');
	} finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
