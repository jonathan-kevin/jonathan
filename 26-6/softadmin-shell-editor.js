(function (root) {
	'use strict';
	const clone = value => JSON.parse(JSON.stringify(value));
	let sequence = 0;
	const newId = () => `sh_${Date.now().toString(36)}_${(++sequence).toString(36)}`;

	function entries(spec) {
		const records = [];
		const add = (list, kind) => (list || []).forEach(node => records.push({ node, list, kind }));
		add(spec.frame?.actions, 'action');
		add(spec.sidebar?.groups, 'group');
		(spec.sidebar?.groups || []).forEach(group => add(group.items, 'item'));
		add(spec.sidebar?.favorites?.items, 'item');
		return records;
	}

	function prepare(spec, baseline = {}) {
		spec.frame = { ...clone(baseline.frame || {}), ...(spec.frame || {}) };
		const previous = baseline.sidebar || {};
		const supplied = spec.sidebar || {};
		spec.sidebar = { ...clone(previous), ...supplied };
		if (supplied.favorites) spec.sidebar.favorites = { ...clone(previous.favorites || {}), ...supplied.favorites };
		if (supplied.favorites?.append) {
			spec.sidebar.favorites = { ...previous.favorites, ...supplied.favorites,
				items: [...(previous.favorites?.items || []), ...(supplied.favorites.items || [])] };
		}
		if (spec.sidebar.favorites) delete spec.sidebar.favorites.append;
		const groups = [spec.sidebar.favorites, ...(spec.sidebar.groups || [])].filter(Boolean);
		let resolved;
		const norm = value => String(value || '').trim().toLowerCase();
		for (const item of spec.sidebarPatch?.removeItems || []) {
			for (const group of groups) {
				const index = (group.items || []).findIndex(candidate => norm(candidate.title) === norm(item.title));
				if (index < 0) continue;
				resolved ||= group;
				group.items.splice(index, 1);
				break;
			}
		}
		const addition = spec.sidebarPatch?.addItemsToResolvedGroup;
		const target = resolved || groups.find(group => norm(group.heading) === norm(addition?.fallbackGroup));
		if (addition && target) (target.items ||= []).push(...(addition.items || []));
		spec.sidebarPatch = null;
		const seen = new Set();
		entries(spec).forEach(({ node }) => {
			if (!/^sh_[a-z0-9_]+$/.test(node._shellId || '') || seen.has(node._shellId)) {
				do { node._shellId = newId(); } while (seen.has(node._shellId));
			}
			seen.add(node._shellId);
		});
		return spec;
	}

	function apply(spec, command) {
		const next = prepare(clone(spec));
		const records = entries(next);
		const source = records.find(entry => entry.node._shellId === command.id);
		let selectedId = source?.node._shellId;
		if (command.op === 'rename') {
			if (command.kind === 'title') {
				next.frame.title = command.value;
				next.frame.documentTitle = `${command.value} - Softadmin mockup`;
			} else if (command.kind === 'account') next.sidebar.accountName = command.value;
			else if (command.kind === 'favorites') (next.sidebar.favorites ||= { items: [] }).heading = command.value;
			else if (command.kind === 'breadcrumb') {
				if (!next.frame.breadcrumbs || command.index < 0 || command.index >= next.frame.breadcrumbs.length) throw new Error('Breadcrumb not found.');
				next.frame.breadcrumbs[command.index] = command.value;
			} else {
				if (!source) throw new Error('Item not found in the current spec.');
				source.node[source.kind === 'action' ? 'label' : source.kind === 'group' ? 'heading' : 'title'] = command.value;
			}
		} else if (command.kind === 'collector' && command.op === 'remove') next.frame.moreActions = false;
		else if (command.kind === 'separator' && command.op === 'remove') {
			next.frame.hiddenBreadcrumbSeparators = [...new Set([...(next.frame.hiddenBreadcrumbSeparators || []), command.index])];
		} else if (command.kind === 'breadcrumb') {
			const list = next.frame.breadcrumbs || [];
			if (command.index < 0 || command.index >= list.length) throw new Error('Breadcrumb not found.');
			if (command.op === 'remove') list.splice(command.index, 1);
			else if (command.op === 'duplicate') list.splice(command.index + 1, 0, list[command.index]);
			else if (command.op === 'move') {
				if (command.targetIndex < 0 || command.targetIndex >= list.length) throw new Error('Breadcrumb target not found.');
				const [item] = list.splice(command.index, 1);
				list.splice(command.targetIndex, 0, item);
			}
			delete next.frame.hiddenBreadcrumbSeparators;
		} else {
			if (!source) throw new Error('Item not found in the current spec.');
			const index = source.list.indexOf(source.node);
			if (command.op === 'remove') { source.list.splice(index, 1); selectedId = null; }
			else if (command.op === 'duplicate') {
				const copy = clone(source.node);
				copy._shellId = newId();
				(copy.items || []).forEach(item => { item._shellId = newId(); });
				source.list.splice(index + 1, 0, copy);
				selectedId = copy._shellId;
			} else if (command.op === 'move') {
				const target = records.find(entry => entry.node._shellId === command.targetId);
				if (!target || target.kind !== source.kind || target === source) throw new Error('Select another item of the same kind.');
				source.list.splice(index, 1);
				target.list.splice(target.list.indexOf(target.node) + (command.after ? 1 : 0), 0, source.node);
			} else throw new Error('Unknown shell edit.');
		}
		return { spec: next, selectedId };
	}
	root.SoftadminShellEditor = { entries, prepare, apply };
}(typeof window === 'undefined' ? globalThis : window));
