import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { glob } from 'glob';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const CHECK_MODE = process.argv.includes('--check');

function sortKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortKeysDeep);
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

async function main(): Promise<void> {
  const patterns = ['registry/**/*.json', 'examples/**/*.json', 'schema/**/*.json'];
  const allFiles: string[] = [];

  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: ROOT, ignore: ['registry/index.json'] });
    allFiles.push(...matches);
  }

  let hasIssues = false;

  for (const relPath of allFiles) {
    const absPath = resolve(ROOT, relPath);
    const raw = readFileSync(absPath, 'utf-8');

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error(`  ${relPath}: Invalid JSON, skipping`);
      hasIssues = true;
      continue;
    }

    const sorted = sortKeysDeep(parsed);
    const formatted = JSON.stringify(sorted, null, 2) + '\n';

    if (raw !== formatted) {
      if (CHECK_MODE) {
        console.error(`  ${relPath}: Not formatted`);
        hasIssues = true;
      } else {
        writeFileSync(absPath, formatted, 'utf-8');
        console.log(`  ${relPath}: Formatted`);
      }
    }
  }

  if (CHECK_MODE && hasIssues) {
    console.error('\nFormat check failed. Run `pnpm format` to fix.');
    process.exit(1);
  }

  if (!CHECK_MODE) {
    console.log('All files formatted.');
  } else {
    console.log('All files are properly formatted.');
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
