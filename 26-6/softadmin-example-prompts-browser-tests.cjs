const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { translateExamplePrompt } = require('./softadmin-localization.js');

(async () => {
	const browser = await chromium.launch({ channel: 'msedge', headless: true });
	try {
		const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
		let requests = 0;
		await context.route('**/.netlify/functions/softadmin-spec', route => { requests += 1; return route.abort(); });
		const page = await context.newPage();
		page.setDefaultTimeout(10000);
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		await page.goto(process.env.SOFTADMIN_TEST_URL || 'http://localhost/jonathan-git/26-6/');
		const examples = page.locator('[data-softadmin-example-prompt]');
		const prompt = page.locator('#SoftadminPrompt');
		const language = value => page.locator('#SoftadminLanguagePicker label').filter({ has: page.locator(`input[value="${value}"]`) });
		const sources = await examples.evaluateAll(buttons => buttons.map(button => button.dataset.softadminExamplePrompt));
		const labels = await examples.allTextContents();
		assert.equal(sources.length, 17);
		for (const source of sources) {
			const translated = translateExamplePrompt(source, 'sv');
			assert.notEqual(translated, source, `Missing Swedish example: ${source}`);
			assert.equal(translateExamplePrompt(translated, 'en'), source);
		}
		for (let index = 0; index < sources.length; index += 1) {
			await examples.nth(index).click();
			assert.equal(await prompt.inputValue(), sources[index]);
		}
		await language('sv').click();
		assert.equal(await prompt.inputValue(), translateExamplePrompt(sources.at(-1), 'sv'));
		const swedishLabels = await examples.allTextContents();
		for (let index = 0; index < sources.length; index += 1) {
			assert.notEqual(swedishLabels[index], labels[index]);
			await examples.nth(index).click();
			assert.equal(await prompt.inputValue(), translateExamplePrompt(sources[index], 'sv'));
		}
		await language('en').click();
		assert.equal(await prompt.inputValue(), sources.at(-1));
		assert.deepEqual(await examples.allTextContents(), labels);
		const edited = sources[0] + ' Keep my custom field.';
		await prompt.fill(edited);
		await language('sv').click();
		assert.equal(await prompt.inputValue(), edited, 'Custom edits must not be translated or replaced.');
		await examples.first().click();
		await page.reload();
		await page.locator('#SoftadminAutosaveStatus[data-state="saved"]').waitFor();
		assert.equal(await prompt.inputValue(), 'Skapa ett NewEdit-formulär för att ange en persons kontaktuppgifter.');
		await examples.nth(1).click();
		assert.equal(await prompt.inputValue(), translateExamplePrompt(sources[1], 'sv'));
		await page.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'softadmin-swedish-examples.png') });
		assert.equal(requests, 0);
		assert.deepEqual(errors, []);
		console.log('Passed all 17 example prompts: Swedish/English labels and inserted text, language round-trip, custom-draft preservation and autosave/reload. No Azure calls.');
	} finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
