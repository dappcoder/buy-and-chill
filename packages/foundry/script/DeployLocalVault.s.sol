// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import "../contracts/Vault.sol";
import "../contracts/PriceDataStorage.sol";
import "../contracts/PythIntegrator.sol";
import "../contracts/1inchIntegrator.sol";
import "../contracts/mocks/MockERC20.sol";

contract DeployLocalVault is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy mock tokens
        console.log("Deploying mock tokens...");
        MockERC20 mockDai = new MockERC20("Mock DAI", "mDAI", 18);
        MockERC20 mockWeth = new MockERC20("Mock WETH", "mWETH", 18);
        MockERC20 mockWbtc = new MockERC20("Mock WBTC", "mWBTC", 8);
        
        console.log("Mock DAI deployed at:", address(mockDai));
        console.log("Mock WETH deployed at:", address(mockWeth));
        console.log("Mock WBTC deployed at:", address(mockWbtc));
        
        // Step 2: Deploy PriceDataStorage
        console.log("Deploying PriceDataStorage...");
        PriceDataStorage priceDataStorage = new PriceDataStorage();
        console.log("PriceDataStorage deployed at:", address(priceDataStorage));
        
        // Step 3: Deploy PythIntegrator with a mock Pyth contract address
        // In local development, we don't have a real Pyth contract
        console.log("Deploying PythIntegrator...");
        address mockPythAddress = deployer; // Just use deployer as mock Pyth address
        PythIntegrator pythIntegrator = new PythIntegrator(mockPythAddress);
        console.log("PythIntegrator deployed at:", address(pythIntegrator));
        
        // Step 4: Deploy OneInchIntegrator
        console.log("Deploying OneInchIntegrator...");
        OneInchIntegrator oneInchIntegrator = new OneInchIntegrator();
        console.log("OneInchIntegrator deployed at:", address(oneInchIntegrator));
        
        // Step 5: Deploy Vault with mock token addresses
        console.log("Deploying Vault...");
        Vault vault = new Vault(
            address(priceDataStorage),
            address(pythIntegrator),
            address(oneInchIntegrator),
            address(mockDai),
            address(mockWeth),
            address(mockWbtc)
        );
        console.log("Vault deployed at:", address(vault));
        
        // Step 6: Set Vault address in OneInchIntegrator
        console.log("Setting Vault address in OneInchIntegrator...");
        oneInchIntegrator.setVaultAddress(address(vault));
        
        // Step 7: Initialize PriceDataStorage with sample data
        console.log("Initializing PriceDataStorage with sample data...");
        
        // Create arrays for batch initialization
        uint256[] memory timestamps = new uint256[](1);
        uint256[] memory prices = new uint256[](1);
        
        // ETH/USD 2000 DMA data
        timestamps[0] = block.timestamp;
        prices[0] = 1993 * 10**8; // $1,993 with 8 decimals
        uint256 ethMaValue = 1800 * 10**8; // $1,800 with 8 decimals
        
        // Initialize ETH price data
        priceDataStorage.initializePrices(
            PriceDataStorage.Instrument.ETH_USD_2000_DMA,
            timestamps,
            prices
        );
        
        // BTC/USD 200 WMA data - reuse the arrays but update values
        timestamps[0] = block.timestamp;
        prices[0] = 29850 * 10**8; // $29,850 with 8 decimals
        uint256 btcMaValue = 28000 * 10**8; // $28,000 with 8 decimals
        
        // Initialize BTC price data
        priceDataStorage.initializePrices(
            PriceDataStorage.Instrument.BTC_USD_200_WMA,
            timestamps,
            prices
        );
        
        // Override MA values for testing
        priceDataStorage.overrideMAForTesting(PriceDataStorage.Instrument.ETH_USD_2000_DMA, ethMaValue);
        priceDataStorage.overrideMAForTesting(PriceDataStorage.Instrument.BTC_USD_200_WMA, btcMaValue);
        
        // Step 8: Mint mock tokens to the deployer for testing
        console.log("Minting mock tokens to deployer...");
        mockDai.mint(deployer, 1000000 * 10**18); // 1M DAI
        mockWeth.mint(deployer, 1000 * 10**18);   // 1000 WETH
        mockWbtc.mint(deployer, 100 * 10**8);     // 100 WBTC
        
        // Step 9: Approve Vault to spend DAI from deployer
        console.log("Approving Vault to spend DAI from deployer...");
        mockDai.approve(address(vault), type(uint256).max);
        
        // Log final deployment addresses
        console.log("\nDeployment Summary:");
        console.log("-------------------");
        console.log("Mock DAI: ", address(mockDai));
        console.log("Mock WETH:", address(mockWeth));
        console.log("Mock WBTC:", address(mockWbtc));
        console.log("PriceDataStorage:", address(priceDataStorage));
        console.log("PythIntegrator:", address(pythIntegrator));
        console.log("OneInchIntegrator:", address(oneInchIntegrator));
        console.log("Vault:", address(vault));
        console.log("-------------------");
        console.log("Deployment complete!");
        
        vm.stopBroadcast();
    }
}
