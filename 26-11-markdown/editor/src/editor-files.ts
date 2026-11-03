import type { Editor } from '@tiptap/core'

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif']
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export function setMarkdownContent(editor: Editor, content: string) {
  // An empty Markdown document is valid, but beta strict parsing rejects an
  // empty node array. Let Tiptap create its normal empty paragraph instead.
  return content.trim()
    ? editor.commands.setContent(content, { contentType: 'markdown', errorOnInvalidContent: true })
    : editor.commands.clearContent()
}

// Data URLs keep this proof of concept self-contained, including downloaded files.
export async function readImage(file: File, signal?: AbortSignal): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Choose a PNG, JPEG, GIF, WebP or AVIF image.')
  if (file.size > MAX_IMAGE_SIZE) throw new Error('Images must be smaller than 5 MB.')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const abort = () => reader.abort()
    if (signal?.aborted) return reject(new Error('Image import cancelled.'))
    signal?.addEventListener('abort', abort, { once: true })
    reader.onloadend = () => signal?.removeEventListener('abort', abort)
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('The image could not be read.'))
    reader.onabort = () => reject(new Error('Image import cancelled.'))
    reader.readAsDataURL(file)
  })
}

export async function insertImages(editor: Editor, files: File[], pos: number) {
  try {
    const content = await Promise.all(files.map(async file => ({
      type: 'image', attrs: { src: await readImage(file), alt: file.name },
    })))
    if (!editor.isDestroyed) {
      editor.chain().focus().insertContentAt(Math.min(pos, editor.state.doc.content.size), content).run()
    }
  } catch (error) {
    window.alert(error instanceof Error ? error.message : 'The images could not be imported.')
  }
}

export function downloadFile(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
