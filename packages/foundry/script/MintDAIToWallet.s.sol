// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {MockERC20} from "../contracts/mocks/MockERC20.sol";

/**
 * @title MintDAIToWallet
 * @dev Script to mint DAI tokens to a specific wallet address
 */
contract MintDAIToWallet is Script {
    // The wallet to mint tokens to
    address public constant TARGET_WALLET = 0x8399dEcA75d4FF19B9d4AC617885D36E8C27dcAa;
    
    // Amount of DAI to mint (10,000 DAI)
    uint256 public constant MINT_AMOUNT = 10_000 * 10**18;
    
    /**
     * @dev Run the minting script
     */
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console2.log("Minting DAI to wallet:", TARGET_WALLET);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Get the MockDAI contract at the deployed address
        address mockDaiAddress = 0x9A676e781A523b5d0C0e43731313A708CB607508;
        MockERC20 mockDai = MockERC20(mockDaiAddress);
        
        // Mint DAI tokens to the target wallet
        mockDai.mint(TARGET_WALLET, MINT_AMOUNT);
        
        // Log the new balance
        uint256 newBalance = mockDai.balanceOf(TARGET_WALLET);
        console2.log("New DAI balance for wallet:", newBalance / 10**18, "DAI");
        
        vm.stopBroadcast();
    }
}
