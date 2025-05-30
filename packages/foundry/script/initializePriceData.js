/**
 * Script to initialize the PriceDataStorage contract with historical price data
 * This script uses ethers.js to directly interact with the contract
 * More efficient than using Forge script for large datasets
 */

import fs from 'fs';
import path from 'path';
import ethers from 'ethers';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Complete ABI for PriceDataStorage contract
const CONTRACT_ABI = [
  // Enum for Instrument
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "enum PriceDataStorage.Instrument",
        "name": "instrument",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "addPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum PriceDataStorage.Instrument",
        "name": "instrument",
        "type": "uint8"
      }
    ],
    "name": "getPriceCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum PriceDataStorage.Instrument",
        "name": "instrument",
        "type": "uint8"
      }
    ],
    "name": "hasValidMA",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum PriceDataStorage.Instrument",
        "name": "instrument",
        "type": "uint8"
      },
      {
        "internalType": "uint256[]",
        "name": "timestamps",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "prices",
        "type": "uint256[]"
      }
    ],
    "name": "initializePrices",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum PriceDataStorage.Instrument",
        "name": "",
        "type": "uint8"
      }
    ],
    "name": "maValues",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Configuration - can be set via environment variables
const RPC_URL = process.env.RPC_URL || "http://localhost:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Anvil's default private key
const DATA_PATH = process.env.DATA_PATH || path.resolve(__dirname, '../data/price_data.json');
const BATCH_SIZE = 100; // Adjust based on gas limits and performance

// Instrument enum values
const INSTRUMENTS = {
  ETH_USD_2000_DMA: 0,
  BTC_USD_200_WMA: 1
};

/**
 * Initialize price data in the contract
 * @param {string} contractAddress - The address of the deployed PriceDataStorage contract
 * @param {Object} [options] - Initialization options
 * @param {boolean} [options.runOneBatchOnly=false] - If true, only the first batch of data will be processed
 * @returns {Promise<void>}
 */
async function initializePriceData(contractAddress, options = {}) {
  // Extract options with defaults
  const { runOneBatchOnly = false } = options;
  console.log("Starting PriceDataStorage initialization...");
  
  // Connect to the blockchain
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  console.log(`Connected to RPC at ${RPC_URL}`);
  
  // Create wallet and contract instance
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
  
  // We'll pass the wallet directly to the function instead of using global
  
  console.log(`Connected to contract at ${contractAddress}`);
  
  try {
    // Load price data
    console.log(`Loading price data from ${DATA_PATH}...`);
    const priceData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    console.log("Price data loaded successfully.");
    
    // Process ETH/USD data
    console.log("Initializing ETH/USD data...");
    await processInstrumentData(
      contract,
      INSTRUMENTS.ETH_USD_2000_DMA,
      priceData.ETH_USD_2000_DMA.timestamps,
      priceData.ETH_USD_2000_DMA.prices,
      "ETH/USD",
      wallet,
      runOneBatchOnly
    );
    
    // Process BTC/USD data - in fast mode, we still include the first batch
    console.log("Initializing BTC/USD data...");
    await processInstrumentData(
      contract,
      INSTRUMENTS.BTC_USD_200_WMA,
      priceData.BTC_USD_200_WMA.timestamps,
      priceData.BTC_USD_200_WMA.prices,
      "BTC/USD",
      wallet,
      runOneBatchOnly // This will limit BTC/USD to first batch only in fast mode
    );
    
    console.log("Initialization complete!");
    
  } catch (error) {
    console.error("Error initializing contract:", error);
    throw error;
  }
}

