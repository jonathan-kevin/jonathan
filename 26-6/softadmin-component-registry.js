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
			Calendar: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Calendar',
				description: 'Calendar component. The mock renderer currently supports the Weekdays mode.',
				implemented: true,
				implementedModes: ['Weekdays'],
				renderType: 'CalendarWeekdays'
			},
			Detailview: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Detailview',
				description: 'Detail page pattern with summary information boxes followed by tabbed related content.',
				implemented: true,
				renderType: 'DetailView'
			},
			Grid: {
				docs: 'https://documentation.softadmin.com/softadmin.aspx?id=5&Component=Grid',
				description: 'Tabular result component with toolbar, sortable columns, row actions and small-screen list-grid rendering.',
				implemented: true,
				renderType: 'ResultGrid'
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
				description: 'Mock renderer for Calendar in Weekdays mode.',
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

	function renderSectionHeader(section) {
		const checkbox = section.checkbox
			? `<label class="saCheckboxControl saCheckboxWrapper"><input class="saCheckbox" type="checkbox" ${section.checkbox.checked ? 'checked' : ''}></label>`
			: '';

		return `
			<legend class="saSectionHeaderWrapper">
				<div class="saSectionHeader${section.checkbox ? ' saSectionHeaderWithCheckbox' : ''}">
					${checkbox}<h2>${escapeHtml(section.heading)}</h2>
				</div>
			</legend>`;
	}

	function renderNewEditSection(section, index, sections) {
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
				${renderSectionHeader(section)}
				<fieldset class="saFieldCollection ${escapeHtml(section.width || 'long')}">
					${(section.fields || []).map(renderField).join('')}
				</fieldset>
			</fieldset>`;
	}

	function renderNewEdit(component) {
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
						<fieldset class="saFormRoot saLabelsAbove">
							<div class="saSectionWrapper">
								${(component.sections || []).map(renderNewEditSection).join('')}
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

	function renderInfoBox(box) {
		return `
			<div class="saInfoBox${box.collapsed ? ' saClosed' : ' saOpen'}">
				<button class="saInfoBoxHeading saInfoBoxHeadingButton" type="button" aria-expanded="${box.collapsed ? 'false' : 'true'}">
					<div class="saInfoBoxHeaderWrapper">
						${box.icon ? `<span class="saInfoBoxHeaderIcon">${iconHtml(box.icon)}</span>` : ''}
						<h3>${escapeHtml(box.heading)}</h3>
					</div>
					<i class="far fa-angle-down saIcon saInfoBoxExpandIcon"></i>
				</button>
				<div class="saInfoBoxInner">
					${box.text ? `<div class="saUserHtmlContent">${escapeHtml(box.text)}</div>` : ''}
					${box.fields && box.fields.length ? (box.layout === 'grid' ? renderInfoBoxGrid(box) : box.fields.map(renderInfoBoxField).join('')) : ''}
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

	function renderGridButton(button) {
		return `
			<button type="button" class="saGridRowButton${button.inactive ? ' inactive' : ''}" aria-label="${escapeHtml(button.label)}" data-tooltip="${escapeHtml(button.label)}">
				<i class="${escapeHtml(button.iconStyle || 'far')} fa-${escapeHtml(button.icon || 'ellipsis-vertical')} icon saIcon"></i>
			</button>`;
	}

	function renderGridRowControls(actions, rowIndex, row = {}, component = {}) {
		const checkbox = component.selectableRows ? `
			<li class="saGridCheckbox">
				<input class="saCheckbox" type="checkbox" value="${escapeHtml(row.id || rowIndex)}" ${row.selected ? 'checked' : ''}>
			</li>` : '';
		const buttons = (actions && actions.length ? actions : [
			{ label: 'Open', icon: 'eye', iconStyle: 'fas' },
			{ label: 'Edit', icon: 'pen' },
			{ label: 'More...', icon: 'ellipsis-vertical' }
		]).map(action => `<li>${renderGridButton(action)}</li>`).join('');
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

		return `<span class="saGridText">${escapeHtml(value || '')}</span>`;
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
		const groupOptions = ['(Nothing)', ...columns.map(column => column.label)];
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
						<label class="saInputTextWrapper saLabeled saGroupingGrid${component.grouped ? ' saIsGrouped' : ''}">
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
			return `
				<tr class="saGridGroupedRowsHeader">
					<th colspan="${columns.length + 1}" style="top: 141px;"><span class="saGridGroupedRowsHeaderText">${escapeHtml(row.label || '')}</span></th>
				</tr>`;
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
				${renderGridRowControls(row.actions || component.rowActions, index, row, component)}
				${columns.map(column => renderGridCell(column, row)).join('')}
			</tr>`;
	}

	function renderListGridAction(action, index) {
		const isMore = /more/i.test(action.label || '') || action.icon === 'ellipsis-vertical';
		const classes = isMore ? 'saListGridMoreButton' : 'saListGridRowLink';
		const text = isMore ? '' : `<span class="saButtonText">${escapeHtml(action.shortLabel || action.label)}</span>`;

		return `
			<button type="button" class="${classes}${action.inactive ? ' saDisabled' : ''}" aria-label="${escapeHtml(action.label)}" ${action.inactive ? 'disabled' : ''}>
				<i class="${escapeHtml(action.iconStyle || 'far')} fa-${escapeHtml(action.icon || 'ellipsis-vertical')} icon saIcon"></i>
				${text}
			</button>`;
	}

	function renderListGridRow(component, row, index) {
		const columns = component.columns || [];
		if (row.type) {
			return '';
		}
		const titleColumn = columns.find(column => column.key === component.mobileTitleKey) || columns[0];
		const descriptionColumn = columns.find(column => column.key === component.mobileDescriptionKey) || columns[1];
		const bodyColumns = columns.filter(column => column !== titleColumn && column !== descriptionColumn);
		const actions = row.actions || component.rowActions || [];

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
						${actions.map(renderListGridAction).join('')}
					</div>
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
							${(component.months || ['January', 'February', 'March', 'April', 'May', 'June']).map(month => `<option ${month === component.month ? 'selected' : ''}>${escapeHtml(month)}</option>`).join('')}
						</select>
						<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
					</label>
					<label class="saInputTextWrapper saLabeled">
						<span class="saLabeledLabel">${escapeHtml(component.weekLabel || 'Week')}</span>
						<input class="saInputText saNumberInput" type="number" value="${escapeHtml(component.week || '')}">
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
						<div class="saCalendarSidebarHeadingWrapper">
							<span class="saCalendarSidebarHeading">${escapeHtml(component.sidebarHeading || 'Calendar')}</span>
						</div>
						<div class="saDatePickerRoot">
							<div class="saDatePickerMonthHeading">
								<a><i class="saIcon far fa-angle-left"></i></a>
								<span>${escapeHtml(component.month || 'June')} ${escapeHtml(component.year || '2026')}</span>
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
						${filters.map(filter => `
							<label class="saToggleWrapper">
								<input class="saCheckbox" type="checkbox" ${filter.checked === false ? '' : 'checked'}>
								<span>${escapeHtml(filter.label)}</span>
							</label>`).join('')}
					</div>
				</div>
			</div>`;
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
					<time class="saDateNumber" datetime="${escapeHtml(day.date)}">${escapeHtml(day.day)}</time>
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
		const dateClasses = [
			'saDateNumber',
			(day.activities || []).length ? 'saHasItems' : '',
			day.today ? 'saDateIsToday' : '',
			day.current ? 'saDateIsCurrent' : '',
			day.redDay ? 'saRedDay' : '',
			String(day.day || '').length > 2 ? 'saWideDate' : ''
		].filter(Boolean).join(' ');

		return `
			<div class="saWeekDay">
				<button class="${dateClasses}" type="button" aria-label="${escapeHtml(day.date)}">
					<span class="saDateNumberInner">${escapeHtml(String(day.day || '').replace(/\s+\w+$/, ''))}</span>
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

	function renderCalendarWeekdays(component) {
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
		CalendarWeekdays: renderCalendarWeekdays,
		DetailView: renderDetailView,
		InfoBoxes: renderInfoBoxes,
		MenuGroups: renderMenuGroups,
		Multipart: renderMultipart,
		NewEdit: renderNewEdit,
		RadioCards: renderRadioCards,
		ResultGrid: renderResultGrid
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
		renderSpec
	};
}());
