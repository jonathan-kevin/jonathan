import { test, expect, type Page, type FrameLocator } from '@playwright/test'
import { readFile } from 'node:fs/promises'

let ui: FrameLocator
let errors: string[]

test.beforeEach(async ({ page }) => {
  errors = []
  page.on('pageerror', error => errors.push(error.message))
  // The proof of concept must load with no third-party runtime requests.
  await page.route('**/*', route => new URL(route.request().url()).hostname === 'localhost'
    ? route.continue() : route.abort())
  await page.goto('index.html')
  ui = page.frameLocator('markdown-editor iframe')
  await expect(ui.locator('.tiptap[contenteditable="true"]')).toBeVisible()
})

test.afterEach(() => expect(errors).toEqual([]))

async function setMarkdown(text: string) {
  await ui.getByRole('button', { name: 'Markdown source', exact: true }).click()
  await ui.getByRole('textbox', { name: 'Markdown', exact: true }).fill(text)
  await ui.getByRole('button', { name: 'Apply Markdown', exact: true }).click()
}

async function markdown() {
  await ui.getByRole('button', { name: 'Markdown source', exact: true }).click()
  const value = await ui.getByRole('textbox', { name: 'Markdown', exact: true }).inputValue()
  await ui.getByRole('button', { name: 'Cancel', exact: true }).click()
  return value
}

async function moreTools() { await ui.getByText('More tools', { exact: true }).click() }

