(function () {
	let lastDebugResult = null;

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

		return (spec.components || []).map(component => {
			return displayNames[component.type] || component.type;
		});
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

	function setBusy(isBusy) {
		const generateButton = document.getElementById('SoftadminGenerate');

		if (!generateButton) {
			return;
		}

		generateButton.disabled = isBusy;
		generateButton.classList.toggle('saMockPromptButtonLoading', isBusy);
	}

	async function renderFromPrompt(prompt) {
		const root = document.querySelector('[data-softadmin-component-root]');
		const status = document.getElementById('SoftadminPromptStatus');
		const specRuntime = window.SoftadminSpecRuntime;
		const renderer = window.SoftadminMockups;

		if (!root || !specRuntime || !renderer) {
			return;
		}

		try {
			setBusy(true);

			if (status) {
				status.textContent = 'Generating...';
			}

			const result = await specRuntime.createSpec(prompt);
			const spec = result.spec;

			updateFrame(spec.frame || {});
			renderer.renderSpec(spec, root);
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

	document.addEventListener('DOMContentLoaded', function () {
		const promptInput = document.getElementById('SoftadminPrompt');
		const generateButton = document.getElementById('SoftadminGenerate');
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
	});
}());
