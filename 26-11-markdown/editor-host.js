// Fit the upstream full-page template into the existing scrolling content area.
// The iframe contains its default styles, so they cannot affect the host page.
class MarkdownEditor extends HTMLElement {
	connectedCallback() {
		const frame = this.querySelector('iframe');
		const container = this.closest('.scrollcontent');
		if (!frame || !container) return;
		this.updateHeight = () => {
			const parentStyle = getComputedStyle(this.parentElement);
			const padding = parseFloat(parentStyle.paddingTop) + parseFloat(parentStyle.paddingBottom);
			let visibleBottom = window.innerHeight;
			for (let ancestor = frame.parentElement; ancestor; ancestor = ancestor.parentElement) {
				if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(ancestor).overflowY)) {
					const rect = ancestor.getBoundingClientRect();
					visibleBottom = Math.min(visibleBottom, rect.top + ancestor.clientTop + ancestor.clientHeight);
				}
			}
			const available = visibleBottom - frame.getBoundingClientRect().top;
			frame.height = String(Math.max(320, Math.min(container.clientHeight - padding, available) - 8));
		};
		this.resizeObserver = new ResizeObserver(this.updateHeight);
		this.resizeObserver.observe(container);
		window.addEventListener('resize', this.updateHeight);
	}

	disconnectedCallback() {
		this.resizeObserver?.disconnect();
		window.removeEventListener('resize', this.updateHeight);
	}
}

customElements.define('markdown-editor', MarkdownEditor);
