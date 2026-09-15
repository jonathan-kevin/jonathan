# NewEdit Editing

NewEdit components, field collections, and fields have stable `_editorId` values. `softadmin-newedit-editor.js` applies additions, deletions, duplicates, moves, and sibling grouping to a cloned spec. The UI validates the result before rendering it and recording undo history. IDs survive normalization, revisions, and saved pages.

The current spec in `lastDebugResult.spec` is the source for NewEdit field structure and basic label/value edits. Undo, redo, and reopening saved pages rebuild NewEdit forms from that spec. HTML snapshots remain for the page shell and other components, whose DOM editing has not been migrated. Older saved pages without field IDs retain their existing HTML restoration behavior; this does not recover structural edits already missing from those older specs.

If the spec is edited while an AI request is pending, its response is not applied. The UI keeps the user's edits and asks them to generate again.

## Verification

Run pure command, renderer, normalization, and mocked endpoint checks:

```sh
node softadmin-regression-tests.js
```

With Playwright available and Microsoft Edge installed, run the isolated browser lifecycle test against the local HTTP site:

```sh
node softadmin-newedit-browser-tests.cjs
```

`SOFTADMIN_TEST_URL` can override the default `http://localhost/jonathan-git/26-6/`. The test uses a fresh browser context, intercepts AI requests without calling Azure, and covers adding/editing/dragging/deleting fields, title-only generation, undo/redo, save/reload/reopen, sibling fields, and failed or stale AI responses. It writes a verification screenshot to the OS temporary directory.
