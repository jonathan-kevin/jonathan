# Softadmin AI Mockup Netlify Setup

The browser demo can call a Netlify Function to turn prompts into real AI-generated Softadmin specs.

## Files

- `26-6/softadmin-ai-poc.html`
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
```

For OpenAI Platform instead, set this in Netlify:

```text
OPENAI_API_KEY=...
```

Optional:

```text
OPENAI_MODEL=gpt-4.1-mini
```

If credentials are missing or invalid, the function returns an error and the browser falls back to the local rule-based prompt mapper.

## Smoke Test

After deploy, open:

```text
https://jonathankevin.netlify.app/26-6/softadmin-ai-poc
```

Try a prompt that is not one of the local canned examples, for example:

```text
Create a supplier detail page with contact information, unpaid invoices, recent payments, and a notes tab.
```

The status line should say:

```text
AI spec: ...
```

If it says:

```text
Local spec: ...
```

then the function failed or the API key is missing.
