// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PriceDataStorage
 * @dev Stores historical price data and calculates moving averages for cryptocurrency assets
 */
contract PriceDataStorage is Ownable {
    // Supported instruments
    enum Instrument { ETH_USD_2000_DMA, BTC_USD_200_WMA }
    
    // Price point structure
    struct PricePoint {
        uint256 timestamp;
        uint256 price; // Price in USD with 8 decimals (e.g., 3000.12 USD = 300012000000)
    }
    
    // Price data for each instrument
    mapping(Instrument => PricePoint[]) public priceData;
    
    // Current MA value for each instrument
    mapping(Instrument => uint256) public maValues;
    
    // Authorized updaters
    mapping(address => bool) public authorizedUpdaters;
    
    // Events
    event PriceAdded(Instrument instrument, uint256 timestamp, uint256 price);
    event MAUpdated(Instrument instrument, uint256 maValue);
    event PricesInitialized(Instrument instrument, uint256 count);
    event UpdaterAuthorized(address updater, bool status);
    
    // Modifiers
    modifier onlyAuthorized() {
        require(owner() == msg.sender || authorizedUpdaters[msg.sender], "Not authorized");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Add a new price point for an instrument
     * @param instrument The instrument to add price for
     * @param timestamp The timestamp of the price (in seconds)
     * @param price The price value with 8 decimals
     */
    function addPrice(Instrument instrument, uint256 timestamp, uint256 price) external onlyAuthorized {
        require(timestamp > 0, "Invalid timestamp");
        require(price > 0, "Invalid price");
        
        // Check if we're adding a price in chronological order
        if (priceData[instrument].length > 0) {
            require(timestamp > priceData[instrument][priceData[instrument].length - 1].timestamp, "Timestamp must be newer than latest");
        }
        
        // Add the price point
        priceData[instrument].push(PricePoint(timestamp, price));
        
        // Update the MA
        updateMA(instrument);
        
        emit PriceAdded(instrument, timestamp, price);
    }
    
    /**
     * @dev Initialize price data in batch
     * @param instrument The instrument to initialize
     * @param timestamps Array of timestamps
     * @param prices Array of prices with 8 decimals
     */
    function initializePrices(
        Instrument instrument, 
        uint256[] calldata timestamps, 
        uint256[] calldata prices
    ) external onlyOwner {
        require(timestamps.length == prices.length, "Arrays must have same length");
        require(priceData[instrument].length == 0, "Data already initialized");
        
        for (uint256 i = 0; i < timestamps.length; i++) {
            require(timestamps[i] > 0, "Invalid timestamp");
            require(prices[i] > 0, "Invalid price");
            
            // Ensure chronological order
            if (i > 0) {
                require(timestamps[i] > timestamps[i-1], "Timestamps must be in order");
            }
            
            priceData[instrument].push(PricePoint(timestamps[i], prices[i]));
        }
        
        // Calculate initial MA
        updateMA(instrument);
        
        emit PricesInitialized(instrument, timestamps.length);
    }
    
    /**
     * @dev Update the MA value for an instrument
     * @param instrument The instrument to update MA for
     */
    function updateMA(Instrument instrument) internal {
        uint256[] memory points = getPricePoints(instrument);
        
        if (points.length == 0) {
            return;
        }
        
        uint256 totalPoints = points.length;
        uint256 maLength = instrument == Instrument.ETH_USD_2000_DMA ? 1200 : 140;
        
        // Only calculate MA when we have exactly enough points
        if (totalPoints < maLength) {
            // We don't have enough data points yet
            maValues[instrument] = 0;
            return;
        }
        
        uint256 sum = 0;
        
        // Start from the most recent points
        for (uint256 i = 0; i < maLength; i++) {
            sum += points[totalPoints - 1 - i];
        }
        
        // Calculate the average
        uint256 newMA = sum / maLength;
        maValues[instrument] = newMA;
        
        emit MAUpdated(instrument, newMA);
    }
    
    /**
     * @dev Get the current MA value for an instrument
     * @param instrument The instrument to get MA for
     * @return The MA value with 8 decimals, or 0 if not enough data points
     */
    function getMA(Instrument instrument) external view returns (uint256) {
        uint256 maLength = instrument == Instrument.ETH_USD_2000_DMA ? 1200 : 140;
        
        // Check if we have enough data points for a valid MA
        if (priceData[instrument].length < maLength) {
            return 0; // Not enough data for MA calculation
        }
        
        return maValues[instrument];
    }
    
    /**
     * @dev Get the latest price for an instrument
     * @param instrument The instrument to get price for
     * @return The latest price with 8 decimals
     */
    function getLatestPrice(Instrument instrument) external view returns (uint256) {
        if (priceData[instrument].length == 0) {
            return 0;
        }
        return priceData[instrument][priceData[instrument].length - 1].price;
    }
    
    /**
     * @dev Get all price points for an instrument
     * @param instrument The instrument to get data for
     * @return Array of price values
     */
    function getPricePoints(Instrument instrument) public view returns (uint256[] memory) {
        uint256 length = priceData[instrument].length;
        uint256[] memory prices = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            prices[i] = priceData[instrument][i].price;
        }
        
        return prices;
    }
    
    /**
     * @dev Get all timestamps for an instrument
     * @param instrument The instrument to get data for
     * @return Array of timestamps
     */
    function getTimestamps(Instrument instrument) public view returns (uint256[] memory) {
        uint256 length = priceData[instrument].length;
        uint256[] memory timestamps = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            timestamps[i] = priceData[instrument][i].timestamp;
        }
        
        return timestamps;
    }
    
    /**
     * @dev Get the number of price points for an instrument
     * @param instrument The instrument to get count for
     * @return The number of price points
     */
    function getPriceCount(Instrument instrument) external view returns (uint256) {
        return priceData[instrument].length;
    }
    
    /**
     * @dev Check if we have enough data points for a valid MA calculation
     * @param instrument The instrument to check
     * @return True if we have enough data points for MA calculation
     */
    function hasValidMA(Instrument instrument) external view returns (bool) {
        uint256 maLength = instrument == Instrument.ETH_USD_2000_DMA ? 1200 : 140;
        return priceData[instrument].length >= maLength;
    }
    
    /**
     * @dev Get a specific price point for an instrument
     * @param instrument The instrument to get data for
     * @param index The index of the price point
     * @return timestamp The timestamp of the price point
     * @return price The price value
     */
    function getPriceAt(Instrument instrument, uint256 index) external view returns (uint256 timestamp, uint256 price) {
        require(index < priceData[instrument].length, "Index out of bounds");
        PricePoint memory point = priceData[instrument][index];
        return (point.timestamp, point.price);
    }
    
    /**
     * @dev Get a range of price points for an instrument
     * @param instrument The instrument to get data for
     * @param startIndex The starting index
     * @param count The number of points to get
     * @return timestamps Array of timestamps
     * @return prices Array of prices
     */
    function getPriceRange(
        Instrument instrument, 
        uint256 startIndex, 
        uint256 count
    ) external view returns (uint256[] memory timestamps, uint256[] memory prices) {
        require(startIndex < priceData[instrument].length, "Start index out of bounds");
        
        // Adjust count if it exceeds available data
        if (startIndex + count > priceData[instrument].length) {
            count = priceData[instrument].length - startIndex;
        }
        
        timestamps = new uint256[](count);
        prices = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            timestamps[i] = priceData[instrument][startIndex + i].timestamp;
            prices[i] = priceData[instrument][startIndex + i].price;
        }
        
        return (timestamps, prices);
    }
    
    /**
     * @dev Set the authorization status for an updater
     * @param updater The address to authorize/deauthorize
     * @param status The authorization status
     */
    function setUpdaterAuthorization(address updater, bool status) external onlyOwner {
        authorizedUpdaters[updater] = status;
        emit UpdaterAuthorized(updater, status);
    }
}
