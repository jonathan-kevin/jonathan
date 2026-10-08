const fs = require('fs');
const path = require('path');
const vm = require('vm');
const context = { require, console, process };
vm.createContext(context);
const helpers = fs.readFileSync(path.join(__dirname, 'add-light-dark-fallbacks.cjs'), 'utf8').split('(async () => {')[0];
vm.runInContext(helpers + ';globalThis.api={declarations,lightValue,canonical,adjacent,less,root};', context);
const { declarations, lightValue, canonical, adjacent, less, root } = context.api;

(async () => {
    const entry = path.join(root, 'screen.template.less');
    const before = (await less.render(fs.readFileSync(entry, 'utf8'), { filename: entry })).css;
    const plans = [];
    let labeled = 0, existing = 0;
    for (const name of fs.readdirSync(root).filter(n => n.endsWith('.less'))) {
        const filename = path.join(root, name), original = fs.readFileSync(filename, 'utf8');
        const text = original.replace(/\r\n/g, '\n'), ds = await declarations(text, filename), positions = [];
        for (let i = 1; i < ds.length; i++) {
            const d = ds[i], p = ds[i-1];
            if (d.value === lightValue(d.value) || p.name !== d.name || canonical(p.value) !== canonical(lightValue(d.value))) continue;
            const gap = text.slice(p.end, d.start);
            if (!adjacent(gap)) continue;
            if (gap.includes('//Fallback')) { existing++; continue; }
            if (text[p.end] !== ';') throw new Error('Missing fallback semicolon: ' + filename);
            if (text.slice(p.end+1, d.start).trim()) throw new Error('Unexpected content between pair: ' + filename);
            if (!text.slice(p.end+1, d.start).includes('\n')) throw new Error('Same-line declaration: ' + filename);
            positions.push(p.end+1);
        }
        if (!positions.length) continue;
        let updated = text;
        for (const position of positions.reverse()) updated = updated.slice(0, position) + ' //Fallback' + updated.slice(position);
        if (original.includes('\r\n')) updated = updated.replace(/\n/g, '\r\n');
        plans.push({ filename, original, updated });
        labeled += positions.length;
    }
    // Comment-only bulk rewrite. No backup or production build step is added.
    for (const p of plans) {
        if (fs.readFileSync(p.filename, 'utf8') !== p.original) throw new Error('Concurrent edit: ' + p.filename);
        fs.writeFileSync(p.filename, p.updated);
    }
    const after = (await less.render(fs.readFileSync(entry, 'utf8'), { filename: entry })).css;
    if (before !== after) throw new Error('Comments changed generated CSS');
    console.log(JSON.stringify({ labeled, files: plans.length, alreadyLabeled: existing, compiledCssUnchanged: true, savedCssMatches: after === fs.readFileSync(path.join(root, 'screen.template.css'), 'utf8') }));
})().catch(e => { console.error(e); process.exitCode = 1; });
