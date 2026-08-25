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

The endpoint also applies a 4,000-character prompt limit, a 16 KB request limit, a 45-second provider timeout, and best-effort per-instance throttling. For a wider rollout, protect the Netlify site with your organization login or Netlify access control as well.

For OpenAI Platform instead, set this in Netlify:

```text
OPENAI_API_KEY=...
```

Optional:

```text
OPENAI_MODEL=gpt-4.1-mini
```

If credentials are missing or invalid, the function returns an error and the browser keeps the current mockup unchanged.

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
