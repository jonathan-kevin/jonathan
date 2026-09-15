// Run with Playwright installed and the local site running; Azure is intercepted.
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
		let sentSpec;
		let calls = 0;
		let failNext = false;
		let waitForRelease = null;
		let notifyRequest;
		await context.route('**/.netlify/functions/softadmin-spec', async route => {
			if (route.request().method() === 'OPTIONS') {
				await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST', 'access-control-allow-headers': 'content-type' } });
				return;
			}
			calls += 1;
			sentSpec = route.request().postDataJSON().currentSpec;
			assert.ok(sentSpec, 'Follow-up request must include the edited spec.');
			if (failNext) {
				failNext = false;
				await route.fulfill({ status: 429, json: { error: 'Rate limit test' }, headers: { 'access-control-allow-origin': '*' } });
				return;
			}
			if (waitForRelease) {
				notifyRequest();
				await waitForRelease;
				waitForRelease = null;
			}
			const spec = structuredClone(sentSpec);
			spec.frame.title = 'Revised contact form';
			await route.fulfill({ json: { spec, usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 } }, headers: { 'access-control-allow-origin': '*' } });
		});
		await page.goto(process.env.SOFTADMIN_TEST_URL || 'http://localhost/jonathan-git/26-6/');
		await page.locator('label.saMockComponentCard').filter({ has: page.locator('input[value="NewEdit"]') }).click();
		const fields = page.locator('[data-softadmin-newedit-id] .saFieldAndLabelWrapper');
		await fields.first().waitFor();
		const initialCount = await fields.count();
		await page.locator('[data-softadmin-form-field="textbox"]').click();
		assert.equal(await fields.count(), initialCount + 1);
		const addedId = await fields.last().getAttribute('data-softadmin-field-id');
		const added = () => page.locator(`[data-softadmin-field-id="${addedId}"]`);
		await added().locator('input.saInputText').fill('Keep this value');
		await added().locator('.saLabel > span').fill('My custom field');
		await added().locator('.saLabel > span').press('Tab');
		await added().locator('.saLabel > span').click();
		await page.locator('[data-softadmin-selection-action="move-up"]').click();
		assert.equal(await fields.nth(initialCount - 1).getAttribute('data-softadmin-field-id'), addedId);
		await page.locator('[data-softadmin-selection-action="duplicate"]').click();
		assert.equal(await fields.count(), initialCount + 2);
		await page.locator('[data-softadmin-selection-action="delete"]').click();
		assert.equal(await fields.count(), initialCount + 1);
		const from = await added().locator('.saLabel > span').boundingBox();
		const to = await fields.first().locator('.saLabel > span').boundingBox();
		await page.mouse.move(from.x + 10, from.y + 5);
		await page.mouse.down();
		await page.mouse.move(to.x + 10, to.y + 2, { steps: 12 });
		await page.mouse.up();
		assert.equal(await fields.first().getAttribute('data-softadmin-field-id'), addedId, 'Dragging must reorder the spec-backed fields.');
		const fieldState = () => fields.evaluateAll(nodes => nodes.map(node => ({
			id: node.dataset.softadminFieldId,
			label: node.querySelector('.saLabel > span')?.textContent,
			value: node.querySelector('input.saInputText, textarea')?.value
		})));
		const before = await fieldState();
		await page.locator('#SoftadminPrompt').fill('Change only the page title.');
		await page.locator('#SoftadminGenerate').click();
		await page.waitForFunction(() => document.querySelector('#SoftadminPromptStatus').textContent.startsWith('AI spec:'));
		assert.equal(calls, 1);
		assert.equal(sentSpec.components[0].sections[0].fields.find(field => field._editorId === addedId).value, 'Keep this value');
		assert.deepEqual(await fieldState(), before);
		assert.match(await page.locator('#pageheader').innerText(), /Revised contact form/);
		await page.locator('#SoftadminUndo').click();
		assert.doesNotMatch(await page.locator('#pageheader').innerText(), /Revised contact form/);
		assert.deepEqual(await fieldState(), before);
		await page.locator('#SoftadminRedo').click();
		assert.match(await page.locator('#pageheader').innerText(), /Revised contact form/);
		assert.deepEqual(await fieldState(), before);
		page.once('dialog', dialog => dialog.accept('NewEdit lifecycle test'));
		await page.locator('#SoftadminSavePage').click();
		await page.evaluate(() => {
			const key = 'softadmin.mockup.savedPages.v1';
			const saved = JSON.parse(localStorage.getItem(key));
			// Reopening must use the spec, not this deliberately stale HTML snapshot.
			saved[0].state.rootHtml = saved[0].state.rootHtml.replaceAll('Keep this value', 'Stale HTML');
			localStorage.setItem(key, JSON.stringify(saved));
		});
		await page.reload();
		const savedOption = page.locator('#SoftadminSavedPages option').filter({ hasText: 'NewEdit lifecycle test' });
		await page.locator('#SoftadminSavedPages').selectOption(await savedOption.getAttribute('value'));
		await page.locator('#SoftadminOpenPage').click();
		assert.deepEqual(await fieldState(), before);
		assert.match(await page.locator('#pageheader').innerText(), /Revised contact form/);
		await added().locator('.saLabel > span').click();
		await page.locator('[data-softadmin-selection-action="add-sibling"]').click();
		assert.equal(await page.locator('[data-softadmin-newedit-id] .saSiblingRow').count(), 1);
		assert.equal(await page.locator('[data-softadmin-newedit-id] .saSiblingRow .saFieldCell').count(), 2);
		await page.locator('#SoftadminUndo').click();
		assert.deepEqual(await fieldState(), before);
		failNext = true;
		await page.locator('#SoftadminPrompt').fill('Change only the page title.');
		await page.locator('#SoftadminGenerate').click();
		await page.waitForFunction(() => document.querySelector('#SoftadminPromptStatus').textContent.includes('Rate limit test'));
		assert.deepEqual(await fieldState(), before, 'A failed request must keep the form.');
		let release;
		waitForRelease = new Promise(resolve => { release = resolve; });
		const requestArrived = new Promise(resolve => { notifyRequest = resolve; });
		await page.locator('#SoftadminGenerate').click();
		await requestArrived;
		await added().locator('input.saInputText').fill('Edited while waiting');
		release();
		await page.waitForFunction(() => document.querySelector('#SoftadminPromptStatus').textContent.includes('edited during generation'));
		assert.equal(await added().locator('input.saInputText').inputValue(), 'Edited while waiting');
		await page.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'softadmin-newedit-lifecycle.png') });
		assert.deepEqual(errors, []);
		console.log('Passed browser lifecycle: create, add, edit, drag, duplicate, delete, AI title revision, undo/redo, save/reload/reopen, siblings, rate-limit failure, edits during generation. No Azure calls.');
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });
