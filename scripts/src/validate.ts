import _Ajv from 'ajv';
import _addFormats from 'ajv-formats';

const Ajv = _Ajv.default ?? _Ajv;
const addFormats = _addFormats.default ?? _addFormats;
import { readFileSync } from 'node:fs';
import { resolve, basename, dirname } from 'node:path';
import { glob } from 'glob';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

interface ValidationError {
  file: string;
  reason: string;
}

function loadJson(filePath: string): unknown {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function main(): Promise<void> {
  const errors: ValidationError[] = [];

  // Load schema and chains
  const schema = loadJson(resolve(ROOT, 'schema/contract-entry.schema.json'));
  const chains: Record<string, number> = loadJson(
    resolve(ROOT, 'schema/chains.json'),
  ) as Record<string, number>;

  // Setup AJV
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema as object);

  // Glob all registry JSON files
  const files = await glob('registry/**/*.json', {
    cwd: ROOT,
    ignore: ['registry/index.json'],
  });

  if (files.length === 0) {
    console.log('No registry entries found.');
    process.exit(0);
  }

  // Track uniqueness: key = "vm_type:chain_id_or_network:contract_address"
  const seen = new Map<string, string>();

  for (const relPath of files) {
    const absPath = resolve(ROOT, relPath);
    const fileName = basename(relPath, '.json');

    // 1. JSON parse
    let entry: Record<string, unknown>;
    try {
      entry = loadJson(absPath) as Record<string, unknown>;
    } catch {
      errors.push({ file: relPath, reason: 'Invalid JSON' });
      continue;
    }

    // 2. Schema validation
    const valid = validate(entry);
    if (!valid && validate.errors) {
      for (const err of validate.errors) {
        errors.push({
          file: relPath,
          reason: `Schema: ${err.instancePath} ${err.message}`,
        });
      }
      continue;
    }

    // 2b. Check at least one block_explorer source exists
    const sources = entry.sources as Array<{ type: string }>;
    const hasBlockExplorer = sources.some((s) => s.type === 'block_explorer');
    if (!hasBlockExplorer) {
      errors.push({
        file: relPath,
        reason: 'At least one source with type "block_explorer" is required',
      });
      continue;
    }

    const vmType = entry.vm_type as string;
    const contractAddress = entry.contract_address as string;

    // 3. Path validation
    const parts = relPath.split('/');
    // Expected: registry/<vm_type>/<slug_or_network>/<address>.json
    if (parts.length !== 4) {
      errors.push({
        file: relPath,
        reason: `Path must be registry/<vm_type>/<chain_or_network>/<address>.json, got ${parts.length} segments`,
      });
      continue;
    }

    const [, pathVmType, pathSlug, pathFile] = parts;

    if (pathVmType !== vmType) {
      errors.push({
        file: relPath,
        reason: `Path vm_type "${pathVmType}" does not match content vm_type "${vmType}"`,
      });
    }

    if (pathFile !== `${contractAddress}.json`) {
      errors.push({
        file: relPath,
        reason: `Filename "${pathFile}" does not match contract_address "${contractAddress}.json"`,
      });
    }

    // VM-specific path checks
    if (vmType === 'evm') {
      const chainId = entry.chain_id as number;

      // Check slug exists in chains.json
      if (!(pathSlug in chains)) {
        errors.push({
          file: relPath,
          reason: `Chain slug "${pathSlug}" not found in schema/chains.json`,
        });
      } else if (chains[pathSlug] !== chainId) {
        errors.push({
          file: relPath,
          reason: `Chain slug "${pathSlug}" maps to chain_id ${chains[pathSlug]}, but entry has chain_id ${chainId}`,
        });
      }

      // 4. Address normalization: EVM addresses must be lowercase
      if (contractAddress !== contractAddress.toLowerCase()) {
        errors.push({
          file: relPath,
          reason: `EVM contract_address must be lowercase: "${contractAddress}"`,
        });
      }
      if (fileName !== fileName.toLowerCase()) {
        errors.push({
          file: relPath,
          reason: `EVM filename must be lowercase: "${fileName}"`,
        });
      }
    } else if (vmType === 'solana') {
      const network = entry.network as string;
      if (pathSlug !== network) {
        errors.push({
          file: relPath,
          reason: `Path network "${pathSlug}" does not match content network "${network}"`,
        });
      }
    } else if (vmType === 'tezos') {
      const network = entry.network as string;
      if (pathSlug !== network) {
        errors.push({
          file: relPath,
          reason: `Path network "${pathSlug}" does not match content network "${network}"`,
        });
      }
    }

    // 5. Uniqueness
    const chainOrNetwork =
      vmType === 'evm' ? String(entry.chain_id) : (entry.network as string);
    const uniqueKey = `${vmType}:${chainOrNetwork}:${contractAddress}`;
    if (seen.has(uniqueKey)) {
      errors.push({
        file: relPath,
        reason: `Duplicate entry: same contract already at "${seen.get(uniqueKey)}"`,
      });
    } else {
      seen.set(uniqueKey, relPath);
    }
  }

  // Output results
  if (errors.length > 0) {
    console.error(`\nValidation failed with ${errors.length} error(s):\n`);
    for (const err of errors) {
      console.error(`  ${err.file}: ${err.reason}`);
    }
    console.error('');
    process.exit(1);
  }

  console.log(`Validated ${files.length} entry/entries. All checks passed.`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
