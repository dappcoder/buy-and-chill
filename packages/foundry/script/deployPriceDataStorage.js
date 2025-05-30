/**
 * Deployment script for the PriceDataStorage contract
 * 
 * This script deploys the PriceDataStorage contract using ethers.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deploy the PriceDataStorage contract
 * @param {ethers.Wallet} wallet - The wallet to use for deployment
 * @returns {Promise<string>} The address of the deployed contract
 */
async function deployPriceDataStorage(wallet) {
  console.log('Deploying PriceDataStorage contract...');
  
  // Get the contract artifacts
  const artifactPath = path.join(__dirname, '../out/PriceDataStorage.sol/PriceDataStorage.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  // Create contract factory
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );
  
  // Deploy the contract
  console.log('Sending deployment transaction...');
  const contract = await factory.deploy({ gasLimit: 5000000 });
  
  // Wait for deployment to complete
  console.log(`Deployment transaction sent: ${contract.deployTransaction.hash}`);
  console.log('Waiting for deployment to be mined...');
  await contract.deployed();
  
  console.log(`PriceDataStorage deployed at: ${contract.address}`);
  return contract.address;
}

// If this script is run directly, execute the deployment
if (import.meta.url === `file://${process.argv[1]}`) {
  // Connect to the network
  const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
  const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  deployPriceDataStorage(wallet)
    .then((address) => {
      console.log(`Deployment successful! Contract address: ${address}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Deployment failed:', error);
      process.exit(1);
    });
}

export { deployPriceDataStorage };
