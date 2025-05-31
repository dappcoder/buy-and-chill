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

### Frontend Contract Updates

After deploying contracts, you need to update the frontend with the new contract addresses and ABIs. Run the following command from the `packages/nextjs` directory:

```bash
node scripts/generateDeployedContracts.js
```

This will generate a new `deployedContracts.ts` file with the latest contract addresses and ABIs.

## Wallet Setup for Testing

To test the dApp locally, you need to set up your wallet with:

1. Mock DAI tokens
2. Allowances for the Vault contract
3. Access to mock controls for price feeds and swaps

We've made this easy with a two-step approach:

### Step 1: User Wallet Setup (UI Button)

1. Connect your wallet to the local network
2. Look for the wallet setup button next to the ETH faucet button in the top navigation bar
3. Click the wallet setup button (wallet icon) to:
   - Mint 10,000 mock DAI to your wallet
   - Set maximum allowance for the Vault contract

### Step 2: Enable Mock Controls (Admin Only)

To enable mock controls for price feeds and swaps, you need admin access to the contracts. Run the following Foundry script from the `packages/foundry` directory:

```bash
forge script script/EnableMockMode.s.sol --rpc-url localhost --broadcast
```

This script will:
- Enable mock mode on the PythIntegrator contract
- Enable mock mode on the OneInchIntegrator contract
- Set up default mock prices

This two-step setup allows you to test the full functionality of the dApp without needing real tokens or external services.

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
