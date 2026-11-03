import { Markdown } from '@tiptap/markdown'
import { TableKit } from '@tiptap/extension-table'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Placeholder } from '@tiptap/extension-placeholder'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Emoji, emojis } from '@tiptap/extension-emoji'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import { InvisibleCharacters } from '@tiptap/extension-invisible-characters'
import { UniqueID } from '@tiptap/extension-unique-id'
import { FileHandler } from '@tiptap/extension-file-handler'
import { TaskItem } from '@tiptap/extension-list'
import { common, createLowlight } from 'lowlight'
import { IMAGE_TYPES, insertImages } from './editor-files'

export const lowlight = createLowlight(common)
// Keep emoji rendering local as well; unsupported emoji use the system font's
// fallback instead of fetching Apple's image assets from a CDN.
const localEmojis = emojis.map(({ fallbackImage: _fallback, ...emoji }) => emoji)

// The current task-item node view uses a visually hidden accessibility label.
// The supplied Simple Editor CSS still expects a separate decorative span.
// Restore that DOM hook without changing Tiptap's styles or accessibility label.
export const TemplateTaskItem = TaskItem.extend({
  addNodeView() {
    const render = this.parent!()!
    return props => {
      const view = render(props)
      const checkbox = (view.dom as HTMLElement).querySelector('input[type="checkbox"]')
      const marker = document.createElement('span')
      marker.setAttribute('aria-hidden', 'true')
      checkbox?.after(marker)
      return view
    }
  },
})

// Emoji's built-in Markdown renderer outputs shortcodes. Add the matching parser
// so exporting and reopening Markdown preserves the actual emoji node.
const MarkdownEmoji = Emoji.extend({
  markdownTokenizer: {
    name: 'emoji',
    level: 'inline',
    start: text => text.indexOf(':'),
    tokenize: src => {
      const match = /^:([a-zA-Z0-9_+-]+):/.exec(src)
      if (!match) return undefined
      const item = emojis.find(emoji => emoji.name === match[1] || emoji.shortcodes.includes(match[1]))
      if (!item) return undefined
      return { type: 'emoji', raw: match[0], name: item.name }
    },
  },
  parseMarkdown: token => ({ type: 'emoji', attrs: { name: token.name } }),
})

export const pocExtensions = [
  Markdown,
  TableKit.configure({ table: { resizable: true } }),
  CodeBlockLowlight.configure({ lowlight }),
  Placeholder.configure({ placeholder: 'Start writing, or use the tools to insert content…' }),
  CharacterCount,
  MarkdownEmoji.configure({ emojis: localEmojis, enableEmoticons: true }),
  Mathematics.configure({ katexOptions: { throwOnError: false } }),
  Details.configure({
    persist: true,
    renderToggleButton: ({ element, isOpen }) => {
      element.textContent = isOpen ? '▾' : '▸'
      element.setAttribute('aria-label', isOpen ? 'Collapse details content' : 'Expand details content')
      element.setAttribute('aria-expanded', String(isOpen))
    },
  }),
  DetailsContent,
  DetailsSummary,
  InvisibleCharacters.configure({ visible: false }),
  UniqueID.configure({ types: ['heading', 'paragraph', 'table', 'image', 'codeBlock', 'details'] }),
  FileHandler.configure({
    allowedMimeTypes: IMAGE_TYPES,
    consumePasteEvent: true,
    onPaste: (editor, files) => { void insertImages(editor, files, editor.state.selection.from) },
    onDrop: (editor, files, pos) => { void insertImages(editor, files, pos) },
  }),
]

export const initialMarkdown = `# Markdown playground

Write naturally, select some text to format it, or open **More tools** to explore.

## Try it out

- [x] Edit visually with Tiptap
- [ ] Insert a table, image or formula
- [ ] Download this document as Markdown

> You can also paste Markdown, drop an image, or use the Markdown source view.

\`\`\`typescript
const message: string = 'Hello, Markdown!'
console.log(message)
\`\`\`

Select **Add** in the toolbar to insert an image. Images stay in your browser.
`
