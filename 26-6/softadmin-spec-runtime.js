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

	function referenceCatalog() {
		return window.SoftadminReferenceCatalog || null;
	}

	function catalogEntries(kind) {
		const catalog = referenceCatalog();
		return catalog && catalog[kind] ? catalog[kind] : null;
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
		const catalogTypes = implementedTypesFromCatalog('components');

		if (catalogTypes) {
			return catalogTypes;
		}

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
		const catalogTypes = implementedTypesFromCatalog('controls');

		if (catalogTypes) {
			return catalogTypes;
		}

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
		const componentAliases = {
			...aliasMapFromRegistry(registryComponents()),
			...aliasMapFromCatalog('components')
		};
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
		const controlAliases = {
			...aliasMapFromRegistry(registryControls()),
			...aliasMapFromCatalog('controls')
		};

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

	function catalogPromptInstructions() {
		const catalog = referenceCatalog();

		if (!catalog) {
			return '';
		}

		const compactCatalog = compactReferenceCatalog();

		return [
			'Softadmin mockup generator constraints:',
			`Allowed component type values: ${compactCatalog.componentTypes.join(', ')}.`,
			`Allowed NewEdit field control values: ${compactCatalog.controlTypes.join(', ')}.`,
			'Do not emit any other component or control types.',
			'If the user asks for something unsupported, choose the closest renderable Softadmin component/control instead.',
			'Return only the compact Softadmin JSON spec.'
		].join('\n');
	}

	function constrainedPrompt(prompt) {
		const instructions = catalogPromptInstructions();

		return instructions
			? `${instructions}\n\nUser request:\n${prompt}`
			: prompt;
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
				prompt: constrainedPrompt(prompt),
				userPrompt: prompt,
				referenceCatalog: compactReferenceCatalog(),
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
		compactReferenceCatalog,
		normalizeSpec,
		referenceCatalog
	};
}());
