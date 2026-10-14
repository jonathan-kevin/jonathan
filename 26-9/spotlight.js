// Persistent spotlights: data-spotlight links an anchor to a body-level, non-modal dialog.
// No Popover API or CSS anchor positioning is required.
(() => {
	const GAP = 8;
	const EDGE = 8;
	const spotlights = [];
	const originalRelations = new WeakMap();
	let pendingFrame = 0;

	function setStyle(element, property, value) {
		if (element.style[property] !== value) element.style[property] = value;
	}

	function describeAnchor(anchor, spotlight, visible) {
		// This is an action with supplementary information, not a popup toggle.
		// Preserve descriptions supplied by the host page.
		if (!originalRelations.has(anchor)) {
			originalRelations.set(anchor, {
				'aria-describedby': new Set((anchor.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean)),
				'aria-details': new Set((anchor.getAttribute('aria-details') || '').split(/\s+/).filter(Boolean))
			});
		}
		for (const [attribute, id] of [['aria-describedby', spotlight.getAttribute('aria-describedby')], ['aria-details', spotlight.id]]) {
			const tokens = new Set((anchor.getAttribute(attribute) || '').split(/\s+/).filter(Boolean));
			for (const token of (id || '').split(/\s+/).filter(Boolean)) {
				if (visible) tokens.add(token);
				else if (!originalRelations.get(anchor)[attribute].has(token)) tokens.delete(token);
			}
			if (tokens.size) anchor.setAttribute(attribute, [...tokens].join(' '));
			else anchor.removeAttribute(attribute);
		}
	}

	function visibleRect(anchor, viewport) {
		if (!anchor.isConnected || !anchor.getClientRects().length) return null;
		const rect = anchor.getBoundingClientRect();
		const style = getComputedStyle(anchor);
		if (!rect.width || !rect.height || style.visibility === 'hidden') return null;
		let left = Math.max(rect.left, viewport.left);
		let top = Math.max(rect.top, viewport.top);
		let right = Math.min(rect.right, viewport.right);
		let bottom = Math.min(rect.bottom, viewport.bottom);
		for (let parent = anchor.parentElement; parent; parent = parent.parentElement) {
			const parentStyle = getComputedStyle(parent);
			const bounds = parent.getBoundingClientRect();
			if (/(auto|scroll|hidden|clip)/.test(parentStyle.overflowX)) {
				left = Math.max(left, bounds.left + parent.clientLeft);
				right = Math.min(right, bounds.left + parent.clientLeft + parent.clientWidth);
			}
			if (/(auto|scroll|hidden|clip)/.test(parentStyle.overflowY)) {
				top = Math.max(top, bounds.top + parent.clientTop);
				bottom = Math.min(bottom, bounds.top + parent.clientTop + parent.clientHeight);
			}
		}
		return right > left && bottom > top ? { left, top, right, bottom } : null;
	}

	function positionSpotlights() {
		pendingFrame = 0;
		const visual = window.visualViewport;
		const left = visual ? visual.offsetLeft : 0;
		const top = visual ? visual.offsetTop : 0;
		const viewport = {
			left, top,
			right: left + (visual ? visual.width : document.documentElement.clientWidth),
			bottom: top + (visual ? visual.height : document.documentElement.clientHeight)
		};
		for (const state of spotlights) {
			if (state.dismissed) continue;
			const candidates = state.anchors.map(anchor => ({ anchor, rect: visibleRect(anchor, viewport) }));
			const candidate = candidates.find(item => item.rect);
			const { spotlight } = state;
			state.anchor = candidate ? candidate.anchor : null;
			for (const item of candidates) describeAnchor(item.anchor, spotlight, item === candidate);
			// Temporarily hide when its anchor scrolls away; this does not dismiss it.
			spotlight.hidden = !candidate;
			if (!candidate) continue;
			setStyle(spotlight, 'maxWidth', `${Math.max(0, viewport.right - viewport.left - EDGE * 2)}px`);
			setStyle(spotlight, 'maxHeight', `${Math.max(0, viewport.bottom - viewport.top - EDGE * 2)}px`);
			const { rect, anchor } = candidate;
			const below = Math.max(0, viewport.bottom - EDGE - rect.bottom - GAP);
			const above = Math.max(0, rect.top - GAP - viewport.top - EDGE);
			const naturalHeight = spotlight.getBoundingClientRect().height;
			const placement = naturalHeight <= below || below >= above ? 'bottom' : 'top';
			const availableHeight = placement === 'bottom' ? below : above;
			setStyle(spotlight, 'maxHeight', `${Math.max(0, availableHeight)}px`);
			const size = spotlight.getBoundingClientRect();
			const alignedLeft = getComputedStyle(anchor).direction === 'rtl' ? rect.right - size.width : rect.left;
			const x = Math.max(viewport.left + EDGE, Math.min(alignedLeft, viewport.right - EDGE - size.width));
			const y = placement === 'bottom' ? rect.bottom + GAP : rect.top - GAP - size.height;
			setStyle(spotlight, 'left', `${x}px`);
			setStyle(spotlight, 'top', `${Math.max(viewport.top + EDGE, y)}px`);
			spotlight.dataset.placement = placement;
		}
	}

	function schedulePosition() {
		if (!pendingFrame) pendingFrame = requestAnimationFrame(positionSpotlights);
	}

	function dismiss(state) {
		const restoreFocus = state.spotlight.contains(document.activeElement);
		state.dismissed = true;
		state.spotlight.hidden = true;
		for (const anchor of state.anchors) describeAnchor(anchor, state.spotlight, false);
		if (restoreFocus && state.anchor && state.anchor.isConnected) state.anchor.focus({ preventScroll: true });
	}

	function initialize() {
		const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedulePosition) : null;
		for (const spotlight of document.querySelectorAll('.saSpotlight[role="dialog"][id]')) {
			const anchors = [...document.querySelectorAll('[data-spotlight]')].filter(anchor => anchor.dataset.spotlight === spotlight.id);
			if (!anchors.length) continue;
			// Avoid clipping and stacking contexts from the anchor's containers.
			document.body.append(spotlight);
			const state = { spotlight, anchors, anchor: null, dismissed: false };
			spotlights.push(state);
			spotlight.querySelector('.saSpotlightDismiss')?.addEventListener('click', () => dismiss(state));
			observer?.observe(spotlight);
			for (const anchor of anchors) {
				observer?.observe(anchor);
				for (let parent = anchor.parentElement; parent; parent = parent.parentElement) observer?.observe(parent);
			}
		}
		if (!spotlights.length) return;
		observer?.observe(document.documentElement);
		window.addEventListener('scroll', schedulePosition, true);
		window.addEventListener('resize', schedulePosition);
		window.visualViewport?.addEventListener('scroll', schedulePosition);
		window.visualViewport?.addEventListener('resize', schedulePosition);
		document.fonts?.ready.then(schedulePosition);
		document.addEventListener('keydown', event => {
			if (event.key !== 'Escape' || event.defaultPrevented) return;
			const open = spotlights.filter(state => !state.dismissed && !state.spotlight.hidden);
			const state = open.find(item => item.spotlight.contains(document.activeElement)) || open[open.length - 1];
			if (!state) return;
			event.preventDefault();
			dismiss(state);
		});
		positionSpotlights();
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
	else initialize();
})();
