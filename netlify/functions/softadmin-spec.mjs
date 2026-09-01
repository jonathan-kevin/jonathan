import '../../26-6/softadmin-reference-catalog.js';
import '../../26-6/softadmin-spec-contract.js';
import '../../26-6/softadmin-spec-runtime.js';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_AZURE_API_VERSION = '2025-04-01-preview';
const MAX_REQUEST_BYTES = 65_536;
const MAX_PROMPT_LENGTH = 4_000;
const MAX_REQUESTS_PER_MINUTE = 12;
const REQUEST_TIMEOUT_MS = 45_000;
const MAX_OUTPUT_TOKENS = 3_200;
const rateBuckets = new Map();

function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store'
		}
	});
}

function renderableNames(entries = {}) {
	return Object.entries(entries)
		.filter(([, entry]) => entry && entry.renderable)
		.map(([name, entry]) => entry.specType && entry.specType !== name ? `${name} (${entry.specType})` : name);
}

function catalogSummary() {
	const catalog = globalThis.SoftadminReferenceCatalog || {};

	return {
		components: renderableNames(catalog.components),
		controls: renderableNames(catalog.controls),
		promptInstructions: Object.values(catalog.components || {})
			.filter(entry => entry?.renderable && entry.promptInstruction)
			.map(entry => entry.promptInstruction)
	};
}

function clientAddress(request) {
	return request.headers.get('x-nf-client-connection-ip')
		|| request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
		|| 'unknown';
}

function isRateLimited(request) {
	const now = Date.now();
	const key = clientAddress(request);
	const previous = rateBuckets.get(key);
	const bucket = !previous || now - previous.startedAt >= 60_000
		? { count: 0, startedAt: now }
		: previous;

	bucket.count += 1;
	rateBuckets.set(key, bucket);
	return bucket.count > MAX_REQUESTS_PER_MINUTE;
}

function isAllowedOrigin(request, env) {
	const origin = request.headers.get('origin');
	if (!origin) {
		return true;
	}

	const configured = envValue(env, 'SOFTADMIN_ALLOWED_ORIGINS')
		.split(',')
		.map(value => value.trim())
		.filter(Boolean);

	try {
		const url = new URL(origin);
		return configured.includes(origin)
			|| origin === 'https://jonathankevin.netlify.app'
			|| url.hostname === 'localhost'
			|| url.hostname === '127.0.0.1';
	} catch {
		return false;
	}
}

function providerError(message, status) {
	const error = new Error(message);
	error.status = status;
	return error;
}

function extractOutputText(responseJson) {
	if (responseJson.output_text) {
		return responseJson.output_text;
	}

	const parts = [];

	for (const item of responseJson.output || []) {
		for (const content of item.content || []) {
			if (content.type === 'output_text' && content.text) {
				parts.push(content.text);
			}
		}
	}

	return parts.join('\n');
}

function parseJsonObject(text) {
	try {
		return JSON.parse(text);
	} catch {
		const match = text.match(/\{[\s\S]*\}/);

		if (!match) {
			throw new Error('Model did not return JSON.');
		}

		return JSON.parse(match[0]);
	}
}

function pointerSegments(path) {
	if (typeof path !== 'string' || !path.startsWith('/') || path.length > 500) {
		throw new Error('Invalid patch path.');
	}

	return path.slice(1).split('/').map(segment => {
		const decoded = segment.replace(/~1/g, '/').replace(/~0/g, '~');
		if (['__proto__', 'prototype', 'constructor'].includes(decoded)) {
			throw new Error('Unsafe patch path.');
		}
		return decoded;
	});
}

