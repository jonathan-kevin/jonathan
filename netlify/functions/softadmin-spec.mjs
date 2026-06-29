const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_AZURE_API_VERSION = '2024-10-21';

function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store'
		}
	});
}

function implementedNames(entries = {}) {
	return Object.entries(entries)
		.filter(([, entry]) => entry && entry.implemented)
		.map(([name, entry]) => entry.renderType ? `${name} (${entry.renderType})` : name);
}

function registrySummary(registry) {
	const components = implementedNames(registry?.components);
	const controls = implementedNames(registry?.controls?.items);

	return {
		components,
		controls,
		designRules: registry?.designRules || []
	};
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

function systemInstructions(summary) {
	return [
		'You generate compact JSON specs for Softadmin UI mockups.',
		'Return only a JSON object with this shape: { "frame": {...}, "components": [...] }.',
		'Do not return markdown, prose, comments, or raw HTML.',
		'The browser renderer owns Softadmin HTML and CSS. You only choose semantic components, fields, rows, labels, and realistic sample data.',
		'Use English UI text.',
		'Prefer one main component per screen. InfoBoxes may appear before a component.',
		'Prefer label/value pairs as stacked columns.',
		'Do not right-align non-numeric grid cells.',
		'Use numeric:true and align:"right" only for numeric, amount, total, balance, count, or quantity columns.',
		'Use realistic Font Awesome icon names without style prefixes, for example "eye", "trash", "file-invoice", "calendar-days".',
		`Available components: ${summary.components.join(', ')}.`,
		`Available controls: ${summary.controls.join(', ')}.`,
		'Useful component shapes:',
		'MenuGroups: { type:"MenuGroups", groups:[{ heading, items:[{ title, icon, description?, pill? }] }] }',
		'NewEdit: { type:"NewEdit", sections:[{ heading, fields:[...] }], buttons:[{ label, variant }] }',
		'ResultGrid: { type:"ResultGrid", variant?, title, caption, hitCounter, columns:[{ key, label, width?, sorted?, sortDirection?, align?, numeric? }], rows:[{...}] }',
		'DetailView: { type:"DetailView", infoBoxes?, visibleTabs?, tabs:[{ label, icon?, badge?, selected?, component? }] }',
		'InfoBoxes: { type:"InfoBoxes", messages?, boxes:[{ heading, fields:[{ label, value }] }] }',
		'Supported controls include textbox, textarea, dropdown, checkbox, radioCards, time, dateRange, fileUploadArea, multiAutosearch, autosearch, autosuggest, textboxDropdown, uneditable.'
	].join('\n');
}

function envValue(env, name) {
	return env?.get(name) || process.env[name] || '';
}

function azureConfig(env) {
	const endpoint = envValue(env, 'AZURE_OPENAI_ENDPOINT').replace(/\/$/, '');
	const deployment = envValue(env, 'AZURE_OPENAI_DEPLOYMENT') || envValue(env, 'AZURE_OPENAI_DEPLOYMENT_NAME');
	const apiKey = envValue(env, 'AZURE_OPENAI_API_KEY') || (endpoint && deployment ? envValue(env, 'OPENAI_API_KEY') : '');
	const apiVersion = envValue(env, 'AZURE_OPENAI_API_VERSION') || DEFAULT_AZURE_API_VERSION;

	if (!endpoint && !deployment && !apiKey) {
		return null;
	}

	return {
		apiKey,
		apiVersion,
		deployment,
		endpoint
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

async function fetchAzureSpec(config, prompt, summary) {
	const url = `${config.endpoint}/openai/deployments/${encodeURIComponent(config.deployment)}/chat/completions?api-version=${encodeURIComponent(config.apiVersion)}`;
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
					content: systemInstructions(summary)
				},
				{
					role: 'user',
					content: prompt
				}
			],
			response_format: {
				type: 'json_object'
			},
			temperature: 0.2
		})
	});
	const responseJson = await response.json();

	if (!response.ok) {
		throw new Error(responseJson.error?.message || `Azure OpenAI request failed with ${response.status}.`);
	}

	return parseJsonObject(responseJson.choices?.[0]?.message?.content || '');
}

async function fetchOpenAiSpec(config, prompt, summary) {
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
					content: systemInstructions(summary)
				},
				{
					role: 'user',
					content: prompt
				}
			],
			text: {
				format: {
					type: 'json_object'
				}
			}
		})
	});
	const responseJson = await response.json();

	if (!response.ok) {
		throw new Error(responseJson.error?.message || `OpenAI request failed with ${response.status}.`);
	}

	return parseJsonObject(extractOutputText(responseJson));
}

export default async (request) => {
	if (request.method === 'OPTIONS') {
		return new Response(null, { status: 204 });
	}

	if (request.method !== 'POST') {
		return jsonResponse({ error: 'Use POST.' }, 405);
	}

	const netlifyEnv = typeof Netlify !== 'undefined' && Netlify.env ? Netlify.env : null;
	const azure = azureConfig(netlifyEnv);
	const openai = openAiConfig(netlifyEnv);

	if (!azure && !openai.apiKey) {
		return jsonResponse({
			error: 'Missing Azure OpenAI or OpenAI Platform credentials.'
		}, 503);
	}

	let payload;

	try {
		payload = await request.json();
	} catch {
		return jsonResponse({ error: 'Invalid JSON body.' }, 400);
	}

	const prompt = String(payload.prompt || '').trim();

	if (!prompt) {
		return jsonResponse({ error: 'Missing prompt.' }, 400);
	}

	const summary = registrySummary(payload.registry || {});

	try {
		if (azure) {
			const missing = missingAzureConfig(azure);

			if (missing.length) {
				return jsonResponse({
					error: `Missing Azure OpenAI environment variables: ${missing.join(', ')}.`
				}, 503);
			}

			return jsonResponse(await fetchAzureSpec(azure, prompt, summary));
		}

		const spec = await fetchOpenAiSpec(openai, prompt, summary);
		return jsonResponse(spec);
	} catch (error) {
		return jsonResponse({
			error: error.message || 'Could not parse model output.'
		}, 502);
	}
};
