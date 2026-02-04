const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..", "..");
const STORE_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(STORE_ROOT, "generated");
const OUT_FILE = path.join(OUT_DIR, "tw-safelist.json");

const SCAN_DIRS = [
  path.join(ROOT, "packages", "blocks"),
  path.join(ROOT, "packages", "renderer"),
  path.join(ROOT, "apps", "storefront", "src"),
];

const FILE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mdx"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      walk(full, files);
    } else if (FILE_EXTS.has(path.extname(e.name))) {
      files.push(full);
    }
  }
  return files;
}

function extractClasses(content) {
  const classes = new Set();

  const stringRe = /(className|class)\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = stringRe.exec(content))) {
    m[2]
      .split(/\s+/)
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => classes.add(c));
  }

  const singleRe = /(className|class)\s*=\s*'([^']+)'/g;
  while ((m = singleRe.exec(content))) {
    m[2]
      .split(/\s+/)
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => classes.add(c));
  }

  const tplRe = /(className|class)\s*=\s*\{`([\s\S]*?)`\}/g;
  while ((m = tplRe.exec(content))) {
    const raw = m[2]
      .replace(/\$\{[^}]+\}/g, " ")
      .replace(/\n/g, " ");
    raw
      .split(/\s+/)
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => classes.add(c));
  }

  return classes;
}

function main() {
  const files = SCAN_DIRS.flatMap((d) => walk(d));
  const all = new Set();

  for (const f of files) {
    const content = fs.readFileSync(f, "utf8");
    extractClasses(content).forEach((c) => all.add(c));
  }

  const list = Array.from(all).sort();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(list, null, 2));
  console.log(`Safelist generated: ${OUT_FILE} (${list.length} classes)`);
}

main();
