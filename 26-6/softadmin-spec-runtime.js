(function () {
	const config = {
		specEndpoint: defaultSpecEndpoint()
	};

	function defaultSpecEndpoint() {
		const endpoint = new URLSearchParams(window.location.search).get('specEndpoint');

		if (endpoint) {
			return endpoint;
		}

		if (/\.netlify\.app$/i.test(window.location.hostname)) {
			return '/.netlify/functions/softadmin-spec';
		}

		return 'https://jonathankevin.netlify.app/.netlify/functions/softadmin-spec';
	}

	function referenceCatalog() {
		return window.SoftadminReferenceCatalog || null;
	}

	function catalogEntries(kind) {
		const catalog = referenceCatalog();
		return catalog && catalog[kind] ? catalog[kind] : null;
	}

	function aliasMapFromCatalog(kind) {
		const entries = catalogEntries(kind);
		const aliases = {};

		Object.entries(entries || {}).forEach(([name, entry]) => {
			if (!entry.renderable) {
				return;
			}

			const target = entry.specType || entry.renderType || name;

			aliases[name] = target;
			(entry.specTypes || []).forEach(type => {
				aliases[type] = target;
			});
			(entry.aliases || []).forEach(alias => {
				aliases[alias] = target;
			});
		});

		return aliases;
	}

	function implementedTypesFromCatalog(kind) {
		const entries = catalogEntries(kind);

		if (!entries) {
			return null;
		}

		const result = new Set();

		Object.entries(entries).forEach(([name, entry]) => {
			if (!entry.renderable) {
				return;
			}

			result.add(name);
			result.add(entry.specType || entry.renderType || name);
			(entry.specTypes || []).forEach(type => result.add(type));
			(entry.aliases || []).forEach(alias => result.add(alias));
		});

		return result;
	}

	function implementedComponentTypes() {
		return implementedTypesFromCatalog('components') || new Set();
	}

	function implementedControlTypes() {
		return implementedTypesFromCatalog('controls') || new Set();
	}

	function normalizeComponent(component, diagnostics, path) {
		if (!component || typeof component !== 'object') {
			diagnostics.warnings.push(`${path}: ignored empty component.`);
			return null;
		}

		const implementedTypes = implementedComponentTypes();
		const componentAliases = aliasMapFromCatalog('components');
		const normalizedType = componentAliases[component.type] || component.type;

		if (normalizedType !== component.type) {
			diagnostics.aliases.push(`${path}: ${component.type} -> ${normalizedType}`);
		}

		if (!implementedTypes.has(normalizedType)) {
			diagnostics.dropped.push(`${path}: ${component.type || 'Unknown component'}`);
			return null;
		}

		const normalized = {
			...component,
			type: normalizedType
		};

		if (normalized.type === 'CalendarWeekdays') {
			normalized.mode = normalized.mode || 'Weekdays';
		}

		if (normalized.type === 'DetailView' && Array.isArray(normalized.tabs)) {
			normalized.tabs = normalized.tabs.map((tab, index) => {
				if (!tab || !tab.component) {
					return tab;
				}

				return {
					...tab,
					component: normalizeComponent(tab.component, diagnostics, `${path}.tabs[${index}].component`)
				};
			});
		}

		if (normalized.type === 'Multipart' && Array.isArray(normalized.parts)) {
			normalized.parts = normalized.parts.map((part, index) => ({
				...part,
				component: normalizeComponent(part.component, diagnostics, `${path}.parts[${index}].component`)
			}));
		}

		if (normalized.type === 'NewEdit' && Array.isArray(normalized.sections)) {
			normalized.sections = normalized.sections.map((section, index) => ({
				...section,
				fields: normalizeFields(section.fields || [], diagnostics, `${path}.sections[${index}].fields`)
			}));
		}

		return normalized;
	}

	function normalizeFields(fields, diagnostics, path) {
		const implementedControls = implementedControlTypes();
		const controlAliases = aliasMapFromCatalog('controls');

		return fields.map((field, index) => {
			const fieldPath = `${path}[${index}]`;

			if (!field || typeof field !== 'object') {
				diagnostics.warnings.push(`${fieldPath}: ignored empty field.`);
				return null;
			}

			if (field.layout === 'siblings') {
				return {
					...field,
					fields: normalizeFields(field.fields || [], diagnostics, `${fieldPath}.fields`)
				};
			}

			const control = controlAliases[field.control] || field.control || 'textbox';

			if (field.control && control !== field.control) {
				diagnostics.aliases.push(`${fieldPath}: ${field.control} -> ${control}`);
			}

			if (!implementedControls.has(control)) {
				diagnostics.warnings.push(`${fieldPath}: ${field.control || 'unknown control'} is not implemented, using textbox.`);
				return {
					...field,
					control: 'textbox'
				};
			}

			return {
				...field,
				control
			};
		}).filter(Boolean);
	}

	function createDiagnostics() {
		return {
			aliases: [],
			dropped: [],
			warnings: []
		};
	}

	function normalizeSpec(spec, diagnostics = createDiagnostics()) {
		if (!spec || typeof spec !== 'object') {
			throw new Error('Spec must be an object.');
		}

		const frame = spec.frame || {};
		const components = (spec.components || [])
			.map((component, index) => normalizeComponent(component, diagnostics, `components[${index}]`))
			.filter(Boolean);

		if (!components.length && !spec.sidebar && !spec.sidebarPatch && !Object.keys(frame).length) {
			throw new Error('Spec did not contain any supported components.');
		}

		const normalizedSpec = {
			frame,
			components,
			sidebar: spec.sidebar || null,
			sidebarPatch: spec.sidebarPatch || null
		};

		return normalizedSpec;
	}

	function namesByRenderableFlag(entries, renderable) {
		return Object.entries(entries || {})
			.filter(([, entry]) => Boolean(entry.renderable) === renderable)
			.map(([name]) => name);
	}

	function renderableSpecValues(entries) {
		const values = new Set();

		Object.entries(entries || {}).forEach(([name, entry]) => {
			if (!entry.renderable) {
				return;
			}

			values.add(entry.specType || entry.renderType || name);
			(entry.specTypes || []).forEach(type => values.add(type));
		});

		return Array.from(values);
	}

	function compactReferenceCatalog() {
		const catalog = referenceCatalog();

		if (!catalog) {
			return null;
		}

		return {
			componentTypes: renderableSpecValues(catalog.components),
			components: namesByRenderableFlag(catalog.components, true),
			controlTypes: renderableSpecValues(catalog.controls),
			controls: namesByRenderableFlag(catalog.controls, true)
		};
	}

	async function fetchRemoteSpec(prompt, currentSpec) {
		if (!config.specEndpoint) {
			throw new Error('Spec endpoint is not configured.');
		}

		// The endpoint owns the catalog and prompt contract. Follow-up turns also send the current compact spec.
		const response = await fetch(config.specEndpoint, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ prompt, currentSpec: currentSpec || undefined })
		});

		if (!response.ok) {
			const errorBody = await response.json().catch(() => null);
			throw new Error(errorBody?.error || `Spec endpoint returned ${response.status}.`);
		}

		return response.json();
	}

	async function createSpec(prompt, currentSpec) {
		const source = 'endpoint';
		const diagnostics = createDiagnostics();

		const response = await fetchRemoteSpec(prompt, currentSpec);
		const spec = response.spec || response;

		const rawSpec = response.operations ? { operations: response.operations } : spec;
		const normalizedSpec = normalizeSpec(spec, diagnostics);
		window.SoftadminSpecContract?.assertSpec(normalizedSpec);

		return {
			diagnostics,
			usage: response.usage || null,
			rawSpec,
			source,
			spec: normalizedSpec
		};
	}

	window.SoftadminSpecRuntime = {
		config,
		createSpec,
		compactReferenceCatalog,
		normalizeSpec,
		referenceCatalog
	};
}());
