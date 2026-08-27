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

		if (component.type === 'NewEdit') {
			requireArray(component, 'sections', path, errors).forEach((section, index) => {
				validateFields(section?.fields, `${path}.sections[${index}].fields`, errors, controlTypes);
			});
		}

		if (component.type === 'ResultGrid') {
			requireArray(component, 'columns', path, errors);
			requireArray(component, 'rows', path, errors);
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

		if (component.type === 'InfoBoxes' && !Array.isArray(component.boxes) && !Array.isArray(component.messages)) {
			errors.push(`${path} must contain boxes or messages.`);
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
