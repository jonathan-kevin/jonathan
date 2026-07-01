(function () {
	let lastDebugResult = null;
	const undoStack = [];
	const logoStorageKey = 'softadmin.mockup.logo';
	const avatarStorageKey = 'softadmin.mockup.avatar';
	const manualEdits = new Map();
	let initialState = null;
	let isBusy = false;
	let lastTokenEstimate = null;
	let preferredLogoSource = null;
	let preferredAvatarSource = null;
	let selectedElement = null;
	let draggedElement = null;
	let dropTargetElement = null;
	let pendingDragElement = null;
	let pendingDragStart = null;
	let suppressNextClick = false;

	function escapeHtml(value) {
		return String(value ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function buttonHtml(action, mobileOverflow) {
		const variant = action.variant === 'primary' ? 'saButtonPrimary' : 'saButtonSecondary';
		const overflowClass = mobileOverflow ? ' saMockMobileOverflowAction' : '';

		return `
			<button class="saTopLink saActionLink ${variant}${overflowClass}" type="button">
				<div class="saIconHolder saOptionIcon" aria-hidden="true">
					<i class="far fa-${escapeHtml(action.icon || 'circle')} icon saIcon"></i>
				</div>
				<span class="saButtonText saOptionText">${escapeHtml(action.label)}</span>
			</button>`;
	}

	function renderBreadcrumbs(items) {
		const breadcrumbs = items && items.length ? items : ['Home'];

		return `
			<div class="saBackButtonWrapper">
				<button class="saBackButton" type="button">
					<i class="far fa-arrow-left saBack saIcon"></i>
				</button>
			</div>
			${breadcrumbs.map((item, index) => {
				const isLast = index === breadcrumbs.length - 1;
				return `
					${index > 0 ? '<span class="saBreadcrumbSeparator" aria-hidden="true">&gt;</span>' : ''}
					<span class="saBreadcrumb${isLast ? ' saNoLinkBreadcrumb' : ''}">
						${isLast ? escapeHtml(item) : `<a tabindex="0">${escapeHtml(item)}</a>`}
					</span>`;
			}).join('')}`;
	}

	function toggleTopButtonLayoutClasses(hasTopButtons) {
		[document.body, document.getElementById('body')].forEach(element => {
			if (!element) {
				return;
			}

			element.classList.toggle('saLargeScreenHasTopButtons', hasTopButtons);
			element.classList.toggle('saSmallScreenHasTopButtons', hasTopButtons);
		});
	}

	function updateFrame(frame) {
		const title = frame.title || 'Softadmin mockup';
		const actions = frame.actions || [];
		const desktopHeader = document.querySelector('#pageheader > .saDesktopHeader');
		const smallHeader = document.querySelector('#pageheader > .saSmallScreenHeader');

		document.title = frame.documentTitle || `${title} - Softadmin mockup`;
		toggleTopButtonLayoutClasses(actions.length > 0);

		document.querySelectorAll('#pageheader .saHeaderText, .saSideBarHeaderSmallScreen h1').forEach(element => {
			element.textContent = title;
		});

		document.querySelector('.saAccountName').textContent = 'Anna Andersson';
		const accountAvatar = document.querySelector('.saAccountAvatar');
		if (accountAvatar && accountAvatar.tagName !== 'IMG') {
			accountAvatar.textContent = 'AA';
		}
		applyAvatarPreference();

		const breadcrumbs = desktopHeader.querySelector('.saBreadcrumbs');
		if (breadcrumbs) {
			breadcrumbs.innerHTML = renderBreadcrumbs(frame.breadcrumbs || ['Home', title]);
		}

		const desktopActions = desktopHeader.querySelector('.saActionLinks');
		if (desktopActions) {
			const desktopActionBar = desktopHeader.querySelector('.saNavigationBar');

			if (desktopActionBar) {
				desktopActionBar.style.display = actions.length ? '' : 'none';
			}

			desktopActions.innerHTML = actions.length
				? `
					${actions.map((action, index) => buttonHtml(action, index > 0)).join('')}
					<div class="saCollectorWrapper">
						<button class="saMoreButton" type="button"><i class="far fa-ellipsis-vertical icon saIcon"></i></button>
					</div>`
				: '';
		}

		const smallActions = smallHeader.querySelector('.saActionLinks');
		if (smallActions) {
			const smallActionBar = smallHeader.querySelector('.saActionLinkBar');

			if (smallActionBar) {
				smallActionBar.style.display = actions.length ? '' : 'none';
			}

			smallActions.innerHTML = actions.length
				? `
					${actions.map((action, index) => buttonHtml(action, index > 0)).join('')}
					<div class="saCollectorWrapper">
						<button class="saMoreButton" aria-expanded="false" type="button">
							<i class="far fa-ellipsis-vertical icon saIcon"></i>
						</button>
					</div>`
				: '';
		}
	}

	function suppressTopActionsForComponent(spec) {
		if (!spec || !Array.isArray(spec.components)) {
			return;
		}

		if (spec.components.some(component => component.type === 'NewEdit') && spec.frame) {
			spec.frame.actions = [];
		}
	}

	function componentNames(spec) {
		const displayNames = {
			DetailView: 'Detailview',
			CalendarWeekdays: 'Calendar',
			ResultGrid: 'Grid'
		};

		const names = (spec.components || []).map(component => {
			return displayNames[component.type] || component.type;
		});

		if (spec.sidebar) {
			names.unshift('Sidebar');
		}

		if (spec.sidebarPatch) {
			names.unshift('Sidebar patch');
		}

		if (!names.length && hasOwnProperties(spec.frame)) {
			names.push('Frame');
		}

		return names;
	}

	function sidebarItemHtml(item) {
		const pill = item.pill
			? `<span class="saMenuItemPill ${item.pill.type === 'beta' ? 'saBeta' : 'saDeprecated'}">${escapeHtml(item.pill.text || item.pill.type)}</span>`
			: '';

		return `
			<li>
				<a class="saItem${item.favorite ? ' saFavorite' : ''} saDynamicTooltipJs" tabindex="0">
					<div class="saItemInner">
						<div class="saIconWrapper">
							<i class="${escapeHtml(item.iconStyle || 'far')} fa-${escapeHtml(item.icon || 'circle')} icon saIcon"></i>
						</div>
						<span>${escapeHtml(item.title)}${pill}</span>
					</div>
				</a>
			</li>`;
	}

	function sidebarGroupHtml(group) {
		return `
			<div class="saSideBarGroup">
				<h3>${escapeHtml(group.heading)}</h3>
				<ul class="saItemList">
					${(group.items || []).map(sidebarItemHtml).join('')}
				</ul>
			</div>`;
	}

	function sidebarFavoritesHtml(favorites) {
		return `
			<div class="saSideBarGroup saSideBarFavorites">
				<div class="saSideBarFavoritesHeader">
					<button class="saButtonFavorites" type="button"><span>${escapeHtml(favorites.heading || 'Favorites')}</span><i class="saIcon saIcon far fa-angle-down"></i></button>
					<button class="saButtonFavoritesMinimized" type="button"><i class="saIcon saIcon far fa-angle-down"></i></button>
					<button class="saButtonFavoritesEdit" type="button">${escapeHtml(favorites.editLabel || 'Edit')}</button>
				</div>
				<ul class="saItemList">${(favorites.items || []).map(item => sidebarItemHtml({ ...item, favorite: true })).join('')}</ul>
			</div>`;
	}

	function updateSidebarFavorites(favorites) {
		const body = document.querySelector('.saSideBarBody');

		if (!body || !favorites) {
			return;
		}

		let favoritesGroup = body.querySelector('.saSideBarFavorites');

		if (!favoritesGroup) {
			body.insertAdjacentHTML('afterbegin', sidebarFavoritesHtml({ ...favorites, items: [] }));
			favoritesGroup = body.querySelector('.saSideBarFavorites');
		}

		const list = favoritesGroup.querySelector('.saItemList');
		const heading = favoritesGroup.querySelector('.saButtonFavorites span');
		const editButton = favoritesGroup.querySelector('.saButtonFavoritesEdit');

		if (heading && favorites.heading) {
			heading.textContent = favorites.heading;
		}

		if (editButton && favorites.editLabel) {
			editButton.textContent = favorites.editLabel;
		}

		if (!list || !Array.isArray(favorites.items)) {
			return;
		}

		const itemsHtml = favorites.items.map(item => sidebarItemHtml({ ...item, favorite: true })).join('');

		if (favorites.append) {
			list.insertAdjacentHTML('beforeend', itemsHtml);
		} else {
			list.innerHTML = itemsHtml;
		}
	}

	function normalizeText(value) {
		return String(value || '').trim().toLowerCase();
	}

	function sidebarGroups() {
		return Array.from(document.querySelectorAll('.saSideBarBody > .saSideBarGroup:not(.saSideBarFavorites)'));
	}

	function logoElements() {
		return Array.from(document.querySelectorAll('.saCustomerLogo, .saSideBarHeaderSmallScreenLogo'));
	}

	function accountAvatarElement() {
		return document.querySelector('.saAccountAvatar');
	}

	function accountNameElement() {
		return document.querySelector('.saAccountName');
	}

	function accountInitials(name) {
		const parts = String(name || '')
			.trim()
			.split(/\s+/)
			.filter(Boolean);

		return (parts.length ? parts.slice(0, 2).map(part => part.charAt(0)).join('') : 'AA').toUpperCase();
	}

	function updateAccountInitials() {
		const avatar = accountAvatarElement();

		if (!avatar || avatar.tagName === 'IMG') {
			return;
		}

		avatar.textContent = accountInitials(accountNameElement()?.textContent || '');
	}

	function saveLogoPreference(source) {
		try {
			window.localStorage.setItem(logoStorageKey, source);
		} catch (error) {
			// Local storage can be unavailable for file URLs or large data URLs.
		}
	}

	function loadLogoPreference() {
		try {
			preferredLogoSource = window.localStorage.getItem(logoStorageKey) || null;
		} catch (error) {
			preferredLogoSource = null;
		}
	}

	function saveAvatarPreference(source) {
		try {
			window.localStorage.setItem(avatarStorageKey, source);
		} catch (error) {
			// Local storage can be unavailable for file URLs or large data URLs.
		}
	}

	function loadAvatarPreference() {
		try {
			preferredAvatarSource = window.localStorage.getItem(avatarStorageKey) || null;
		} catch (error) {
			preferredAvatarSource = null;
		}
	}

	function applyLogoPreference() {
		if (!preferredLogoSource) {
			return;
		}

		logoElements().forEach(logo => {
			logo.setAttribute('src', preferredLogoSource);
			if (!logo.getAttribute('alt')) {
				logo.setAttribute('alt', 'Customer logo');
			}
		});
	}

	function setLogoPreference(source, message) {
		const status = document.getElementById('SoftadminPromptStatus');
		const normalizedSource = String(source || '').trim();

		if (!normalizedSource) {
			return;
		}

		preferredLogoSource = normalizedSource;
		saveLogoPreference(normalizedSource);
		applyLogoPreference();

		if (status) {
			status.textContent = message || 'Logo updated.';
		}
	}

	function applyAvatarPreference() {
		if (!preferredAvatarSource) {
			updateAccountInitials();
			return;
		}

		const avatar = accountAvatarElement();

		if (!avatar) {
			return;
		}

		if (avatar.tagName === 'IMG') {
			avatar.setAttribute('src', preferredAvatarSource);
			avatar.setAttribute('alt', accountNameElement()?.textContent?.trim() || 'Account avatar');
			return;
		}

		const image = document.createElement('img');
		image.className = avatar.className;
		image.src = preferredAvatarSource;
		image.alt = accountNameElement()?.textContent?.trim() || 'Account avatar';
		avatar.replaceWith(image);
	}

	function setAvatarPreference(source, message) {
		const status = document.getElementById('SoftadminPromptStatus');
		const normalizedSource = String(source || '').trim();

		if (!normalizedSource) {
			return;
		}

		preferredAvatarSource = normalizedSource;
		saveAvatarPreference(normalizedSource);
		applyAvatarPreference();

		if (status) {
			status.textContent = message || 'Avatar updated.';
		}
	}

	function handleLogoFileChange(event) {
		const file = event.target.files && event.target.files[0];
		const status = document.getElementById('SoftadminPromptStatus');

		if (!file) {
			return;
		}

		if (!file.type.startsWith('image/')) {
			if (status) {
				status.textContent = 'Choose an image file for the logo.';
			}
			return;
		}

		const reader = new FileReader();
		reader.addEventListener('load', function () {
			setLogoPreference(reader.result, `Logo updated: ${file.name}.`);
			event.target.value = '';
		});
		reader.readAsDataURL(file);
	}

	function handleAvatarFileChange(event) {
		const file = event.target.files && event.target.files[0];
		const status = document.getElementById('SoftadminPromptStatus');

		if (!file) {
			return;
		}

		if (!file.type.startsWith('image/')) {
			if (status) {
				status.textContent = 'Choose an image file for the avatar.';
			}
			return;
		}

		const reader = new FileReader();
		reader.addEventListener('load', function () {
			setAvatarPreference(reader.result, `Avatar updated: ${file.name}.`);
			event.target.value = '';
		});
		reader.readAsDataURL(file);
	}

	function openLogoFilePicker() {
		const input = document.getElementById('SoftadminLogoFile');

		if (input) {
			input.click();
		}
	}

	function handleLogoClick(event) {
		const logo = event.target.closest('.saCustomerLogo, .saSideBarHeaderSmallScreenLogo');

		if (!logo) {
			return;
		}

		event.preventDefault();
		openLogoFilePicker();
	}

	function openAvatarFilePicker() {
		const input = document.getElementById('SoftadminAvatarFile');

		if (input) {
			input.click();
		}
	}

	function handleAvatarClick(event) {
		const avatar = event.target.closest('.saAccountAvatar');

		if (!avatar) {
			return;
		}

		event.preventDefault();
		openAvatarFilePicker();
	}

	function logoUrlInput() {
		return document.getElementById('SoftadminLogoUrlInput');
	}

	function openLogoUrlInput() {
		const input = logoUrlInput();

		if (!input) {
			return;
		}

		input.value = preferredLogoSource || input.value || '';
		input.classList.add('saOpen');
		input.focus();
		input.select();
	}

	function applyLogoUrlInput() {
		const input = logoUrlInput();

		if (!input) {
			return;
		}

		setLogoPreference(input.value, 'Logo URL applied.');
		input.classList.remove('saOpen');
	}

	function sidebarItemTitle(element) {
		const titleElement = element.querySelector('.saItemInner > span');

		if (!titleElement) {
			return '';
		}

		return titleElement.childNodes[0]?.textContent?.trim() || titleElement.textContent.trim();
	}

	function findSidebarGroupByHeading(heading) {
		const normalizedHeading = normalizeText(heading);

		return sidebarGroups().find(group => normalizeText(group.querySelector('h3')?.textContent) === normalizedHeading);
	}

	function applySidebarPatch(sidebarPatch) {
		if (!sidebarPatch) {
			return;
		}

		let resolvedGroup = null;

		(sidebarPatch.removeItems || []).forEach(item => {
			const normalizedTitle = normalizeText(item.title);
			const match = Array.from(document.querySelectorAll('.saSideBarBody .saItemList > li')).find(candidate => {
				return normalizeText(sidebarItemTitle(candidate)) === normalizedTitle;
			});

			if (!match) {
				return;
			}

			resolvedGroup = resolvedGroup || match.closest('.saSideBarGroup');
			match.remove();
		});

		if (!sidebarPatch.addItemsToResolvedGroup || !Array.isArray(sidebarPatch.addItemsToResolvedGroup.items)) {
			return;
		}

		const targetGroup = resolvedGroup || findSidebarGroupByHeading(sidebarPatch.addItemsToResolvedGroup.fallbackGroup);
		const list = targetGroup ? targetGroup.querySelector('.saItemList') : null;

		if (!list) {
			return;
		}

		list.insertAdjacentHTML(
			'beforeend',
			sidebarPatch.addItemsToResolvedGroup.items.map(sidebarItemHtml).join('')
		);
	}

	function setSidebarExpanded(expanded) {
		const sidebarOuter = document.querySelector('.saSideBarOuter');
		const sidebar = document.querySelector('.saSideBar');
		const expander = document.querySelector('.saExpander');

		if (sidebarOuter) {
			sidebarOuter.classList.toggle('saClosed', !expanded);
		}

		if (sidebar) {
			sidebar.classList.toggle('saExpanded', expanded);
			sidebar.classList.toggle('saMinimized', !expanded);
		}

		if (expander) {
			expander.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}
	}

	function handleSidebarExpanderClick(event) {
		const expander = event.target.closest('.saExpander');

		if (!expander) {
			return;
		}

		event.preventDefault();
		setSidebarExpanded(document.querySelector('.saSideBar')?.classList.contains('saMinimized'));
	}

	function updateSidebar(sidebar) {
		if (!sidebar) {
			return;
		}

		const body = document.querySelector('.saSideBarBody');

		if (!body) {
			return;
		}

		if (!Array.isArray(sidebar.groups)) {
			updateSidebarFavorites(sidebar.favorites);
			return;
		}

		body.innerHTML = `
			${sidebar.favorites ? sidebarFavoritesHtml(sidebar.favorites) : ''}
			${sidebar.groups.map(sidebarGroupHtml).join('')}`;
		applyLogoPreference();
	}

	function hasOwnProperties(value) {
		return value && Object.keys(value).length > 0;
	}

	function estimateTokens(value) {
		const text = typeof value === 'string' ? value : JSON.stringify(value || '');
		const wordsAndPunctuation = text.match(/[A-Za-z0-9_]+|[^\sA-Za-z0-9_]/g) || [];

		return Math.max(1, Math.ceil(Math.max(text.length / 4, wordsAndPunctuation.length * 0.75)));
	}

	function formatTokens(value) {
		return `${Math.round(value).toLocaleString('en-US')} est. tokens`;
	}

	function generationTokenEstimate(prompt, result) {
		const promptTokens = estimateTokens(prompt);
		const rawSpecTokens = estimateTokens(result.rawSpec);
		const normalizedSpecTokens = estimateTokens(result.spec);

		return {
			normalizedSpecTokens,
			promptTokens,
			rawSpecTokens,
			totalTokens: promptTokens + rawSpecTokens
		};
	}

	function editableTextSelector() {
		return [
			'#pageheader .saHeaderText',
			'#pageheader .saBreadcrumb a',
			'#pageheader .saNoLinkBreadcrumb',
			'#pageheader .saButtonText',
			'.saAccountName',
			'.saSideBarBody .saSideBarFavoritesHeader span',
			'.saSideBarBody .saSideBarGroup > h3',
			'.saSideBarBody .saItemInner > span',
			'[data-softadmin-component-root] h2',
			'[data-softadmin-component-root] h3',
			'[data-softadmin-component-root] .saSectionHeader h2',
			'[data-softadmin-component-root] .saLabel span',
			'[data-softadmin-component-root] .saDescription',
			'[data-softadmin-component-root] .saGridHeadingLabel',
			'[data-softadmin-component-root] .saGridText',
			'[data-softadmin-component-root] .saInfoBoxLabel',
			'[data-softadmin-component-root] .saInfoBoxTextContent',
			'[data-softadmin-component-root] .saInputCardHeading',
			'[data-softadmin-component-root] .saInputCardDescription',
			'[data-softadmin-component-root] .saButtonText',
			'[data-softadmin-component-root] .saTabText'
		].join(', ');
	}

	function editableScope(element) {
		if (element.closest('#pageheader')) {
			return 'frame';
		}

		if (element.closest('.saSideBarOuter')) {
			return 'sidebar';
		}

		return 'main';
	}

	function editableKey(element) {
		if (element.dataset.softadminEditKey) {
			return element.dataset.softadminEditKey;
		}

		const scope = editableScope(element);

		if (scope === 'frame') {
			if (element.matches('.saHeaderText')) {
				element.dataset.softadminEditKey = 'frame:title';
				return element.dataset.softadminEditKey;
			}

			if (element.matches('.saButtonText')) {
				const actionBar = element.closest('.saActionLinks');
				const actionIndex = actionBar ? Array.from(actionBar.querySelectorAll('.saButtonText')).indexOf(element) : 0;

				element.dataset.softadminEditKey = `frame:action:${Math.max(actionIndex, 0)}`;
				return element.dataset.softadminEditKey;
			}

			if (element.matches('.saBreadcrumb a, .saNoLinkBreadcrumb')) {
				const breadcrumbs = element.closest('.saBreadcrumbs');
				const breadcrumbIndex = breadcrumbs ? Array.from(breadcrumbs.querySelectorAll('.saBreadcrumb a, .saNoLinkBreadcrumb')).indexOf(element) : 0;

				element.dataset.softadminEditKey = `frame:breadcrumb:${Math.max(breadcrumbIndex, 0)}`;
				return element.dataset.softadminEditKey;
			}
		}

		const root = scope === 'frame'
			? document.getElementById('pageheader')
			: scope === 'sidebar'
				? document.querySelector('.saSideBarOuter')
				: document.querySelector('[data-softadmin-component-root]');
		const matches = root ? Array.from(root.querySelectorAll(editableTextSelector())) : [];
		const index = matches.indexOf(element);
		const key = `${scope}:${element.tagName.toLowerCase()}:${Math.max(index, 0)}`;

		element.dataset.softadminEditKey = key;
		return key;
	}

	function canMakeEditable(element) {
		if (!element || element.closest('.saMockPromptPanel, .saMockDebugDrawer')) {
			return false;
		}

		if (element.querySelector('.saMenuItemPill, .saMandatoryStar, .saIcon')) {
			return false;
		}

		return element.textContent.trim().length > 0;
	}

	function rememberManualEdit(element) {
		const key = editableKey(element);

		manualEdits.set(key, { type: 'text', value: element.textContent });
		element.dataset.softadminUserEdited = 'true';
	}

	function enableInlineEditing() {
		document.querySelectorAll(editableTextSelector()).forEach(element => {
			if (!canMakeEditable(element)) {
				return;
			}

			editableKey(element);
			element.setAttribute('contenteditable', 'true');
			element.setAttribute('spellcheck', 'false');
			element.dataset.softadminEditable = 'true';

			if (element.dataset.softadminEditBound) {
				return;
			}

			element.dataset.softadminEditBound = 'true';
			element.addEventListener('input', function () {
				rememberManualEdit(element);
				if (element.matches('.saAccountName')) {
					updateAccountInitials();
				}
			});
			element.addEventListener('keydown', function (event) {
				if (event.key === 'Enter') {
					event.preventDefault();
					element.blur();
				}
			});
		});
	}

	function collectManualEdits() {
		document.querySelectorAll('[data-softadmin-user-edited="true"]').forEach(element => {
			if (canMakeEditable(element)) {
				rememberManualEdit(element);
			}
		});
	}

	function applyManualEdits() {
		document.querySelectorAll(editableTextSelector()).forEach(element => {
			const key = editableKey(element);
			const edit = manualEdits.get(key);

			if (!canMakeEditable(element) || !edit || edit.type !== 'text') {
				return;
			}

			element.textContent = edit.value;
			element.dataset.softadminUserEdited = 'true';
		});
	}

	function selectableElementSelector() {
		return [
			'#pageheader .saTopLink',
			'#pageheader .saCollectorWrapper',
			'#pageheader .saBreadcrumb',
			'#pageheader .saBreadcrumbSeparator',
			'.saSideBarInputGroup > li',
			'.saSideBarBody .saItemList > li',
			'.saSideBarBody > .saSideBarGroup:not(.saSideBarFavorites)',
			'.saSideBarToolbar > li',
			'[data-softadmin-component-root] .saFieldAndLabelWrapper',
			'[data-softadmin-component-root] .saSiblingRow',
			'[data-softadmin-component-root] .saInputCard',
			'[data-softadmin-component-root] .saInfoBox',
			'[data-softadmin-component-root] .saWarningBox',
			'[data-softadmin-component-root] .saMenuItemWrapper',
			'[data-softadmin-component-root] .saMenuBox',
			'[data-softadmin-component-root] tr.saGridRow',
			'[data-softadmin-component-root] .saListGridRowLink',
			'[data-softadmin-component-root] .saTab:not(.saMoreTab)',
			'[data-softadmin-component-root] .saCalendarEvent',
			'[data-softadmin-component-root] .saCalendarActivity'
		].join(', ');
	}

	function isInteractiveEditingTarget(target) {
		return Boolean(target.closest('.saMockPromptPanel, .saMockDebugDrawer, .saMockSelectionToolbar, input, textarea, select'));
	}

	function clearSelectedElement() {
		if (selectedElement) {
			selectedElement.classList.remove('saMockSelectedElement');
		}

		selectedElement = null;
		updateSelectionToolbar();
	}

	function selectedElementLabel(element) {
		if (!element) {
			return 'Selected';
		}

		if (element.matches('#pageheader .saTopLink')) return 'Top button';
		if (element.matches('#pageheader .saCollectorWrapper')) return 'More button';
		if (element.matches('#pageheader .saBreadcrumbSeparator')) return 'Breadcrumb separator';
		if (element.matches('#pageheader .saBreadcrumb')) return 'Breadcrumb';
		if (element.matches('.saSideBarInputGroup > li')) return 'Sidebar input';
		if (element.matches('.saSideBarToolbar > li')) return 'Sidebar tool';
		if (element.matches('.saSideBarBody .saItemList > li')) return 'Sidebar item';
		if (element.matches('.saSideBarBody > .saSideBarGroup')) return 'Sidebar group';
		if (element.matches('[data-softadmin-component-root] .saFieldAndLabelWrapper')) return 'NewEdit field';
		if (element.matches('[data-softadmin-component-root] .saSiblingRow')) return 'Sibling row';
		if (element.matches('[data-softadmin-component-root] tr.saGridRow')) return 'Grid row';
		if (element.matches('[data-softadmin-component-root] .saTab')) return 'Tab';
		if (element.matches('[data-softadmin-component-root] .saMenuItemWrapper')) return 'Menu item';
		if (element.matches('[data-softadmin-component-root] .saMenuBox')) return 'Menu group';
		if (element.matches('[data-softadmin-component-root] .saInfoBox')) return 'Info box';
		if (element.matches('[data-softadmin-component-root] .saWarningBox')) return 'Warning';
		if (element.matches('[data-softadmin-component-root] .saCalendarEvent, [data-softadmin-component-root] .saCalendarActivity')) return 'Calendar item';

		return 'Selected';
	}

	function updateSelectionToolbar() {
		const toolbar = document.getElementById('SoftadminSelectionToolbar');
		const label = document.getElementById('SoftadminSelectionLabel');

		if (!toolbar) {
			return;
		}

		if (!selectedElement || !selectedElement.isConnected) {
			toolbar.classList.remove('saOpen');
			toolbar.setAttribute('aria-hidden', 'true');
			return;
		}

		if (label) {
			label.textContent = selectedElementLabel(selectedElement);
		}

		toolbar.classList.add('saOpen');
		toolbar.setAttribute('aria-hidden', 'false');

		const rect = selectedElement.getBoundingClientRect();
		const toolbarRect = toolbar.getBoundingClientRect();
		const viewportPadding = 8;
		const left = Math.min(
			Math.max(viewportPadding, rect.left),
			Math.max(viewportPadding, window.innerWidth - toolbarRect.width - viewportPadding)
		);
		const above = rect.top - toolbarRect.height - 8;
		const top = above > viewportPadding ? above : Math.min(rect.bottom + 8, window.innerHeight - toolbarRect.height - viewportPadding);

		toolbar.style.left = `${Math.round(left)}px`;
		toolbar.style.top = `${Math.round(top)}px`;
	}

	function blurSidebarInputGroupSelection(element) {
		if (element?.matches('.saSideBarInputGroup > li') && document.activeElement?.closest('.saSideBarInputGroup')) {
			document.activeElement.blur();
		}
	}

	function selectElement(element) {
		if (!element) {
			return;
		}

		blurSidebarInputGroupSelection(element);

		if (element === selectedElement) {
			return;
		}

		clearSelectedElement();
		selectedElement = element;
		selectedElement.classList.add('saMockSelectedElement');
		updateSelectionToolbar();
	}

	function enableDragAndDrop() {
		document.querySelectorAll(selectableElementSelector()).forEach(element => {
			if (element.closest('.saMockPromptPanel, .saMockDebugDrawer')) {
				return;
			}

			element.draggable = true;
			element.dataset.softadminDraggable = 'true';
		});
	}

	function clearDropTarget() {
		if (dropTargetElement) {
			dropTargetElement.classList.remove('saMockDropTarget');
		}

		dropTargetElement = null;
	}

	function clearDragState() {
		if (draggedElement) {
			draggedElement.classList.remove('saMockDraggingElement');
		}

		clearDropTarget();
		draggedElement = null;
		pendingDragElement = null;
		pendingDragStart = null;
	}

	function canDropOn(source, target) {
		return source && target && source !== target && source.parentElement && source.parentElement === target.parentElement;
	}

	function setDropTarget(target) {
		if (dropTargetElement === target) {
			return;
		}

		clearDropTarget();
		dropTargetElement = target;
		dropTargetElement.classList.add('saMockDropTarget');
	}

	function insertDraggedElement(source, target, event) {
		const rect = target.getBoundingClientRect();
		const useHorizontal = rect.width > rect.height * 1.6;
		const insertAfter = useHorizontal
			? event.clientX > rect.left + rect.width / 2
			: event.clientY > rect.top + rect.height / 2;

		if (insertAfter) {
			target.insertAdjacentElement('afterend', source);
		} else {
			target.insertAdjacentElement('beforebegin', source);
		}
	}

	function syncTopButtonLayoutAfterDeletion() {
		const hasTopButtons = Boolean(document.querySelector('#pageheader .saTopLink'));
		const desktopActionBar = document.querySelector('#pageheader > .saDesktopHeader .saNavigationBar');
		const smallActionBar = document.querySelector('#pageheader > .saSmallScreenHeader .saActionLinkBar');

		toggleTopButtonLayoutClasses(hasTopButtons);

		if (desktopActionBar) {
			desktopActionBar.style.display = hasTopButtons ? '' : 'none';
		}

		if (smallActionBar) {
			smallActionBar.style.display = hasTopButtons ? '' : 'none';
		}
	}

	function captureUndoState() {
		const selected = document.querySelectorAll('.saMockSelectedElement');
		const dragging = document.querySelectorAll('.saMockDraggingElement');
		const dropTargets = document.querySelectorAll('.saMockDropTarget');

		selected.forEach(element => element.classList.remove('saMockSelectedElement'));
		dragging.forEach(element => element.classList.remove('saMockDraggingElement'));
		dropTargets.forEach(element => element.classList.remove('saMockDropTarget'));

		const state = captureState();

		selected.forEach(element => element.classList.add('saMockSelectedElement'));
		dragging.forEach(element => element.classList.add('saMockDraggingElement'));
		dropTargets.forEach(element => element.classList.add('saMockDropTarget'));

		return state;
	}

	function cleanDuplicatedElement(element) {
		element.classList.remove('saMockSelectedElement', 'saMockDraggingElement', 'saMockDropTarget');
		delete element.dataset.softadminEditBound;
		delete element.dataset.softadminEditKey;
		delete element.dataset.softadminUserEdited;

		if (element.id) {
			element.removeAttribute('id');
		}

		element.querySelectorAll('.saMockSelectedElement, .saMockDraggingElement, .saMockDropTarget').forEach(child => {
			child.classList.remove('saMockSelectedElement', 'saMockDraggingElement', 'saMockDropTarget');
		});
		element.querySelectorAll('[data-softadmin-edit-bound], [data-softadmin-edit-key], [data-softadmin-user-edited]').forEach(child => {
			delete child.dataset.softadminEditBound;
			delete child.dataset.softadminEditKey;
			delete child.dataset.softadminUserEdited;
		});
		element.querySelectorAll('[id]').forEach(child => child.removeAttribute('id'));
	}

	function duplicateSelectedElement() {
		const status = document.getElementById('SoftadminPromptStatus');

		if (!selectedElement || !selectedElement.isConnected) {
			clearSelectedElement();
			return;
		}

		undoStack.push(captureUndoState());
		const clone = selectedElement.cloneNode(true);
		cleanDuplicatedElement(clone);
		selectedElement.insertAdjacentElement('afterend', clone);
		selectElement(clone);
		enableInlineEditing();
		enableDragAndDrop();

		if (status) {
			status.textContent = 'Duplicated selection.';
		}

		updateUndoButton();
	}

	function moveSelectedElement(direction) {
		const status = document.getElementById('SoftadminPromptStatus');

		if (!selectedElement || !selectedElement.isConnected) {
			clearSelectedElement();
			return;
		}

		const sibling = direction === 'up' ? selectedElement.previousElementSibling : selectedElement.nextElementSibling;

		if (!sibling) {
			if (status) {
				status.textContent = direction === 'up' ? 'Already first in this group.' : 'Already last in this group.';
			}
			return;
		}

		undoStack.push(captureUndoState());

		if (direction === 'up') {
			selectedElement.parentElement.insertBefore(selectedElement, sibling);
		} else {
			selectedElement.parentElement.insertBefore(selectedElement, sibling.nextElementSibling);
		}

		selectElement(selectedElement);

		if (status) {
			status.textContent = direction === 'up' ? 'Moved selection up.' : 'Moved selection down.';
		}

		updateSelectionToolbar();
		updateUndoButton();
	}

	function handleSelectionToolbarClick(event) {
		const button = event.target.closest('[data-softadmin-selection-action]');

		if (!button) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const action = button.dataset.softadminSelectionAction;

		if (action === 'delete') {
			removeSelectedElement();
		} else if (action === 'duplicate') {
			duplicateSelectedElement();
		} else if (action === 'move-up') {
			moveSelectedElement('up');
		} else if (action === 'move-down') {
			moveSelectedElement('down');
		}
	}

	function removeSelectedElement() {
		const status = document.getElementById('SoftadminPromptStatus');

		if (!selectedElement || !selectedElement.isConnected) {
			clearSelectedElement();
			return;
		}

		undoStack.push(captureUndoState());
		selectedElement.remove();
		clearSelectedElement();
		syncTopButtonLayoutAfterDeletion();

		if (status) {
			status.textContent = 'Deleted selection.';
		}

		updateUndoButton();
	}

	function handleSelectionClick(event) {
		if (suppressNextClick) {
			suppressNextClick = false;
			return;
		}

		if (isInteractiveEditingTarget(event.target)) {
			return;
		}

		if (event.detail > 1 && event.target.closest('[contenteditable="true"]')) {
			clearSelectedElement();
			return;
		}

		const element = event.target.closest(selectableElementSelector());

		if (!element) {
			clearSelectedElement();
			return;
		}

		selectElement(element);
	}

	function handleSelectionMouseDown(event) {
		if (event.detail > 1 || isInteractiveEditingTarget(event.target)) {
			return;
		}

		pendingDragElement = event.target.closest(selectableElementSelector());
		pendingDragStart = pendingDragElement ? { x: event.clientX, y: event.clientY } : null;

		if (event.target.closest('[contenteditable="true"]') && event.target.closest(selectableElementSelector())) {
			event.preventDefault();
		}
	}

	function startPointerDrag() {
		if (!pendingDragElement || draggedElement) {
			return;
		}

		draggedElement = pendingDragElement;
		selectElement(draggedElement);
		draggedElement.classList.add('saMockDraggingElement');
		suppressNextClick = true;
	}

	function handlePointerDragMove(event) {
		if (!pendingDragElement || !pendingDragStart) {
			return;
		}

		const deltaX = Math.abs(event.clientX - pendingDragStart.x);
		const deltaY = Math.abs(event.clientY - pendingDragStart.y);

		if (!draggedElement && deltaX + deltaY < 8) {
			return;
		}

		startPointerDrag();

		const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(selectableElementSelector());

		if (!canDropOn(draggedElement, target)) {
			clearDropTarget();
			return;
		}

		event.preventDefault();
		setDropTarget(target);
	}

	function moveDraggedElement(event) {
		const status = document.getElementById('SoftadminPromptStatus');
		const elementToMove = draggedElement;
		const targetElement = dropTargetElement;

		elementToMove.classList.remove('saMockDraggingElement');
		clearDropTarget();
		undoStack.push(captureUndoState());
		insertDraggedElement(elementToMove, targetElement, event);
		selectElement(elementToMove);
		draggedElement = null;
		pendingDragElement = null;
		pendingDragStart = null;

		if (status) {
			status.textContent = 'Moved selection.';
		}

		updateUndoButton();
	}

	function handlePointerDragEnd(event) {
		if (!draggedElement) {
			clearDragState();
			return;
		}

		if (dropTargetElement && canDropOn(draggedElement, dropTargetElement)) {
			moveDraggedElement(event);
			return;
		}

		clearDragState();
	}

	function handleDragStart(event) {
		if (isInteractiveEditingTarget(event.target)) {
			return;
		}

		const element = event.target.closest(selectableElementSelector());

		if (!element) {
			return;
		}

		draggedElement = element;
		selectElement(element);
		element.classList.add('saMockDraggingElement');
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', '');
	}

	function handleDragOver(event) {
		if (!draggedElement) {
			return;
		}

		const target = event.target.closest(selectableElementSelector());

		if (!canDropOn(draggedElement, target)) {
			clearDropTarget();
			return;
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
		setDropTarget(target);
	}

	function handleDrop(event) {
		if (!draggedElement || !dropTargetElement || !canDropOn(draggedElement, dropTargetElement)) {
			clearDragState();
			return;
		}

		event.preventDefault();
		moveDraggedElement(event);
	}

	function resetManualEdits() {
		manualEdits.clear();
		document.querySelectorAll('[data-softadmin-user-edited="true"]').forEach(element => {
			delete element.dataset.softadminUserEdited;
		});
	}

	function promptClearsManualEdits(prompt) {
		return /\b(reset|discard|overwrite|replace everything|start over|from scratch|clear manual edits|ignore manual edits)\b/i.test(prompt || '');
	}

	function debugList(items) {
		if (!items || !items.length) {
			return '<ul class="saMockDebugList"><li>None</li></ul>';
		}

		return `<ul class="saMockDebugList">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
	}

	function debugPre(value) {
		return `<pre>${escapeHtml(typeof value === 'string' ? value : JSON.stringify(value, null, 2))}</pre>`;
	}

	function updateDebugDrawer() {
		const content = document.getElementById('SoftadminDebugContent');

		if (!content) {
			return;
		}

		if (!lastDebugResult) {
			content.innerHTML = `
				<section class="saMockDebugSection">
					<h3>Status</h3>
					${debugPre('No generation yet.')}
				</section>`;
			return;
		}

		content.innerHTML = `
			<section class="saMockDebugSection">
				<h3>Prompt</h3>
				${debugPre(lastDebugResult.prompt)}
			</section>
			<section class="saMockDebugSection">
				<h3>Source</h3>
				${debugPre(lastDebugResult.source)}
			</section>
			<section class="saMockDebugSection">
				<h3>Rendered components</h3>
				${debugList(componentNames(lastDebugResult.spec))}
			</section>
			<section class="saMockDebugSection">
				<h3>Token estimate</h3>
				${debugPre(lastDebugResult.tokenEstimate || 'No token estimate available.')}
			</section>
			<section class="saMockDebugSection">
				<h3>Aliases</h3>
				${debugList(lastDebugResult.diagnostics.aliases)}
			</section>
			<section class="saMockDebugSection">
				<h3>Unsupported / dropped</h3>
				${debugList(lastDebugResult.diagnostics.dropped)}
			</section>
			<section class="saMockDebugSection">
				<h3>Warnings</h3>
				${debugList(lastDebugResult.diagnostics.warnings)}
			</section>
			<section class="saMockDebugSection">
				<h3>Normalized spec</h3>
				${debugPre(lastDebugResult.spec)}
			</section>
			<section class="saMockDebugSection">
				<h3>Raw spec</h3>
				${debugPre(lastDebugResult.rawSpec)}
			</section>`;
	}

	function setDebugDrawerOpen(isOpen) {
		const drawer = document.getElementById('SoftadminDebugDrawer');

		if (!drawer) {
			return;
		}

		drawer.classList.toggle('saOpen', isOpen);
		drawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

		if (isOpen) {
			updateDebugDrawer();
		}
	}

	function cloneDebugResult(value) {
		return value ? JSON.parse(JSON.stringify(value)) : null;
	}

	function captureState() {
		return {
			bodyClassName: document.body.className,
			documentTitle: document.title,
			headerHtml: document.getElementById('pageheader')?.innerHTML || '',
			rightFrameClassName: document.getElementById('body')?.className || '',
			sidebarOuterClassName: document.querySelector('.saSideBarOuter')?.className || '',
			sidebarClassName: document.querySelector('.saSideBar')?.className || '',
			sidebarHtml: document.querySelector('.saSideBarOuter')?.innerHTML || '',
			rootHtml: document.querySelector('[data-softadmin-component-root]')?.innerHTML || '',
			statusText: document.getElementById('SoftadminPromptStatus')?.textContent || '',
			debugResult: cloneDebugResult(lastDebugResult),
			manualEdits: Array.from(manualEdits.entries())
		};
	}

	function restoreState(state) {
		const header = document.getElementById('pageheader');
		const sidebar = document.querySelector('.saSideBarOuter');
		const sideBarNav = document.querySelector('.saSideBar');
		const root = document.querySelector('[data-softadmin-component-root]');
		const status = document.getElementById('SoftadminPromptStatus');

		clearSelectedElement();
		document.title = state.documentTitle;
		document.body.className = state.bodyClassName || document.body.className;

		const rightFrame = document.getElementById('body');
		if (rightFrame && state.rightFrameClassName) {
			rightFrame.className = state.rightFrameClassName;
		}

		if (header) {
			header.innerHTML = state.headerHtml;
		}

		if (sidebar) {
			if (state.sidebarOuterClassName) {
				sidebar.className = state.sidebarOuterClassName;
			}
			sidebar.innerHTML = state.sidebarHtml;
		}

		const restoredSideBarNav = document.querySelector('.saSideBar');
		if (restoredSideBarNav && state.sidebarClassName) {
			restoredSideBarNav.className = state.sidebarClassName;
		} else if (sideBarNav && state.sidebarClassName) {
			sideBarNav.className = state.sidebarClassName;
		}

		applyLogoPreference();
		applyAvatarPreference();

		if (root) {
			root.innerHTML = state.rootHtml;
		}

		manualEdits.clear();
		(state.manualEdits || []).forEach(([key, value]) => {
			manualEdits.set(key, value);
		});
		enableInlineEditing();
		enableDragAndDrop();
		applyManualEdits();
		updateAccountInitials();

		lastDebugResult = cloneDebugResult(state.debugResult);
		lastTokenEstimate = lastDebugResult?.tokenEstimate || lastTokenEstimate;
		updateDebugDrawer();

		if (status) {
			status.textContent = 'Undone.';
		}

		updateUndoButton();
	}

	function updateUndoButton() {
		const undoButton = document.getElementById('SoftadminUndo');
		const resetButton = document.getElementById('SoftadminReset');

		if (undoButton) {
			undoButton.disabled = isBusy || undoStack.length === 0;
		}

		if (resetButton) {
			resetButton.disabled = isBusy || !initialState;
		}
	}

	function setBusy(busy) {
		isBusy = busy;
		const generateButton = document.getElementById('SoftadminGenerate');

		if (generateButton) {
			generateButton.disabled = busy;
			generateButton.classList.toggle('saMockPromptButtonLoading', busy);
		}

		updateUndoButton();
	}

	async function renderFromPrompt(prompt) {
		const root = document.querySelector('[data-softadmin-component-root]');
		const status = document.getElementById('SoftadminPromptStatus');
		const specRuntime = window.SoftadminSpecRuntime;
		const renderer = window.SoftadminMockups;
		const shouldResetManualEdits = promptClearsManualEdits(prompt);
		const previousState = captureState();

		if (!root || !specRuntime || !renderer) {
			return;
		}

		try {
			setBusy(true);
			if (shouldResetManualEdits) {
				resetManualEdits();
			} else {
				collectManualEdits();
			}

			if (status) {
				status.textContent = 'Generating...';
			}

			const result = await specRuntime.createSpec(prompt);
			const spec = result.spec;

			clearSelectedElement();
			suppressTopActionsForComponent(spec);

			if (hasOwnProperties(spec.frame)) {
				updateFrame(spec.frame);
			}

			updateSidebar(spec.sidebar);
			applySidebarPatch(spec.sidebarPatch);

			if (spec.components && spec.components.length) {
				renderer.renderSpec(spec, root);
			}

			enableInlineEditing();
			enableDragAndDrop();
			if (!shouldResetManualEdits) {
				applyManualEdits();
			}

			undoStack.push(previousState);
			lastDebugResult = {
				diagnostics: result.diagnostics || { aliases: [], dropped: [], warnings: [] },
				prompt,
				rawSpec: result.rawSpec,
				source: result.source,
				spec,
				tokenEstimate: null
			};
			lastTokenEstimate = generationTokenEstimate(prompt, lastDebugResult);
			lastDebugResult.tokenEstimate = lastTokenEstimate;
			updateDebugDrawer();

			if (status) {
				const sourceLabel = result.source === 'endpoint' ? 'AI spec' : 'Local spec';
				status.textContent = `${sourceLabel}: ${componentNames(spec).join(', ')}.`;
			}
		} catch (error) {
			if (status) {
				status.textContent = error.message || 'Could not generate mockup.';
			}
		} finally {
			setBusy(false);
		}
	}

	function undoLastGeneration() {
		if (isBusy || !undoStack.length) {
			return;
		}

		restoreState(undoStack.pop());
	}

	function resetMockup() {
		const status = document.getElementById('SoftadminPromptStatus');

		if (isBusy || !initialState) {
			return;
		}

		undoStack.length = 0;
		clearSelectedElement();
		resetManualEdits();
		restoreState(initialState);

		if (status) {
			status.textContent = 'Reset.';
		}

		lastTokenEstimate = null;
		updateUndoButton();
	}

	document.addEventListener('DOMContentLoaded', function () {
		const promptInput = document.getElementById('SoftadminPrompt');
		const generateButton = document.getElementById('SoftadminGenerate');
		const undoButton = document.getElementById('SoftadminUndo');
		const resetButton = document.getElementById('SoftadminReset');
		const logoFileInput = document.getElementById('SoftadminLogoFile');
		const avatarFileInput = document.getElementById('SoftadminAvatarFile');
		const logoUploadButton = document.getElementById('SoftadminLogoUpload');
		const logoUrlButton = document.getElementById('SoftadminLogoUrl');
		const logoUrlInputElement = document.getElementById('SoftadminLogoUrlInput');
		const defaultPrompt = window.SoftadminPromptToSpec && window.SoftadminPromptToSpec.defaultPrompt
			? window.SoftadminPromptToSpec.defaultPrompt
			: 'Create a customer detail page with contact summary, cases, invoices, and payments.';

		if (promptInput) {
			promptInput.value = defaultPrompt;
		}

		if (generateButton && promptInput) {
			generateButton.addEventListener('click', function () {
				renderFromPrompt(promptInput.value);
			});
		}

		if (undoButton) {
			undoButton.addEventListener('click', undoLastGeneration);
		}

		if (resetButton) {
			resetButton.addEventListener('click', resetMockup);
		}

		if (logoUploadButton && logoFileInput) {
			logoUploadButton.addEventListener('click', openLogoFilePicker);
			logoFileInput.addEventListener('change', handleLogoFileChange);
		}

		if (avatarFileInput) {
			avatarFileInput.addEventListener('change', handleAvatarFileChange);
		}

		if (logoUrlButton) {
			logoUrlButton.addEventListener('click', function () {
				if (logoUrlInputElement?.classList.contains('saOpen') && logoUrlInputElement.value.trim()) {
					applyLogoUrlInput();
				} else {
					openLogoUrlInput();
				}
			});
		}

		if (logoUrlInputElement) {
			logoUrlInputElement.addEventListener('keydown', function (event) {
				if (event.key === 'Enter') {
					event.preventDefault();
					applyLogoUrlInput();
				}

				if (event.key === 'Escape') {
					logoUrlInputElement.classList.remove('saOpen');
				}
			});
		}

		document.querySelectorAll('[data-softadmin-example-prompt]').forEach(button => {
			button.addEventListener('click', function () {
				if (promptInput) {
					promptInput.value = button.dataset.softadminExamplePrompt || '';
					promptInput.focus();
				}
			});
		});

		const debugToggle = document.getElementById('SoftadminDebugToggle');
		const debugClose = document.getElementById('SoftadminDebugClose');

		if (debugToggle) {
			debugToggle.addEventListener('click', function () {
				setDebugDrawerOpen(true);
			});
		}

		if (debugClose) {
			debugClose.addEventListener('click', function () {
				setDebugDrawerOpen(false);
			});
		}

		document.addEventListener('keydown', function (event) {
			if ((event.key === 'Delete' || event.key === 'Backspace') && selectedElement && !isInteractiveEditingTarget(event.target)) {
				event.preventDefault();
				removeSelectedElement();
				return;
			}

			if (event.key === 'Escape') {
				clearSelectedElement();
				setDebugDrawerOpen(false);
			}
		});

		document.addEventListener('mousedown', handleSelectionMouseDown, true);
		document.addEventListener('mousemove', handlePointerDragMove);
		document.addEventListener('mouseup', handlePointerDragEnd);
		document.addEventListener('click', handleSelectionToolbarClick);
		document.addEventListener('click', handleSelectionClick);
		document.addEventListener('click', handleLogoClick);
		document.addEventListener('click', handleAvatarClick);
		document.addEventListener('click', handleSidebarExpanderClick);
		document.addEventListener('dragstart', handleDragStart);
		document.addEventListener('dragover', handleDragOver);
		document.addEventListener('drop', handleDrop);
		document.addEventListener('dragend', clearDragState);
		window.addEventListener('resize', updateSelectionToolbar);
		document.addEventListener('scroll', updateSelectionToolbar, true);

		const status = document.getElementById('SoftadminPromptStatus');
		if (status) {
			status.textContent = 'Ready.';
		}

		enableInlineEditing();
		enableDragAndDrop();
		loadLogoPreference();
		loadAvatarPreference();
		applyLogoPreference();
		applyAvatarPreference();
		initialState = captureState();
		updateUndoButton();
	});
}());
