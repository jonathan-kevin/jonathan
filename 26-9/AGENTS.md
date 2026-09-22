# LESS conventions

## The styled component owns the rule

**Place a rule with the element it styles, not with the ancestor whose state triggers it.** The ancestor supplies the condition; the affected component owns the declarations.

- Keep a component's base styles, states, and context-dependent overrides together under that component's selector.
- When an ancestor's class, state, or layout changes a descendant component, nest the ancestor condition inside the affected component's block using `&`.
- Do not nest a separately named component's styling under its ancestor merely because that ancestor triggers the change.
- Use `.ancestor &` for ancestor conditions. For a component's own class selector, both `.modifier&` and `&.modifier` match a modifier class on the same element; prefer `.modifier&` here for consistency. There must be no space between `&` and the modifier for a same-element condition. The `&` is essential: omitting it changes which element the selector targets.
- This is a rule about ownership, not a ban on nesting. Component-internal structure may remain nested, but separately named components should own their own styles.
- Preserve selector meaning, specificity, and cascade order when moving existing rules. Do not refactor unrelated styles unless requested.

Preferred:

```less
.saPillRemoveButton {
	transform: scale(0);

	.saChatContext li:is(:hover, :focus) & {
		transform: scale(1);
	}
}
```

Avoid:

```less
.saChatContext {
	li:is(:hover, :focus) .saPillRemoveButton {
		transform: scale(1);
	}
}
```

Before finishing a LESS change, ask: **If I want to understand this component's appearance and behavior, are its rules grouped under its own selector, or scattered through its ancestors?**