function applyOperations(currentSpec, operations) {
	if (!Array.isArray(operations) || operations.length === 0 || operations.length > 50) {
		throw new Error('Revision must contain between 1 and 50 patch operations.');
	}

	const result = structuredClone(currentSpec);
	for (const operation of operations) {
		if (!operation || !['add', 'remove', 'replace'].includes(operation.op)) {
			throw new Error('Unsupported patch operation.');
		}

		const segments = pointerSegments(operation.path);
		const key = segments.pop();
		let parent = result;
		for (const segment of segments) {
			if (parent == null || !Object.prototype.hasOwnProperty.call(parent, segment)) {
				throw new Error(`Patch path does not exist: ${operation.path}`);
			}
			parent = parent[segment];
		}

		if (Array.isArray(parent)) {
			const index = key === '-' ? parent.length : Number(key);
			if (!Number.isInteger(index) || index < 0 || index > parent.length) {
				throw new Error(`Invalid array patch path: ${operation.path}`);
			}
			if (operation.op === 'add') parent.splice(index, 0, structuredClone(operation.value));
			else if (operation.op === 'remove' && index < parent.length) parent.splice(index, 1);
			else if (operation.op === 'replace' && index < parent.length) parent[index] = structuredClone(operation.value);
			else throw new Error(`Patch path does not exist: ${operation.path}`);
		} else {
			if (!parent || typeof parent !== 'object') throw new Error(`Invalid patch path: ${operation.path}`);
			if (operation.op !== 'add' && !Object.prototype.hasOwnProperty.call(parent, key)) {
				throw new Error(`Patch path does not exist: ${operation.path}`);
			}
			if (operation.op === 'remove') delete parent[key];
			else parent[key] = structuredClone(operation.value);
		}
	}

	return result;
}

function systemInstructions(summary, isRevision = false) {
	const instructions = [
		'You generate compact JSON specs for Softadmin UI mockups.',
		isRevision
			? 'Return only a JSON object with this shape: { "operations": [...] }.'
			: 'Return only a JSON object with this shape: { "frame": {...}, "components": [...] }.',
		'Do not return markdown, prose, comments, or raw HTML.',
		'The browser renderer owns Softadmin HTML and CSS. You only choose semantic components, fields, rows, labels, and realistic sample data.',
		'Use English UI text.',
		'Prefer one main component per screen. InfoBoxes may appear before a component.',
		'Prefer label/value pairs as stacked columns.',
		'Do not right-align non-numeric grid cells.',
		'Keep mockups concise. Use at most 3 sample rows per grid unless the user explicitly requests more.',
		'Use numeric:true and align:"right" only for numeric, amount, total, balance, count, or quantity columns.',
		'Use realistic Font Awesome icon names without style prefixes, for example "eye", "trash", "file-invoice", "calendar-days".',
		`Available components: ${summary.components.join(', ')}.`,
		`Available controls: ${summary.controls.join(', ')}.`,
		...summary.promptInstructions,
		'Useful component shapes:',
		'MenuGroups: { type:"MenuGroups", groups:[{ heading, items:[{ title, icon, description?, pill? }] }] }',
		'NewEdit: { type:"NewEdit", sections:[{ heading, fields:[...] }], buttons:[{ label, variant }] }',
		'ResultGrid: { type:"ResultGrid", variant?, title, caption, hitCounter, columns:[{ key, label, width?, sorted?, sortDirection?, align?, numeric? }], rows:[{...}] }',
		'DetailView: { type:"DetailView", infoBoxes?, visibleTabs?, tabs:[{ label, icon?, badge?, selected?, component? }] }',
		'InfoBoxes: { type:"InfoBoxes", messages?, boxes:[{ heading, fields:[{ label, value }] }] }',
		'ImageGallery: { type:"ImageGallery", size:"small|large", fit:"cover|contain", groups:[{ heading, open?, items:[{ caption, description?, alt?, src? }] }] }. Usually omit src; the renderer supplies safe sample images.',
		'Multirow field: { label, control:"multirow", columns:[{ key, label, control:"textbox|radio|affix|uneditable|empty", width?, prefix?, suffix? }], rows:[{...}], aggregate? }. Use for repeated editable rows inside NewEdit.',
		'Supported controls include textbox, textarea, dropdown, checkbox, radioCards, time, dateRange, fileUploadArea, multiAutosearch, multirow, autosearch, autosuggest, textboxDropdown, uneditable.'
	];

	if (isRevision) {
		instructions.push(
			'This is an edit turn. Return only {"operations":[...]} using JSON Patch operations add, remove, or replace.',
			'Change only what the edit request explicitly asks for. Preserve every unrelated value and array item.',
			'Use JSON Pointer paths rooted in the supplied current spec. Do not return the complete spec.'
		);
	}

	return instructions.join('\n');
}

