/**
 * Script to generate deployedContracts.ts from Foundry deployment artifacts
 * Run this after deploying contracts with Foundry to sync the frontend
 */

const fs = require('fs');
const path = require('path');

// Configuration
const chainId = process.env.CHAIN_ID || '31337'; // Default to localhost
const foundryOutDir = path.join(__dirname, '../../foundry/out');
const deployedContractsPath = path.join(__dirname, '../contracts/deployedContracts.ts');
const broadcastDir = path.join(__dirname, '../../foundry/broadcast');

console.log('Starting contract deployment file generation...');

// Find the latest run file from the broadcast directory
function findLatestRunFile() {
  // Look for Init.s.sol broadcast files
  const initScriptDir = path.join(broadcastDir, 'Init.s.sol');
  if (!fs.existsSync(initScriptDir)) {
    throw new Error(`Broadcast directory for Init.s.sol not found at ${initScriptDir}`);
  }

  // Find directories for different chains
  const chainDirs = fs.readdirSync(initScriptDir).filter(file => 
    fs.statSync(path.join(initScriptDir, file)).isDirectory()
  );
  
  if (chainDirs.length === 0) {
    throw new Error('No chain directories found in broadcast directory');
  }
  
  // Use the specified chainId or the first available
  const chainDir = chainDirs.includes(chainId.toString()) ? chainId.toString() : chainDirs[0];
  const runDir = path.join(initScriptDir, chainDir);
  
  // Find the latest run file
  const runFiles = fs.readdirSync(runDir)
    .filter(file => file.startsWith('run-') && file.endsWith('.json'))
    .sort((a, b) => {
      // Extract timestamps from filenames (run-TIMESTAMP.json)
      const timestampA = parseInt(a.replace('run-', '').replace('.json', ''));
      const timestampB = parseInt(b.replace('run-', '').replace('.json', ''));
      return timestampB - timestampA; // Sort in descending order (latest first)
    });
  
  if (runFiles.length === 0) {
    throw new Error(`No run files found in ${runDir}`);
  }
  
  const latestRunFile = path.join(runDir, runFiles[0]);
  console.log(`Found latest run file: ${latestRunFile}`);
  return latestRunFile;
}

// Extract deployed contract addresses from run file
function extractDeployedContracts(runFilePath) {
  const runData = JSON.parse(fs.readFileSync(runFilePath, 'utf8'));
  const transactions = runData.transactions || [];
  
  // Map to store contract names and addresses
  const deployedContracts = {};
  
  // Extract contract deployments
  transactions.forEach(tx => {
    if (tx.transactionType === 'CREATE' && tx.contractName && tx.contractAddress) {
      deployedContracts[tx.contractName] = tx.contractAddress;
      console.log(`Found deployed contract: ${tx.contractName} at ${tx.contractAddress}`);
    }
  });
  
  return deployedContracts;
}

// Find ABI for a contract
function findContractAbi(contractName) {
  const possiblePaths = [
    path.join(foundryOutDir, `${contractName}.sol`, `${contractName}.json`),
    path.join(foundryOutDir, `${contractName}.json`)
  ];
  
  for (const abiPath of possiblePaths) {
    if (fs.existsSync(abiPath)) {
      const abiData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
      return abiData.abi;
    }
  }
  
  // If we can't find the exact name, try to find a match with different casing
  // This handles cases like OneInchIntegrator vs 1inchIntegrator
  const files = fs.readdirSync(foundryOutDir);
  for (const file of files) {
    const filePath = path.join(foundryOutDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      const jsonFiles = fs.readdirSync(filePath).filter(f => f.endsWith('.json'));
      for (const jsonFile of jsonFiles) {
        const baseName = path.basename(jsonFile, '.json');
        if (baseName.toLowerCase() === contractName.toLowerCase()) {
          const abiData = JSON.parse(fs.readFileSync(path.join(filePath, jsonFile), 'utf8'));
          return abiData.abi;
        }
      }
    } else if (file.endsWith('.json')) {
      const baseName = path.basename(file, '.json');
      if (baseName.toLowerCase() === contractName.toLowerCase()) {
        const abiData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return abiData.abi;
      }
    }
  }
  
  console.warn(`Warning: Could not find ABI for ${contractName}`);
  return [];
}

// Generate deployedContracts.ts file
function generateDeployedContractsFile(deployedContracts) {
  // Create backup of existing file if it exists
  if (fs.existsSync(deployedContractsPath)) {
    const backupPath = `${deployedContractsPath}.backup`;
    fs.copyFileSync(deployedContractsPath, backupPath);
    console.log(`Created backup of existing deployedContracts.ts at ${backupPath}`);
  }
  
  // Start building the content
  let fileContent = `/**
 * Generated from Foundry deployment artifacts
 * Generated on: ${new Date().toISOString()}
 * DO NOT MODIFY MANUALLY - use the generateDeployedContracts.js script
 */

import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  ${chainId}: {
`;

  // Add each contract
  for (const [contractName, address] of Object.entries(deployedContracts)) {
    const abi = findContractAbi(contractName);
    
    fileContent += `    ${contractName}: {
      address: "${address}",
      abi: ${JSON.stringify(abi, null, 6).replace(/^/gm, '      ')},
    },
`;
  }

  // Close the object
  fileContent += `  },
} as const;

export default deployedContracts as GenericContractsDeclaration;
`;

  // Write the file
  fs.writeFileSync(deployedContractsPath, fileContent);
  console.log(`Generated deployedContracts.ts at ${deployedContractsPath}`);
}

// Main execution
try {
  const latestRunFile = findLatestRunFile();
  const deployedContracts = extractDeployedContracts(latestRunFile);
  
  if (Object.keys(deployedContracts).length === 0) {
    console.error('No deployed contracts found in the latest run file');
    process.exit(1);
  }
  
  generateDeployedContractsFile(deployedContracts);
  console.log('Successfully generated deployedContracts.ts');
} catch (error) {
  console.error('Error generating deployedContracts.ts:', error);
  process.exit(1);
}
