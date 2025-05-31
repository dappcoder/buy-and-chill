// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {PriceDataStorage} from "../contracts/PriceDataStorage.sol";
import {PythIntegrator} from "../contracts/PythIntegrator.sol";
import {OneInchIntegrator} from "../contracts/1inchIntegrator.sol";
import {Vault} from "../contracts/Vault.sol";
import {DeployPriceDataStorage} from "./DeployPriceDataStorage.s.sol";
import {DeployPythIntegrator} from "./DeployPythIntegrator.s.sol";

/**
 * @title DeployVault
 * @dev Script to deploy the Vault contract and its dependencies
 */
contract DeployVault is Script {
    // Mock token addresses for local development
    address public constant MOCK_DAI_ADDRESS = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant MOCK_ETH_ADDRESS = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant MOCK_BTC_ADDRESS = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;

    /**
     * @dev Run the deployment script
     * @return The deployed Vault contract
     */
    function run() external returns (Vault) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Deploy dependencies first
        DeployPriceDataStorage deployPriceDataStorage = new DeployPriceDataStorage();
        DeployPythIntegrator deployPythIntegrator = new DeployPythIntegrator();
        
        // Deploy PriceDataStorage
        PriceDataStorage priceDataStorage = deployPriceDataStorage.run();
        console2.log("PriceDataStorage deployed at:", address(priceDataStorage));
        
        // Deploy PythIntegrator
        PythIntegrator pythIntegrator = deployPythIntegrator.run();
        console2.log("PythIntegrator deployed at:", address(pythIntegrator));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy OneInchIntegrator
        OneInchIntegrator oneInchIntegrator = new OneInchIntegrator();
        console2.log("OneInchIntegrator deployed at:", address(oneInchIntegrator));
        
        // Get token addresses based on the network
        address daiAddress;
        address ethAddress;
        address btcAddress;
        
        // If we're on a local network, use mock addresses
        if (block.chainid == 31337) { // Local Anvil/Hardhat
            // For local development, we'll use mock addresses
            daiAddress = MOCK_DAI_ADDRESS;
            ethAddress = MOCK_ETH_ADDRESS;
            btcAddress = MOCK_BTC_ADDRESS;
            console2.log("Using mock token addresses for local development");
        } else {
            // For real networks, use the actual token addresses
            // These should be set based on the target network
            daiAddress = MOCK_DAI_ADDRESS; // Replace with actual address for the target network
            ethAddress = MOCK_ETH_ADDRESS; // Replace with actual address for the target network
            btcAddress = MOCK_BTC_ADDRESS; // Replace with actual address for the target network
            console2.log("Using mainnet token addresses");
        }
        
        // Deploy Vault contract
        Vault vault = new Vault(
            address(priceDataStorage),
            address(pythIntegrator),
            address(oneInchIntegrator),
            daiAddress,
            ethAddress,
            btcAddress
        );
        console2.log("Vault deployed at:", address(vault));
        
        // Set the vault address in the OneInchIntegrator
        oneInchIntegrator.setVaultAddress(address(vault));
        console2.log("Set vault address in OneInchIntegrator");
        
        // Set the PriceDataStorage updater authorization for the deployer
        priceDataStorage.setUpdaterAuthorization(msg.sender, true);
        console2.log("Set updater authorization in PriceDataStorage for:", msg.sender);
        
        vm.stopBroadcast();
        
        return vault;
    }
}
