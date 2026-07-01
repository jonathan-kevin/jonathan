# Softadmin AI Mockup Demo

This is a static proof-of-concept demo for generating Softadmin-style UI mockups from a natural-language prompt.

## Quick Start

Double-click:

```text
open-demo.cmd
```

Or run:

```powershell
.\start-demo.ps1
```

`start-demo.ps1` will use Python or Node as a tiny local web server if either is installed. If neither is available, it opens the HTML file directly.

## Try These Prompts

```text
Create a customer detail page for Anna Andersson with overdue invoices, contact summary, cases, invoices, bookings, and payments.
```

```text
Create a NewEdit form for entering a persons contact information.
```

```text
Create an application errors and log grid with selectable rows and delete actions.
```

```text
Create an advanced grouped grid with pagination, grouped rows, row actions, expandable rows and extra text.
```

## What This Demo Proves

The prompt is converted into a compact Softadmin screen spec. The renderer then turns that spec into Softadmin-like HTML using the component registry and existing CSS.

This is intentionally not asking AI to invent raw Softadmin HTML. The maintainable path is:

```text
Prompt -> Softadmin spec -> validation -> deterministic renderer -> preview
```

## Current Limitations

- The prompt-to-spec mapping is currently local and rule-based.
- The debug drawer is developer-facing and should stay hidden from ordinary users.
- This is a mockup renderer, not a production Softadmin menu item generator yet.
- More components and controls can be added by extending the registry and renderer.

## Production Direction

The next production-shaped step is to replace the local mapper with an API:

```text
POST /api/mockups/spec
```

That endpoint should call an LLM and return only the compact Softadmin spec. The browser renderer can stay deterministic.

