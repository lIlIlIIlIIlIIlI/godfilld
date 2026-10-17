import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, join, basename, extname, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { zipSync, strToU8 } from 'fflate';
const root = resolve(import.meta.dirname, '..');
const excluded = new Set(['node_modules', 'dist', '.git', '.vercel', 'coverage', '.openai']);
const files: Record<string, Uint8Array> = {},
  manifest: Record<string, string> = {};
function visit(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      visit(full);
      continue;
    }
    if (!entry.isFile()) continue;
    const name = basename(full);
    if (name.startsWith('.env') && name !== '.env.example') continue;
    if (extname(name) === '.zip' || name.includes('.sqlite') || name === 'source-revision.json')
      continue;
    const rel = relative(root, full).split(sep).join('/'),
      data = readFileSync(full);
    files[`aether-arena/${rel}`] = data;
    manifest[rel] = createHash('sha256').update(data).digest('hex');
  }
}
visit(root);
const revision = JSON.stringify(manifest, null, 2) + '\n';
writeFileSync(join(root, 'data/source-revision.json'), revision);
files['aether-arena/data/source-revision.json'] = strToU8(revision);
const out = join(root, 'client/public/source.zip');
writeFileSync(out, zipSync(files, { level: 6 }));
console.log(`Packaged ${Object.keys(files).length} corresponding-source files.`);
