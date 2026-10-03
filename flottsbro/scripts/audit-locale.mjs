import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const locale = ts.createSourceFile("locale.ts", read("src/locale.ts"), ts.ScriptTarget.Latest, true);
const known = new Set();

function visitLocale(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(locale) === "english" && ts.isObjectLiteralExpression(node.initializer)) {
    for (const property of node.initializer.properties) {
      if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.name)) known.add(property.name.text);
    }
  }
  ts.forEachChild(node, visitLocale);
}
visitLocale(locale);

const candidates = new Map();
const normalize = (value) => value.replace(/\s+/g, " ").trim();
function add(value, file, source, node) {
  const phrase = normalize(value);
  if (!phrase || !/[A-Za-zÅÄÖåäö]{2}/.test(phrase) || /^[\W\d]+$/.test(phrase)) return;
  if (known.has(phrase)) return;
  if (!candidates.has(phrase)) {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    candidates.set(phrase, `${file}:${line + 1}`);
  }
}

for (const file of ["src/main.tsx", "src/booking-flow.tsx"]) {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (ts.isJsxText(node)) add(node.getText(source), file, source, node);
    if (ts.isJsxAttribute(node) && ["aria-label", "title", "placeholder", "alt", "eyebrow", "description", "label"].includes(node.name.text) && node.initializer && ts.isStringLiteral(node.initializer)) {
      add(node.initializer.text, file, source, node);
    }
    if (ts.isStringLiteral(node)) {
      const direct = node.parent && ts.isJsxExpression(node.parent);
      let ancestor = node.parent;
      while (ancestor && !ts.isJsxExpression(ancestor) && !ts.isSourceFile(ancestor)) ancestor = ancestor.parent;
      if (direct || (process.argv.includes("--deep") && ancestor && ts.isJsxExpression(ancestor) && /[ÅÄÖåäö]|\s/.test(node.text))) {
        add(node.text, file, source, node);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

for (const [phrase, location] of [...candidates].sort((a, b) => a[0].localeCompare(b[0], "sv"))) {
  process.stdout.write(`${location}\t${phrase}\n`);
}
process.stderr.write(`${candidates.size} exact phrases without dictionary entries\n`);
