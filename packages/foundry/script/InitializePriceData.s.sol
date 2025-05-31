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
        
        // For the first batch, use initializePrices to set up the initial data
        uint256 initialBatchSize = totalPoints > MAX_BATCH_SIZE ? MAX_BATCH_SIZE : totalPoints;
        
        // Create arrays for the initial batch
        uint256[] memory initialTimestamps = new uint256[](initialBatchSize);
        uint256[] memory initialPrices = new uint256[](initialBatchSize);
        
        // Fill initial batch arrays
        for (uint256 j = 0; j < initialBatchSize; j++) {
            initialTimestamps[j] = timestamps[j];
            initialPrices[j] = prices[j];
        }
        
        // Initialize with the first batch
        try priceDataStorage.initializePrices(instrument, initialTimestamps, initialPrices) {
            console2.log("Initialized first batch for");
            console2.log(instrument == PriceDataStorage.Instrument.ETH_USD_2000_DMA ? "ETH/USD" : "BTC/USD");
            console2.log("with");
            console2.log(initialBatchSize);
            console2.log("points");
        } catch Error(string memory reason) {
            console2.log("Error initializing first batch:");
            console2.log(reason);
            
            // If instrument is already initialized, we'll just use addPrice for all points
        }
        
        // Add remaining points using addPrice, starting after the initial batch
        for (uint256 i = initialBatchSize; i < totalPoints; i++) {
            // Add each data point individually
            try priceDataStorage.addPrice(instrument, timestamps[i], prices[i]) {
                // Successfully added
                if (i % 100 == 0 || i == totalPoints - 1) {
                    console2.log("Added data point");
                    console2.log(i + 1);
                    console2.log("of");
                    console2.log(totalPoints);
                    console2.log("for");
                    console2.log(instrument == PriceDataStorage.Instrument.ETH_USD_2000_DMA ? "ETH/USD" : "BTC/USD");
                }
            } catch Error(string memory reason) {
                console2.log("Error adding data point");
                console2.log(i);
                console2.log(reason);
            }
        }
        
        console2.log("Completed initializing");
        console2.log(instrument == PriceDataStorage.Instrument.ETH_USD_2000_DMA ? "ETH/USD" : "BTC/USD");
        console2.log("with");
        console2.log(totalPoints);
        console2.log("points");
    }
}
