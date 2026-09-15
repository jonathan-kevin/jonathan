(function (root) {
	'use strict';
	const clone = value => JSON.parse(JSON.stringify(value));
	let sequence = 0;
	const newId = () => `ne_${Date.now().toString(36)}_${(++sequence).toString(36)}`;

	function entries(spec) {
		const result = [];
		function fields(list, component) {
			(list || []).forEach(node => {
				result.push({ node, list, component, kind: 'field' });
				if (node.layout === 'siblings') fields(node.fields, component);
			});
		}
		function sections(list, component) {
			(list || []).forEach(node => {
				result.push({ node, component, kind: 'section' });
				if (Array.isArray(node.subgroups)) sections(node.subgroups, component);
				else fields(node.fields, component);
			});
		}
		function visit(value) {
			if (!value || typeof value !== 'object') return;
			if (value.type === 'NewEdit') {
				result.push({ node: value, component: value, kind: 'component' });
				if (Array.isArray(value.rows)) value.rows.forEach(row => (row.columns || []).forEach(column => sections(column.sections, value)));
				else sections(value.sections, value);
				return;
			}
			Object.values(value).forEach(child => {
				if (Array.isArray(child)) child.forEach(visit);
				else if (child && typeof child === 'object') visit(child);
			});
		}
		visit(spec);
		return result;
	}

	function prepare(spec) {
		const seen = new Set();
		entries(spec).forEach(({ node }) => {
			if (typeof node._editorId !== 'string' || !/^ne_[a-z0-9_]+$/.test(node._editorId) || seen.has(node._editorId)) {
				do { node._editorId = newId(); } while (seen.has(node._editorId));
			}
			seen.add(node._editorId);
		});
		return spec;
	}

	function freshField(field) {
		const copy = clone(field);
		function renew(node) {
			node._editorId = newId();
			if (node.id) node.id = node._editorId;
			if (node.layout === 'siblings') (node.fields || []).forEach(renew);
		}
		renew(copy);
		return copy;
	}

	function apply(spec, command) {
		const next = prepare(clone(spec));
		const records = entries(next);
		const source = records.find(entry => entry.node._editorId === command.id && entry.kind === 'field');
		const target = records.find(entry => entry.node._editorId === command.targetId);
		let selectedId = source?.node._editorId;
		if (command.op === 'insert') {
			if (!target || !['field', 'section'].includes(target.kind)) throw new Error('Select a field group first.');
			const field = freshField(command.field);
			if (target.kind === 'section') {
				if (target.node.subgroups) throw new Error('Select a subgroup first.');
				(target.node.fields ||= []).push(field);
			} else target.list.splice(target.list.indexOf(target.node) + (command.after ? 1 : 0), 0, field);
			selectedId = field._editorId;
		} else {
			if (!source) throw new Error('This field is not part of the current spec.');
			const index = source.list.indexOf(source.node);
			if (command.op === 'remove') {
				source.list.splice(index, 1);
				selectedId = null;
			} else if (command.op === 'duplicate') {
				const field = freshField(source.node);
				source.list.splice(index + 1, 0, field);
				selectedId = field._editorId;
			} else if (command.op === 'move') {
				if (!target || target.kind !== 'field' || source === target) return { spec: next, selectedId, changed: false };
				if (source.component !== target.component || source.node.fields?.includes(target.node)) throw new Error('Move fields within the same form.');
				const contains = node => node === target.node || (node.fields || []).some(contains);
				if (contains(source.node)) throw new Error('Cannot move a row inside itself.');
				source.list.splice(index, 1);
				target.list.splice(target.list.indexOf(target.node) + (command.after ? 1 : 0), 0, source.node);
			} else if (command.op === 'siblings') {
				if (source.node.layout !== 'siblings') {
					const row = { _editorId: newId(), layout: 'siblings', fields: [source.node] };
					source.list[index] = row;
					selectedId = row._editorId;
					if (command.field) row.fields.push(freshField(command.field));
				} else if (command.field) source.node.fields.push(freshField(command.field));
			} else throw new Error('Unknown form edit.');
		}
		return { spec: next, selectedId, changed: true };
	}

	root.SoftadminNewEditEditor = { prepare, entries, apply };
}(typeof window === 'undefined' ? globalThis : window));