function modelInput(prompt, currentSpec) {
	return currentSpec
		? `Current spec:\n${JSON.stringify(currentSpec)}\n\nEdit request:\n${prompt}`
		: prompt;
}

function envValue(env, name) {
	return env?.get(name) || process.env[name] || '';
}

function azureConfig(env) {
	const endpoint = envValue(env, 'AZURE_OPENAI_ENDPOINT').replace(/\/$/, '');
	const deployment = envValue(env, 'AZURE_OPENAI_DEPLOYMENT') || envValue(env, 'AZURE_OPENAI_DEPLOYMENT_NAME');
	const apiKey = envValue(env, 'AZURE_OPENAI_API_KEY') || (endpoint && deployment ? envValue(env, 'OPENAI_API_KEY') : '');
	const apiVersion = envValue(env, 'AZURE_OPENAI_API_VERSION') || DEFAULT_AZURE_API_VERSION;
	const wireApi = envValue(env, 'AZURE_OPENAI_WIRE_API') || 'responses';

	if (!endpoint && !deployment && !apiKey) {
		return null;
	}

	return {
		apiKey,
		apiVersion,
		deployment,
		endpoint,
		wireApi
	};
}

function openAiConfig(env) {
	return {
		apiKey: envValue(env, 'OPENAI_API_KEY'),
		model: envValue(env, 'OPENAI_MODEL') || 'gpt-4.1-mini'
	};
}

function missingAzureConfig(config) {
	return [
		!config.endpoint ? 'AZURE_OPENAI_ENDPOINT' : '',
		!config.apiKey ? 'AZURE_OPENAI_API_KEY' : '',
		!config.deployment ? 'AZURE_OPENAI_DEPLOYMENT' : ''
	].filter(Boolean);
}

async function fetchAzureSpec(config, prompt, summary, currentSpec) {
	if (config.wireApi === 'chat_completions') {
		return fetchAzureChatCompletionsSpec(config, prompt, summary, currentSpec);
	}

	return fetchAzureResponsesSpec(config, prompt, summary, currentSpec);
}

function azureOpenAiBaseUrl(endpoint) {
	return endpoint.endsWith('/openai') ? endpoint : `${endpoint}/openai`;
}

async function fetchAzureResponsesSpec(config, prompt, summary, currentSpec) {
	const url = `${azureOpenAiBaseUrl(config.endpoint)}/responses?api-version=${encodeURIComponent(config.apiVersion)}`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'api-key': config.apiKey,
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			model: config.deployment,
			input: [
				{
					role: 'system',
					content: systemInstructions(summary, Boolean(currentSpec))
				},
				{
					role: 'user',
					content: modelInput(prompt, currentSpec)
				}
			],
			text: {
				format: {
					type: 'json_object'
				}
			},
			reasoning: { effort: 'low' },
			max_output_tokens: MAX_OUTPUT_TOKENS
		}),
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
	const responseJson = await response.json();

	if (!response.ok) {
		throw providerError(responseJson.error?.message || `Azure OpenAI request failed with ${response.status}.`, response.status);
	}

	return { spec: parseJsonObject(extractOutputText(responseJson)), usage: responseJson.usage || null };
}

async function fetchAzureChatCompletionsSpec(config, prompt, summary, currentSpec) {
	const url = `${azureOpenAiBaseUrl(config.endpoint)}/deployments/${encodeURIComponent(config.deployment)}/chat/completions?api-version=${encodeURIComponent(config.apiVersion)}`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'api-key': config.apiKey,
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			messages: [
				{
					role: 'system',
					content: systemInstructions(summary, Boolean(currentSpec))
				},
				{
					role: 'user',
					content: modelInput(prompt, currentSpec)
				}
			],
			response_format: {
				type: 'json_object'
			},
			temperature: 0.2,
			reasoning_effort: 'low',
			max_tokens: MAX_OUTPUT_TOKENS
		}),
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
	const responseJson = await response.json();

	if (!response.ok) {
		throw providerError(responseJson.error?.message || `Azure OpenAI request failed with ${response.status}.`, response.status);
	}

	return { spec: parseJsonObject(responseJson.choices?.[0]?.message?.content || ''), usage: responseJson.usage || null };
}

