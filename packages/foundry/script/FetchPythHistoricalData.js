const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Pyth Benchmarks API endpoint
const PYTH_BENCHMARKS_API = 'https://benchmarks.pyth.network/api/v1/prices';

// Price Feed IDs for ETH/USD and BTC/USD
const ETH_USD_PRICE_ID = 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';
const BTC_USD_PRICE_ID = 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43';

// Define the data we need to fetch
const dataToFetch = [
  {
    name: 'ETH_USD_2000_DMA',
    priceId: ETH_USD_PRICE_ID,
    interval: '1d', // daily data
    days: 2000,     // need 2000 days of data
    instrumentId: 0 // matches enum Instrument.ETH_USD_2000_DMA
  },
  {
    name: 'BTC_USD_200_WMA',
    priceId: BTC_USD_PRICE_ID,
    interval: '1w', // weekly data
    days: 1400,     // need 200 weeks (~1400 days)
    instrumentId: 1 // matches enum Instrument.BTC_USD_200_WMA
  }
];

// Function to fetch historical data from Pyth
async function fetchHistoricalData(priceId, interval, days) {
  try {
    // Calculate start time (days ago from now)
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - (days * 24 * 60 * 60);
    
    console.log(`Fetching ${priceId} data from ${new Date(startTime * 1000).toISOString()} to ${new Date(endTime * 1000).toISOString()}`);
    
    // Make API request
    const response = await axios.get(PYTH_BENCHMARKS_API, {
      params: {
        'ids': priceId,
        'start_time': startTime,
        'end_time': endTime,
        'interval': interval
      }
    });
    
    if (!response.data || !Array.isArray(response.data.items)) {
      throw new Error('Invalid response format from Pyth API');
    }
    
    return response.data.items;
  } catch (error) {
    console.error('Error fetching data from Pyth:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

// Function to process and format the data for contract initialization
function processData(data) {
  return data.map(item => ({
    timestamp: Math.floor(new Date(item.timestamp).getTime() / 1000),
    price: Math.floor(item.price * 10**8) // Convert to 8 decimal places
  }));
}

// Function to generate contract initialization data
function generateInitData(processedData, instrumentId) {
  // Sort by timestamp (oldest first)
  const sortedData = [...processedData].sort((a, b) => a.timestamp - b.timestamp);
  
  return {
    instrumentId,
    timestamps: sortedData.map(item => item.timestamp),
    prices: sortedData.map(item => item.price)
  };
}

// Main function to fetch and process all data
async function main() {
  const output = {};
  
  for (const instrument of dataToFetch) {
    console.log(`Fetching data for ${instrument.name}...`);
    try {
      const rawData = await fetchHistoricalData(
        instrument.priceId, 
        instrument.interval, 
        instrument.days
      );
      
      console.log(`Received ${rawData.length} data points`);
      
      const processedData = processData(rawData);
      const initData = generateInitData(processedData, instrument.instrumentId);
      
      output[instrument.name] = initData;
      
      // Save individual instrument data
      fs.writeFileSync(
        path.join(__dirname, `../data/${instrument.name}_data.json`),
        JSON.stringify(initData, null, 2)
      );
      
      console.log(`Saved ${instrument.name} data with ${initData.timestamps.length} points`);
    } catch (error) {
      console.error(`Failed to fetch data for ${instrument.name}:`, error);
    }
  }
  
  // Save combined data
  fs.writeFileSync(
    path.join(__dirname, '../data/price_data.json'),
    JSON.stringify(output, null, 2)
  );
  
  console.log('Data fetch complete!');
}

// Make sure the data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Run the script
main().catch(console.error);
