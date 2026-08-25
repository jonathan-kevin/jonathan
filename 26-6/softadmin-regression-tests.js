global.window = global;

require('./softadmin-reference-catalog.js');
require('./softadmin-spec-contract.js');
require('./softadmin-editor-patches.js');
require('./softadmin-component-registry.js');

const assert = require('node:assert/strict');
const catalog = global.SoftadminReferenceCatalog;
const contract = global.SoftadminSpecContract;
const editPatches = global.SoftadminEditorPatches;

function validNewEdit() {
	return {
		frame: { title: 'Create person', breadcrumbs: ['Home', 'Create person'], actions: [] },
		components: [{
			type: 'NewEdit',
			sections: [{
				heading: 'Person',
				fields: [
					{ label: 'First name', control: 'textbox', value: '' },
					{ label: 'Last name', control: 'textbox', value: '' }
				]
			}],
			buttons: [{ label: 'Save', variant: 'primary' }]
		}]
	};
}

const cases = [
	{
		name: 'accepts a supported NewEdit spec',
		spec: validNewEdit(),
		valid: true
	},
	{
		name: 'rejects a Grid without rows',
		spec: { components: [{ type: 'ResultGrid', columns: [] }] },
		valid: false
	},
	{
		name: 'rejects incomplete menu groups',
		spec: { components: [{ type: 'MenuGroups' }] },
		valid: false
	},
	{
		name: 'rejects unsupported controls',
		spec: { components: [{ type: 'NewEdit', sections: [{ fields: [{ label: 'Mystery', control: 'notReal' }] }] }] },
		valid: false
	},
	{
		name: 'accepts nested Multipart components',
		spec: { components: [{ type: 'Multipart', parts: [{ component: validNewEdit().components[0] }] }] },
		valid: true
	},
	{
		name: 'accepts an Image Gallery with grouped items',
		spec: { components: [{ type: 'ImageGallery', groups: [{ heading: 'Team', items: [{ caption: 'Anna' }] }] }] },
		valid: true
	},
	{
		name: 'rejects an Image Gallery without group items',
		spec: { components: [{ type: 'ImageGallery', groups: [{ heading: 'Team' }] }] },
		valid: false
	}
];

cases.forEach(testCase => {
	const result = contract.validateSpec(testCase.spec);
	assert.equal(result.valid, testCase.valid, `${testCase.name}: ${result.errors.join(' ')}`);
});

const advertisedComponents = Object.values(catalog.components).filter(entry => entry.renderable);
const advertisedControls = Object.values(catalog.controls).filter(entry => entry.renderable);
assert.ok(advertisedComponents.length > 0, 'Catalog must advertise components.');
assert.ok(advertisedControls.length > 0, 'Catalog must advertise controls.');
assert.ok(advertisedControls.every(entry => entry.specType), 'Every renderable control needs a canonical specType.');
assert.equal(editPatches.segment(' First name '), 'first-name');

const patchStore = editPatches.createStore();
patchStore.set('main/newedit/field/first-name/value/text', { op: 'replaceValue', value: 'Anna' });
patchStore.set('sidebar/group/economy/item/invoices/text', { op: 'replaceText', value: 'Invoices' });
assert.deepEqual(patchStore.setResolvedPaths(new Set(['main/newedit/field/first-name/value/text'])), [
	'sidebar/group/economy/item/invoices/text'
]);
assert.equal(patchStore.snapshot()[0][1].path, 'main/newedit/field/first-name/value/text');

const galleryRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'ImageGallery',
		size: 'large',
		groups: [{ heading: 'Team', items: [{ caption: 'Anna', description: 'Project manager' }] }]
	}]
}, galleryRoot);
assert.match(galleryRoot.innerHTML, /<softadmin-imagegallery/);
assert.match(galleryRoot.innerHTML, /saGalleryWrapper saColumnsLarge/);
assert.match(galleryRoot.innerHTML, /saGalleryItemCaption">Anna/);

async function testEndpointContract() {
	process.env.AZURE_OPENAI_ENDPOINT = 'https://example.openai.azure.com';
	process.env.AZURE_OPENAI_API_KEY = 'test-key';
	process.env.AZURE_OPENAI_DEPLOYMENT = 'test-deployment';

	const originalFetch = global.fetch;
	let providerOutput = validNewEdit();
	global.fetch = async () => new Response(JSON.stringify({
		output_text: JSON.stringify(providerOutput),
		usage: { input_tokens: 100, output_tokens: 50, total_tokens: 150 }
	}), { status: 200, headers: { 'content-type': 'application/json' } });

	try {
		const { default: handler } = await import('../netlify/functions/softadmin-spec.mjs');
		const response = await handler(new Request('https://example.test', {
			method: 'POST',
			headers: { 'content-type': 'application/json', origin: 'http://localhost' },
			body: JSON.stringify({ prompt: 'Create a person form.' })
		}));
		const body = await response.json();

		assert.equal(response.status, 200, body.error || 'Endpoint should accept a valid generated spec.');
		assert.equal(body.spec.components[0].type, 'NewEdit');
		assert.equal(body.usage.total_tokens, 150);

		providerOutput = {
			operations: [{ op: 'replace', path: '/frame/title', value: 'Edit person' }]
		};
		const revisionResponse = await handler(new Request('https://example.test', {
			method: 'POST',
			headers: { 'content-type': 'application/json', origin: 'http://localhost' },
			body: JSON.stringify({
				prompt: 'Change the title to Edit person.',
				currentSpec: validNewEdit()
			})
		}));
		const revisionBody = await revisionResponse.json();

		assert.equal(revisionResponse.status, 200, revisionBody.error || 'Endpoint should apply a valid revision patch.');
		assert.equal(revisionBody.spec.frame.title, 'Edit person');
		assert.deepEqual(revisionBody.spec.components, validNewEdit().components);
		assert.equal(revisionBody.operations.length, 1);
	} finally {
		global.fetch = originalFetch;
		delete process.env.AZURE_OPENAI_ENDPOINT;
		delete process.env.AZURE_OPENAI_API_KEY;
		delete process.env.AZURE_OPENAI_DEPLOYMENT;
	}
}

testEndpointContract()
	.then(() => console.log(`Passed ${cases.length + 10} Softadmin contract, edit patch, and endpoint checks.`))
	.catch(error => {
		console.error(error);
		process.exitCode = 1;
	});
