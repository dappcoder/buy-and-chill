// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {PriceDataStorage} from "../contracts/PriceDataStorage.sol";

contract InitializePriceData is Script {
    // Max number of data points to add in a single transaction
    // Adjust this based on gas limits of the target network
    uint256 constant MAX_BATCH_SIZE = 500;

    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address storageAddress = vm.envAddress("PRICE_STORAGE_ADDRESS");
        string memory dataPath = vm.envString("DATA_PATH");
        
        // Read price data from JSON file
        string memory json = vm.readFile(dataPath);
        
        // Initialize the contract instance
        PriceDataStorage priceDataStorage = PriceDataStorage(storageAddress);
        
        // Parse ETH/USD data
        bytes memory ethData = vm.parseJson(json, ".ETH_USD_2000_DMA");
        (uint256[] memory ethTimestamps, uint256[] memory ethPrices) = abi.decode(ethData, (uint256[], uint256[]));
        
        // Parse BTC/USD data
        bytes memory btcData = vm.parseJson(json, ".BTC_USD_200_WMA");
        (uint256[] memory btcTimestamps, uint256[] memory btcPrices) = abi.decode(btcData, (uint256[], uint256[]));
        
        console.log("Loaded ETH/USD data points:", ethTimestamps.length);
        console.log("Loaded BTC/USD data points:", btcTimestamps.length);
        
        // Start transaction
        vm.startBroadcast(deployerPrivateKey);
        
        // Initialize ETH/USD data in batches
        initializeInBatches(
            priceDataStorage,
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            ethTimestamps,
            ethPrices
        );
        
        // Initialize BTC/USD data in batches
        initializeInBatches(
            priceDataStorage,
            PriceDataStorage.Instrument.BTC_USD_200_WMA,
            btcTimestamps,
            btcPrices
        );
        
        vm.stopBroadcast();
        
        console.log("Price data initialization complete!");
    }
    
    function initializeInBatches(
        PriceDataStorage priceDataStorage,
        PriceDataStorage.Instrument instrument,
        uint256[] memory timestamps,
        uint256[] memory prices
    ) internal {
        uint256 totalPoints = timestamps.length;
        uint256 batchCount = (totalPoints + MAX_BATCH_SIZE - 1) / MAX_BATCH_SIZE; // Ceiling division
        
        for (uint256 i = 0; i < batchCount; i++) {
            uint256 startIndex = i * MAX_BATCH_SIZE;
            uint256 endIndex = startIndex + MAX_BATCH_SIZE;
            if (endIndex > totalPoints) {
                endIndex = totalPoints;
            }
            
            uint256 batchSize = endIndex - startIndex;
            
            // Create arrays for this batch
            uint256[] memory batchTimestamps = new uint256[](batchSize);
            uint256[] memory batchPrices = new uint256[](batchSize);
            
            // Fill batch arrays
            for (uint256 j = 0; j < batchSize; j++) {
                batchTimestamps[j] = timestamps[startIndex + j];
                batchPrices[j] = prices[startIndex + j];
            }
            
            // Initialize this batch
            priceDataStorage.initializePrices(instrument, batchTimestamps, batchPrices);
            
            console.log(
                "Initialized batch %d/%d for instrument %s with %d points",
                i + 1,
                batchCount,
                instrument == PriceDataStorage.Instrument.ETH_USD_2000_DMA ? "ETH/USD" : "BTC/USD",
                batchSize
            );
        }
    }
}
