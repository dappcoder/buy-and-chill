// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {PythIntegrator} from "../contracts/PythIntegrator.sol";

/**
 * @title DeployPythIntegrator
 * @dev Script to deploy the PythIntegrator contract
 */
contract DeployPythIntegrator is Script {
    // Network to Pyth address mapping
    // Source: https://docs.pyth.network/price-feeds/contract-addresses/evm
    mapping(uint256 => address) private pythContracts;

    constructor() {
        // Mainnet
        pythContracts[1] = 0x4305FB66699C3B2702D4d05CF36551390A4c69C6;
        // Sepolia
        pythContracts[11155111] = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729;
        // Goerli (deprecated but included for completeness)
        pythContracts[5] = 0x8250B58e21cb5318fa151f9c184db5cA3891C9c1;
    }

    /**
     * @dev Run the deployment script
     * @return The deployed PythIntegrator contract
     */
    function run() external returns (PythIntegrator) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Get the chain ID
        uint256 chainId = block.chainid;
        
        // Set default Pyth address for local development (use Sepolia contract)
        address pythAddress = pythContracts[11155111]; // Default to Sepolia
        
        // If deploying to a known network, use the appropriate Pyth contract
        if (pythContracts[chainId] != address(0)) {
            pythAddress = pythContracts[chainId];
        }
        
        // Deploy the PythIntegrator contract
        PythIntegrator pythIntegrator = new PythIntegrator(pythAddress);
        
        vm.stopBroadcast();

        // Output deployment information
        console.log("PythIntegrator deployed at:", address(pythIntegrator));
        console.log("Using Pyth contract at:", pythAddress);
        
        return pythIntegrator;
    }
}
