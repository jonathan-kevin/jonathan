# Softadmin AI Mockup Netlify Setup

The browser demo can call a Netlify Function to turn prompts into real AI-generated Softadmin specs.

## Files

- `26-6/index.html`
- `26-6/softadmin-spec-runtime.js`
- `netlify/functions/softadmin-spec.mjs`

The page calls:

```text
/.netlify/functions/softadmin-spec
```

when it is hosted on `*.netlify.app`.

## Required Environment Variable

For Azure OpenAI, set these in Netlify:

```text
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

Optional:

```text
AZURE_OPENAI_API_VERSION=2024-10-21
SOFTADMIN_ALLOWED_ORIGINS=https://your-preview.example
```

The endpoint also applies a 4,000-character prompt limit, a 64 KB request limit, a 45-second provider timeout, and best-effort per-instance throttling. Follow-up prompts send the current compact spec and return JSON patch operations, preserving unrelated mockup content. For a wider rollout, protect the Netlify site with your organization login or Netlify access control as well.

For OpenAI Platform instead, set this in Netlify:

```text
OPENAI_API_KEY=...
```

Optional:

```text
OPENAI_MODEL=gpt-4.1-mini
```

If credentials are missing or invalid, the function returns an error and the browser keeps the current mockup unchanged.

## Local Development and Access

The deployed page and function share an origin, so normal Netlify use does not need cross-origin permission. Local HTTP development calls the hosted function instead. CORS permits `http(s)://localhost` and `http(s)://127.0.0.1` on any port, the production origin, and exact origins listed in `SOFTADMIN_ALLOWED_ORIGINS` (comma-separated). Preflight allows POST with Content-Type; success and error responses include the permitted origin. Open the local page through HTTP, not `file://`, whose opaque `null` origin is deliberately rejected.

CORS is not authentication. Requests without an Origin header remain accepted, and throttling is per instance, not a shared Azure budget. These changes do not add login or protect the public function from direct callers.

Grid extra-text rows use plain `text`. Legacy `html` values are displayed as escaped text, never executed as markup.

## Smoke Test

After deploy, open:

```text
https://jonathankevin.netlify.app/26-6/
```

Try a prompt that is not one of the local canned examples, for example:

```text
Create a supplier detail page with contact information, unpaid invoices, recent payments, and a notes tab.
```

The status line should say:

```text
AI spec: ...
```

If generation fails, the status line shows the endpoint error and the current mockup remains available.
