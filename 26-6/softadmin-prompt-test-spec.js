(function () {
	const prompt = 'Create a customer details page for Acme Facilities. Include information boxes, an editable customer form, related orders table, and realistic action buttons.';

	const spec = {
		prompt,
		components: [
			{
				type: 'InfoBoxes',
				messages: [
					{
						type: 'info',
						text: 'Customer has two open orders and one invoice awaiting approval.',
						action: 'Review invoice'
					}
				],
				boxes: [
					{
						heading: 'Customer summary',
						icon: 'building',
						fields: [
							{ label: 'Customer', value: 'Acme Facilities AB' },
							{ label: 'Customer number', value: 'C-1042' },
							{ label: 'Status', value: { text: 'Active', icon: 'circle-check' } },
							{ label: 'Account manager', value: 'Anna Andersson' }
						]
					},
					{
						heading: 'Billing',
						icon: 'file-invoice-dollar',
						fields: [
							{ label: 'Payment terms', value: '30 days' },
							{ label: 'Credit limit', value: '250 000 SEK', align: 'right' },
							{ label: 'Open balance', value: '42 300 SEK', align: 'right' },
							{ label: 'Invoice method', value: 'E-invoice' }
						]
					}
				]
			},
			{
				type: 'Multipart',
				parts: [
					{
						title: 'Customer information',
						component: {
							type: 'NewEdit',
							sections: [
								{
									heading: 'Customer information',
									width: 'longest',
									fields: [
							{
								layout: 'siblings',
								fields: [
									{
										control: 'textbox',
										id: 'CustomerName',
										label: 'Customer',
										required: true,
										value: 'Acme Facilities AB',
										width: 'long',
										inputWrapper: 'long'
									},
									{
										control: 'textbox',
										id: 'CustomerNumber',
										label: 'Customer number',
										value: 'C-1042',
										width: 'mediumLong',
										inputWrapper: 'mediumLong'
									}
								]
							},
							{
								layout: 'siblings',
								fields: [
									{
										control: 'textbox',
										id: 'OrganizationNumber',
										label: 'Organization number',
										value: '556677-8899',
										width: 'mediumLong',
										inputWrapper: 'mediumLong'
									},
									{
										control: 'dropdown',
										id: 'CustomerStatus',
										label: 'Status',
										required: true,
										value: 'Active',
										width: 'mediumLong',
										inputWrapper: 'mediumLong',
										options: ['Active', 'Prospect', 'Paused', 'Closed']
									}
								]
							},
							{
								layout: 'siblings',
								fields: [
									{
										control: 'textbox',
										id: 'ContactEmail',
										label: 'Email',
										value: 'operations@acme.example',
										width: 'long',
										inputWrapper: 'long'
									},
									{
										control: 'textbox',
										id: 'ContactPhone',
										label: 'Phone',
										value: '+46 8 555 014 20',
										width: 'mediumLong',
										inputWrapper: 'mediumLong'
									}
								]
							},
							{
								control: 'textarea',
								id: 'CustomerNote',
								label: 'Internal note',
								value: 'Prefers consolidated monthly invoices for all bookings and services.',
								width: 'long',
								inputWrapper: 'longest',
								extendedDescription: 'Internal notes are only visible to administrators.'
							}
									]
								},
								{
									heading: 'Billing settings',
									width: 'longest',
									fields: [
							{
								control: 'checkbox',
								id: 'InvoiceCustomer',
								label: 'Invoice customer',
								checked: true,
								inputWrapper: 'longest'
							},
							{
								layout: 'siblings',
								fields: [
									{
										control: 'dropdown',
										id: 'PaymentTerms',
										label: 'Payment terms',
										required: true,
										value: '30 days',
										width: 'mediumLong',
										inputWrapper: 'mediumLong',
										options: ['10 days', '30 days', '45 days', '60 days']
									},
									{
										control: 'dropdown',
										id: 'InvoiceMethod',
										label: 'Invoice method',
										required: true,
										value: 'E-invoice',
										width: 'mediumLong',
										inputWrapper: 'mediumLong',
										options: ['E-invoice', 'Email PDF', 'Postal mail']
									}
								]
							}
									]
								}
							],
							buttons: [
								{ label: 'Save', variant: 'primary' },
								{ label: 'Cancel', variant: 'secondary' }
							]
						}
					},
					{
						title: 'Related orders',
						component: {
							type: 'ResultGrid',
							title: 'Related orders',
							caption: 'Related orders',
							hitCounter: '5 of 5 hits',
							pagination: false,
							rowActions: [
								{ label: 'Open order', icon: 'eye', iconStyle: 'fas' },
								{ label: 'Edit order', icon: 'pen' },
								{ label: 'Create invoice', icon: 'file-invoice' },
								{ label: 'More...', icon: 'ellipsis-vertical' }
							],
							columns: [
								{ key: 'orderNo', label: 'Order', width: '9rem', sorted: true },
								{ key: 'date', label: 'Date', width: '8rem' },
								{ key: 'description', label: 'Description', width: '24rem' },
								{ key: 'amount', label: 'Amount', width: '9rem', align: 'right' },
								{ key: 'status', label: 'Status', width: '10rem' }
							],
							rows: [
								{
									orderNo: { text: 'O-24091', link: true },
									date: '2026-06-24',
									description: 'Facility booking, conference room A',
									amount: '18 400 SEK',
									status: { text: 'Ready to invoice', icon: 'circle-check' }
								},
								{
									orderNo: { text: 'O-24077', link: true },
									date: '2026-06-20',
									description: 'Monthly service agreement',
									amount: '23 900 SEK',
									status: { text: 'Awaiting approval', icon: 'clock' }
								},
								{
									orderNo: { text: 'O-24052', link: true },
									date: '2026-06-12',
									description: 'Extra cleaning after event',
									amount: '4 800 SEK',
									status: { text: 'Invoiced', icon: 'file-invoice' }
								},
								{
									orderNo: { text: 'O-24033', link: true },
									date: '2026-06-05',
									description: 'Equipment rental',
									amount: '7 200 SEK',
									status: { text: 'Invoiced', icon: 'file-invoice' }
								},
								{
									orderNo: { text: 'O-23998', link: true },
									date: '2026-05-28',
									description: 'Recurring booking package',
									amount: '31 600 SEK',
									status: { text: 'Paid', icon: 'circle-check' }
								}
							]
						}
					}
				]
			}
		]
	};

	document.addEventListener('DOMContentLoaded', function () {
		const root = document.querySelector('[data-softadmin-component-root]');
		if (root && window.SoftadminMockups) {
			window.SoftadminMockups.renderSpec(spec, root);
		}
	});
}());
