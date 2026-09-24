const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
	const browser = await chromium.launch({ channel: 'msedge', headless: true });
	try {
		const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
		const page = await context.newPage();
		page.setDefaultTimeout(10000);
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		await context.route('**/.netlify/functions/softadmin-spec', async route => {
			const spec = route.request().postDataJSON().currentSpec;
			spec.frame.title = 'AI revised title';
			await route.fulfill({ json: { spec }, headers: { 'access-control-allow-origin': '*' } });
		});
		await page.goto(process.env.SOFTADMIN_TEST_URL || 'http://localhost/jonathan-git/26-6/');
		const saved = () => page.locator('#SoftadminAutosaveStatus[data-state="saved"]').waitFor();
		const read = () => page.evaluate(() => {
			const data = JSON.parse(localStorage.getItem('softadmin.mockup.projects.v1'));
			return data.projects.find(project => project.id === data.activeId);
		});
		const rename = page.locator('#SoftadminRenameProject');
		const dialog = page.locator('#SoftadminProjectRenameDialog');
		const input = dialog.locator('input');
		assert.equal(await rename.isDisabled(), true);
		await page.locator('#SoftadminComponentSelectionMode label').filter({ hasText: 'Manual selection' }).click();
		await page.locator('#SoftadminComponentPicker label').filter({ has: page.locator('input[value="NewEdit"]') }).click();
		await saved();
		const initial = await read();
		await rename.click();
		assert.equal(await input.inputValue(), initial.name);
		assert.deepEqual(await input.evaluate(node => [node.selectionStart, node.selectionEnd]), [0, initial.name.length]);
		await input.fill('Discard this');
		await input.press('Escape');
		assert.equal(await dialog.isVisible(), false);
		assert.equal((await read()).name, initial.name);
		await rename.click();
		await input.fill('Also discard this');
		await dialog.locator('button[type="button"]').click();
		assert.equal((await read()).name, initial.name);
		await rename.click();
		await input.fill('   ');
		await input.press('Enter');
		assert.equal(await dialog.isVisible(), true);
		assert.equal(await input.evaluate(node => node.validity.valid), false);
		await input.fill('  Workshop <September>  ');
		await input.press('Enter');
		assert.equal(await dialog.isVisible(), false);
		assert.equal((await read()).customName, 'Workshop <September>');
		assert.equal((await read()).id, initial.id);
		assert.match(await page.locator('#SoftadminProjectHistory option:checked').textContent(), /Workshop <September>/);
		await page.locator('#SoftadminPrompt').fill('Revise the page title');
		await page.locator('#SoftadminGenerate').click();
		await page.waitForFunction(() => !document.getElementById('SoftadminGenerate').disabled);
		await saved();
		assert.equal((await read()).state.debugResult.spec.frame.title, 'AI revised title');
		assert.equal((await read()).name, 'Workshop <September>');
		await page.locator('#SoftadminUndo').click();
		await saved();
		assert.equal((await read()).name, 'Workshop <September>');
		await page.locator('#SoftadminRedo').click();
		await saved();
		await page.reload();
		await saved();
		assert.equal((await read()).name, 'Workshop <September>');
		await page.locator('#SoftadminNewProject').click();
		assert.equal((await read()).customName, null);
		await page.locator('#SoftadminProjectHistory').selectOption(initial.id);
		assert.equal((await read()).name, 'Workshop <September>');

		// Failed renames must not mutate memory or persisted metadata.
		await rename.click();
		await page.evaluate(() => {
			const original = Storage.prototype.setItem;
			window.testStorageFull = true;
			Storage.prototype.setItem = function (key, value) {
				if (key === 'softadmin.mockup.projects.v1' && window.testStorageFull) throw new DOMException('Full', 'QuotaExceededError');
				return original.call(this, key, value);
			};
		});
		await input.fill('Cannot save this name');
		await input.press('Enter');
		assert.equal(await dialog.isVisible(), true);
		assert.equal(await dialog.locator('[role="alert"]').isVisible(), true);
		assert.equal((await read()).name, 'Workshop <September>');
		await input.press('Escape');
		await page.evaluate(() => { window.testStorageFull = false; });
		await page.locator('#SoftadminPrompt').fill('Still the same project');
		await saved();
		assert.equal((await read()).name, 'Workshop <September>');
		await page.locator('#SoftadminLanguagePicker label').filter({ hasText: 'Swedish' }).click();
		await saved();
		await rename.click();
		assert.equal(await dialog.locator('h2').textContent(), 'Byt namn på projekt');
		await page.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'softadmin-project-rename-desktop.png') });
		await page.setViewportSize({ width: 390, height: 844 });
		const box = await dialog.boundingBox();
		assert.ok(box && box.x >= 0 && box.x + box.width <= 390);
		for (const button of await dialog.locator('button').all()) {
			const buttonBox = await button.boundingBox();
			assert.ok(buttonBox.height >= 40 && buttonBox.y + buttonBox.height <= box.y + box.height);
		}
		await page.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'softadmin-project-rename-mobile.png') });
		assert.deepEqual(errors, []);
		console.log('Passed project rename: selection, Enter/Escape/Cancel, validation, title-only AI revision, undo/redo, reload, switching, quota failure, localization and mobile. No Azure calls.');
	} finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
