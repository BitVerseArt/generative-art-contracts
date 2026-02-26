import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function main(): Promise<void> {
  console.log('Create a new generative art contract entry\n');

  const vmType = await ask('VM type (evm / solana / tezos): ');
  if (!['evm', 'solana', 'tezos'].includes(vmType)) {
    console.error('Invalid vm_type');
    process.exit(1);
  }

  const contractAddress = await ask('Contract address: ');
  const name = await ask('Name: ');
  const standard = await ask(
    `Standard (${vmType === 'evm' ? 'ERC721 / ERC1155 / OTHER' : vmType === 'solana' ? 'SPL / METAPLEX / OTHER' : 'FA2 / OTHER'}): `,
  );
  const explorerUrl = await ask('Block explorer URL: ');
  const createdAt = new Date().toISOString().split('T')[0];

  const entry: Record<string, unknown> = {
    contract_address: contractAddress,
    created_at: createdAt,
    name,
    sources: [{ type: 'block_explorer', url: explorerUrl }],
    standard,
    vm_type: vmType,
  };

  let subDir: string;

  if (vmType === 'evm') {
    const chainSlug = await ask('Chain slug (ethereum / base / optimism / zora / ...): ');
    const chains: Record<string, number> = JSON.parse(
      readFileSync(resolve(ROOT, 'schema/chains.json'), 'utf-8'),
    );
    if (!(chainSlug in chains)) {
      console.error(`Unknown chain slug "${chainSlug}". Add it to schema/chains.json first.`);
      process.exit(1);
    }
    entry.chain_id = chains[chainSlug];
    subDir = `registry/evm/${chainSlug}`;
  } else {
    const network = await ask('Network: ');
    entry.network = network;
    subDir = `registry/${vmType}/${network}`;
  }

  const dirPath = resolve(ROOT, subDir);
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }

  const filePath = resolve(dirPath, `${contractAddress}.json`);
  if (existsSync(filePath)) {
    console.error(`File already exists: ${filePath}`);
    process.exit(1);
  }

  // Sort keys for consistent formatting
  const sorted = Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(filePath, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
  console.log(`\nCreated: ${subDir}/${contractAddress}.json`);
  console.log('Run `pnpm validate` to check your entry.');

  rl.close();
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  rl.close();
  process.exit(1);
});
