(function () {
	let lastDebugResult = null;
	const undoStack = [];
	const manualEdits = new Map();
	let isBusy = false;

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

	function updateFrame(frame) {
		const title = frame.title || 'Softadmin mockup';
		const actions = frame.actions || [];
		const desktopHeader = document.querySelector('#pageheader > .saDesktopHeader');
		const smallHeader = document.querySelector('#pageheader > .saSmallScreenHeader');

		document.title = frame.documentTitle || `${title} - Softadmin mockup`;

		document.querySelectorAll('#pageheader .saHeaderText, .saSideBarHeaderSmallScreen h1').forEach(element => {
			element.textContent = title;
		});

		document.querySelector('.saAccountName').textContent = 'Anna Andersson';
		document.querySelector('.saAccountAvatar').textContent = 'AA';

		const breadcrumbs = desktopHeader.querySelector('.saBreadcrumbs');
		if (breadcrumbs) {
			breadcrumbs.innerHTML = renderBreadcrumbs(frame.breadcrumbs || ['Home', title]);
		}

		const desktopActions = desktopHeader.querySelector('.saActionLinks');
		if (desktopActions) {
			desktopActions.innerHTML = `
				${actions.map((action, index) => buttonHtml(action, index > 0)).join('')}
				<div class="saCollectorWrapper">
					<button class="saMoreButton" type="button"><i class="far fa-ellipsis-vertical icon saIcon"></i></button>
				</div>`;
		}

		const smallActions = smallHeader.querySelector('.saActionLinks');
		if (smallActions) {
			smallActions.innerHTML = `
				${actions.map((action, index) => buttonHtml(action, index > 0)).join('')}
				<div class="saCollectorWrapper">
					<button class="saMoreButton" aria-expanded="false" type="button">
						<i class="far fa-ellipsis-vertical icon saIcon"></i>
					</button>
				</div>`;
		}
	}

	function componentNames(spec) {
		const displayNames = {
			DetailView: 'Detailview',
			ResultGrid: 'Grid'
		};

		const names = (spec.components || []).map(component => {
			return displayNames[component.type] || component.type;
		});

		if (spec.sidebar) {
			names.unshift('Sidebar');
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

	function updateSidebar(sidebar) {
		if (!sidebar || !Array.isArray(sidebar.groups)) {
			return;
		}

		const body = document.querySelector('.saSideBarBody');

		if (!body) {
			return;
		}

		body.innerHTML = `
			${sidebar.favorites ? `
				<div class="saSideBarGroup saSideBarFavorites">
					<div class="saSideBarFavoritesHeader">
						<button class="saButtonFavorites" type="button"><span>${escapeHtml(sidebar.favorites.heading || 'Favorites')}</span><i class="saIcon saIcon far fa-angle-down"></i></button>
						<button class="saButtonFavoritesMinimized" type="button"><i class="saIcon saIcon far fa-angle-down"></i></button>
						<button class="saButtonFavoritesEdit" type="button">${escapeHtml(sidebar.favorites.editLabel || 'Edit')}</button>
					</div>
					<ul class="saItemList">${(sidebar.favorites.items || []).map(item => sidebarItemHtml({ ...item, favorite: true })).join('')}</ul>
				</div>` : ''}
			${sidebar.groups.map(sidebarGroupHtml).join('')}`;
	}

	function hasOwnProperties(value) {
		return value && Object.keys(value).length > 0;
	}

	function editableTextSelector() {
		return [
			'#pageheader .saHeaderText',
			'#pageheader .saBreadcrumb a',
			'#pageheader .saNoLinkBreadcrumb',
			'#pageheader .saButtonText',
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

		if (element.closest('.saSideBarBody')) {
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
				? document.querySelector('.saSideBarBody')
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
			documentTitle: document.title,
			headerHtml: document.getElementById('pageheader')?.innerHTML || '',
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
		const root = document.querySelector('[data-softadmin-component-root]');
		const status = document.getElementById('SoftadminPromptStatus');

		document.title = state.documentTitle;

		if (header) {
			header.innerHTML = state.headerHtml;
		}

		if (sidebar) {
			sidebar.innerHTML = state.sidebarHtml;
		}

		if (root) {
			root.innerHTML = state.rootHtml;
		}

		manualEdits.clear();
		(state.manualEdits || []).forEach(([key, value]) => {
			manualEdits.set(key, value);
		});
		enableInlineEditing();
		applyManualEdits();

		lastDebugResult = cloneDebugResult(state.debugResult);
		updateDebugDrawer();

		if (status) {
			status.textContent = 'Undone.';
		}

		updateUndoButton();
	}

	function updateUndoButton() {
		const undoButton = document.getElementById('SoftadminUndo');

		if (!undoButton) {
			return;
		}

		undoButton.disabled = isBusy || undoStack.length === 0;
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

			if (hasOwnProperties(spec.frame)) {
				updateFrame(spec.frame);
			}

			updateSidebar(spec.sidebar);

			if (spec.components && spec.components.length) {
				renderer.renderSpec(spec, root);
			}

			enableInlineEditing();
			if (!shouldResetManualEdits) {
				applyManualEdits();
			}

			undoStack.push(previousState);
			lastDebugResult = {
				diagnostics: result.diagnostics || { aliases: [], dropped: [], warnings: [] },
				prompt,
				rawSpec: result.rawSpec,
				source: result.source,
				spec
			};
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

	document.addEventListener('DOMContentLoaded', function () {
		const promptInput = document.getElementById('SoftadminPrompt');
		const generateButton = document.getElementById('SoftadminGenerate');
		const undoButton = document.getElementById('SoftadminUndo');
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
			if (event.key === 'Escape') {
				setDebugDrawerOpen(false);
			}
		});

		const status = document.getElementById('SoftadminPromptStatus');
		if (status) {
			status.textContent = 'Ready.';
		}

		enableInlineEditing();
		updateUndoButton();
	});
}());
