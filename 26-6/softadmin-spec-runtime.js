(function () {
	const target = typeof window !== 'undefined' ? window : globalThis;
	const config = {
		specEndpoint: defaultSpecEndpoint()
	};

	function defaultSpecEndpoint() {
		const location = target.location || { search: '', hostname: '' };
		const endpoint = new URLSearchParams(location.search).get('specEndpoint');

		if (endpoint) {
			return endpoint;
		}

		if (/\.netlify\.app$/i.test(location.hostname)) {
			return '/.netlify/functions/softadmin-spec';
		}

		return 'https://jonathankevin.netlify.app/.netlify/functions/softadmin-spec';
	}

	function referenceCatalog() {
		return target.SoftadminReferenceCatalog || null;
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

	function plannerKey(value, index) {
		const key = String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		return key || `day-${index + 1}`;
	}

	function plannerHour(value) {
		if (typeof value !== 'string' || !/^\d{1,2}:\d{2}$/.test(value)) return value;
		const [hours, minutes] = value.split(':').map(Number);
		return hours + minutes / 60;
	}

	function normalizePlannerDays(days) {
		const source = Array.isArray(days)
			? days
			: days && typeof days === 'object'
				? Object.entries(days).map(([key, value]) => typeof value === 'object' ? { key, ...value } : { key, label: value })
				: [];

		return source.map((day, index) => {
			if (typeof day === 'string') return { key: plannerKey(day, index), label: day, date: '' };
			const label = day.label || day.name || day.day || day.date || `Day ${index + 1}`;
			return { ...day, key: day.key || plannerKey(label, index), label };
		});
	}

	function normalizePlannerActivity(activity, days, index) {
		const firstDay = days[0]?.key || 'today';
		const requestedDay = activity.day || activity.dayKey || activity.date || firstDay;
		const matchingDay = days.find(day => day.key === requestedDay || day.label === requestedDay || day.date === requestedDay);
		return {
			...activity,
			title: activity.title || activity.service || activity.serviceName || activity.booking || `Booking ${index + 1}`,
			day: matchingDay?.key || requestedDay,
			start: plannerHour(activity.start ?? activity.startTime),
			end: plannerHour(activity.end ?? activity.endTime)
		};
	}

	function normalizePlanner(component, diagnostics, path) {
		let days = normalizePlannerDays(component.days || component.dates);
		const sourceResources = Array.isArray(component.resources) ? component.resources : [];
		if (!days.length) {
			const requestedDays = sourceResources.flatMap(resource => {
				const activities = resource.activities || resource.bookings || resource.assignments || resource.items || [];
				const activityDays = Array.isArray(activities) ? activities.map(activity => activity?.day || activity?.dayKey || activity?.date).filter(Boolean) : [];
				return [resource.day || resource.dayKey || resource.date, ...activityDays].filter(Boolean);
			});
			const uniqueDays = [...new Set(requestedDays)];
			days = normalizePlannerDays(uniqueDays.length ? uniqueDays : ['Today']);
			diagnostics.warnings.push(`${path}.days was normalized for Planner.`);
		}

		const resources = sourceResources.map((resource, resourceIndex) => {
			let activities = resource.activities || resource.bookings || resource.assignments || resource.items;
			if (activities && !Array.isArray(activities) && typeof activities === 'object') activities = Object.values(activities);
			if (!Array.isArray(activities)) {
				const service = resource.service || resource.serviceName || resource.booking;
				activities = service ? [{
					title: service,
					description: resource.activityDescription || resource.customer || '',
					day: resource.day || resource.dayKey || resource.date || days[0].key,
					start: resource.start ?? resource.startTime,
					end: resource.end ?? resource.endTime,
					tone: resource.tone
				}] : [];
				diagnostics.warnings.push(`${path}.resources[${resourceIndex}].activities was normalized for Planner.`);
			}

			return {
				...resource,
				key: resource.key || plannerKey(resource.label || resource.name, resourceIndex),
				label: resource.label || resource.name || `Resource ${resourceIndex + 1}`,
				activities: activities.map((activity, activityIndex) => normalizePlannerActivity(activity || {}, days, activityIndex))
			};
		});

		return { ...component, days, resources };
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

		if (normalized.type === 'Planner') {
			return normalizePlanner(normalized, diagnostics, path);
		}

		if (normalized.type === 'CalendarWeekdays') {
			const mode = String(normalized.mode || 'Weekdays').trim().toLowerCase().replace(/[\s_-]+/g, ' ');
			normalized.mode = mode === 'weekdays with time scale' || mode === 'weekday with time scale' || mode === 'weekdays timescale'
				? 'Weekdays with time scale'
				: mode === 'resources with time scale' || mode === 'resource with time scale' || mode === 'resources timescale'
					? 'Resources with time scale'
					: 'Weekdays';
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

		if (normalized.type === 'NewEdit' && Array.isArray(normalized.rows)) {
			normalized.rows = normalized.rows.map((row, rowIndex) => ({
				...row,
				columns: (row.columns || []).map((column, columnIndex) => ({
					...column,
					sections: (column.sections || []).map((section, sectionIndex) => ({
						...section,
						fields: normalizeFields(section.fields || [], diagnostics, `${path}.rows[${rowIndex}].columns[${columnIndex}].sections[${sectionIndex}].fields`)
					}))
				}))
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
		target.SoftadminSpecContract?.assertSpec(normalizedSpec);

		return {
			diagnostics,
			usage: response.usage || null,
			rawSpec,
			source,
			spec: normalizedSpec
		};
	}

	target.SoftadminSpecRuntime = {
		config,
		createSpec,
		compactReferenceCatalog,
		normalizeSpec,
		referenceCatalog
	};
}());
