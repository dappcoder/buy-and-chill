// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import "../contracts/Vault.sol";

interface ISetTokenAddresses {
    function setTokenAddresses(address _daiAddress, address _ethAddress, address _btcAddress) external;
}

contract UpdateVaultTokens is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Vault address
        address vaultAddress = 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9;
        
        // Mock token addresses
        address mockDaiAddress = 0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e;
        address mockWethAddress = 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0;
        address mockWbtcAddress = 0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82;

        // We need to add a function to the Vault contract to update token addresses
        // For now, we'll just log the addresses
        console.log("Vault address:", vaultAddress);
        console.log("Mock DAI address:", mockDaiAddress);
        console.log("Mock WETH address:", mockWethAddress);
        console.log("Mock WBTC address:", mockWbtcAddress);
        
        // Check if the Vault has a setTokenAddresses function
        try ISetTokenAddresses(vaultAddress).setTokenAddresses(
            mockDaiAddress,
            mockWethAddress,
            mockWbtcAddress
        ) {
            console.log("Successfully updated token addresses in Vault");
        } catch {
            console.log("Failed to update token addresses - function may not exist");
            console.log("We need to add a setTokenAddresses function to the Vault contract");
        }

        vm.stopBroadcast();
    }
}
