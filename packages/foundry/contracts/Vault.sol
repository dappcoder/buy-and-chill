// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PriceDataStorage.sol";
import "./PythIntegrator.sol";
import "./1inchIntegrator.sol";

/**
 * @title Vault
 * @dev Contract that manages moving average index tokens
 */
contract Vault is ERC20, Ownable {

    // Contracts
    PriceDataStorage public priceDataStorage;
    PythIntegrator public pythIntegrator;
    OneInchIntegrator public oneInchIntegrator;

    // Token addresses
    address public daiAddress;
    address public ethAddress;
    address public btcAddress;

    // Token decimals
    uint8 public constant DAI_DECIMALS = 18;
    uint8 public constant PRICE_DECIMALS = 8;

    // Rebalancing parameters
    uint256 public rebalanceThreshold = 5; // 5% threshold for rebalancing
    uint256 public slippageTolerance = 1;  // 1% slippage tolerance
    
    // MA token types
    enum MAType { ETH_USD_2000_DMA, BTC_USD_200_WMA }

    // Mapping from MA type to its token
    mapping(MAType => ERC20) public maTokens;

    // Instrument mapping
    mapping(MAType => PriceDataStorage.Instrument) public instrumentMapping;

    // Events
    event Deposit(address indexed user, MAType indexed maType, uint256 daiAmount, uint256 maTokens);
    event Withdraw(address indexed user, MAType indexed maType, uint256 maTokens, uint256 daiAmount);
    event Rebalanced(MAType indexed maType, uint256 ethAllocation, uint256 daiAllocation);

    constructor(
        address _priceDataStorage,
        address _pythIntegrator,
        address _oneInchIntegrator,
        address _daiAddress,
        address _ethAddress,
        address _btcAddress
    ) ERC20("MA Index Vault", "MAV") Ownable(msg.sender) {
        priceDataStorage = PriceDataStorage(_priceDataStorage);
        pythIntegrator = PythIntegrator(_pythIntegrator);
        oneInchIntegrator = OneInchIntegrator(_oneInchIntegrator);
        
        daiAddress = _daiAddress;
        ethAddress = _ethAddress;
        btcAddress = _btcAddress;
        
        // Initialize instrument mapping
        instrumentMapping[MAType.ETH_USD_2000_DMA] = PriceDataStorage.Instrument.ETH_USD_2000_DMA;
        instrumentMapping[MAType.BTC_USD_200_WMA] = PriceDataStorage.Instrument.BTC_USD_200_WMA;
    }

    /**
     * @dev Deposit DAI to mint MA tokens
     * @param maType The type of MA token to mint
     * @param daiAmount The amount of DAI to deposit
     * @return Amount of MA tokens minted
     */
    function deposit(MAType maType, uint256 daiAmount) external returns (uint256) {
        require(daiAmount > 0, "DAI amount must be greater than 0");
        
        // Get the current MA value
        uint256 maValue = priceDataStorage.getMA(instrumentMapping[maType]);
        require(maValue > 0, "MA value not available");
        
        // Calculate how many MA tokens to mint
        // DAI has 18 decimals, MA price has 8 decimals
        uint256 maTokensToMint = (daiAmount * 10**PRICE_DECIMALS) / maValue;
        
        // Transfer DAI from user to vault
        IERC20(daiAddress).transferFrom(msg.sender, address(this), daiAmount);
        
        // Check if rebalancing is needed
        rebalanceIfNeeded(maType);
        
        // Mint MA tokens to user
        _mint(msg.sender, maTokensToMint);
        
        emit Deposit(msg.sender, maType, daiAmount, maTokensToMint);
        
        return maTokensToMint;
    }

    /**
     * @dev Burn MA tokens to withdraw DAI
     * @param maType The type of MA token to burn
     * @param maTokenAmount The amount of MA tokens to burn
     * @return Amount of DAI withdrawn
     */
    function withdraw(MAType maType, uint256 maTokenAmount) external returns (uint256) {
        require(maTokenAmount > 0, "MA token amount must be greater than 0");
        require(balanceOf(msg.sender) >= maTokenAmount, "Insufficient MA tokens");
        
        // Get the current MA value
        uint256 maValue = priceDataStorage.getMA(instrumentMapping[maType]);
        require(maValue > 0, "MA value not available");
        
        // Calculate how much DAI to return
        // DAI has 18 decimals, MA price has 8 decimals
        uint256 daiToReturn = (maTokenAmount * maValue) / 10**PRICE_DECIMALS;
        
        // Check if rebalancing is needed
        rebalanceIfNeeded(maType);
        
        // Burn MA tokens from user
        _burn(msg.sender, maTokenAmount);
        
        // Transfer DAI to user
        IERC20(daiAddress).transfer(msg.sender, daiToReturn);
        
        emit Withdraw(msg.sender, maType, maTokenAmount, daiToReturn);
        
        return daiToReturn;
    }

    /**
     * @dev Rebalance the vault's assets if needed
     * @param maType The type of MA to rebalance for
     */
    function rebalanceIfNeeded(MAType maType) internal {
        // Get current price and MA value
        uint256 currentPrice;
        if (maType == MAType.ETH_USD_2000_DMA) {
            // In a real implementation, this would get the current ETH price from Pyth
            // For this dummy implementation, use the latest price from storage
            currentPrice = priceDataStorage.getLatestPrice(instrumentMapping[maType]);
        } else {
            // For BTC
            currentPrice = priceDataStorage.getLatestPrice(instrumentMapping[maType]);
        }
        
        uint256 maValue = priceDataStorage.getMA(instrumentMapping[maType]);
        require(maValue > 0 && currentPrice > 0, "Price data not available");
        
        // Calculate target allocation percentages
        // crypto_allocation = 50% * (MA / current_price)
        uint256 targetCryptoPercent = (50 * maValue * 100) / currentPrice / 100;
        // Cap at 100%
        if (targetCryptoPercent > 100) {
            targetCryptoPercent = 100;
        }
        
        uint256 targetDaiPercent = 100 - targetCryptoPercent;
        
        // Calculate current allocation
        address cryptoAddress = maType == MAType.ETH_USD_2000_DMA ? ethAddress : btcAddress;
        uint256 cryptoBalance = IERC20(cryptoAddress).balanceOf(address(this));
        uint256 daiBalance = IERC20(daiAddress).balanceOf(address(this));
        
        // Calculate total value in DAI
        uint256 cryptoValueInDai = (cryptoBalance * currentPrice) / 10**PRICE_DECIMALS;
        uint256 totalValueInDai = cryptoValueInDai + daiBalance;
        
        if (totalValueInDai == 0) {
            return; // Nothing to rebalance
        }
        
        // Calculate current percentages
        uint256 currentCryptoPercent = (cryptoValueInDai * 100) / totalValueInDai;
        uint256 currentDaiPercent = 100 - currentCryptoPercent;
        
        // Check if rebalancing is needed
        uint256 deviation;
        if (currentCryptoPercent > targetCryptoPercent) {
            deviation = currentCryptoPercent - targetCryptoPercent;
        } else {
            deviation = targetCryptoPercent - currentCryptoPercent;
        }
        
        if (deviation > rebalanceThreshold) {
            // Rebalancing needed
            if (currentCryptoPercent < targetCryptoPercent) {
                // Need to buy more crypto
                uint256 daiToSwap = (totalValueInDai * (targetCryptoPercent - currentCryptoPercent)) / 100;
                
                // In a real implementation, this would call 1inch to swap DAI for crypto
                // For this dummy implementation, just emit an event
                emit Rebalanced(maType, targetCryptoPercent, targetDaiPercent);
            } else {
                // Need to sell crypto
                uint256 cryptoToSwap = (cryptoBalance * (currentCryptoPercent - targetCryptoPercent)) / currentCryptoPercent;
                
                // In a real implementation, this would call 1inch to swap crypto for DAI
                // For this dummy implementation, just emit an event
                emit Rebalanced(maType, targetCryptoPercent, targetDaiPercent);
            }
        }
    }

    /**
     * @dev Get the current MA value in USD (with 8 decimals)
     * @param maType The type of MA to query
     * @return The current MA value
     */
    function getMAValue(MAType maType) external view returns (uint256) {
        return priceDataStorage.getMA(instrumentMapping[maType]);
    }

    /**
     * @dev Get the latest price for an instrument
     * @param maType The type of MA to query
     * @return The latest price
     */
    function getLatestPrice(MAType maType) external view returns (uint256) {
        return priceDataStorage.getLatestPrice(instrumentMapping[maType]);
    }

    /**
     * @dev Set the rebalance threshold
     * @param _rebalanceThreshold New threshold (percentage)
     */
    function setRebalanceThreshold(uint256 _rebalanceThreshold) external onlyOwner {
        require(_rebalanceThreshold > 0 && _rebalanceThreshold <= 20, "Invalid threshold");
        rebalanceThreshold = _rebalanceThreshold;
    }

    /**
     * @dev Set the slippage tolerance
     * @param _slippageTolerance New tolerance (percentage)
     */
    function setSlippageTolerance(uint256 _slippageTolerance) external onlyOwner {
        require(_slippageTolerance > 0 && _slippageTolerance <= 5, "Invalid tolerance");
        slippageTolerance = _slippageTolerance;
    }
}