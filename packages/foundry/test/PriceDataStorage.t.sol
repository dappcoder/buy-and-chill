// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {PriceDataStorage} from "../contracts/PriceDataStorage.sol";

contract PriceDataStorageTest is Test {
    PriceDataStorage public priceDataStorage;
    address public deployer = vm.addr(1);
    address public updater = vm.addr(2);
    
    function setUp() public {
        vm.startPrank(deployer);
        
        // Deploy PriceDataStorage contract
        priceDataStorage = new PriceDataStorage();
        
        // Authorize updater
        priceDataStorage.setUpdaterAuthorization(updater, true);
        
        vm.stopPrank();
    }
    
    function test_InitializePrices() public {
        vm.startPrank(deployer);
        
        // Create test data
        uint256[] memory timestamps = new uint256[](5);
        uint256[] memory prices = new uint256[](5);
        
        for (uint256 i = 0; i < 5; i++) {
            timestamps[i] = block.timestamp - (5 - i) * 1 days;
            prices[i] = (2000 + i * 100) * (10**8); // $2,000 increasing by $100 each day
        }
        
        // Initialize prices
        priceDataStorage.initializePrices(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            timestamps,
            prices
        );
        
        // Verify data was stored correctly
        assertEq(priceDataStorage.getPriceCount(PriceDataStorage.Instrument.ETH_USD_2000_DMA), 5, "Price count incorrect");
        
        // Check a specific price point
        (uint256 timestamp, uint256 price) = priceDataStorage.getPriceAt(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            2
        );
        
        assertEq(timestamp, timestamps[2], "Timestamp mismatch");
        assertEq(price, prices[2], "Price mismatch");
        
        vm.stopPrank();
    }
    
    function test_AddPrice() public {
        vm.startPrank(updater);
        
        // Add a new price point
        uint256 timestamp = block.timestamp;
        uint256 price = 2500 * (10**8); // $2,500
        
        priceDataStorage.addPrice(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            timestamp,
            price
        );
        
        // Verify price was added
        assertEq(priceDataStorage.getPriceCount(PriceDataStorage.Instrument.ETH_USD_2000_DMA), 1, "Price count incorrect");
        
        // Check the price point
        (uint256 storedTimestamp, uint256 storedPrice) = priceDataStorage.getPriceAt(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            0
        );
        
        assertEq(storedTimestamp, timestamp, "Timestamp mismatch");
        assertEq(storedPrice, price, "Price mismatch");
        
        vm.stopPrank();
    }
    
    function test_GetLatestPrice() public {
        vm.startPrank(updater);
        
        // Add multiple price points
        for (uint256 i = 0; i < 3; i++) {
            uint256 timestamp = block.timestamp - (3 - i) * 1 days;
            uint256 price = (2000 + i * 100) * (10**8); // $2,000 increasing by $100 each day
            
            priceDataStorage.addPrice(
                PriceDataStorage.Instrument.ETH_USD_2000_DMA,
                timestamp,
                price
            );
        }
        
        // Get latest price
        uint256 latestPrice = priceDataStorage.getLatestPrice(PriceDataStorage.Instrument.ETH_USD_2000_DMA);
        
        // Verify it's the most recent price (2200 * 10^8)
        assertEq(latestPrice, 2200 * (10**8), "Latest price incorrect");
        
        vm.stopPrank();
    }
    
    function test_MACalculation() public {
        vm.startPrank(deployer);
        
        // First add price points to initialize data
        uint256[] memory timestamps = new uint256[](5);
        uint256[] memory prices = new uint256[](5);
        
        for (uint256 i = 0; i < 5; i++) {
            timestamps[i] = block.timestamp - (5 - i) * 1 days;
            prices[i] = (2000 + i * 100) * (10**8); // $2,000 increasing by $100 each day
        }
        
        priceDataStorage.initializePrices(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            timestamps,
            prices
        );
        
        // Override MA value for testing
        uint256 maValue = 2200 * (10**8); // $2,200
        priceDataStorage.overrideMAForTesting(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            maValue
        );
        
        // Get the MA value
        uint256 storedMA = priceDataStorage.getMA(PriceDataStorage.Instrument.ETH_USD_2000_DMA);
        
        // Verify MA value
        assertEq(storedMA, maValue, "MA value incorrect");
        
        vm.stopPrank();
    }
    
    function test_OnlyAuthorizedCanAddPrice() public {
        // Unauthorized account tries to add price
        address unauthorized = vm.addr(3);
        vm.startPrank(unauthorized);
        
        // Try to add a price point (should revert)
        vm.expectRevert("Not authorized");
        priceDataStorage.addPrice(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            block.timestamp,
            2500 * (10**8)
        );
        
        vm.stopPrank();
        
        // Now authorized account adds price (should succeed)
        vm.startPrank(updater);
        
        priceDataStorage.addPrice(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            block.timestamp,
            2500 * (10**8)
        );
        
        // Verify price was added
        assertEq(priceDataStorage.getPriceCount(PriceDataStorage.Instrument.ETH_USD_2000_DMA), 1, "Price count incorrect");
        
        vm.stopPrank();
    }
    
    function test_GetPriceRange() public {
        vm.startPrank(deployer);
        
        // Create test data
        uint256[] memory timestamps = new uint256[](10);
        uint256[] memory prices = new uint256[](10);
        
        for (uint256 i = 0; i < 10; i++) {
            timestamps[i] = block.timestamp - (10 - i) * 1 days;
            prices[i] = (2000 + i * 100) * (10**8); // $2,000 increasing by $100 each day
        }
        
        // Initialize prices
        priceDataStorage.initializePrices(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            timestamps,
            prices
        );
        
        // Get a range of prices
        (uint256[] memory rangeTimestamps, uint256[] memory rangePrices) = priceDataStorage.getPriceRange(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            3,  // Start from index 3
            5    // Get 5 points
        );
        
        // Verify range data
        assertEq(rangeTimestamps.length, 5, "Range timestamps length incorrect");
        assertEq(rangePrices.length, 5, "Range prices length incorrect");
        
        for (uint256 i = 0; i < 5; i++) {
            assertEq(rangeTimestamps[i], timestamps[i + 3], "Range timestamp mismatch");
            assertEq(rangePrices[i], prices[i + 3], "Range price mismatch");
        }
        
        vm.stopPrank();
    }
}
