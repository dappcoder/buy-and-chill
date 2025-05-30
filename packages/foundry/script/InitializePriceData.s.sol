// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import "forge-std/console2.sol";
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
        bytes memory ethTimestampsData = vm.parseJson(json, ".ETH_USD_2000_DMA.timestamps");
        bytes memory ethPricesData = vm.parseJson(json, ".ETH_USD_2000_DMA.prices");
        uint256[] memory ethTimestamps = abi.decode(ethTimestampsData, (uint256[]));
        uint256[] memory ethPrices = abi.decode(ethPricesData, (uint256[]));
        
        // Parse BTC/USD data
        bytes memory btcTimestampsData = vm.parseJson(json, ".BTC_USD_200_WMA.timestamps");
        bytes memory btcPricesData = vm.parseJson(json, ".BTC_USD_200_WMA.prices");
        uint256[] memory btcTimestamps = abi.decode(btcTimestampsData, (uint256[]));
        uint256[] memory btcPrices = abi.decode(btcPricesData, (uint256[]));
        
        console2.log("Loaded ETH/USD data points:");
        console2.log(ethTimestamps.length);
        console2.log("Loaded BTC/USD data points:");
        console2.log(btcTimestamps.length);
        
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
        
        console2.log("Price data initialization complete!");
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
            
            // Log batch initialization (simplified for compatibility)
            console2.log("Initialized batch");
            console2.log(i + 1);
            console2.log("of");
            console2.log(batchCount);
            console2.log("for");
            console2.log(instrument == PriceDataStorage.Instrument.ETH_USD_2000_DMA ? "ETH/USD" : "BTC/USD");
            console2.log("with");
            console2.log(batchSize);
            console2.log("points");
        }
    }
}
