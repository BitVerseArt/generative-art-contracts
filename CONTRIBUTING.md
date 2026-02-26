# Contributing

Thank you for contributing to the Generative Art Contracts Registry!

## How to Add an Entry

1. **Fork** this repository
2. **Create a JSON file** in the correct location:
   - EVM: `registry/evm/<chain_slug>/<address>.json`
   - Solana: `registry/solana/<network>/<address>.json`
   - Tezos: `registry/tezos/<network>/<address>.json`
3. **Fill in required fields**: `vm_type`, `contract_address`, `name`, `standard`, `created_at`, `sources`
4. **Include a block explorer source** — at least one source with `"type": "block_explorer"` is required
5. **Validate**: run `pnpm validate`
6. **Format**: run `pnpm format`
7. **Open a PR** targeting the `dev` branch

You can also use `pnpm new:entry` to scaffold a new entry interactively.

## Common Mistakes

- **Uppercase EVM addresses** — addresses and filenames must be lowercase
- **Missing block explorer source** — every entry needs at least one
- **Wrong file path** — the path must match `vm_type`, chain slug / network, and address
- **Invalid chain slug** — the chain must exist in `schema/chains.json`
- **Mismatched chain_id** — the `chain_id` in the JSON must match what `schema/chains.json` maps the slug to

## Review Process

1. CI runs automatically on your PR (schema validation, format check, lint)
2. A maintainer reviews the entry for accuracy
3. Once approved and CI passes, the PR is merged

## Adding a New Chain

If the chain you need isn't in `schema/chains.json`:

1. Add the slug and chain ID to `schema/chains.json`
2. Create the directory `registry/evm/<chain_slug>/`
3. Include this change in your PR or open a separate PR

## Code of Conduct

Please be respectful and constructive. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
