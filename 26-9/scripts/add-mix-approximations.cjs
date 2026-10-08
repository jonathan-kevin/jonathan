const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { require, console, process };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'add-light-dark-fallbacks.cjs'), 'utf8').split('(async () => {')[0] + ';globalThis.api={declarations,lightValue,canonical,adjacent,less,root};', ctx);
const { declarations, lightValue, canonical, adjacent, less, root } = ctx.api;
function approximate(name, value, file) {
    const light = lightValue(value);
    if (name.trim() === 'box-shadow') {
        // Keep non-mixed inset borders; omit only translucent shadow layers.
        let depth = 0, start = 0; const layers = [];
        for (let i = 0; i <= light.length; i++) {
            if (light[i] === '(') depth++;
            if (light[i] === ')') depth--;
            if (i === light.length || (light[i] === ',' && depth === 0)) { layers.push(light.slice(start, i).trim()); start = i+1; }
        }
        return ' ' + (layers.filter(layer => !layer.includes('color-mix(')).join(', ') || 'none');
    }
    return light.replace(/color-mix\(in oklch, var\(--([\w-]+)\) ([\d.]+)%, (transparent|var\(--([\w-]+)\))\)/g, (mix, source, percent, second) => {
        if (second !== 'transparent') {
            if (source === 'Green300') return 'var(--Green400)';
            throw Error('Unreviewed blend: ' + mix);
        }
        if (source === 'Sa-Color-Surface') return 'var(--Sa-Color-Surface)';
        if (source === 'Sa-Color-Primary600') return 'var(--Sa-Color-Primary50)';
        if (source === 'Sa-Color-Primary900') return 'var(--Sa-Color-Icon)';
        if (source === 'Green50') return 'var(--Green50)';
        if (source === 'Green400') return 'var(--Green200)';
        if (source === 'Purple200') return 'var(--Purple50)';
        if (source === 'Gray1300') return 'var(--Gray300)';
        if (source === 'Gray200') return 'var(--Gray50)';
        if (source === 'Black') return 'var(--Gray100)';
        if (source === 'White') return Number(percent) === 20 && name.trim() === 'border' ? 'var(--Gray200)' : 'transparent';
        if (source === 'Gray900') return name.trim() === 'outline' ? 'var(--Gray300)' : 'transparent';
        throw Error('Unreviewed mix: ' + mix + ' in ' + file);
    });
}
(async () => {
    const entry = path.join(root, 'screen.template.less');
    const before = (await less.render(fs.readFileSync(entry, 'utf8'), { filename: entry })).css;
    const plans = []; let count = 0, darkOnly = 0;
    for (const file of fs.readdirSync(root).filter(n => n.endsWith('.less'))) {
        const filename = path.join(root, file), original = fs.readFileSync(filename, 'utf8'), text = original.replace(/\r\n/g, '\n');
        const ds = await declarations(text, filename), inserts = [];
        for (let i = 0; i < ds.length; i++) {
            const d = ds[i];
            if (!d.value.includes('color-mix(')) continue;
            const light = lightValue(d.value);
            if (!light.includes('color-mix(')) { darkOnly++; continue; }
            const p = ds[i-1], expected = approximate(d.name, d.value, file);
            if (expected.includes('color-mix(')) throw Error('Unsupported syntax in ' + file);
            if (p && p.name === d.name && adjacent(text.slice(p.end, d.start)) && (canonical(p.value) === canonical(light) || canonical(p.value) === canonical(expected))) continue;
            const indent = /^[\t ]*/.exec(text.slice(text.lastIndexOf('\n', d.start-1)+1, d.start))[0];
            inserts.push({ start: d.start, value: d.name + ':' + expected + '; //Fallback\n' + indent });
        }
        let updated = text;
        for (const insert of inserts.reverse()) updated = updated.slice(0, insert.start) + insert.value + updated.slice(insert.start);
        if (original.includes('\r\n')) updated = updated.replace(/\n/g, '\r\n');
        if (inserts.length) { plans.push({ filename, original, updated }); count += inserts.length; }
    }
    for (const p of plans) {
        if (fs.readFileSync(p.filename, 'utf8') !== p.original) throw Error('Concurrent edit');
        fs.writeFileSync(p.filename, p.updated);
    }
    const after = (await less.render(fs.readFileSync(entry, 'utf8'), { filename: entry })).css;
    // Every original modern declaration must remain in order in its original block.
    const blocks = css => css.match(/[^{}]+\{[^{}]*\}/g) || [];
    const a = blocks(before), b = blocks(after);
    if (a.length !== b.length) throw Error('Rule structure changed');
    for (let i = 0; i < a.length; i++) {
        if (a[i].slice(0,a[i].indexOf('{')) !== b[i].slice(0,b[i].indexOf('{'))) throw Error('Selector changed');
        const modern = a[i].split('\n').filter(line => line.includes('color-mix('));
        const now = b[i].split('\n').filter(line => line.includes('color-mix('));
        if (JSON.stringify(modern) !== JSON.stringify(now)) throw Error('Modern mix changed');
    }
    fs.writeFileSync(path.join(root, 'screen.template.css'), after);
    console.log(JSON.stringify({ added: count, files: plans.length, darkOnlySkipped: darkOnly, compiled: true, modernMixesUnchanged: true }));
})().catch(e => { console.error(e); process.exitCode = 1; });
