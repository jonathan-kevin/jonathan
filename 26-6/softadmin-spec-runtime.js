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

	function registryComponents() {
		const registry = window.SoftadminMockups && window.SoftadminMockups.registry;
		return registry ? registry.components : {};
	}

	function registryControls() {
		const registry = window.SoftadminMockups && window.SoftadminMockups.registry;
		return registry && registry.controls ? registry.controls.items : {};
	}

	function aliasMapFromRegistry(entries) {
		const aliases = {};

		Object.entries(entries || {}).forEach(([name, entry]) => {
			if (entry.renderType) {
				aliases[name] = entry.renderType;
			}

			if (entry.aliasFor && entries[entry.aliasFor] && entries[entry.aliasFor].renderType) {
				aliases[name] = entries[entry.aliasFor].renderType;
			}
		});

		return aliases;
	}

	function implementedComponentTypes() {
		const components = registryComponents();
		const result = new Set();

		Object.entries(components).forEach(([name, component]) => {
			if (!component.implemented) {
				return;
			}

			result.add(name);

			if (component.renderType) {
				result.add(component.renderType);
			}
		});

		return result;
	}

	function implementedControlTypes() {
		const controls = registryControls();
		const result = new Set(['textbox']);

		Object.entries(controls || {}).forEach(([name, control]) => {
			if (!control.implemented) {
				return;
			}

			result.add(name);

			if (control.renderType) {
				result.add(control.renderType);
			}
		});

		return result;
	}

	function normalizeComponent(component, diagnostics, path) {
		if (!component || typeof component !== 'object') {
			diagnostics.warnings.push(`${path}: ignored empty component.`);
			return null;
		}

		const implementedTypes = implementedComponentTypes();
		const normalizedType = aliasMapFromRegistry(registryComponents())[component.type] || component.type;

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
		const controlAliases = aliasMapFromRegistry(registryControls());

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

	async function fetchRemoteSpec(prompt) {
		if (!config.specEndpoint) {
			throw new Error('Spec endpoint is not configured.');
		}

		// Endpoint contract: POST { prompt, registry } and return the compact Softadmin spec only.
		const response = await fetch(config.specEndpoint, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				prompt,
				registry: window.SoftadminMockups.registry
			})
		});

		if (!response.ok) {
			const errorBody = await response.json().catch(() => null);
			throw new Error(errorBody?.error || `Spec endpoint returned ${response.status}.`);
		}

		return response.json();
	}

	async function createSpec(prompt) {
		const source = 'endpoint';
		const diagnostics = createDiagnostics();

		const spec = await fetchRemoteSpec(prompt);

		const rawSpec = spec;
		const normalizedSpec = normalizeSpec(spec, diagnostics);

		return {
			diagnostics,
			rawSpec,
			source,
			spec: normalizedSpec
		};
	}

	window.SoftadminSpecRuntime = {
		config,
		createSpec,
		normalizeSpec
	};
}());