async function processInstrumentData(contract, instrumentId, timestamps, prices, instrumentName, wallet, runOneBatchOnly = false) {
  try {
    // Set to track already added timestamps to avoid duplicates
    const addedTimestamps = new Set();
    
    // Check if the instrument already has data
    let existingCount;
    try {
      existingCount = await contract.getPriceCount(instrumentId);
      console.log(`${instrumentName} already has ${existingCount.toString()} data points`);
      
      if (Number(existingCount) > 0) {
        console.log(`${instrumentName} already has data. Skipping initialization.`);
        return;
      }
    } catch (error) {
      console.log(`Could not get price count: ${error.message}`);
      console.log(`Proceeding with initialization...`);
    }
    
    // Calculate number of batches
    const totalPoints = timestamps.length;
    console.log(`Initializing ${totalPoints} data points for ${instrumentName}`);
    
    const numBatches = Math.ceil(totalPoints / BATCH_SIZE);
    
    // Process in batches - if runOneBatchOnly is true, we only process the first batch
    const batchesToProcess = runOneBatchOnly ? 1 : numBatches;
    console.log(`Processing ${runOneBatchOnly ? 'only first batch' : 'all batches'} (${batchesToProcess}/${numBatches})...`);
    
    for (let i = 0; i < batchesToProcess; i++) {
      const startIdx = i * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, totalPoints);
      const batchSize = endIdx - startIdx;
      
      console.log(`Processing batch ${i+1}/${numBatches} (${batchSize} points)...`);
      
      // Extract batch data
      const batchTimestamps = timestamps.slice(startIdx, endIdx);
      const batchPrices = prices.slice(startIdx, endIdx);
      
      try {
        // For the first batch, we'll use initializePrices (which can only be used once)
        if (i === 0) {
          console.log(`Initializing first batch with ${batchSize} points...`);
          console.log(`First timestamp: ${batchTimestamps[0]}, First price: ${batchPrices[0]}`);
          
          // Wait for some time before sending the transaction
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const tx = await contract.initializePrices(
            instrumentId, 
            batchTimestamps,
            batchPrices,
            { gasLimit: 8000000 } // Increased gas limit for safety
          );
          
          console.log(`Submitting first batch transaction: ${tx.hash}`);
          const receipt = await tx.wait();
          console.log(`First batch initialized successfully! Gas used: ${receipt.gasUsed}`);
          
          // Mark all timestamps in this batch as processed
          for (const timestamp of batchTimestamps) {
            addedTimestamps.add(timestamp.toString());
          }
        } 
        // For subsequent batches, we need to use addPrice but ensure strict chronological order
        else {
          console.log(`Processing batch ${i+1} with ${batchSize} points...`);
          
          // First, sort the batch by timestamp to ensure chronological order
          const batchData = batchTimestamps.map((timestamp, idx) => ({ 
            timestamp, 
            price: batchPrices[idx] 
          }));
          batchData.sort((a, b) => a.timestamp - b.timestamp);
          
          console.log(`Adding ${batchData.length} data points in chronological order...`);
          
          // We need to get the latest timestamp in the contract first
          const currentCount = await contract.getPriceCount(instrumentId);
          let latestTimestamp = 0;
          
          if (currentCount.toNumber() > 0) {
            // Get the latest timestamp from the contract
            try {
              // Use the first timestamp from current batch if we can't get the latest
              latestTimestamp = await contract.getLatestTimestamp(instrumentId);
              console.log(`Latest timestamp in contract: ${latestTimestamp}`);
            } catch (error) {
              console.warn(`Could not get latest timestamp: ${error.message}`);
            }
          }
          
          // Now add points in order, but only if they're newer than the latest
          let addedInBatch = 0;
          
          for (const { timestamp, price } of batchData) {
            // Skip if we've already processed this timestamp
            if (addedTimestamps.has(timestamp.toString())) {
              console.log(`Skipping duplicate timestamp ${timestamp}`);
              continue;
            }
            
            // Skip if this timestamp is older than or equal to the latest in contract
            if (timestamp <= latestTimestamp) {
              console.log(`Skipping timestamp ${timestamp} as it's not newer than latest (${latestTimestamp})`);
              addedTimestamps.add(timestamp.toString()); // Mark as processed anyway
              continue;
            }
            
            try {
              // Mark this timestamp as processed
              addedTimestamps.add(timestamp.toString());
              
              // Get a fresh nonce for each transaction
              const nonce = await wallet.getTransactionCount();
              
              const tx = await contract.addPrice(
                instrumentId,
                timestamp,
                price,
                { 
                  gasLimit: 300000, 
                  nonce: nonce
                }
              );
              
              if (addedInBatch % 10 === 0) {
                console.log(`Added point ${startIdx + addedInBatch + 1}/${totalPoints}`);
              }
              
              const receipt = await tx.wait();
              addedInBatch++;
              
              // Update latest timestamp after successful addition
              latestTimestamp = timestamp;
              
              // Add a small delay to avoid network congestion
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (error) {
              console.error(`Error adding data point with timestamp ${timestamp}:`, error.message);
              
              // Log the specific error details
              if (error.receipt) {
                console.log(`Transaction failed with status: ${error.receipt.status}`);
              }
              
              // If we hit a gas error or similar, wait longer before continuing
              if (error.message.includes('gas') || error.message.includes('underpriced') || error.message.includes('nonce')) {
                console.log(`Waiting longer before continuing...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
              }
            }
          }
          
          console.log(`Added ${addedInBatch} points in batch ${i+1}`);
        }
        
        // Wait for some time to let the blockchain process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`Batch ${i+1}/${numBatches} complete!`);
        
      } catch (error) {
        console.error(`Error processing batch ${i+1}:`, error.message);
        
        if (i === 0) {
          // If the first batch failed, we can't continue
          throw new Error(`First batch initialization failed: ${error.message}`);
        }
        
        // Wait before continuing after an error
        console.log(`Waiting before continuing after error...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Verify the initialization
    try {
      const finalCount = await contract.getPriceCount(instrumentId);
      console.log(`${instrumentName} now has ${finalCount.toString()} data points`);
    } catch (error) {
      console.log(`Could not verify final count: ${error.message}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${instrumentName} data:`, error);
    throw error;
  }
}

// Export the function for use in other scripts
export { initializePriceData };

// If this script is run directly, initialize with the provided contract address
if (import.meta.url === `file://${process.argv[1]}`) {
  // If run directly, use the contract address from environment or command line
  const contractAddress = process.env.PRICE_STORAGE_ADDRESS || process.argv[2];
  
  if (!contractAddress) {
    console.error("Please provide the PriceDataStorage contract address as an environment variable or command line argument");
    process.exit(1);
  }
  
  // Check if we should run only one batch
  const runOneBatchOnly = process.argv.includes('--run-one-batch-only') || process.env.RUN_ONE_BATCH_ONLY === 'true';
  if (runOneBatchOnly) {
    console.log('Running in FAST MODE: Only initializing the first batch of data...');
  }
  
  initializePriceData(contractAddress, { runOneBatchOnly })
    .then(() => process.exit(0))
    .catch(error => {
      console.error("Initialization failed:", error);
      process.exit(1);
    });
}
