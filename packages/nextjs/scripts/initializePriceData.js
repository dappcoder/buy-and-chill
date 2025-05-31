/**
 * Script to initialize the PriceDataStorage contract with historical price data
 * This script uses ethers.js to directly interact with the contract
 * More efficient than using Forge script for large datasets
 */

const fs = require('fs');
const path = require('path');
const ethers = require('ethers');

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

// Configuration - HARDCODED contract address to ensure we use the correct one
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Newly deployed contract

// Try different common RPC URLs for local nodes
const RPC_URLS = [
  process.env.RPC_URL || "http://localhost:8545",
  "http://127.0.0.1:8545",
  "http://0.0.0.0:8545",
  "http://localhost:8545/",
  "http://127.0.0.1:8545/"
];

// Define the private key for transactions
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Anvil's default private key

// Set up the absolute path to the price data file
const PROJECT_ROOT = process.cwd();
console.log(`Project root: ${PROJECT_ROOT}`);

// Hardcode the path for testing
const DATA_PATH = '/Users/alex/Repositories/github.com/dappcoder/buy-and-chill/packages/foundry/data/price_data.json';
console.log(`Using data path: ${DATA_PATH}`);

// Verify file exists before continuing
try {
  if (fs.existsSync(DATA_PATH)) {
    console.log(`Confirmed file exists at: ${DATA_PATH}`);
  } else {
    console.log(`ERROR: File does NOT exist at: ${DATA_PATH}`);
  }
} catch(err) {
  console.error(`Error checking file: ${err.message}`);
}

// Batch size for processing data
const BATCH_SIZE = 100; // Adjust based on gas limits and performance

// Instrument enum values
const INSTRUMENTS = {
  ETH_USD_2000_DMA: 0,
  BTC_USD_200_WMA: 1
};

async function main() {
  console.log("Starting PriceDataStorage initialization...");
  
  // Try connecting to different RPC URLs
  let provider = null;
  let connected = false;
  
  for (const rpcUrl of RPC_URLS) {
    try {
      console.log(`Trying to connect to ${rpcUrl}...`);
      provider = new ethers.JsonRpcProvider(rpcUrl);
      await provider.getBlockNumber(); // Test the connection
      console.log(`Successfully connected to ${rpcUrl}`);
      connected = true;
      break;
    } catch (error) {
      console.log(`Failed to connect to ${rpcUrl}: ${error.message}`);
    }
  }
  
  if (!connected) {
    throw new Error("Failed to connect to any RPC URL. Make sure your local node is running.");
  }
  
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  
  console.log(`Connected to contract at ${CONTRACT_ADDRESS}`);
  
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
      "ETH/USD"
    );
    
    // Process BTC/USD data
    console.log("Initializing BTC/USD data...");
    await processInstrumentData(
      contract,
      INSTRUMENTS.BTC_USD_200_WMA,
      priceData.BTC_USD_200_WMA.timestamps,
      priceData.BTC_USD_200_WMA.prices,
      "BTC/USD"
    );
    
    console.log("Initialization complete!");
    
  } catch (error) {
    console.error("Error initializing contract:", error);
  }
}

async function processInstrumentData(contract, instrumentId, timestamps, prices, instrumentName) {
  try {
    // Skipping count check due to potential contract mismatch
    console.log(`Directly attempting to initialize ${instrumentName} data...`);
    
    // For debugging, let's add a simple try/catch to see if any contract method works
    try {
      const tx = await contract.hasValidMA(instrumentId);
      console.log(`hasValidMA call succeeded: ${tx}`);
    } catch (error) {
      console.log(`hasValidMA call failed: ${error.message}`);
    }
    
    // Continue with initialization anyway
    
    // Calculate number of batches
    const totalPoints = timestamps.length;
    console.log(`Initializing ${totalPoints} data points for ${instrumentName}`);
    
    const numBatches = Math.ceil(totalPoints / BATCH_SIZE);
    
    // Process in batches
    for (let i = 0; i < numBatches; i++) {
      const startIdx = i * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, totalPoints);
      const batchSize = endIdx - startIdx;
      
      console.log(`Processing batch ${i+1}/${numBatches} (${batchSize} points)...`);
      
      // Extract batch data
      const batchTimestamps = timestamps.slice(startIdx, endIdx);
      const batchPrices = prices.slice(startIdx, endIdx);
      
      try {
        // For the first batch, we'll use initializePrices
        if (i === 0) {
          console.log(`Initializing first batch with ${batchSize} points...`);
          console.log(`First timestamp: ${batchTimestamps[0]}, First price: ${batchPrices[0]}`);
          
          const tx = await contract.initializePrices(
            instrumentId, 
            batchTimestamps,
            batchPrices,
            { gasLimit: 8000000 } // Increased gas limit for safety
          );
          
          console.log(`Submitting first batch transaction: ${tx.hash}`);
          const receipt = await tx.wait();
          console.log(`First batch initialized successfully! Gas used: ${receipt.gasUsed}`);
        } 
        // For subsequent batches, we'll need to use addPrice for each point
        else {
          console.log(`Adding ${batchSize} individual data points...`);
          
          for (let j = 0; j < batchSize; j++) {
            const timestamp = batchTimestamps[j];
            const price = batchPrices[j];
            
            try {
              const tx = await contract.addPrice(
                instrumentId,
                timestamp,
                price,
                { gasLimit: 300000 } // Increased gas limit for safety
              );
              
              if (j % 10 === 0 || j === batchSize - 1) {
                console.log(`Added point ${startIdx + j + 1}/${totalPoints}`);
              }
              
              const receipt = await tx.wait();
              
              if (j % 100 === 0) {
                console.log(`Gas used for point ${startIdx + j + 1}: ${receipt.gasUsed}`);
              }
              
              // Add a small delay to avoid network congestion
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (error) {
              console.error(`Error adding data point ${startIdx + j} (${timestamp}, ${price}):`, error.message);
              
              // If we hit a gas error or similar, wait longer before continuing
              if (error.message.includes('gas') || error.message.includes('underpriced')) {
                console.log(`Waiting longer before continuing...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
              }
              
              // Continue with the next point
            }
          }
        }
        
        console.log(`Batch ${i+1}/${numBatches} complete!`);
        
      } catch (error) {
        console.error(`Error processing batch ${i+1}:`, error.message);
        console.error(error);
        
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
    const finalCount = await contract.getPriceCount(instrumentId);
    console.log(`${instrumentName} now has ${finalCount.toString()} data points`);
  } catch (error) {
    console.error(`Error processing ${instrumentName} data:`, error);
    throw error; // Re-throw to handle in main
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
