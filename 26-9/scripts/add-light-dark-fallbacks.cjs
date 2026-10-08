const fs = require('fs');
const path = require('path');
const os = require('os');
const less = require('C:/Users/jonathan.kevin/AppData/Local/npm-cache/_npx/92e0add816544f8c/node_modules/less');
const root = '\\\\ms222\\CssTemplate';
const mode = process.argv[2] || 'audit';

// Preserve strings, comments and nested function arguments verbatim.
function skipLiteral(text, i) {
    if (text[i] === '"' || text[i] === "'") {
        const quote = text[i++];
        while (i < text.length) {
            if (text[i] === '\\') i += 2;
            else if (text[i++] === quote) return i;
        }
        throw new Error('Unterminated string');
    }
    if (text.slice(i, i + 2) === '/*') {
        const end = text.indexOf('*/', i + 2);
        if (end < 0) throw new Error('Unterminated comment');
        return end + 2;
    }
    if (text.slice(i, i + 2) === '//') {
        const end = text.indexOf('\n', i + 2);
        return end < 0 ? text.length : end;
    }
    return i;
}

function lightValue(text) {
    let result = '';
    for (let i = 0; i < text.length;) {
        const literalEnd = skipLiteral(text, i);
        if (literalEnd !== i) {
            result += text.slice(i, literalEnd);
            i = literalEnd;
            continue;
        }
        const match = /^light-dark\s*\(/i.exec(text.slice(i));
        if (match && !/[\w-]/.test(text[i - 1] || '')) {
            const start = i + match[0].length;
            let depth = 1, comma = -1, end = start;
            for (; end < text.length; end++) {
                const skipped = skipLiteral(text, end);
                if (skipped !== end) { end = skipped - 1; continue; }
                if (text[end] === '(') depth++;
                else if (text[end] === ')' && --depth === 0) break;
                else if (text[end] === ',' && depth === 1) {
                    if (comma >= 0) throw new Error('Extra light-dark argument');
                    comma = end;
                }
            }
            if (depth !== 0 || comma < 0) throw new Error('Invalid light-dark');
            result += lightValue(text.slice(start, comma).trim());
            i = end + 1;
        } else result += text[i++];
    }
    return result;
}

async function declarations(text, filename) {
    const tree = await less.parse(text, { filename, processImports: false });
    const found = [], seen = new WeakSet();
    function walk(node) {
        if (!node || typeof node !== 'object' || seen.has(node)) return;
        seen.add(node);
        if (node.type === 'Declaration') {
            const start = node._index;
            let depth = 0, end = start;
            for (; end < text.length; end++) {
                const skipped = skipLiteral(text, end);
                if (skipped !== end) { end = skipped - 1; continue; }
                if (text.slice(end, end + 2) === '@{') {
                    end = text.indexOf('}', end + 2);
                    if (end < 0) throw new Error('Invalid interpolation');
                    continue;
                }
                if (text[end] === '(' || text[end] === '[') depth++;
                else if (text[end] === ')' || text[end] === ']') depth--;
                else if (depth === 0 && (text[end] === ';' || text[end] === '}')) break;
            }
            const raw = text.slice(start, end);
            const colon = raw.indexOf(':');
            if (colon >= 0) found.push({ start, end, raw, name: raw.slice(0, colon), value: raw.slice(colon + 1) });
        }
        for (const [key, value] of Object.entries(node)) {
            if (key === 'parent') continue;
            if (Array.isArray(value)) value.forEach(walk);
            else walk(value);
        }
    }
    walk(tree);
    return found.sort((a, b) => a.start - b.start);
}

const canonical = value => value.replace(/\s+/g, ' ').trim();
const adjacent = gap => /^\s*;?\s*$/.test(gap.replace(/\/\/Fallback[^\r\n]*/g, ''));
async function stripFallbacks(css, filename) {
    const decls = await declarations(css, filename);
    const removals = [];
    for (let i = 1; i < decls.length; i++) {
        const prev = decls[i - 1], current = decls[i];
        if (current.value !== lightValue(current.value) &&
            prev.name === current.name &&
            canonical(prev.value) === canonical(lightValue(current.value)) &&
            adjacent(css.slice(prev.end, current.start))) {
            removals.push([prev.start, current.start]);
        }
    }
    for (const [start, end] of removals.reverse()) css = css.slice(0, start) + css.slice(end);
    return css;
}

(async () => {
    const tests = [
        ['light-dark(var(--Gray900), var(--White))', 'var(--Gray900)'],
        ['color-mix(in srgb, light-dark(var(--Gray900), var(--Black)) 7%, transparent)', 'color-mix(in srgb, var(--Gray900) 7%, transparent)'],
        ['light-dark(rgb(1, 2, 3), rgb(4, 5, 6)) !important', 'rgb(1, 2, 3) !important'],
        ['light-dark(light-dark(red, blue), black)', 'red'],
        ['"light-dark(red, blue)"', '"light-dark(red, blue)"'],
        ['linear-gradient(light-dark(red, blue), light-dark(white, black))', 'linear-gradient(red, white)']
    ];
    for (const [input, expected] of tests) if (lightValue(input) !== expected) throw new Error('Scanner test failed');
    const entry = path.join(root, 'screen.template.less');
    const before = (await less.render(fs.readFileSync(entry, 'utf8'), { filename: entry })).css;
    const planned = [], exceptions = [], files = fs.readdirSync(root).filter(n => n.endsWith('.less'));
    let count = 0;
    for (const name of files) {
        const filename = path.join(root, name), original = fs.readFileSync(filename, 'utf8');
        const text = original.replace(/\r\n/g, '\n');
        const decls = await declarations(text, filename), inserts = [];
        for (let i = 0; i < decls.length; i++) {
            const d = decls[i], fallbackValue = lightValue(d.value);
            if (d.value === fallbackValue) continue;
            if (d.name.trim().startsWith('--') || d.name.trim().startsWith('@')) {
                exceptions.push(name + ': ' + d.name); continue;
            }
            const prev = decls[i - 1];
            if (prev && prev.name === d.name && canonical(prev.value) === canonical(fallbackValue) &&
                adjacent(text.slice(prev.end, d.start))) continue;
            const indent = /^[\t ]*/.exec(text.slice(text.lastIndexOf('\n', d.start - 1) + 1, d.start))[0];
            inserts.push({ start: d.start, value: d.name + ':' + fallbackValue + ';\n' + indent });
        }
        if (!inserts.length) continue;
        count += inserts.length;
        let updated = text;
        for (const insert of inserts.reverse()) updated = updated.slice(0, insert.start) + insert.value + updated.slice(insert.start);
        if (original.includes('\r\n')) updated = updated.replace(/\n/g, '\r\n');
        planned.push({ filename, original, updated, count: inserts.length });
    }
    console.log(JSON.stringify({ mode, missingFallbacks: count, files: planned.map(p => ({ name: path.basename(p.filename), count: p.count })), exceptions }, null, 2));
    if (exceptions.length) throw new Error('Custom-property exceptions require review');
    if (mode === 'patch') {
        const patch = ['*** Begin Patch'];
        for (const p of planned) {
            patch.push('*** Update File: ' + p.filename.replace(/\\/g, '/'));
            const oldLines = p.original.replace(/\r\n/g, '\n').split('\n');
            const newLines = p.updated.replace(/\r\n/g, '\n').split('\n');
            let next = 0;
            for (const line of oldLines) {
                const added = [];
                while (newLines[next] !== line && next < newLines.length) added.push(newLines[next++]);
                if (added.length) patch.push('@@', ...added.map(value => '+' + value), ' ' + line);
                next++;
            }
        }
        patch.push('*** End Patch');
        fs.writeFileSync(path.join(__dirname, 'remaining-light-dark-fallbacks.patch'), patch.join('\n') + '\n');
        console.log('Prepared remaining-light-dark-fallbacks.patch');
        return;
    }
    if (mode === 'verify') {
        const original = fs.readFileSync(path.join(process.argv[3], 'before.css'), 'utf8');
        if (await stripFallbacks(original, entry) !== await stripFallbacks(before, entry)) throw new Error('Original CSS differs');
        console.log('PASS: original pre-edit CSS preserved.');
        return;
    }
    if (mode !== 'apply') return;
    const backup = fs.mkdtempSync(path.join(os.tmpdir(), 'less-light-fallbacks-'));
    fs.writeFileSync(path.join(backup, 'before.css'), before);
    for (const p of planned) fs.writeFileSync(path.join(backup, path.basename(p.filename)), p.original);
    console.log('Backup: ' + backup);
    // Bulk mechanical source rewrite; do not overwrite concurrent user edits.
    for (const p of planned) {
        if (fs.readFileSync(p.filename, 'utf8') !== p.original) throw new Error('Concurrent edit: ' + p.filename);
        try { fs.writeFileSync(p.filename, p.updated); }
        catch (error) { console.log('BLOCKED: ' + p.filename + ' ' + error.code); }
    }
    const after = (await less.render(fs.readFileSync(entry, 'utf8'), { filename: entry })).css;
    const baseline = await stripFallbacks(before, entry);
    const stripped = await stripFallbacks(after, entry);
    if (baseline !== stripped) throw new Error('Modern CSS changed beyond generated fallbacks; review backup before.css');
    console.log('PASS: compiled CSS unchanged after removing fallback copies.');
})();
