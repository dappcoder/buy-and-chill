# Buy and Chill dApp Setup Guide

## Prerequisites

- Node.js v22.16.0
- Yarn
- Foundry
- Git
- Wallet with testnet ETH

## Quick Setup

```bash
# Clone repository
git clone git@github.com:dappcoder/buy-and-chill.git
cd buy-and-chill

# Install dependencies
yarn install

# Build contracts
cd packages/foundry
forge build

# Run tests
forge test
```

## Local Development

```bash
# Terminal 1: Start local blockchain
yarn chain

# Terminal 2: Start frontend
yarn start
```

## Deployment

### Environment Setup

Create `packages/foundry/.env`:
```
# DEFAULT SCAFFOLD-ETH KEYS
# Alchemy rpc URL is used while deploying the contracts to some testnets/mainnets, checkout `foundry.toml` for it's use.
ALCHEMY_API_KEY=oKxs-03sij-U_N0iOlrSsZFr29-IqbuF
# Etherscan API key is used to verify the contract on etherscan.
ETHERSCAN_API_KEY=DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW
# Default account for localhost / use "scaffold-eth-custom" if you wish to use a generated account or imported account
ETH_KEYSTORE_ACCOUNT=scaffold-eth-default

PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
DATA_PATH=./data/historical_prices.json
```

### Deploy All Contracts

```bash
cd packages/foundry
forge script script/Init.s.sol --rpc-url localhost --broadcast
```

### Update Frontend with Contract Addresses

```bash
cd packages/nextjs
node scripts/generateDeployedContracts.js
```

## Verification

```bash
# Verify deployments
forge script script/VerifyAll.s.sol --rpc-url localhost

# Check vault setup
forge script script/CheckVaultSetup.s.sol --rpc-url localhost
```

## Testing

```bash
# All tests
forge test

# Integration tests only
forge test --match-test "testIntegration"

# Mock tests only
forge test --match-test "testMock"
```

## Troubleshooting

### Frontend Contract Name Mismatch

If you encounter errors like `TypeError: Cannot read properties of undefined (reading 'address')`, it's likely due to a mismatch between contract names in the frontend code and the `deployedContracts.ts` file.

For example, the frontend might be looking for `MockDAI` but the contract is registered as `MockERC20` in the deployedContracts.ts file.

To fix this, either:

1. Update the frontend code to use the correct contract name:

```typescript
// Change this line in app/page.tsx
address: deployedContracts[31337].MockDAI.address as `0x${string}`,

// To this:
address: deployedContracts[31337].MockERC20.address as `0x${string}`,
```

2. Or modify the contract name in the deployment script to match what the frontend expects.

## Historical Price Data

```bash
# Fetch historical price data
node scripts/FetchPythHistoricalData.js

# Initialize with historical data
forge script script/InitializePriceData.s.sol --rpc-url localhost --broadcast
```

## Testnet Deployment

```bash
forge script script/Init.s.sol --rpc-url https://sepolia.infura.io/v3/YOUR_INFURA_KEY --broadcast --verify
```

## Debugging

```bash
forge script script/Init.s.sol -vvvv --rpc-url localhost
```
