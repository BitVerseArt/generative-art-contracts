# Generative Art Contracts Registry

A community-editable registry of onchain generative art contracts. This repo stores structured metadata (no source code) for generative art contracts across multiple blockchains.

## Supported VMs

| VM | Status | Chains |
|----|--------|--------|
| EVM | Active | Ethereum, Base, Optimism, Zora, Polygon, Arbitrum, Shape |
| Solana | Planned | — |
| Tezos | Planned | — |

## Adding a Contract

1. Fork this repository
2. Create a JSON file at the correct path:
   - **EVM**: `registry/evm/<chain_slug>/<0x_address>.json`
   - **Solana**: `registry/solana/<network>/<address>.json`
   - **Tezos**: `registry/tezos/<network>/<KT1_address>.json`
3. Fill in the required fields (see below)
4. Run `pnpm validate` to check your entry
5. Run `pnpm format` to format your file
6. Open a PR targeting the `dev` branch

### Required Fields

```json
{
  "vm_type": "evm",
  "chain_id": 1,
  "contract_address": "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270",
  "name": "Art Blocks Curated",
  "standard": "ERC721",
  "created_at": "2024-01-15",
  "sources": [
    {
      "type": "block_explorer",
      "url": "https://etherscan.io/address/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270"
    }
  ]
}
```

### Optional Fields

`project`, `artist`, `collection_type`, `description`, `tags`, `deployment_tx`, `verified`, `interfaces`, `notes`

See `examples/evm-entry.example.json` for a complete example.

## File Layout Rules

- One file per contract
- EVM addresses must be **lowercase** in both the filename and the JSON content
- The filename must match the `contract_address` field
- The folder path must match the `vm_type` and `chain_id`/`network`
- At least one source with `"type": "block_explorer"` is required

### Why one file per entry?

One-file-per-contract makes PRs easy to review, avoids merge conflicts, and keeps git history clean. Each file is independently validated against the schema.

## Development

```bash
pnpm install
pnpm validate       # validate all entries
pnpm format         # format all JSON files
pnpm format:check   # check formatting (CI)
pnpm lint           # typecheck scripts
pnpm build:index    # regenerate registry/index.json
pnpm new:entry      # interactively create a new entry
```

## Adding a New Chain

1. Add the chain slug and chain ID to `schema/chains.json`
2. Create the directory `registry/evm/<chain_slug>/`
3. Open a PR

See [docs/chains.md](docs/chains.md) for the full list of supported chains.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
