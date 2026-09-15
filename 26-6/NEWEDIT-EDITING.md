# NewEdit Editing

NewEdit components, field collections, and fields have stable `_editorId` values. `softadmin-newedit-editor.js` applies additions, deletions, duplicates, moves, and sibling grouping to a cloned spec. The UI validates the result before rendering it and recording undo history. IDs survive normalization, revisions, and saved pages.

The current spec in `lastDebugResult.spec` is the source for NewEdit field structure and basic label/value edits. Undo, redo, and reopening saved pages rebuild NewEdit forms from that spec. HTML snapshots remain for other components and unmigrated controls. Older saved pages without field IDs retain their existing HTML restoration behavior; this does not recover structural edits already missing from those older specs.

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

## Sidebar and Header

`softadmin-shell-editor.js` stores sidebar groups, favorites, menu items, account name, page title, breadcrumbs, and header actions in the spec. Menu items, groups, and actions use stable `_shellId` values. Editing, deletion, duplication, and reordering update that state; desktop and mobile header actions render from the same list. Removing the overflow button sets `frame.moreActions` to false.

The initial visible sidebar/header is captured before the first prompt, so early edits are included in generation requests. Partial shell responses retain unspecified values. Legacy sidebar patches are applied to the spec once and then cleared. New saved pages restore these regions from the spec rather than their HTML snapshots. Sidebar toolbar/input controls and other component edits still use their existing paths.

Run `node softadmin-shell-browser-tests.cjs` with the same Playwright/Edge setup. It checks early edits, cross-group dragging, title/menu/action changes, AI form revisions, undo/redo, stale-HTML save/reopen, and removal of all header actions without consuming Azure quota.

## Autosaved Projects

Component selection has two explicit modes: AI decides (no forced component instruction) and Manual selection (component cards, with unavailable entries disabled). Switching modes does not rerender the mockup and remembers the last manual choice. A new manual selection is required before Generate is enabled. `selectionMode` and `componentValue` are included in snapshots, project history, and undo/redo; older snapshots infer manual mode when they already have a component selection. `softadmin-selection-mode-browser-tests.cjs` covers these transitions with mocked AI responses.

The editor automatically saves the current spec, legacy HTML/edit patches, prompt draft, chat/version history, and project logo/avatar in `localStorage` under `softadmin.mockup.projects.v1`. Edits are debounced by 500 ms and flushed before switching projects, hiding the tab, or leaving the page. The last active project reopens automatically. The history select switches immediately; the plus button starts a new project without replacing the current one. Undo/redo is cleared when switching projects.

History retains the ten most recently edited projects, with one entry per project, not per prompt. Older manual saves migrate from `softadmin.mockup.savedPages.v1`; that original key is retained as a backup. Storage failures show an unsaved warning and block switching away from unsaved changes. Revision checks reject stale writes from another tab. Storage is browser- and origin-specific: localhost, file URLs, and Netlify do not share projects. Clearing browser data removes history; this is not a cloud backup.

Run `node softadmin-project-history-tests.cjs` for storage/migration checks and `node softadmin-project-browser-tests.cjs` with Playwright/Edge for autosave, immediate reload, switching, retention, quota failure, conflicting tabs, migration, and responsive-control checks. Existing NewEdit and shell lifecycle tests now use autosave and automatic reopening.
