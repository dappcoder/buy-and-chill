// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import "../contracts/PythIntegrator.sol";
import "../contracts/1inchIntegrator.sol";

/**
 * @title EnableMockMode
 * @dev Script to enable mock mode on integrator contracts
 * This script must be run by the contract owner
 */
contract EnableMockMode is Script {
    function run() public {
        // Get the private key from the environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Get contract addresses from .env or use hardcoded values for local development
        address pythIntegratorAddress = vm.envOr("PYTH_INTEGRATOR_ADDRESS", address(0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9));
        address oneInchIntegratorAddress = vm.envOr("ONEINCH_INTEGRATOR_ADDRESS", address(0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82));
        
        // Enable mock mode on PythIntegrator
        PythIntegrator pythIntegrator = PythIntegrator(pythIntegratorAddress);
        pythIntegrator.setMockModeEnabled(true);
        console.log("Mock mode enabled on PythIntegrator at address:", pythIntegratorAddress);
        
        // Enable mock mode on OneInchIntegrator
        OneInchIntegrator oneInchIntegrator = OneInchIntegrator(oneInchIntegratorAddress);
        oneInchIntegrator.setMockModeEnabled(true);
        console.log("Mock mode enabled on OneInchIntegrator at address:", oneInchIntegratorAddress);
        
        // Set mock volatility for price feeds (optional)
        pythIntegrator.setMockVolatility(300); // 3% volatility
        console.log("Set mock volatility to 3%");
        
        // Stop broadcasting transactions
        vm.stopBroadcast();
        
        console.log("Mock mode setup complete!");
    }
}