test('loads inside the existing page, edits, formats, counts and downloads Markdown', async ({ page }) => {
  await expect(ui.getByRole('heading', { name: 'Markdown playground' })).toBeVisible()
  await setMarkdown('# Test document\n\nHello world')
  const editor = ui.locator('.tiptap[contenteditable="true"]')
  await editor.getByText('Hello world', { exact: true }).click()
  await page.keyboard.press('End')
  await page.keyboard.type(' from Tiptap')
  await expect(ui.getByLabel('Document count')).toContainText('6 words')
  await page.keyboard.press('Control+Shift+ArrowLeft')
  await page.keyboard.press('Control+b')
  expect(await markdown()).toContain('**Tiptap**')
  const downloadPromise = page.waitForEvent('download')
  await ui.getByRole('button', { name: 'Download Markdown', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('document.md')
  await page.screenshot({ path: 'test-results/editor-desktop.png', fullPage: true })
})

test('task lists, tables and highlighted code survive Markdown round trips', async () => {
  const input = '# Features\n\n- [ ] Pending\n- [x] Complete\n\n| Name | Status |\n| --- | --- |\n| Demo | Ready |\n\n```typescript\nconst answer: number = 42\n```'
  await setMarkdown(input)
  await expect(ui.locator('.tiptap input[type="checkbox"]')).toHaveCount(2)
  await ui.locator('.tiptap label:has(input[type="checkbox"]) span[aria-hidden="true"]').first().click()
  await expect(ui.locator('.tiptap input[type="checkbox"]').first()).toBeChecked()
  await expect(ui.locator('.tiptap table')).toHaveCount(1)
  await expect(ui.locator('.tiptap pre .hljs-keyword').first()).toBeVisible()
  await moreTools()
  await ui.locator('.tiptap td').first().click()
  await ui.getByRole('button', { name: 'Add row', exact: true }).click()
  await expect(ui.locator('.tiptap table tr')).toHaveCount(3)
  const output = await markdown()
  expect(output).toContain('[x] Pending')
  expect(output).toContain('```typescript')
  await setMarkdown(output)
  await expect(ui.locator('.tiptap table tr')).toHaveCount(3)
})

test('emoji, math, details and unique IDs survive round trips', async ({ page }) => {
  await setMarkdown('Start here')
  await moreTools()
  await ui.locator('.tiptap p').first().click()
  await page.keyboard.press('End')
  await ui.getByRole('button', { name: 'Insert emoji', exact: true }).click()
  await expect(ui.locator('.tiptap [data-type="emoji"]')).toHaveCount(1)
  page.once('dialog', dialog => dialog.accept('x^2 + y^2 = z^2'))
  await ui.getByRole('button', { name: 'Block formula', exact: true }).click()
  await expect(ui.locator('.tiptap .katex')).toHaveCount(1)
  await ui.getByRole('button', { name: 'Collapsible section', exact: true }).click()
  await expect(ui.locator('.tiptap [data-type="details"]')).toHaveCount(1)
  const output = await markdown()
  expect(output).toContain(':smile:')
  expect(output).toContain('x^2 + y^2 = z^2')
  await setMarkdown(output)
  await expect(ui.locator('.tiptap [data-type="emoji"]')).toHaveCount(1)
  await expect(ui.locator('.tiptap .katex')).toHaveCount(1)
  await expect(ui.locator('.tiptap [data-type="details"]')).toHaveCount(1)
  await expect(ui.locator('.tiptap p').first()).toHaveAttribute('data-id', /.+/)
  await ui.getByRole('button', { name: 'Collapse details content' }).click()
  await expect(ui.locator('.tiptap [data-type="detailsContent"]')).toBeHidden()
})

test('file import handles Markdown, rejects invalid JSON, and images are self-contained', async ({ page }) => {
  await ui.getByLabel('Open Markdown or editor JSON').setInputFiles({ name: 'sample.md', mimeType: 'text/markdown', buffer: Buffer.from('# Imported\n\nLocal document') })
  await expect(ui.getByRole('heading', { name: 'Imported' })).toBeVisible()
  await ui.getByLabel('Open Markdown or editor JSON').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{invalid') })
  await expect(ui.locator('p[role="status"]')).toContainText('could not be opened')
  await expect(ui.getByRole('heading', { name: 'Imported' })).toBeVisible()
  await ui.locator('.tiptap p').first().click()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await ui.getByRole('button', { name: /add image/i }).click()
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n1cAAAAASUVORK5CYII=', 'base64')
  await ui.locator('.tiptap input[type="file"]').setInputFiles({ name: 'pixel.png', mimeType: 'image/png', buffer: png })
  await expect(ui.locator('.tiptap img')).toHaveAttribute('src', /^data:image\/png;base64,/)
  const output = await markdown()
  expect(output).toContain('data:image/png;base64,')
  await setMarkdown(output)
  await expect(ui.locator('.tiptap img')).toHaveAttribute('src', /^data:image\/png;base64,/)
})

test('search and replace, invisible characters, source cancel and block reordering', async ({ page }) => {
  await setMarkdown('First paragraph\n\nSecond paragraph')
  await moreTools()
  await ui.locator('.tiptap p').nth(1).click()
  await ui.getByRole('button', { name: 'Move block up', exact: true }).click()
  await expect(ui.locator('.tiptap p').first()).toHaveText('Second paragraph')
  await ui.getByRole('button', { name: 'Invisible characters', exact: true }).click()
  await expect(ui.getByRole('button', { name: 'Invisible characters', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(ui.locator('.tiptap .tiptap-invisible-character').first()).toBeAttached()
  await ui.getByRole('button', { name: 'Markdown source', exact: true }).click()
  await ui.getByRole('textbox', { name: 'Markdown', exact: true }).fill('Discard this change')
  await ui.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(ui.locator('.tiptap p').first()).toContainText('Second paragraph')
  await ui.getByRole('button', { name: /search and replace/i }).click()
  await ui.getByRole('textbox', { name: 'Search', exact: true }).fill('paragraph')
  await ui.getByRole('textbox', { name: 'Replace', exact: true }).fill('section')
  await expect(ui.getByRole('button', { name: 'Replace all results' })).toBeEnabled()
  await ui.getByRole('button', { name: 'Replace all results' }).click()
  await expect(ui.locator('.tiptap p').first()).toContainText('Second section')
  await page.screenshot({ path: 'test-results/editor-search.png', fullPage: true })
})

test('mobile renders the default responsive toolbar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(ui.locator('.tiptap[contenteditable="true"]')).toBeVisible()
  await setMarkdown('Mobile editing')
  await expect(ui.locator('.tiptap p').first()).toHaveText('Mobile editing')
  await expect(ui.getByRole('button', { name: 'Undo', exact: true })).toBeInViewport({ ratio: 1 })
  await page.screenshot({ path: 'test-results/editor-mobile.png', fullPage: true })
})

test('contextual menus, drag handle, placeholder and theme toggle work', async ({ page }) => {
  await setMarkdown('Select this text')
  const paragraph = ui.locator('.tiptap p').first()
  await paragraph.hover()
  await expect(ui.getByRole('button', { name: 'Drag to move block' })).toBeVisible()
  await paragraph.click()
  await page.keyboard.press('Home')
  await page.keyboard.press('Shift+End')
  await expect(ui.getByRole('toolbar', { name: 'Selection formatting' })).toBeVisible()
  await setMarkdown('')
  await ui.locator('.tiptap').click()
  await expect(ui.getByRole('toolbar', { name: 'Insert into empty paragraph' })).toBeVisible()
  await expect(ui.locator('.tiptap p').first()).toHaveAttribute('data-placeholder', /Start writing/)
  await ui.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(ui.locator('html')).toHaveClass('dark')
  await page.screenshot({ path: 'test-results/editor-dark.png', fullPage: true })
})

test('File Handler imports pasted and dropped images and JSON preserves content', async ({ page }) => {
  await setMarkdown('Images')
  const target = ui.locator('.tiptap')
  for (const action of ['paste', 'drop']) {
    await target.evaluate((element, action) => {
      const bytes = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n1cAAAAASUVORK5CYII='), c => c.charCodeAt(0))
      const transfer = new DataTransfer()
      transfer.items.add(new File([bytes], `${action}.png`, { type: 'image/png' }))
      const rect = element.getBoundingClientRect()
      const event = action === 'paste'
        ? new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true })
        : new DragEvent('drop', { dataTransfer: transfer, clientX: rect.left + 30, clientY: rect.top + 20, bubbles: true, cancelable: true })
      element.dispatchEvent(event)
    }, action)
    await expect(ui.locator(`.tiptap img[alt="${action}.png"]`)).toHaveCount(1)
  }
  const downloadPromise = page.waitForEvent('download')
  await ui.getByRole('button', { name: 'Download editor JSON' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('document.json')
  await setMarkdown('Replaced')
  await ui.getByLabel('Open Markdown or editor JSON').setInputFiles({
    name: download.suggestedFilename(), mimeType: 'application/json', buffer: await readFile((await download.path())!),
  })
  await expect(ui.locator('.tiptap img')).toHaveCount(2)
})
