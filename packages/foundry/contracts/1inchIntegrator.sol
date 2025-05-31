// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OneInchIntegrator
 * @dev Contract for facilitating token swaps with 1inch DEX aggregator
 * Includes mock functionality for testing and development
 */
contract OneInchIntegrator is Ownable {
    // Events
    event SwapExecuted(
        address indexed fromToken,
        address indexed toToken,
        uint256 fromAmount,
        uint256 toAmount,
        bool isMockSwap
    );
    
    event MockModeToggled(bool isMockEnabled);
    event MockParamsUpdated(string paramName, uint256 value);
    event MockFailureToggled(string failureType, bool isEnabled);
    event MockLatencyUpdated(uint256 latencyMs);

    // Only the vault can call swap functions
    address public vaultAddress;
    
    // Mock mode configuration
    bool public mockModeEnabled = false;
    
    // Mock swap parameters
    uint256 public mockSlippagePercent = 50; // 0.5% default slippage (in basis points)
    uint256 public mockPriceImpactPercent = 30; // 0.3% default price impact (in basis points)
    uint256 public mockLiquidityThreshold = 1000 * 10**18; // 1000 tokens threshold for liquidity constraints
    uint256 public mockLatencyMs = 0; // Simulated network latency in milliseconds
    
    // Mock failure scenarios
    bool public mockInsufficientLiquidityEnabled = false;
    bool public mockHighPriceImpactEnabled = false;
    bool public mockNetworkErrorEnabled = false;
    
    // Mock transaction path data
    struct SwapPathNode {
        address protocol;
        address fromToken;
        address toToken;
        uint256 portion; // in basis points (100 = 1%)
    }
    
    SwapPathNode[] public mockSwapPath;
    
    // Gas estimates for mock transactions
    uint256 public mockGasEstimate = 250000; // Default gas estimate
    
    modifier onlyVault() {
        require(msg.sender == vaultAddress, "Only vault can call");
        _;
    }
    
    modifier mockLatencyDelay() {
        if (mockModeEnabled && mockLatencyMs > 0) {
            // This is a simplistic way to simulate delay
            // In production, you might use a more sophisticated approach
            uint256 endTime = block.timestamp + (mockLatencyMs / 1000);
            require(block.timestamp >= endTime, "Network latency simulation");
        }
        _;
    }

    constructor() Ownable(msg.sender) {
        // Initialize default mock swap path
        mockSwapPath.push(SwapPathNode({
            protocol: address(0x1111111111111111111111111111111111111111), // 1inch router
            fromToken: address(0), // Will be replaced in swap
            toToken: address(0), // Will be replaced in swap
            portion: 10000 // 100%
        }));
    }
    
    /**
     * @dev Set the vault address
     * @param _vaultAddress The address of the vault contract
     */
    function setVaultAddress(address _vaultAddress) external onlyOwner {
        require(_vaultAddress != address(0), "Invalid vault address");
        vaultAddress = _vaultAddress;
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
     * @dev Set mock slippage percentage (in basis points, 100 = 1%)
     * @param _slippagePercent The slippage percentage in basis points
     */
    function setMockSlippage(uint256 _slippagePercent) external onlyOwner {
        require(_slippagePercent <= 1000, "Slippage too high"); // Max 10%
        mockSlippagePercent = _slippagePercent;
        emit MockParamsUpdated("slippage", _slippagePercent);
    }
    
    /**
     * @dev Set mock price impact percentage (in basis points, 100 = 1%)
     * @param _priceImpactPercent The price impact percentage in basis points
     */
    function setMockPriceImpact(uint256 _priceImpactPercent) external onlyOwner {
        require(_priceImpactPercent <= 2000, "Price impact too high"); // Max 20%
        mockPriceImpactPercent = _priceImpactPercent;
        emit MockParamsUpdated("priceImpact", _priceImpactPercent);
    }
    
    /**
     * @dev Set mock liquidity threshold
     * @param _liquidityThreshold The threshold amount for liquidity constraints
     */
    function setMockLiquidityThreshold(uint256 _liquidityThreshold) external onlyOwner {
        mockLiquidityThreshold = _liquidityThreshold;
        emit MockParamsUpdated("liquidityThreshold", _liquidityThreshold);
    }
    
    /**
     * @dev Set mock network latency in milliseconds
     * @param _latencyMs The simulated network latency in milliseconds
     */
    function setMockLatency(uint256 _latencyMs) external onlyOwner {
        require(_latencyMs <= 30000, "Latency too high"); // Max 30 seconds
        mockLatencyMs = _latencyMs;
        emit MockLatencyUpdated(_latencyMs);
    }
    
    /**
     * @dev Toggle mock insufficient liquidity failure scenario
     * @param _enabled Whether the scenario should be enabled
     */
    function setMockInsufficientLiquidity(bool _enabled) external onlyOwner {
        mockInsufficientLiquidityEnabled = _enabled;
        emit MockFailureToggled("insufficientLiquidity", _enabled);
    }
    
    /**
     * @dev Toggle mock high price impact failure scenario
     * @param _enabled Whether the scenario should be enabled
     */
    function setMockHighPriceImpact(bool _enabled) external onlyOwner {
        mockHighPriceImpactEnabled = _enabled;
        emit MockFailureToggled("highPriceImpact", _enabled);
    }
    
    /**
     * @dev Toggle mock network error failure scenario
     * @param _enabled Whether the scenario should be enabled
     */
    function setMockNetworkError(bool _enabled) external onlyOwner {
        mockNetworkErrorEnabled = _enabled;
        emit MockFailureToggled("networkError", _enabled);
    }
    
    /**
     * @dev Set mock gas estimate
     * @param _gasEstimate The estimated gas for mock swaps
     */
    function setMockGasEstimate(uint256 _gasEstimate) external onlyOwner {
        mockGasEstimate = _gasEstimate;
        emit MockParamsUpdated("gasEstimate", _gasEstimate);
    }
    
    /**
     * @dev Clear and set a new mock swap path
     * @param _protocols Array of protocol addresses
     * @param _tokens Array of intermediate token addresses
     * @param _portions Array of portions in basis points
     */
    function setMockSwapPath(
        address[] calldata _protocols,
        address[] calldata _tokens,
        uint256[] calldata _portions
    ) external onlyOwner {
        require(_protocols.length == _portions.length, "Array length mismatch");
        require(_tokens.length == _protocols.length + 1, "Tokens array length mismatch");
        
        delete mockSwapPath;
        
        uint256 totalPortion = 0;
        for (uint256 i = 0; i < _protocols.length; i++) {
            mockSwapPath.push(SwapPathNode({
                protocol: _protocols[i],
                fromToken: _tokens[i],
                toToken: _tokens[i+1],
                portion: _portions[i]
            }));
            totalPortion += _portions[i];
        }
        
        require(totalPortion == 10000, "Portions must sum to 100%");
    }

    /**
     * @dev Implementation of swap function that supports both real and mock modes
     * @param fromToken The token to swap from
     * @param toToken The token to swap to
     * @param fromAmount The amount of fromToken to swap
     * @return The amount of toToken received
     */
    function swap(
        address fromToken,
        address toToken,
        uint256 fromAmount
    ) external onlyVault mockLatencyDelay returns (uint256) {
        // Check if the vault has enough tokens to swap
        IERC20 source = IERC20(fromToken);
        require(source.balanceOf(vaultAddress) >= fromAmount, "Insufficient source tokens");
        
        if (mockModeEnabled) {
            return _mockSwap(fromToken, toToken, fromAmount);
        } else {
            // In a real implementation, this would call 1inch with actual swap logic
            // For now, we'll use a simple implementation
            uint256 toAmount = fromAmount; // Simplified 1:1 exchange
            
            emit SwapExecuted(fromToken, toToken, fromAmount, toAmount, false);
            return toAmount;
        }
    }
    
    /**
     * @dev Internal function to handle mock swaps
     */
    function _mockSwap(
        address fromToken,
        address toToken,
        uint256 fromAmount
    ) internal returns (uint256) {
        // Simulate failure scenarios if enabled
        if (mockNetworkErrorEnabled) {
            revert("Mock network error");
        }
        
        if (mockInsufficientLiquidityEnabled && fromAmount > mockLiquidityThreshold) {
            revert("Mock insufficient liquidity");
        }
        
        // Calculate effective price with slippage and price impact
        uint256 effectiveSlippage = mockSlippagePercent;
        uint256 effectivePriceImpact = mockPriceImpactPercent;
        
        // Increase price impact for large orders
        if (fromAmount > mockLiquidityThreshold / 2) {
            uint256 scaleFactor = (fromAmount * 100) / mockLiquidityThreshold;
            effectivePriceImpact = effectivePriceImpact * (100 + scaleFactor) / 100;
        }
        
        if (mockHighPriceImpactEnabled) {
            effectivePriceImpact = 1000; // 10% price impact
        }
        
        // Check if price impact is too high
        if (effectivePriceImpact > 500) { // 5% threshold
            revert("Mock price impact too high");
        }
        
        // Calculate the final amount with slippage and price impact
        uint256 baseAmount = fromAmount;
        uint256 toAmount = baseAmount * (10000 - effectiveSlippage - effectivePriceImpact) / 10000;
        
        emit SwapExecuted(fromToken, toToken, fromAmount, toAmount, true);
        return toAmount;
    }
    
    /**
     * @dev Get quote for a swap
     * @param fromToken The token to swap from
     * @param toToken The token to swap to
     * @param fromAmount The amount of fromToken to swap
     * @return The estimated amount of toToken to receive
     */
    function getSwapQuote(
        address fromToken,
        address toToken,
        uint256 fromAmount
    ) external view returns (uint256) {
        if (mockModeEnabled) {
            // Apply mock slippage and price impact
            uint256 effectiveSlippage = mockSlippagePercent;
            uint256 effectivePriceImpact = mockPriceImpactPercent;
            
            // Increase price impact for large orders
            if (fromAmount > mockLiquidityThreshold / 2) {
                uint256 scaleFactor = (fromAmount * 100) / mockLiquidityThreshold;
                effectivePriceImpact = effectivePriceImpact * (100 + scaleFactor) / 100;
            }
            
            if (mockHighPriceImpactEnabled) {
                effectivePriceImpact = 1000; // 10% price impact
            }
            
            // Calculate the final amount with slippage and price impact
            uint256 baseAmount = fromAmount;
            return baseAmount * (10000 - effectiveSlippage - effectivePriceImpact) / 10000;
        } else {
            // In a real implementation, this would query 1inch for a quote
            return fromAmount; // Simplified 1:1 exchange
        }
    }
    
    /**
     * @dev Get the estimated gas cost for a swap
     * @return The estimated gas amount
     */
    function getEstimatedGas() external view returns (uint256) {
        return mockModeEnabled ? mockGasEstimate : 250000; // Default estimate
    }
    
    /**
     * @dev Get the mock swap path for UI display
     * @return protocols Array of protocol addresses
     * @return tokens Array of token addresses
     * @return portions Array of portions in basis points
     */
    function getMockSwapPath() external view returns (
        address[] memory protocols,
        address[] memory tokens,
        uint256[] memory portions
    ) {
        protocols = new address[](mockSwapPath.length);
        tokens = new address[](mockSwapPath.length + 1);
        portions = new uint256[](mockSwapPath.length);
        
        if (mockSwapPath.length > 0) {
            tokens[0] = mockSwapPath[0].fromToken;
            
            for (uint256 i = 0; i < mockSwapPath.length; i++) {
                protocols[i] = mockSwapPath[i].protocol;
                tokens[i+1] = mockSwapPath[i].toToken;
                portions[i] = mockSwapPath[i].portion;
            }
        }
        
        return (protocols, tokens, portions);
    }
}