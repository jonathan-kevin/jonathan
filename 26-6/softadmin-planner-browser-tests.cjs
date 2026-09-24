const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fixture = {
	type: 'Planner', heading: 'Meeting room schedule', period: 'Work week', periodNumber: 39, year: 2026,
	timescale: true, startHour: 8, endHour: 18, hourStep: 1, columnWidth: 'medium', monthLabel: 'September 2026',
	days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((label, i) => ({ key: `d${i}`, label: `${label} ${21 + i} Sep`, date: `2026-09-${21 + i}`, allDay: i === 2 ? [{ title: 'Projector maintenance', description: 'All rooms checked before 08:00', tone: 'warning' }, { title: 'Fire inspection', tone: 'neutral' }] : [] })),
	unbookedGroups: [{ heading: 'Unbooked requests', items: [{ title: 'Partner workshop', description: '12 participants, video conference setup' }, { title: 'Leadership review', tone: 'neutral' }] }],
	resources: [
		{ label: 'Room A - Birch', description: '8 seats, screen', activities: [
			{ title: 'Sales planning', description: 'Quarterly targets and follow-up', day: 'd0', start: 9, end: 11 },
			{ title: 'Client onboarding', day: 'd0', start: '09:30', end: '10:30', tone: 'success' },
			{ title: 'Overlapping review', day: 'd0', start: 9.75, end: 10.25, tone: 'warning' },
			{ title: 'Lunch briefing', day: 'd0', start: 11, end: 12 },
			{ title: 'Budget follow-up', day: 'd3', start: 14, end: 16 },
			{ title: 'Clipped opening', day: 'd1', start: 7, end: 9 },
			{ title: 'Clipped closing', day: 'd1', start: 17, end: 20 },
			{ title: 'Outside view', day: 'd0', start: 20, end: 21 }
		] },
		{ label: 'Room B - Oak', description: '14 seats, whiteboard', activities: [{ title: 'Product planning', day: 'd0', start: 9, end: 12 }, { title: 'Sprint planning', day: 'd4', start: 10, end: 11, tone: 'success' }] },
		{ label: 'Room C - Pine', description: '6 seats, phone booth setup', activities: [{ title: 'Recruitment interview', day: 'd2', start: 13, end: 16, tone: 'neutral' }] }
	]
};

