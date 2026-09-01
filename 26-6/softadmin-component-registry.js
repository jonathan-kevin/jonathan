(function () {
	const pillClasses = {
		admin: 'saAdminOnly',
		beta: 'saBeta',
		deprecated: 'saDeprecated'
	};

	const officialComponentNames = [
		'Active Directory',
		'Bankgiro',
		'BankID',
		'Calendar',
		'Chart',
		'Chat',
		'Coordinator',
		'Custom Component',
		'Delete',
		'Detailview',
		'Download File',
		'Email',
		'Embedding',
		'Enterprise Search',
		'Excel',
		'Execute',
		'External Embed',
		'External Redirect',
		'File Manager',
		'FTP',
		'GenAI',
		'Grid',
		'HTML View',
		'HTTP Request',
		'Image Gallery',
		'Image Process',
		'Inline Document',
		'JavaScript',
		'Linear Process',
		'Link List',
		'Log Out',
		'Magic Box',
		'Markdown',
		'Microsoft Exchange',
		'Microsoft Graph',
		'Multipart',
		'NewEdit',
		'Node Graph',
		'PDF Document',
		'PDF Template Editor',
		'Pivot Grid',
		'Planner',
		'Publish',
		'Redirect',
		'RTF Document',
		'SIE',
		'SMS',
		'Text Extractor',
		'Treeview',
		'Web Service Call',
		'Zip Archive'
	];

	const officialControlNames = [
		'Boolean Dropdown',
		'Chart',
		'Checkbox',
		'Checkbox Cards',
		'Checkbox Tree',
		'Colorpicker',
		'Consent Checkbox',
		'Date',
		'Date Range',
		'Datetime',
		'Dropdown',
		'File',
		'File Upload Area',
		'Heading',
		'Heading (Collapsible)',
		'Heading with Checkbox',
		'Hidden',
		'HTML Editor',
		'Info Text',
		'Listbox',
		'Meter',
		'Multi-autosearch',
		'Multi-control',
		'Multi-listbox',
		'Multi-picker',
		'Multirow',
		'Multirow Row Heading',
		'Password',
		'Picture',
		'Radio Button Column',
		'Radio Buttons',
		'Radio Cards',
		'Separator',
		'Signature',
		'Textarea',
		'Textbox',
		'Textbox with Autosearch',
		'Textbox with Autosuggest',
		'Textbox with Dropdown',
		'Textbox with Popup',
		'Textbox with Redirect',
		'Time',
		'Uneditable Text'
	];

	function docsQueryValue(name) {
		return encodeURIComponent(name).replace(/%20/g, '+');
	}

	function makeDictionary(names, id, parameterName) {
		return Object.fromEntries(names.map(name => [
			name,
			{
				docs: `https://documentation.softadmin.com/softadmin.aspx?id=${id}&${parameterName}=${docsQueryValue(name)}`,
				implemented: false
			}
		]));
	}

	const registry = {
		designRules: [
			'Prefer label and value pairs as stacked columns. Use row/grid label-value layouts only when a real Softadmin component calls for dense metric-style data.'
		],
		components: {
			...makeDictionary(officialComponentNames, 5, 'Component'),
			BankID: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=BankID',
				description: 'BankID signing or authentication screen with QR code and same-device action.',
				implemented: true,
				renderType: 'BankID'
			},
			Chat: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Chat',
				description: 'Conversation log with sender, AI and system messages plus a message composer.',
				implemented: true,
				renderType: 'Chat'
			},
			Calendar: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Calendar',
				description: 'Calendar component with weekdays, weekdays with time scale, and resources with time scale modes.',
				implemented: true,
				implementedModes: ['Weekdays', 'Weekdays with time scale', 'Resources with time scale'],
				renderType: 'CalendarWeekdays'
			},
			Detailview: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Detailview',
				description: 'Detail page pattern with summary information boxes followed by tabbed related content.',
				implemented: true,
				renderType: 'DetailView'
			},
			'Enterprise Search': {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Enterprise+Search',
				description: 'Grouped search results with search input, category pills and result tables.',
				implemented: true,
				renderType: 'EnterpriseSearch'
			},
			EnterpriseSearch: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Enterprise+Search',
				description: 'Mock renderer alias for the Enterprise Search component.',
				implemented: true,
				aliasFor: 'Enterprise Search'
			},
			Grid: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Grid',
				description: 'Tabular result component with toolbar, sortable columns, row actions and small-screen list-grid rendering.',
				implemented: true,
				renderType: 'ResultGrid'
			},
			'Image Gallery': {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Image+Gallery',
				description: 'Grouped image gallery with small and large tile modes.',
				implemented: true,
				renderType: 'ImageGallery'
			},
			'Inline Document': {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Inline+Document',
				description: 'Document selector and viewer with navigation and a download fallback for unsupported files.',
				implemented: true,
				renderType: 'InlineDocument'
			},
			InlineDocument: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Inline+Document',
				description: 'Mock renderer alias for the Inline Document component.',
				implemented: true,
				aliasFor: 'Inline Document'
			},
			'Linear Process': {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Linear+Process',
				description: 'Linked process steps with captions, status tones and straight or wrapped connectors.',
				implemented: true,
				renderType: 'LinearProcess'
			},
			LinearProcess: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Linear+Process',
				description: 'Mock renderer alias for the Linear Process component.',
				implemented: true,
				aliasFor: 'Linear Process'
			},
			Planner: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Planner',
				description: 'Resource schedule with optional timescale, sidebar filters, unbooked groups and aggregate values.',
				implemented: true,
				renderType: 'Planner'
			},
			Treeview: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Treeview',
				description: 'Hierarchical navigation with expandable branches, leaf links and optional node styling.',
				implemented: true,
				renderType: 'Treeview'
			},
			'Link List': {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Link+List',
				description: 'Compact list of navigable rows with optional group heading, date or label, and unread state.',
				implemented: true,
				renderType: 'LinkList'
			},
			LinkList: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Link+List',
				description: 'Mock renderer alias for the Link List component.',
				implemented: true,
				aliasFor: 'Link List'
			},
			'Pivot Grid': {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Pivot+Grid',
				description: 'Cross-tabulated grid with sortable row and column headings, actions, export and numeric measures.',
				implemented: true,
				renderType: 'PivotGrid'
			},
			PivotGrid: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Pivot+Grid',
				description: 'Mock renderer alias for the Pivot Grid component.',
				implemented: true,
				aliasFor: 'Pivot Grid'
			},
			'PDF Template Editor': {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=PDF+Template+Editor',
				description: 'Visual PDF template editor with draggable available values, formatting tools and a page canvas.',
				implemented: true,
				renderType: 'PdfTemplateEditor'
			},
			PDFTemplateEditor: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=PDF+Template+Editor',
				description: 'Mock renderer alias for the PDF Template Editor component.',
				implemented: true,
				aliasFor: 'PDF Template Editor'
			},
			PdfTemplateEditor: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=PDF+Template+Editor',
				description: 'Mock renderer for the PDF Template Editor component.',
				implemented: true,
				aliasFor: 'PDF Template Editor'
			},
			MenuGroups: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=3',
				description: 'Grouped menu choices displayed in the main content area.',
				implemented: true,
				pattern: true
			},
			NewEdit: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=NewEdit',
				description: 'Form component for creating, updating or duplicating records.',
				implemented: true
			},
			ResultGrid: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Grid',
				description: 'Mock renderer alias for the Grid component.',
				implemented: true,
				aliasFor: 'Grid'
			},
			InfoBoxes: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=4',
				description: 'Structured InfoSQL-style information boxes and status banners shown above or below page content.',
				implemented: true,
				pattern: true
			},
			Multipart: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?Component=Multipart&id=5',
				description: 'Displays multiple menu items as a single page, where each menu item is rendered as a part.',
				implemented: true
			},
			CalendarWeekdays: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Calendar#calendar',
				description: 'Mock renderer for the three visual Calendar modes.',
				implemented: true,
				aliasFor: 'Calendar'
			},
			DetailView: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Detailview',
				description: 'Mock renderer alias for the Detailview component.',
				implemented: true,
				aliasFor: 'Detailview'
			}
		},
		controls: {
			index: 'https://documentation.softadmin.com/softadmin.aspx?id=7',
			items: {
				...makeDictionary(officialControlNames, 7, 'Control'),
				Checkbox: {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Checkbox',
					description: 'Checkbox field for NewEdit forms.',
					implemented: true,
					renderType: 'checkbox'
				},
				Dropdown: {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Dropdown',
					description: 'Dropdown field for NewEdit forms.',
					implemented: true,
					renderType: 'dropdown'
				},
				'Date Range': {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Date+Range',
					description: 'Date range field with from/to inputs and trailing calendar action.',
					implemented: true,
					renderType: 'dateRange'
				},
				'File Upload Area': {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=File+Upload+Area',
					description: 'Drag-and-drop file upload area with uploaded file list.',
					implemented: true,
					renderType: 'fileUploadArea'
				},
				'Radio Cards': {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Radio+Cards',
					description: 'Radio buttons presented as larger cards for important choices.',
					implemented: true,
					renderType: 'radioCards'
				},
				RadioCards: {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Radio+Cards',
					description: 'Mock renderer alias for Radio Cards.',
					implemented: true,
					aliasFor: 'Radio Cards'
				},
				Textarea: {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Textarea',
					description: 'Textarea field for NewEdit forms.',
					implemented: true,
					renderType: 'textarea'
				},
				Textbox: {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Textbox',
					description: 'Textbox field for NewEdit forms.',
					implemented: true,
					renderType: 'textbox'
				},
				'Textbox with Autosearch': {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Textbox+with+Autosearch',
					description: 'Textbox with trailing autosearch action.',
					implemented: true,
					renderType: 'autosearch'
				},
				'Textbox with Autosuggest': {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Textbox+with+Autosuggest',
					description: 'Textbox with autosuggest menu and text-size trailing icon.',
					implemented: true,
					renderType: 'autosuggest'
				},
				'Textbox with Dropdown': {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Textbox+with+Dropdown',
					description: 'Textbox with trailing dropdown action and context menus.',
					implemented: true,
					renderType: 'textboxDropdown'
				},
				'Multi-autosearch': {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Multi-autosearch',
					description: 'Multi-value autosearch control with selected value chips.',
					implemented: true,
					renderType: 'multiAutosearch'
				},
				Multirow: {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Multirow',
					description: 'Repeating row input with column headings, per-row fields, optional aggregate row and a New row button.',
					implemented: true,
					renderType: 'multirow'
				},
				Time: {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Time',
					description: 'Time field with trailing clock action.',
					implemented: true,
					renderType: 'time'
				},
				'Uneditable Text': {
					docs: 'https://documentation.softadmin.com/softadmin.aspx?id=7&Control=Uneditable+Text',
					description: 'Read-only value rendered in a form field slot.',
					implemented: true,
					renderType: 'uneditable'
				}
			}
		}
	};

	function escapeHtml(value) {
		return String(value ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function iconHtml(icon, extraClass) {
		return `<i class="far fa-${escapeHtml(icon || 'cube')} icon saIcon${extraClass ? ` ${escapeHtml(extraClass)}` : ''}"></i>`;
	}

	function favoriteButton() {
		return `
			<div class="saMenuItemTools">
				<button class="saIconWrapper saFavoriteToggle saNoSpinner" type="button" tabindex="-1" aria-checked="false">
					<i class="saIcon far fa-star"></i>
					<i class="saIcon fas fa-star"></i>
				</button>
			</div>`;
	}

	function pillHtml(pill) {
		if (!pill) {
			return '';
		}

		const type = String(pill.type || pill).toLowerCase();
		const text = typeof pill === 'string' ? pill : pill.text;
		return `<span class="saMenuItemPill ${pillClasses[type] || escapeHtml(type)}">${escapeHtml(text || pill)}</span>`;
	}

	function renderMenuItem(item) {
		const classes = [
			'saMenuItemWrapper',
			item.description ? 'saHasDescription' : '',
			item.featured ? 'saFeatured saFeatured4' : '',
			'saSelectable'
		].filter(Boolean).join(' ');
		const iconHolderClass = item.featured ? 'saIconHolder saIconHolderFeatured' : 'saIconHolder';
		const heading = `${escapeHtml(item.title)}${pillHtml(item.pill)}`;
		const text = item.description
			? `<div class="saMenuItemText"><span class="saMenuItemTextHeading">${heading}</span><span class="saMenuItemTextDesc">${escapeHtml(item.description)}</span></div>`
			: `<span class="saMenuItemTextHeading">${heading}</span>`;

		return `
			<li class="${classes}">
				<a class="saMenuItem" tabindex="0">
					<div class="${iconHolderClass}" aria-hidden="true">${iconHtml(item.icon)}</div>
					${text}
				</a>
				${favoriteButton()}
			</li>`;
	}

	function renderMenuGroups(component) {
		return `
			<softadmin-menuitems class="maincolbody saMenuGroup">
				<div class="saMenuBoxWrapper">
					${component.groups.map(group => `
						<div class="saColumn">
							<div class="saMenuBox">
								<span class="saMenuBoxHeading">${escapeHtml(group.heading)}</span>
								<ul>${group.items.map(renderMenuItem).join('')}</ul>
							</div>
						</div>`).join('')}
				</div>
			</softadmin-menuitems>`;
	}

	function renderLinkListItem(item) {
		const label = item.date || item.label;
		return `
			<li class="saMenuItemWrapper${item.unread ? ' saUnread' : ''}">
				<a class="saMenuItem" tabindex="0">
					${label ? `<span class="saLinkListRowLabel">${escapeHtml(label)}</span>` : ''}
					<div class="saLinkListRowHeading"><span>${escapeHtml(item.title)}</span></div>
				</a>
			</li>`;
	}

	function renderLinkListGroup(group) {
		const items = group.items || [];
		const hasUnread = items.some(item => item.unread);
		return `
			<div class="saMenuBox${hasUnread ? ' saHasUnread' : ''}">
				${group.heading ? `<h2 class="saMenuBoxHeading">${escapeHtml(group.heading)}</h2>` : ''}
				<ul>${items.map(renderLinkListItem).join('')}</ul>
			</div>`;
	}

	function renderLinkList(component) {
		return `
			<softadmin-linklist class="maincolbody linklist saMenuItemRoot">
				<div class="saMenuBoxWrapper saLinkList">
					<div class="saColumn">${(component.groups || []).map(renderLinkListGroup).join('')}</div>
				</div>
			</softadmin-linklist>`;
	}

	function pivotSortIcon(item) {
		if (!item.sorted) {
			return '';
		}

		const direction = item.sortDirection === 'desc' ? 'down' : 'up';
		return `<i class="saIcon saSortIcon fas fa-caret-${direction}"></i>`;
	}

	function renderPivotColumnActions() {
		return `
			<div class="saLinkButtonWrapper">
				<button class="saLinkButton" type="button" title="Fields"><i class="far fa-heat icon saIcon"></i></button>
				<button class="saLinkButton" type="button" title="Inspect"><i class="far fa-binoculars icon saIcon"></i></button>
				<button class="saLinkButton saMoreButtonJs" type="button"><i class="saIcon far fa-ellipsis-vertical"></i></button>
			</div>`;
	}

	function actionIdentifier(action, index) {
		return String(action.key || action.label || index);
	}

	function isRowActionDisabled(action, index, row) {
		const disabledActions = new Set((row.disabledActions || []).map(String));
		return Boolean(action.inactive || disabledActions.has(actionIdentifier(action, index)) || disabledActions.has(String(index)));
	}

	function renderPivotRowActions(actions, row) {
		return `<div class="saLinkButtonWrapper">${actions.map((action, index) => {
			const disabled = isRowActionDisabled(action, index, row);
			const moreClass = action.icon === 'ellipsis-vertical' ? ' saMoreButtonJs' : '';
			return `<button class="saLinkButton${moreClass}${disabled ? ' saInactive' : ''}" type="button" title="${escapeHtml(action.label)}"${disabled ? ' disabled' : ''}><i class="${escapeHtml(action.iconStyle || 'far')} fa-${escapeHtml(action.icon || 'chart-line')} icon saIcon"></i></button>`;
		}).join('')}</div>`;
	}

	function renderPivotGrid(component) {
		const columns = component.columns || [];
		const rowActions = component.rowActions?.length ? component.rowActions : [{ key: 'open', label: 'Open', icon: 'chart-line' }];
		const showColumnActions = component.columnActions !== false;
		const wrapperClasses = `saPivotGridWrapper${showColumnActions ? ' saMultipleColumnButtons' : ''} stickyheader`;
		const columnHeadings = columns.map(column => `
			<th class="saPivotGridHeading">
				<div class="saPivotGridHeadingInner">
					${showColumnActions ? renderPivotColumnActions() : ''}
					<a class="sortableJs${column.sorted ? ' saSorted' : ''}" tabindex="0"><span>${escapeHtml(column.label || column.key)}</span>${pivotSortIcon(column)}</a>
				</div>
			</th>`).join('');
		const bodyRows = (component.rows || []).map(row => {
			const clickable = new Set(row.clickable || []);
			const cells = columns.map(column => {
				const value = row.values?.[column.key] ?? '';
				const numeric = column.numeric !== false && (column.numeric === true || typeof value === 'number');
				const cellClasses = `saPivotGridCellJs${clickable.has(column.key) ? ' saClickable' : ''}${numeric ? ' right' : ''}`;
				return `<td class="${cellClasses}"><span>${escapeHtml(value)}</span></td>`;
			}).join('');

			return `
				<tr>
					<th class="saPivotGridHeading">
						<div class="saPivotGridHeadingInner">
							${renderPivotRowActions(rowActions, row)}
							<a class="sortableJs${row.sorted ? ' saSorted' : ''}" tabindex="0"><span>${escapeHtml(row.label)}</span>${pivotSortIcon(row)}</a>
						</div>
					</th>
					${cells}
				</tr>`;
		}).join('');

		return `
			<softadmin-pivotgrid class="pivotgrid saMenuItemRoot">
				<div class="${wrapperClasses}">
					<table class="saPivotGrid">
						<caption>${escapeHtml(component.caption || 'Pivot grid')}</caption>
						<thead><tr>
							<th class="saPivotGridHeading saPivotGridFiller"><div class="saTopLeftCell">${component.exportable === false ? '' : '<button class="saPivotGridTopButton saNoSpinner saExcel" type="button" title="Open in Excel"><i class="saIcon far fa-file-excel"></i></button>'}</div></th>
							${columnHeadings}
						</tr></thead>
						<tbody>${bodyRows}</tbody>
					</table>
				</div>
			</softadmin-pivotgrid>`;
	}

	const galleryFallbackImages = [
		'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
		'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
		'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
		'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
	];

	function galleryImageUrl(value, index) {
		const url = String(value || '');
		return /^(https?:\/\/|\.\/|\.\.\/)/i.test(url) ? url : galleryFallbackImages[index % galleryFallbackImages.length];
	}

	function renderGalleryItem(item, index) {
		const caption = item.caption || item.alt || `Image ${index + 1}`;
		return `
			<li class="saGalleryItem saGalleryItemJs" tabindex="0">
				<div class="saGalleryItemImg"><img src="${escapeHtml(galleryImageUrl(item.src, index))}" alt="${escapeHtml(item.alt || caption)}"></div>
				<div class="saGalleryItemBody">
					<span class="saGalleryItemCaption">${escapeHtml(caption)}</span>
					${item.description ? `<span class="saGalleryItemDescription">${escapeHtml(item.description)}</span>` : ''}
				</div>
			</li>`;
	}

	function renderGalleryGroup(group, groupIndex) {
		const items = group.items || [];
		const isOpen = group.open !== false;
		return `
			<div class="saGalleryGroup">
				<button class="saHeadingButton${isOpen ? ' saOpen' : ''}" type="button" aria-expanded="${isOpen}">
					<h2>${escapeHtml(group.heading || `Group ${groupIndex + 1}`)}</h2>
					<div class="saBadgeCount">${escapeHtml(group.count ?? items.length)}</div>
					<i class="saIcon far fa-angle-down"></i>
				</button>
				<ul${isOpen ? '' : ' hidden'}>${items.map(renderGalleryItem).join('')}</ul>
			</div>`;
	}

	function renderImageGallery(component) {
		const isSmall = component.size === 'small';
		const fitClass = component.fit === 'contain' ? 'saGalleryContain' : 'saGalleryCover';
		return `
			<softadmin-imagegallery class="saMenuItemRoot">
				<div class="saGalleryWrapper ${isSmall ? 'saColumnsSmall' : 'saColumnsLarge'}">
					<div class="saGalleryToolbarWrapper">
						<div class="saGalleryToolbar">
							<fieldset class="saToggleGrid">
								<legend class="saScreenReaderOnly">Change image size</legend>
								<label${isSmall ? ' class="saSelected"' : ''}><input type="radio" name="gallery-size" value="small"${isSmall ? ' checked' : ''}><i class="saIcon fas fa-grid-3"></i></label>
								<label${isSmall ? '' : ' class="saSelected"'}><input type="radio" name="gallery-size" value="large"${isSmall ? '' : ' checked'}><i class="saIcon fas fa-grid-2"></i></label>
							</fieldset>
						</div>
					</div>
					<div class="saGallery ${fitClass}">${(component.groups || []).map(renderGalleryGroup).join('')}</div>
				</div>
			</softadmin-imagegallery>`;
	}

	function safeDocumentUrl(value) {
		const url = String(value || '').trim();
		return /^(?:javascript|vbscript):/i.test(url) ? '#' : url || '#';
	}

	function documentIcon(document) {
		if (document.icon) {
			return document.icon;
		}

		const extension = String(document.name || document.src || '').split('.').pop().toLowerCase();
		return {
			doc: 'file-word',
			docx: 'file-word',
			html: 'code',
			pdf: 'file-pdf',
			ppt: 'file-powerpoint',
			pptx: 'file-powerpoint',
			xls: 'file-excel',
			xlsx: 'file-excel',
			zip: 'file-zipper'
		}[extension] || 'file';
	}

	function renderInlineDocument(component) {
		const documents = component.documents || [];
		const selectedIndex = Math.round(finiteNumber(component.selectedIndex, 0, 0, Math.max(0, documents.length - 1)));
		const selected = documents[selectedIndex] || { name: 'Document', src: '#', previewable: false };
		const source = safeDocumentUrl(selected.src);
		const options = documents.map((document, index) => `<option value="${index}"${index === selectedIndex ? ' selected' : ''}>${escapeHtml(document.name || `Document ${index + 1}`)}</option>`).join('');
		const viewer = selected.previewable
			? `<iframe class="saInlineFrame" src="${escapeHtml(source)}" title="${escapeHtml(selected.name || 'Document')}"></iframe>`
			: `
				<a class="saInlineDownload" download href="${escapeHtml(source)}">
					<i class="far saIcon fa-${escapeHtml(documentIcon(selected))}"></i>
					<div class="saInlineDownloadHeading">${escapeHtml(selected.name || 'Document')}</div>
					<div class="saInlineDownloadDescription">${escapeHtml(selected.description || "This document can't be viewed inline, but you can download it and open it anytime.")}</div>
					<div class="saInlineDownloadButton"><i class="far fa-arrow-down-to-bracket"></i><div>${escapeHtml(component.downloadLabel || 'Download')}</div></div>
				</a>`;

		return `
			<softadmin-inlinedocument class="saInlineDocumentWrapper saMenuItemRoot">
				<div class="saInlineHeader">
					<label class="saInputTextWrapper saLabeled">
						<span class="saLabeledLabel">${escapeHtml(component.label || 'Document')}</span>
						<select class="saInputText saDropdown">${options}</select>
						<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
					</label>
					<div class="saInlineButtonGroup">
						<button type="button" title="Previous document"${selectedIndex === 0 ? ' disabled' : ''}><i class="saIcon fa-caret-up fas"></i></button>
						<button type="button" title="Next document"${selectedIndex >= documents.length - 1 ? ' disabled' : ''}><i class="saIcon fa-caret-down fas"></i></button>
					</div>
				</div>
				<div class="saViewWrapper" style="height: calc(-148px + 100vh);">${viewer}</div>
			</softadmin-inlinedocument>`;
	}

	const linearProcessTones = {
		neutral: { background: 'rgb(233, 237, 242)', accent: 'rgb(80, 96, 114)' },
		primary: { background: 'rgb(218, 234, 255)', accent: 'rgb(22, 104, 224)' },
		success: { background: 'rgb(220, 245, 228)', accent: 'rgb(8, 120, 62)' },
		warning: { background: 'rgb(255, 244, 214)', accent: 'rgb(138, 91, 0)' }
	};

	function renderLinearProcess(component) {
		const steps = component.steps || [];
		const size = ['short', 'medium', 'long'].includes(component.size) ? component.size : 'medium';
		const wrapped = component.wrapped === true;
		const wrapAfter = steps.length > 1
			? Math.round(finiteNumber(component.wrapAfter, Math.ceil(steps.length / 2), 1, steps.length - 1))
			: 0;
		const renderedSteps = steps.map((step, index) => {
			const tone = linearProcessTones[step.tone] || linearProcessTones.primary;
			const wrapsAfter = wrapped && index === wrapAfter - 1;
			const wrapsBefore = wrapped && index === wrapAfter;
			const stepTag = step.link ? 'a' : 'div';
			const beforeConnector = index > 0
				? `<i class="saIcon saStepBetween saStepBefore" style="height: 4.7rem;${wrapsBefore ? '' : ' display: none;'}"></i>`
				: '';
			const afterConnector = index < steps.length - 1
				? `<i class="saIcon saStepBetween saStepAfter" style="height: 4.7rem;${wrapsAfter ? '' : ' display: none;'}"></i>`
				: '';
			const betweenArrow = index < steps.length - 1
				? `<i class="saIcon far fa-arrow-right saStepBetween saStepBetweenArrow" style="height: 4.7rem; visibility: ${wrapsAfter ? 'hidden' : 'visible'};"></i>`
				: '';

			return `
				<div class="saStepOuter ${size}">
					<div class="saStepWrapper ${size}">
						<${stepTag} class="saStep${step.link ? ' saHasLink' : ''}"${step.link ? ' tabindex="0"' : ''} style="min-height: 4.8rem;">
							<div class="saStepInnerWrapper" style="background-color: ${tone.background};">
								<div class="saStepInner">
									<div class="saStepLine" style="background-color: ${tone.accent};"></div>
									<div class="saStepTextWrapper" style="color: ${tone.accent};">
										<span class="saStepHeading">${escapeHtml(step.heading)}</span>
										${step.body ? `<span class="saStepBody">${escapeHtml(step.body)}</span>` : ''}
									</div>
								</div>
							</div>
						</${stepTag}>
						${step.caption ? `<div class="saStepCaption ${size}">${escapeHtml(step.caption)}</div>` : ''}
						${beforeConnector}${afterConnector}
					</div>
					${betweenArrow}
				</div>`;
		}).join('');

		return `
			<softadmin-linearprocess class="maincolbody saMenuItemRoot">
				<div class="saLinearProcess${wrapped ? ' saHasWrapped' : ''}">${renderedSteps}</div>
			</softadmin-linearprocess>`;
	}

	const plannerTones = {
		neutral: { background: '#dce2ea', color: '#243143' },
		primary: { background: '#2d6ce1', color: '#ffffff' },
		success: { background: '#0b9f62', color: '#ffffff' },
		warning: { background: '#ffdc5d', color: '#513700' },
		danger: { background: '#e6535f', color: '#ffffff' },
		purple: { background: '#8055c9', color: '#ffffff' }
	};

	function plannerTone(activity) {
		return plannerTones[activity.tone] || plannerTones.primary;
	}

	function renderPlannerActivity(activity, width, flow) {
		const tone = plannerTone(activity);
		const description = activity.description ? `<span class="saActivityDescription saIgnoreOnDropJs">${escapeHtml(activity.description)}</span>` : '';
		const position = flow ? 'position: relative; display: inline-flex; margin: 2px;' : 'position: absolute; left: 1px; top: 1px;';
		return `
			<div class="saActivity saIgnoreOnDropJs saCanDrag${activity.link ? ' saHasLinks' : ''} saDynamicWidthJs saLight" style="${position} height: calc(-5px + 4.025rem); background-color: ${tone.background}; color: ${tone.color}; width: ${Math.max(20, width - 4)}px; min-width: ${Math.max(20, width - 4)}px;">
				<div class="saActivityInner saIgnoreOnDropJs">
					<div class="saActivityHeadingWrapper saIgnoreOnDropJs"><span class="saBoxIcons"></span><span class="saActivityHeading saIgnoreOnDropJs">${escapeHtml(activity.title || 'Activity')}</span></div>
					${description}
				</div>
			</div>`;
	}

	function renderPlannerHeader(component) {
		const period = component.period || 'Week';
		const year = Math.round(finiteNumber(component.year, new Date().getFullYear(), 2000, 2100));
		const periodNumber = Math.round(finiteNumber(component.periodNumber, 35, 1, 366));
		const width = ['narrow', 'medium', 'wide'].includes(component.columnWidth) ? component.columnWidth : 'medium';
		return `
			<div class="saCalendarHeader">
				<div class="saCalendarHeaderInner">
					<h2 class="saCalendarHeading">${escapeHtml(component.heading || component.periodLabel || `${period} ${periodNumber} ${year}`)}</h2>
					<div class="saPeriodButtons">
						<button type="button" title="Previous period"><i class="saIcon far fa-angle-left"></i></button>
						<button type="button" title="Next period"><i class="saIcon far fa-angle-right"></i></button>
					</div>
					<label class="saInputTextWrapper saLabeled">
						<span class="saLabeledLabel">Period</span>
						<select class="saInputText saDropdown">${['Day', 'Work week', 'Week', 'Month'].map(option => `<option${option === period ? ' selected' : ''}>${option}</option>`).join('')}</select>
						<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
					</label>
					<label class="saInputTextWrapper saLabeled shortest"><span class="saLabeledLabel">${escapeHtml(component.periodNumberLabel || (period === 'Week' ? 'Week' : 'Day'))}</span><input class="saInputText" type="number" value="${periodNumber}"></label>
					<label class="saInputTextWrapper saLabeled shortest"><span class="saLabeledLabel">Year</span><input class="saInputText" type="number" value="${year}"></label>
					<button class="saTodayButton" type="button">Today</button>
					<div class="saToggleGroup">
						${[['narrow', 'fa-grid-4'], ['medium', 'fa-grid-3'], ['wide', 'fa-grid-2']].map(([value, icon]) => `<label title="${value}"><input type="radio" name="planner-width"${value === width ? ' checked' : ''}><i class="${icon} saIcon fas"></i></label>`).join('')}
					</div>
				</div>
			</div>`;
	}

	function renderPlannerMiniCalendar(component) {
		const dates = [27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
		const rows = Array.from({ length: 5 }, (_, row) => `
			<div class="saDateRow"><div class="saWeekNr">${34 + row}</div>${dates.slice(row * 7, row * 7 + 7).map((date, index) => `<div class="saDate saDateElement${row === 1 && index < 5 ? ' saMarked' : ''}${row === 1 && index === 2 ? ' saToday' : ''}">${date}</div>`).join('')}</div>`).join('');
		return `
			<div class="saCalendarSidebar${component.sidebarOpen === false ? ' saClosed' : ''}">
				<div class="saCalendarSidebarInner">
					<div class="saCalendarSidebarSection saSidebarCalendar">
						<div class="saDatePicker saDatePickerRoot saManyWeeks">
							<div class="saDatePickerMonthHeading"><span class="saCalendarSidebarHeading">${escapeHtml(component.monthLabel || 'August 2026')}</span><div class="saMonthBrowser"><button type="button"><i class="saIcon far fa-angle-left"></i></button><button type="button"><i class="saIcon far fa-angle-right"></i></button></div></div>
							<div class="saDayRow"><div class="saWeekNr saEmpty"></div>${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => `<div class="saDay">${day}</div>`).join('')}</div>
							${rows}
						</div>
					</div>
					<div class="saCalendarSidebarSection saSidebarFilters">${(component.filters || []).map(filter => `
						<label class="saInputTextWrapper saLabeled"><span class="saLabeledLabel">${escapeHtml(filter.label)}</span><select class="saInputText saDropdown">${(filter.options || [filter.value]).map(option => `<option${option === filter.value ? ' selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select><div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div></label>`).join('')}</div>
				</div>
			</div>`;
	}

	function renderPlannerSticky(component, dayWidth, showAggregate) {
		const days = component.days || [];
		return `
			<div class="saStickyTop">
				<div class="saWeek">
					<div class="saRowSticky"><div class="saPlannerCell saDateRowHeading"><button type="button" class="saIcon far fa-angles-left saCalendarSidebarExpander" title="Collapse sidebar"></button></div>${showAggregate ? '<div class="saPlannerAggregateCell"></div>' : ''}</div>
					${days.map(day => `<div class="saWeekDay saDynamicWidthJs${day.today ? ' saDateIsToday' : ''}${day.redDay ? ' saRedDay' : ''}" style="width: ${dayWidth}px; min-width: ${dayWidth}px;">${escapeHtml(day.label)}<span class="saDateNumber">${escapeHtml(day.date || '')}</span></div>`).join('')}
				</div>
				<div class="saWeek saWeekExtra">
					<div class="saRowSticky"><div class="saPlannerCell"></div>${showAggregate ? '<div class="saPlannerAggregateCell"></div>' : ''}</div>
					${days.map(day => `<div class="saWeekExtraInner saDynamicWidthJs" style="width: ${dayWidth}px; min-width: ${dayWidth}px;">${(day.allDay || []).map(item => renderPlannerActivity(item, dayWidth)).join('')}</div>`).join('')}
				</div>
			</div>`;
	}

	function renderPlannerUnbooked(component, showAggregate) {
		return (component.unbookedGroups || []).map(group => `
			<div class="saUnbookedWrapper">
				<div class="saWeek saUnbooked saUnbookedRow${group.expanded === false ? ' saClosed' : ''}">
					<div class="saRowSticky"><div class="saPlannerCell"><div class="saPlannerCellInner"><div class="saPlannerCellHeading">${escapeHtml(group.heading || 'Unbooked items')}</div></div></div>${showAggregate ? '<div class="saPlannerAggregateCell"><button class="saExpandButton" type="button"><i class="saIcon far fa-angle-down"></i></button></div>' : ''}</div>
					<div class="saUnbookedItems saPlannerCell">${group.expanded === false ? '' : (group.items || []).map(item => renderPlannerActivity(item, 150, true)).join('')}</div>
					<div class="saPlannerCell saCounterCell">${(group.items || []).length}</div>
				</div>
			</div>`).join('');
	}

	function renderPlannerResource(component, resource, dayWidth, showAggregate) {
		const days = component.days || [];
		const rowHeading = `<div class="saRowSticky"><div class="saPlannerCell saResourceHeadingCell"><span class="saPlannerCellHeading">${escapeHtml(resource.label || 'Resource')}</span>${resource.description ? `<span class="saPlannerCellDescription">${escapeHtml(resource.description)}</span>` : ''}</div>${showAggregate ? `<div class="saPlannerAggregateCell"><span>${escapeHtml(resource.aggregate ?? '')}</span></div>` : ''}</div>`;
		if (!component.timescale) {
			return `<div class="saWeek">${rowHeading}${days.map(day => {
				const activities = (resource.activities || []).filter(activity => activity.day === day.key);
				return `<div class="saPlannerCell saBookedCellJs saDynamicWidthJs" style="width: ${dayWidth}px; min-width: ${dayWidth}px;"><div class="saPlannerHoverTarget"></div>${activities.map(activity => renderPlannerActivity(activity, dayWidth)).join('')}</div>`;
			}).join('')}</div>`;
		}

		const startHour = finiteNumber(component.startHour, 8, 0, 23);
		const endHour = finiteNumber(component.endHour, 18, startHour + 1, 24);
		const step = finiteNumber(component.hourStep, 2, 0.5, 6);
		const slotCount = Math.max(1, Math.ceil((endHour - startHour) / step));
		const slotWidth = dayWidth / slotCount;
		const cells = days.flatMap(day => Array.from({ length: slotCount }, (_, slotIndex) => {
			const slotStart = startHour + slotIndex * step;
			const activity = (resource.activities || []).find(item => item.day === day.key && finiteNumber(item.start, startHour, 0, 24) >= slotStart && finiteNumber(item.start, startHour, 0, 24) < slotStart + step);
			const duration = activity ? Math.max(step, finiteNumber(activity.end, slotStart + step, slotStart + step, 24) - finiteNumber(activity.start, slotStart, 0, 24)) : step;
			return `<div class="saPlannerCell saTimeCell saBookedCellJs saDynamicWidthJs${slotIndex === slotCount - 1 ? ' saLastCellInBlock' : ''}" style="width: ${slotWidth}px; min-width: ${slotWidth}px;"><div class="saPlannerHoverTarget"></div>${activity ? renderPlannerActivity(activity, Math.min(dayWidth, slotWidth * (duration / step))) : ''}</div>`;
		})).join('');
		return `<div class="saWeek">${rowHeading}${cells}</div>`;
	}

	function renderPlannerTimeScale(component, dayWidth, showAggregate) {
		if (!component.timescale) return '';
		const startHour = finiteNumber(component.startHour, 8, 0, 23);
		const endHour = finiteNumber(component.endHour, 18, startHour + 1, 24);
		const step = finiteNumber(component.hourStep, 2, 0.5, 6);
		const slots = Array.from({ length: Math.max(1, Math.ceil((endHour - startHour) / step)) }, (_, index) => startHour + index * step);
		const slotWidth = dayWidth / slots.length;
		return `<div class="saWeek saPlannerTimeHeading"><div class="saRowSticky"><div class="saPlannerCell"></div>${showAggregate ? '<div class="saPlannerAggregateCell"></div>' : ''}</div>${(component.days || []).flatMap(() => slots.map((hour, index) => `<div class="saPlannerCell saTimeCell saDynamicWidthJs${index === slots.length - 1 ? ' saLastCellInBlock' : ''}" style="width: ${slotWidth}px; min-width: ${slotWidth}px;"><span>${String(Math.floor(hour)).padStart(2, '0')}</span></div>`)).join('')}</div>`;
	}

	function renderPlanner(component) {
		const width = ['narrow', 'medium', 'wide'].includes(component.columnWidth) ? component.columnWidth : 'medium';
		const dayWidth = component.timescale ? { narrow: 160, medium: 240, wide: 320 }[width] : { narrow: 144, medium: 192, wide: 240 }[width];
		const showAggregate = component.timescale || (component.resources || []).some(resource => resource.aggregate !== undefined);
		const classes = ['saCalendarSection', 'saDesktopCalendar', 'saResourceCalendar', 'saPlanner'];
		if (component.timescale) classes.push('saShowTime');
		if (width === 'narrow') classes.push('saNarrow');
		if (component.timescale && finiteNumber(component.hourStep, 2, 0.5, 6) > 1) classes.push('saSkipHours');
		return `
			<softadmin-planner class="saMenuItemRoot">
				<div class="${classes.join(' ')}">
					${renderPlannerHeader(component)}
					<div class="saCalendarSectionInner">
						${renderPlannerMiniCalendar(component)}
						<div class="saCalendar">
							${renderPlannerSticky(component, dayWidth, showAggregate)}
							${renderPlannerTimeScale(component, dayWidth, showAggregate)}
							${renderPlannerUnbooked(component, showAggregate)}
							${(component.resources || []).map(resource => renderPlannerResource(component, resource, dayWidth, showAggregate)).join('')}
						</div>
					</div>
				</div>
			</softadmin-planner>`;
	}

	const treeviewTones = {
		neutral: '#4f6072',
		primary: '#1768d9',
		success: '#087743',
		warning: '#8a5b00',
		danger: '#bd2633'
	};

	function renderTreeNode(node, depth) {
		const children = Array.isArray(node.children) ? node.children : [];
		const hasChildren = children.length > 0;
		const expanded = hasChildren && node.expanded !== false;
		const tone = treeviewTones[node.tone];
		const label = node.hidden ? `<i>${escapeHtml(node.label || 'Node')}</i>` : escapeHtml(node.label || 'Node');
		const content = node.link === false
			? label
			: `<a class="saNodeLinkJs" tabindex="0">${label}</a>`;
		const childList = hasChildren
			? `<ul${expanded ? '' : ' style="display: none;"'}>${children.map(child => renderTreeNode(child, depth + 1)).join('')}</ul>`
			: '';
		return `
			<li class="saNode">
				<label class="saNodeContent${hasChildren ? ' saNodeExpand' : ''} saCanNotDropFile">
					<div class="saExpandIconDiv"><input class="saExpander${expanded ? ' saMinus' : ''}" type="checkbox"${expanded ? ' checked' : ''}${hasChildren ? '' : ' disabled'}></div>
					${node.icon ? `<button class="saTreeViewButton" type="button">${iconHtml(node.icon)}</button>` : ''}
					<span${tone ? ` class="saCustomColor" style="color: ${tone};"` : ''}>${depth === 0 && node.bold !== false ? `<b>${content}</b>` : content}</span>
				</label>
				${childList}
			</li>`;
	}

	function renderTreeview(component) {
		return `
			<softadmin-treeview class="maincolbody saMenuItemRoot saTreeViewWrapper">
				<ul class="saTreeView saRoot">${(component.nodes || []).map(node => renderTreeNode(node, 0)).join('')}</ul>
			</softadmin-treeview>`;
	}

	function renderBankId(component) {
		const progress = finiteNumber(component.progress, 92, 0, 100);
		const heading = component.heading || 'Sign with BankID';
		const message = component.message || 'Open the BankID app and scan the QR code.';
		const countdown = component.countdown || '5 minutes left';

		return `
			<softadmin-bankid class="saBankIdWrapper saMenuItemRoot">
				<div class="saBankId" tabindex="-1">
					<div class="saBankIdBody">
						<div class="saBankIdHeader">
							<img class="saBankIdLogo" src="./Presentation/img/bankid.svg" alt="BankID">
							<h2>${escapeHtml(heading)}</h2>
							<span class="saStatusMessage" aria-live="polite">${escapeHtml(message)}</span>
						</div>
						<div class="saQrWrapper">
							<img class="saQr saPixelated" alt="QR" src="./Presentation/img/bankid-qr-placeholder.png">
							<div class="saQrCountdown">
								<progress max="100" value="${progress}"></progress>
								<div class="saQrCountdownText">${escapeHtml(countdown)}</div>
							</div>
							<div class="saScreenReaderOnly" aria-live="polite">${escapeHtml(countdown)}</div>
						</div>
					</div>
					<div class="saBankIdFooter">
						<button class="saButtonSecondary saButton" type="button"><i class="saBankIdLogo"></i><span>${escapeHtml(component.deviceButtonLabel || 'Use BankID on this device')}</span></button>
						<button class="saButtonGhost saButton" type="button">${escapeHtml(component.cancelLabel || 'Cancel')}</button>
					</div>
				</div>
			</softadmin-bankid>`;
	}

	function renderChatText(message) {
		const paragraphs = Array.isArray(message.paragraphs) ? message.paragraphs : [message.text || ''];
		return paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('');
	}

	function renderChatMessage(message) {
		if (message.role === 'assistant') {
			return `
				<li class="saChatAiResponse">
					<article><div class="saChatAiMessageBody" tabindex="0"><div class="saChatMessageContent saMarkDownContent">${renderChatText(message)}</div></div></article>
				</li>`;
		}

		const systemClass = message.role === 'system' ? ' saChatSystem' : ' saChatSender';
		return `
			<li class="saChatMessage${systemClass}">
				<article class="saChatMessageInner">
					<div class="saChatMessageBody" tabindex="0">${renderChatText(message)}</div>
					${message.time ? `<footer class="saChatMessageFooter"><time class="saChatMessageTime">${escapeHtml(message.time)}</time></footer>` : ''}
				</article>
			</li>`;
	}

	function renderChatLog(messages, defaultDate) {
		let previousDate = null;
		return messages.map((message, index) => {
			const date = message.date || (index === 0 ? defaultDate : previousDate);
			const dateRow = date && date !== previousDate
				? `<li class="saChatDate"><time>${escapeHtml(date)}</time></li>`
				: '';
			previousDate = date;
			return `${dateRow}${renderChatMessage(message)}`;
		}).join('');
	}

	function renderChat(component) {
		const messages = component.messages || [];
		const composerValue = component.composerValue || '';
		const isEmpty = !composerValue;

		return `
			<softadmin-chat class="saMenuItemRoot">
				<div class="saChatWrapper" style="min-height: calc(100dvh - 145px);">
					<div class="saChat">
						<button class="saLoadMessagesButton${component.loadEarlier ? '' : ' saHidden'}" type="button">${escapeHtml(component.loadEarlierLabel || 'Show earlier messages')}</button>
						<ol class="saChatLog">${renderChatLog(messages, component.dateLabel || 'Today')}</ol>
					</div>
					<div class="saChatComposerWrapper">
						<button class="saChatLatest saReached" type="button" tabindex="-1"><i class="far fa-arrow-down saIcon"></i></button>
						<div class="saChatComposer">
							<div class="saChatTextarea${isEmpty ? ' saEmpty' : ''}" contenteditable="plaintext-only" role="textbox" aria-multiline="true" data-placeholder="${escapeHtml(component.placeholder || 'Write a message...')}">${escapeHtml(composerValue)}</div>
							<button class="saChatButtonSend" type="button"${isEmpty ? ' disabled' : ''}><i class="far fa-arrow-up saIcon"></i></button>
						</div>
						<p class="saChatComposerInstruction">${escapeHtml(component.instruction || 'AI-generated content may be incorrect')}</p>
					</div>
				</div>
			</softadmin-chat>`;
	}

	function finiteNumber(value, fallback, minimum, maximum) {
		const number = Number(value);
		return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
	}

	function renderPdfAvailableValue(value) {
		const classes = [
			'saAvailableValue',
			value.placed ? 'saPlaced' : '',
			value.selected ? 'saMarked' : '',
			value.disabled ? 'saDisabled' : ''
		].filter(Boolean).join(' ');

		return `
			<li class="${classes}">
				<div class="saAvailableValueLabel">
					<i class="saIcon saDragHandle far fa-grip-dots-vertical"></i>
					${value.kind === 'image' ? '<i class="saIcon far fa-image"></i>' : ''}
					<label>${escapeHtml(value.label)}</label>
				</div>
				<div class="saIconsWrapper">
					${value.info ? '<i class="saIcon saInfoIcon far fa-circle-info"></i>' : ''}
					<i class="saIcon saCheckMark far fa-check"></i>
				</div>
			</li>`;
	}

	function renderPdfValueGroup(group) {
		return `
			<div class="saAvailableValuesGroupWrapper">
				${group.heading ? `<div class="saAvailableValuesGroupName">${escapeHtml(group.heading)}</div>` : ''}
				<ul class="saAvailableValuesGroup">${(group.values || []).map(renderPdfAvailableValue).join('')}</ul>
			</div>`;
	}

	function renderPdfPlaceholder(placeholder, index) {
		const left = finiteNumber(placeholder.x, 96 + index * 32, 0, 560);
		const top = finiteNumber(placeholder.y, 80 + index * 54, 0, 740);
		const fontSize = finiteNumber(placeholder.fontSize, 18, 8, 72);
		const classes = `saPlaceholder${placeholder.selected ? ' saSelected' : ''}`;
		const valueClasses = `saPlaceholderValue${placeholder.width ? '' : ' saNoWidth'}${placeholder.kind === 'image' ? ' saImagePlaceholder' : ''}`;
		const value = placeholder.kind === 'image'
			? '<i class="saIcon far fa-image"></i>'
			: escapeHtml(placeholder.value || placeholder.label);

		return `
			<div class="${classes}" style="left: ${left}px; top: ${top}px;">
				<span class="saPlaceholderTitle">${escapeHtml(placeholder.label)}</span>
				<div class="saPlaceholderValueWrapper">
					<span class="${valueClasses}" style="font-size: ${fontSize}px;">${value}</span>
				</div>
			</div>`;
	}

	function pdfToolbarButton(icon, tooltip, disabled = false, destructive = false) {
		return `<li><button class="saToolbarButton${destructive ? ' saDestructive' : ''}" type="button" data-tooltip="${escapeHtml(tooltip)}"${disabled ? ' disabled' : ''}><i class="saIcon far fa-${escapeHtml(icon)}"></i></button></li>`;
	}

	function renderPdfTemplateEditor(component) {
		const groups = component.groups || [];
		const placeholders = component.placeholders || [];
		const selected = placeholders.find(placeholder => placeholder.selected) || placeholders[0] || {};
		const currentPage = finiteNumber(component.page?.current, 1, 1, 999);
		const pageCount = finiteNumber(component.page?.count, currentPage, currentPage, 999);
		const x = finiteNumber(selected.x, 0, 0, 560);
		const y = finiteNumber(selected.y, 0, 0, 740);
		const fontSize = finiteNumber(selected.fontSize, 18, 8, 72);
		const font = selected.font || component.font || 'Roboto';

		return `
			<softadmin-pdftemplateeditor class="saMenuItemRoot saPdfTemplateEditor" style="height: calc(100dvh - 113px);">
				<aside class="saPdfTemplateEditorSidebar">
					<span class="saLastSavedText">${escapeHtml(component.lastSaved || '')}</span>
					<div class="saAvailableValuesWrapper">${groups.map(renderPdfValueGroup).join('')}</div>
					<div class="saPdfPagination">
						<button class="saPageButton" type="button" data-tooltip="Previous page"${currentPage <= 1 ? ' disabled' : ''}><i class="saIcon far fa-arrow-left"></i></button>
						<span>${currentPage}/${pageCount}</span>
						<button class="saPageButton" type="button" data-tooltip="Next page"${currentPage >= pageCount ? ' disabled' : ''}><i class="saIcon far fa-arrow-right"></i></button>
					</div>
				</aside>
				<div class="saPdfTemplate">
					<div class="saPdfTemplateToolbarWrapper">
						<div class="saPdfTemplateToolbar">
							<div class="saPdfTemplateToolbarGroup">
								<ul class="saInputPair">
									<li><label class="saInputTextWrapper saLabeled"><span class="saLabeledLabel">X</span><input class="saInputText" type="number" value="${x}"></label></li>
									<li><label class="saInputTextWrapper saLabeled"><span class="saLabeledLabel">Y</span><input class="saInputText" type="number" value="${y}"></label></li>
								</ul>
								<ul class="saInputPair saHideBorder">
									<li><label class="saInputTextWrapper saLabeled"><span class="saLabeledLabel">Font</span><select class="saInputText saDropdown"><option>${escapeHtml(font)}</option></select><div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div></label></li>
									<li><div class="saNumberStepper"><button class="saDecreaseButton" type="button"><i class="saIcon far fa-minus"></i></button><input class="saInputText saNumberStepper" type="number" value="${fontSize}"><button class="saIncreaseButton" type="button"><i class="saIcon far fa-plus"></i></button></div></li>
								</ul>
							</div>
							<div class="saPdfTemplateToolbarGroup">
								<ul class="saPdfTemplateToolbarAlign">
									${pdfToolbarButton('objects-align-left', 'Align objects left')}
									${pdfToolbarButton('objects-align-center-horizontal', 'Center objects horizontally', true)}
									${pdfToolbarButton('objects-align-top', 'Align objects to top')}
									${pdfToolbarButton('objects-align-center-vertical', 'Center objects vertically')}
									${pdfToolbarButton('objects-align-bottom', 'Align objects to bottom')}
								</ul>
								<ul class="saToolbarDistribute">
									${pdfToolbarButton('distribute-spacing-vertical', 'Distribute objects vertically', true)}
									${pdfToolbarButton('distribute-spacing-horizontal', 'Distribute objects horizontally', true)}
								</ul>
								<ul>${pdfToolbarButton('trash-alt', 'Delete object', false, true)}</ul>
							</div>
						</div>
					</div>
					<div class="saCanvasOuter"><div class="saCanvasInner"><div class="saCanvasWrapper">
						<canvas height="792" width="612" style="background: #fff; box-shadow: 0 1px 4px rgba(15, 23, 42, 0.24);"></canvas>
						${placeholders.map(renderPdfPlaceholder).join('')}
					</div></div></div>
				</div>
			</softadmin-pdftemplateeditor>`;
	}

	function renderSearchSegments(value) {
		if (Array.isArray(value)) {
			return value.map(segment => {
				if (!segment || typeof segment !== 'object') {
					return `<span>${escapeHtml(segment)}</span>`;
				}

				return segment.mark
					? `<mark>${escapeHtml(segment.text)}</mark>`
					: `<span>${escapeHtml(segment.text)}</span>`;
			}).join('');
		}

		if (value && typeof value === 'object') {
			const content = renderSearchSegments(value.segments || value.text || '');
			const icon = value.icon ? `<span class="saIconWrapper">${iconHtml(value.icon)}</span>` : '';

			if (value.email) {
				return `<nobr><a class="link" href="mailto:${escapeHtml(value.email)}"><span class="saLinkText">${escapeHtml(value.email)}</span><i class="far fa-envelope saSpecialLinkIcon"></i></a></nobr>`;
			}

			return value.link
				? `<a class="saLink" tabindex="0"><div>${icon}${content}</div></a>`
				: `<div>${icon}${content}</div>`;
		}

		return `<span>${escapeHtml(value)}</span>`;
	}

	function renderEnterpriseSearchCell(value) {
		return `
			<td>
				<div class="saCellWrapper">
					${renderSearchSegments(value)}
				</div>
			</td>`;
	}

	function renderEnterpriseSearchRow(group, row) {
		return `
			<tr>
				${group.columns.map(column => renderEnterpriseSearchCell(row[column.key])).join('')}
			</tr>`;
	}

	function renderEnterpriseSearchGroup(group) {
		return `
			<div class="saGroupViewWrapper" aria-live="polite">
				<div class="saGroupViewGroup">
					<div class="saGroupViewTitle"><h2>${escapeHtml(group.title)}</h2></div>
					<table class="saGroupViewTable">
						<thead>
							<tr>${group.columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join('')}</tr>
						</thead>
						<tbody class="saTableBodyJs">
							${(group.rows || []).map(row => renderEnterpriseSearchRow(group, row)).join('')}
						</tbody>
					</table>
				</div>
				${group.showMore === false ? '' : `<button class="saGroupViewButton" type="button"><i class="saIcon far fa-arrow-down" aria-hidden="true"></i>${escapeHtml(group.showMoreLabel || 'Show more')}</button>`}
			</div>`;
	}

	function renderEnterpriseSearch(component) {
		const filters = component.filters || [];
		const groups = component.groups || [];

		return `
			<softadmin-groupview class="saGroupView${groups.length ? '' : ' saEmpty'}">
				<div class="saGroupViewSearchWrapper">
					<div class="saGroupViewSearchBox">
						<button type="button" aria-label="${escapeHtml(component.searchLabel || 'Search')}" data-tooltip="${escapeHtml(component.searchLabel || 'Search')}">
							<i class="saIcon far fa-search saSearchIcon" aria-hidden="true"></i>
							<i class="saIcon fas fa-spin fa-spinner saSpinIcon"></i>
						</button>
						<input type="search" name="searchtext" aria-label="${escapeHtml(component.searchLabel || 'Search')}" value="${escapeHtml(component.query || '')}">
					</div>
					<span class="saGroupViewWarning" aria-live="polite"></span>
					<fieldset class="saPillGroup">
						<legend class="saScreenReaderOnly">${escapeHtml(component.filterLegend || 'Filter category')}</legend>
						${filters.map(filter => `
							<label class="saPill${filter.active === false ? '' : ' saActive'}${filter.selected ? ' saSelected' : ''}${filter.disabled ? ' saDisabled' : ''}">
								<span>${escapeHtml(filter.label)}</span>
								<input class="saGroupFilterRadioJs" type="radio" name="saGroupViewGroupFilter" value="${escapeHtml(filter.value || '')}" ${filter.selected ? 'checked' : ''} ${filter.disabled ? 'disabled' : ''}>
							</label>`).join('')}
					</fieldset>
				</div>
				<div class="saEmptyState" aria-live="polite">
					<div class="saEmptyStateIcon"><i class="saIcon far fa-search"></i></div>
					<div class="saEmptyStateBody"><span class="saEmptyStateHeading">${escapeHtml(component.emptyText || 'No results found.')}</span></div>
				</div>
				<div class="saGroupViewGroupWrapper">
					${groups.map(renderEnterpriseSearchGroup).join('')}
				</div>
			</softadmin-groupview>`;
	}

	function validationMessage(validation) {
		if (!validation || validation.state === 'valid') {
			return '';
		}

		const icon = validation.state === 'warning' ? 'triangle-exclamation' : 'circle-xmark';
		return `<div class="saValidationMessage sa${validation.state === 'warning' ? 'Warning' : 'Error'}"><i class="saIcon far fa-${icon}"></i><span>${escapeHtml(validation.message)}</span></div>`;
	}

	function renderRadioCards(component) {
		const validationClass = component.validation && component.validation.state !== 'valid'
			? ` saHighlightField${component.validation.state === 'warning' ? 'Warning' : 'Error'}`
			: '';
		return `
			<div class="maincolbody saInputPage">
				<div class="saFieldAndLabelWrapper saRadioCardsMock">
					<div class="saLabelCell">
						<label class="saLabel">${escapeHtml(component.label)}${component.required ? '<span class="mandatory">*</span>' : ''}</label>
					</div>
					<div class="saFieldCell">
						<div class="saInputCardsWrapper${validationClass}">
							<div class="saInputCards saSmall" role="radiogroup" aria-label="${escapeHtml(component.label)}">
								${component.options.map((option, index) => renderRadioCard(component, option, index)).join('')}
							</div>
						</div>
						${validationMessage(component.validation)}
					</div>
				</div>
			</div>`;
	}

	function renderRadioCard(component, option, index) {
		const id = `${component.id || 'radio-cards'}-${index}`;
		const checked = option.value === component.value;
		return `
			<label class="saInputCardWrapper saNoHeading saRadioCard saSmall saActive${option.disabled ? ' saDisabled' : ''}" for="${escapeHtml(id)}">
				<input class="saRadio" id="${escapeHtml(id)}" type="radio" name="${escapeHtml(component.id || 'radio-cards')}" value="${escapeHtml(option.value)}" ${checked ? 'checked' : ''} ${option.disabled ? 'disabled' : ''}>
				<span class="saInputCardBody">
					<span class="saInputCardHeading">${escapeHtml(option.title)}${pillHtml(option.pill)}</span>
					${option.description ? `<span class="saInputCardDescription">${escapeHtml(option.description)}</span>` : ''}
					${option.icon ? `<span class="saInputCardIconWrapper">${iconHtml(option.icon)}</span>` : ''}
				</span>
			</label>`;
	}

	function requiredLabel(label, required) {
		if (!required) {
			return `<span>${escapeHtml(label)}</span>`;
		}

		return `<span class="saMandatory">${escapeHtml(label)}<span class="saMandatoryStar">*</span></span>`;
	}

	function fieldLabel(field) {
		return `
			<label class="saLabelCell" ${field.id ? `for="${escapeHtml(field.id)}"` : ''}>
				<div class="saLabel">${requiredLabel(field.label, field.required)}${field.extendedDescription ? '<button class="saLabelButton saToggleDescriptionButton" type="button" tabindex="-1"><i class="saIcon fas fa-info-circle"></i></button>' : ''}</div>
				${field.description ? `<div class="saDescription">${escapeHtml(field.description)}</div>` : ''}
				${field.extendedDescription ? `<div class="saExtendedDescription">${escapeHtml(field.extendedDescription)}</div>` : ''}
			</label>`;
	}

	function renderTextbox(field) {
		return `
			<div class="saInputTextWrapper saInputPageField ${escapeHtml(field.width || 'mediumLong')}${field.disabled ? ' saDisabled' : ''}">
				<input class="saInputText" value="${escapeHtml(field.value || '')}" ${field.disabled ? 'disabled' : ''}>
			</div>`;
	}

	function renderTextarea(field) {
		return `
			<div class="saInputTextWrapper saInputPageField ${escapeHtml(field.width || 'long')}${field.disabled ? ' saDisabled' : ''}">
				<textarea class="saInputText saTextArea" ${field.disabled ? 'disabled' : ''}>${escapeHtml(field.value || '')}</textarea>
			</div>`;
	}

	function renderDropdown(field) {
		return `
			<div class="saInputTextWrapper saInputPageField ${escapeHtml(field.width || 'mediumLong')} saHasTrailingIcons${field.disabled ? ' saDisabled' : ''}">
				<select class="saInputText saDropdown" ${field.disabled ? 'disabled' : ''}>
					${(field.options || []).map(option => `<option ${option === field.value ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
				</select>
				<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
			</div>`;
	}

	function renderTextboxDropdown(field) {
		return `
			<div class="saInputTextWrapper saInputPageField ${escapeHtml(field.width || 'mediumLong')} saHasTrailingIcons${field.disabled ? ' saDisabled' : ''}">
				<input class="saInputText" value="${escapeHtml(field.value || '')}" ${field.disabled ? 'disabled' : ''}>
				<div class="saTrailingIconsWrapper"><button class="saActionIcon" type="button" tabindex="-1"><i class="saIcon fas fa-caret-down"></i></button></div>
				<ul class="saContextMenu"></ul>
				<ul class="saContextMenu"></ul>
			</div>`;
	}

	function renderAutosearch(field) {
		return `
			<div class="saInputTextWrapper saInputPageField ${escapeHtml(field.width || 'mediumLong')} saHasTrailingIcons${field.disabled ? ' saDisabled' : ''}">
				<div class="saTrailingIconsWrapper"><button class="saActionIcon" type="button" tabindex="-1"><i class="saIcon saC sa-magnifying-glass-arrow-rotate-left"></i></button></div>
				<ul class="saContextMenu"></ul>
				<input class="saInputText" value="${escapeHtml(field.value || '')}" ${field.disabled ? 'disabled' : ''}>
			</div>`;
	}

	function renderAutosuggest(field) {
		return `
			<div class="saInputTextWrapper saInputPageField ${escapeHtml(field.width || 'mediumLong')} saHasTrailingIcons${field.disabled ? ' saDisabled' : ''}">
				<ul class="saContextMenu"></ul>
				<input class="saInputText" value="${escapeHtml(field.value || '')}" ${field.disabled ? 'disabled' : ''}>
				<div class="saTrailingIconsWrapper"><i class="saIcon far fa-text-size"></i></div>
			</div>`;
	}

	function renderMultiAutosearch(field) {
		const values = field.values || [];
		const ids = field.valueIds || values.map((_, index) => index + 1);

		return `
			<div class="saInputTextWrapper saMultiAutoSearchWrapper saInputPageField ${escapeHtml(field.width || 'mediumLong')} saHasTrailingIcons${field.disabled ? ' saDisabled' : ''}"${field.id ? ` id="${escapeHtml(field.id)}"` : ''}>
				<ul class="saSelectedValueWrapper" role="listbox">
					${values.map((value, index) => `<li class="saTag" role="option" id="${escapeHtml(`${field.id || 'multi-autosearch'}-sel-${ids[index] || index + 1}`)}"><span>${escapeHtml(value)}</span><i class="far fa-xmark saIcon"></i></li>`).join('')}
					<li class="saNewInput"><input autocomplete="off" autocorrect="off" spellcheck="false" id="${escapeHtml(`${field.id || 'multi-autosearch'}_input`)}" role="combobox" aria-expanded="false" aria-activedescendant="" value="${escapeHtml(field.value || '')}" ${field.disabled ? 'disabled' : ''}></li>
				</ul>
				<div class="saTrailingIconsWrapper"><button class="saActionIcon" tabindex="-1" type="button" aria-label="${escapeHtml(field.searchLabel || 'Search')}" aria-expanded="false"><i class="saIcon saC sa-magnifying-glass-arrow-rotate-left"></i></button></div>
				<ul class="saContextMenu"></ul>
				<input type="hidden" value="${escapeHtml(ids.join(','))}">
			</div>`;
	}

	function fileIconClass(file) {
		const name = String(file.name || '').toLowerCase();

		if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(name)) {
			return 'fa-image';
		}

		if (/\.(doc|docx)$/.test(name)) {
			return 'fa-file-word';
		}

		if (/\.(xls|xlsx|csv)$/.test(name)) {
			return 'fa-file-excel';
		}

		if (/\.pdf$/.test(name)) {
			return 'fa-file-pdf';
		}

		return 'fa-file';
	}

	function renderUploadLoading() {
		return `
			<div class="saLoadingWrapper saLoadingDark">
				<svg class="saLoading" viewBox="0 0 24 24">
					<circle class="saLoadingCircle" cx="12" cy="12" r="12" fill="none"></circle>
					<path class="saLoadingCheck" d="M6.29,12.58l3.14,3.19c.15,.15,.39,.15,.53,0l7.75-7.8" fill="none"></path>
				</svg>
				<div class="saLoadingSpinner"></div>
			</div>`;
	}

	function renderUploadedFile(file) {
		const name = file.name || 'document.pdf';
		const size = file.size || '24 kB';
		const progress = file.progress || 100;

		return `
			<li class="saFileWrapper saFileVisible saDone">
				<div class="saFileIconWrapper saDone">
					<i class="saFileIcon saIcon fas ${fileIconClass(file)}"></i>
					${renderUploadLoading()}
				</div>
				<div class="saFile">
					<div class="saFileNameWrapper"><span class="saFileName">${escapeHtml(name)}</span></div>
					<div class="saFileSizeWrapper">
						<div class="saFileSizeRow"><span class="saFileSize">${escapeHtml(size)}</span><span class="saFileUploadProgressText">${escapeHtml(progress)}%</span></div>
						<progress class="saFileUploadProgress" max="100" value="${escapeHtml(progress)}"></progress>
						<span class="saFileErrorMessage" role="alert"></span>
					</div>
				</div>
				<div class="saFileButtonGroup">
					<button class="saDeleteButton saDestructive" type="button" data-tooltip="${escapeHtml(file.deleteTooltip || 'Delete file')}" aria-label="${escapeHtml(`Delete file ${name}`)}"><i class="saIcon far fa-trash-alt"></i></button>
				</div>
			</li>`;
	}

	function renderFileUploadArea(field) {
		const files = field.files || [];

		return `
			<div class="saFileUploadAreaWrapper saMultipleFilesArea${files.length ? ' saHasFiles saDone' : ''}">
				<label class="saFileUploadArea" tabindex="0" role="button"${field.required ? ' data-sa-required-control=""' : ''}>
					<input type="file" ${field.multiple === false ? '' : 'multiple'}>
					<div class="saFileUploadAreaInner" aria-hidden="true">
						<div class="saFolderWrapper">
							<div class="saFolder">
								<div class="saFolderBack"></div>
								<div class="saPaper"></div>
								<div class="saPaper"></div>
								<div class="saPaper"></div>
								<div class="saFolderFront"><i class="saEnabledIcon saIcon far fa-arrow-up"></i><i class="saDisabledIcon saIcon far fa-xmark"></i></div>
							</div>
						</div>
						<div class="saFileUploadAreaText">
							<span class="saFileUploadAreaHeading">${escapeHtml(field.heading || 'Drop your files here, or ')}<span class="saLink">${escapeHtml(field.linkText || 'browse')}</span></span>
							<span class="saFileUploadAreaDescription">${escapeHtml(field.description || 'Maximum file size 30 MB')}</span>
						</div>
					</div>
				</label>
				<ul class="saFileGroup">${files.map(renderUploadedFile).join('')}</ul>
			</div>`;
	}

	function renderDateRange(field) {
		return `
			<div class="saInputPageField ${escapeHtml(field.width || 'mediumLong')} saInputDateRange saInputTextWrapper saHasTrailingIcons${field.disabled ? ' saDisabled' : ''}">
				<input class="saFromDate" value="${escapeHtml(field.from || '')}" ${field.disabled ? 'disabled' : ''}>
				<span class="saDateSeparator"></span>
				<input class="saToDate" value="${escapeHtml(field.to || '')}" ${field.disabled ? 'disabled' : ''}>
				<div class="saTrailingIconsWrapper"><button class="saActionIcon" type="button" tabindex="-1"><i class="saIcon far fa-calendar"></i></button></div>
			</div>`;
	}

	function renderTime(field) {
		return `
			<div class="saInputTextWrapper saTimeField saInputPageField saHasTrailingIcons">
				<input type="hidden" value="${escapeHtml(field.value || '')}">
				<div></div>
				<input class="saInputText saTime" id="${escapeHtml(field.id || '')}" value="${escapeHtml(field.displayValue || '')}" ${field.required ? 'required' : ''}>
				<div class="saTrailingIconsWrapper"><button class="saActionIcon" tabindex="-1" type="button"><i class="saIcon far fa-clock"></i></button></div>
				<ul class="saContextMenu" tabindex="0"></ul>
			</div>`;
	}

	function renderNumberAffix(field) {
		return `
			<div class="saInputAffixWrapper saInputPageField ${escapeHtml(field.width || 'shortest')}">
				<input class="saInputAffix" id="${escapeHtml(field.id || '')}" inputmode="decimal" value="${escapeHtml(field.value || '')}" ${field.required ? 'required' : ''}>
				<div class="saInputAffixText">${escapeHtml(field.suffix || '')}</div>
			</div>`;
	}

	function renderUneditable(field) {
		return `
			<div class="saInputPageField ${escapeHtml(field.width || 'mediumLong')}">
				<div class="saUneditableText">${escapeHtml(field.value || '')}</div>
				<input type="hidden" value="${escapeHtml(field.value || '')}">
			</div>`;
	}

	function renderIconPreview(field) {
		return `
			<div class="saInputPageField ${escapeHtml(field.width || 'shortest')}">
				<div class="saUneditableText"><i class="saIcon far fa-${escapeHtml(field.icon || 'cube')}"></i></div>
				<input type="hidden" value="${escapeHtml(field.icon || '')}">
			</div>`;
	}

	function renderCheckbox(field) {
		return `
			<div class="saCheckboxControl saCheckboxWrapper saInputPageField">
				<input class="saCheckbox" type="checkbox" id="${escapeHtml(field.id || '')}" ${field.checked ? 'checked' : ''}>
			</div>`;
	}

	function renderMultirowHeaderCell(column) {
		return `
			<div class="saMultiRowCellWrapper">
				<div class="saMultiRowCell">
					<label class="saLabelWrapper">
						<div class="saLabel"><span>${escapeHtml(column.label || '')}</span></div>
					</label>
				</div>
			</div>`;
	}

	function renderMultirowCellInner(column, row, rowIndex) {
		const value = row[column.key] ?? column.value ?? '';
		const width = column.width || 'mediumLong';
		const checked = row[column.key] === true || row[column.key] === column.checkedValue || rowIndex === column.checkedRow;
		const control = String(column.control || column.type || 'textbox').toLowerCase();

		if (control === 'radio' || control === 'radiobutton') {
			return `
				<div class="saMultiRowInputWrapper">
					<div class="saRadioWrapper saMultiRowField">
						<label class="saRadioLabel${checked ? ' saSelected' : ''}">
							<input class="saRadio" type="radio" name="${escapeHtml(column.name || column.key || 'multirow-radio')}" ${checked ? 'checked' : ''}>
						</label>
					</div>
				</div>`;
		}

		if (control === 'affix' || control === 'numberaffix' || control === 'number') {
			return `
				<div class="saMultiRowInputWrapper ${escapeHtml(width)}">
					<div class="saInputAffixWrapper saMultiRowField ${escapeHtml(width)}">
						${column.prefix ? `<div class="saInputAffixText">${escapeHtml(column.prefix)}</div>` : ''}
						<input class="saInputAffix" value="${escapeHtml(value)}" ${column.inputmode ? `inputmode="${escapeHtml(column.inputmode)}"` : ''}>
						${column.suffix ? `<div class="saInputAffixText">${escapeHtml(column.suffix)}</div>` : ''}
					</div>
				</div>`;
		}

		if (control === 'uneditable' || control === 'rowheading' || control === 'text') {
			return `
				<div class="saMultiRowInputWrapper ${escapeHtml(width)}">
					<div class="saMultiRowField ${escapeHtml(width)}">
						<span>${escapeHtml(value)}</span>
					</div>
				</div>`;
		}

		if (control === 'empty') {
			return `
				<div class="saMultiRowInputWrapper">
					<div class="saMultiRowField"></div>
				</div>`;
		}

		return `
			<div class="saMultiRowInputWrapper ${escapeHtml(width)}">
				<div class="saInputTextWrapper saMultiRowField ${escapeHtml(width)}">
					<input class="saInputText" value="${escapeHtml(value)}">
				</div>
			</div>`;
	}

	function renderMultirowCell(column, row, rowIndex) {
		return `
			<div class="saMultiRowCellWrapper">
				<div class="saMultiRowCell">
					${renderMultirowCellInner(column, row, rowIndex)}
				</div>
			</div>`;
	}

	function renderMultirowButtons(field) {
		if (field.allowDelete === false) {
			return '';
		}

		return `
			<div class="saMultiRowCellWrapper">
				<div class="saMultiRowCell">
					<ul class="saMultiRowButtons">
						<li>
							<button class="saIconOnlyFieldButton saDestructive saDeleteRowButtonJs" type="button" aria-label="Delete row">
								<i class="saIcon far fa-trash-alt"></i>
							</button>
						</li>
					</ul>
				</div>
			</div>`;
	}

	function renderMultirowAggregateCell(cell) {
		if (cell && typeof cell === 'object' && cell.sumText) {
			return `
				<div class="saMultiRowCellWrapper saMultiRowAggregateCellWrapper">
					<div class="saMultiRowCell saMultiRowAggregateCell">
						<span class="saMultiRowSumText">${escapeHtml(cell.sumText)}</span>
					</div>
				</div>`;
		}

		const content = cell && typeof cell === 'object'
			? `${escapeHtml(cell.prefix || '')}<span class="saMultiRowAggregateValue">${escapeHtml(cell.value ?? '')}</span>${escapeHtml(cell.suffix || '')}`
			: escapeHtml(cell || '');

		return `
			<div class="saMultiRowCellWrapper saMultiRowAggregateCellWrapper">
				<div class="saMultiRowCell saMultiRowAggregateCell">
					${content ? `<span>${content}</span>` : ''}
				</div>
			</div>`;
	}

	function renderMultirowAggregate(field, columns) {
		if (!field.aggregate) {
			return '';
		}

		const cells = Array.isArray(field.aggregate)
			? field.aggregate
			: columns.map(column => field.aggregate[column.key] || '');

		return `
			<div class="saMultiRowRow saMultiRowAggregateRow">
				${cells.map(renderMultirowAggregateCell).join('')}
				${field.allowDelete === false ? '' : renderMultirowAggregateCell('')}
			</div>`;
	}

	function renderMultirow(field) {
		const columns = field.columns || [];
		const rows = field.rows && field.rows.length ? field.rows : [{}];

		return `
			<div class="saInputPageField saMultiRowWrapper${rows.length ? '' : ' saEmpty'}">
				<fieldset>
					<div class="saMultiRowTableWrapper">
						<div class="saMultiRow">
							<div class="saMultiRowHeadGroup">
								<div class="saMultiRowHead">
									${columns.map(renderMultirowHeaderCell).join('')}
									${field.allowDelete === false ? '' : '<div class="saMultiRowCellWrapper"></div>'}
								</div>
							</div>
							<div class="saMultiRowRowsGroup">
								${rows.map((row, rowIndex) => `
									<div class="saMultiRowRow">
										${columns.map(column => renderMultirowCell(column, row, rowIndex)).join('')}
										${renderMultirowButtons(field)}
									</div>`).join('')}
								${renderMultirowAggregate(field, columns)}
							</div>
						</div>
					</div>
					<a class="newrowtabstop"></a>
					<button class="saMultiRowNewRowButton saLabeledFieldButton" type="button">
						<i class="saIcon far fa-plus"></i>${escapeHtml(field.addButtonLabel || 'New row')}
					</button>
				</fieldset>
			</div>`;
	}

	function renderRadioCardsControl(field) {
		const validationClass = field.validation && field.validation.state !== 'valid'
			? ` saHighlightField${field.validation.state === 'warning' ? 'Warning' : 'Error'}`
			: '';

		return `
			<div class="saInputCardsWrapper${validationClass}">
				<div class="saInputCards saSmall" role="radiogroup" aria-label="${escapeHtml(field.label)}">
					${(field.options || []).map((option, index) => renderRadioCard({
						id: field.id,
						value: field.value,
						validation: field.validation
					}, option, index)).join('')}
				</div>
			</div>
			${validationMessage(field.validation)}`;
	}

	const controlRenderers = {
		autosearch: renderAutosearch,
		autosuggest: renderAutosuggest,
		checkbox: renderCheckbox,
		dateRange: renderDateRange,
		dropdown: renderDropdown,
		fileUploadArea: renderFileUploadArea,
		multiAutosearch: renderMultiAutosearch,
		multirow: renderMultirow,
		numberAffix: renderNumberAffix,
		iconPreview: renderIconPreview,
		radioCards: renderRadioCardsControl,
		textarea: renderTextarea,
		textbox: renderTextbox,
		textboxDropdown: renderTextboxDropdown,
		time: renderTime,
		uneditable: renderUneditable
	};

	function renderControl(field) {
		const renderer = controlRenderers[field.control] || renderTextbox;
		return renderer(field);
	}

	function renderFieldAction(action) {
		const icon = action.icon ? `<i class="saIcon far fa-${escapeHtml(action.icon)}"></i>` : '';
		const label = escapeHtml(action.label || 'Choose');

		return `
			<button class="saLabeledFieldButton${action.variant === 'primary' ? ' saButtonPrimary' : ''}" type="button">
				${icon}<span class="saButtonText">${label}</span>
			</button>`;
	}

	function renderFieldActions(field) {
		if (!Array.isArray(field.actions) || !field.actions.length) {
			return '';
		}

		return `<div class="saFieldButtonGroup">${field.actions.map(renderFieldAction).join('')}</div>`;
	}

	function renderFieldCell(field) {
		return `
			<div class="saFieldCell">
				<div class="saInputWrapper ${escapeHtml(field.inputWrapper || 'long')}">
					<div class="saInput">
						${renderControl(field)}
						${renderFieldActions(field)}
					</div>
				</div>
				${field.info ? `<div class="saFieldInfoText">${escapeHtml(field.info)}</div>` : ''}
			</div>`;
	}

	function renderSiblingRow(field) {
		const fields = field.fields || [];
		const first = fields[0];

		if (!first) {
			return '';
		}

		return `
			<div class="saSiblingRow">
				${fieldLabel(first)}
				<div class="saSiblingFields">
					${renderFieldCell(first)}
					${fields.slice(1).map(sibling => `${fieldLabel(sibling)}${renderFieldCell(sibling)}`).join('')}
				</div>
			</div>`;
	}

	function renderField(field) {
		if (field.layout === 'siblings') {
			return renderSiblingRow(field);
		}

		return `
			<div class="saFieldAndLabelWrapper${field.control === 'checkbox' ? ' saCheckboxFieldAndLabelWrapper' : ''}">
				${fieldLabel(field)}
				${renderFieldCell(field)}
			</div>`;
	}

	function renderSectionHeader(section, sectionId) {
		const checkbox = section.checkbox
			? `<label class="saCheckboxControl saCheckboxWrapper"><input class="saCheckbox" type="checkbox" ${section.checkbox.checked ? 'checked' : ''}></label>`
			: '';

		return `
			<legend class="saSectionHeaderWrapper">
				<div class="saSectionHeader${section.checkbox ? ' saSectionHeaderWithCheckbox' : ''}" id="${escapeHtml(sectionId || '')}">
					${checkbox}<h2>${escapeHtml(section.heading)}</h2>
				</div>
			</legend>`;
	}

	function renderNewEditSection(section, index, sections, sectionId) {
		const sectionClass = `saSectionWrapper${index === sections.length - 1 ? ' saLastVisible' : ''}`;

		if (!section.heading) {
			return `
				<div class="${sectionClass}">
					<div class="saFieldCollection ${escapeHtml(section.width || 'long')}">
						${(section.fields || []).map(renderField).join('')}
					</div>
				</div>`;
		}

		return `
			<fieldset class="${sectionClass}">
				${renderSectionHeader(section, sectionId || section.id || `Header_${index}`)}
				<fieldset class="saFieldCollection ${escapeHtml(section.width || 'long')}">
					${(section.fields || []).map(renderField).join('')}
				</fieldset>
			</fieldset>`;
	}

	function newEditSectionId(section, fallback) {
		return section.id || fallback;
	}

	function renderNewEditRows(component) {
		return (component.rows || []).map((row, rowIndex) => {
			const rowId = newEditSectionId(row, `Header_Row_${rowIndex}`);
			const columns = row.columns || [];
			const rowContent = `
				<div class="saFieldsRow">
					${columns.map((column, columnIndex) => {
						const sections = column.sections || [];
						return `
							<div class="saFieldsColumn${columnIndex === columns.length - 1 ? ' saLastVisible' : ''}">
								${sections.map((section, sectionIndex) => renderNewEditSection(section, sectionIndex, sections, newEditSectionId(section, `Header_${rowIndex}_${columnIndex}_${sectionIndex}`))).join('')}
							</div>`;
					}).join('')}
				</div>`;

			if (!row.heading) {
				return `<div class="saSectionWrapper${rowIndex === component.rows.length - 1 ? ' saLastVisible' : ''}">${rowContent}</div>`;
			}

			return `
				<fieldset class="saSectionWrapper${rowIndex === component.rows.length - 1 ? ' saLastVisible' : ''}">
					${renderSectionHeader(row, rowId)}
					${rowContent}
				</fieldset>`;
		}).join('');
	}

	function newEditTocEntries(component) {
		if (Array.isArray(component.toc)) {
			return component.toc;
		}

		if (Array.isArray(component.rows)) {
			const entries = [];
			component.rows.forEach((row, rowIndex) => {
				if (row.heading) entries.push({ label: row.heading, id: newEditSectionId(row, `Header_Row_${rowIndex}`) });
				(row.columns || []).forEach((column, columnIndex) => {
					(column.sections || []).forEach((section, sectionIndex) => {
						if (section.heading) entries.push({ label: section.heading, id: newEditSectionId(section, `Header_${rowIndex}_${columnIndex}_${sectionIndex}`) });
					});
				});
			});
			return entries;
		}

		return (component.sections || []).filter(section => section.heading).map((section, index) => ({
			label: section.heading,
			id: newEditSectionId(section, `Header_${index}`)
		}));
	}

	function renderNewEditToc(component) {
		if (!component.toc) return '';
		const toc = typeof component.toc === 'object' && !Array.isArray(component.toc) ? component.toc : {};
		const entries = newEditTocEntries(component);

		return `
			<nav class="saToc${toc.open === false ? '' : ' saOpen'}">
				<button class="saTocButton" type="button" aria-expanded="${toc.open === false ? 'false' : 'true'}">
					${escapeHtml(toc.heading || component.tocHeading || 'Table of contents')}<i class="far fa-angle-down saIcon"></i>
				</button>
				<ul>
					${entries.map(entry => `<li${entry.active === false ? '' : ' class="saActive"'}${entry.hidden ? ' hidden' : ''}><a class="saTocLink" href="#${escapeHtml(entry.id || '')}">${escapeHtml(entry.label || '')}</a></li>`).join('')}
				</ul>
			</nav>`;
	}

	function renderNewEdit(component) {
		const labelsClass = String(component.labels || component.labelPlacement || 'above').toLowerCase() === 'before' ? 'saLabelsBefore' : 'saLabelsAbove';
		return `
			<div class="maincolbody saInputPage">
				<div>
					<div class="saErrorSummaryHolder">
						<div class="saErrorSummaryWrapper" style="display: none;">
							<div class="saErrorSummaryHeadingWrapper"><i class="saIcon fas fa-octagon-xmark"></i><h3 class="saErrorSummaryHeading">Resolve the following errors to continue:</h3></div>
							<button class="saErrorSummaryCloseButton"><i class="saIcon far fa-xmark"></i></button>
							<ul class="saErrorSummary"></ul>
						</div>
					</div>
					<div class="saFormRootAndTocWrapper">
						${renderNewEditToc(component)}
						<fieldset class="saFormRoot ${labelsClass}">
							<div class="saSectionWrapper">
								${Array.isArray(component.rows)
									? renderNewEditRows(component)
									: (component.sections || []).map((section, index, sections) => renderNewEditSection(section, index, sections, newEditSectionId(section, `Header_${index}`))).join('')}
							</div>
						</fieldset>
					</div>
				</div>
				<div class="saInputPageFooter">
					<div class="saFormButtonGroup">
						${(component.buttons || [
							{ label: 'Save', variant: 'primary' },
							{ label: 'Cancel', variant: 'secondary' }
						]).map(button => `<button class="saFormButton ${button.variant === 'primary' ? 'saButtonPrimary' : 'saButtonSecondary'}" type="button"><i class="icon fas fa-spin fa-spinner saSpinner"></i>${escapeHtml(button.label)}</button>`).join('')}
					</div>
				</div>
			</div>`;
	}

	function renderInfoBoxField(field) {
		return `
			<div class="saInfoBoxCol">
				<div class="saInfoBoxLabel">${escapeHtml(field.label)}</div>
				<p class="saInfoBoxContent">
					<span class="saInfoBoxTextContent">${renderGridCellValue(field.value)}</span>
				</p>
			</div>`;
	}

	function renderInfoBoxGrid(box) {
		return `
			<div class="saInfoBoxGrid">
				${(box.fields || []).map(field => `
					<div class="saInfoBoxLabel">${escapeHtml(field.label)}</div>
					<p class="saInfoBoxContent${field.align === 'right' ? ' saRightAlign' : ''}${field.html ? ' saUserHtmlContent' : ''}">
						<span class="saInfoBoxTextContent">${renderGridCellValue(field.value)}</span>
					</p>`).join('')}
			</div>`;
	}

	function meterNumber(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) ? number : fallback;
	}

	function meterPoint(value, min, max, radius) {
		const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
		const angle = Math.PI * (1 - ratio);
		return {
			x: Number((130 + radius * Math.cos(angle)).toFixed(3)),
			y: Number((115 - radius * Math.sin(angle)).toFixed(3))
		};
	}

	function meterArc(from, to, min, max, radius) {
		const start = meterPoint(from, min, max, radius);
		const end = meterPoint(to, min, max, radius);
		return `M${start.x},${start.y}A${radius},${radius},0,0,1,${end.x},${end.y}`;
	}

	function meterToneClass(tone) {
		return {
			green: 'saMeterGreen',
			yellow: 'saMeterYellow',
			red: 'saMeterRed'
		}[String(tone || '').toLowerCase()] || 'saMeterValueDefaultColor';
	}

	function renderInfoBoxMeter(meter) {
		const min = meterNumber(meter.min, 0);
		const proposedMax = meterNumber(meter.max, 100);
		const max = proposedMax > min ? proposedMax : min + 100;
		const value = Math.max(min, Math.min(max, meterNumber(meter.value, min)));
		const intervals = (Array.isArray(meter.intervals) && meter.intervals.length
			? meter.intervals
			: [{ from: min, to: max, tone: meter.tone }])
			.map(interval => ({
				from: Math.max(min, Math.min(max, meterNumber(interval.from, min))),
				to: Math.max(min, Math.min(max, meterNumber(interval.to, max))),
				tone: interval.tone || 'default'
			}))
			.filter(interval => interval.to > interval.from)
			.sort((left, right) => left.from - right.from);
		const valueInterval = intervals.find(interval => value >= interval.from && value <= interval.to) || intervals[0];
		const reachedClass = meterToneClass(meter.tone || valueInterval?.tone);
		const displayValue = meter.displayValue ?? meter.value ?? min;
		const unit = meter.unit || '';
		const boundaries = intervals.length
			? [intervals[0].from, ...intervals.map(interval => interval.to)]
			: [min, max];

		return `
			<div class="saMeterOuter" aria-label="${escapeHtml(`${meter.heading || 'Meter'} ${displayValue}${unit}`)}">
				<h3 class="saMeterHeading">${escapeHtml(meter.heading || 'Meter')}</h3>
				<svg width="100%" viewBox="0 0 260 120" role="img">
					<path fill="none" class="${reachedClass} saMeterValue" d="${meterArc(min, value, min, max, 70)}"></path>
					<path fill="none" class="saMeterUnreachedValue saMeterValue" d="${meterArc(value, max, min, max, 70)}"></path>
					<text class="saMeterValueText" x="130" y="115"><tspan font-size="${unit.length > 2 ? '24px' : '32px'}">${escapeHtml(displayValue)}</tspan>${unit ? `<tspan font-size="${unit.length > 2 ? '12px' : '16px'}" dx="2">${escapeHtml(unit)}</tspan>` : ''}</text>
					${intervals.map(interval => `
						<g class="saMeterIntervalWithTooltip">
							<path fill="none" class="${meterToneClass(interval.tone)} saIntervalVisibleArc" d="${meterArc(interval.from, interval.to, min, max, 95)}"></path>
							<path fill="none" class="saIntervalTooltip" d="${meterArc(interval.from, interval.to, min, max, 95)}" data-tooltip="${escapeHtml(`${interval.from}${unit} - ${interval.to}${unit}`)}"></path>
						</g>`).join('')}
					${boundaries.map((boundary, index) => {
						const point = meterPoint(boundary, min, max, 99);
						const positionClass = index === 0 ? 'saMeterTextLeft' : index === boundaries.length - 1 ? 'saMeterTextRight' : 'saMeterTextCenter';
						return `<text class="saMeterIntervalText ${positionClass}" x="${point.x}" y="${point.y}">${escapeHtml(boundary)}</text>`;
					}).join('')}
				</svg>
			</div>`;
	}

	function renderInfoBoxMeters(meters) {
		return `<div class="saInfoSqlMeterWrapper">${meters.map(renderInfoBoxMeter).join('')}</div>`;
	}

	function renderInfoBoxKpi(kpi) {
		const trendTone = ['positive', 'negative', 'neutral'].includes(String(kpi.trendTone || '').toLowerCase())
			? String(kpi.trendTone).toLowerCase()
			: 'neutral';
		const trendDirection = ['up', 'down'].includes(String(kpi.trendDirection || '').toLowerCase())
			? String(kpi.trendDirection).toLowerCase()
			: null;
		const hasTrend = kpi.trendValue !== undefined && kpi.trendValue !== null;
		const trendIcon = trendDirection ? `<i class="far fa-arrow-trend-${trendDirection}"></i>` : '';

		return `
			<div class="saKpiOuter">
				${kpi.heading ? `<span class="saKpiHeading">${escapeHtml(kpi.heading)}</span>` : ''}
				<div class="saKpiWrapper">
					<div class="saKpi"><span class="saKpiValue">${escapeHtml(kpi.value)}</span>${kpi.suffix ? `<span class="saKpiSuffix">${escapeHtml(kpi.suffix)}</span>` : ''}</div>
					${hasTrend ? `<div class="saTrendWrapper"><div class="saTrend sa${trendTone[0].toUpperCase()}${trendTone.slice(1)}">${trendIcon}<div class="saTrendInner"><span class="saTrendValue">${escapeHtml(kpi.trendValue)}</span>${kpi.trendSuffix ? `<span class="saTrendSuffix">${escapeHtml(kpi.trendSuffix)}</span>` : ''}</div></div>${kpi.period ? `<span class="saTrendPeriod">${escapeHtml(kpi.period)}</span>` : ''}</div>` : ''}
				</div>
				${kpi.description ? `<span class="saInfoBoxTextContent">${escapeHtml(kpi.description)}</span>` : ''}
			</div>`;
	}

	function renderInfoBoxKpis(kpis) {
		return `<div class="saInfoSqlKpiWrapper">${kpis.map(renderInfoBoxKpi).join('')}</div>`;
	}

	function chartNumber(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) ? number : fallback;
	}

	function chartLabel(value) {
		const number = Number(value);
		if (!Number.isFinite(number)) return String(value ?? '');
		return Number.isInteger(number) ? String(number) : String(Number(number.toFixed(1)));
	}

	function renderInfoBoxLineChart(chart, chartIndex) {
		const palette = ['#2d6ce1', '#8b4af1', '#3591a8', '#e0173e', '#e641b2', '#ca6d34', '#009b36', '#b67a00', '#313a44', '#0f44a6', '#6123b4'];
		const labels = Array.isArray(chart.labels) ? chart.labels : [];
		const series = (Array.isArray(chart.series) ? chart.series : []).map((item, index) => ({
			...item,
			color: item.color || palette[index % palette.length],
			values: Array.isArray(item.values) ? item.values.map(value => chartNumber(value, null)) : []
		}));
		const values = series.flatMap(item => item.values).filter(Number.isFinite);
		const dataMin = values.length ? Math.min(...values) : 0;
		const dataMax = values.length ? Math.max(...values) : 1;
		const min = chartNumber(chart.min, Math.min(0, dataMin));
		const proposedMax = chartNumber(chart.max, dataMax === min ? min + 1 : dataMax * 1.1);
		const max = proposedMax > min ? proposedMax : min + 1;
		const plot = { left: 76, top: 24, width: 670, height: 380 };
		const baseline = plot.top + plot.height;
		const x = index => plot.left + (labels.length <= 1 ? plot.width / 2 : (index / (labels.length - 1)) * plot.width);
		const y = value => plot.top + (1 - ((value - min) / (max - min))) * plot.height;
		const gridTicks = Array.from({ length: 6 }, (_, index) => min + ((max - min) * index / 5));
		const labelStep = Math.max(1, Math.ceil(labels.length / 6));
		const visibleLabelIndexes = labels.map((_, index) => index).filter(index => index % labelStep === 0 || index === labels.length - 1);
		const chartId = `InfoChart${chartIndex}-${String(chart.heading || 'chart').replace(/[^a-z0-9]/gi, '')}`;

		return `
			<div class="saChartWrapper">
				${chart.heading ? `<h3 class="saChartHeading">${escapeHtml(chart.heading)}</h3>` : ''}
				${chart.description ? `<div class="saChartDescription">${escapeHtml(chart.description)}</div>` : ''}
				<svg viewBox="0 0 1000 480" preserveAspectRatio="xMinYMin meet" role="img" aria-label="${escapeHtml(chart.heading || 'Line chart')}">
					<defs>
						${series.map((item, index) => `<linearGradient id="${chartId}-gradient-${index}" x1="0%" x2="0%" y1="0%" y2="100%"><stop offset="0%" stop-color="${escapeHtml(item.color)}" stop-opacity=".12"></stop><stop offset="100%" stop-color="${escapeHtml(item.color)}" stop-opacity=".01"></stop></linearGradient>`).join('')}
					</defs>
					<g class="saXYChart">
						<g class="saGridLine">
							${gridTicks.map((tick, index) => {
								const tickY = y(tick);
								return `<g class="${index === 0 ? 'saStrongLine' : ''}"><line stroke="currentColor" x1="${plot.left}" x2="${plot.left + plot.width}" y1="${tickY}" y2="${tickY}"></line><text class="saXYChartLabel" text-anchor="end" x="${plot.left - 12}" y="${tickY + 4}">${escapeHtml(chartLabel(tick))}</text></g>`;
							}).join('')}
						</g>
						<g class="saXAxis saStrongLine">
							<path class="domain" stroke="currentColor" d="M${plot.left},${baseline}H${plot.left + plot.width}"></path>
							${visibleLabelIndexes.map(index => `<text class="saXYChartLabel" text-anchor="middle" x="${x(index)}" y="${baseline + 28}">${escapeHtml(labels[index])}</text>`).join('')}
						</g>
						${chart.yAxisTitle ? `<text class="saChartAxisTitle" text-anchor="middle" transform="rotate(-90)" x="${-(plot.top + plot.height / 2)}" y="18">${escapeHtml(chart.yAxisTitle)}</text>` : ''}
						${series.map((item, seriesIndex) => {
							const points = item.values.map((value, index) => Number.isFinite(value) && index < labels.length ? { x: x(index), y: y(value), value, label: labels[index] } : null).filter(Boolean);
							if (!points.length) return '';
							const linePath = points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join('');
							const areaPath = `M${points[0].x},${baseline}${points.map(point => `L${point.x},${point.y}`).join('')}L${points[points.length - 1].x},${baseline}Z`;
							return `${chart.showArea === false ? '' : `<path class="saLineArea" d="${areaPath}" style="fill:url(#${chartId}-gradient-${seriesIndex})"></path>`}<path fill="none" stroke="${escapeHtml(item.color)}" class="saChartLine" d="${linePath}" data-tooltip="${escapeHtml(item.label || `Series ${seriesIndex + 1}`)}"></path>${points.map(point => `<circle cx="${point.x}" cy="${point.y}" r="5" class="saLineMarker saHidden" stroke="${escapeHtml(item.color)}" fill="#fff" data-tooltip="${escapeHtml(`${point.label}: ${chartLabel(point.value)}${chart.unit ? ` ${chart.unit}` : ''}`)}"></circle>`).join('')}`;
						}).join('')}
						<g class="saChartLegend" transform="translate(780,24)">
							${series.map((item, index) => `<g class="saLegendItem" transform="translate(0,${index * 34})"><rect width="18" height="18" rx="2" fill="${escapeHtml(item.color)}"></rect><text class="saLegendText" x="28" y="14">${escapeHtml(item.label || `Series ${index + 1}`)}</text></g>`).join('')}
						</g>
					</g>
				</svg>
			</div>`;
	}

	function piePoint(centerX, centerY, radius, angle) {
		return {
			x: Number((centerX + radius * Math.cos(angle)).toFixed(3)),
			y: Number((centerY + radius * Math.sin(angle)).toFixed(3))
		};
	}

	function renderInfoBoxPieChart(chart) {
		const palette = ['#0f44a6', '#2d6ce1', '#6ea3ff', '#8b4af1', '#3591a8', '#e0173e', '#009b36'];
		const series = (Array.isArray(chart.series) ? chart.series : []).map((item, index) => ({
			...item,
			value: Math.max(0, chartNumber(item.value, 0)),
			color: item.color || palette[index % palette.length]
		}));
		const total = series.reduce((sum, item) => sum + item.value, 0) || 1;
		let angle = -Math.PI / 2;
		const center = { x: 210, y: 210, radius: 180 };

		const arcs = series.map((item, index) => {
			const startAngle = angle;
			const sliceAngle = (item.value / total) * Math.PI * 2;
			angle += sliceAngle;
			const endAngle = angle;
			const start = piePoint(center.x, center.y, center.radius, startAngle);
			const end = piePoint(center.x, center.y, center.radius, endAngle);
			const fullCircle = sliceAngle >= Math.PI * 2 - 0.0001;
			const path = fullCircle
				? `M${center.x},${center.y - center.radius}A${center.radius},${center.radius},0,1,1,${center.x - 0.001},${center.y - center.radius}L${center.x},${center.y}Z`
				: `M${center.x},${center.y}L${start.x},${start.y}A${center.radius},${center.radius},0,${sliceAngle > Math.PI ? 1 : 0},1,${end.x},${end.y}Z`;
			return `<g class="saPieArc" data-sa-legend-index="${index}"><path d="${path}" fill="${escapeHtml(item.color)}" data-tooltip="${escapeHtml(`${item.label || `Series ${index + 1}`}: ${chartLabel(item.value)}${chart.unit ? ` ${chart.unit}` : ''}`)}"></path></g>`;
		}).join('');

		return `
			<div class="saChartWrapper">
				${chart.heading ? `<h3 class="saChartHeading">${escapeHtml(chart.heading)}</h3>` : ''}
				${chart.description ? `<div class="saChartDescription">${escapeHtml(chart.description)}</div>` : ''}
				<svg viewBox="0 0 1000 440" preserveAspectRatio="xMinYMin meet" role="img">
					<g class="saPieChart">
						${arcs}
						<g class="saChartLegend" transform="translate(450,90)">
							${series.map((item, index) => `<g class="saLegendItem" transform="translate(0,${index * 48})" data-sa-legend-index="${index}"><rect width="24" height="24" fill="${escapeHtml(item.color)}"></rect><text class="saLegendText" x="38" y="18">${escapeHtml(item.label || `Series ${index + 1}`)}</text></g>`).join('')}
						</g>
					</g>
				</svg>
			</div>`;
	}

	function renderInfoBoxCharts(charts) {
		return `<div class="saInfoSqlChartWrapper"><div class="saInfoSqlChartScrollable">${charts.map((chart, index) => String(chart.type || 'line').toLowerCase() === 'pie' ? renderInfoBoxPieChart(chart) : renderInfoBoxLineChart(chart, index)).join('')}</div></div>`;
	}

	function renderInfoBox(box) {
		return `
			<div class="saInfoBox${box.collapsed ? ' saClosed' : ' saOpen'}">
				${box.heading ? `<button class="saInfoBoxHeading saInfoBoxHeadingButton" type="button" aria-expanded="${box.collapsed ? 'false' : 'true'}">
					<div class="saInfoBoxHeaderWrapper">
						${box.icon ? `<span class="saInfoBoxHeaderIcon">${iconHtml(box.icon)}</span>` : ''}
						<h3>${escapeHtml(box.heading)}</h3>
					</div>
					<i class="far fa-angle-down saIcon saInfoBoxExpandIcon"></i>
				</button>` : ''}
				<div class="saInfoBoxInner">
					${box.text ? `<div class="saUserHtmlContent">${escapeHtml(box.text)}</div>` : ''}
					${box.fields && box.fields.length ? (box.layout === 'grid' ? renderInfoBoxGrid(box) : box.fields.map(renderInfoBoxField).join('')) : ''}
					${box.kpis && box.kpis.length ? `<div class="saInfoBoxCol"><div class="saInfoBoxContent">${renderInfoBoxKpis(box.kpis)}</div></div>` : ''}
					${box.meters && box.meters.length ? `<div class="saInfoBoxCol"><div class="saInfoBoxContent">${renderInfoBoxMeters(box.meters)}</div></div>` : ''}
					${box.charts && box.charts.length ? `<div class="saInfoBoxCol saInfoBoxChartCol"><div class="saInfoBoxContent saInfoBoxChartContent">${renderInfoBoxCharts(box.charts)}</div></div>` : ''}
				</div>
			</div>`;
	}

	function renderWarningBox(message) {
		const type = String(message.type || 'info').toLowerCase();
		const classes = {
			error: 'saError',
			warning: 'saWarning',
			info: 'saInfo',
			success: 'saSuccess'
		};
		const icons = {
			error: 'octagon-xmark',
			warning: 'triangle-exclamation',
			info: 'circle-info',
			success: 'circle-check'
		};
		const expandable = message.expandable !== false;
		const closed = expandable && message.open !== true;
		const contentLines = Array.isArray(message.lines) && message.lines.length ? message.lines : [message.text];
		const label = contentLines.filter(Boolean).join('\n');

		return `
			<div class="saWarningBox ${classes[type] || 'saInfo'}${expandable ? ` saExpandable ${closed ? 'saClosed' : 'saOpen'}` : ''}">
				<div class="saIcon"><i class="fas fa-${escapeHtml(message.icon || icons[type] || icons.info)}"></i></div>
				<div class="saContent${contentLines.length > 1 ? ' saMultiLine' : ''}">
					${contentLines.map(line => `<span>${escapeHtml(line)}</span>`).join('')}
					${message.action ? `<a class="saAction saSmallScreenOnly" tabindex="0" aria-label="${escapeHtml(`${label} ${message.action}`)}">${escapeHtml(message.action)}</a>` : ''}
				</div>
				${expandable ? `
					<div class="saButtons">
						<div class="saWarningExpander${closed ? '' : ' saOpen'}">
							<button class="saWarningButton" type="button" aria-expanded="${closed ? 'false' : 'true'}" aria-label="${escapeHtml(label)}"><i class="far fa-angle-down"></i></button>
						</div>
					</div>` : ''}
				${message.action ? `<div class="saActionWrapper"><a class="saAction saDesktopOnly" tabindex="0" aria-label="${escapeHtml(`${label} ${message.action}`)}">${escapeHtml(message.action)}</a></div>` : ''}
				<div class="saPadding"></div>
				${message.closable === false ? '' : `
					<div class="saClose">
						<button class="saWarningButton" type="button" aria-label="${escapeHtml(`Close. ${label}`)}"><i class="far fa-xmark"></i></button>
					</div>`}
			</div>`;
	}

	function renderInfoBoxes(component) {
		return `
			<softadmin-infosql class="maincolbody infoarea saInfoArea">
				${component.messages && component.messages.length ? `<div class="saWarningArea">${component.messages.map(renderWarningBox).join('')}</div>` : ''}
				${component.boxes && component.boxes.length ? `
					<div class="saInfoBoxAreaWrapper">
						<div class="saInfoBoxArea">
							<div class="saRowWrapper">
								<div class="saColWrapper">
									${component.boxes.map(box => `<div class="saCol">${renderInfoBox(box)}</div>`).join('')}
								</div>
							</div>
						</div>
					</div>` : ''}
			</softadmin-infosql>`;
	}

	function renderGridButton(button, disabled = false) {
		return `
			<button type="button" class="saGridRowButton${disabled ? ' inactive' : ''}" aria-label="${escapeHtml(button.label)}" data-tooltip="${escapeHtml(button.label)}"${disabled ? ' disabled' : ''}>
				<i class="${escapeHtml(button.iconStyle || 'far')} fa-${escapeHtml(button.icon || 'ellipsis-vertical')} icon saIcon"></i>
			</button>`;
	}

	function gridRowActions(component) {
		return component.rowActions?.length ? component.rowActions : [
			{ key: 'open', label: 'Open', icon: 'eye', iconStyle: 'fas' },
			{ key: 'edit', label: 'Edit', icon: 'pen' },
			{ key: 'more', label: 'More...', icon: 'ellipsis-vertical' }
		];
	}

	function renderGridRowControls(actions, rowIndex, row = {}, component = {}) {
		const checkbox = component.selectableRows ? `
			<li class="saGridCheckbox">
				<input class="saCheckbox" type="checkbox" value="${escapeHtml(row.id || rowIndex)}" ${row.selected ? 'checked' : ''}>
			</li>` : '';
		const sharedActions = actions && actions.length ? actions : gridRowActions(component);
		const buttons = sharedActions.map((action, index) => `<li>${renderGridButton(action, isRowActionDisabled(action, index, row))}</li>`).join('');
		const moreButton = component.moreRowButton ? `
			<li><button type="button" class="saGridRowButton" data-tooltip="More..." aria-label="More..." aria-expanded="false"><span><i class="icon far fa-ellipsis-vertical"></i></span></button></li>` : '';
		const expandButton = component.expandableRows ? `
			<li>
				<button type="button" class="saGridRowButton saGridExpandButton" aria-expanded="${row.expanded ? 'true' : 'false'}" aria-label="${row.expanded ? 'Collapse row' : 'Expand row'}">
					<i class="saIcon far fa-angle-down"></i>
				</button>
			</li>` : '';

		return `<td class="saGridRowControls"><ul>${checkbox}${buttons}${moreButton}${expandButton}</ul></td>`;
	}

	function renderGridHeader(column, index) {
		const style = column.width ? ` style="max-width: ${escapeHtml(column.width)};"` : '';
		const sortDirection = String(column.sortDirection || column.sort || 'ascending').toLowerCase();
		const sortIcon = sortDirection === 'descending' || sortDirection === 'desc' ? 'fa-caret-down' : 'fa-caret-up';
		const ariaSort = column.sorted ? ` aria-sort="${sortIcon === 'fa-caret-down' ? 'descending' : 'ascending'}"` : '';
		const inner = column.sortable === false
			? `<div class="saGridHeadingInner"><span class="saGridHeadingLabel">${escapeHtml(column.label)}</span></div>`
			: `<a class="saGridHeadingInner sort${column.sorted ? ' saSorted' : ''}" tabindex="0" data-col-index="${index}" role="link"><span class="saGridHeadingLabel">${escapeHtml(column.label)}</span>${column.sorted ? `<i class="saIcon fas ${sortIcon}" aria-hidden="true"></i>` : ''}</a>`;

		return `
			<th${ariaSort}${style}>
				${inner}
				<img src="./Presentation/img/transparent.png" class="draghandle" draggable="true" aria-hidden="true" data-col-index="${index}" style="height: 30px;">
			</th>`;
	}

	function renderGridCellValue(value) {
		if (value && typeof value === 'object') {
			const icon = value.icon ? `<span class="systemicon saSystemIcon saNoSpinner"><i class="${escapeHtml(value.iconStyle || 'far')} fa-${escapeHtml(value.icon)} ${escapeHtml(value.iconClass || '')} icon saIcon"></i></span>` : '';
			const text = `${icon}<span class="saGridText">${escapeHtml(value.text || '')}</span>`;
			return value.link ? `<a class="saLink" tabindex="0">${text}</a>` : text;
		}

		return `<span class="saGridText">${escapeHtml(value ?? '')}</span>`;
	}

	function gridPlainText(value) {
		if (value && typeof value === 'object') {
			return value.text || '';
		}

		return value || '';
	}

	function isNumericGridColumn(column, value) {
		const type = String(column.type || column.valueType || column.dataType || '').toLowerCase();
		const text = String(gridPlainText(value) || '').trim();
		const columnText = `${column.key || ''} ${column.label || ''}`.toLowerCase();
		const hasNumericType = ['number', 'numeric', 'integer', 'decimal', 'money', 'currency', 'percent', 'percentage'].includes(type);
		const hasNumericName = /(^|[^a-z])(amount|balance|cost|count|hours|price|quantity|qty|rate|sum|tax|total|vat)([^a-z]|$)/.test(columnText);
		const looksNumeric = /^-?[\d\s.,]+(?:%| ?(?:sek|kr|eur|usd|h))?$/i.test(text);

		return Boolean(column.numeric || column.isNumeric || hasNumericType || hasNumericName || looksNumeric);
	}

	function renderGridCell(column, row) {
		const value = row[column.key];
		const classes = [
			column.align === 'right' && isNumericGridColumn(column, value) ? 'right' : '',
			column.align === 'center' ? 'center' : '',
			column.cellClass || ''
		].filter(Boolean).join(' ');
		const style = column.width ? ` style="max-width: ${escapeHtml(column.width)};"` : '';

		return `
			<td${classes ? ` class="${classes}"` : ''}${style}>
				<div class="saGridCell"><nobr>${renderGridCellValue(value)}</nobr></div>
			</td>`;
	}

	function renderGridPagination(component) {
		if (component.pagination === false) {
			return '';
		}

		return `
			<div class="saPagination">
				<button type="button" data-tooltip="First page" aria-label="First page" disabled><i class="saC sa-angle-left-to-line saIcon"></i></button>
				<button type="button" data-tooltip="Previous page" aria-label="Previous page" disabled><i class="far fa-angle-left saIcon"></i></button>
				<div class="saPaginationPages"><input maxlength="1" inputmode="numeric" value="${escapeHtml(component.page || '1')}"><span> of ${escapeHtml(component.pages || '1')}</span></div>
				<button type="button" data-tooltip="Next page" aria-label="Next page"><i class="far fa-angle-right saIcon"></i></button>
				<button type="button" data-tooltip="Last page" aria-label="Last page"><i class="saC sa-angle-right-to-line saIcon"></i></button>
			</div>`;
	}

	function renderGridTop(component) {
		const columns = component.columns || [];
		const isGrouped = component.grouped || (component.rows || []).some(row => row.type === 'groupHeader');
		const configuredGroupOptions = component.groupOptions || columns.map(column => column.label);
		const groupOptions = ['(Nothing)', ...configuredGroupOptions];
		if (component.groupedBy && !groupOptions.includes(component.groupedBy)) groupOptions.push(component.groupedBy);
		const selectedGroup = Math.max(0, groupOptions.indexOf(component.groupedBy || ''));

		return `
			<div class="saGridTop" aria-label="Page navigation">
				<div class="saGridTopInner">
					<div class="saGridHitCounter">
						${escapeHtml(component.hitCounter || `${(component.rows || []).filter(row => !row.type).length} hits`)}
						${component.selectedItems ? `<span class="saSelectedItemsCounter">${escapeHtml(component.selectedItems)} selected</span>` : ''}
					</div>
					${renderGridPagination(component)}
					<div class="saButtons">
						<label class="saInputTextWrapper saLabeled saGroupingGrid${isGrouped ? ' saIsGrouped' : ''}">
							<span class="saLabeledLabel saGroupingGridLabel">Group by</span>
							<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
							<select class="saInputText saDropdown saGridGroupingDropdown">
								${groupOptions.map((option, index) => `<option value="${index}"${index === selectedGroup ? ' selected' : ''}>${escapeHtml(option)}</option>`).join('')}
							</select>
						</label>
						<button class="saGridButton" type="button" data-tooltip="Show, arrange and sort" aria-label="Show, arrange and sort"><span class="saIcon far fa-sliders" aria-hidden="true"></span>${component.hasColumnChanges ? '<div class="saButtonBadge" id="hasChanges" aria-label="Has changes"></div>' : ''}</button>
						<button class="saGridButton saExcel" type="button" data-tooltip="Show in Excel" aria-label="Show in Excel"><span class="saIcon far fa-file-excel" aria-hidden="true"></span></button>
					</div>
				</div>
				${renderGridContentLinks(component.contentLinks)}
			</div>`;
	}

	function renderGridContentLinks(links) {
		if (!links || !links.length) {
			return '';
		}

		return `
			<div class="saComponentContentLinksWrapper">
				<ul class="saComponentContentLinks" role="toolbar">
					${links.map(link => `
						<li class="saActionLink">
							<button class="saComponentContentLinkButton ${link.variant === 'primary' ? 'saButtonPrimary' : 'saButtonSecondary'}${link.destructive ? ' saDestructive' : ''}${link.inactive ? ' saInactive' : ''}" type="button" aria-label="${escapeHtml(link.label)}" ${link.inactive ? 'aria-disabled="true"' : ''}>
								<div class="saIconHolder saOptionIcon" aria-hidden="true"><i class="${escapeHtml(link.iconStyle || 'far')} fa-${escapeHtml(link.icon || 'table-list')} icon saIcon"></i></div>
								<span class="saButtonText saOptionText">${escapeHtml(link.label)}</span>
							</button>
						</li>`).join('')}
					<div class="saCollectorWrapper">
						<button class="saMoreButton" aria-label="More..." data-tooltip="More..." aria-expanded="false" type="button"><i class="far fa-ellipsis-vertical icon saIcon"></i></button>
					</div>
				</ul>
			</div>`;
	}

	function renderGridSpecialHeader(component) {
		if (component.selectableRows) {
			return `
				<th class="saGridRowControls saGridSpecialHeader saLocked saGridCheckbox" colspan="1">
					<ul>
						<li><input class="saCheckbox" type="checkbox" aria-label="Select or deselect checkboxes on this page"></li>
					</ul>
				</th>`;
		}

		if (!component.expandableRows) {
			return '<th class="saGridRowControls saGridSpecialHeader" colspan="1"><ul></ul></th>';
		}

		return `
			<th class="saGridRowControls saGridSpecialHeader saLocked saGridExpandAll" colspan="1">
				<ul>
					<li></li>
					<li>
						<div class="saGridExpandAllButtonWrapper saHideBorder">
							<button class="saGridExpandAllButton" type="button" aria-expanded="false" data-tooltip="Expand all rows" aria-label="Expand all rows">
								<i class="saIcon saIcon far fa-angle-down" aria-hidden="true"></i>
							</button>
						</div>
					</li>
				</ul>
			</th>`;
	}

	function renderGridBodyRow(component, row, index, columns) {
		if (row.type === 'groupHeader') {
			const heading = `<span class="saLinkText">${escapeHtml(row.label || '')}</span>`;
			return `
				<tr class="saGridGroupedRowsHeader">
					<th colspan="${columns.length + 1}" style="top: 141px;">${row.clickable === false ? `<span class="saGridGroupedRowsHeaderText">${heading}</span>` : `<a class="saLink saGridGroupedRowsHeaderText" tabindex="0">${heading}</a>`}</th>
				</tr>`;
		}

		if (row.type === 'subtotal' || row.type === 'aggregate') {
			return renderGridAggregateRow(row, columns);
		}

		if (row.type === 'extraText') {
			return `
				<tr class="saGridExtraText">
					<td colspan="1" style="width: 0px;"></td>
					<td colspan="${columns.length}" tabindex="-1">${row.html || `<p>${escapeHtml(row.text || '')}</p>`}</td>
				</tr>`;
		}

		const classes = [
			'saGridRow',
			index > 0 && index % 5 === 0 ? 'saGridRowEvery5th' : '',
			'hascontextmenu',
			row.expanded ? 'saOpened' : ''
		].filter(Boolean).join(' ');

		return `
			<tr class="${classes}" data-sa-row-id="${escapeHtml(row.id || index)}">
				${renderGridRowControls(component.rowActions, index, row, component)}
				${columns.map(column => renderGridCell(column, row)).join('')}
			</tr>`;
	}

	function renderGridAggregateRow(aggregate, columns) {
		const values = aggregate.values || {};
		return `
			<tr class="aggregate">
				<td colspan="1" class="right"><div class="saGridCell saAggregateLabel">${escapeHtml(aggregate.label || 'Subtotal')}</div></td>
				${columns.map(column => {
					const value = values[column.key];
					const classes = value !== undefined && isNumericGridColumn(column, value) ? ' class="right"' : '';
					return `<td${classes}><div class="saGridCell">${value === undefined || value === null || value === '' ? '' : `<nobr>${renderGridCellValue(value)}</nobr>`}</div></td>`;
				}).join('')}
			</tr>`;
	}

	function renderListGridAction(action, index, row) {
		const isMore = /more/i.test(action.label || '') || action.icon === 'ellipsis-vertical';
		const classes = isMore ? 'saListGridMoreButton' : 'saListGridRowLink';
		const text = isMore ? '' : `<span class="saButtonText">${escapeHtml(action.shortLabel || action.label)}</span>`;
		const disabled = isRowActionDisabled(action, index, row);

		return `
			<button type="button" class="${classes}${disabled ? ' saDisabled' : ''}" aria-label="${escapeHtml(action.label)}" ${disabled ? 'disabled' : ''}>
				<i class="${escapeHtml(action.iconStyle || 'far')} fa-${escapeHtml(action.icon || 'ellipsis-vertical')} icon saIcon"></i>
				${text}
			</button>`;
	}

	function renderListGridRow(component, row, index) {
		const columns = component.columns || [];
		if (row.type === 'groupHeader') {
			return `<span class="saGroupHead"><span class="saLinkText">${escapeHtml(row.label || '')}</span></span>`;
		}
		if (row.type === 'subtotal' || row.type === 'aggregate') {
			return renderListGridAggregate(row, columns);
		}
		if (row.type) {
			return '';
		}
		const titleColumn = columns.find(column => column.key === component.mobileTitleKey) || columns[0];
		const descriptionColumn = columns.find(column => column.key === component.mobileDescriptionKey) || columns[1];
		const bodyColumns = columns.filter(column => column !== titleColumn && column !== descriptionColumn);
		const actions = gridRowActions(component);

		return `
			<div class="saRow saOpen" data-sa-row-id="${index}">
				<div class="saRowHeading">
					<button type="button" class="saRowHeadingInner">
						<span class="saRowHeadingTextWrapper">
							<h3>${renderGridCellValue(row[titleColumn.key])}</h3>
							${descriptionColumn ? `<span class="saRowHeadingDescription">${renderGridCellValue(row[descriptionColumn.key])}</span>` : ''}
						</span>
						<span class="saExpandButton"><i class="saIcon far fa-angle-down"></i></span>
					</button>
				</div>
				<div class="saRowBody">
					${bodyColumns.map(column => `
						<div class="saCellWrapper">
							<div class="saCellLabel">${escapeHtml(column.label)}</div>
							<div class="saCellText">${renderGridCellValue(row[column.key])}</div>
						</div>`).join('')}
					<div class="saActionRow">
						${actions.map((action, actionIndex) => renderListGridAction(action, actionIndex, row)).join('')}
					</div>
				</div>
			</div>`;
	}

	function renderListGridAggregate(aggregate, columns) {
		const values = aggregate.values || {};
		const populated = columns.filter(column => values[column.key] !== undefined && values[column.key] !== null && values[column.key] !== '');
		return `
			<div class="saRow saListGridAggregate">
				<div class="saRowHeading"><div class="saRowHeadingInner"><span class="saRowHeadingTextWrapper"><h3>${escapeHtml(aggregate.label || 'Subtotal')}</h3></span></div></div>
				<div class="saRowBody">
					${populated.map(column => `<div class="saCellWrapper"><div class="saCellLabel">${escapeHtml(column.label)}</div><div class="saCellText">${renderGridCellValue(values[column.key])}</div></div>`).join('')}
				</div>
			</div>`;
	}

	function renderListGrid(component) {
		const rows = component.rows || [];

		return `
			<div class="maincolbody grid saMockSmallScreenOnly">
				<div class="saListGrid">
					${renderGridTop(component)}
					<div class="saListGridInner">
						${component.title ? `<span class="saGroupHead"><span class="saLinkText">${escapeHtml(component.title)}</span></span>` : ''}
						${rows.map((row, index) => renderListGridRow(component, row, index)).join('')}
						${component.total ? renderListGridAggregate(component.total, component.columns || []) : ''}
					</div>
				</div>
			</div>`;
	}

	function renderResultGrid(component) {
		const columns = component.columns || [];
		const rows = component.rows || [];
		const isListPage = component.variant === 'listpage' || component.listPage;
		const desktopBody = `
			<div class="maincolbody ${isListPage ? 'listpage saNotUsingAccessibilityMode stickyheader' : 'grid'}">
				<div class="saGridWrapper">
					${renderGridTop(component)}
					<table class="saGrid" cellpadding="0" cellspacing="0">
						<caption>${escapeHtml(component.caption || component.title || 'Result')}</caption>
						<thead class="saGridHead stickyheader">
							<tr class="saGridHeadingRow" tabindex="0" aria-label="Use arrow keys to adjust column width. Press space or enter to sort.">
								${renderGridSpecialHeader(component)}
								${columns.map(renderGridHeader).join('')}
							</tr>
						</thead>
						<tbody>
							${rows.map((row, index) => renderGridBodyRow(component, row, index, columns)).join('')}
						</tbody>
						${component.total ? `<tfoot class="saGridFoot">${renderGridAggregateRow(component.total, columns)}</tfoot>` : ''}
					</table>
					${component.bottomPagination ? renderGridPagination(component) : ''}
				</div>
			</div>`;

		return `
			${isListPage ? `<softadmin-grid class="grid saMenuItemRoot saMockLargeScreenOnly">${desktopBody}</softadmin-grid>` : `<div class="saMockLargeScreenOnly">${desktopBody}</div>`}
			${renderListGrid(component)}`;
	}

	function renderPartHeader(part) {
		if (part.hideHeader) {
			return '';
		}

		return `
			<div class="saPartHeader">
				<div class="saPartHeading">
					<div class="saPartTitleWrapper">
						<h2>${escapeHtml(part.title || 'Part')}</h2>
					</div>
					<div class="saExpandWrapper">
						<button class="saExpand" type="button" aria-expanded="true"><i class="saIcon far fa-angle-up"></i></button>
					</div>
				</div>
			</div>`;
	}

	function renderMultipartPart(part, index) {
		const component = part.component || {};

		return `
			<div class="saMultiPartPanel${part.border === false ? '' : ' saHasBorder'}" style="visibility: visible;">
				${renderPartHeader(part)}
				<div class="saMultiPartContent">
					<div class="menuitem">
						${renderComponent(component)}
					</div>
				</div>
			</div>`;
	}

	function renderMultipart(component) {
		return `
			<div class="maincolbody multipartpanel">
				<div class="saMultiPartContainer">
					${(component.parts || []).map(renderMultipartPart).join('')}
				</div>
			</div>`;
	}

	function renderCalendarHeader(component) {
		const isResourceMode = normalizeCalendarMode(component.mode) === 'Resources with time scale';
		const periodLabel = isResourceMode ? (component.dayLabel || 'Day') : (component.weekLabel || 'Week');
		const periodValue = isResourceMode ? (component.day || '') : (component.week || '');

		return `
			<div class="saCalendarHeader">
				<div class="saCalendarHeaderInner">
					<h2 class="saCalendarHeading">${escapeHtml(component.heading || 'Week calendar')}</h2>
					<div class="saPeriodButtons">
						<button type="button" aria-label="${escapeHtml(component.previousLabel || 'Previous week')}"><i class="saIcon far fa-angle-left"></i></button>
						<button type="button" aria-label="${escapeHtml(component.nextLabel || 'Next week')}"><i class="saIcon far fa-angle-right"></i></button>
					</div>
					<label class="saInputTextWrapper saLabeled">
						<span class="saLabeledLabel">${escapeHtml(component.yearLabel || 'Year')}</span>
						<select class="saInputText saDropdown">
							${(component.years || ['2025', '2026', '2027']).map(year => `<option ${year === component.year ? 'selected' : ''}>${escapeHtml(year)}</option>`).join('')}
						</select>
						<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
					</label>
					<label class="saInputTextWrapper saLabeled">
						<span class="saLabeledLabel">${escapeHtml(component.monthLabel || 'Month')}</span>
						<select class="saInputText saDropdown">
							${(component.months || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']).map(month => `<option ${month === component.month ? 'selected' : ''}>${escapeHtml(month)}</option>`).join('')}
						</select>
						<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
					</label>
					<label class="saInputTextWrapper saLabeled">
						<span class="saLabeledLabel">${escapeHtml(periodLabel)}</span>
						<input class="saInputText saNumberInput" type="number" value="${escapeHtml(periodValue)}">
					</label>
					<button class="saTodayButton" type="button">${escapeHtml(component.todayLabel || 'Today')}</button>
				</div>
			</div>`;
	}

	function renderCalendarSidebar(component) {
		const filters = component.filters || [];
		const monthDays = component.sidebarDays || [
			['', '22', '23', '24', '25', '26', '27', '28'],
			['26', '29', '30', '1', '2', '3', '4', '5'],
			['27', '6', '7', '8', '9', '10', '11', '12'],
			['28', '13', '14', '15', '16', '17', '18', '19'],
			['29', '20', '21', '22', '23', '24', '25', '26']
		];

		return `
			<div class="saCalendarSidebar">
				<div class="saCalendarSidebarInner">
					<div class="saCalendarSidebarSection saSidebarCalendar">
						<div class="saDatePickerRoot">
							<div class="saDatePickerMonthHeading">
								<a><i class="saIcon far fa-angle-left"></i></a>
								<span class="saCalendarSidebarHeading">${escapeHtml(component.sidebarHeading || `${component.month || 'June'} ${component.year || '2026'}`)}</span>
								<a><i class="saIcon far fa-angle-right"></i></a>
							</div>
							<div class="saDayRow">
								<span class="saWeekNr saEmpty"></span>
								${(component.dayHeadingsShort || ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map(day => `<span class="saDay">${escapeHtml(day)}</span>`).join('')}
							</div>
							${monthDays.map(row => `
								<div class="saDateRow">
									<span class="saWeekNr${row[0] ? '' : ' saEmpty'}">${escapeHtml(row[0])}</span>
									${row.slice(1).map(day => `<button class="saDate${day === component.currentSidebarDay ? ' saSelected' : ''}${day === component.todaySidebarDay ? ' saToday' : ''}" type="button">${escapeHtml(day)}</button>`).join('')}
								</div>`).join('')}
						</div>
					</div>
					<div class="saCalendarSidebarSection saSidebarFilters">
						<span class="saCalendarSidebarHeading">${escapeHtml(component.filterHeading || 'Filter')}</span>
						<label class="saInputTextWrapper saLabeled">
							<span class="saLabeledLabel">${escapeHtml(component.resourceLabel || 'User')}</span>
							<select class="saInputText saDropdown">
								${(component.resources || ['Anna Andersson', 'Erik Johansson', 'Maria Lindberg']).map(resource => `<option ${resource === component.resource ? 'selected' : ''}>${escapeHtml(resource)}</option>`).join('')}
							</select>
							<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
						</label>
						${filters.map(renderCalendarFilter).join('')}
					</div>
				</div>
			</div>`;
	}

	function renderCalendarFilter(filter) {
		if (filter.control === 'dropdown' || Array.isArray(filter.options)) {
			const options = filter.options || ['Hide', 'Show'];
			return `
				<label class="saInputTextWrapper saLabeled${filter.disabled ? ' saDisabled' : ''}">
					<span class="saLabeledLabel">${escapeHtml(filter.label)}</span>
					<select class="saInputText saDropdown" ${filter.disabled ? 'disabled' : ''}>
						${options.map(option => {
							const value = typeof option === 'object' ? option.value : option;
							const label = typeof option === 'object' ? option.label : option;
							return `<option${String(value) === String(filter.value) ? ' selected' : ''}>${escapeHtml(label)}</option>`;
						}).join('')}
					</select>
					<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
				</label>`;
		}

		return `
			<label class="saToggleWrapper${filter.disabled ? ' saDisabled' : ''}">
				<span class="saToggleLabelWrapper">
					<span class="saToggleLabel">${escapeHtml(filter.label)}</span>
					${filter.description ? `<span class="saToggleDescription">${escapeHtml(filter.description)}</span>` : ''}
				</span>
				<input class="saToggle" type="checkbox" ${filter.checked === false ? '' : 'checked'} ${filter.disabled ? 'disabled' : ''}>
			</label>`;
	}

	function renderCalendarActivity(activity) {
		const color = activity.color || (activity.allDay ? 'rgb(255, 204, 204)' : 'rgb(133, 147, 173)');

		return `
			<li class="saActivity${activity.clickable === false ? '' : ' saClickable'}${activity.allDay ? ' saAllDay' : ''}">
				<div class="saActivityLine" style="background-color: ${escapeHtml(color)};"></div>
				<div class="saActivityInner">
					<div class="saActivityHeadingWrapper">
						<div class="saActivityHeading">${escapeHtml(activity.title)}</div>
					</div>
					${activity.description ? `<div class="saActivityDescription">${escapeHtml(activity.description)}</div>` : ''}
				</div>
			</li>`;
	}

	function renderCalendarDate(day) {
		const classes = ['saDateX', day.today ? 'saDateIsToday' : '', day.current ? 'saDateIsCurrent' : '', day.redDay ? 'saRedDay' : '', day.clickable === false ? '' : 'saClickable'].filter(Boolean).join(' ');

		return `
			<div class="${classes}" role="cell" aria-label="${escapeHtml(day.date)}">
				<div class="saDateInner">
					<time class="saDateNumber" datetime="${escapeHtml(day.date)}">${escapeHtml(calendarDateNumber(day))}</time>
					<ul class="saActivityGroup">
						${(day.activities || []).map(renderCalendarActivity).join('')}
					</ul>
				</div>
			</div>`;
	}

	function renderCalendarWeek(week) {
		return `
			<div class="saWeek" role="row">
				<time class="saWeekNumber" role="rowheader" datetime="${escapeHtml(week.id || '')}" aria-label="${escapeHtml(week.label || '')}">${escapeHtml(week.number || '')}</time>
				${(week.days || []).map(renderCalendarDate).join('')}
			</div>`;
	}

	function renderSmallCalendarDate(day) {
		const dateNumber = calendarDateNumber(day);
		const dateClasses = [
			'saDateNumber',
			(day.activities || []).length ? 'saHasItems' : '',
			day.today ? 'saDateIsToday' : '',
			day.current ? 'saDateIsCurrent' : '',
			day.redDay ? 'saRedDay' : '',
			String(dateNumber).length > 2 ? 'saWideDate' : ''
		].filter(Boolean).join(' ');

		return `
			<div class="saWeekDay">
				<button class="${dateClasses}" type="button" aria-label="${escapeHtml(day.date)}">
					<span class="saDateNumberInner">${escapeHtml(dateNumber)}</span>
				</button>
			</div>`;
	}

	function renderSmallCalendarWeek(week) {
		return `
			<div class="saWeek" role="row">
				<time class="saWeekNumber" role="rowheader" datetime="${escapeHtml(week.id || '')}" aria-label="${escapeHtml(week.label || '')}">${escapeHtml(week.number || '')}</time>
				${(week.days || []).map(renderSmallCalendarDate).join('')}
			</div>`;
	}

	function renderSmallCalendarActivity(activity) {
		const color = activity.color || (activity.allDay ? 'rgb(255, 204, 204)' : 'rgb(133, 147, 173)');

		return `
			<div class="saListActivity${activity.allDay ? ' saAllDay' : ''}">
				<div class="saListActivityInner">
					<div class="saActivityLine" style="background-color: ${escapeHtml(color)};"></div>
					<span class="saListActivityHeading">${escapeHtml(activity.title)}</span>
					${activity.description ? `<span class="saListActivityDescription">${escapeHtml(activity.description)}</span>` : ''}
					${activity.time ? `<span class="saListActivityTime">${escapeHtml(activity.time)}</span>` : ''}
					<button class="saIcon far fa-ellipsis-vertical" type="button" aria-label="${escapeHtml(activity.title)}"></button>
				</div>
			</div>`;
	}

	function renderSmallCalendarDayList(day) {
		return `
			<div class="saDateListWrapper">
				<div class="saDateListHeadingWrapper">
					<div class="saDateListHeading">
						<span>${escapeHtml(day.dateHeading || day.day)}</span>
						<span>${escapeHtml(day.date)}</span>
					</div>
					<button class="saIcon far fa-plus" type="button" aria-label="${escapeHtml(`New entry ${day.date}`)}"></button>
				</div>
				<div class="saDateList">
					${(day.activities || []).length
						? day.activities.map(renderSmallCalendarActivity).join('')
						: '<div class="saEmptyState">No entries</div>'}
				</div>
			</div>`;
	}

	function renderSmallCalendarWeekdays(component) {
		const dayHeadings = component.dayHeadingsShort || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		const weeks = component.weeks || [];
		const selectedWeek = weeks[0] || { days: [] };
		const selectedDay = selectedWeek.days.find(day => day.current) || selectedWeek.days[0] || {};

		return `
			<div class="saCalendarSection saSmallScreenCalendar saWeekdaysCalendar saMockSmallScreenOnly">
				<div class="saCalendarHeader">
					<div class="saCalendarHeaderSmallScreen">
						<div class="saCalendarHeaderInnerSmallScreen">
							<button class="saCalendarHeaderButton" type="button">
								<span>${escapeHtml(component.heading || 'Week calendar')}</span>
								<i class="saIcon far fa-angle-down"></i>
							</button>
							<div class="saButtons">
								<button class="saCalendarHeadingButton" type="button" aria-label="${escapeHtml(component.previousLabel || 'Previous week')}"><i class="saIcon far fa-angle-left"></i></button>
								<button class="saCalendarHeadingButton" type="button" aria-label="${escapeHtml(component.nextLabel || 'Next week')}"><i class="saIcon far fa-angle-right"></i></button>
								<button class="saCalendarHeadingButton" type="button">${escapeHtml(component.todayLabel || 'Today')}</button>
							</div>
						</div>
					</div>
				</div>
				<div class="saCalendar">
					<div class="saCalendarHeaderInnerRow">
						<div class="saWeek saWeekDays" role="row">
							<time class="saWeekNumber" role="columnheader"></time>
							${dayHeadings.map(day => `<div class="saWeekDay" role="columnheader">${escapeHtml(day)}</div>`).join('')}
						</div>
						<div class="saWeeks">
							${renderSmallCalendarWeek(selectedWeek)}
						</div>
					</div>
					<div class="saCalendarListOuter">
						<div class="saCalendarList">
							<div class="saCalendarListInner">
								${renderSmallCalendarDayList(selectedDay)}
							</div>
						</div>
					</div>
				</div>
			</div>`;
	}

	function normalizeCalendarMode(mode) {
		const key = String(mode || 'Weekdays').trim().toLowerCase().replace(/[\s_-]+/g, ' ');
		if (key === 'weekdays with time scale' || key === 'weekday with time scale' || key === 'weekdays timescale') return 'Weekdays with time scale';
		if (key === 'resources with time scale' || key === 'resource with time scale' || key === 'resources timescale') return 'Resources with time scale';
		return 'Weekdays';
	}

	function calendarDateNumber(day) {
		const isoMatch = String(day?.date || '').match(/^\d{4}-\d{2}-(\d{2})/);
		if (isoMatch) return String(Number(isoMatch[1]));
		const dayMatch = String(day?.day || '').match(/\b(\d{1,2})\b/);
		return dayMatch ? String(Number(dayMatch[1])) : '';
	}

	function calendarDateLabel(day) {
		return day?.dateLabel || calendarDateNumber(day);
	}

	function calendarMinutes(value) {
		const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/);
		return match ? (Number(match[1]) * 60) + Number(match[2]) : null;
	}

	function renderCalendarScheduleActivity(activity, startMinutes, pixelsPerMinute) {
		const activityStart = calendarMinutes(activity.start);
		const activityEnd = calendarMinutes(activity.end);
		const top = Number.isFinite(Number(activity.top))
			? Number(activity.top)
			: Math.max(0, ((activityStart ?? startMinutes) - startMinutes) * pixelsPerMinute);
		const height = Number.isFinite(Number(activity.height))
			? Number(activity.height)
			: Math.max(24, ((activityEnd ?? ((activityStart ?? startMinutes) + 60)) - (activityStart ?? startMinutes)) * pixelsPerMinute - 2);
		const color = activity.color || '#1668e0';
		const textColor = activity.textColor || '#ffffff';
		const description = activity.description || activity.time || (activity.start && activity.end ? `${activity.start}-${activity.end}` : '');

		return `
			<div class="saScheduleActivity saIgnoreOnDropJs${activity.clickable === false ? '' : ' saClickable'}" style="left: calc(0% + 4px); width: calc(100% - 4px); top: ${top}px; height: ${height}px; background-color: ${escapeHtml(color)};">
				<div class="saScheduleActivityInner" style="color: ${escapeHtml(textColor)};">
					<div class="saScheduleActivityHeadingWrapper"><span class="saListActivityHeading">${escapeHtml(activity.title || '')}</span></div>
					${description ? `<span class="saListActivityDescription">${escapeHtml(description)}</span>` : ''}
				</div>
			</div>`;
	}

	function renderCalendarAllDayActivity(activity) {
		const color = activity.color || '#dbeaff';
		const textColor = activity.textColor || '#172033';
		return `
			<div class="saScheduleActivity saAllDay${activity.clickable === false ? '' : ' saClickable'}" style="background-color: ${escapeHtml(color)};">
				<div class="saScheduleActivityInner" style="color: ${escapeHtml(textColor)};">
					<div class="saScheduleActivityHeadingWrapper"><span class="saListActivityHeading">${escapeHtml(activity.title || '')}</span></div>
					${activity.description ? `<span class="saListActivityDescription">${escapeHtml(activity.description)}</span>` : ''}
				</div>
			</div>`;
	}

	function renderCalendarTimeScaleBody(columns, options) {
		const { columnWidth, timeSlots, slotHeight, stripeMarkup, startMinutes, pixelsPerMinute, currentTime } = options;
		return `
			<div class="saCalendarInnerWrapper">
				<div class="saCalendarInner" role="rowgroup">
					<div class="saWeek saWeekExtra" role="row">
						<div class="saSlotWrapper"></div>
						${columns.map(column => `<div class="saWeekExtraInner" style="min-width: ${columnWidth}px;">${(column.activities || []).filter(activity => activity.allDay).map(renderCalendarAllDayActivity).join('')}</div>`).join('')}
					</div>
					<div class="saWeek" role="row">
						<div class="saSlotWrapper">${timeSlots.map(slot => `<div class="saSlot" style="min-height: ${slotHeight}px;"><div class="saSlotInner">${escapeHtml(slot)}</div></div>`).join('')}</div>
						${columns.map(column => {
							const activities = (column.activities || []).filter(activity => !activity.allDay);
							const hasLinks = activities.some(activity => activity.clickable !== false);
							return `<div class="saCalendarItemList" role="cell" style="min-width: ${columnWidth}px;"><div class="saCalendarItemListInner${hasLinks ? ' saHasLinks' : ''}">${stripeMarkup}${column.current && currentTime ? `<div class="saCurrentTime" style="top: ${Math.max(0, ((calendarMinutes(currentTime) ?? startMinutes) - startMinutes) * pixelsPerMinute)}px;"></div>` : ''}${activities.map(activity => renderCalendarScheduleActivity(activity, startMinutes, pixelsPerMinute)).join('')}</div></div>`;
						}).join('')}
					</div>
				</div>
			</div>`;
	}

	function renderCalendarTimeScale(component, mode) {
		const weeks = component.weeks || [];
		const selectedWeek = weeks[0] || { days: [] };
		const dayHeadings = component.dayHeadings || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		const columns = mode === 'Resources with time scale'
			? (component.resourceColumns || []).map(resource => ({
				label: resource.label || resource.name || '',
				activities: resource.activities || [],
				current: resource.current
			}))
			: (selectedWeek.days || []).map((day, index) => ({
				...day,
				label: day.weekday || dayHeadings[index] || day.day || ''
			}));
		const timeSlots = component.timeSlots || ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'];
		const slotHeight = Math.max(16, Number(component.slotHeight) || 30);
		const startMinutes = calendarMinutes(timeSlots[0]) ?? 480;
		const secondSlotMinutes = calendarMinutes(timeSlots[1]);
		const slotMinutes = secondSlotMinutes === null ? 30 : Math.max(1, secondSlotMinutes - startMinutes);
		const pixelsPerMinute = slotHeight / slotMinutes;
		const stripeMarkup = timeSlots.map((slot, index) => `<div class="saCalendarStripe" style="height: ${slotHeight}px; top: ${index * slotHeight}px;"></div>`).join('');
		const columnWidth = Math.max(96, Number(component.columnWidth) || 128);
		const sectionClass = mode === 'Resources with time scale' ? 'saResourceCalendar' : 'saWeekdaysCalendar';
		const bodyOptions = { columnWidth, timeSlots, slotHeight, stripeMarkup, startMinutes, pixelsPerMinute, currentTime: component.currentTime };

		return `
			<softadmin-calendar class="calendar maincolbody saMenuItemRoot">
				<div class="saCalendarSection saDesktopCalendar saTimeScheduleCalendar ${sectionClass}">
					${renderCalendarHeader(component)}
					<div class="saCalendarSectionInner">
						${component.sidebar === false ? '' : renderCalendarSidebar(component)}
						<div class="saCalendar">
							<div class="saWeek saWeekDays">
								<time class="saWeekNumber"><button type="button" class="saIcon far fa-angles-left saCalendarSidebarExpander" aria-label="${escapeHtml(component.collapseSidebarLabel || 'Collapse menu')}"></button></time>
								${columns.map(column => `<div class="saWeekDay" style="min-width: ${columnWidth}px;">${escapeHtml(column.label)}</div>`).join('')}
							</div>
							${mode === 'Weekdays with time scale'
								? (weeks.length ? weeks : [selectedWeek]).map(week => {
									const weekColumns = (week.days || []).map((day, index) => ({ ...day, label: day.weekday || dayHeadings[index] || day.day || '' }));
									return `
										<div class="saWeek saWeekExtra saWeekDates" role="row">
											<time class="saWeekNumber" role="rowheader">${escapeHtml(week.number || component.week || '')}</time>
											${weekColumns.map(day => `<div class="saWeekExtraInner${day.redDay ? ' saRedDay' : ''}${day.clickable === false ? '' : ' saClickable'}" style="min-width: ${columnWidth}px;"><time class="saDateNumber" datetime="${escapeHtml(day.date || '')}">${escapeHtml(calendarDateLabel(day))}</time></div>`).join('')}
										</div>
										${renderCalendarTimeScaleBody(weekColumns, bodyOptions)}`;
								}).join('')
								: renderCalendarTimeScaleBody(columns, bodyOptions)}
						</div>
					</div>
				</div>
			</softadmin-calendar>`;
	}

	function renderCalendarWeekdays(component) {
		const mode = normalizeCalendarMode(component.mode);
		if (mode !== 'Weekdays') return renderCalendarTimeScale(component, mode);
		const dayHeadings = component.dayHeadings || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

		return `
			<softadmin-calendar class="calendar maincolbody saMenuItemRoot">
				<div class="saCalendarSection saDesktopCalendar saWeekdaysCalendar">
					${renderCalendarHeader(component)}
					<div class="saCalendarSectionInner">
						${component.sidebar === false ? '' : renderCalendarSidebar(component)}
						<div class="saCalendar${component.manyItems ? ' saManyItems' : ''}" role="table">
							<div class="saWeek saWeekDays" role="row">
								<time class="saWeekNumber" role="columnheader">
									<button class="saIcon far fa-angles-left saCalendarSidebarExpander" type="button" aria-label="${escapeHtml(component.collapseSidebarLabel || 'Collapse menu')}"></button>
								</time>
								${dayHeadings.map(day => `<div class="saWeekDay" role="columnheader">${escapeHtml(day)}</div>`).join('')}
							</div>
							<div class="saCalendarInnerWrapper">
								<div class="saCalendarInner" role="rowgroup">
									${(component.weeks || []).map(renderCalendarWeek).join('')}
								</div>
							</div>
						</div>
					</div>
				</div>
			</softadmin-calendar>`;
	}

	function renderDetailTab(tab, index, selectedIndex) {
		const isSelected = index === selectedIndex;

		return `
			<div>
				<button class="saTab${isSelected ? ' saSelected' : ''}" role="tab" type="button" aria-selected="${isSelected ? 'true' : 'false'}">
					${tab.icon ? `<span>${iconHtml(tab.icon)}</span>` : '<span></span>'}
					<span class="saTabText">${escapeHtml(tab.label)}</span>
					${tab.badge ? `<span class="saBadgeCount saBadgeCountJs">${escapeHtml(tab.badge)}</span>` : ''}
				</button>
			</div>`;
	}

	function renderDetailMoreTab(tabs, selectedIndex, visibleCount) {
		const hiddenTabs = tabs.slice(visibleCount);

		if (!hiddenTabs.length) {
			return '';
		}

		return `
			<div class="saMoreTabWrapper">
				<button class="saTab saMoreTab" type="button" aria-label="More tabs">
					<div class="saMoreTabInner">
						<i class="saIcon far fa-ellipsis"></i>
					</div>
				</button>
				<ul class="saContextMenu saSouth" tabindex="0">
					${hiddenTabs.map((tab, offset) => {
						const tabIndex = visibleCount + offset;
						const isSelected = tabIndex === selectedIndex;
						return `
							<li class="saOptionWrapper${isSelected ? ' saSelected' : ''}">
								<button role="tab" type="button">
									<span class="saTabText">${escapeHtml(tab.label)}</span>
									${tab.badge ? `<span class="saBadgeCount saBadgeCountJs">${escapeHtml(tab.badge)}</span>` : ''}
								</button>
							</li>`;
					}).join('')}
				</ul>
			</div>`;
	}

	function renderDetailTabView(component) {
		const tabs = component.tabs || [];
		const selectedIndex = Math.max(0, tabs.findIndex(tab => tab.selected));
		const activeTab = tabs[selectedIndex] || tabs[0] || {};
		const visibleCount = component.visibleTabs || Math.min(tabs.length, 7);

		return `
			<softadmin-tabview class="maincolbody saMenuItemRoot saTabView saIFrameTabs">
				<div class="saTabViewInner">
					<div class="saTabGroup" role="tablist">
						${tabs.slice(0, visibleCount).map((tab, index) => renderDetailTab(tab, index, selectedIndex)).join('')}
						${renderDetailMoreTab(tabs, selectedIndex, visibleCount)}
					</div>
					<div class="saTabContent">
						<div>
						<div class="iframecontent right saMiniView saFitToContent saLargeScreen saPc saCompact" role="tabpanel">
								${renderDetailTabPanelHeader(activeTab)}
								<div class="scrollcontent-inner">
									${activeTab.component ? renderComponent(activeTab.component) : ''}
								</div>
							</div>
						</div>
					</div>
				</div>
			</softadmin-tabview>`;
	}

	function renderDetailTabPanelHeader(tab) {
		const title = tab.panelTitle || tab.label || 'Details';

		return `
			<header class="saPageHeaderHolder">
				<div class="saPageHeader saDesktopHeader">
					<div class="saHeader">
						<div class="saRowWrapper">
							<div class="saTopRow">
								<div class="saTitle">
									<h2 class="saHeaderText">${escapeHtml(title)}</h2>
									<ul class="saSpecialLinksWrapper">
										<li class="saNoSpinner">
											<button type="button" aria-label="Show in fullscreen" data-tooltip="Show in fullscreen">
												<i class="far fa-expand icon saIcon"></i>
											</button>
										</li>
									</ul>
								</div>
							</div>
							<nav class="saNavigationBar" style="display: none;"></nav>
						</div>
					</div>
				</div>
				<div class="saPageHeader saSmallScreenHeader">
					<div class="saHeader">
						<div class="saHeaderInner">
							<div class="saTopRow">
								<div class="saHeaderWrapper">
									<div class="saTitle">
										<h1 class="saHeaderText">${escapeHtml(title)}</h1>
									</div>
								</div>
								<button class="saNavigator saButtonHeader" type="button" aria-label="Open menu" data-tooltip="Open menu">
									<div class="saNavBar"><i class="saIcon far fa-bars"></i></div>
								</button>
							</div>
						</div>
						<nav class="saBottomRow saActionLinkBar" style="display: none;"></nav>
					</div>
				</div>
			</header>`;
	}

	function renderDetailView(component) {
		return `
			${component.infoBoxes ? renderInfoBoxes(component.infoBoxes) : ''}
			${renderDetailTabView(component)}`;
	}

	const componentRenderers = {
		BankID: renderBankId,
		CalendarWeekdays: renderCalendarWeekdays,
		Chat: renderChat,
		DetailView: renderDetailView,
		EnterpriseSearch: renderEnterpriseSearch,
		ImageGallery: renderImageGallery,
		InlineDocument: renderInlineDocument,
		InfoBoxes: renderInfoBoxes,
		LinearProcess: renderLinearProcess,
		LinkList: renderLinkList,
		MenuGroups: renderMenuGroups,
		Multipart: renderMultipart,
		NewEdit: renderNewEdit,
		PdfTemplateEditor: renderPdfTemplateEditor,
		Planner: renderPlanner,
		PivotGrid: renderPivotGrid,
		RadioCards: renderRadioCards,
		ResultGrid: renderResultGrid,
		Treeview: renderTreeview
	};

	function renderComponent(component) {
		const renderer = componentRenderers[component.type];
		return renderer ? renderer(component) : '';
	}

	function renderSpec(spec, root) {
		root.innerHTML = (spec.components || []).map(renderComponent).join('');
	}

	window.SoftadminMockups = {
		registry,
		renderNewEditField: renderField,
		renderSpec
	};
}());
