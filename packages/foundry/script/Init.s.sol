// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {PriceDataStorage} from "../contracts/PriceDataStorage.sol";
import {PythIntegrator} from "../contracts/PythIntegrator.sol";
import {OneInchIntegrator} from "../contracts/1inchIntegrator.sol";
import {Vault} from "../contracts/Vault.sol";
import {MockERC20} from "../contracts/mocks/MockERC20.sol";

/**
 * @title Init
 * @dev Comprehensive initialization script for the Buy and Chill dApp
 * Deploys all contracts, initializes data, and sets up mock integrations
 */
contract Init is Script {
    // Constants for token addresses on mainnet (used as references for mock tokens)
    address public constant MAINNET_DAI_ADDRESS = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant MAINNET_WETH_ADDRESS = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant MAINNET_WBTC_ADDRESS = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;

    // Pyth Network contract addresses by chain
    mapping(uint256 => address) private pythContracts;

    // Deployed contract addresses
    address public mockDaiAddress;
    address public mockWethAddress;
    address public mockWbtcAddress;
    address public priceDataStorageAddress;
    address public pythIntegratorAddress;
    address public oneInchIntegratorAddress;
    address public vaultAddress;

    // Constructor to initialize Pyth contract addresses
    constructor() {
        // Mainnet
        pythContracts[1] = 0x4305FB66699C3B2702D4d05CF36551390A4c69C6;
        // Arbitrum One
        pythContracts[42161] = 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C;
        // Sepolia
        pythContracts[11155111] = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729;
        // Arbitrum Sepolia
        pythContracts[421614] = 0x4ea2e9947cEBbC322450e487c1C548Dd76e2b82A;
        // Local development - default to Sepolia contract
        pythContracts[31337] = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729;
    }

    /**
     * @dev Run the initialization script
     * Deploys all contracts, initializes data, and sets up mock integrations
     */
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console2.log("=== Buy and Chill Initialization ===");
        console2.log("Deployer address:", deployer);
        console2.log("Chain ID:", block.chainid);
        
        // Start transaction
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy Mock Tokens (if on local network)
        deployMockTokens();
        
        // Step 2: Deploy PriceDataStorage
        deployPriceDataStorage();
        
        // Step 3: Deploy PythIntegrator (with mock mode enabled)
        deployPythIntegrator();
        
        // Step 4: Deploy 1inchIntegrator (with mock mode enabled)
        deploy1inchIntegrator();
        
        // Step 5: Deploy Vault (connecting all components)
        deployVault();
        
        // Step 6: Set up contract connections and authorizations
        setupContractConnections();
        
        // Step 7: Initialize Price Data
        initializePriceData();
        
        // Step 8: Set up mock price feeds in PythIntegrator
        setupMockPriceFeeds();
        
        // Step 9: Configure mock swap parameters in 1inchIntegrator
        setupMockSwapParameters();
        
        // Step 10: Mint tokens to the deployer wallet
        mintTokensToDeployer(deployer);
        
        // End transaction
        vm.stopBroadcast();
        
        // Print summary of deployed contracts
        printDeploymentSummary();
    }
    
    /**
     * @dev Deploy mock tokens for testing
     */
    function deployMockTokens() internal {
        console2.log("\n=== Deploying Mock Tokens ===");
        
        // Only deploy mock tokens on local networks
        if (block.chainid == 31337) {
            // Deploy mock tokens
            MockERC20 mockDai = new MockERC20("Mock DAI", "mDAI", 18);
            MockERC20 mockWeth = new MockERC20("Mock WETH", "mWETH", 18);
            MockERC20 mockWbtc = new MockERC20("Mock WBTC", "mWBTC", 8);
            
            mockDaiAddress = address(mockDai);
            mockWethAddress = address(mockWeth);
            mockWbtcAddress = address(mockWbtc);
            
            console2.log("Mock DAI deployed at:", mockDaiAddress);
            console2.log("Mock WETH deployed at:", mockWethAddress);
            console2.log("Mock WBTC deployed at:", mockWbtcAddress);
        } else {
            // On real networks, use the actual token addresses
            mockDaiAddress = MAINNET_DAI_ADDRESS;
            mockWethAddress = MAINNET_WETH_ADDRESS;
            mockWbtcAddress = MAINNET_WBTC_ADDRESS;
            
            console2.log("Using mainnet token addresses:");
            console2.log("DAI:", mockDaiAddress);
            console2.log("WETH:", mockWethAddress);
            console2.log("WBTC:", mockWbtcAddress);
        }
    }
    
    /**
     * @dev Deploy PriceDataStorage contract
     */
    function deployPriceDataStorage() internal {
        console2.log("\n=== Deploying PriceDataStorage ===");
        
        // Deploy the contract
        PriceDataStorage priceDataStorage = new PriceDataStorage();
        priceDataStorageAddress = address(priceDataStorage);
        
        console2.log("PriceDataStorage deployed at:", priceDataStorageAddress);
    }
    
    /**
     * @dev Deploy PythIntegrator contract with mock mode enabled
     */
    function deployPythIntegrator() internal {
        console2.log("\n=== Deploying PythIntegrator ===");
        
        // Get the appropriate Pyth contract address for the current network
        address pythAddress = pythContracts[block.chainid];
        
        // Deploy the PythIntegrator contract
        PythIntegrator pythIntegrator = new PythIntegrator(pythAddress);
        pythIntegratorAddress = address(pythIntegrator);
        
        // Enable mock mode for testing
        pythIntegrator.setMockModeEnabled(true);
        
        console2.log("PythIntegrator deployed at:", pythIntegratorAddress);
        console2.log("Using Pyth contract at:", pythAddress);
        console2.log("Mock mode enabled");
    }
    
    /**
     * @dev Deploy 1inchIntegrator contract with mock mode enabled
     */
    function deploy1inchIntegrator() internal {
        console2.log("\n=== Deploying 1inchIntegrator ===");
        
        // Deploy the OneInchIntegrator contract
        OneInchIntegrator oneInchIntegrator = new OneInchIntegrator();
        oneInchIntegratorAddress = address(oneInchIntegrator);
        
        // Enable mock mode for testing
        oneInchIntegrator.setMockModeEnabled(true);
        
        console2.log("OneInchIntegrator deployed at:", oneInchIntegratorAddress);
        console2.log("Mock mode enabled");
    }
    
    /**
     * @dev Deploy Vault contract connecting all components
     */
    function deployVault() internal {
        console2.log("\n=== Deploying Vault ===");
        
        // Deploy Vault contract
        Vault vault = new Vault(
            priceDataStorageAddress,
            pythIntegratorAddress,
            oneInchIntegratorAddress,
            mockDaiAddress,
            mockWethAddress,
            mockWbtcAddress
        );
        vaultAddress = address(vault);
        
        console2.log("Vault deployed at:", vaultAddress);
    }
    
    /**
     * @dev Set up contract connections and authorizations
     */
    function setupContractConnections() internal {
        console2.log("\n=== Setting Up Contract Connections ===");
        
        // Set the vault address in the OneInchIntegrator
        OneInchIntegrator oneInchIntegrator = OneInchIntegrator(oneInchIntegratorAddress);
        oneInchIntegrator.setVaultAddress(vaultAddress);
        console2.log("Set vault address in OneInchIntegrator");
        
        // Set the PriceDataStorage updater authorization for the PythIntegrator
        PriceDataStorage priceDataStorage = PriceDataStorage(priceDataStorageAddress);
        priceDataStorage.setUpdaterAuthorization(pythIntegratorAddress, true);
        console2.log("Set updater authorization in PriceDataStorage for PythIntegrator");
        
        // Set the PriceDataStorage updater authorization for the deployer
        priceDataStorage.setUpdaterAuthorization(msg.sender, true);
        console2.log("Set updater authorization in PriceDataStorage for deployer");
    }
    
    /**
     * @dev Initialize price data for ETH/USD and BTC/USD
     * For a full initialization with historical data, use the InitializePriceData script separately
     * This function just adds a few initial data points for testing
     */
    function initializePriceData() internal {
        console2.log("\n=== Initializing Price Data ===");
        
        PriceDataStorage priceDataStorage = PriceDataStorage(priceDataStorageAddress);
        
        // Initialize with a small set of test data points
        // For ETH/USD
        uint256[] memory ethTimestamps = new uint256[](3);
        uint256[] memory ethPrices = new uint256[](3);
        
        // Current timestamp minus 3, 2, and 1 days
        ethTimestamps[0] = block.timestamp - 3 days;
        ethTimestamps[1] = block.timestamp - 2 days;
        ethTimestamps[2] = block.timestamp - 1 days;
        
        // Sample ETH prices with 8 decimals (e.g., $2500.00 = 250000000000)
        ethPrices[0] = 250000000000; // $2500
        ethPrices[1] = 255000000000; // $2550
        ethPrices[2] = 260000000000; // $2600
        
        try priceDataStorage.initializePrices(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            ethTimestamps,
            ethPrices
        ) {
            console2.log("Initialized ETH/USD price data with 3 sample points");
        } catch Error(string memory reason) {
            console2.log("Error initializing ETH/USD price data:", reason);
        }
        
        // For BTC/USD
        uint256[] memory btcTimestamps = new uint256[](3);
        uint256[] memory btcPrices = new uint256[](3);
        
        // Current timestamp minus 3, 2, and 1 days
        btcTimestamps[0] = block.timestamp - 3 days;
        btcTimestamps[1] = block.timestamp - 2 days;
        btcTimestamps[2] = block.timestamp - 1 days;
        
        // Sample BTC prices with 8 decimals (e.g., $35000.00 = 3500000000000)
        btcPrices[0] = 3500000000000; // $35000
        btcPrices[1] = 3600000000000; // $36000
        btcPrices[2] = 3650000000000; // $36500
        
        try priceDataStorage.initializePrices(
            PriceDataStorage.Instrument.BTC_USD_200_WMA,
            btcTimestamps,
            btcPrices
        ) {
            console2.log("Initialized BTC/USD price data with 3 sample points");
        } catch Error(string memory reason) {
            console2.log("Error initializing BTC/USD price data:", reason);
        }
        
        // Override MA values for testing (since we don't have enough data points for a real MA)
        priceDataStorage.overrideMAForTesting(PriceDataStorage.Instrument.ETH_USD_2000_DMA, 255000000000); // $2550
        priceDataStorage.overrideMAForTesting(PriceDataStorage.Instrument.BTC_USD_200_WMA, 3583333333333); // $35833.33
        
        console2.log("Set test MA values for ETH/USD and BTC/USD");
    }
    
    /**
     * @dev Set up mock price feeds in PythIntegrator
     */
    function setupMockPriceFeeds() internal {
        console2.log("\n=== Setting Up Mock Price Feeds ===");
        
        PythIntegrator pythIntegrator = PythIntegrator(pythIntegratorAddress);
        
        // Set mock prices for ETH/USD and BTC/USD
        // Current ETH price: $2600 with 8 decimals precision
        pythIntegrator.setMockPrice(
            0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace, // ETH_USD_PRICE_ID
            260000000000, // $2600 with 8 decimals
            10000000 // $0.10 confidence
        );
        
        // Current BTC price: $36500 with 8 decimals precision
        pythIntegrator.setMockPrice(
            0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43, // BTC_USD_PRICE_ID
            3650000000000, // $36500 with 8 decimals
            100000000 // $1.00 confidence
        );
        
        // Set mock volatility for price simulation
        pythIntegrator.setMockVolatility(200); // 2% volatility
        
        console2.log("Set mock ETH/USD price: $2600");
        console2.log("Set mock BTC/USD price: $36500");
        console2.log("Set mock volatility: 2%");
    }
    
    /**
     * @dev Configure mock swap parameters in 1inchIntegrator
     */
    function setupMockSwapParameters() internal {
        console2.log("\n=== Setting Up Mock Swap Parameters ===");
        
        OneInchIntegrator oneInchIntegrator = OneInchIntegrator(oneInchIntegratorAddress);
        
        // Set mock slippage and price impact
        oneInchIntegrator.setMockSlippage(50); // 0.5% slippage
        oneInchIntegrator.setMockPriceImpact(30); // 0.3% price impact
        
        // Set mock liquidity threshold
        oneInchIntegrator.setMockLiquidityThreshold(1000 * 10**18); // 1000 tokens
        
        // Set up mock swap path
        address[] memory protocols = new address[](1);
        address[] memory tokens = new address[](2);
        uint256[] memory portions = new uint256[](1);
        
        protocols[0] = address(0x1111111111111111111111111111111111111111); // Mock 1inch router
        tokens[0] = mockDaiAddress;
        tokens[1] = mockWethAddress;
        portions[0] = 10000; // 100%
        
        oneInchIntegrator.setMockSwapPath(protocols, tokens, portions);
        
        console2.log("Set mock slippage: 0.5%");
        console2.log("Set mock price impact: 0.3%");
        console2.log("Set mock liquidity threshold: 1000 tokens");
        console2.log("Set up mock swap path");
    }
    
    /**
     * @dev Mint tokens to the deployer wallet for testing
     */
    function mintTokensToDeployer(address deployer) internal {
        console2.log("\n=== Minting Tokens to Deployer ===");
        
        // Only mint tokens on local networks
        if (block.chainid == 31337) {
            MockERC20 mockDai = MockERC20(mockDaiAddress);
            MockERC20 mockWeth = MockERC20(mockWethAddress);
            MockERC20 mockWbtc = MockERC20(mockWbtcAddress);
            
            // Mint tokens to the deployer
            mockDai.mint(deployer, 10000 * 10**18); // 10,000 DAI
            mockWeth.mint(deployer, 10 * 10**18);   // 10 WETH
            mockWbtc.mint(deployer, 1 * 10**8);     // 1 WBTC
            
            console2.log("Minted 10,000 DAI to deployer");
            console2.log("Minted 10 WETH to deployer");
            console2.log("Minted 1 WBTC to deployer");
            
            // Approve tokens for vault
            mockDai.approve(vaultAddress, type(uint256).max);
            mockWeth.approve(vaultAddress, type(uint256).max);
            mockWbtc.approve(vaultAddress, type(uint256).max);
            
            console2.log("Approved tokens for vault");
        } else {
            console2.log("Skipping token minting on non-local network");
        }
    }
    
    /**
     * @dev Print a summary of all deployed contracts
     */
    function printDeploymentSummary() internal view {
        console2.log("\n=== Deployment Summary ===");
        console2.log("Mock DAI:", mockDaiAddress);
        console2.log("Mock WETH:", mockWethAddress);
        console2.log("Mock WBTC:", mockWbtcAddress);
        console2.log("PriceDataStorage:", priceDataStorageAddress);
        console2.log("PythIntegrator:", pythIntegratorAddress);
        console2.log("OneInchIntegrator:", oneInchIntegratorAddress);
        console2.log("Vault:", vaultAddress);
        console2.log("\nInitialization complete! The system is ready for testing.");
    }
}