(async () => {
	const browser = await chromium.launch({ channel: 'msedge', headless: true });
	try {
		const page = await browser.newPage({ viewport: { width: 1800, height: 1100 } });
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		await page.goto(process.env.SOFTADMIN_TEST_URL || 'http://localhost/jonathan-git/26-6/');
		await page.addStyleTag({ content: '#SoftadminAiTools { display:none !important; }' });
		const render = spec => page.evaluate(spec => window.SoftadminMockups.renderSpec({ components: [spec] }, document.querySelector('[data-softadmin-component-root]')), spec);
		await render(fixture);
		const planner = page.locator('softadmin-planner');
		assert.equal(await planner.locator('[data-planner-date="2026-09-21"].saMarked').textContent(), '21');
		assert.equal(await planner.locator('.saSidebarCalendar .saDateRow').first().locator('.saWeekNr').textContent(), '36');
		assert.equal(await planner.locator('.saMockPlannerResource .saActivity').count(), 10);
		const box = title => planner.locator('.saActivity').filter({ has: page.locator('.saActivityHeading', { hasText: title }) }).boundingBox();
		const sales = await box('Sales planning');
		const client = await box('Client onboarding');
		const overlap = await box('Overlapping review');
		assert.ok(sales.width >= 120, 'Two-hour booking should have readable width.');
		assert.ok(client.y >= sales.y + sales.height && overlap.y >= client.y + client.height);
		assert.ok(Math.abs(client.x - sales.x - 32) < 2, 'Half-hour start must not snap to the hour.');
		assert.equal((await box('Lunch briefing')).y, sales.y, 'Non-overlapping bookings reuse a lane.');
		assert.equal(await planner.locator('.saActivityHeading').filter({ hasText: 'Outside view' }).count(), 0);
		const measurements = await planner.evaluate(node => {
			const rows = [...node.querySelectorAll('.saMockPlannerResource')];
			return rows.map(row => {
				const rect = row.getBoundingClientRect();
				return [...row.querySelectorAll('.saActivity')].map(activity => {
					const a = activity.getBoundingClientRect(), day = activity.parentElement.getBoundingClientRect();
					return a.y >= rect.y && a.bottom <= rect.bottom && a.x >= day.x && a.right <= day.right ? null : { title: activity.title, activity: a.toJSON(), row: rect.toJSON(), day: day.toJSON() };
				}).filter(Boolean);
			});
		});
		assert.deepEqual(measurements.flat(), [], 'Bookings must stay in their resource row and date.');
		const heading = await planner.locator('.saWeekDay').first().boundingBox();
		const day = await planner.locator('.saMockPlannerDay').first().boundingBox();
		const hour = await planner.locator('.saPlannerTimeHeading .saTimeCell').first().boundingBox();
		assert.ok(Math.abs(heading.x - day.x) < 2 && Math.abs(day.x - hour.x) < 2);
		assert.ok(Math.abs(heading.width - day.width) < 2);
		const allDay = await planner.locator('.saWeekExtra').boundingBox();
		for (const activity of await planner.locator('.saWeekExtra .saActivity').all()) {
			const rect = await activity.boundingBox();
			assert.ok(rect.y >= allDay.y && rect.y + rect.height <= allDay.y + allDay.height);
		}
		await planner.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'softadmin-planner-fixed-desktop.png') });
		await planner.locator('.saCalendar').evaluate(node => { node.scrollLeft = 1280; });
		const scrolledHeading = await planner.locator('.saWeekDay').nth(2).boundingBox();
		const scrolledDay = await planner.locator('.saMockPlannerDay').nth(2).boundingBox();
		assert.ok(Math.abs(scrolledHeading.x - scrolledDay.x) < 2, 'Dates and bookings stay aligned after horizontal scrolling.');
		await planner.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'softadmin-planner-fixed-scrolled.png') });
		await planner.locator('.saCalendar').evaluate(node => { node.scrollLeft = 0; });
		await page.setViewportSize({ width: 390, height: 844 });
		assert.ok((await box('Sales planning')).width >= 120);
		assert.ok(await planner.locator('.saCalendar').evaluate(node => node.scrollWidth > node.clientWidth));
		await planner.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'softadmin-planner-fixed-mobile.png') });
		await page.setViewportSize({ width: 1800, height: 1100 });
		await render({ ...fixture, timescale: false });
		assert.equal(await planner.locator('.saMockPlannerResource .saActivity').count(), 11);
		assert.ok((await box('Client onboarding')).y >= (await box('Sales planning')).y + 56);
		await render({ ...fixture, endHour: 17.5, hourStep: 3 });
		const slots = await planner.locator('.saPlannerTimeHeading .saTimeCell').evaluateAll(nodes => nodes.slice(0, 4).map(node => node.getBoundingClientRect().width));
		const date = await planner.locator('.saWeekDay').first().boundingBox();
		assert.ok(Math.abs(slots.reduce((a, b) => a + b, 0) - date.width) < 2, 'Partial final slot must align with the day boundary.');
		// Reopen a pre-fix saved project, whose DOM snapshot still has the old Planner markup.
		await page.reload();
		await page.locator('#SoftadminComponentSelectionMode label').filter({ hasText: 'Manual selection' }).click();
		await page.locator('#SoftadminComponentPicker label').filter({ has: page.locator('input[value="NewEdit"]') }).click();
		await page.locator('#SoftadminAutosaveStatus[data-state="saved"]').waitFor();
		await page.evaluate(spec => {
			const data = JSON.parse(localStorage.getItem('softadmin.mockup.projects.v1'));
			const project = data.projects.find(project => project.id === data.activeId);
			project.state.debugResult.spec.components = [spec];
			project.state.rootHtml = '<softadmin-planner class="saMenuItemRoot"><div>Old snapshot</div></softadmin-planner>';
			project.customName = 'Saved room schedule';
			project.name = project.customName;
			localStorage.setItem('softadmin.mockup.projects.v1', JSON.stringify(data));
		}, fixture);
		await page.reload();
		await planner.locator('.saMockPlannerResource').first().waitFor();
		assert.equal(await planner.locator('.saMockPlannerResource .saActivity').count(), 10);
		assert.match(await page.locator('#SoftadminProjectHistory option:checked').textContent(), /Saved room schedule/);
		assert.deepEqual(errors, []);
		console.log('Passed Planner layout: durations, fractional starts, overlaps, clipping, row heights, all-day stacks, header alignment, horizontal scrolling, mobile, untimed mode and legacy saved-project restoration. No Azure calls.');
	} finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
