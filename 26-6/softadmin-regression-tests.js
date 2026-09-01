global.window = global;

require('./softadmin-reference-catalog.js');
require('./softadmin-spec-contract.js');
require('./softadmin-editor-patches.js');
require('./softadmin-component-registry.js');
const localization = require('./softadmin-localization.js');

const assert = require('node:assert/strict');
const catalog = global.SoftadminReferenceCatalog;
const contract = global.SoftadminSpecContract;
const editPatches = global.SoftadminEditorPatches;

assert.equal(localization.translateText('Favorites', 'sv'), 'Favoriter');
assert.equal(localization.translateText('Favoriter', 'en'), 'Favorites');
assert.equal(localization.translateText('  2 of 2 hits  ', 'sv'), '  2 av 2 träffar  ');
assert.equal(localization.translateText('Customers - Softadmin mockup', 'sv'), 'Customers - Softadmin-mockup');
assert.equal(localization.translateText('NewEdit ready.', 'sv'), 'NewEdit klar.');
assert.equal(localization.translateText('Calendar layout', 'sv'), 'Kalenderlayout');
assert.equal(localization.translateText('Weekdays with time scale', 'sv'), 'Veckodagar med tidsskala');
assert.equal(localization.translateText('Custom customer wording', 'sv'), 'Custom customer wording');

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
		name: 'accepts a structured NewEdit with rows and columns',
		spec: {
			components: [{
				type: 'NewEdit',
				labels: 'before',
				toc: true,
				rows: [{
					heading: 'Contact information',
					columns: [
						{ sections: [{ heading: 'Person', fields: [{ label: 'First name', control: 'textbox' }] }] },
						{ sections: [{ heading: 'Address', fields: [{ label: 'City', control: 'textbox' }] }] }
					]
				}]
			}]
		},
		valid: true
	},
	{
		name: 'rejects a structured NewEdit column without sections',
		spec: { components: [{ type: 'NewEdit', rows: [{ columns: [{}] }] }] },
		valid: false
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
		name: 'accepts a multi-week Calendar',
		spec: { components: [{ type: 'CalendarWeekdays', weeks: [{ number: 36, days: [{ day: '31 Aug', date: '2026-08-31', today: true, activities: [{ title: 'Morning meeting', description: '10:00-11:00' }] }] }, { number: 37, days: [{ day: '7', date: '2026-09-07', activities: [] }] }] }] },
		valid: true
	},
	{
		name: 'rejects a Calendar week without days',
		spec: { components: [{ type: 'CalendarWeekdays', weeks: [{ number: 36 }] }] },
		valid: false
	},
	{
		name: 'accepts Calendar weekdays with time scale',
		spec: { components: [{ type: 'CalendarWeekdays', mode: 'Weekdays with time scale', timeSlots: ['08:00', '08:30'], weeks: [{ number: 36, days: [{ date: '2026-09-04', weekday: 'Friday', activities: [{ title: 'Review', start: '08:30', end: '09:00' }] }] }] }] },
		valid: true
	},
	{
		name: 'accepts Calendar resources with time scale',
		spec: { components: [{ type: 'CalendarWeekdays', mode: 'Resources with time scale', timeSlots: ['08:00', '08:30'], resourceColumns: [{ label: 'Anna Andersson', activities: [{ title: 'Service', start: '08:00', end: '09:00' }] }] }] },
		valid: true
	},
	{
		name: 'rejects a Grid without rows',
		spec: { components: [{ type: 'ResultGrid', columns: [] }] },
		valid: false
	},
	{
		name: 'accepts shared Grid actions with row-level disabled state',
		spec: { components: [{ type: 'ResultGrid', columns: [{ key: 'name', label: 'Name' }], rowActions: [{ key: 'open', label: 'Open', icon: 'eye' }], rows: [{ name: 'Alpha' }, { name: 'Beta', disabledActions: ['open'] }] }] },
		valid: true
	},
	{
		name: 'rejects row-specific Grid actions',
		spec: { components: [{ type: 'ResultGrid', columns: [{ key: 'name', label: 'Name' }], rows: [{ name: 'Alpha', actions: [{ label: 'Special', icon: 'star' }] }] }] },
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
		name: 'accepts InfoBoxes with meters',
		spec: { components: [{ type: 'InfoBoxes', boxes: [{ meters: [{ heading: 'Utilization', value: 47, unit: '%', min: 35, max: 79, intervals: [{ from: 35, to: 51, tone: 'red' }, { from: 51, to: 53, tone: 'yellow' }, { from: 53, to: 79, tone: 'green' }] }] }] }] },
		valid: true
	},
	{
		name: 'rejects an InfoBox meter without a value',
		spec: { components: [{ type: 'InfoBoxes', boxes: [{ meters: [{ heading: 'Utilization' }] }] }] },
		valid: false
	},
	{
		name: 'accepts InfoBoxes with KPIs',
		spec: { components: [{ type: 'InfoBoxes', boxes: [{ kpis: [{ heading: 'Average time', value: 343, suffix: 'ms', trendValue: -18, trendSuffix: '%', trendTone: 'positive', trendDirection: 'down' }] }] }] },
		valid: true
	},
	{
		name: 'rejects an InfoBox KPI without a value',
		spec: { components: [{ type: 'InfoBoxes', boxes: [{ kpis: [{ heading: 'Average time' }] }] }] },
		valid: false
	},
	{
		name: 'accepts InfoBoxes with a line chart',
		spec: { components: [{ type: 'InfoBoxes', boxes: [{ charts: [{ heading: 'Revenue', labels: ['Jan', 'Feb'], series: [{ label: 'North', values: [12, 14] }] }] }] }] },
		valid: true
	},
	{
		name: 'rejects an InfoBox chart without series',
		spec: { components: [{ type: 'InfoBoxes', boxes: [{ charts: [{ heading: 'Revenue', labels: ['Jan'] }] }] }] },
		valid: false
	},
	{
		name: 'accepts InfoBoxes with a pie chart',
		spec: { components: [{ type: 'InfoBoxes', boxes: [{ charts: [{ type: 'pie', heading: 'Server time', series: [{ label: 'Tasks', value: 80 }, { label: 'Menu items', value: 20 }] }] }] }] },
		valid: true
	},
	{
		name: 'rejects a pie chart series without a value',
		spec: { components: [{ type: 'InfoBoxes', boxes: [{ charts: [{ type: 'pie', series: [{ label: 'Tasks' }] }] }] }] },
		valid: false
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
		name: 'rejects row-specific Pivot Grid actions',
		spec: { components: [{ type: 'PivotGrid', columns: [{ key: 'jan', label: 'Jan' }], rows: [{ label: 'Consulting', values: { jan: 1 }, actions: [{ label: 'Special', icon: 'star' }] }] }] },
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
	},
	{
		name: 'accepts a nested Treeview',
		spec: { components: [{ type: 'Treeview', nodes: [{ label: 'Knowledge base', children: [{ label: 'R & D', children: [{ label: 'AI' }] }] }] }] },
		valid: true
	},
	{
		name: 'rejects a Treeview without nodes',
		spec: { components: [{ type: 'Treeview' }] },
		valid: false
	},
	{
		name: 'rejects malformed nested Treeview children',
		spec: { components: [{ type: 'Treeview', nodes: [{ label: 'Knowledge base', children: {} }] }] },
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

const structuredNewEditRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'NewEdit',
		labels: 'before',
		toc: { heading: 'Contents', open: true },
		rows: [{
			heading: 'Customer information',
			columns: [
				{ sections: [{ heading: 'Person', fields: [{ label: 'First name', control: 'textbox', value: 'Anna' }] }] },
				{ sections: [{ heading: 'Address', fields: [{ label: 'City', control: 'textbox', value: 'Stockholm' }] }] }
			]
		}],
		buttons: [{ label: 'Save', variant: 'primary' }]
	}]
}, structuredNewEditRoot);
assert.match(structuredNewEditRoot.innerHTML, /class="saFormRoot saLabelsBefore"/);
assert.match(structuredNewEditRoot.innerHTML, /class="saToc saOpen"/);
assert.match(structuredNewEditRoot.innerHTML, /Contents<i class="far fa-angle-down saIcon"><\/i>/);
assert.equal((structuredNewEditRoot.innerHTML.match(/class="saFieldsColumn/g) || []).length, 2);
assert.match(structuredNewEditRoot.innerHTML, /href="#Header_Row_0">Customer information<\/a>/);
assert.match(structuredNewEditRoot.innerHTML, /href="#Header_0_0_0">Person<\/a>/);
assert.match(structuredNewEditRoot.innerHTML, /id="Header_0_1_0"/);

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

const meterRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'InfoBoxes',
		boxes: [{
			meters: [{
				heading: 'Utilization Aug',
				value: 47,
				unit: '%',
				min: 35,
				max: 79,
				intervals: [
					{ from: 35, to: 51, tone: 'red' },
					{ from: 51, to: 53, tone: 'yellow' },
					{ from: 53, to: 62, tone: 'green' },
					{ from: 62, to: 79, tone: 'yellow' }
				]
			}]
		}]
	}]
}, meterRoot);
assert.match(meterRoot.innerHTML, /saInfoSqlMeterWrapper/);
assert.match(meterRoot.innerHTML, /saMeterOuter/);
assert.match(meterRoot.innerHTML, /saMeterGreen saIntervalVisibleArc/);
assert.match(meterRoot.innerHTML, />47<\/tspan>/);

const lineChartRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'InfoBoxes',
		boxes: [{
			charts: [{
				heading: 'Rolling revenue',
				yAxisTitle: 'MSEK',
				unit: 'MSEK',
				labels: ['Jan', 'Feb', 'Mar'],
				series: [
					{ label: 'Enterprise', values: [12.8, 13.4, 15.2] },
					{ label: 'Public', values: [9.4, 10.1, 11.8] }
				]
			}]
		}]
	}]
}, lineChartRoot);
assert.match(lineChartRoot.innerHTML, /saInfoSqlChartWrapper/);
assert.match(lineChartRoot.innerHTML, /saChartLine/);
assert.match(lineChartRoot.innerHTML, /saLineArea/);
assert.match(lineChartRoot.innerHTML, /Enterprise/);

const kpiRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{ type: 'InfoBoxes', boxes: [{ kpis: [{ heading: 'Average time', value: '343', suffix: 'ms', trendValue: '-18', trendSuffix: '%', trendTone: 'positive', trendDirection: 'down', period: 'compared to previous 31 days' }] }] }]
}, kpiRoot);
assert.match(kpiRoot.innerHTML, /saInfoSqlKpiWrapper/);
assert.match(kpiRoot.innerHTML, /saTrend saPositive/);
assert.match(kpiRoot.innerHTML, /fa-arrow-trend-down/);

const pieChartRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{ type: 'InfoBoxes', boxes: [{ charts: [{ type: 'pie', heading: 'Server time', unit: 's', series: [{ label: 'Background tasks', value: 80 }, { label: 'Menu items', value: 20 }] }] }] }]
}, pieChartRoot);
assert.match(pieChartRoot.innerHTML, /saPieChart/);
assert.match(pieChartRoot.innerHTML, /saPieArc/);
assert.match(pieChartRoot.innerHTML, /Background tasks/);

const calendarRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'CalendarWeekdays',
		heading: 'Week 36 2026',
		month: 'September',
		year: '2026',
		week: 36,
		resources: ['Viktor Lindgren', 'Anna Andersson'],
		resource: 'Viktor Lindgren',
		filters: [{ label: 'Meetings', description: 'Show scheduled meetings', checked: true }],
		weeks: [
			{ number: 36, days: [{ day: '31 Aug', date: '2026-08-31', today: true, activities: [{ title: 'Morning meeting', description: '10:00-11:00' }] }, { day: '1 Sep', date: '2026-09-01', activities: [] }] },
			{ number: 37, days: [{ day: '7', date: '2026-09-07', activities: [] }, { day: '8', date: '2026-09-08', redDay: true, activities: [] }] }
		]
	}]
}, calendarRoot);
assert.match(calendarRoot.innerHTML, /<softadmin-calendar/);
assert.equal((calendarRoot.innerHTML.match(/class="saWeek" role="row"/g) || []).length, 2);
assert.match(calendarRoot.innerHTML, /saDateIsToday/);
assert.match(calendarRoot.innerHTML, /saRedDay/);
assert.match(calendarRoot.innerHTML, /Morning meeting/);
assert.match(calendarRoot.innerHTML, /Viktor Lindgren/);
assert.match(calendarRoot.innerHTML, /<option selected>September<\/option>/);
assert.equal((calendarRoot.innerHTML.match(/>September 2026<\/span>/g) || []).length, 1);
assert.match(calendarRoot.innerHTML, /class="saToggle"/);
assert.match(calendarRoot.innerHTML, /class="saToggleLabelWrapper"/);
assert.doesNotMatch(calendarRoot.innerHTML, /class="saToggleWrapper">\s*<input class="saCheckbox"/);
assert.match(calendarRoot.innerHTML, /datetime="2026-08-31">31<\/time>/);

const calendarTimeScaleRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'CalendarWeekdays',
		mode: 'Weekdays with time scale',
		timeSlots: ['08:00', '08:30', '09:00'],
		filters: [{ label: 'Deleted shifts', control: 'dropdown', options: ['Hide', 'Show'], value: 'Show' }],
		weeks: [
			{ number: 36, days: [{ weekday: 'Friday', day: 'Friday', date: '2026-09-04', dateLabel: '4 Sep', activities: [{ title: 'Review', start: '08:30', end: '09:00' }, { title: 'Release day', allDay: true }] }] },
			{ number: 37, days: [{ weekday: 'Monday', day: 'Monday', date: '2026-09-07', activities: [{ title: 'Planning', start: '08:00', end: '08:30' }] }] }
		]
	}]
}, calendarTimeScaleRoot);
assert.match(calendarTimeScaleRoot.innerHTML, /saTimeScheduleCalendar saWeekdaysCalendar/);
assert.match(calendarTimeScaleRoot.innerHTML, /datetime="2026-09-04">4 Sep<\/time>/);
assert.match(calendarTimeScaleRoot.innerHTML, /top: 30px; height: 28px/);
assert.equal((calendarTimeScaleRoot.innerHTML.match(/saWeek saWeekExtra saWeekDates/g) || []).length, 2);
assert.equal((calendarTimeScaleRoot.innerHTML.match(/class="saCalendarInnerWrapper"/g) || []).length, 2);
assert.match(calendarTimeScaleRoot.innerHTML, /saScheduleActivity saAllDay saClickable/);
assert.equal((calendarTimeScaleRoot.innerHTML.match(/Release day/g) || []).length, 1);
assert.match(calendarTimeScaleRoot.innerHTML, /<span class="saLabeledLabel">Deleted shifts<\/span>/);
assert.match(calendarTimeScaleRoot.innerHTML, /<option selected>Show<\/option>/);
assert.match(calendarTimeScaleRoot.innerHTML, /saCalendarItemListInner saHasLinks/);

const calendarResourceRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'CalendarWeekdays',
		mode: 'Resources with time scale',
		day: 4,
		timeSlots: ['08:00', '08:30', '09:00'],
		resourceColumns: [{ label: 'Anna Andersson', current: true, activities: [{ title: 'Service', start: '08:00', end: '09:00' }] }]
	}]
}, calendarResourceRoot);
assert.match(calendarResourceRoot.innerHTML, /saTimeScheduleCalendar saResourceCalendar/);
assert.match(calendarResourceRoot.innerHTML, /Anna Andersson/);
assert.match(calendarResourceRoot.innerHTML, />Day<\/span>/);

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
		rowActions: [
			{ key: 'open', label: 'Open details', icon: 'chart-line' },
			{ key: 'inspect', label: 'Inspect row', icon: 'binoculars' }
		],
		columns: [
			{ key: 'jan', label: 'Jan', sorted: true },
			{ key: 'feb', label: 'Feb' },
			{ key: 'owner', label: 'Owner', numeric: false }
		],
		rows: [
			{ label: 'Consulting', values: { jan: 125000, feb: 98000, owner: 'Anna' }, clickable: ['jan'] },
			{ label: 'Support', values: { jan: 67000, feb: 72000, owner: 'Erik' }, disabledActions: ['inspect'] }
		]
	}]
}, pivotGridRoot);
assert.match(pivotGridRoot.innerHTML, /<softadmin-pivotgrid/);
assert.match(pivotGridRoot.innerHTML, /saPivotGridWrapper saMultipleColumnButtons stickyheader/);
assert.match(pivotGridRoot.innerHTML, /saPivotGridCellJs saClickable right/);
assert.match(pivotGridRoot.innerHTML, /fas fa-caret-up/);
assert.match(pivotGridRoot.innerHTML, /saPivotGridCellJs"><span>Anna/);
assert.doesNotMatch(pivotGridRoot.innerHTML, /style="(?:background|color)/);
assert.equal((pivotGridRoot.innerHTML.match(/title="Open details"/g) || []).length, 2);
assert.equal((pivotGridRoot.innerHTML.match(/title="Inspect row"/g) || []).length, 2);
assert.match(pivotGridRoot.innerHTML, /saLinkButton saInactive" type="button" title="Inspect row" disabled/);

const sharedGridActionsRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'ResultGrid',
		pagination: false,
		columns: [{ key: 'case', label: 'Case' }, { key: 'subject', label: 'Subject' }],
		rowActions: [
			{ key: 'open', label: 'Open case', icon: 'eye' },
			{ key: 'edit', label: 'Edit case', icon: 'pen' }
		],
		rows: [
			{ case: 'C-10482', subject: 'Invoice question' },
			{ case: 'C-10391', subject: 'Closed case', disabledActions: ['edit'] }
		]
	}]
}, sharedGridActionsRoot);
assert.equal((sharedGridActionsRoot.innerHTML.match(/aria-label="Open case"/g) || []).length, 4);
assert.equal((sharedGridActionsRoot.innerHTML.match(/aria-label="Edit case"/g) || []).length, 4);
assert.equal((sharedGridActionsRoot.innerHTML.match(/aria-label="Edit case" disabled/g) || []).length, 1);
assert.equal((sharedGridActionsRoot.innerHTML.match(/aria-label="Edit case" class="saDisabled"/g) || []).length, 0);

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

const treeviewRoot = { innerHTML: '' };
global.SoftadminMockups.renderSpec({
	components: [{
		type: 'Treeview',
		nodes: [{
			label: 'Knowledge base', icon: 'book-open', expanded: true,
			children: [
				{ label: 'Operations' },
				{ label: 'R & D', expanded: true, tone: 'primary', children: [{ label: 'AI' }, { label: 'Hidden drafts', hidden: true }] },
				{ label: 'Labels', link: false, expanded: false, children: [{ label: 'HR' }] }
			]
		}]
	}]
}, treeviewRoot);
assert.match(treeviewRoot.innerHTML, /<softadmin-treeview/);
assert.match(treeviewRoot.innerHTML, /class="saTreeView saRoot"/);
assert.match(treeviewRoot.innerHTML, /saExpander saMinus/);
assert.match(treeviewRoot.innerHTML, /saExpander" type="checkbox" disabled/);
assert.match(treeviewRoot.innerHTML, /saCustomColor/);
assert.match(treeviewRoot.innerHTML, /<i>Hidden drafts<\/i>/);
assert.match(treeviewRoot.innerHTML, /<span>Labels<\/span>/);

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
