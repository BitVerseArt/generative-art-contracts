# Supported Chains & Networks

## EVM Chains

Defined in [`schema/chains.json`](../schema/chains.json).

| Slug | Chain ID | Registry Path |
|------|----------|---------------|
| `ethereum` | 1 | `registry/evm/ethereum/` |
| `optimism` | 10 | `registry/evm/optimism/` |
| `polygon` | 137 | `registry/evm/polygon/` |
| `shape` | 360 | `registry/evm/shape/` |
| `base` | 8453 | `registry/evm/base/` |
| `arbitrum` | 42161 | `registry/evm/arbitrum/` |
| `zora` | 7777777 | `registry/evm/zora/` |

To add a new EVM chain, add it to `schema/chains.json` and create the directory under `registry/evm/`.

## Solana Networks

| Network | Registry Path |
|---------|---------------|
| `mainnet-beta` | `registry/solana/mainnet-beta/` |
| `devnet` | `registry/solana/devnet/` |
| `testnet` | `registry/solana/testnet/` |

## Tezos Networks

| Network | Registry Path |
|---------|---------------|
| `mainnet` | `registry/tezos/mainnet/` |
| `ghostnet` | `registry/tezos/ghostnet/` |
