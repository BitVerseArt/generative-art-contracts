import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { glob } from 'glob';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

async function main(): Promise<void> {
  const files = await glob('registry/**/*.json', {
    cwd: ROOT,
    ignore: ['registry/index.json'],
  });

  files.sort();

  const entries: unknown[] = [];

  for (const relPath of files) {
    const absPath = resolve(ROOT, relPath);
    const raw = readFileSync(absPath, 'utf-8');
    const parsed = JSON.parse(raw);
    entries.push({ ...parsed, _path: relPath });
  }

  const output = JSON.stringify(entries, null, 2) + '\n';
  const indexPath = resolve(ROOT, 'registry/index.json');
  writeFileSync(indexPath, output, 'utf-8');

  console.log(`Built index with ${entries.length} entries → registry/index.json`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
