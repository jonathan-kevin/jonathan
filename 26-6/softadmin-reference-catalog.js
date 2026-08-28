(function () {
	const catalog = {
		components: {
			BankID: {
				description: 'BankID signing or authentication screen.',
				file: 'html/components/bankid.html',
				promptInstruction: 'Use the Softadmin BankID component as the main component. Shape: { type:"BankID", heading?, message?, progress?, countdown?, deviceButtonLabel?, cancelLabel? }.',
				renderable: true,
				specType: 'BankID',
				specTypes: ['BankID']
			},
			Calendar: {
				description: 'Calendar in Weekdays mode.',
				file: 'html/components/calendar-weekdays.html',
				promptInstruction: 'Use the Softadmin Calendar component in Weekdays mode as the main component.',
				renderable: true,
				specType: 'CalendarWeekdays',
				specTypes: ['Calendar', 'CalendarWeekdays']
			},
			Chat: {
				description: 'Softadmin chat conversation layout.',
				file: 'html/components/chat.html',
				promptInstruction: 'Use the Softadmin Chat component as the main component. Shape: { type:"Chat", messages:[{ role:"user|assistant|system", text, time?, date? }], loadEarlier?, loadEarlierLabel?, placeholder?, composerValue?, instruction? }.',
				renderable: true,
				specType: 'Chat',
				specTypes: ['Chat']
			},
			Detailview: {
				description: 'Detail page with info boxes and tabs.',
				file: 'html/components/detailview.html',
				promptInstruction: 'Use the Softadmin Detailview component with tabs as the main component.',
				renderable: true,
				specType: 'DetailView',
				specTypes: ['Detailview', 'DetailView']
			},
			'Enterprise Search': {
				description: 'Grouped search results with search field and filters.',
				file: 'html/components/enterprise-search.html',
				renderable: true,
				specType: 'EnterpriseSearch',
				specTypes: ['Enterprise Search', 'EnterpriseSearch']
			},
			Grid: {
				description: 'Result grid with toolbar, sortable columns, row actions and mobile list-grid.',
				file: 'html/components/grid.html',
				renderable: true,
				specType: 'ResultGrid',
				specTypes: ['Grid', 'ResultGrid']
			},
			'Image Gallery': {
				description: 'Image gallery component.',
				file: 'html/components/image-gallery.html',
				promptInstruction: 'Use the Softadmin Image Gallery component as the main component.',
				renderable: true,
				specType: 'ImageGallery',
				specTypes: ['Image Gallery', 'ImageGallery']
			},
			'Inline Document': {
				description: 'Document selector and viewer with navigation and a download fallback for unsupported files.',
				file: 'html/components/inline-document.html',
				promptInstruction: 'Use the Softadmin Inline Document component as the main component. Shape: { type:"InlineDocument", label?, selectedIndex?, documents:[{ name, src, previewable?, description?, icon? }] }. Set previewable:false for files that should show the download fallback.',
				renderable: true,
				specType: 'InlineDocument',
				specTypes: ['Inline Document', 'InlineDocument']
			},
			'InfoBoxes': {
				description: 'InfoSQL-style information boxes and warning messages.',
				file: 'html/components/detailview.html',
				pattern: true,
				promptInstruction: 'Use Softadmin InfoSQL-style information boxes as the main component.',
				renderable: true,
				specType: 'InfoBoxes',
				specTypes: ['InfoBoxes']
			},
			'Linear Process': {
				description: 'Linked process steps with captions, status tones and straight or wrapped connectors.',
				file: 'html/components/linear-process.html',
				referenceFiles: ['html/components/linear-process.html', 'html/components/linear-process-wrapped.html'],
				promptInstruction: 'Use the Softadmin Linear Process as the main component. Shape: { type:"LinearProcess", size?:"short|medium|long", wrapped?, wrapAfter?, steps:[{ heading, body?, caption?, link?, tone?:"primary|success|warning|neutral" }] }. wrapAfter is the number of steps shown before the wrapped connector.',
				renderable: true,
				specType: 'LinearProcess',
				specTypes: ['Linear Process', 'LinearProcess']
			},
			'Link Card': {
				description: 'Softadmin link card pattern.',
				file: 'html/components/link-card.html',
				pattern: true,
				renderable: false
			},
			'Link List': {
				description: 'Link list with optional group headings, row labels or dates, and unread states.',
				file: 'html/components/link-list.html',
				promptInstruction: 'Use the Softadmin Link List component as the main component. Shape: { type:"LinkList", groups:[{ heading?, items:[{ title, label?, date?, unread? }] }] }.',
				renderable: true,
				specType: 'LinkList',
				specTypes: ['Link List', 'LinkList']
			},
			'MenuGroups': {
				description: 'Grouped menu item cards used as main content.',
				file: 'html/components/menu-group.html',
				pattern: true,
				promptInstruction: 'Use Softadmin menu groups as the main component.',
				renderable: true,
				specType: 'MenuGroups',
				specTypes: ['MenuGroups']
			},
			Multipart: {
				description: 'Page composed from multiple component parts.',
				file: 'html/components/multipart.html',
				renderable: true,
				specType: 'Multipart',
				specTypes: ['Multipart']
			},
			NewEdit: {
				description: 'Form component for creating or editing records.',
				file: 'html/components/newedit.html',
				renderable: true,
				specType: 'NewEdit',
				specTypes: ['NewEdit']
			},
			'PDF Template Editor': {
				description: 'PDF template editor with available values, formatting tools and a page canvas.',
				file: 'html/components/pdf-template-editor.html',
				promptInstruction: 'Use the Softadmin PDF Template Editor as the main component. Shape: { type:"PdfTemplateEditor", page:{ current, count }, lastSaved?, groups:[{ heading, values:[{ label, kind?:"text|image", placed?, selected?, info? }] }], placeholders:[{ label, value?, kind?:"text|image", x, y, font?, fontSize?, selected? }] }.',
				renderable: true,
				specType: 'PdfTemplateEditor',
				specTypes: ['PDF Template Editor', 'PDFTemplateEditor', 'PdfTemplateEditor']
			},
			'Pivot Grid': {
				description: 'Cross-tabulated grid with sortable row and column headings, actions, export and numeric measures.',
				file: 'html/components/pivot-grid.html',
				promptInstruction: 'Use the Softadmin Pivot Grid as the main component. Shape: { type:"PivotGrid", caption?, exportable?, columns:[{ key, label, sorted?, sortDirection?:"asc|desc", numeric? }], rows:[{ label, icon?, sorted?, values:{ [columnKey]: value }, clickable?:[columnKey] }] }. Do not add per-cell colors unless the user explicitly requests them.',
				renderable: true,
				specType: 'PivotGrid',
				specTypes: ['Pivot Grid', 'PivotGrid']
			},
			Planner: {
				description: 'Resource planner with shared period controls, sidebar filters, unbooked items and modes with or without a timescale.',
				file: 'html/components/planner-with-timescale.html',
				referenceFiles: ['html/components/planner-with-timescale.html', 'html/components/planner-without-timescale.html'],
				promptInstruction: 'Use the Softadmin Planner as the main component. Shape: { type:"Planner", heading?, period?:"Day|Work week|Week|Month", periodLabel?, year?, periodNumber?, periodNumberLabel?, timescale?, columnWidth?:"narrow|medium|wide", sidebarOpen?, monthLabel?, filters?:[{ label, value, options? }], days:[{ key, label, date, today?, redDay?, allDay?:[{ title, description?, tone? }] }], unbookedGroups?:[{ heading, expanded?, items:[{ title, description?, tone? }] }], resources:[{ key, label, description?, aggregate?, activities:[{ title, description?, day, start?, end?, tone?, link? }] }], startHour?, endHour?, hourStep? }. Use timescale:true for hour-based schedules and false for day-column planning.',
				renderable: true,
				specType: 'Planner',
				specTypes: ['Planner']
			},
			Treeview: {
				description: 'Hierarchical navigation tree with expandable branches, linked or plain nodes, icons and hidden-item styling.',
				file: 'html/components/treeview.html',
				promptInstruction: 'Use the Softadmin Treeview as the main component. Shape: { type:"Treeview", nodes:[{ label, icon?, link?, expanded?, hidden?, tone?:"primary|success|warning|danger|neutral", children?:[...] }] }. Nodes with children are expandable branches; leaf nodes do not get an active expander. Use link:false only for headings or non-navigable nodes.',
				renderable: true,
				specType: 'Treeview',
				specTypes: ['Treeview']
			}
		},
		controls: {
			'Boolean Dropdown': { file: 'html/control/boolean-dropdown.html', renderable: false },
			Chart: { file: 'html/control/chart.html', renderable: false },
			Checkbox: {
				file: 'html/control/checkbox.html',
				renderable: true,
				specType: 'checkbox',
				specTypes: ['Checkbox', 'checkbox'],
				builder: { label: 'Checkbox', icon: 'far fa-square-check', order: 40, starter: { checked: true } }
			},
			'Checkbox Cards': { file: 'html/control/checkbox-cards.html', renderable: false },
			'Checkbox Tree': { file: 'html/control/checkbox-tree.html', renderable: false },
			Colorpicker: { file: 'html/control/colorpicker.html', renderable: false },
			'Consent Checkbox': { file: 'html/control/consent-checkbox.html', renderable: false },
			Date: { file: 'html/control/date.html', renderable: false },
			'Date Range': {
				file: 'html/control/date-range.html',
				renderable: true,
				specType: 'dateRange',
				specTypes: ['Date Range', 'dateRange'],
				builder: { label: 'Date range', icon: 'far fa-calendar-days', order: 50, starter: { from: '2026-07-01', to: '2026-07-31' } }
			},
			Datetime: { file: 'html/control/datetime.html', renderable: false },
			Dropdown: {
				file: 'html/control/dropdown.html',
				renderable: true,
				specType: 'dropdown',
				specTypes: ['Dropdown', 'dropdown'],
				builder: { label: 'Dropdown', icon: 'far fa-list-dropdown', order: 30, starter: { options: ['Option 1', 'Option 2', 'Option 3'], value: 'Option 1' } }
			},
			File: { file: 'html/control/file.html', renderable: false },
			'File Upload Area': {
				file: 'html/control/file-upload-area.html',
				renderable: true,
				specType: 'fileUploadArea',
				specTypes: ['File Upload Area', 'fileUploadArea'],
				builder: {
					label: 'File upload',
					icon: 'far fa-file-arrow-up',
					order: 150,
					starter: { width: 'long', heading: 'Drop files here, or ', linkText: 'browse', description: 'Maximum file size 30 MB', files: [] }
				}
			},
			Heading: { file: 'html/control/heading.html', renderable: false },
			'Heading (Collapsible)': { file: 'html/control/heading-collapsible.html', renderable: false },
			'Heading with Checkbox': { file: 'html/control/heading-with-checkbox.html', renderable: false },
			'HTML Editor': { file: 'html/control/html-editor.html', renderable: false },
			'Info Text': { file: 'html/control/info-text.html', renderable: false },
			Listbox: { file: 'html/control/listbox.html', renderable: false },
			Meter: { file: 'html/control/meter.html', renderable: false },
			'Multi-autosearch': {
				file: 'html/control/multi-autosearch.html',
				renderable: true,
				specType: 'multiAutosearch',
				specTypes: ['Multi-autosearch', 'multiAutosearch'],
				builder: { label: 'Multi-autosearch', icon: 'far fa-tags', order: 100, starter: { values: ['Anna Andersson', 'Maria Lindberg'] } }
			},
			'Multi-control': { file: 'html/control/multi-control.html', renderable: false },
			'Multi-listbox': { file: 'html/control/multi-listbox.html', renderable: false },
			'Multi-picker': { file: 'html/control/multi-picker.html', renderable: false },
			Multirow: {
				file: 'html/control/multirow.html',
				renderable: true,
				specType: 'multirow',
				specTypes: ['Multirow', 'multirow'],
				builder: {
					label: 'Multirow',
					icon: 'far fa-table-rows',
					order: 140,
					starter: {
						width: 'long',
						columns: [
							{ key: 'description', heading: 'Description', control: 'textbox', width: 'mediumLong' },
							{ key: 'amount', heading: 'Amount', control: 'number', suffix: ' SEK', width: 'short' }
						],
						rows: [{ description: 'New row', amount: '0' }],
						addButtonLabel: 'New row'
					}
				}
			},
			'Multirow Row Heading': { file: 'html/control/multirow-row-heading.html', renderable: false },
			Password: { file: 'html/control/password.html', renderable: false },
			'Radio Button Column': { file: 'html/control/radio-button-column.html', renderable: false },
			'Radio Buttons': { file: 'html/control/radio-buttons.html', renderable: false },
			'Radio Cards': {
				file: 'html/control/radio-cards.html',
				renderable: true,
				specType: 'radioCards',
				specTypes: ['Radio Cards', 'RadioCards', 'radioCards'],
				builder: {
					label: 'Radio cards',
					icon: 'far fa-table-cells-large',
					order: 110,
					starter: {
						value: 'standard',
						options: [
							{ title: 'Standard', value: 'standard', description: 'Use the normal workflow.' },
							{ title: 'Manual', value: 'manual', description: 'Let the user decide later.' }
						]
					}
				}
			},
			Separator: { file: 'html/control/separator.html', renderable: false },
			Signature: { file: 'html/control/signature.html', renderable: false },
			Textarea: {
				file: 'html/control/textarea.html',
				renderable: true,
				specType: 'textarea',
				specTypes: ['Textarea', 'textarea'],
				builder: { label: 'Textarea', icon: 'far fa-align-left', order: 20, starter: { width: 'long', value: 'Notes and details.' } }
			},
			Textbox: {
				file: 'html/control/textbox.html',
				renderable: true,
				specType: 'textbox',
				specTypes: ['Textbox', 'textbox'],
				builder: { label: 'Textbox', icon: 'far fa-input-text', order: 10, starter: { value: 'New value' } }
			},
			'Textbox with Autosearch': {
				file: 'html/control/textbox-with-autosearch.html',
				renderable: true,
				specType: 'autosearch',
				specTypes: ['Textbox with Autosearch', 'autosearch'],
				builder: { label: 'Autosearch', icon: 'far fa-magnifying-glass', order: 90, starter: { value: 'Anna Andersson' } }
			},
			'Textbox with Autosuggest': {
				file: 'html/control/textbox-with-autosuggest.html',
				renderable: true,
				specType: 'autosuggest',
				specTypes: ['Textbox with Autosuggest', 'autosuggest'],
				builder: { label: 'Autosuggest', icon: 'far fa-text-size', order: 120, starter: { value: 'Suggested value' } }
			},
			'Textbox with Dropdown': {
				file: 'html/control/textbox-with-dropdown.html',
				renderable: true,
				specType: 'textboxDropdown',
				specTypes: ['Textbox with Dropdown', 'textboxDropdown'],
				builder: { label: 'Textbox dropdown', icon: 'far fa-list-dropdown', order: 130, starter: { value: 'Option 1', options: ['Option 1', 'Option 2', 'Option 3'] } }
			},
			'Textbox with Popup': { file: 'html/control/textbox-with-popup.html', renderable: false },
			'Textbox with Redirect': { file: 'html/control/textbox-with-redirect.html', renderable: false },
			Time: {
				file: 'html/control/time.html',
				renderable: true,
				specType: 'time',
				specTypes: ['Time', 'time'],
				builder: { label: 'Time', icon: 'far fa-clock', order: 60, starter: { value: '09:00:00', displayValue: '09:00' } }
			},
			'Uneditable Text': {
				file: 'html/control/uneditable-text.html',
				renderable: true,
				specType: 'uneditable',
				specTypes: ['Uneditable Text', 'uneditable'],
				builder: { label: 'Uneditable text', icon: 'far fa-text', order: 160, starter: { value: 'Read-only value' } }
			}
		},
		formBuilderLayouts: {
			timeSiblingRow: {
				label: 'Time row',
				icon: 'far fa-clock',
				order: 70,
				starter: {
					layout: 'siblings',
					fields: [
						{ label: 'From', control: 'time', value: '09:00:00', displayValue: '09:00', required: true, inputWrapper: 'saMediumShortValidation mediumLong' },
						{ label: 'To', control: 'time', value: '17:00:00', displayValue: '17:00', required: true, inputWrapper: 'saMediumShortValidation mediumLong' }
					]
				}
			}
		},
		excludedComponents: [
			'Active Directory',
			'Bankgiro',
			'Chart',
			'Coordinator',
			'Custom Component',
			'Delete',
			'Download File',
			'Email',
			'Embedding',
			'Excel',
			'Execute',
			'External Embed',
			'External Redirect',
			'File Manager',
			'FTP',
			'GenAI',
			'HTML View',
			'HTTP Request',
			'Image Process',
			'JavaScript',
			'Log Out',
			'Magic Box',
			'Markdown',
			'Microsoft Exchange',
			'Microsoft Graph',
			'Node Graph',
			'PDF Document',
			'Publish',
			'Redirect',
			'RTF Document',
			'SIE',
			'SMS',
			'Text Extractor',
			'Web Service Call',
			'Zip Archive'
		],
		excludedControls: ['Hidden', 'Picture']
	};

	function renderableNames(entries) {
		return Object.entries(entries)
			.filter(([, entry]) => entry.renderable)
			.map(([name]) => name);
	}

	catalog.renderableComponents = renderableNames(catalog.components);
	catalog.renderableControls = renderableNames(catalog.controls);

	const target = typeof window !== 'undefined' ? window : globalThis;
	target.SoftadminReferenceCatalog = catalog;
}());