async function fetchOpenAiSpec(config, prompt, summary, currentSpec) {
	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: {
			authorization: `Bearer ${config.apiKey}`,
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			model: config.model,
			input: [
				{
					role: 'system',
					content: systemInstructions(summary, Boolean(currentSpec))
				},
				{
					role: 'user',
					content: modelInput(prompt, currentSpec)
				}
			],
			text: {
				format: {
					type: 'json_object'
				}
			},
			reasoning: { effort: 'low' },
			max_output_tokens: MAX_OUTPUT_TOKENS
		}),
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
	const responseJson = await response.json();

	if (!response.ok) {
		throw providerError(responseJson.error?.message || `OpenAI request failed with ${response.status}.`, response.status);
	}

	return { spec: parseJsonObject(extractOutputText(responseJson)), usage: responseJson.usage || null };
}

export default async (request) => {
	if (request.method === 'OPTIONS') {
		return new Response(null, { status: 204 });
	}

	if (request.method !== 'POST') {
		return jsonResponse({ error: 'Use POST.' }, 405);
	}

	const netlifyEnv = typeof Netlify !== 'undefined' && Netlify.env ? Netlify.env : null;
	if (!isAllowedOrigin(request, netlifyEnv)) {
		return jsonResponse({ error: 'Origin is not allowed.' }, 403);
	}

	if (isRateLimited(request)) {
		return jsonResponse({ error: 'Too many requests. Try again in a minute.' }, 429);
	}

	const azure = azureConfig(netlifyEnv);
	const openai = openAiConfig(netlifyEnv);

	if (!azure && !openai.apiKey) {
		return jsonResponse({
			error: 'Missing Azure OpenAI or OpenAI Platform credentials.'
		}, 503);
	}

	const declaredLength = Number(request.headers.get('content-length') || 0);
	if (declaredLength > MAX_REQUEST_BYTES) {
		return jsonResponse({ error: 'Request body is too large.' }, 413);
	}

	let payload;

	try {
		const body = await request.text();
		if (body.length > MAX_REQUEST_BYTES) {
			return jsonResponse({ error: 'Request body is too large.' }, 413);
		}
		payload = JSON.parse(body);
	} catch {
		return jsonResponse({ error: 'Invalid JSON body.' }, 400);
	}

	const prompt = String(payload.prompt || '').trim();
	const currentSpec = payload.currentSpec || null;

	if (!prompt) {
		return jsonResponse({ error: 'Missing prompt.' }, 400);
	}
	if (prompt.length > MAX_PROMPT_LENGTH) {
		return jsonResponse({ error: `Prompt may contain at most ${MAX_PROMPT_LENGTH} characters.` }, 413);
	}
	if (currentSpec) {
		const currentValidation = globalThis.SoftadminSpecContract.validateSpec(currentSpec);
		if (!currentValidation.valid) {
			return jsonResponse({ error: 'Current mockup spec is invalid.' }, 400);
		}
	}

	const summary = catalogSummary();

	try {
		if (azure) {
			const missing = missingAzureConfig(azure);

			if (missing.length) {
				return jsonResponse({
					error: `Missing Azure OpenAI environment variables: ${missing.join(', ')}.`
				}, 503);
			}

			const result = await fetchAzureSpec(azure, prompt, summary, currentSpec);
			const operations = currentSpec ? result.spec.operations : null;
			const rawSpec = currentSpec ? applyOperations(currentSpec, operations) : result.spec;
			const spec = globalThis.SoftadminSpecRuntime.normalizeSpec(rawSpec);
			globalThis.SoftadminSpecContract.assertSpec(spec);
			return jsonResponse({ ...result, spec, operations });
		}

		const result = await fetchOpenAiSpec(openai, prompt, summary, currentSpec);
		const operations = currentSpec ? result.spec.operations : null;
		const rawSpec = currentSpec ? applyOperations(currentSpec, operations) : result.spec;
		const spec = globalThis.SoftadminSpecRuntime.normalizeSpec(rawSpec);
		globalThis.SoftadminSpecContract.assertSpec(spec);
		return jsonResponse({ ...result, spec, operations });
	} catch (error) {
		return jsonResponse({
			error: error.message || 'Could not parse model output.'
		}, error.status === 429 ? 429 : 502);
	}
};
