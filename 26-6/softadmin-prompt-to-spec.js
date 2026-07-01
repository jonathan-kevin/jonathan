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

	function addFavoritesSidebarSpec() {
		return {
			frame: {},
			sidebar: {
				favorites: {
					append: true,
					items: [
						{ title: 'Customer search', icon: 'magnifying-glass' },
						{ title: 'Create invoice', icon: 'file-invoice' },
						{ title: 'Booking calendar', icon: 'calendar-days' },
						{ title: 'Payment overview', icon: 'credit-card' },
						{ title: 'Revenue report', icon: 'chart-simple' }
					]
				}
			},
			components: []
		};
	}

	function economySidebarPatchSpec() {
		return {
			frame: {},
			sidebarPatch: {
				removeItems: [
					{ title: 'Rooms' }
				],
				addItemsToResolvedGroup: {
					fallbackGroup: 'Economy',
					items: [
						{ title: 'Cost centers', icon: 'chart-pie' },
						{ title: 'Budget periods', icon: 'calendar-range' },
						{ title: 'Accounts', icon: 'calculator' },
						{ title: 'VAT codes', icon: 'percent' },
						{ title: 'Journal entries', icon: 'book' }
					]
				}
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
				actions: []
			},
			components: [
				{
					type: 'NewEdit',
					sections: [
						{
							heading: 'Booking',
							fields: [
								{ label: 'Customer', control: 'autosearch', value: 'Anna Andersson', required: true, actions: [{ label: 'Edit', icon: 'pen' }] },
								{ label: 'Room', control: 'textboxDropdown', value: 'Room 3', required: true, actions: [{ label: 'Choose' }] },
								{ label: 'Participants', control: 'multiAutosearch', id: 'MI_MC_Participants', values: ['Anna Andersson', 'Maria Lindberg'], valueIds: [19, 22] },
								{ label: 'Reference', control: 'autosuggest', value: 'Membership introduction' },
								{ label: 'Booking dates', control: 'dateRange', from: '2026-06-29', to: '2026-06-30', description: 'Used for availability and price calculation.' }
							]
						},
						{
							heading: 'Schedule',
							fields: [
								{
									layout: 'siblings',
									fields: [
										{ label: 'From', control: 'time', displayValue: '09:00', value: '09:00:00', required: true },
										{ label: 'To', control: 'time', displayValue: '10:30', value: '10:30:00', required: true },
										{ label: 'Breaks', control: 'numberAffix', value: '0.25', suffix: ' h', required: true, extendedDescription: 'Time reserved for lunch, cleaning or other breaks.' }
									]
								}
							]
						},
						{
							heading: 'Communication',
							fields: [
								{
									label: 'Confirmation',
									control: 'radioCards',
									value: 'email',
									options: [
										{ title: 'Email', value: 'email', description: 'Send a confirmation email.' },
										{ title: 'No confirmation', value: 'none', description: 'Create without notifying the participant.' }
									]
								},
								{ label: 'Send copy to customer contact', control: 'checkbox', checked: true, description: 'Uses the customer email address from the selected contact.' }
							]
						},
						{
							heading: 'Resources',
							fields: [
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
								{ label: 'Price rule', control: 'dropdown', value: 'Standard price', options: ['Standard price', 'Member price', 'Campaign price'], actions: [{ label: 'Open', icon: 'arrow-up-right-from-square' }] }
							]
						},
						{
							heading: 'Attachments and notes',
							fields: [
								{
									label: 'Attachments',
									control: 'fileUploadArea',
									files: [
										{ name: 'booking-request.pdf', size: '42 kB' },
										{ name: 'room-layout.png', size: '18 kB' }
									]
								},
								{ label: 'Notes', control: 'textarea', value: 'Remember accessibility needs.' }
							]
						},
						{
							heading: 'Publish booking',
							checkbox: { checked: true },
							fields: [
								{ label: 'Visible in customer portal', control: 'checkbox', checked: true },
								{ label: 'Booking icon', control: 'autosearch', value: 'calendar-days', actions: [{ label: 'Choose' }] },
								{ label: 'Icon preview', control: 'iconPreview', icon: 'calendar-days' }
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

	function personFormSpec() {
		return {
			frame: {
				title: 'Create person',
				documentTitle: 'Create person - Softadmin mockup',
				breadcrumbs: ['Home', 'Contacts', 'Create person'],
				actions: []
			},
			components: [
				{
					type: 'NewEdit',
					sections: [
						{
							heading: 'Person',
							fields: [
								{ label: 'First name', control: 'textbox', value: 'Emma', required: true },
								{ label: 'Last name', control: 'textbox', value: 'Johnson', required: true },
								{ label: 'Job title', control: 'textbox', value: 'Operations Manager' },
								{ label: 'Company', control: 'autosearch', value: 'Northwind Traders' }
							]
						},
						{
							heading: 'Contact information',
							fields: [
								{ label: 'Email', control: 'textbox', value: 'emma.johnson@example.com', required: true },
								{ label: 'Mobile phone', control: 'textbox', value: '+1 555 0147' },
								{ label: 'Work phone', control: 'textbox', value: '+1 555 0182' },
								{ label: 'Preferred contact method', control: 'dropdown', value: 'Email', options: ['Email', 'Mobile phone', 'Work phone', 'SMS'] }
							]
						},
						{
							heading: 'Address',
							fields: [
								{ label: 'Street address', control: 'textbox', value: '145 Maple Avenue' },
								{ label: 'City', control: 'textbox', value: 'Seattle' },
								{ label: 'State or region', control: 'textbox', value: 'WA' },
								{ label: 'Postal code', control: 'textbox', value: '98101' },
								{ label: 'Country', control: 'dropdown', value: 'United States', options: ['United States', 'Canada', 'United Kingdom', 'Germany', 'Sweden'] }
							]
						},
						{
							heading: 'Notes and consent',
							fields: [
								{ label: 'Notes', control: 'textarea', value: 'Prefers email for appointment confirmations.' },
								{ label: 'May receive marketing updates', control: 'checkbox' }
							]
						}
					],
					buttons: [
						{ label: 'Save contact', variant: 'primary' },
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

	function infoBoxesOnlySpec() {
		return {
			frame: {
				title: 'Membership overview',
				documentTitle: 'Membership overview - Softadmin mockup',
				breadcrumbs: ['Home', 'Contacts', 'Membership overview'],
				actions: [
					{ label: 'Refresh', icon: 'arrow-rotate-right', variant: 'secondary' }
				]
			},
			components: [
				{
					type: 'InfoBoxes',
					boxes: [
						{
							heading: 'Membership',
							fields: [
								{ label: 'Status', value: 'Active' },
								{ label: 'Member since', value: '2024-02-14' },
								{ label: 'Certificate', value: { text: 'Create membership certificate', link: true } }
							]
						},
						{
							heading: 'Balance',
							fields: [
								{ label: 'Current balance', value: '1 840 SEK' },
								{ label: 'Overdue invoices', value: '1' },
								{ label: 'Payment terms', value: '30 days' }
							]
						},
						{
							heading: 'Contact',
							fields: [
								{ label: 'Email', value: { text: 'anna.andersson@example.se', link: true } },
								{ label: 'Phone', value: '+46 70 123 45 67' },
								{ label: 'Address', value: 'Storgatan 12, 111 22 Stockholm' }
							]
						}
					]
				}
			]
		};
	}

	function calendarWeekdaysSpec() {
		return {
			frame: {
				title: 'Booking calendar',
				documentTitle: 'Booking calendar - Softadmin mockup',
				breadcrumbs: ['Home', 'Bookings', 'Booking calendar'],
				actions: [
					{ label: 'New booking', icon: 'plus', variant: 'primary' }
				]
			},
			components: [
				{
					type: 'CalendarWeekdays',
					heading: 'Week 27',
					year: '2026',
					month: 'July',
					week: '27',
					currentSidebarDay: '1',
					todaySidebarDay: '1',
					resource: 'Anna Andersson',
					filters: [
						{ label: 'Bookings', checked: true },
						{ label: 'Maintenance', checked: true },
						{ label: 'Unavailable', checked: false }
					],
					weeks: [
						{
							number: '27',
							label: 'Week 27',
							id: '2026-W27',
							days: [
								{ day: '29', date: '2026-06-29', activities: [{ title: 'Room inspection', time: '09:00', color: 'rgb(133, 147, 173)' }] },
								{ day: '30', date: '2026-06-30', activities: [{ title: 'Supplier visit', time: '13:00', color: 'rgb(119, 171, 124)' }] },
								{ day: '1', date: '2026-07-01', today: true, current: true, activities: [{ title: 'Conference room booked', description: 'Customer workshop', time: '10:00', color: 'rgb(96, 165, 250)' }] },
								{ day: '2', date: '2026-07-02', activities: [{ title: 'Equipment service', time: '08:30', color: 'rgb(245, 158, 11)' }] },
								{ day: '3', date: '2026-07-03', activities: [{ title: 'Board meeting', time: '15:00', color: 'rgb(168, 85, 247)' }] },
								{ day: '4', date: '2026-07-04', redDay: true, activities: [] },
								{ day: '5', date: '2026-07-05', redDay: true, activities: [] }
							]
						}
					]
				}
			]
		};
	}

	function enterpriseSearchSpec() {
		return {
			frame: {
				title: 'Search',
				documentTitle: 'Search - Softadmin mockup',
				breadcrumbs: ['Home', 'Search'],
				actions: []
			},
			components: [
				{
					type: 'EnterpriseSearch',
					query: 'design',
					searchLabel: 'Search',
					filterLegend: 'Filter category',
					emptyText: 'No results found.',
					filters: [
						{ label: 'All', value: '', selected: true },
						{ label: 'My maintenance items', value: 'maintenance' },
						{ label: 'Companies', value: 'companies' },
						{ label: 'Knowledge base', value: 'knowledge' },
						{ label: 'Contacts', value: 'contacts', disabled: true }
					],
					groups: [
						{
							title: 'My maintenance items',
							columns: [
								{ key: 'project', label: 'Project' },
								{ key: 'number', label: 'No.' },
								{ key: 'subject', label: 'Subject' },
								{ key: 'status', label: 'Status' }
							],
							rows: [
								{
									project: { text: 'Softadmin', link: true },
									number: '6031',
									subject: { link: true, segments: [{ text: 'Mobile interface shows non-responsive ' }, { text: 'design', mark: true }, { text: ' when switching menu item' }] },
									status: 'Archived'
								},
								{
									project: { text: 'Softadmin', link: true },
									number: '7298',
									subject: { link: true, segments: [{ text: 'New ' }, { text: 'design', mark: true }, { text: ': Column picker' }] },
									status: 'Archived'
								},
								{
									project: { text: 'Softadmin - Support', link: true },
									number: '7325',
									subject: { link: true, segments: [{ text: 'New ' }, { text: 'design', mark: true }, { text: ': Radio button' }] },
									status: 'In progress'
								}
							]
						},
						{
							title: 'Companies',
							columns: [
								{ key: 'company', label: 'Company' },
								{ key: 'email', label: 'Email' },
								{ key: 'phone', label: 'Phone' }
							],
							rows: [
								{ company: { link: true, segments: [{ text: 'Nordic ' }, { text: 'Design', mark: true }, { text: ' Group AB' }] }, email: { email: 'info@nordicdesign.se' }, phone: '08-441 46 46' },
								{ company: { link: true, segments: [{ text: 'Bright Light ' }, { text: 'Design', mark: true }] }, email: { email: 'hello@brightlight.se' }, phone: '08-728 20 00' },
								{ company: { link: true, segments: [{ text: 'Travel ' }, { text: 'Design', mark: true }, { text: ' Stockholm AB' }] }, email: { email: 'booking@traveldesign.se' }, phone: '08-667 85 25' }
							]
						},
						{
							title: 'Knowledge base',
							columns: [
								{ key: 'title', label: 'Title' },
								{ key: 'folder', label: 'Folder' }
							],
							rows: [
								{ title: { link: true, segments: [{ text: 'Employee guide - ' }, { text: 'Design', mark: true }] }, folder: { text: 'Internal', link: true } },
								{ title: { link: true, segments: [{ text: 'Database ' }, { text: 'Design', mark: true }, { text: 'er demo' }] }, folder: { text: 'R & D', link: true } },
								{ title: { link: true, segments: [{ text: 'Release planning Softadmin 8.11' }] }, folder: { text: 'Softadmin', link: true } }
							]
						}
					]
				}
			]
		};
	}

	function multipartSpec() {
		return {
			frame: {
				title: 'Customer workspace',
				documentTitle: 'Customer workspace - Softadmin mockup',
				breadcrumbs: ['Home', 'Customers', 'Customer workspace'],
				actions: [
					{ label: 'Create case', icon: 'folder-plus', variant: 'primary' }
				]
			},
			components: [
				{
					type: 'Multipart',
					parts: [
						{
							title: 'Overview',
							component: infoBoxesOnlySpec().components[0]
						},
						{
							title: 'Open invoices',
							component: advancedGridSpec().components[0]
						}
					]
				}
			]
		};
	}

	function createSpec(prompt) {
		const normalized = String(prompt || '').toLowerCase();
		const prefersNewEdit = normalized.includes('use the softadmin newedit component');
		const prefersGrid = normalized.includes('use the softadmin grid component');
		const prefersDetailView = normalized.includes('use the softadmin detailview component');
		const prefersEnterpriseSearch = normalized.includes('use the softadmin enterprise search component');
		const prefersCalendar = normalized.includes('use the softadmin calendar component');
		const prefersMultipart = normalized.includes('use the softadmin multipart component');
		const prefersMenuGroups = normalized.includes('use softadmin menu groups');
		const prefersInfoBoxes = normalized.includes('use softadmin infosql-style information boxes');

		if (prefersNewEdit) {
			return hasAny(normalized, ['person', 'persons', 'first name', 'last name', 'contact information'])
				? personFormSpec()
				: formSpec();
		}

		if (prefersGrid) {
			return advancedGridSpec();
		}

		if (prefersDetailView) {
			return detailViewSpec(normalized);
		}

		if (prefersEnterpriseSearch) {
			return enterpriseSearchSpec();
		}

		if (prefersCalendar) {
			return calendarWeekdaysSpec();
		}

		if (prefersMultipart) {
			return multipartSpec();
		}

		if (prefersMenuGroups) {
			return menuGroupsSpec();
		}

		if (prefersInfoBoxes) {
			return infoBoxesOnlySpec();
		}

		if (hasAny(normalized, ['remove', 'delete']) && hasAny(normalized, ['sidebar', 'menu item', 'menu items']) && hasAny(normalized, ['rooms', "'rooms'", '"rooms"'])) {
			return economySidebarPatchSpec();
		}

		if (hasAny(normalized, ['favorite', 'favorites']) && hasAny(normalized, ['add', 'more', 'new', 'five', '5'])) {
			return addFavoritesSidebarSpec();
		}

		if (hasAny(normalized, ['sidebar', 'side bar', 'sidebar menu'])) {
			return birdSidebarSpec();
		}

		if (hasAny(normalized, ['top button', 'top buttons', 'action button', 'action buttons', 'title', 'header'])) {
			return frameChromeSpec(prompt);
		}

		if (hasAny(normalized, ['menu', 'menu group', 'sidebar items'])) {
			return menuGroupsSpec();
		}

		if (hasAny(normalized, ['person', 'persons', 'first name', 'last name']) && hasAny(normalized, ['newedit', 'form'])) {
			return personFormSpec();
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

		if (hasAny(normalized, ['enterprise search', 'groupview', 'grouped search', 'search results'])) {
			return enterpriseSearchSpec();
		}

		return detailViewSpec(normalized);
	}

	window.SoftadminPromptToSpec = {
		createSpec,
		defaultPrompt: 'Create a NewEdit form for entering a persons contact information.'
	};
}());
