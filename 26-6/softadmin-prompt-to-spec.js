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
					{ key: 'amount', label: 'Amount', width: '10rem', align: 'right', numeric: true }
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

	function birdSidebarSpec() {
		return {
			frame: {},
			sidebar: {
				favorites: {
					heading: 'Favorites',
					editLabel: 'Edit',
					items: [
						{ title: 'Aviary overview', icon: 'dove' },
						{ title: 'Nest approvals', icon: 'egg' },
						{ title: 'Migration alerts', icon: 'triangle-exclamation' }
					]
				},
				groups: [
					{
						heading: 'Aviary',
						items: [
							{ title: 'Flock overview', icon: 'feather' },
							{ title: 'Bird profiles', icon: 'dove' },
							{ title: 'Nest records', icon: 'egg' },
							{ title: 'Feeding schedule', icon: 'seedling' }
						]
					},
					{
						heading: 'Habitats',
						items: [
							{ title: 'Perches', icon: 'tree' },
							{ title: 'Flight rooms', icon: 'warehouse' },
							{ title: 'Aviary equipment', icon: 'boxes-stacked' }
						]
					},
					{
						heading: 'Observation',
						items: [
							{ title: 'Migration calendar', icon: 'calendar-days' },
							{ title: 'Sightings', icon: 'binoculars', pill: { type: 'beta', text: 'Beta' } },
							{ title: 'Feather reports', icon: 'chart-simple' }
						]
					}
				]
			},
			components: []
		};
	}

	function frameChromeSpec(prompt) {
		const titleMatch = prompt.match(/\btitle\s+(?:to|as|called|named)\s+["']?(.+?)(?=\s+(?:and|with|plus|while|but|then|also)\b|[.?!]|$)/i);
		const title = titleMatch ? titleCase(titleMatch[1]) : 'Aviary overview';

		return {
			frame: {
				title,
				documentTitle: `${title} - Softadmin mockup`,
				breadcrumbs: ['Home', 'Aviary', title],
				actions: [
					{ label: 'Add bird', icon: 'plus', variant: 'primary' },
					{ label: 'Import sightings', icon: 'file-import', variant: 'secondary' },
					{ label: 'Export report', icon: 'file-export', variant: 'secondary' }
				]
			},
			components: []
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
								{ label: 'Customer', control: 'autosearch', value: 'Anna Andersson', required: true },
								{ label: 'Room', control: 'textboxDropdown', value: 'Room 3', required: true },
								{ label: 'Participants', control: 'multiAutosearch', id: 'MI_MC_Participants', values: ['Anna Andersson', 'Maria Lindberg'], valueIds: [19, 22] },
								{ label: 'Reference', control: 'autosuggest', value: 'Membership introduction' },
								{ label: 'Booking dates', control: 'dateRange', from: '2026-06-29', to: '2026-06-30' },
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
								{
									label: 'Attachments',
									control: 'fileUploadArea',
									files: [
										{ name: 'booking-request.pdf', size: '42 kB' },
										{ name: 'room-layout.png', size: '18 kB' }
									]
								},
								{
									label: 'Resource rows',
									control: 'multirow',
									columns: [
										{ key: 'selected', label: 'Primary', control: 'radio', name: 'resource-row' },
										{ key: 'resource', label: 'Resource', control: 'textbox' },
										{ key: 'hours', label: 'Hours', control: 'affix', suffix: ' h', inputmode: 'decimal', width: 'short' },
										{ key: 'price', label: 'Price', control: 'affix', suffix: ' SEK', inputmode: 'decimal' }
									],
									rows: [
										{ selected: true, resource: 'Room 3', hours: '1.5', price: '750' },
										{ selected: false, resource: 'Projector', hours: '1.5', price: '120' },
										{ selected: false, resource: 'Coffee service', hours: '1.5', price: '180' }
									],
									aggregate: ['', { sumText: 'Sum' }, { value: '4.5', suffix: ' h' }, { value: '1 050', suffix: ' SEK' }]
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

	function advancedGridSpec() {
		const gridActions = [
			{ label: 'Open ledger entry', icon: 'coin' },
			{ label: 'Show details', icon: 'table-list' },
			{ label: 'Create follow-up', icon: 'plus', inactive: true }
		];

		return {
			frame: {
				title: 'Transaction overview',
				documentTitle: 'Transaction overview - Softadmin mockup',
				breadcrumbs: ['Home', 'Economy', 'Transaction overview'],
				actions: [
					{ label: 'Create transaction', icon: 'plus', variant: 'primary' },
					{ label: 'Export', icon: 'file-export', variant: 'secondary' }
				]
			},
			components: [
				{
					type: 'ResultGrid',
					variant: 'listpage',
					title: 'Transactions',
					caption: 'Transactions',
					hitCounter: '50 of 1000 hits',
					page: '1',
					pages: '20',
					grouped: true,
					groupedBy: 'Status',
					hasColumnChanges: true,
					expandableRows: true,
					moreRowButton: true,
					bottomPagination: true,
					contentLinks: [
						{ label: 'Grid', icon: 'table-list', inactive: true },
						{ label: 'Reconcile', icon: 'scale-balanced' }
					],
					rowActions: gridActions,
					mobileTitleKey: 'entryNo',
					mobileDescriptionKey: 'description',
					columns: [
						{ key: 'entryNo', label: 'Entry', width: '9rem', sorted: true, cellClass: 'saCellUserStyle' },
						{ key: 'description', label: 'Description', width: '24rem', cellClass: 'saCellUserStyle' },
						{ key: 'status', label: 'Status', width: '10rem', cellClass: 'saCellUserStyle' },
						{ key: 'amount', label: 'Amount', width: '10rem', align: 'right', numeric: true, cellClass: 'saCellUserStyle' },
						{ key: 'posted', label: 'Posted', width: '10rem', cellClass: 'saCellUserStyle' }
					],
					rows: [
						{ type: 'groupHeader', label: 'Ready for review' },
						{ type: 'extraText', text: 'Imported from supplier statement.' },
						{
							id: '25',
							expanded: true,
							entryNo: 'Pre 51 Post',
							description: { text: 'Supplier invoice 24087', link: true, icon: 'tiktok', iconStyle: 'fab' },
							status: { text: 'Pending', icon: 'clock' },
							amount: '12 450 SEK',
							posted: '2026-06-24'
						},
						{ type: 'extraText', text: 'Matched automatically.' },
						{
							id: '49',
							entryNo: 'Pre 99 Post',
							description: { text: 'Membership payment batch', link: true },
							status: { text: 'Booked', icon: 'circle-check' },
							amount: '8 120 SEK',
							posted: '2026-06-25'
						},
						{
							id: '50',
							entryNo: 'Pre 100 Post',
							description: { text: 'Card payment settlement', link: true },
							status: { text: 'Waiting', icon: 'circle-info' },
							amount: '3 980 SEK',
							posted: '2026-06-26'
						}
					]
				}
			]
		};
	}

	function applicationLogGridSpec() {
		const rows = [
			{ id: 24, selected: true, logType: { text: 'Information', icon: 'circle-info', iconClass: 'iconblue' }, latest: '2026-06-26 12:51', errors: '21', menuItemName: '', menuItemId: '', message: 'EntityId: 5' },
			{ id: 3, selected: true, logType: { text: 'Information', icon: 'circle-info', iconClass: 'iconblue' }, latest: '2026-06-26 12:26', errors: '1', menuItemName: '', menuItemId: '', message: 'EntityId: 3' },
			{ id: 1, logType: { text: 'Information', icon: 'circle-info', iconClass: 'iconblue' }, latest: '2026-06-26 12:25', errors: '1', menuItemName: '', menuItemId: '', message: 'EntityId: 2' },
			{ id: 2, logType: { text: 'Information', icon: 'circle-info', iconClass: 'iconblue' }, latest: '2026-06-26 12:25', errors: '1', menuItemName: '', menuItemId: '', message: 'EntityId: 4' }
		];

		return {
			frame: {
				title: 'Application errors and log',
				documentTitle: 'Application errors and log - Softadmin mockup',
				breadcrumbs: ['Home', 'Administration', 'Application errors and log'],
				actions: [
					{ label: 'Search', icon: 'magnifying-glass', variant: 'primary' }
				]
			},
			components: [
				{
					type: 'ResultGrid',
					variant: 'listpage',
					title: 'Application errors and log',
					caption: 'Application errors and log',
					hitCounter: '4 hits',
					selectedItems: 2,
					pagination: false,
					selectableRows: true,
					hasColumnChanges: true,
					contentLinks: [
						{ label: 'Search application errors and log', icon: 'magnifying-glass' },
						{ label: 'Delete selected log groups', icon: 'trash', destructive: true },
						{ label: 'Delete all', icon: 'trash', destructive: true }
					],
					rowActions: [
						{ label: 'Show details', icon: 'eye', iconStyle: 'fas' }
					],
					mobileTitleKey: 'logType',
					mobileDescriptionKey: 'message',
					columns: [
						{ key: 'logType', label: 'Log type', width: '12rem' },
						{ key: 'latest', label: 'Latest', width: '12rem', sorted: true, sortDirection: 'descending' },
						{ key: 'errors', label: 'Errors', width: '7rem', align: 'right', numeric: true },
						{ key: 'menuItemName', label: 'Menu item name', width: '16rem' },
						{ key: 'menuItemId', label: 'Menu item ID', width: '9rem' },
						{ key: 'message', label: 'Message', width: '24rem' }
					],
					rows
				}
			]
		};
	}

	function createSpec(prompt) {
		const normalized = String(prompt || '').toLowerCase();

		if (hasAny(normalized, ['sidebar', 'side bar', 'sidebar menu'])) {
			return birdSidebarSpec();
		}

		if (hasAny(normalized, ['top button', 'top buttons', 'action button', 'action buttons', 'title', 'header'])) {
			return frameChromeSpec(prompt);
		}

		if (hasAny(normalized, ['menu', 'menu group', 'sidebar items'])) {
			return menuGroupsSpec();
		}

		if (hasAny(normalized, ['newedit', 'form', 'create booking', 'edit booking'])) {
			return formSpec();
		}

		if (hasAny(normalized, ['application log', 'application errors', 'log grid', 'errors and log'])) {
			return applicationLogGridSpec();
		}

		if (hasAny(normalized, ['grid', 'grouped rows', 'resultgrid', 'transaction overview'])) {
			return advancedGridSpec();
		}

		return detailViewSpec(normalized);
	}

	window.SoftadminPromptToSpec = {
		createSpec,
		defaultPrompt: 'Create a customer detail page for Anna Andersson with overdue invoices, contact summary, cases, invoices, bookings, and payments.'
	};
}());
