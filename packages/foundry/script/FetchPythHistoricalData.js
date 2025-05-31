// Innovative Always Up DeFi instrument! Reduces ETH and BTC volatility. Not financial advice. DYOR!

// Use ES module syntax
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pyth TradingView shim API endpoint for historical data
const PYTH_TV_API = 'https://benchmarks.pyth.network/v1/shims/tradingview/history';

// Price symbols for TradingView API
const ETH_USD_SYMBOL = 'Crypto.ETH/USD';
const BTC_USD_SYMBOL = 'Crypto.BTC/USD';

// Define the data we need to fetch
const dataToFetch = [
  {
    name: 'ETH_USD_2000_DMA',
    symbol: ETH_USD_SYMBOL,
    resolution: 'D', // daily data
    days: 2000,      // need 2000 days of data
    instrumentId: 0  // matches enum Instrument.ETH_USD_2000_DMA
  },
  {
    name: 'BTC_USD_200_WMA',
    symbol: BTC_USD_SYMBOL,
    resolution: 'W', // weekly data
    days: 1400,      // need 200 weeks (~1400 days)
    instrumentId: 1  // matches enum Instrument.BTC_USD_200_WMA
  }
];

// Function to fetch historical data from Pyth TradingView API in chunks
async function fetchHistoricalData(symbol, resolution, days) {
  try {
    // The API has a 1-year limit, so we need to fetch data in chunks
    const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
    const endTimeSec = Math.floor(Date.now() / 1000);
    const startTimeSec = endTimeSec - (days * 24 * 60 * 60);
    
    console.log(`Fetching ${symbol} data from ${new Date(startTimeSec * 1000).toISOString()} to ${new Date(endTimeSec * 1000).toISOString()}`);
    
    // Calculate how many chunks we need
    const totalTimespan = endTimeSec - startTimeSec;
    const numChunks = Math.ceil(totalTimespan / ONE_YEAR_SECONDS);
    
    console.log(`Fetching data in ${numChunks} chunks due to 1-year API limit`);
    
    // Combined data array
    let allPriceData = [];
    
    // Fetch data in chunks
    for (let i = 0; i < numChunks; i++) {
      const chunkEnd = i === 0 ? endTimeSec : startTimeSec + ((i + 1) * ONE_YEAR_SECONDS);
      const chunkStart = Math.max(startTimeSec, startTimeSec + (i * ONE_YEAR_SECONDS));
      
      // Skip if we're at the end
      if (chunkStart >= chunkEnd) continue;
      
      console.log(`Chunk ${i+1}/${numChunks}: ${new Date(chunkStart * 1000).toISOString()} to ${new Date(chunkEnd * 1000).toISOString()}`);
      
      // Build URL with proper parameters
      const url = `${PYTH_TV_API}?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${chunkStart}&to=${chunkEnd}`;
      console.log(`API URL for chunk ${i+1}: ${url}`);
      
      // Make API request
      const response = await axios.get(url);
      
      if (!response.data || response.data.s !== 'ok' || !Array.isArray(response.data.t)) {
        console.error(`Unexpected response format for chunk ${i+1}:`, response.data);
        console.log('Continuing to next chunk...');
        continue;
      }
      
      // Extract price data from the response
      const { t: timestamps, c: closingPrices } = response.data;
      console.log(`Received ${timestamps.length} data points for chunk ${i+1}`);
      
      // Process the chunk data
      const chunkData = [];
      for (let j = 0; j < timestamps.length; j++) {
        chunkData.push({
          timestamp: timestamps[j], // Already in unix seconds
          price: closingPrices[j]   // Closing price
        });
      }
      
      // Add to combined data
      allPriceData = allPriceData.concat(chunkData);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Sort by timestamp (oldest first) and remove duplicates
    allPriceData.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove duplicates by timestamp
    const uniqueData = [];
    const seenTimestamps = new Set();
    
    for (const item of allPriceData) {
      if (!seenTimestamps.has(item.timestamp)) {
        seenTimestamps.add(item.timestamp);
        uniqueData.push(item);
      }
    }
    
    console.log(`Processed ${uniqueData.length} unique data points after combining chunks`);
    
    return uniqueData;
  } catch (error) {
    console.error('Error fetching data from Pyth:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

// Function to process data for contract initialization
function processData(rawData) {
  return rawData.map(item => ({
    timestamp: item.timestamp,
    // Convert to 8 decimal places for the contract
    price: Math.floor(item.price * 100000000)
  }));
}

// Main function to fetch and process all data
async function main() {
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  
  const output = {};
  
  for (const instrument of dataToFetch) {
    console.log(`Fetching data for ${instrument.name}...`);
    try {
      const rawData = await fetchHistoricalData(
        instrument.symbol, 
        instrument.resolution, 
        instrument.days
      );
      
      console.log(`Received ${rawData.length} data points`);
      
      // Process data for contract
      const processedData = processData(rawData);
      
      // Create initialization data
      const initData = {
        instrumentId: instrument.instrumentId,
        timestamps: processedData.map(item => item.timestamp),
        prices: processedData.map(item => item.price)
      };
      
      output[instrument.name] = initData;
      
      // Save individual instrument data
      fs.writeFileSync(
        path.join(dataDir, `${instrument.name}_data.json`),
        JSON.stringify(initData, null, 2)
      );
      
      console.log(`Saved ${instrument.name} data with ${initData.timestamps.length} points`);
    } catch (error) {
      console.error(`Failed to fetch data for ${instrument.name}:`, error);
    }
  }
  
  // Save combined data
  fs.writeFileSync(
    path.join(dataDir, 'price_data.json'),
    JSON.stringify(output, null, 2)
  );
  
  console.log('Data fetch complete!');
}

// Run the script
main().catch(console.error);
