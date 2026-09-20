// Rebuild clipboard HTML from supported semantics before Tiptap parses it.
// The detached document is never attached to the page or allowed to run scripts.
export function cleanPastedHTML(html) {
	const source = new DOMParser().parseFromString(html, "text/html");
	const output = document.implementation.createHTMLDocument("");
	const rules = [];
	for (const style of source.querySelectorAll("style")) {
		try {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(style.textContent);
			for (const rule of sheet.cssRules) {
				if (rule.selectorText && rule.style) rules.push(rule);
			}
		} catch { /* Unsupported clipboard CSS is optional. */ }
	}
	normalizeOfficeLists(source.body);
	const blocks = new Set(["P", "DIV", "SECTION", "ARTICLE", "MAIN", "HEADER", "FOOTER", "ADDRESS", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH", "HR"]);
	const discard = new Set(["SCRIPT", "STYLE", "META", "LINK", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "NOSCRIPT", "TEMPLATE", "BUTTON", "SELECT", "TEXTAREA", "INPUT"]);
	const taskCheckbox = item => Array.from(item.querySelectorAll('input[type="checkbox"]')).find(input => input.closest("li") === item);
	const isTaskList = list => list?.tagName === "UL" && (list.dataset.type === "taskList" || Array.from(list.children).some(item => item.dataset.type === "taskItem" || taskCheckbox(item)));
	const validColor = color => color && color.length <= 128 && !/[\u0000-\u001f;]/.test(color) && CSS.supports("color", color);
	const safeURL = (value, image = false) => {
		if (!value || /[\u0000-\u0020\u007f]/.test(value)) return false;
		if (image && /^data:image\/(?:png|jpeg|gif|webp|avif|bmp);base64,[a-z0-9+/]+=*$/i.test(value)) return true;
		try {
			const url = new URL(value, document.baseURI);
			return (image ? ["http:", "https:"] : ["http:", "https:", "mailto:", "tel:"]).includes(url.protocol);
		} catch { return false; }
	};
	const appendParagraphs = (target, children) => {
		let paragraph;
		for (const child of children) {
			if (child.nodeType === 1 && blocks.has(child.tagName)) {
				paragraph = null;
				target.append(child);
			} else {
				if (!paragraph && child.nodeType === 3 && !child.textContent.trim()) continue;
				if (!paragraph) { paragraph = output.createElement("p"); target.append(paragraph); }
				paragraph.append(child);
			}
		}
	};
	const clean = (node, inherited = {}) => {
		const fragment = output.createDocumentFragment();
		if (node.nodeType === 3) {
			let text = output.createTextNode(node.textContent.replace(/\u00a0/g, " "));
			for (const [mark, tag] of [["bold", "strong"], ["italic", "em"], ["strike", "s"], ["underline", "u"], ["color", "span"]]) {
				if (!inherited[mark]) continue;
				const wrapper = output.createElement(tag);
				if (mark === "color") wrapper.setAttribute("data-text-color", inherited.color);
				wrapper.append(text);
				text = wrapper;
			}
			fragment.append(text);
			return fragment;
		}
		if (node.nodeType !== 1 || discard.has(node.tagName)) return fragment;
		if (node.tagName === "LABEL" && node.parentElement?.dataset.type === "taskItem") return fragment;
		const styles = {};
		for (const rule of rules) {
			try {
				if (node.matches(rule.selectorText)) for (const property of ["color", "font-weight", "font-style", "text-decoration-line"]) {
					if (rule.style.getPropertyValue(property)) styles[property] = rule.style.getPropertyValue(property);
				}
			} catch { /* Ignore unsupported selectors. */ }
		}
		for (const property of ["color", "font-weight", "font-style", "text-decoration-line"]) {
			if (node.style.getPropertyValue(property)) styles[property] = node.style.getPropertyValue(property);
		}
		const marks = { ...inherited };
		const color = node.getAttribute("data-text-color") || styles.color || (node.tagName === "FONT" && node.getAttribute("color"));
		if (validColor(color)) marks.color = color;
		if (styles["font-weight"]) marks.bold = /bold|bolder/.test(styles["font-weight"]) || Number(styles["font-weight"]) >= 600;
		if (styles["font-style"]) marks.italic = /italic|oblique/.test(styles["font-style"]);
		if (/^(B|STRONG)$/.test(node.tagName)) marks.bold = true;
		if (/^(I|EM)$/.test(node.tagName)) marks.italic = true;
		if (/^(S|DEL|STRIKE)$/.test(node.tagName) || /line-through/.test(styles["text-decoration-line"])) marks.strike = true;
		if (node.tagName === "U" || /underline/.test(styles["text-decoration-line"])) marks.underline = true;
		let tag = node.tagName.toLowerCase();
		const heading = node.className?.match?.(/\bMsoHeading([1-6])\b/i) || node.getAttribute("style")?.match(/mso-outline-level:\s*([1-6])/i);
		if (heading) tag = `h${heading[1]}`;
		if (tag === "pre") {
			const pre = output.createElement("pre");
			const code = output.createElement("code");
			const language = node.querySelector("code")?.className.match(/\blanguage-([\w+-]+)/)?.[1];
			if (language) code.className = `language-${language}`;
			code.textContent = node.textContent;
			pre.append(code); fragment.append(pre); return fragment;
		}
		if (tag === "img") {
			if (safeURL(node.getAttribute("src"), true)) {
				const image = output.createElement("img");
				for (const attr of ["src", "alt", "title"]) if (node.hasAttribute(attr)) image.setAttribute(attr, node.getAttribute(attr));
				fragment.append(image);
			}
			return fragment;
		}
		const children = output.createDocumentFragment();
		for (const child of node.childNodes) children.append(clean(child, tag === "code" ? {} : marks));
		if (["div", "section", "article", "main", "header", "footer", "address"].includes(tag)) {
			appendParagraphs(fragment, Array.from(children.childNodes));
			return fragment;
		}
		if (!/^(p|h[1-6]|ul|ol|li|blockquote|code|table|thead|tbody|tfoot|tr|td|th|hr|br|a)$/.test(tag) || (tag === "a" && !safeURL(node.getAttribute("href")))) {
			fragment.append(children); return fragment;
		}
		const element = output.createElement(tag);
		if (tag === "a") {
			element.setAttribute("href", node.getAttribute("href"));
			if (node.hasAttribute("title")) element.setAttribute("title", node.getAttribute("title"));
		}
		if (tag === "ol" && /^\d+$/.test(node.getAttribute("start"))) element.setAttribute("start", node.getAttribute("start"));
		if (tag === "td" || tag === "th") for (const attr of ["colspan", "rowspan"]) {
			const value = Number(node.getAttribute(attr));
			if (value > 1 && value <= 100) element.setAttribute(attr, String(value));
		}
		if (tag === "ul" && isTaskList(node)) element.dataset.type = "taskList";
		if (tag === "li" && (node.dataset.type === "taskItem" || isTaskList(node.parentElement))) {
			element.dataset.type = "taskItem";
			element.dataset.checked = String(node.dataset.checked === "true" || Boolean(taskCheckbox(node)?.checked));
		}
		element.append(children); fragment.append(element); return fragment;
	};
	const result = output.createElement("div");
	const children = output.createDocumentFragment();
	children.append(clean(source.body));
	appendParagraphs(result, Array.from(children.childNodes));
	return result.innerHTML;
}

function normalizeOfficeLists(root) {
	for (const parent of [root, ...root.querySelectorAll("div, td, th, blockquote")]) {
		let stack = [];
		let listId;
		for (const child of Array.from(parent.children)) {
			const office = child.getAttribute("style")?.match(/mso-list:\s*(l\d+)\s+level(\d+)/i);
			if (!office || !/^(P|DIV)$/.test(child.tagName)) { stack = []; continue; }
			const marker = child.querySelector('[style*="mso-list:Ignore"], [style*="mso-list: Ignore"], [style*="mso-list:ignore"]');
			const markerText = marker?.textContent.trim() || child.textContent.trim().match(/^(?:\d+[.)]|[a-z][.)]|[•·▪○])/i)?.[0] || "";
			const ordered = /^(?:\d+|[a-z]+)[.)]/i.test(markerText);
			if (office[1] !== listId) stack = [];
			listId = office[1];
			const level = Math.min(Number(office[2]), stack.length + 1);
			stack.length = Math.min(stack.length, level);
			if (!stack[level - 1] || stack[level - 1].tagName !== (ordered ? "OL" : "UL")) {
				const list = root.ownerDocument.createElement(ordered ? "ol" : "ul");
				const start = parseInt(markerText, 10);
				if (ordered && start > 1) list.setAttribute("start", String(start));
				if (level > 1 && stack[level - 2]?.lastElementChild) stack[level - 2].lastElementChild.append(list);
				else parent.insertBefore(list, child);
				stack[level - 1] = list;
			}
			if (marker) marker.remove();
			else if (markerText) {
				const walker = root.ownerDocument.createTreeWalker(child, NodeFilter.SHOW_TEXT);
				const first = walker.nextNode();
				if (first) first.textContent = first.textContent.replace(/^\s*(?:\d+[.)]|[a-z][.)]|[•·▪○])\s*/i, "");
			}
			const item = root.ownerDocument.createElement("li");
			item.append(child);
			stack[level - 1].append(item);
		}
	}
}
