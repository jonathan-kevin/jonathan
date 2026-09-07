(function () {
	"use strict";

	const interval = 1000;
	const resources = new Map();
	const enabledTypes = getEnabledTypes();

	function getEnabledTypes() {
		const hash = document.currentScript?.src.split("#")[1];
		return new Set(hash ? hash.split(",") : ["css", "html", "js"]);
	}

	function isLocal(url) {
		return new URL(url, document.baseURI).origin === window.location.origin;
	}

	function getSignature(response) {
		return [
			response.headers.get("etag"),
			response.headers.get("last-modified"),
			response.headers.get("content-length")
		].join("|");
	}

	async function readSignature(url) {
		const requestUrl = new URL(url);
		requestUrl.searchParams.set("live-reload", Date.now());

		const response = await fetch(requestUrl, {
			method: "HEAD",
			cache: "no-store"
		});

		if (!response.ok) {
			throw new Error(`Unable to check ${url}: ${response.status}`);
		}

		return getSignature(response);
	}

	function discoverResources() {
		if (enabledTypes.has("html")) {
			resources.set(window.location.href, { type: "html" });
		}

		if (enabledTypes.has("css")) {
			document.querySelectorAll('link[rel~="stylesheet"][href]').forEach((link) => {
				if (isLocal(link.href)) {
					resources.set(link.href, { type: "css", element: link });
				}
			});
		}

		if (enabledTypes.has("js")) {
			document.querySelectorAll("script[src]").forEach((script) => {
				if (isLocal(script.src)) {
					resources.set(script.src, { type: "js" });
				}
			});
		}
	}

	function refreshStylesheet(resource, url) {
		const oldLink = resource.element;
		if (!oldLink?.parentNode) {
			return;
		}

		const newLink = oldLink.cloneNode();
		const newUrl = new URL(url);
		newUrl.searchParams.set("live-reload", Date.now());
		newLink.href = newUrl.href;
		newLink.addEventListener("load", () => oldLink.remove(), { once: true });
		oldLink.after(newLink);
		resource.element = newLink;
	}

	async function initialize() {
		discoverResources();

		await Promise.all([...resources].map(async ([url, resource]) => {
			try {
				resource.signature = await readSignature(url);
			} catch {
				resources.delete(url);
			}
		}));

		window.setTimeout(checkForChanges, interval);
	}

	async function checkForChanges() {
		for (const [url, resource] of resources) {
			try {
				const signature = await readSignature(url);

				if (signature !== resource.signature) {
					resource.signature = signature;

					if (resource.type === "css") {
						refreshStylesheet(resource, url);
					} else {
						window.location.reload();
						return;
					}
				}
			} catch {
				// Keep polling; a file may be briefly unavailable while it is being written.
			}
		}

		window.setTimeout(checkForChanges, interval);
	}

	if (window.location.protocol !== "file:") {
		initialize();
	}
})();
