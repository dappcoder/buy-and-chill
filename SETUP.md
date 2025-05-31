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
# DEFAULT SCAFFOLD-ETH VALUES
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Etherscan API key is used to verify the contract on etherscan.
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Keystore account name to be used while deploying contracts on local anvil chain (defaults to scaffold-eth-default which is anvil's 9th account)
# To use a custom keystore account, you can change the value of LOCALHOST_KEYSTORE_ACCOUNT=my-account-name
LOCALHOST_KEYSTORE_ACCOUNT=scaffold-eth-default

PRIVATE_KEY=your_private_key_here

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

## Testing

```bash
# All tests
forge test

# Integration tests only
forge test --match-test "testIntegration"

# Mock tests only
forge test --match-test "testMock"
```

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
