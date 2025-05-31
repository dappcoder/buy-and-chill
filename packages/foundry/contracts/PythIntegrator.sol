// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

/**
 * @title PythIntegrator
 * @dev Contract for integrating with Pyth Network price feeds using the Pull method
 * 
 * This contract demonstrates how to:
 * 1. Pull/Fetch the data from Hermes
 * 2. Update the data on chain using updatePriceFeeds method
 * 3. Consume the price
 */
contract PythIntegrator {
    // Pyth Network contract interface
    IPyth public pyth;

    // Price feed IDs for supported assets
    bytes32 public constant ETH_USD_PRICE_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
    bytes32 public constant BTC_USD_PRICE_ID = 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43;

    // Cached prices (updated whenever updatePriceFeeds is called)
    mapping(bytes32 => PythStructs.Price) public latestPrices;
    
    // Events
    event PriceUpdated(bytes32 indexed priceId, int64 price, uint64 conf, int32 expo, uint publishTime);
    event AllPricesUpdated(uint updateTime, uint fee);

    /**
     * @dev Constructor that sets the Pyth contract address
     * @param pythContract The address of the Pyth contract on the current network
     */
    constructor(address pythContract) {
        require(pythContract != address(0), "Invalid Pyth contract address");
        pyth = IPyth(pythContract);
    }

    /**
     * @dev Updates price feeds with the provided update data and caches the latest prices
     * @param priceUpdateData The price update data obtained from Pyth's Hermes API
     * @notice This function must be called with sufficient ETH to cover the update fee
     */
    function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable {
        // Calculate the required fee for updating price feeds
        uint fee = pyth.getUpdateFee(priceUpdateData);
        
        // Ensure enough ETH was sent to cover the fee
        require(msg.value >= fee, "Insufficient fee");
        
        // Update the price feeds on the Pyth contract
        pyth.updatePriceFeeds{value: fee}(priceUpdateData);
        
        // Cache the updated prices
        _updateCachedPrices();
        
        // Refund any excess ETH
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
        
        emit AllPricesUpdated(block.timestamp, fee);
    }
    
    /**
     * @dev Updates the cached prices after price feeds have been updated
     * @notice This is called internally after updating price feeds
     */
    function _updateCachedPrices() internal {
        // Update cached ETH/USD price
        try pyth.getPriceUnsafe(ETH_USD_PRICE_ID) returns (PythStructs.Price memory ethPrice) {
            latestPrices[ETH_USD_PRICE_ID] = ethPrice;
            emit PriceUpdated(
                ETH_USD_PRICE_ID,
                ethPrice.price,
                ethPrice.conf,
                ethPrice.expo,
                ethPrice.publishTime
            );
        } catch {}
        
        // Update cached BTC/USD price
        try pyth.getPriceUnsafe(BTC_USD_PRICE_ID) returns (PythStructs.Price memory btcPrice) {
            latestPrices[BTC_USD_PRICE_ID] = btcPrice;
            emit PriceUpdated(
                BTC_USD_PRICE_ID,
                btcPrice.price,
                btcPrice.conf,
                btcPrice.expo,
                btcPrice.publishTime
            );
        } catch {}
    }

    /**
     * @dev Gets the latest ETH/USD price 
     * @return The latest ETH/USD price structure
     */
    function getLatestEthUsdPrice() external view returns (PythStructs.Price memory) {
        // Check if we have a cached price
        if (latestPrices[ETH_USD_PRICE_ID].publishTime > 0) {
            return latestPrices[ETH_USD_PRICE_ID];
        }
        
        // If no cached price, get it directly from Pyth
        return pyth.getPriceUnsafe(ETH_USD_PRICE_ID);
    }
    
    /**
     * @dev Gets the latest BTC/USD price 
     * @return The latest BTC/USD price structure
     */
    function getLatestBtcUsdPrice() external view returns (PythStructs.Price memory) {
        // Check if we have a cached price
        if (latestPrices[BTC_USD_PRICE_ID].publishTime > 0) {
            return latestPrices[BTC_USD_PRICE_ID];
        }
        
        // If no cached price, get it directly from Pyth
        return pyth.getPriceUnsafe(BTC_USD_PRICE_ID);
    }
    
    /**
     * @dev Gets the latest price for any supported price ID
     * @param priceId The Pyth price feed ID
     * @return The latest price structure for the requested price ID
     */
    function getLatestPrice(bytes32 priceId) external view returns (PythStructs.Price memory) {
        // Check if we have a cached price
        if (latestPrices[priceId].publishTime > 0) {
            return latestPrices[priceId];
        }
        
        // If no cached price, get it directly from Pyth
        return pyth.getPriceUnsafe(priceId);
    }
    
    /**
     * @dev Converts the Pyth price to USD with 8 decimals
     * @param priceId The Pyth price feed ID
     * @return Price in USD with 8 decimals
     */
    function getPriceUsd8Decimals(bytes32 priceId) public view returns (uint256) {
        PythStructs.Price memory price;
        
        // Get the price from cache or directly from Pyth
        if (latestPrices[priceId].publishTime > 0) {
            price = latestPrices[priceId];
        } else {
            price = pyth.getPriceUnsafe(priceId);
        }
        
        // Convert the price to USD with 8 decimals
        // Pyth prices are stored as a price with a confidence interval and an exponent
        // For example, a price of 12.34 would be stored as price = 1234, expo = -2
        // To convert to 8 decimals, we adjust based on the exponent
        if (price.price < 0) {
            return 0; // Negative prices not supported
        }
        
        uint64 priceUint = uint64(uint64(price.price));
        int32 expo = price.expo;
        
        // Target 8 decimals
        int32 targetDecimals = -8;
        
        if (expo < targetDecimals) {
            // If expo is smaller (e.g., -10), we need to divide
            uint256 expoFactor = 10 ** uint32(targetDecimals - expo);
            return priceUint / expoFactor;
        } else if (expo > targetDecimals) {
            // If expo is larger (e.g., -6), we need to multiply
            uint256 expoFactor = 10 ** uint32(expo - targetDecimals);
            return priceUint * expoFactor;
        }
        
        // If expo already equals targetDecimals, return as is
        return priceUint;
    }
    
    /**
     * @dev Gets the ETH/USD price in USD with 8 decimals
     * @return ETH/USD price with 8 decimals
     */
    function getEthUsdPrice8Decimals() external view returns (uint256) {
        return getPriceUsd8Decimals(ETH_USD_PRICE_ID);
    }
    
    /**
     * @dev Gets the BTC/USD price in USD with 8 decimals
     * @return BTC/USD price with 8 decimals
     */
    function getBtcUsdPrice8Decimals() external view returns (uint256) {
        return getPriceUsd8Decimals(BTC_USD_PRICE_ID);
    }
    
    /**
     * @dev Gets the fee required to update price feeds
     * @param priceUpdateData The price update data obtained from Pyth's Hermes API
     * @return The fee required to update the price feeds
     */
    function getUpdateFee(bytes[] calldata priceUpdateData) external view returns (uint) {
        return pyth.getUpdateFee(priceUpdateData);
    }
}
