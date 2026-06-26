(function () {
	const contactNames = ['Anna Andersson', 'Maria Lindberg', 'Erik Johansson', 'Sara Nilsson'];

	function hasAny(text, words) {
		return words.some(word => text.includes(word));
	}

	function titleCase(value) {
		return String(value || '')
			.split(/\s+/)
			.filter(Boolean)
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
	}

	function promptIncludesName(prompt) {
		const match = prompt.match(/\b(?:for|called|named)\s+([a-zåäö]+(?:\s+[a-zåäö]+)?)/i);

		if (!match) {
			return contactNames[0];
		}

		return titleCase(match[1]);
	}

	function commonGridRows(domain) {
		if (domain === 'invoice') {
			return [
				{ invoiceNo: { text: 'INV-24087', link: true }, dueDate: '2026-07-15', status: { text: 'Overdue', icon: 'triangle-exclamation' }, amount: '1 840 SEK' },
				{ invoiceNo: { text: 'INV-24102', link: true }, dueDate: '2026-08-01', status: { text: 'Sent', icon: 'paper-plane' }, amount: '950 SEK' }
			];
		}

		if (domain === 'booking') {
			return [
				{ bookingNo: { text: 'B-5082', link: true }, customer: 'Anna Andersson', date: '2026-06-29', status: { text: 'Confirmed', icon: 'circle-check' }, resource: 'Room 3' },
				{ bookingNo: { text: 'B-5084', link: true }, customer: 'Maria Lindberg', date: '2026-06-30', status: { text: 'Waiting', icon: 'clock' }, resource: 'Room 1' }
			];
		}

		return [
			{ caseNo: { text: 'C-10482', link: true }, subject: 'Question about membership invoice', status: { text: 'Open', icon: 'circle-info' }, owner: 'Maria Lindberg', updated: 'Today 09:42' },
			{ caseNo: { text: 'C-10391', link: true }, subject: 'Address change request', status: { text: 'Waiting', icon: 'clock' }, owner: 'Erik Johansson', updated: 'Yesterday 15:10' }
		];
	}

	function resultGrid(domain) {
		if (domain === 'invoice') {
			return {
				type: 'ResultGrid',
				title: 'Invoices',
				caption: 'Invoices',
				hitCounter: '2 of 2 hits',
				pagination: false,
				columns: [
					{ key: 'invoiceNo', label: 'Invoice', width: '10rem', sorted: true },
					{ key: 'dueDate', label: 'Due date', width: '10rem' },
					{ key: 'status', label: 'Status', width: '10rem' },
					{ key: 'amount', label: 'Amount', width: '10rem', align: 'right' }
				],
				rows: commonGridRows('invoice')
			};
		}

		if (domain === 'booking') {
			return {
				type: 'ResultGrid',
				title: 'Bookings',
				caption: 'Bookings',
				hitCounter: '2 of 2 hits',
				pagination: false,
				columns: [
					{ key: 'bookingNo', label: 'Booking', width: '9rem', sorted: true },
					{ key: 'customer', label: 'Customer', width: '16rem' },
					{ key: 'date', label: 'Date', width: '10rem' },
					{ key: 'status', label: 'Status', width: '10rem' },
					{ key: 'resource', label: 'Resource', width: '12rem' }
				],
				rows: commonGridRows('booking')
			};
		}

		return {
			type: 'ResultGrid',
			title: 'Cases',
			caption: 'Cases',
			hitCounter: '2 of 2 hits',
			pagination: false,
			rowActions: [
				{ label: 'Open case', icon: 'eye', iconStyle: 'fas' },
				{ label: 'Edit case', icon: 'pen' },
				{ label: 'More...', icon: 'ellipsis-vertical' }
			],
			columns: [
				{ key: 'caseNo', label: 'Case', width: '8rem', sorted: true },
				{ key: 'subject', label: 'Subject', width: '22rem' },
				{ key: 'status', label: 'Status', width: '10rem' },
				{ key: 'owner', label: 'Owner', width: '12rem' },
				{ key: 'updated', label: 'Updated', width: '10rem' }
			],
			rows: commonGridRows('case')
		};
	}

	function detailViewSpec(prompt) {
		const name = promptIncludesName(prompt);
		const overdue = hasAny(prompt, ['overdue', 'late invoice', 'unpaid']);
		const includeInvoices = hasAny(prompt, ['invoice', 'invoices', 'billing', 'economy']);
		const includeBookings = hasAny(prompt, ['booking', 'bookings', 'calendar']);
		const tabs = [
			{
				label: 'Cases',
				icon: 'folder-open',
				badge: '2',
				selected: true,
				component: resultGrid('case')
			},
			{ label: 'Messages', icon: 'messages' },
			{ label: 'Personal notes', icon: 'note-sticky' }
		];

		if (includeInvoices) {
			tabs.push({ label: 'Invoices', icon: 'file-invoice', component: resultGrid('invoice') });
		}

		if (includeBookings) {
			tabs.push({ label: 'Bookings', icon: 'calendar-days', component: resultGrid('booking') });
		}

		tabs.push(
			{ label: 'Payments', icon: 'credit-card' },
			{ label: 'Direct debit withdrawals', icon: 'building-columns' },
			{ label: 'Customer ledger transactions', icon: 'calculator' }
		);

		return {
			frame: {
				title: name,
				documentTitle: `${name} - Softadmin mockup`,
				breadcrumbs: ['Home', 'Search contacts', name],
				actions: [
					{ label: 'Create case', icon: 'folder-plus', variant: 'primary' },
					{ label: 'Show addresses', icon: 'address-book', variant: 'secondary' },
					{ label: 'Identity check', icon: 'shield-check', variant: 'secondary' }
				]
			},
			components: [
				{
					type: 'DetailView',
					infoBoxes: {
						messages: overdue ? [
							{ type: 'warning', text: 'The contact has overdue invoices.', action: 'Show invoices' }
						] : [],
						boxes: [
							{
								heading: 'Personal details',
								fields: [
									{ label: 'Contact number', value: { text: '121133', link: true } },
									{ label: 'Personal identity number', value: { text: '19651019-1049', link: true } },
									{ label: 'Status', value: 'Active' }
								]
							},
							{
								heading: 'Membership',
								fields: [
									{ label: 'Membership number', value: { text: '68859351121131', link: true } },
									{ label: 'Type', value: 'Member' },
									{ label: 'Certificate', value: { text: 'Create membership certificate', link: true } }
								]
							},
							{
								heading: 'Contact details',
								fields: [
									{ label: 'Email', value: { text: `${name.toLowerCase().replace(/\s+/g, '.')}@example.se`, link: true } },
									{ label: 'Phone', value: '+46 70 123 45 67' },
									{ label: 'Address', value: 'Storgatan 12, 111 22 Stockholm' }
								]
							},
							{
								heading: 'Billing',
								fields: [
									{ label: 'Invoice address', value: 'Same as contact address' },
									{ label: 'Payment terms', value: '30 days' },
									{ label: 'Balance', value: overdue ? '1 840 SEK' : '0 SEK' }
								]
							}
						]
					},
					visibleTabs: 7,
					tabs
				}
			]
		};
	}

	function menuGroupsSpec() {
		return {
			frame: {
				title: 'Economy and booking setup',
				documentTitle: 'Economy and booking setup - Softadmin mockup',
				breadcrumbs: ['Home', 'Administration', 'Economy and booking setup'],
				actions: [
					{ label: 'Create item', icon: 'plus', variant: 'primary' },
					{ label: 'Export', icon: 'file-export', variant: 'secondary' }
				]
			},
			components: [
				{
					type: 'MenuGroups',
					groups: [
						{
							heading: 'Economy',
							items: [
								{ title: 'Customer invoices', icon: 'file-invoice' },
								{ title: 'Supplier invoices', icon: 'receipt' },
								{ title: 'Payments', icon: 'credit-card' },
								{ title: 'Price lists', icon: 'tags' },
								{ title: 'Ledger export', icon: 'calculator', pill: { type: 'beta', text: 'Beta' } }
							]
						},
						{
							heading: 'Bookings',
							items: [
								{ title: 'Booking calendar', icon: 'calendar-days' },
								{ title: 'Booking requests', icon: 'inbox', pill: { type: 'beta', text: 'Beta' } },
								{ title: 'Participants', icon: 'user-check' },
								{ title: 'Rooms', icon: 'door-open' },
								{ title: 'Equipment', icon: 'boxes-stacked' },
								{ title: 'Occupancy report', icon: 'chart-simple' }
							]
						}
					]
				}
			]
		};
	}

	function formSpec() {
		return {
			frame: {
				title: 'Create booking',
				documentTitle: 'Create booking - Softadmin mockup',
				breadcrumbs: ['Home', 'Bookings', 'Create booking'],
				actions: [
					{ label: 'Save', icon: 'floppy-disk', variant: 'primary' },
					{ label: 'Cancel', icon: 'xmark', variant: 'secondary' }
				]
			},
			components: [
				{
					type: 'NewEdit',
					sections: [
						{
							heading: 'Booking',
							fields: [
								{ label: 'Customer', value: 'Anna Andersson', required: true },
								{ label: 'Room', control: 'dropdown', value: 'Room 3', options: ['Room 1', 'Room 2', 'Room 3'], required: true },
								{
									layout: 'siblings',
									fields: [
										{ label: 'From', control: 'time', displayValue: '09:00', value: '09:00:00', required: true },
										{ label: 'To', control: 'time', displayValue: '10:30', value: '10:30:00', required: true }
									]
								},
								{
									label: 'Confirmation',
									control: 'radioCards',
									value: 'email',
									options: [
										{ title: 'Email', value: 'email', description: 'Send a confirmation email.' },
										{ title: 'No confirmation', value: 'none', description: 'Create without notifying the participant.' }
									]
								},
								{ label: 'Notes', control: 'textarea', value: 'Remember accessibility needs.' }
							]
						}
					],
					buttons: [
						{ label: 'Save', variant: 'primary' },
						{ label: 'Cancel', variant: 'secondary' }
					]
				}
			]
		};
	}

	function createSpec(prompt) {
		const normalized = String(prompt || '').toLowerCase();

		if (hasAny(normalized, ['menu', 'menu group', 'sidebar items'])) {
			return menuGroupsSpec();
		}

		if (hasAny(normalized, ['newedit', 'form', 'create booking', 'edit booking'])) {
			return formSpec();
		}

		return detailViewSpec(normalized);
	}

	window.SoftadminPromptToSpec = {
		createSpec,
		defaultPrompt: 'Create a customer detail page for Anna Andersson with overdue invoices, contact summary, cases, invoices, bookings, and payments.'
	};
}());
