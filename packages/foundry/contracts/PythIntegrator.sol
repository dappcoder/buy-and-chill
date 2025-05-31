// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PythIntegrator
 * @dev Contract for integrating with Pyth Network price feeds using the Pull method
 * Includes mock functionality for testing and development
 * 
 * This contract demonstrates how to:
 * 1. Pull/Fetch the data from Hermes
 * 2. Update the data on chain using updatePriceFeeds method
 * 3. Consume the price
 * 4. Use mock mode for testing without real Pyth Network connection
 */
contract PythIntegrator is Ownable {
    // Pyth Network contract interface
    IPyth public pyth;

    // Price feed IDs for supported assets
    bytes32 public constant ETH_USD_PRICE_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
    bytes32 public constant BTC_USD_PRICE_ID = 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43;

    // Cached prices (updated whenever updatePriceFeeds is called)
    mapping(bytes32 => PythStructs.Price) public latestPrices;
    
    // Mock mode configuration
    bool public mockModeEnabled = false;
    
    // Mock price data for testing
    mapping(bytes32 => PythStructs.Price) public mockPrices;
    
    // Mock volatility parameters (in basis points, 100 = 1%)
    uint256 public mockVolatilityPercent = 200; // 2% default volatility
    
    // Mock network parameters
    bool public mockNetworkOutageEnabled = false;
    bool public mockDelayedUpdateEnabled = false;
    uint256 public mockUpdateDelayBlocks = 0;
    uint256 public lastUpdateBlock = 0;
    
    // Authorized updaters
    mapping(address => bool) public authorizedUpdaters;
    
    // Events
    event PriceUpdated(bytes32 indexed priceId, int64 price, uint64 conf, int32 expo, uint publishTime);
    event AllPricesUpdated(uint updateTime, uint fee);
    event MockModeToggled(bool isMockEnabled);
    event MockPriceUpdated(bytes32 indexed priceId, int64 price, uint64 conf);
    event MockParamsUpdated(string paramName, uint256 value);
    event MockFailureToggled(string failureType, bool isEnabled);
    event UpdaterAuthorized(address updater, bool status);

    // Modifiers
    modifier onlyAuthorized() {
        require(owner() == msg.sender || authorizedUpdaters[msg.sender], "Not authorized");
        _;
    }
    
    /**
     * @dev Constructor that sets the Pyth contract address
     * @param pythContract The address of the Pyth contract on the current network
     */
    constructor(address pythContract) Ownable(msg.sender) {
        require(pythContract != address(0), "Invalid Pyth contract address");
        pyth = IPyth(pythContract);
        
        // Initialize default mock prices
        _initializeMockPrices();
    }
    
    /**
     * @dev Initialize default mock prices
     */
    function _initializeMockPrices() internal {
        // Default ETH price: $2500 with 8 decimals precision
        mockPrices[ETH_USD_PRICE_ID] = PythStructs.Price({
            price: 250000000000, // $2500 with 8 decimals precision
            conf: 10000000, // $0.10 confidence
            expo: -8,
            publishTime: uint64(block.timestamp)
        });
        
        // Default BTC price: $35000 with 8 decimals precision
        mockPrices[BTC_USD_PRICE_ID] = PythStructs.Price({
            price: 3500000000000, // $35000 with 8 decimals precision
            conf: 100000000, // $1.00 confidence
            expo: -8,
            publishTime: uint64(block.timestamp)
        });
    }
    
    /**
     * @dev Toggle mock mode on/off
     * @param _enabled Whether mock mode should be enabled
     */
    function setMockModeEnabled(bool _enabled) external onlyOwner {
        mockModeEnabled = _enabled;
        emit MockModeToggled(_enabled);
    }
    
    /**
     * @dev Set mock price for a specific price feed ID
     * @param priceId The price feed ID to update
     * @param price The price value (with the same decimal precision as Pyth)
     * @param conf The confidence interval
     */
    function setMockPrice(bytes32 priceId, int64 price, uint64 conf) external onlyAuthorized {
        mockPrices[priceId] = PythStructs.Price({
            price: price,
            conf: conf,
            expo: -8, // Standard 8 decimals for USD prices
            publishTime: uint64(block.timestamp)
        });
        
        // If mock mode is enabled, update the latest prices as well
        if (mockModeEnabled) {
            latestPrices[priceId] = mockPrices[priceId];
        }
        
        emit MockPriceUpdated(priceId, price, conf);
    }
    
    /**
     * @dev Set mock volatility percentage (in basis points, 100 = 1%)
     * @param _volatilityPercent The volatility percentage in basis points
     */
    function setMockVolatility(uint256 _volatilityPercent) external onlyOwner {
        require(_volatilityPercent <= 5000, "Volatility too high"); // Max 50%
        mockVolatilityPercent = _volatilityPercent;
        emit MockParamsUpdated("volatility", _volatilityPercent);
    }
    
    /**
     * @dev Toggle mock network outage scenario
     * @param _enabled Whether the scenario should be enabled
     */
    function setMockNetworkOutage(bool _enabled) external onlyOwner {
        mockNetworkOutageEnabled = _enabled;
        emit MockFailureToggled("networkOutage", _enabled);
    }
    
    /**
     * @dev Toggle mock delayed update scenario
     * @param _enabled Whether the scenario should be enabled
     * @param _delayBlocks Number of blocks to delay updates
     */
    function setMockDelayedUpdate(bool _enabled, uint256 _delayBlocks) external onlyOwner {
        mockDelayedUpdateEnabled = _enabled;
        mockUpdateDelayBlocks = _delayBlocks;
        emit MockFailureToggled("delayedUpdate", _enabled);
        emit MockParamsUpdated("delayBlocks", _delayBlocks);
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

    /**
     * @dev Updates price feeds with the provided update data and caches the latest prices
     * @param priceUpdateData The price update data from Pyth Network
     * @notice This function must be called with sufficient ETH to cover the update fee
     */
    function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable {
        if (mockModeEnabled) {
            // In mock mode, simulate price updates without calling Pyth
            _updateMockPrices();
            emit AllPricesUpdated(block.timestamp, 0);
            
            // Refund all ETH since we're not calling Pyth
            if (msg.value > 0) {
                payable(msg.sender).transfer(msg.value);
            }
            return;
        }
        
        // In real mode, proceed with actual Pyth update
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
     * @dev Updates mock prices with random volatility and simulated network conditions
     * @notice This is called internally when in mock mode
     */
    function _updateMockPrices() internal {
        // Check if we should simulate network outage
        if (mockNetworkOutageEnabled) {
            // Do nothing - simulate network outage by not updating prices
            return;
        }
        
        // Check if we should simulate delayed updates
        if (mockDelayedUpdateEnabled) {
            if (block.number - lastUpdateBlock < mockUpdateDelayBlocks) {
                // Not enough blocks have passed, don't update yet
                return;
            }
        }
        
        // Record this update
        lastUpdateBlock = block.number;
        
        // Apply random volatility to ETH price
        PythStructs.Price memory ethPrice = mockPrices[ETH_USD_PRICE_ID];
        int64 ethPriceChange = int64(int256(_getRandomVolatilityChange(uint256(uint64(ethPrice.price)))));
        ethPrice.price += ethPriceChange;
        ethPrice.publishTime = uint64(block.timestamp);
        mockPrices[ETH_USD_PRICE_ID] = ethPrice;
        latestPrices[ETH_USD_PRICE_ID] = ethPrice;
        
        // Apply random volatility to BTC price
        PythStructs.Price memory btcPrice = mockPrices[BTC_USD_PRICE_ID];
        int64 btcPriceChange = int64(int256(_getRandomVolatilityChange(uint256(uint64(btcPrice.price)))));
        btcPrice.price += btcPriceChange;
        btcPrice.publishTime = uint64(block.timestamp);
        mockPrices[BTC_USD_PRICE_ID] = btcPrice;
        latestPrices[BTC_USD_PRICE_ID] = btcPrice;
        
        // Emit events for the updated prices
        emit PriceUpdated(
            ETH_USD_PRICE_ID,
            ethPrice.price,
            ethPrice.conf,
            ethPrice.expo,
            ethPrice.publishTime
        );
        
        emit PriceUpdated(
            BTC_USD_PRICE_ID,
            btcPrice.price,
            btcPrice.conf,
            btcPrice.expo,
            btcPrice.publishTime
        );
    }
    
    /**
     * @dev Calculates a random price change based on the configured volatility
     * @param currentPrice The current price to apply volatility to
     * @return The price change amount (can be positive or negative)
     */
    function _getRandomVolatilityChange(uint256 currentPrice) internal view returns (int256) {
        // Calculate maximum change based on volatility percentage
        uint256 maxChange = (currentPrice * mockVolatilityPercent) / 10000; // Convert basis points to percentage
        
        // Generate pseudo-random number using block data
        uint256 randomValue = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            block.difficulty // Using block.difficulty instead of block.prevrandao for compatibility
        )));
        
        // Calculate random change within the volatility range
        uint256 change = randomValue % maxChange;
        
        // Determine if change is positive or negative (50/50 chance)
        if (randomValue % 2 == 0) {
            return int256(change);
        } else {
            return -int256(change);
        }
    }

    /**
     * @dev Gets the latest ETH/USD price 
     * @return The latest ETH/USD price structure
     */
    function getLatestEthUsdPrice() external view returns (PythStructs.Price memory) {
        // In mock mode, return the mock price
        if (mockModeEnabled) {
            return mockPrices[ETH_USD_PRICE_ID];
        }
        
        // In real mode, check if we have a cached price
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
        // In mock mode, return the mock price
        if (mockModeEnabled) {
            return mockPrices[BTC_USD_PRICE_ID];
        }
        
        // In real mode, check if we have a cached price
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
