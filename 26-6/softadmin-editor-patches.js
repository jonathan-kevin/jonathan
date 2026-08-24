(function () {
	function segment(value, fallback = 'item') {
		const normalized = String(value || '')
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		return normalized || fallback;
	}

	function compactText(element) {
		return String(element?.textContent || '').trim().replace(/\s+/g, ' ');
	}

	function fieldIdentity(element) {
		const field = element.closest('.saFieldAndLabelWrapper, .saSiblingRow');
		if (!field) {
			return null;
		}

		const label = compactText(field.querySelector(':scope > .saLabelCell .saLabel, :scope > .saLabelCell'));
		return `newedit/field/${segment(field.dataset.softadminNodeId || label)}`;
	}

	function sidebarIdentity(element) {
		const item = element.closest('.saSideBarBody .saItemList > li');
		const group = element.closest('.saSideBarGroup');
		if (!group) {
			return null;
		}

		const groupName = compactText(group.querySelector(':scope > h3, .saButtonFavorites span'));
		if (item) {
			return `sidebar/group/${segment(groupName)}/item/${segment(compactText(item.querySelector('.saItemInner > span')))}`;
		}

		return `sidebar/group/${segment(groupName)}`;
	}

	function gridIdentity(element) {
		const heading = element.closest('.saGridHeading');
		if (heading) {
			return `grid/column/${segment(compactText(heading))}`;
		}

		const cell = element.closest('td');
		const row = cell?.closest('tr');
		if (!cell || !row) {
			return null;
		}

		const cells = Array.from(row.children);
		const columnIndex = cells.indexOf(cell);
		const table = row.closest('table');
		const columnName = compactText(table?.querySelectorAll('th')[columnIndex]);
		const rowName = Array.from(row.querySelectorAll('td'))
			.map(tableCell => compactText(tableCell.querySelector('.saGridText, .saLinkText') || tableCell))
			.find(Boolean);
		return `grid/row/${segment(row.dataset.softadminNodeId || rowName)}/column/${segment(columnName, String(columnIndex))}`;
	}

	function infoBoxIdentity(element) {
		const box = element.closest('.saInfoBox');
		if (!box) {
			return null;
		}

		const boxName = compactText(box.querySelector('.saInfoBoxHeaderWrapper h3'));
		const column = element.closest('.saInfoBoxCol');
		const fieldName = compactText(column?.querySelector('.saInfoBoxLabel'));
		return fieldName
			? `infobox/${segment(boxName)}/field/${segment(fieldName)}`
			: `infobox/${segment(boxName)}`;
	}

	function basePath(element) {
		const explicit = element.closest('[data-softadmin-edit-path]')?.dataset.softadminEditPath;
		if (explicit) {
			return explicit;
		}

		if (element.matches('#pageheader .saHeaderText')) {
			return 'frame/title';
		}

		if (element.closest('#pageheader .saActionLinks')) {
			return `frame/action/${segment(compactText(element.closest('.saTopLink')))}`;
		}

		if (element.closest('#pageheader .saBreadcrumbs')) {
			return `frame/breadcrumb/${segment(compactText(element))}`;
		}

		if (element.matches('.saAccountName')) {
			return 'sidebar/account/name';
		}

		return sidebarIdentity(element)
			|| fieldIdentity(element)
			|| gridIdentity(element)
			|| infoBoxIdentity(element)
			|| (element.closest('.saTab') ? `detail/tab/${segment(compactText(element.closest('.saTab')))}` : null)
			|| `main/${segment(element.tagName)}/${segment(compactText(element))}`;
	}

	function roleForText(element) {
		if (element.matches('.saLabel span, .saLabel, .saLabelCell')) return 'label';
		if (element.matches('.saGridHeadingLabel')) return 'heading';
		if (element.matches('.saInfoBoxLabel')) return 'label';
		if (element.matches('.saInfoBoxTextContent')) return 'value';
		if (element.matches('.saButtonText')) return 'label';
		if (element.matches('.saTabText')) return 'label';
		if (/^H[1-6]$/.test(element.tagName)) return 'heading';
		return 'text';
	}

	function uniquePath(element, path, selector, pathForPeer) {
		const root = element.closest('[data-softadmin-component-root], .saSideBarOuter, #pageheader') || document;
		const peers = Array.from(root.querySelectorAll(selector)).filter(peer => pathForPeer(peer) === path);
		const index = peers.indexOf(element);
		return peers.length > 1 ? `${path}/${Math.max(index, 0) + 1}` : path;
	}

	function textPath(element, selector) {
		if (element.dataset.softadminEditKey) {
			return element.dataset.softadminEditKey;
		}

		const path = uniquePath(
			element,
			`${basePath(element)}/${roleForText(element)}`,
			selector,
			peer => `${basePath(peer)}/${roleForText(peer)}`
		);
		element.dataset.softadminEditKey = path;
		return path;
	}

	function controlPath(control, selector) {
		if (control.dataset.softadminValueEditKey) {
			return control.dataset.softadminValueEditKey;
		}

		const type = control.matches('select') ? 'select' : control.type || control.tagName.toLowerCase();
		const path = uniquePath(
			control,
			`${basePath(control)}/value/${segment(type)}`,
			selector,
			peer => {
				const peerType = peer.matches('select') ? 'select' : peer.type || peer.tagName.toLowerCase();
				return `${basePath(peer)}/value/${segment(peerType)}`;
			}
		);
		control.dataset.softadminValueEditKey = path;
		return path;
	}

	function createStore() {
		const patches = new Map();
		let unresolved = [];

		return {
			clear() {
				patches.clear();
				unresolved = [];
			},
			entries() {
				return patches.entries();
			},
			get(path) {
				return patches.get(path);
			},
			keys() {
				return patches.keys();
			},
			restore(entries) {
				patches.clear();
				(entries || []).forEach(([path, patch]) => patches.set(path, patch));
				unresolved = [];
			},
			set(path, patch) {
				patches.set(path, { ...patch, path });
			},
			setResolvedPaths(paths) {
				unresolved = Array.from(patches.keys()).filter(path => !paths.has(path));
				return unresolved;
			},
			snapshot() {
				return Array.from(patches.entries());
			},
			unresolved() {
				return [...unresolved];
			}
		};
	}

	const target = typeof window !== 'undefined' ? window : globalThis;
	target.SoftadminEditorPatches = { createStore, segment, textPath, controlPath };
}());
