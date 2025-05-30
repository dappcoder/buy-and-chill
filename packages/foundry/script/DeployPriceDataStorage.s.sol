// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {PriceDataStorage} from "../contracts/PriceDataStorage.sol";

contract DeployPriceDataStorage is Script {
    function run() external returns (PriceDataStorage) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        PriceDataStorage priceDataStorage = new PriceDataStorage();
        
        // Set authorized updaters if needed
        // priceDataStorage.setUpdaterAuthorization(address(0x123...), true);
        
        vm.stopBroadcast();
        
        // Log the contract address
        console.log("PriceDataStorage deployed at:", address(priceDataStorage));
        
        return priceDataStorage;
    }
}
