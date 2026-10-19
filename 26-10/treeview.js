/* TreeviewX demo: tree navigation and check state, display options, moves, and simulated uploads. */
'use strict';

$(function () {
	const $views = $('.saTreeXView');
	const $legacy = $('#legacyProjectTree');
	let itemMenu = null;
	const trees = [];
	let itemId = 0;
	let acceptsFiles = true;
	const announce = (message) => $('#saTreeXMoveStatus').text(message);

	class Tree {
		constructor($node) {
			this.$domNode = $node;
			this.treeitems = [];
			this.typeahead = '';
			this.firstTreeitem = null;
			this.lastTreeitem = null;

			this.checkedItems = new Set();
			this.anchorItem = null;
		}

		init() {
			this.refreshStructure();
			this.setFocusToItem(this.firstTreeitem, false);
		}

		refreshStructure() {
			const known = new Map(this.treeitems.map((ti) => [ti.$domNode[0], ti]));
			this.treeitems = [];
			this.typeahead = '';
			this.lastTreeitem = null;
			const findTreeitems = ($node, group) => {
				$node.children('li').each((_, li) => {
					const $li = $(li);
					const ti = known.get(li) || new Treeitem($li, this, group);
					if (!known.has(li)) ti.init();
					ti.groupTreeitem = group;
					ti.children = [];
					if (group) group.children.push(ti);
					ti.isExpandable =
						$li.children('ul').length > 0 ||
						$li.children('.saTreeXRow').find('.saTreeviewXFolder').length > 0;
					$li.data('treeitem', ti);

					this.treeitems.push(ti);
					const siblings = $node.children('li[role="treeitem"]');
					$li.attr({
						'aria-level': group ? Number(group.$domNode.attr('aria-level')) + 1 : 1,
						'aria-posinset': siblings.index(li) + 1,
						'aria-setsize': siblings.length,
					});

					if (ti.isExpandable && !$li.is('[aria-expanded]')) $li.attr('aria-expanded', 'false');
					if (!ti.isExpandable) $li.removeAttr('aria-expanded');

					const $childUl = $li.children('ul');
					if ($childUl.length) {
						$childUl.attr('role', 'group');
						findTreeitems($childUl, ti);
					}
				});
			};

			if (!this.$domNode.attr('role')) this.$domNode.attr('role', 'tree');

			findTreeitems(this.$domNode, false);
			this.checkedItems = new Set([...this.checkedItems].filter((item) => this.treeitems.includes(item)));
			this.updateVisibleTreeitems();
			this.updateFileCount();
			renderLegacyTree(this);
		}

		moveItem(item, target, position) {
			if (
				!item ||
				!item.groupTreeitem ||
				!['before', 'after', 'inside'].includes(position) ||
				!target ||
				item === target ||
				item.tree !== target.tree ||
				item.$domNode[0].contains(target.$domNode[0])
			)
				return false;
			if (position === 'inside' && !target.isExpandable) return false;
			if (position !== 'inside' && !target.groupTreeitem) return false;
			const $oldGroup = item.$domNode.parent();
			const oldParent = item.groupTreeitem;
			if (position === 'inside') {
				let $group = target.$domNode.children('ul[role="group"]');
				if (!$group.length) $group = $('<ul role="group"></ul>').appendTo(target.$domNode);
				$group.append(item.$domNode);
				target.$domNode.attr('aria-expanded', 'true');
			} else if (position === 'before') {
				item.$domNode.insertBefore(target.$domNode);
			} else {
				item.$domNode.insertAfter(target.$domNode);
			}
			if (oldParent && !$oldGroup.children('li').length) {
				$oldGroup.remove();
				if (oldParent.$domNode.children('.saTreeXRow').find('.saTreeviewXFolder').length) {
					oldParent.$domNode.attr('aria-expanded', 'false');
				} else {
					oldParent.$domNode.removeAttr('aria-expanded');
				}
				this.checkedItems.delete(oldParent);
				if (!this.$domNode.hasClass('saNotCheckable')) oldParent.$domNode.attr('aria-checked', 'false');
			}
			this.refreshStructure();
			if (!this.$domNode.hasClass('saNotCheckable')) {
				[...this.treeitems].reverse().forEach((ti) => this._updateParents(ti));
			}
			this.updateCheckedAdjacency();
			this.setFocusToItem(item);
			announce(`${item.label} moved ${position === 'inside' ? 'into' : position} ${target.label}.`);
			return true;
		}

		removeItem(item) {
			if (!item?.groupTreeitem) return;
			const following = this.visibleItems
				.slice(this.visibleItems.indexOf(item) + 1)
				.find((candidate) => !item.$domNode[0].contains(candidate.$domNode[0]));
			const previous = this.visibleItems[this.visibleItems.indexOf(item) - 1];
			const parent = item.groupTreeitem;
			const $group = item.$domNode.parent();
			item.$domNode.remove();
			if (parent && !$group.children('li').length) {
				$group.remove();
				parent.$domNode.attr('aria-expanded', 'false');
			}
			this.currentItem = null;
			this.refreshStructure();
			if (this.anchorItem && !this.treeitems.includes(this.anchorItem)) this.anchorItem = null;
			if (!this.$domNode.hasClass('saNotCheckable'))
				[...this.treeitems].reverse().forEach((ti) => this._updateParents(ti));
			this.updateCheckedAdjacency();
			const next = following || previous || parent || this.firstTreeitem;
			if (next?.isVisible) this.setFocusToItem(next);
			else if (this.firstTreeitem) this.setFocusToItem(this.firstTreeitem);
			else this.$domNode.attr('tabindex', 0)[0].focus();
			announce(`${item.label} removed.`);
		}

		setCheckable(enabled) {
			this.$domNode.toggleClass('saNotCheckable', !enabled);
			this.checkedItems.clear();
			this.anchorItem = null;
			const $items = this.$domNode.find('li[role="treeitem"]');
			$items.removeClass('saPrev saNext').removeAttr('aria-checked');
			if (enabled) $items.attr('aria-checked', 'false');
			syncLegacyCheckboxes(this);
		}

		// ---------- Checked logic ----------
		setCheckedToItem(ti, { shift = false } = {}) {
			if (this.$domNode.hasClass('saNotCheckable')) return;
			// SHIFT → range
			if (shift && this.anchorItem) {
				const start = this.treeitems.indexOf(this.anchorItem);
				const end = this.treeitems.indexOf(ti);
				const [from, to] = start < end ? [start, end] : [end, start];

				for (let i = from; i <= to; i++) {
					const item = this.treeitems[i];
					if (item.isVisible) {
						this._setCheckedRecursive(item, true);
						this._updateParents(item);
					}
				}
				this.updateCheckedAdjacency();
				return;
			}

			// Toggle
			const isChecked = this.checkedItems.has(ti);
			this._setCheckedRecursive(ti, !isChecked);
			this._updateParents(ti);

			this.anchorItem = ti;
			this.updateCheckedAdjacency();
		}

		updateCheckedAdjacency() {
			const visible = this.treeitems.filter((ti) => ti.isVisible);

			// reset
			this.treeitems.forEach((ti) => {
				ti.$domNode.removeClass('saPrev saNext');
			});

			for (let i = 0; i < visible.length; i++) {
				const current = visible[i];
				const next = visible[i + 1];

				if (!next) continue;

				const currentChecked = this.checkedItems.has(current);
				const nextChecked = this.checkedItems.has(next);

				if (currentChecked && nextChecked) {
					current.$domNode.addClass('saNext');
					next.$domNode.addClass('saPrev');
				}
			}
			syncLegacyCheckboxes(this);
		}

		_setCheckedRecursive(ti, checked) {
			if (checked) {
				this.checkedItems.add(ti);
				ti.$domNode.attr('aria-checked', 'true');
			} else {
				this.checkedItems.delete(ti);
				ti.$domNode.attr('aria-checked', 'false');
			}

			// children
			ti.children.forEach((child) => {
				this._setCheckedRecursive(child, checked);
			});
		}

		_updateParents(ti) {
			let parent = ti.groupTreeitem;

			while (parent) {
				const children = parent.children;

				const checkedCount = children.filter((child) => this.checkedItems.has(child)).length;

				let state;

				if (checkedCount === 0 && !children.some((child) => child.$domNode.attr('aria-checked') === 'mixed')) {
					state = 'false';
					this.checkedItems.delete(parent);
				} else if (checkedCount === children.length) {
					state = 'true';
					this.checkedItems.add(parent);
				} else {
					state = 'mixed';
					this.checkedItems.delete(parent);
				}

				parent.$domNode.attr('aria-checked', state);
				parent = parent.groupTreeitem;
			}
		}

		// ---------- Focus ----------
		setFocusToItem(ti, focus = true) {
			if (!ti || !ti.isVisible) return;
			this.currentItem = ti;
			this.treeitems.forEach((item) => {
				item.$domNode.attr('tabindex', item === ti ? 0 : -1);
				item.$row.find('.saTreeXButton').attr('tabindex', item === ti ? 0 : -1);
			});
			if (focus) ti.$domNode[0].focus({ preventScroll: true });
			if (focus) ti.$domNode[0].scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
		}

		setFocusToNextItem(currentItem) {
			this.setFocusToItem(this.visibleItems[this.visibleItems.indexOf(currentItem) + 1]);
		}

		setFocusToPreviousItem(currentItem) {
			this.setFocusToItem(this.visibleItems[this.visibleItems.indexOf(currentItem) - 1]);
		}

		// ---------- Expand / Collapse ----------
		toggleBranch(currentItem) {
			if (!currentItem.isExpandable || currentItem.openingTimer) return;
			const expanded = !currentItem.isExpanded();
			const visit = (item) => {
				if (!item.isExpandable) return;
				if (expanded) this.expandTreeitem(item, () => item.children.forEach(visit));
				else {
					this.collapseTreeitem(item);
					item.children.forEach(visit);
				}
			};
			announce(`${expanded ? 'Expanding' : 'Collapsed'} folders in ${currentItem.label}.`);
			visit(currentItem);
		}

		expandTreeitem(currentItem, afterOpening) {
			if (!currentItem.isExpandable || currentItem.openingTimer) return;
			const open = () => {
				if (!this.treeitems.includes(currentItem)) return;
				currentItem.$domNode.attr('aria-expanded', 'true');
				this.updateVisibleTreeitems();
				afterOpening?.();
			};
			const delay = Number(currentItem.$domNode.attr('data-expand-delay')) || 0;
			if (currentItem.isExpanded() || !delay) {
				open();
				return;
			}
			const $expander = currentItem.$row.children('.saTreeXExpander');
			const $arrow = $expander.children('.saIcon').detach();
			const $spinner = $(
				'<span class="saLoadingWrapper saLoadingExtraDark" aria-hidden="true"><span class="saLoadingSpinner"></span></span>',
			);
			const $legacySpinner = $('<i class="saIcon far fa-spinner fa-spin" aria-hidden="true"></i>');
			const $legacyContent = currentItem.$legacyNode?.children('.saNodeContent');
			const $legacyExpandIcon = $legacyContent?.children('.saExpandIconDiv');
			const $legacyExpander = $legacyExpandIcon?.children('input.saExpander');
			const iconVisibility = $legacyExpandIcon?.[0]?.style.visibility || '';
			const expanderVisibility = $legacyExpander?.[0]?.style.visibility || '';
			currentItem.$domNode.attr('aria-busy', 'true');
			$legacyContent?.attr('aria-busy', 'true');
			$legacyExpandIcon?.css('visibility', 'visible').append($legacySpinner.addClass('saExpandIcon'));
			$legacyExpander?.css('visibility', 'hidden');
			$expander.append($spinner);
			announce(`Loading ${currentItem.label}.`);
			currentItem.openingTimer = window.setTimeout(() => {
				currentItem.openingTimer = null;
				$spinner.remove();
				$expander.append($arrow);
				$legacySpinner.remove();
				$legacyExpandIcon?.css('visibility', iconVisibility);
				$legacyExpander?.css('visibility', expanderVisibility);
				currentItem.$domNode.removeAttr('aria-busy');
				$legacyContent?.removeAttr('aria-busy');
				open();
				if (this.treeitems.includes(currentItem)) announce(`${currentItem.label} opened.`);
			}, delay);
		}

		collapseTreeitem(currentItem) {
			if (!currentItem.isExpandable || !currentItem.isExpanded()) return;
			currentItem.$domNode.attr('aria-expanded', 'false');
			this.updateVisibleTreeitems();
			if (this.$domNode[0].contains(document.activeElement)) this.setFocusToItem(currentItem);
		}

		// ---------- Visibility ----------
		updateVisibleTreeitems() {
			const hadFocus = this.$domNode[0].contains(document.activeElement);
			this.treeitems.forEach((ti) => {
				ti.isVisible = !ti.$domNode.parentsUntil(this.$domNode, 'li[aria-expanded="false"]').length;
				ti.$domNode.children('ul[role="group"]').prop('inert', !ti.isExpanded());
			});
			this.visibleItems = this.treeitems.filter((ti) => ti.isVisible);
			this.firstTreeitem = this.visibleItems[0];
			this.lastTreeitem = this.visibleItems.at(-1);
			if (!this.firstTreeitem) {
				this.currentItem = null;
				this.treeitems.forEach((item) => {
					item.$domNode.attr('tabindex', -1);
					item.$row.find('.saTreeXButton').attr('tabindex', -1);
				});
				this.$domNode.attr('tabindex', 0);
				if (hadFocus) this.$domNode[0].focus();
			} else if (this.currentItem && !this.currentItem.isVisible) {
				let parent = this.currentItem.groupTreeitem;
				while (parent && !parent.isVisible) parent = parent.groupTreeitem;
				this.setFocusToItem(parent || this.firstTreeitem, hadFocus);
			} else if (!this.currentItem) {
				this.setFocusToItem(this.firstTreeitem, hadFocus);
			}
			if (this.firstTreeitem) this.$domNode.removeAttr('tabindex');
			this.updateCheckedAdjacency();
			syncLegacyExpansion(this);
		}

		updateFileCount() {
			const count = this.treeitems.filter((item) => !item.isExpandable).length;
			this.$domNode
				.find('.saBadgeCount:not(.saUrgent)')
				.first()
				.empty()
				.append(document.createTextNode(String(count)), $('<span class="saScreenReaderOnly"> files</span>'))
				.attr('title', `${count} files`);
		}

		setFocusByFirstCharacter(currentItem, char) {
			const now = Date.now();
			this.typeahead = now - (this.lastTypedAt || 0) > 600 ? char : this.typeahead + char;
			this.lastTypedAt = now;
			const prefix = /^(.)\1+$/.test(this.typeahead) ? char : this.typeahead;
			const start = this.visibleItems.indexOf(currentItem);
			const ordered = [...this.visibleItems.slice(start + 1), ...this.visibleItems.slice(0, start + 1)];
			const match = ordered.find((item) => item.label.toLowerCase().startsWith(prefix.toLowerCase()));
			if (match) this.setFocusToItem(match);
		}
	}

	class Treeitem {
		constructor($node, treeObj, group) {
			this.$domNode = $node;
			this.tree = treeObj;
			this.groupTreeitem = group;

			this.$row = $node.children('.saTreeXRow');
			this.$label = this.$row.find('.saTreeXLabel').first();
			this.label = this.$label.clone().children().remove().end().text().trim();
			this.typeIconClasses = this.$row.find('.saTreeXType').first().attr('class');

			this.isExpandable = $node.children('ul').length > 0;
			this.isVisible = false;
		}

		init() {
			const id = `tree-item-${++itemId}`;
			this.$label.attr('id', id);
			this.$domNode.attr({
				role: 'treeitem',
				tabindex: -1,
				'aria-labelledby': id,
				'aria-keyshortcuts': 'Alt+ArrowUp Alt+ArrowDown Shift+F10',
			});
			const $description = this.$row.find('.saFileSizeRow');
			if ($description.length) {
				$description.attr('id', `${id}-metadata`);
				this.$row.find('.saFileSize').attr('id', `${id}-size`);
				this.updateMetadataDescription();
			}
			this.$row.find('.saTreeXButtonGroup').attr('role', 'presentation').children('li').attr('role', 'none');
			this.$row.find('.saTreeXButton').attr('tabindex', -1);
			this.$row
				.find('.saTreeXButton')
				.has('.fa-ellipsis-vertical')
				.attr({ 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': 'saTreeXContextMenu' });
			this.$row.find('.saTreeXExpander').attr({ 'aria-hidden': 'true', tabindex: -1 });
			this.$row.attr('draggable', 'true');
			this.$row
				.find('.fa-grip-dots-vertical')
				.attr({ draggable: 'true', title: 'Drag to move; Alt+Up/Down or the actions menu reorders siblings' });
			if (!this.tree.$domNode.hasClass('saNotCheckable')) this.$domNode.attr('aria-checked', 'false');
			this.$domNode.on('keydown', (e) => this.handleKeydown(e));
			this.$domNode.on('click', (e) => this.handleClick(e));
			this.$domNode.on('focusin', (e) => {
				if ($(e.target).closest('li[role="treeitem"]')[0] === this.$domNode[0])
					this.tree.setFocusToItem(this, false);
			});
		}

		isExpanded() {
			return this.$domNode.attr('aria-expanded') === 'true';
		}

		updateMetadataDescription() {
			const sizeId = this.tree.$domNode.hasClass('saNoFileSizes')
				? null
				: this.$row.find('.saFileSize').attr('id');
			if (sizeId) this.$domNode.attr('aria-describedby', sizeId);
			else this.$domNode.removeAttr('aria-describedby');
			updateLegacyMetadata(this);
		}

		handleKeydown(e) {
			// Native buttons and links retain their own keyboard behavior.
			if (e.target !== this.$domNode[0] || e.ctrlKey || e.metaKey) return;
			if (e.shiftKey && e.key === 'F10') {
				openItemMenu(this);
			} else if (e.altKey && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
				const before = e.key === 'ArrowUp';
				const $neighbor = before ? this.$domNode.prev('li') : this.$domNode.next('li');
				this.tree.moveItem(this, $neighbor.data('treeitem'), before ? 'before' : 'after');
			} else if (e.altKey) {
				return;
			} else {
				switch (e.key) {
					case 'Enter':
						if (this.isExpandable)
							this.isExpanded() ? this.tree.collapseTreeitem(this) : this.tree.expandTreeitem(this);
						else showDetails(this);
						break;
					case ' ':
						if (this.tree.$domNode.hasClass('saNotCheckable')) return;
						this.tree.setCheckedToItem(this, { shift: e.shiftKey });
						break;
					case 'ArrowUp':
						this.tree.setFocusToPreviousItem(this);
						break;
					case 'ArrowDown':
						this.tree.setFocusToNextItem(this);
						break;
					case 'ArrowRight':
						if (this.isExpandable) {
							if (!this.isExpanded()) this.tree.expandTreeitem(this);
							else {
								const child = this.tree.treeitems.find((item) => item.groupTreeitem === this);
								if (child) this.tree.setFocusToItem(child);
							}
						}
						break;
					case 'ArrowLeft':
						if (this.isExpandable && this.isExpanded()) this.tree.collapseTreeitem(this);
						else this.tree.setFocusToItem(this.groupTreeitem);
						break;
					case 'Home':
						this.tree.setFocusToItem(this.tree.firstTreeitem);
						break;
					case 'End':
						this.tree.setFocusToItem(this.tree.lastTreeitem);
						break;
					case '*':
						this.tree.treeitems
							.filter((item) => item.groupTreeitem === this.groupTreeitem && item.isExpandable)
							.forEach((item) => this.tree.expandTreeitem(item));
						break;
					default:
						if (e.key.length !== 1 || !/\S/.test(e.key)) return;
						this.tree.setFocusByFirstCharacter(this, e.key);
				}
			}
			e.stopPropagation();
			e.preventDefault();
		}

		handleClick(e) {
			if ($(e.target).closest('li[role="treeitem"]')[0] !== this.$domNode[0]) return;
			const $target = $(e.target);

			// --- EXPANDER CLICK ---
			const $expander = $target.closest('.saTreeXExpander');
			if ($expander.length) {
				e.stopPropagation();

				if (this.isExpandable) {
					if (e.altKey) this.tree.toggleBranch(this);
					else this.isExpanded() ? this.tree.collapseTreeitem(this) : this.tree.expandTreeitem(this);
				}

				this.tree.setFocusToItem(this);
				return;
			}

			// Ignore links/buttons
			if ($target.closest('button, a, .fa-grip-dots-vertical').length) return;

			// --- ROW CLICK = CHECK ---
			e.stopPropagation();

			this.tree.setFocusToItem(this);

			this.tree.setCheckedToItem(this, {
				shift: e.shiftKey,
			});
		}
	}

	// One source of truth for both desktop and mobile display controls.
	function setupOptions() {
		const options = [
			[
				'.grip',
				(enabled) => $views.find('.fa-grip-dots-vertical').add($legacy.find('.saDragHandle')).toggle(enabled),
			],
			[
				'.button',
				(enabled) => {
					$views.find('.saTreeXButtonGroup').toggle(enabled);
					$legacy.find('.saTreeViewButton').toggle(enabled);
				},
			],
			[
				'.lines',
				(enabled) => {
					$views.toggleClass('saNoLines', !enabled);
					$legacy.toggleClass('saNoLines', !enabled);
				},
			],
			[
				'.treeIcons',
				(enabled) => {
					$views.toggleClass('saNoIcons', !enabled);
					trees.forEach((tree) => tree.treeitems.forEach(updateFileAppearance));
				},
			],
			['.checkboxes', (enabled) => trees.forEach((tree) => tree.setCheckable(enabled))],
			[
				'.fileSizes',
				(enabled) => {
					$views.toggleClass('saNoFileSizes', !enabled);
					trees.forEach((tree) => tree.treeitems.forEach((item) => item.updateMetadataDescription()));
				},
			],
			[
				'.acceptFiles',
				(enabled) => {
					acceptsFiles = enabled;
					$('.saFileDropDescription').toggle(enabled);
					$views.toggleClass('saNoFileDrop', !enabled);
					clearFileDrag();
				},
			],
		];
		options.forEach(([selector, apply]) => {
			const $buttons = $(selector);
			const set = (enabled) => {
				$buttons.attr('aria-pressed', String(enabled));
				apply(enabled);
			};
			set($buttons.first().attr('aria-pressed') === 'true');
			$buttons.on('click', function () {
				set($(this).attr('aria-pressed') !== 'true');
			});
		});
		const $radiusSelects = $('.saTreeLineRadius');
		const setRadius = (radius) => {
			if (!['0.25rem', '0.5rem', '0.625rem', '0.75rem'].includes(radius)) return;
			$radiusSelects.val(radius);
			$views.css('--tree-line-radius', radius);
		};
		setRadius($radiusSelects.first().val());
		$radiusSelects.on('change', function () {
			setRadius(this.value);
		});
	}

	function updateFileAppearance(item) {
		if (item.isExpandable || item.$row.find('.saTreeviewXFolder').length) return;
		const useGenericIcon = item.tree.$domNode.hasClass('saNoIcons');
		item.$row
			.find('.saTreeXType')
			.first()
			.attr('class', useGenericIcon ? 'saTreeXType saIcon far fa-page' : item.typeIconClasses);
		const name = useGenericIcon ? item.label.replace(/^(.+)\.[^.]+$/, '$1') : item.label;
		const nameText = item.$label.contents().filter((_, node) => node.nodeType === Node.TEXT_NODE)[0];
		if (nameText) nameText.nodeValue = name + (nameText.nodeValue.match(/\s*$/)?.[0] || '');
		if (item.legacyNameText)
			item.legacyNameText.nodeValue = name + (item.legacyNameText.nodeValue.match(/\s*$/)?.[0] || '');
	}

	function itemPath(item) {
		const parts = [];
		for (let current = item; current; current = current.groupTreeitem) parts.unshift(current.label);
		return parts.join(' / ');
	}

	function showDetails(item) {
		const size = item.$row.find('.saFileSize').text();
		announce(`${itemPath(item)}. ${item.isExpandable ? 'Folder.' : size || 'File.'}`);
	}

	// Render the original markup from the same Treeitems instead of maintaining a second dataset.
	function renderLegacyTree(tree) {
		if (!$legacy.length) return;
		function render(item) {
			if (item.$legacyNode) {
				const $node = item.$legacyNode;
				let $group = $node.children('ul');
				$group.children().detach();
				if (item.children.length) {
					if (!$group.length) $group = $('<ul></ul>').appendTo($node);
					item.children.forEach((child) => $group.append(render(child)));
					$group.prop('hidden', !item.isExpanded());
				} else $group.remove();
				const $count = item.$label.find('.saBadgeCount:not(.saUrgent)');
				if ($count.length)
					$node
						.children('.saNodeContent')
						.find('.saBadgeCount:not(.saUrgent)')
						.empty()
						.append($count.contents().clone());
				return $node;
			}
			const $node = $('<li class="saNode"></li>').data('treeitem', item);
			const $content = $('<label class="saNodeContent" draggable="true"></label>').toggleClass(
				'saNodeExpand',
				item.isExpandable,
			);
			const $expander = $('<input class="saExpander saMinus" type="checkbox">')
				.prop('disabled', !item.isExpandable)
				.prop('checked', item.isExpanded())
				.attr('aria-label', `Expand or collapse ${item.label}`);
			if (item.isExpandable) $expander.attr('aria-expanded', String(item.isExpanded()));
			$content.append($('<div class="saExpandIconDiv"></div>').append($expander));
			$content.append($('<input type="checkbox" class="saCheckbox">').attr('aria-label', `Select ${item.label}`));
			if (item.$row.find('.fa-grip-dots-vertical').length)
				$content.append(
					$(
						'<div class="saDragHandle far fa-grip-dots-vertical" data-sa-isdraghandle="1" draggable="true" aria-hidden="true"></div>',
					),
				);
			$content.append(
				$(
					'<button class="saTreeViewButton" type="button"><i class="far fa-list-tree icon saIcon" aria-hidden="true"></i></button>',
				)
					.attr('aria-label', `Details for ${item.label}`)
					.data('treeitem', item),
				$(
					'<button class="saTreeViewButton saTreeViewNavigatorJs" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="saTreeXContextMenu"><i class="icon saIcon far fa-ellipsis" aria-hidden="true"></i></button>',
				)
					.attr({ 'aria-label': `Actions for ${item.label}`, 'data-sa-navbtn': item.$label.attr('id') })
					.data('treeitem', item),
			);
			const $text = item.$label.clone().removeAttr('id').removeClass('saTreeXLabel');
			$text.find('.saMenuItemPill').each(function () {
				const title = $(this).attr('title') || $(this).text().trim();
				$(this).replaceWith(document.createTextNode(`(${title})`));
			});
			if (item.groupTreeitem) {
				const $link = $('<a class="saNodeLinkJs" role="button" tabindex="0"></a>').append($text.contents());
				if (item.isExpandable) $link.attr('aria-expanded', String(item.isExpanded()));
				$text.append($link);
			} else {
				$text.wrapInner('<b></b>');
			}
			item.legacyNameText = $text
				.find('.saNodeLinkJs, b')
				.first()
				.contents()
				.filter((_, node) => node.nodeType === Node.TEXT_NODE)[0];
			if (item.$row.find('.saFileSize').length) {
				item.legacySizeText = document.createTextNode('');
				$text.find('.saNodeLinkJs, b').first().append(item.legacySizeText);
			}
			$content.append($text);
			$node.append($content);
			if (item.children.length) {
				const $group = $('<ul></ul>').prop('hidden', !item.isExpanded());
				item.children.forEach((child) => $group.append(render(child)));
				$node.append($group);
			}
			item.$legacyNode = $node;
			return $node;
		}
		$legacy.children().detach();
		tree.treeitems.filter((item) => !item.groupTreeitem).forEach((item) => $legacy.append(render(item)));
		$legacy.find('.saTreeViewButton').toggle($('.button').first().attr('aria-pressed') === 'true');
		$legacy.find('.saDragHandle').toggle($('.grip').first().attr('aria-pressed') === 'true');
		syncLegacyCheckboxes(tree);
		tree.treeitems.forEach(updateLegacyMetadata);
		tree.treeitems.forEach(updateFileAppearance);
	}

	function updateLegacyMetadata(item) {
		if (!item.legacySizeText) return;
		const size = item.tree.$domNode.hasClass('saNoFileSizes') ? '' : item.$row.find('.saFileSize').text();
		item.legacySizeText.nodeValue = size ? `, ${size}` : '';
	}

	function syncLegacyCheckboxes(tree) {
		const enabled = !tree.$domNode.hasClass('saNotCheckable');
		tree.treeitems.forEach((item) => {
			if (!item.$legacyNode) return;
			const state = item.$domNode.attr('aria-checked');
			item.$legacyNode
				.children('.saNodeContent')
				.children('input.saCheckbox')
				.toggle(enabled)
				.attr('indeterminate', state === 'mixed' ? '' : null)
				.prop({ disabled: !enabled, checked: state === 'true', indeterminate: state === 'mixed' });
		});
	}

	function syncLegacyExpansion(tree) {
		tree.treeitems.forEach((item) => {
			const $node = item.$legacyNode;
			if (!$node) return;
			const expanded = item.isExpanded();
			$node.children('ul').prop('hidden', !expanded);
			$node.children('.saNodeContent').find('input.saExpander').prop('checked', expanded);
			if (item.isExpandable)
				$node
					.find('> .saNodeContent input.saExpander, > .saNodeContent .saNodeLinkJs')
					.attr('aria-expanded', String(expanded));
		});
	}

	function setupLegacyTree() {
		$legacy.on('click', 'input.saCheckbox', function (event) {
			event.stopPropagation();
			const item = $(this).closest('.saNode').data('treeitem');
			item.tree.setCheckedToItem(item, { shift: event.shiftKey });
		});
		$legacy.on('click', '.saDragHandle', function (event) {
			event.preventDefault();
			event.stopPropagation();
		});
		$legacy.on('click', 'input.saExpander', function (event) {
			$(this).data('recursiveToggle', event.altKey);
		});
		$legacy.on('change', 'input.saExpander', function () {
			const item = $(this).closest('.saNode').data('treeitem');
			if ($(this).data('recursiveToggle')) item.tree.toggleBranch(item);
			else this.checked ? item.tree.expandTreeitem(item) : item.tree.collapseTreeitem(item);
			if (item.openingTimer) $(this).prop('checked', item.isExpanded());
			$(this).removeData('recursiveToggle');
		});
		$legacy.on('click', '.saNodeLinkJs', function (event) {
			event.preventDefault();
			const item = $(this).closest('.saNode').data('treeitem');
			if (item.isExpandable) {
				item.isExpanded() ? item.tree.collapseTreeitem(item) : item.tree.expandTreeitem(item);
			} else showDetails(item);
		});
		$legacy.on('keydown', '.saNodeLinkJs', function (event) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				this.click();
			}
		});
		$legacy.on('click', '.saTreeViewButton', function () {
			const item = $(this).data('treeitem');
			if (!this.classList.contains('saTreeViewNavigatorJs')) showDetails(item);
			else openItemMenu(item, this);
		});
	}

	function openItemMenu(item, trigger = item.$row.find('.saTreeXButton').last()[0], focusLast = false) {
		itemMenu.open(item, trigger, focusLast);
	}

	function setupItemMenu() {
		const $menu = $('#saTreeXContextMenu');
		const $buttons = $menu.find('[role="menuitem"]');
		let currentItem = null;
		let currentTrigger = null;
		const available = () => $buttons.filter(':not(:disabled)');
		function close(restoreFocus = true) {
			if (!currentItem) return;
			const item = currentItem;
			const trigger = currentTrigger;
			$menu.removeClass('saOpen').prop('hidden', true);
			$(trigger).filter('button').attr('aria-expanded', 'false');
			currentItem = null;
			currentTrigger = null;
			if (restoreFocus) {
				if (trigger?.isConnected && !$(trigger).closest('.saTreeXButtonGroup').is('[style*="display: none"]'))
					trigger.focus();
				else item.tree.setFocusToItem(item);
			}
		}
		function open(item, trigger, focusLast) {
			close(false);
			currentItem = item;
			currentTrigger = trigger;
			$(trigger).filter('button').attr({ 'aria-expanded': 'true', 'aria-controls': 'saTreeXContextMenu' });
			$menu.attr('aria-label', `Actions for ${item.label}`).prop('hidden', false).addClass('saOpen');
			const disabled = {
				up:
					!item.groupTreeitem ||
					!item.$domNode.prev('li').length,
				down:
					!item.groupTreeitem ||
					!item.$domNode.next('li').length,
				remove: !item.groupTreeitem,
			};
			$buttons.each(function () {
				const isDisabled = !!disabled[this.dataset.treeAction];
				$(this)
					.prop('disabled', isDisabled)
					.attr('aria-disabled', String(isDisabled))
					.toggleClass('saInactive', isDisabled);
			});
			const anchor = trigger?.getClientRects().length ? trigger : item.$row[0];
			const bounds = anchor.getBoundingClientRect();
			const width = $menu[0].offsetWidth;
			const height = $menu[0].offsetHeight;
			const left = Math.max(8, Math.min(bounds.left, window.innerWidth - width - 8));
			const below = bounds.bottom + 4;
			const top = Math.max(8, below + height <= window.innerHeight - 8 ? below : bounds.top - height - 4);
			$menu.css({ left, top });
			const $enabled = available();
			$enabled.eq(focusLast ? -1 : 0)[0]?.focus();
		}
		$buttons.on('click', function () {
			const item = currentItem;
			const action = this.dataset.treeAction;
			close(false);
			if (action === 'remove') item.tree.removeItem(item);
			else {
				const $neighbor = action === 'up' ? item.$domNode.prev('li') : item.$domNode.next('li');
				item.tree.moveItem(item, $neighbor.data('treeitem'), action === 'up' ? 'before' : 'after');
			}
		});
		$menu.on('keydown', (event) => {
			const $enabled = available();
			const index = $enabled.index(document.activeElement);
			let next;
			switch (event.key) {
				case 'Escape':
					close();
					break;
				case 'Tab':
					close();
					return;
				case 'ArrowDown':
					next = (index + 1) % $enabled.length;
					break;
				case 'ArrowUp':
					next = (index + $enabled.length - 1) % $enabled.length;
					break;
				case 'Home':
					next = 0;
					break;
				case 'End':
					next = $enabled.length - 1;
					break;
				default:
					if (event.key.length !== 1 || event.ctrlKey || event.metaKey) return;
					next = $enabled
						.toArray()
						.findIndex(
							(button, i) =>
								i > index &&
								button.textContent.trim().toLowerCase().startsWith(event.key.toLowerCase()),
						);
					if (next === -1)
						next = $enabled
							.toArray()
							.findIndex((button) =>
								button.textContent.trim().toLowerCase().startsWith(event.key.toLowerCase()),
							);
					if (next === -1) return;
			}
			if (next !== undefined) $enabled.eq(next)[0]?.focus();
			event.preventDefault();
			event.stopPropagation();
		});
		$(document).on('pointerdown', (event) => {
			if (currentItem && !$menu[0].contains(event.target) && !currentTrigger?.contains(event.target))
				close(false);
		});
		$(document).on('focusin', (event) => {
			if (currentItem && !$menu[0].contains(event.target) && !currentTrigger?.contains(event.target))
				close(false);
		});
		$(window).on('resize', () => close());
		document.addEventListener(
			'scroll',
			(event) => {
				if (currentItem && !$menu[0].contains(event.target)) close();
			},
			true,
		);
		$views.on('click', '.saTreeXButton', function () {
			const item = $(this).closest('li[role="treeitem"]').data('treeitem');
			if (this.querySelector('.fa-circle-info')) showDetails(item);
			else openItemMenu(item, this);
		});
		$views.on('keydown', '.saTreeXButton', function (event) {
			if (this.querySelector('.fa-ellipsis-vertical') && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
				event.preventDefault();
				openItemMenu($(this).closest('li[role="treeitem"]').data('treeitem'), this, event.key === 'ArrowUp');
			}
		});
		$views.on('contextmenu', '.saTreeXRow', function (event) {
			event.preventDefault();
			openItemMenu($(this).parent('li').data('treeitem'));
		});
		return { open, close };
	}

	function setupNodeDragDrop() {
		const $nodeViews = $views.add($legacy);
		const rowSelector = '.saTreeXRow, .saNodeContent';
		const controlSelector = 'button, input, select, textarea, a[href], .saTreeXCheck, .saExpandIconDiv';
		let pressedControl = false;
		let draggedItem = null;
		let dropTarget = null;
		let dropPosition = null;
		let hoverTarget = null;
		let hoverTimer = null;
		const targetClasses = 'saTreeXDropBefore saTreeXDropAfter saTreeXDropInside';
		const indicators = { before: 'saTreeXDropBefore', after: 'saTreeXDropAfter', inside: 'saTreeXDropInside' };
		const $indicator = $('<span class="saTreeXDropIndicator" aria-hidden="true"></span>');
		function positionIndicator() {
			if (!dropTarget || dropPosition === 'inside') return;
			const nextSibling = dropTarget.$domNode.next('li').data('treeitem');
			const boundary = dropPosition === 'after' && nextSibling ? nextSibling : dropTarget;
			const position = boundary !== dropTarget ? 'before' : dropPosition;
			const descendants = boundary.tree.visibleItems.filter(
				(item) => item !== boundary && boundary.$domNode[0].contains(item.$domNode[0]),
			);
			const edgeItem = position === 'after' ? descendants.at(-1) || boundary : boundary;
			const wrapper = boundary.tree.$domNode.closest('.saTreeXViewWrapper')[0];
			if (!wrapper || !edgeItem.$domNode[0].isConnected) return;
			$indicator.appendTo(wrapper);
			const wrapperBounds = wrapper.getBoundingClientRect();
			const rowBounds = edgeItem.$row[0].getBoundingClientRect();
			const targetBounds = boundary.$row[0].getBoundingClientRect();
			const iconBounds = boundary.$row.find('.saTreeXTypeWrapper')[0].getBoundingClientRect();
			const originX = wrapperBounds.left + wrapper.clientLeft - wrapper.scrollLeft;
			const originY = wrapperBounds.top + wrapper.clientTop - wrapper.scrollTop;
			$indicator.css({
				left: `${iconBounds.left - originX}px`,
				top: `${(position === 'before' ? rowBounds.top : rowBounds.bottom) - originY}px`,
				width: `${Math.max(0, targetBounds.right - iconBounds.left - 8)}px`,
			});
		}

		function clearHover() {
			window.clearTimeout(hoverTimer);
			hoverTimer = null;
			hoverTarget = null;
		}
		function scheduleFolderOpening(target) {
			if (dropPosition !== 'inside' || target.isExpanded()) {
				clearHover();
				return;
			}
			if (hoverTarget === target) return;
			clearHover();
			hoverTarget = target;
			hoverTimer = window.setTimeout(() => {
				clearHover();
				if (
					draggedItem &&
					dropTarget === target &&
					dropPosition === 'inside' &&
					target.$domNode[0].isConnected
				) {
					target.tree.expandTreeitem(target);
					if (!target.openingTimer)
						announce(`${target.label} opened. You can drop the item into this folder or its subfolders.`);
				}
			}, 700);
		}
		function clearTarget(cancelHover = true) {
			if (cancelHover) clearHover();
			$indicator.detach();
			$views.find('li').removeClass(targetClasses);
			$legacy.find('.saDropOn').removeClass('saDropOn');
			dropTarget = null;
			dropPosition = null;
		}
		function finishDrag() {
			clearTarget();
			$views.find('.saTreeXDragging').removeClass('saTreeXDragging');
			$legacy.find('.saDragged').removeClass('saDragged');
			draggedItem = null;
			pressedControl = false;
		}
		$nodeViews.on('mousedown', rowSelector, function (event) {
			pressedControl = $(event.target).closest(controlSelector).length > 0;
		});
		$nodeViews.on('dragstart', rowSelector, function (event) {
			if (pressedControl || $(event.target).closest(controlSelector).length) {
				event.preventDefault();
				return;
			}
			draggedItem = $(this).parent('li').data('treeitem');
			if (!draggedItem?.groupTreeitem) {
				draggedItem = null;
				event.preventDefault();
				return;
			}
			const transfer = event.originalEvent.dataTransfer;
			transfer.effectAllowed = 'move';
			transfer.setData('text/plain', draggedItem.label);
			transfer.setDragImage?.(this, 12, 12);
			draggedItem.$domNode.addClass('saTreeXDragging');
			draggedItem.$legacyNode?.addClass('saDragged');
			event.stopPropagation();
		});
		$nodeViews.on('dragover', rowSelector, function (event) {
			if (!draggedItem) return;
			event.preventDefault();
			event.stopPropagation();
			const target = $(this).parent('li').data('treeitem');
			clearTarget(false);
			if (!target || target.tree !== draggedItem.tree || draggedItem.$domNode[0].contains(target.$domNode[0])) {
				clearHover();
				event.originalEvent.dataTransfer.dropEffect = 'none';
				return;
			}
			const bounds = this.getBoundingClientRect();
			const offset = (event.originalEvent.clientY - bounds.top) / Math.max(bounds.height, 1);
			dropPosition =
				target.isExpandable && offset >= 0.25 && offset <= 0.75 ? 'inside' : offset < 0.5 ? 'before' : 'after';
			if (!target.groupTreeitem && dropPosition !== 'inside') {
				clearHover();
				dropPosition = null;
				event.originalEvent.dataTransfer.dropEffect = 'none';
				return;
			}
			dropTarget = target;
			target.$domNode.addClass(indicators[dropPosition]);
			positionIndicator();
			target.$legacyNode?.addClass('saDropOn');
			scheduleFolderOpening(target);
			event.originalEvent.dataTransfer.dropEffect = 'move';
		});
		$nodeViews.on('dragleave', rowSelector, function (event) {
			if (
				draggedItem &&
				dropTarget === $(this).parent('li').data('treeitem') &&
				!this.contains(event.originalEvent.relatedTarget)
			)
				clearTarget();
		});
		$nodeViews.on('drop', rowSelector, function (event) {
			if (!draggedItem) return;
			event.preventDefault();
			event.stopPropagation();
			if (dropTarget && dropTarget === $(this).parent('li').data('treeitem'))
				draggedItem.tree.moveItem(draggedItem, dropTarget, dropPosition);
			finishDrag();
		});
		document.addEventListener('scroll', positionIndicator, true);
		window.addEventListener('resize', positionIndicator);
		$(document).on('dragend drop', finishDrag);
	}

	function isFileDrag(event) {
		const transfer = event.originalEvent.dataTransfer;
		return !!transfer && (Array.from(transfer.types || []).includes('Files') || transfer.files?.length > 0);
	}

	function clearFileDrag() {
		$views.removeClass('saFileDragging').find('.saFileDrop').removeClass('saFileDrop');
	}

	function fileIcon(name) {
		if (/^(dockerfile|containerfile)(?:\.|$)/i.test(name)) return 'box';
		if (/^\.env(?:\.|$)/i.test(name)) return 'gear';
		const extension = name.split('.').pop().toLowerCase();
		const types = [
			[/^(ai|eps)$/, 'bezier-curve'],
			[/^(fig|sketch|xd)$/, 'diamonds-4'],
			[/^(woff|woff2|ttf|otf)$/, 'font'],
			[/^(cer|crt|pem|pfx|p12)$/, 'file-certificate'],
			[/^(jpg|jpeg|png|gif|svg|webp|avif|tif|tiff|ico|psd)$/, 'image'],
			[/^(mp3|wav|flac|aac|m4a|ogg)$/, 'music'],
			[/^(mp4|webm|avi|mov)$/, 'video'],
			[/^(zip|rar|7z|tar|gz)$/, 'file-zipper'],
			[/^(doc|docx|odt|rtf)$/, 'file-word'],
			[/^(xls|xlsx|ods)$/, 'file-excel'],
			[/^csv$/, 'file-csv'],
			[/^tsv$/, 'table'],
			[/^(ppt|pptx|odp)$/, 'file-powerpoint'],
			[/^less$/, 'brackets-curly'],
			[/^css$/, 'hashtag'],
			[/^json$/, 'brackets-curly'],
			[/^(sql|sqlite|sqlite3|db|bak|parquet)$/, 'database'],
			[/^(sh|bash|ps1|bat|cmd)$/, 'terminal'],
			[/^(html|htm)$/, 'browser'],
			[/^xml$/, 'file-code'],
			[/^(yaml|yml|toml|ini|conf|env)$/, 'gear'],
			[/^(csproj|fsproj|vbproj|sln|tf)$/, 'diagram-project'],
			[/^(http|rest)$/, 'arrow-right-arrow-left'],
			[/^har$/, 'network-wired'],
			[/^(js|ts|jsx|tsx|cs|py|java|go|rs|c|h|cpp|hpp|rb|php)$/, 'square-code'],
			[/^pdf$/, 'file-pdf'],
		];
		return types.find(([pattern]) => pattern.test(extension))?.[1] || 'file';
	}

	function formatFileSize(bytes) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function createFileItem(file) {
		// Keep file names out of HTML parsing, including action labels.
		const $item = $(`<li role="treeitem" tabindex="-1" class="saTreeXItem saFileNoDrop saLoading">
            <div class="saTreeXRow">
                <button type="button" class="saTreeXExpander" tabindex="-1" aria-hidden="true"><i class="saIcon far fa-angle-right" aria-hidden="true"></i></button>
                <div class="saTreeXTypeWrapper">
                    <div class="saLoadingWrapper saLoadingExtraDark" aria-hidden="true">
                        <svg class="saLoading" viewBox="0 0 24 24"><circle class="saLoadingCircle" cx="12" cy="12" r="12" fill="none"></circle><path class="saLoadingCheck" d="M6.29,12.58l3.14,3.19c.15,.15,.39,.15,.53,0l7.75-7.8" fill="none"></path></svg>
                        <div class="saLoadingSpinner"></div>
                    </div>
                    <i class="saTreeXType saIcon far" aria-hidden="true"></i><i class="saTreeXCheck" aria-hidden="true"></i>
                </div>
                <ul class="saTreeXButtonGroup">
                    <li><button class="saTreeXButton" type="button"><i class="far fa-circle-info saIcon" aria-hidden="true"></i></button></li>
                    <li><button class="saTreeXButton" type="button"><i class="far fa-ellipsis-vertical saIcon" aria-hidden="true"></i></button></li>
                </ul>
                <span class="saTreeXLabel"></span>
                <div class="saFileSizeRow"><span class="saFileSize"></span><span class="saFileUploadProgressText" aria-hidden="true">0%</span></div>
                <progress class="saScreenReaderOnly" max="100" value="0"></progress>
                <i class="saIcon far fa-grip-dots-vertical" aria-hidden="true"></i>
            </div>
        </li>`);
		$item.find('.saTreeXLabel').text(file.name);
		$item.find('.saTreeXType').addClass(`fa-${fileIcon(file.name)}`);
		$item.find('.saTreeXButton').eq(0).attr('aria-label', `Details for ${file.name}`);
		$item
			.find('.saTreeXButton')
			.eq(1)
			.attr({
				'aria-label': `Actions for ${file.name}`,
				'aria-haspopup': 'menu',
				'aria-expanded': 'false',
				'aria-controls': 'saTreeXContextMenu',
			});
		$item.find('.saFileSize').text(formatFileSize(file.size));
		$item.find('progress').attr('aria-label', `Demo upload progress for ${file.name}`);
		$item.find('.fa-grip-dots-vertical').toggle($('.grip').first().attr('aria-pressed') === 'true');
		$item.find('.saTreeXButtonGroup').toggle($('.button').first().attr('aria-pressed') === 'true');
		return $item;
	}

	function simulateUpload($item, done) {
		let progress = 0;
		const $progress = $item.find('progress');
		const timer = window.setInterval(() => {
			if (!$item[0].isConnected) {
				window.clearInterval(timer);
				return;
			}
			progress = Math.min(100, progress + 25);
			$progress.val(progress);
			$item.find('.saFileUploadProgressText').text(`${progress}%`);
			$item.children('.saTreeXRow').css('--tree-upload-progress', `${progress}%`);
			if (progress === 100) {
				window.clearInterval(timer);
				$item.removeClass('saLoading').addClass('saDone');
				window.setTimeout(() => $progress.remove(), 2000);
				done();
			}
		}, 500);
	}

	function addFiles(folder, files) {
		if (!acceptsFiles || !folder?.isExpandable || !files.length) return;
		let $group = folder.$domNode.children('ul[role="group"]');
		if (!$group.length) $group = $('<ul role="group"></ul>').appendTo(folder.$domNode);
		const added = Array.from(files, (file) => ({ file, $item: createFileItem(file) }));
		added.forEach(({ $item }) => $group.append($item));
		folder.$domNode.attr('aria-expanded', 'true');
		const tree = folder.tree;
		tree.refreshStructure();
		if (!tree.$domNode.hasClass('saNotCheckable'))
			added.forEach(({ $item }) => tree._updateParents($item.data('treeitem')));
		tree.updateCheckedAdjacency();
		tree.setFocusToItem(added[0].$item.data('treeitem'));
		announce(
			`Added ${added.length} ${added.length === 1 ? 'file' : 'files'} to ${folder.label}. Demo upload in progress.`,
		);
		let remaining = added.length;
		added.forEach(({ $item }) =>
			simulateUpload($item, () => {
				if (--remaining === 0)
					announce(
						`Demo upload complete: ${added.length} ${added.length === 1 ? 'file' : 'files'} added to ${folder.label}.`,
					);
			}),
		);
	}

	function setupFileDrop() {
		$(document).on('dragenter dragover', (event) => {
			if (!isFileDrag(event)) return;
			event.preventDefault();
			if (acceptsFiles) $views.addClass('saFileDragging');
		});
		$(document).on('dragleave', (event) => {
			if (!event.originalEvent.relatedTarget) clearFileDrag();
		});
		$(document).on('drop dragend', (event) => {
			if (isFileDrag(event)) event.preventDefault();
			clearFileDrag();
		});
		// Bind to rows, not ancestor treeitems: dropping on a file must never upload into its parent.
		$views.on('dragenter dragover dragleave drop', '.saTreeXRow', function (event) {
			if (!isFileDrag(event)) return;
			event.preventDefault();
			event.stopPropagation();
			const item = $(this).parent().data('treeitem');
			const allowed = acceptsFiles && item?.isExpandable;
			const transfer = event.originalEvent.dataTransfer;
			if (event.type === 'dragenter' || event.type === 'dragover') {
				$views.find('.saFileDrop').removeClass('saFileDrop');
				item.$domNode.toggleClass('saFileDrop', allowed);
				$views.toggleClass('saFileDragging', acceptsFiles);
				transfer.dropEffect = allowed ? 'copy' : 'none';
			} else if (event.type === 'dragleave') {
				if (!this.contains(event.originalEvent.relatedTarget)) item.$domNode.removeClass('saFileDrop');
			} else {
				if (allowed) addFiles(item, transfer.files);
				clearFileDrag();
			}
		});
	}

	$views.each(function () {
		const tree = new Tree($(this));
		trees.push(tree);
		tree.init();
	});
	setupOptions();
	itemMenu = setupItemMenu();
	setupLegacyTree();
	setupNodeDragDrop();
	setupFileDrop();

	// The minimized sidebar's search affordance opens the existing search input.
	$('.saSideBarSearchLink')
		.on('click', () => document.getElementById('SideBarSearchInput').focus())
		.on('keydown', function (event) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				this.click();
			}
		});
});
