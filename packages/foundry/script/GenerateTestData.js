const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Function to generate synthetic price data
function generatePriceData(startPrice, volatility, days, interval) {
  const data = [];
  let currentPrice = startPrice;
  
  // Current time
  const endTime = Math.floor(Date.now() / 1000);
  
  // Interval in seconds
  const intervalSeconds = interval === 'day' ? 24 * 60 * 60 : 7 * 24 * 60 * 60;
  
  for (let i = 0; i < days; i++) {
    // Calculate timestamp (going backwards from current time)
    const timestamp = endTime - ((days - i) * intervalSeconds);
    
    // Add some random movement to the price
    const change = currentPrice * (Math.random() * volatility * 2 - volatility);
    currentPrice += change;
    
    // Ensure price is always positive
    if (currentPrice <= 0) {
      currentPrice = startPrice * 0.1;
    }
    
    // Add data point
    data.push({
      timestamp,
      price: Math.floor(currentPrice * 10**8) // Convert to 8 decimal places
    });
  }
  
  return data;
}

// Generate ETH/USD data (2000 days)
const ethData = generatePriceData(3000, 0.03, 2000, 'day');
console.log(`Generated ${ethData.length} ETH/USD daily data points`);

// Generate BTC/USD data (200 weeks)
const btcData = generatePriceData(45000, 0.05, 200, 'week');
console.log(`Generated ${btcData.length} BTC/USD weekly data points`);

// Format data for contract
const ethInitData = {
  instrumentId: 0,
  timestamps: ethData.map(item => item.timestamp),
  prices: ethData.map(item => item.price)
};

const btcInitData = {
  instrumentId: 1,
  timestamps: btcData.map(item => item.timestamp),
  prices: btcData.map(item => item.price)
};

// Create combined data file
const priceData = {
  ETH_USD_2000_DMA: ethInitData,
  BTC_USD_200_WMA: btcInitData
};

// Write to files
fs.writeFileSync(
  path.join(dataDir, 'ETH_USD_2000_DMA_data.json'),
  JSON.stringify(ethInitData, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'BTC_USD_200_WMA_data.json'),
  JSON.stringify(btcInitData, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'price_data.json'),
  JSON.stringify(priceData, null, 2)
);

console.log('Data files created successfully!');
console.log(`ETH/USD data file: ${path.join(dataDir, 'ETH_USD_2000_DMA_data.json')}`);
console.log(`BTC/USD data file: ${path.join(dataDir, 'BTC_USD_200_WMA_data.json')}`);
console.log(`Combined data file: ${path.join(dataDir, 'price_data.json')}`);
