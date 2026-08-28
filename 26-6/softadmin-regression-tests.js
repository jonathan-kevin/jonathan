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
		name: 'accepts a BankID spec',
		spec: { components: [{ type: 'BankID', heading: 'Sign agreement', countdown: '4 minutes left' }] },
		valid: true
	},
	{
		name: 'accepts a Chat spec',
		spec: { components: [{ type: 'Chat', messages: [{ role: 'user', text: 'Hello', time: '09:42' }, { role: 'assistant', text: 'How can I help?' }] }] },
		valid: true
	},
	{
		name: 'rejects a Chat spec without messages',
		spec: { components: [{ type: 'Chat' }] },
		valid: false
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
		name: 'accepts a Link List with unread and dated rows',
		spec: { components: [{ type: 'LinkList', groups: [{ heading: 'Messages', items: [{ title: 'Booking changed', date: '2026-08-27', unread: true }] }] }] },
		valid: true
	},
	{
		name: 'rejects a Link List group without items',
		spec: { components: [{ type: 'LinkList', groups: [{ heading: 'Messages' }] }] },
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
	},
	{
		name: 'accepts a PDF Template Editor with values and placeholders',
		spec: {
			components: [{
				type: 'PdfTemplateEditor',
				groups: [{ heading: 'Invoice', values: [{ label: 'Invoice number', placed: true }] }],
				placeholders: [{ label: 'Invoice number', value: 'INV-1042', x: 96, y: 80, selected: true }]
			}]
		},
		valid: true
	},
	{
		name: 'rejects a PDF Template Editor without placeholders',
		spec: { components: [{ type: 'PdfTemplateEditor', groups: [] }] },
		valid: false
	},
	{
		name: 'accepts a Pivot Grid with columns and rows',
		spec: { components: [{ type: 'PivotGrid', columns: [{ key: 'jan', label: 'Jan' }], rows: [{ label: 'Consulting', values: { jan: 125000 } }] }] },
		valid: true
	},
	{
		name: 'rejects a Pivot Grid without rows',
		spec: { components: [{ type: 'PivotGrid', columns: [] }] },
		valid: false
	},
	{
		name: 'accepts an Inline Document with selectable documents',
		spec: { components: [{ type: 'InlineDocument', documents: [{ name: 'Agreement.pdf', src: 'agreement.pdf', previewable: false }] }] },
		valid: true
	},
	{
		name: 'rejects an Inline Document without documents',
		spec: { components: [{ type: 'InlineDocument' }] },
		valid: false
	},
	{
		name: 'accepts a wrapped Linear Process with steps',
		spec: { components: [{ type: 'LinearProcess', wrapped: true, wrapAfter: 1, steps: [{ heading: 'Review' }, { heading: 'Approved' }] }] },
		valid: true
	},
	{
		name: 'rejects a Linear Process without steps',
		spec: { components: [{ type: 'LinearProcess' }] },
		valid: false
	},
	{
		name: 'accepts a Planner with resources and days',
		spec: { components: [{ type: 'Planner', timescale: true, days: [{ key: 'mon', label: 'Monday', date: '24 Aug' }], resources: [{ label: 'Room 1', activities: [{ title: 'Workshop', day: 'mon', start: 9, end: 11 }] }] }] },
		valid: true
	},
	{
		name: 'rejects a Planner without resources',
		spec: { components: [{ type: 'Planner', days: [] }] },
		valid: false
	},
	{
		name: 'rejects a Planner resource without activities',
		spec: { components: [{ type: 'Planner', days: [], resources: [{ label: 'Room 1' }] }] },
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

const pdfEditorRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'PdfTemplateEditor',
		page: { current: 2, count: 4 },
		groups: [{ heading: 'Invoice', values: [{ label: 'Invoice number', placed: true, selected: true }] }],
		placeholders: [{ label: 'Invoice number', value: 'INV-1042', x: 96, y: 80, selected: true }]
	}]
}, pdfEditorRoot);
assert.match(pdfEditorRoot.innerHTML, /<softadmin-pdftemplateeditor/);
assert.match(pdfEditorRoot.innerHTML, /saAvailableValue saPlaced saMarked/);
assert.match(pdfEditorRoot.innerHTML, />2\/4</);
assert.match(pdfEditorRoot.innerHTML, /saPlaceholder saSelected/);

const bankIdRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{ type: 'BankID', heading: 'Sign agreement', progress: 75, countdown: '4 minutes left' }]
}, bankIdRoot);
assert.match(bankIdRoot.innerHTML, /<softadmin-bankid/);
assert.match(bankIdRoot.innerHTML, /Sign agreement/);
assert.match(bankIdRoot.innerHTML, /value="75"/);
assert.match(bankIdRoot.innerHTML, /Use BankID on this device/);

const chatRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'Chat',
		messages: [
			{ role: 'user', text: 'Can you summarize the booking?', time: '09:42', date: 'Today' },
			{ role: 'assistant', text: 'The booking is confirmed for Friday.' }
		]
	}]
}, chatRoot);
assert.match(chatRoot.innerHTML, /<softadmin-chat/);
assert.match(chatRoot.innerHTML, /saChatMessage saChatSender/);
assert.match(chatRoot.innerHTML, /saChatAiResponse/);
assert.match(chatRoot.innerHTML, /The booking is confirmed for Friday/);

const linkListRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'LinkList',
		groups: [{
			heading: 'Recent documents',
			items: [
				{ title: 'Meeting notes', date: '2026-08-27', unread: true },
				{ title: 'Project plan', date: '2026-08-25' }
			]
		}]
	}]
}, linkListRoot);
assert.match(linkListRoot.innerHTML, /<softadmin-linklist/);
assert.match(linkListRoot.innerHTML, /saMenuBox saHasUnread/);
assert.match(linkListRoot.innerHTML, /saMenuItemWrapper saUnread/);
assert.match(linkListRoot.innerHTML, /saLinkListRowLabel">2026-08-27/);

const pivotGridRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'PivotGrid',
		caption: 'Revenue by month',
		columns: [
			{ key: 'jan', label: 'Jan', sorted: true },
			{ key: 'feb', label: 'Feb' },
			{ key: 'owner', label: 'Owner', numeric: false }
		],
		rows: [{ label: 'Consulting', values: { jan: 125000, feb: 98000, owner: 'Anna' }, clickable: ['jan'] }]
	}]
}, pivotGridRoot);
assert.match(pivotGridRoot.innerHTML, /<softadmin-pivotgrid/);
assert.match(pivotGridRoot.innerHTML, /saPivotGridWrapper saMultipleColumnButtons stickyheader/);
assert.match(pivotGridRoot.innerHTML, /saPivotGridCellJs saClickable right/);
assert.match(pivotGridRoot.innerHTML, /fas fa-caret-up/);
assert.match(pivotGridRoot.innerHTML, /saPivotGridCellJs"><span>Anna/);
assert.doesNotMatch(pivotGridRoot.innerHTML, /style="(?:background|color)/);

const inlineDocumentRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'InlineDocument',
		selectedIndex: 0,
		documents: [
			{ name: 'Customer agreement.pdf', src: 'agreement.pdf', previewable: false },
			{ name: 'Terms.pdf', src: 'terms.pdf', previewable: true }
		]
	}]
}, inlineDocumentRoot);
assert.match(inlineDocumentRoot.innerHTML, /<softadmin-inlinedocument/);
assert.match(inlineDocumentRoot.innerHTML, /saInlineDownload/);
assert.match(inlineDocumentRoot.innerHTML, /fa-file-pdf/);
assert.match(inlineDocumentRoot.innerHTML, /Customer agreement\.pdf/);
assert.match(inlineDocumentRoot.innerHTML, /Previous document" disabled/);
assert.doesNotMatch(inlineDocumentRoot.innerHTML, /type="hidden"|aria-hidden|aria-label/);

global.SoftadminMockups.renderSpec({
	components: [{ type: 'InlineDocument', documents: [{ name: 'Terms.pdf', src: 'terms.pdf', previewable: true }] }]
}, inlineDocumentRoot);
assert.match(inlineDocumentRoot.innerHTML, /<iframe class="saInlineFrame" src="terms\.pdf" title="Terms\.pdf"><\/iframe>/);

const linearProcessRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'LinearProcess',
		wrapped: true,
		wrapAfter: 2,
		steps: [
			{ heading: 'Application received', body: 'Submitted today', caption: 'Complete', link: true, tone: 'success' },
			{ heading: 'Review', body: 'In progress', caption: 'Current step', tone: 'primary' },
			{ heading: 'Agreement', body: 'Waiting', tone: 'neutral' }
		]
	}]
}, linearProcessRoot);
assert.match(linearProcessRoot.innerHTML, /<softadmin-linearprocess/);
assert.match(linearProcessRoot.innerHTML, /saLinearProcess saHasWrapped/);
assert.match(linearProcessRoot.innerHTML, /saStep saHasLink/);
assert.match(linearProcessRoot.innerHTML, /saStepAfter" style="height: 4\.7rem;"/);
assert.match(linearProcessRoot.innerHTML, /saStepBefore" style="height: 4\.7rem;"/);
assert.match(linearProcessRoot.innerHTML, /saStepBetweenArrow" style="height: 4\.7rem; visibility: hidden/);
assert.equal((linearProcessRoot.innerHTML.match(/saStepCaption/g) || []).length, 2);

const plannerRoot = { innerHTML: '' };
const plannerBase = {
	type: 'Planner',
	heading: 'Booking schedule',
	period: 'Week',
	periodNumber: 35,
	columnWidth: 'narrow',
	monthLabel: 'August 2026',
	filters: [{ label: 'Facility', value: 'Bromma Strand', options: ['Bromma Strand', 'City'] }],
	days: [
		{ key: 'mon', label: 'Monday', date: '24 Aug', allDay: [{ title: 'Maintenance', tone: 'warning' }] },
		{ key: 'tue', label: 'Tuesday', date: '25', today: true }
	],
	unbookedGroups: [{ heading: 'To schedule', expanded: true, items: [{ title: 'New request', tone: 'neutral' }] }],
	resources: [{ key: 'room-1', label: 'Room 1', aggregate: 2, activities: [{ title: 'Workshop', day: 'mon', start: 9, end: 11, tone: 'primary', link: true }] }]
};
global.SoftadminMockups.renderSpec({ components: [{ ...plannerBase, timescale: true, startHour: 8, endHour: 18, hourStep: 2 }] }, plannerRoot);
assert.match(plannerRoot.innerHTML, /<softadmin-planner/);
assert.match(plannerRoot.innerHTML, /saPlanner saShowTime saNarrow saSkipHours/);
assert.match(plannerRoot.innerHTML, /saPlannerTimeHeading/);
assert.match(plannerRoot.innerHTML, /saUnbookedWrapper/);
assert.match(plannerRoot.innerHTML, /saResourceHeadingCell/);
assert.match(plannerRoot.innerHTML, /Workshop/);

global.SoftadminMockups.renderSpec({ components: [{ ...plannerBase, timescale: false, columnWidth: 'medium' }] }, plannerRoot);
assert.match(plannerRoot.innerHTML, /saResourceCalendar saPlanner"/);
assert.doesNotMatch(plannerRoot.innerHTML, /saShowTime|saPlannerTimeHeading/);
assert.match(plannerRoot.innerHTML, /width: 192px; min-width: 192px/);

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
