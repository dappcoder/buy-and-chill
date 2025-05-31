// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import "../contracts/mocks/MockERC20.sol";
import "../contracts/Vault.sol";

contract DeployMockTokens is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy mock tokens
        MockERC20 mockDai = new MockERC20("Mock DAI", "mDAI", 18);
        MockERC20 mockWeth = new MockERC20("Mock WETH", "mWETH", 18);
        MockERC20 mockWbtc = new MockERC20("Mock WBTC", "mWBTC", 8);

        console.log("Mock DAI deployed at:", address(mockDai));
        console.log("Mock WETH deployed at:", address(mockWeth));
        console.log("Mock WBTC deployed at:", address(mockWbtc));

        // Get the vault address
        address vaultAddress = 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9;
        Vault vault = Vault(vaultAddress);

        // Mint tokens to the deployer
        address deployer = vm.addr(deployerPrivateKey);
        mockDai.mint(deployer, 10000 * 10**18); // 10,000 DAI
        mockWeth.mint(deployer, 10 * 10**18);   // 10 WETH
        mockWbtc.mint(deployer, 1 * 10**8);     // 1 WBTC

        console.log("Minted tokens to deployer:", deployer);
        console.log("DAI balance:", mockDai.balanceOf(deployer) / 10**18, "DAI");
        console.log("WETH balance:", mockWeth.balanceOf(deployer) / 10**18, "WETH");
        console.log("WBTC balance:", mockWbtc.balanceOf(deployer) / 10**8, "WBTC");

        // Approve tokens for vault
        mockDai.approve(vaultAddress, type(uint256).max);
        mockWeth.approve(vaultAddress, type(uint256).max);
        mockWbtc.approve(vaultAddress, type(uint256).max);

        console.log("Approved tokens for vault");

        vm.stopBroadcast();
    }
}
