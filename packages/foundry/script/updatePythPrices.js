#!/usr/bin/env node
/**
 * updatePythPrices.js
 * 
 * This script demonstrates how to fetch price update data from Pyth Network's
 * Hermes service and update the prices on-chain using the PythIntegrator contract.
 * 
 * It implements the Pull oracle model where:
 * 1. We pull/fetch the data from Hermes
 * 2. We update the data on chain using updatePriceFeeds method
 * 3. The contract can then consume the price
 */

import { ethers } from 'ethers';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration (these can be set via environment variables)
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Default Anvil key
const PYTH_INTEGRATOR_ADDRESS = process.env.PYTH_INTEGRATOR_ADDRESS;

// Pyth price IDs we're interested in
const PRICE_IDS = [
  // ETH/USD price feed ID
  '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  // BTC/USD price feed ID  
  '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'
];

// Network to endpoint mapping
const NETWORK_TO_ENDPOINT = {
  'mainnet': 'https://hermes.pyth.network',
  'sepolia': 'https://hermes-beta.pyth.network',
  'local': 'https://hermes-beta.pyth.network', // Use beta endpoint for local testing
};

/**
 * Get ABI for the PythIntegrator contract
 */
function getPythIntegratorAbi() {
  try {
    const artifactPath = path.join(__dirname, '../out/PythIntegrator.sol/PythIntegrator.json');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return artifact.abi;
  } catch (error) {
    console.error('Error loading PythIntegrator ABI:', error);
    console.log('Make sure you have compiled the contract with `forge build` first.');
    process.exit(1);
  }
}

/**
 * Detect the network from the RPC URL
 */
function detectNetwork(rpcUrl) {
  if (rpcUrl.includes('localhost') || rpcUrl.includes('127.0.0.1')) {
    return 'local';
  } else if (rpcUrl.includes('sepolia')) {
    return 'sepolia';
  } else {
    return 'mainnet';
  }
}

/**
 * Format price for display
 */
function formatPrice(priceObj) {
  const price = priceObj.price;
  const conf = priceObj.conf;
  const expo = priceObj.expo;
  const publishTime = new Date(priceObj.publishTime * 1000).toISOString();

  // Format price considering the exponent (e.g., if price=1234 and expo=-2, then display price is 12.34)
  const displayPrice = price * 10 ** expo;
  const displayConf = conf * 10 ** expo;

  return {
    displayPrice,
    displayConf,
    publishTime,
    raw: {
      price,
      conf,
      expo,
      publishTime: priceObj.publishTime
    }
  };
}

/**
 * Main function to update Pyth prices
 */
async function main() {
  try {
    // Detect network and choose appropriate endpoint
    const network = detectNetwork(RPC_URL);
    const endpoint = NETWORK_TO_ENDPOINT[network] || NETWORK_TO_ENDPOINT.mainnet;
    
    console.log(`Using Pyth endpoint: ${endpoint} for network: ${network}`);

    // Step 1: Connect to the Ethereum provider
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const walletAddress = await wallet.getAddress();
    
    console.log(`Connected to network at ${RPC_URL}`);
    console.log(`Using wallet address: ${walletAddress}`);

    // Get contract address from arguments or environment variable
    const pythIntegratorAddress = process.argv[2] || PYTH_INTEGRATOR_ADDRESS;
    
    if (!pythIntegratorAddress) {
      console.error("Error: No PythIntegrator contract address provided.");
      console.error("Usage: node updatePythPrices.js <PythIntegrator_Address>");
      process.exit(1);
    }

    // Step 2: Set up connection to PythIntegrator contract
    const pythIntegratorAbi = getPythIntegratorAbi();
    const pythIntegrator = new ethers.Contract(pythIntegratorAddress, pythIntegratorAbi, wallet);
    
    console.log(`Connected to PythIntegrator contract at ${pythIntegratorAddress}`);

    // Step 3: Connect to Pyth Network's price service (Hermes)
    const pythConnection = new EvmPriceServiceConnection(endpoint);
    console.log("Connected to Pyth Network's price service");

    // Step 4: Fetch the latest price updates for our price feeds
    console.log("Fetching price updates from Pyth Network...");
    const priceUpdateData = await pythConnection.getPriceFeedsUpdateData(PRICE_IDS);
    
    console.log(`Received price update data (${priceUpdateData.length} bytes)`);

    // Step 5: Get current prices for comparison (before update)
    console.log("Current prices (before update):");
    try {
      const ethPrice = await pythIntegrator.getLatestEthUsdPrice();
      console.log(`ETH/USD: $${formatPrice(ethPrice).displayPrice.toFixed(2)}`);
    } catch (error) {
      console.log("ETH/USD: Not available yet");
    }

    try {
      const btcPrice = await pythIntegrator.getLatestBtcUsdPrice();
      console.log(`BTC/USD: $${formatPrice(btcPrice).displayPrice.toFixed(2)}`);
    } catch (error) {
      console.log("BTC/USD: Not available yet");
    }

    // Step 6: Calculate the required fee
    const updateFee = await pythIntegrator.pyth.getUpdateFee(priceUpdateData);
    console.log(`Update fee: ${ethers.utils.formatEther(updateFee)} ETH`);

    // Step 7: Update the price feeds on-chain
    console.log("Updating price feeds on-chain...");
    const tx = await pythIntegrator.updatePriceFeeds(priceUpdateData, {
      value: updateFee,
      gasLimit: 1000000
    });

    console.log(`Transaction sent: ${tx.hash}`);
    
    // Wait for the transaction to be mined
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // Step 8: Get updated prices (after update)
    console.log("\nUpdated prices:");
    
    const updatedEthPrice = await pythIntegrator.getLatestEthUsdPrice();
    console.log(`ETH/USD: $${formatPrice(updatedEthPrice).displayPrice.toFixed(2)}`);
    
    const updatedBtcPrice = await pythIntegrator.getLatestBtcUsdPrice();
    console.log(`BTC/USD: $${formatPrice(updatedBtcPrice).displayPrice.toFixed(2)}`);
    
    // Get prices with 8 decimals (format used by PriceDataStorage)
    const ethPrice8Decimals = await pythIntegrator.getEthUsdPrice8Decimals();
    console.log(`ETH/USD (8 decimals): ${ethPrice8Decimals.toString()}`);
    
    const btcPrice8Decimals = await pythIntegrator.getBtcUsdPrice8Decimals();
    console.log(`BTC/USD (8 decimals): ${btcPrice8Decimals.toString()}`);

    console.log("\nPrice update completed successfully!");
  } catch (error) {
    console.error("Error updating Pyth prices:", error);
    process.exit(1);
  }
}

// Execute script if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
