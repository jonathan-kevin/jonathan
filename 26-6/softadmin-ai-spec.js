(function () {
	const spec = {
		components: [
			{
				type: 'DetailView',
				infoBoxes: {
					messages: [
						{
							type: 'warning',
							text: 'The contact has overdue invoices.',
							action: 'Show invoices'
						}
					],
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
								{ label: 'Email', value: { text: 'anna.andersson@example.se', link: true } },
								{ label: 'Phone', value: '+46 70 123 45 67' },
								{ label: 'Address', value: 'Storgatan 12, 111 22 Stockholm' }
							]
						},
						{
							heading: 'Billing',
							fields: [
								{ label: 'Invoice address', value: 'Same as contact address' },
								{ label: 'Payment terms', value: '30 days' },
								{ label: 'Balance', value: '1 840 SEK' }
							]
						}
					]
				},
				visibleTabs: 7,
				tabs: [
					{
						label: 'Cases',
						icon: 'folder-open',
						badge: '2',
						selected: true,
						component: {
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
							rows: [
								{
									caseNo: { text: 'C-10482', link: true },
									subject: 'Question about membership invoice',
									status: { text: 'Open', icon: 'circle-info' },
									owner: 'Maria Lindberg',
									updated: 'Today 09:42'
								},
								{
									caseNo: { text: 'C-10391', link: true },
									subject: 'Address change request',
									status: { text: 'Waiting', icon: 'clock' },
									owner: 'Erik Johansson',
									updated: 'Yesterday 15:10'
								}
							]
						}
					},
					{ label: 'Messages', icon: 'messages' },
					{ label: 'Personal notes', icon: 'note-sticky' },
					{ label: 'Invoices', icon: 'file-invoice' },
					{ label: 'Debit periods', icon: 'calendar-days' },
					{ label: 'Payments', icon: 'credit-card' },
					{ label: 'Direct debit withdrawals', icon: 'building-columns' },
					{ label: 'Swish requests', icon: 'mobile-screen-button' },
					{ label: 'Payouts', icon: 'money-bill-transfer' },
					{ label: 'Customer ledger transactions', icon: 'calculator' }
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
