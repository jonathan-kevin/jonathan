global.window = global;

require('./softadmin-reference-catalog.js');
require('./softadmin-spec-contract.js');

const assert = require('node:assert/strict');
const catalog = global.SoftadminReferenceCatalog;
const contract = global.SoftadminSpecContract;

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

async function testEndpointContract() {
	process.env.AZURE_OPENAI_ENDPOINT = 'https://example.openai.azure.com';
	process.env.AZURE_OPENAI_API_KEY = 'test-key';
	process.env.AZURE_OPENAI_DEPLOYMENT = 'test-deployment';

	const originalFetch = global.fetch;
	global.fetch = async () => new Response(JSON.stringify({
		output_text: JSON.stringify(validNewEdit()),
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
	} finally {
		global.fetch = originalFetch;
		delete process.env.AZURE_OPENAI_ENDPOINT;
		delete process.env.AZURE_OPENAI_API_KEY;
		delete process.env.AZURE_OPENAI_DEPLOYMENT;
	}
}

testEndpointContract()
	.then(() => console.log(`Passed ${cases.length + 6} Softadmin contract and endpoint checks.`))
	.catch(error => {
		console.error(error);
		process.exitCode = 1;
	});
