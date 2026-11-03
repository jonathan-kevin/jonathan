import { useEffect, useRef, useState } from 'react'
import { type Editor, useEditorState } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import { DragHandle } from '@tiptap/extension-drag-handle-react'
import { emojis } from '@tiptap/extension-emoji'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'
import { Button } from '@/components/tiptap-ui-primitive/button'
import { Toolbar, ToolbarGroup } from '@/components/tiptap-ui-primitive/toolbar'
import { MarkButton } from '@/components/tiptap-ui/mark-button'
import { HeadingButton } from '@/components/tiptap-ui/heading-button'
import { ListButton } from '@/components/tiptap-ui/list-button'
import { LinkPopover } from '@/components/tiptap-ui/link-popover'
import { downloadFile, setMarkdownContent } from './editor-files'
import { lowlight } from './poc-extensions'

type Props = { editor: Editor }

export function PocTools({ editor }: Props) {
  const [source, setSource] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [sourceError, setSourceError] = useState('')
  const [emoji, setEmoji] = useState('smile')
  const fileInput = useRef<HTMLInputElement>(null)
  const sourceDialog = useRef<HTMLDialogElement>(null)
  const status = useEditorState({
    editor,
    selector: ({ editor }) => ({
      words: editor.storage.characterCount.words(),
      characters: editor.storage.characterCount.characters(),
      table: editor.isActive('table'),
      code: editor.isActive('codeBlock'),
      language: editor.getAttributes('codeBlock').language || '',
      details: editor.isActive('details'),
      invisibles: editor.storage.invisibleCharacters.visibility(),
      math: editor.isActive('inlineMath') || editor.isActive('blockMath'),
      nodeID: editor.getAttributes(editor.isActive('heading') ? 'heading' : 'paragraph')['data-id'],
    }),
  })

  useEffect(() => {
    if (source !== null && !sourceDialog.current?.open) sourceDialog.current?.showModal()
  }, [source])

  const closeSource = () => {
    sourceDialog.current?.close()
    setSource(null)
    editor.commands.focus()
  }

  const run = (action: () => boolean) => {
    setMessage(action() ? '' : 'Place the cursor in the content you want to change, then try again.')
  }

  const insertionChain = () => {
    const chain = editor.chain().focus()
    if (editor.state.selection instanceof NodeSelection) chain.setTextSelection(editor.state.selection.to)
    return chain
  }

  const editMath = (block: boolean) => {
    const type = block ? 'blockMath' : 'inlineMath'
    const active = editor.isActive(type)
    const latex = window.prompt('LaTeX formula', active ? editor.getAttributes(type).latex : 'E = mc^2')
    if (!latex?.trim()) return
    const chain = active ? editor.chain().focus() : insertionChain()
    run(() => active
      ? (block ? chain.updateBlockMath({ latex }) : chain.updateInlineMath({ latex })).run()
      : (block ? chain.insertBlockMath({ latex }) : chain.insertInlineMath({ latex })).run())
  }

  const insertSection = () => {
    // Inserting a new block after a selected image/formula must not replace it.
    return insertionChain().insertContent({
      type: 'details', attrs: { open: true }, content: [
        { type: 'detailsSummary', content: [{ type: 'text', text: 'Expandable section' }] },
        { type: 'detailsContent', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Write the section content here.' }] }] },
      ],
    }).run()
  }

  const moveBlock = (direction: -1 | 1) => {
    const { state, view } = editor
    const { $from } = state.selection
    // Keyboard-accessible alternative to the drag handle, for top-level blocks.
    const from = $from.depth ? $from.before(1) : $from.pos
    const index = $from.index(0)
    const node = state.doc.maybeChild(index)
    if (!node) return
    if ((direction < 0 && index === 0) || (direction > 0 && index >= state.doc.childCount - 1)) return
    const adjacent = state.doc.child(index + direction)
    const target = direction < 0 ? from - adjacent.nodeSize : from + adjacent.nodeSize
    const transaction = state.tr.delete(from, from + node.nodeSize).insert(target, node)
    transaction.setSelection(TextSelection.near(transaction.doc.resolve(target + 1)))
    view.dispatch(transaction.scrollIntoView())
    view.focus()
  }

  return <>
    <div role="group" aria-label="Document tools">
      <button type="button" onClick={() => fileInput.current?.click()}>Open file</button>{' '}
      <button type="button" onClick={() => { setSourceError(''); setMessage(''); setSource(editor.getMarkdown()) }}>Markdown source</button>{' '}
      <button type="button" onClick={() => downloadFile(editor.getMarkdown(), 'document.md', 'text/markdown;charset=utf-8')}>Download Markdown</button>{' '}
      <button type="button" onClick={() => downloadFile(JSON.stringify(editor.getJSON(), null, 2), 'document.json', 'application/json')}>Download editor JSON</button>
      <input ref={fileInput} type="file" accept=".md,.markdown,.txt,.json" aria-label="Open Markdown or editor JSON" hidden onChange={async event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        try {
          const text = await file.text()
          const content = file.name.toLowerCase().endsWith('.json') ? JSON.parse(text) : text
          if (typeof content !== 'string') editor.schema.nodeFromJSON(content).check()
          if (typeof content === 'string') setMarkdownContent(editor, content)
          else editor.commands.setContent(content, { contentType: 'json', errorOnInvalidContent: true })
          setMessage(`Opened ${file.name}. Undo restores the previous document.`)
        } catch {
          setMessage('This file could not be opened. Choose a Markdown file or valid editor JSON.')
        }
      }} />
    </div>

    <details>
      <summary>More tools</summary>
      <fieldset>
        <legend>Tables</legend>
        <button type="button" onClick={() => run(() => insertionChain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}>Insert table</button>{' '}
        <button type="button" disabled={!status.table} onClick={() => run(() => editor.chain().focus().addRowAfter().run())}>Add row</button>{' '}
        <button type="button" disabled={!status.table} onClick={() => run(() => editor.chain().focus().deleteRow().run())}>Delete row</button>{' '}
        <button type="button" disabled={!status.table} onClick={() => run(() => editor.chain().focus().addColumnAfter().run())}>Add column</button>{' '}
        <button type="button" disabled={!status.table} onClick={() => run(() => editor.chain().focus().deleteColumn().run())}>Delete column</button>{' '}
        <button type="button" disabled={!status.table} onClick={() => run(() => editor.chain().focus().toggleHeaderRow().run())}>Toggle header</button>{' '}
        <button type="button" disabled={!status.table} onClick={() => run(() => editor.chain().focus().mergeOrSplit().run())}>Merge / split cells</button>{' '}
        <button type="button" disabled={!status.table} onClick={() => run(() => editor.chain().focus().deleteTable().run())}>Delete table</button>
      </fieldset>
      <fieldset>
        <legend>Insert content</legend>
        <label>Emoji <input list="emoji-options" value={emoji} onChange={event => setEmoji(event.target.value)} /></label>{' '}
        <datalist id="emoji-options">{emojis.map(item => <option key={item.name} value={item.shortcodes[0]}>{item.emoji} {item.name}</option>)}</datalist>
        <button type="button" onClick={() => run(() => editor.chain().focus().setEmoji(emoji.replace(/^:|:$/g, '')).run())}>Insert emoji</button>{' '}
        <button type="button" onClick={() => editMath(false)}>Inline formula</button>{' '}
        <button type="button" onClick={() => editMath(true)}>Block formula</button>{' '}
        <button type="button" onClick={() => run(insertSection)}>Collapsible section</button>{' '}
        <button type="button" disabled={!status.details} onClick={() => run(() => editor.chain().focus().unsetDetails().run())}>Unwrap section</button>{' '}
        <button type="button" onClick={() => run(() => insertionChain().setHorizontalRule().run())}>Horizontal rule</button>
      </fieldset>
      <fieldset>
        <legend>Editing</legend>
        <button type="button" aria-pressed={status.invisibles} onClick={() => editor.commands.toggleInvisibleCharacters()}>Invisible characters</button>{' '}
        <button type="button" onClick={() => moveBlock(-1)}>Move block up</button>{' '}
        <button type="button" onClick={() => moveBlock(1)}>Move block down</button>{' '}
        <label>Code language <select value={status.language} disabled={!status.code} onChange={event => editor.chain().focus().updateAttributes('codeBlock', { language: event.target.value || null }).run()}>
          <option value="">Auto detect</option>
          {lowlight.listLanguages().map(language => <option key={language} value={language}>{language}</option>)}
        </select></label>
        <p>Block ID: <code>{status.nodeID || 'Select a paragraph or heading'}</code></p>
      </fieldset>
    </details>
    <p><output aria-label="Document count">{status.words} words · {status.characters} characters</output></p>
    {message && <p role="status">{message}</p>}

    <dialog ref={sourceDialog} aria-label="Markdown source" onCancel={event => { event.preventDefault(); closeSource() }}>
      <h2>Markdown source</h2>
      <p>Markdown can simplify rich formatting and tables. Editor JSON preserves the complete document.</p>
      <label>Markdown<br /><textarea rows={18} cols={32} value={source ?? ''} onChange={event => setSource(event.target.value)} /></label>
      {sourceError && <p role="alert">{sourceError}</p>}
      <p>
        <button type="button" onClick={() => {
          try {
            setMarkdownContent(editor, source ?? '')
            closeSource()
            setMessage('Markdown applied. Undo restores the previous document.')
          } catch { setSourceError('The Markdown could not be applied. Your current document is unchanged.'); }
        }}>Apply Markdown</button>{' '}
        <button type="button" onClick={closeSource}>Cancel</button>
      </p>
    </dialog>
  </>
}

export function ContextTools({ editor }: Props) {
  return <>
    <BubbleMenu editor={editor} options={{ placement: 'top' }}>
      <Toolbar variant="floating" aria-label="Selection formatting">
        <ToolbarGroup>
          <MarkButton type="bold" /><MarkButton type="italic" /><MarkButton type="strike" /><LinkPopover />
        </ToolbarGroup>
      </Toolbar>
    </BubbleMenu>
    <FloatingMenu editor={editor} options={{ placement: 'right' }}>
      <Toolbar variant="floating" aria-label="Insert into empty paragraph">
        <ToolbarGroup><HeadingButton level={2} /><ListButton type="bulletList" /><ListButton type="taskList" /></ToolbarGroup>
      </Toolbar>
    </FloatingMenu>
    <DragHandle editor={editor}>
      <Button type="button" aria-label="Drag to move block" title="Drag to move block">⠿</Button>
    </DragHandle>
  </>
}
