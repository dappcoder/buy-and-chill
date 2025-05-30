/**
 * Combined script to deploy the PriceDataStorage contract and initialize it with historical price data
 * This script will:
 * 1. Deploy the PriceDataStorage contract
 * 2. Initialize it with historical ETH/USD and BTC/USD price data
 * 
 * Run with: node script/deployAndInitialize.js
 */

/**
 * Combined script to deploy the PriceDataStorage contract and initialize it with historical price data
 * 
 * Usage:
 *   node deployAndInitialize.js          # Full initialization (all data)
 *   node deployAndInitialize.js --fast   # Fast initialization (one batch only)
 */

import { deployPriceDataStorage } from './deployPriceDataStorage.js';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializePriceData } from './initializePriceData.js';

// Parse command line arguments
const args = process.argv.slice(2);
const runOneBatchOnly = args.includes('--fast') || args.includes('--run-one-batch-only');

// For ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default values (can be overridden with env variables)
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Default Anvil key

/**
 * Main function to deploy the contract and initialize it with price data
 */
async function main() {
  console.log("=========================================");
  console.log("  DEPLOYMENT AND INITIALIZATION SCRIPT");
  console.log("=========================================");
  console.log("This script will:");
  console.log("1. Deploy the PriceDataStorage contract");
  console.log(`2. Initialize it with ${runOneBatchOnly ? 'FIRST BATCH of' : 'ALL'} historical price data`);
  console.log("=========================================\n");
  
  // Connect to RPC
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  // Check if we can connect to the network
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log(`Connected to network. Current block: ${blockNumber}`);
  } catch (error) {
    console.error(`Failed to connect to RPC at ${RPC_URL}:`, error.message);
    process.exit(1);
  }
  
  // Deploy the contract
  let contractAddress;
  try {
    console.log("STEP 1: Deploying PriceDataStorage contract...");
    contractAddress = await deployPriceDataStorage(wallet);
    console.log(`Contract deployed successfully at: ${contractAddress}`);
    
    // Step 2: Initialize the contract with price data
    console.log("STEP 2: Initializing contract with historical price data...");
    // Update the frontend config with the new contract address
    updateFrontendConfig(contractAddress);
    
  } catch (error) {
    console.error("Failed to deploy contract:", error.message);
    process.exit(1);
  }
  
  console.log("\nSTEP 2: Initializing contract with historical price data...");
  
  try {
    if (runOneBatchOnly) {
      console.log("Running initialization in FAST MODE (one batch only)...");
      await initializePriceData(contractAddress, { runOneBatchOnly: true });
      
      console.log("\nSuccessfully deployed and initialized PriceDataStorage contract with the first batch of data!");
      console.log("Note: Only the first batch of ETH/USD data was initialized for faster startup.");
      console.log("To initialize all data, run: node script/initializePriceData.js " + contractAddress);
    } else {
      console.log("Running FULL initialization (this may take a while)...");
      await initializePriceData(contractAddress, { runOneBatchOnly: false });
      
      console.log("\nSuccessfully deployed and initialized PriceDataStorage contract with ALL historical data!");
    }
    
    console.log("\n=========================================");
    console.log("  DEPLOYMENT AND INITIALIZATION COMPLETE");
    console.log(`PriceDataStorage contract deployed at: ${contractAddress}`);
    console.log("Contract has been initialized with historical price data");
    console.log("Frontend configuration has been updated");
    console.log("=========================================");
    
  } catch (error) {
    console.error("Error during deployment and initialization:", error);
    process.exit(1);
  }
}

/**
 * Update the frontend config with the new contract address
 */
function updateFrontendConfig(contractAddress) {
  try {
    const configPath = path.join(__dirname, '../../nextjs/config/priceDataConfig.json');
    
    // Check if the config file exists
    if (fs.existsSync(configPath)) {
      // Read existing config
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Update the contract address
      config.contractAddress = contractAddress;
      
      // Write updated config back to file
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`Updated frontend config at ${configPath}`);
    } else {
      // Create new config file
      const config = {
        contractAddress: contractAddress,
        updatedAt: new Date().toISOString()
      };
      
      // Create the directory if it doesn't exist
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // Write new config file
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`Created frontend config at ${configPath}`);
    }
  } catch (error) {
    console.error("Error updating contract address in frontend configuration:", error);
    console.log("Manual update may be needed");
  }
}

// Run the deployment and initialization
main().catch(error => {
  console.error("Script execution failed:", error);
  process.exit(1);
});
