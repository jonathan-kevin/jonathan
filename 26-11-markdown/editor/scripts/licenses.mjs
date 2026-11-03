import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'))
const notices = ['Third-party notices for the browser editor. See each package license below.']
for (const [location, info] of Object.entries(lock.packages)) {
  if (!location || info.dev) continue
  const directory = path.join(root, location)
  if (!fs.existsSync(directory)) continue
  const pkg = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'))
  notices.push(`\n${'='.repeat(72)}\n${pkg.name} ${pkg.version}\nLicense: ${pkg.license ?? info.license ?? 'See package'}\n`)
  for (const file of fs.readdirSync(directory).filter(name => /^(licen[sc]e|copying|ofl)([.-].*)?$/i.test(name))) {
    const source = path.join(directory, file)
    if (fs.statSync(source).isFile()) notices.push(fs.readFileSync(source, 'utf8'))
  }
}
fs.mkdirSync(path.join(root, 'public/licenses'), { recursive: true })
fs.writeFileSync(path.join(root, 'public/licenses/dependencies.txt'), notices.join('\n'))
