// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {PriceDataStorage} from "../contracts/PriceDataStorage.sol";
import {Vault} from "../contracts/Vault.sol";

/**
 * @title InitializeVaultData
 * @dev Script to initialize the Vault with sample price data for testing
 */
contract InitializeVaultData is Script {
    function run(address priceDataStorageAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        PriceDataStorage priceDataStorage = PriceDataStorage(priceDataStorageAddress);
        
        // For testing purposes, we'll set shorter MA lengths
        // In production, these would be the actual lengths (2000 days for ETH, 200 weeks for BTC)
        if (block.chainid == 31337) { // Local development
            priceDataStorage.setMALengthForTesting(PriceDataStorage.Instrument.ETH_USD_2000_DMA, 5);
            priceDataStorage.setMALengthForTesting(PriceDataStorage.Instrument.BTC_USD_200_WMA, 5);
            console2.log("Set shorter MA lengths for testing");
        }
        
        // Initialize with some sample price data for ETH/USD
        uint256[] memory ethTimestamps = new uint256[](10);
        uint256[] memory ethPrices = new uint256[](10);
        
        // Generate sample data for the last 10 days (ETH/USD)
        uint256 baseTimestamp = block.timestamp - 10 days;
        uint256 baseEthPrice = 3000 * 10**8; // $3000 with 8 decimals
        
        for (uint256 i = 0; i < 10; i++) {
            ethTimestamps[i] = baseTimestamp + (i * 1 days);
            // Create some price variation
            ethPrices[i] = baseEthPrice + ((i * 50) * 10**8); // Increasing by $50 each day
        }
        
        // Initialize ETH/USD price data
        priceDataStorage.initializePrices(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            ethTimestamps,
            ethPrices
        );
        console2.log("Initialized ETH/USD price data with 10 data points");
        
        // Initialize with some sample price data for BTC/USD
        uint256[] memory btcTimestamps = new uint256[](10);
        uint256[] memory btcPrices = new uint256[](10);
        
        // Generate sample data for the last 10 weeks (BTC/USD)
        uint256 baseBtcPrice = 60000 * 10**8; // $60000 with 8 decimals
        
        for (uint256 i = 0; i < 10; i++) {
            btcTimestamps[i] = baseTimestamp + (i * 1 days); // Using days for testing, would be weeks in production
            // Create some price variation
            btcPrices[i] = baseBtcPrice + ((i * 1000) * 10**8); // Increasing by $1000 each period
        }
        
        // Initialize BTC/USD price data
        priceDataStorage.initializePrices(
            PriceDataStorage.Instrument.BTC_USD_200_WMA,
            btcTimestamps,
            btcPrices
        );
        console2.log("Initialized BTC/USD price data with 10 data points");
        
        // For testing, we can also set override values
        if (block.chainid == 31337) {
            // Override MA values for testing if needed
            // priceDataStorage.overrideMAForTesting(PriceDataStorage.Instrument.ETH_USD_2000_DMA, 3200 * 10**8);
            // priceDataStorage.overrideMAForTesting(PriceDataStorage.Instrument.BTC_USD_200_WMA, 62000 * 10**8);
            // console2.log("Override MA values for testing");
        }
        
        vm.stopBroadcast();
    }
    
    function run() external {
        console2.log("Please provide the PriceDataStorage contract address");
        console2.log("Usage: forge script script/InitializeVaultData.s.sol:InitializeVaultData --sig 'run(address)' [PRICE_DATA_STORAGE_ADDRESS]");
    }
}
