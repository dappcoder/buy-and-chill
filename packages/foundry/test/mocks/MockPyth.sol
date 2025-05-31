// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockPyth
 * @dev A simple mock for the Pyth Network oracle
 */
contract MockPyth {
    // Define the Price struct to match the one in Pyth
    struct Price {
        int64 price;
        uint64 conf;
        int32 expo;
        uint publishTime;
    }

    // Map price feed IDs to prices
    mapping(bytes32 => Price) public prices;
    
    // Price feed IDs for supported assets (matching the ones in PythIntegrator)
    bytes32 public constant ETH_USD_PRICE_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
    bytes32 public constant BTC_USD_PRICE_ID = 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43;
    
    constructor() {
        // Initialize with default prices
        setPrice(ETH_USD_PRICE_ID, 250000000000, 10000000, -8, block.timestamp); // $2,500.00
        setPrice(BTC_USD_PRICE_ID, 4000000000000, 50000000, -8, block.timestamp); // $40,000.00
    }
    
    /**
     * @dev Set the price for a specific feed
     */
    function setPrice(
        bytes32 priceId,
        int64 price,
        uint64 conf,
        int32 expo,
        uint publishTime
    ) public {
        prices[priceId] = Price(price, conf, expo, publishTime);
    }
    
    /**
     * @dev Update price feeds (mock implementation)
     */
    function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable {
        // In the mock, we don't need to do anything with the updateData
        // This just simulates the function that would be called in the real Pyth contract
    }
    
    /**
     * @dev Get the update fee for price data (mock implementation)
     */
    function getUpdateFee(bytes[] calldata priceUpdateData) external pure returns (uint) {
        // Mock a small fee
        return 0.01 ether;
    }
    
    /**
     * @dev Get price for a feed ID (unsafe version - doesn't check staleness)
     */
    function getPriceUnsafe(bytes32 priceId) external view returns (Price memory) {
        return prices[priceId];
    }
    
    /**
     * @dev Get price for a feed ID (safe version - checks staleness)
     */
    function getPrice(bytes32 priceId) external view returns (Price memory) {
        Price memory price = prices[priceId];
        require(price.publishTime > 0, "Price not found");
        return price;
    }
}
