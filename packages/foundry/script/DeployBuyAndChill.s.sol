// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import "forge-std/console2.sol";
import {PriceDataStorage} from "../contracts/PriceDataStorage.sol";
import {PythIntegrator} from "../contracts/PythIntegrator.sol";
import {OneInchIntegrator} from "../contracts/1inchIntegrator.sol";
import {Vault} from "../contracts/Vault.sol";

contract DeployBuyAndChill is Script {
    // Placeholder addresses for tokens in development
    address constant DAI_ADDRESS = 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1; // Arbitrum DAI
    address constant WETH_ADDRESS = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1; // Arbitrum WETH
    address constant WBTC_ADDRESS = 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f; // Arbitrum WBTC
    address constant PYTH_CONTRACT = 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C; // Arbitrum Pyth

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy PriceDataStorage contract
        PriceDataStorage priceDataStorage = new PriceDataStorage();
        
        // Deploy PythIntegrator contract
        PythIntegrator pythIntegrator = new PythIntegrator(PYTH_CONTRACT);
        
        // Deploy OneInchIntegrator contract
        OneInchIntegrator oneInchIntegrator = new OneInchIntegrator();
        
        // Deploy Vault contract
        Vault vault = new Vault(
            address(priceDataStorage),
            address(pythIntegrator),
            address(oneInchIntegrator),
            DAI_ADDRESS,
            WETH_ADDRESS,
            WBTC_ADDRESS
        );
        
        // Set the vault address in the OneInchIntegrator
        oneInchIntegrator.setVaultAddress(address(vault));
        
        // Set the PythIntegrator as an authorized updater for PriceDataStorage
        priceDataStorage.setUpdaterAuthorization(address(pythIntegrator), true);

        vm.stopBroadcast();

        console2.log("Buy and Chill Contracts Deployed:");
        console2.log("PriceDataStorage:");
        console2.log(address(priceDataStorage));
        console2.log("PythIntegrator:");
        console2.log(address(pythIntegrator));
        console2.log("OneInchIntegrator:");
        console2.log(address(oneInchIntegrator));
        console2.log("Vault:");
        console2.log(address(vault));
    }
}
