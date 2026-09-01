(function () {
	function catalog() {
		const target = typeof window !== 'undefined' ? window : globalThis;
		return target.SoftadminReferenceCatalog || { components: {}, controls: {} };
	}

	function canonicalTypes(entries) {
		return new Set(Object.entries(entries || {})
			.filter(([, entry]) => entry.renderable)
			.map(([name, entry]) => entry.specType || name));
	}

	function validateFields(fields, path, errors, controlTypes) {
		if (!Array.isArray(fields)) {
			errors.push(`${path} must be an array.`);
			return;
		}

		fields.forEach((field, index) => {
			const fieldPath = `${path}[${index}]`;
			if (!field || typeof field !== 'object' || Array.isArray(field)) {
				errors.push(`${fieldPath} must be an object.`);
				return;
			}

			if (field.layout === 'siblings') {
				validateFields(field.fields, `${fieldPath}.fields`, errors, controlTypes);
				return;
			}

			if (!controlTypes.has(field.control || 'textbox')) {
				errors.push(`${fieldPath}.control is not supported.`);
			}
		});
	}

	function requireArray(component, key, path, errors) {
		if (!Array.isArray(component[key])) {
			errors.push(`${path}.${key} must be an array.`);
			return [];
		}

		return component[key];
	}

	function validateTreeNodes(nodes, path, errors) {
		if (!Array.isArray(nodes)) {
			errors.push(`${path} must be an array.`);
			return;
		}

		nodes.forEach((node, index) => {
			const nodePath = `${path}[${index}]`;
			if (!node || typeof node !== 'object' || Array.isArray(node)) {
				errors.push(`${nodePath} must be an object.`);
				return;
			}
			if (node.children !== undefined) {
				validateTreeNodes(node.children, `${nodePath}.children`, errors);
			}
		});
	}

	function validateComponent(component, path, errors, componentTypes, controlTypes) {
		if (!component || typeof component !== 'object' || Array.isArray(component)) {
			errors.push(`${path} must be an object.`);
			return;
		}

		if (!componentTypes.has(component.type)) {
			errors.push(`${path}.type is not supported.`);
			return;
		}

		if (component.type === 'MenuGroups') {
			requireArray(component, 'groups', path, errors).forEach((group, index) => {
				if (!group || !Array.isArray(group.items)) {
					errors.push(`${path}.groups[${index}].items must be an array.`);
				}
			});
		}

		if (component.type === 'LinkList') {
			requireArray(component, 'groups', path, errors).forEach((group, index) => {
				if (!group || !Array.isArray(group.items)) {
					errors.push(`${path}.groups[${index}].items must be an array.`);
				}
			});
		}

		if (component.type === 'Chat') {
			requireArray(component, 'messages', path, errors);
		}

		if (component.type === 'CalendarWeekdays') {
			const calendarModes = ['Weekdays', 'Weekdays with time scale', 'Resources with time scale'];
			const mode = component.mode || 'Weekdays';
			if (!calendarModes.includes(mode)) errors.push(`${path}.mode must be Weekdays, Weekdays with time scale, or Resources with time scale.`);
			const weeks = component.weeks === undefined && mode === 'Resources with time scale' ? [] : requireArray(component, 'weeks', path, errors);
			weeks.forEach((week, weekIndex) => {
				if (!week || !Array.isArray(week.days)) {
					errors.push(`${path}.weeks[${weekIndex}].days must be an array.`);
					return;
				}
				week.days.forEach((day, dayIndex) => {
					if (!day || typeof day !== 'object' || Array.isArray(day)) {
						errors.push(`${path}.weeks[${weekIndex}].days[${dayIndex}] must be an object.`);
					} else if (day.activities !== undefined && !Array.isArray(day.activities)) {
						errors.push(`${path}.weeks[${weekIndex}].days[${dayIndex}].activities must be an array.`);
					}
				});
			});
			if (mode === 'Resources with time scale') {
				requireArray(component, 'resourceColumns', path, errors).forEach((resource, resourceIndex) => {
					if (!resource || !Array.isArray(resource.activities)) errors.push(`${path}.resourceColumns[${resourceIndex}].activities must be an array.`);
				});
			}
			if (component.timeSlots !== undefined && !Array.isArray(component.timeSlots)) errors.push(`${path}.timeSlots must be an array.`);
		}

		if (component.type === 'NewEdit') {
			if (component.rows !== undefined) {
				requireArray(component, 'rows', path, errors).forEach((row, rowIndex) => {
					requireArray(row, 'columns', `${path}.rows[${rowIndex}]`, errors).forEach((column, columnIndex) => {
						requireArray(column, 'sections', `${path}.rows[${rowIndex}].columns[${columnIndex}]`, errors).forEach((section, sectionIndex) => {
							validateFields(section?.fields, `${path}.rows[${rowIndex}].columns[${columnIndex}].sections[${sectionIndex}].fields`, errors, controlTypes);
						});
					});
				});
			} else {
				requireArray(component, 'sections', path, errors).forEach((section, index) => {
					validateFields(section?.fields, `${path}.sections[${index}].fields`, errors, controlTypes);
				});
			}
		}

		if (component.type === 'ResultGrid') {
			requireArray(component, 'columns', path, errors);
			if (component.rowActions !== undefined) requireArray(component, 'rowActions', path, errors);
			requireArray(component, 'rows', path, errors).forEach((row, index) => {
				if (row?.actions !== undefined) errors.push(`${path}.rows[${index}].actions is not allowed; define rowActions on the Grid.`);
				if (row?.disabledActions !== undefined && !Array.isArray(row.disabledActions)) errors.push(`${path}.rows[${index}].disabledActions must be an array.`);
				if ((row?.type === 'subtotal' || row?.type === 'aggregate') && (!row.values || typeof row.values !== 'object' || Array.isArray(row.values))) errors.push(`${path}.rows[${index}].values must be an object.`);
			});
			if (component.total !== undefined && (!component.total || typeof component.total.values !== 'object' || Array.isArray(component.total.values))) errors.push(`${path}.total.values must be an object.`);
		}

		if (component.type === 'PivotGrid') {
			requireArray(component, 'columns', path, errors);
			if (component.rowActions !== undefined) requireArray(component, 'rowActions', path, errors);
			requireArray(component, 'rows', path, errors).forEach((row, index) => {
				if (row?.actions !== undefined) errors.push(`${path}.rows[${index}].actions is not allowed; define rowActions on the Pivot Grid.`);
				if (row?.disabledActions !== undefined && !Array.isArray(row.disabledActions)) errors.push(`${path}.rows[${index}].disabledActions must be an array.`);
			});
		}

		if (component.type === 'EnterpriseSearch') {
			requireArray(component, 'groups', path, errors);
		}

		if (component.type === 'ImageGallery') {
			requireArray(component, 'groups', path, errors).forEach((group, index) => {
				if (!group || !Array.isArray(group.items)) {
					errors.push(`${path}.groups[${index}].items must be an array.`);
				}
			});
		}

		if (component.type === 'InlineDocument') {
			requireArray(component, 'documents', path, errors);
		}

		if (component.type === 'LinearProcess') {
			requireArray(component, 'steps', path, errors);
		}

		if (component.type === 'Planner') {
			requireArray(component, 'days', path, errors);
			requireArray(component, 'resources', path, errors).forEach((resource, index) => {
				if (!resource || !Array.isArray(resource.activities)) {
					errors.push(`${path}.resources[${index}].activities must be an array.`);
				}
			});
			if (component.unbookedGroups !== undefined) {
				requireArray(component, 'unbookedGroups', path, errors).forEach((group, index) => {
					if (!group || !Array.isArray(group.items)) {
						errors.push(`${path}.unbookedGroups[${index}].items must be an array.`);
					}
				});
			}
		}

		if (component.type === 'Treeview') {
			validateTreeNodes(component.nodes, `${path}.nodes`, errors);
		}

		if (component.type === 'PdfTemplateEditor') {
			requireArray(component, 'groups', path, errors).forEach((group, index) => {
				if (!group || !Array.isArray(group.values)) {
					errors.push(`${path}.groups[${index}].values must be an array.`);
				}
			});
			requireArray(component, 'placeholders', path, errors);
		}

		if (component.type === 'DetailView') {
			requireArray(component, 'tabs', path, errors).forEach((tab, index) => {
				if (tab?.component) {
					validateComponent(tab.component, `${path}.tabs[${index}].component`, errors, componentTypes, controlTypes);
				}
			});
		}

		if (component.type === 'InfoBoxes') {
			if (!Array.isArray(component.boxes) && !Array.isArray(component.messages)) {
				errors.push(`${path} must contain boxes or messages.`);
			}
			(component.boxes || []).forEach((box, boxIndex) => {
				if (box?.kpis !== undefined && !Array.isArray(box.kpis)) {
					errors.push(`${path}.boxes[${boxIndex}].kpis must be an array.`);
				}
				(box?.kpis || []).forEach((kpi, kpiIndex) => {
					if (!kpi || typeof kpi !== 'object' || Array.isArray(kpi)) {
						errors.push(`${path}.boxes[${boxIndex}].kpis[${kpiIndex}] must be an object.`);
					} else if (kpi.value === undefined) {
						errors.push(`${path}.boxes[${boxIndex}].kpis[${kpiIndex}].value is required.`);
					}
				});
				if (box?.meters !== undefined && !Array.isArray(box.meters)) {
					errors.push(`${path}.boxes[${boxIndex}].meters must be an array.`);
				}
				(box?.meters || []).forEach((meter, meterIndex) => {
					if (!meter || typeof meter !== 'object' || Array.isArray(meter)) {
						errors.push(`${path}.boxes[${boxIndex}].meters[${meterIndex}] must be an object.`);
					} else if (meter.value === undefined) {
						errors.push(`${path}.boxes[${boxIndex}].meters[${meterIndex}].value is required.`);
					} else if (meter.intervals !== undefined && !Array.isArray(meter.intervals)) {
						errors.push(`${path}.boxes[${boxIndex}].meters[${meterIndex}].intervals must be an array.`);
					}
				});
				if (box?.charts !== undefined && !Array.isArray(box.charts)) {
					errors.push(`${path}.boxes[${boxIndex}].charts must be an array.`);
				}
				(box?.charts || []).forEach((chart, chartIndex) => {
					const chartPath = `${path}.boxes[${boxIndex}].charts[${chartIndex}]`;
					if (!chart || typeof chart !== 'object' || Array.isArray(chart)) {
						errors.push(`${chartPath} must be an object.`);
						return;
					}
					const chartType = String(chart.type || 'line').toLowerCase();
					if (!['line', 'pie'].includes(chartType)) errors.push(`${chartPath}.type must be line or pie.`);
					if (chartType === 'line' && !Array.isArray(chart.labels)) errors.push(`${chartPath}.labels must be an array.`);
					if (!Array.isArray(chart.series)) {
						errors.push(`${chartPath}.series must be an array.`);
					} else {
						chart.series.forEach((series, seriesIndex) => {
							if (!series || (chartType === 'line' && !Array.isArray(series.values))) errors.push(`${chartPath}.series[${seriesIndex}].values must be an array.`);
							if (series && chartType === 'pie' && series.value === undefined) errors.push(`${chartPath}.series[${seriesIndex}].value is required.`);
						});
					}
				});
			});
		}

		if (component.type === 'Multipart') {
			requireArray(component, 'parts', path, errors).forEach((part, index) => {
				validateComponent(part?.component, `${path}.parts[${index}].component`, errors, componentTypes, controlTypes);
			});
		}
	}

	function validateSpec(spec) {
		const errors = [];
		const reference = catalog();
		const componentTypes = canonicalTypes(reference.components);
		const controlTypes = canonicalTypes(reference.controls);

		if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
			return { valid: false, errors: ['Spec must be an object.'] };
		}

		if (spec.frame !== undefined && (!spec.frame || typeof spec.frame !== 'object' || Array.isArray(spec.frame))) {
			errors.push('frame must be an object.');
		}

		if (!Array.isArray(spec.components)) {
			errors.push('components must be an array.');
		} else {
			if (spec.components.length > 20) {
				errors.push('components may contain at most 20 items.');
			}
			spec.components.forEach((component, index) => {
				validateComponent(component, `components[${index}]`, errors, componentTypes, controlTypes);
			});
		}

		return { valid: errors.length === 0, errors };
	}

	function assertSpec(spec) {
		const result = validateSpec(spec);
		if (!result.valid) {
			throw new Error(`Invalid Softadmin spec: ${result.errors.slice(0, 5).join(' ')}`);
		}
		return spec;
	}

	const target = typeof window !== 'undefined' ? window : globalThis;
	target.SoftadminSpecContract = { assertSpec, validateSpec };
}());
