// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {OneInchIntegrator} from "../contracts/1inchIntegrator.sol";
import {MockToken} from "./mocks/MockToken.sol";

contract OneInchIntegratorTest is Test {
    OneInchIntegrator public oneInchIntegrator;
    MockToken public mockDai;
    MockToken public mockEth;
    
    address public deployer = vm.addr(1);
    address public vaultAddress = vm.addr(2);
    address public user = vm.addr(3);
    
    function setUp() public {
        vm.startPrank(deployer);
        
        // Deploy mock tokens
        mockDai = new MockToken("DAI Stablecoin", "DAI", 18);
        mockEth = new MockToken("Wrapped Ether", "WETH", 18);
        
        // Deploy 1inchIntegrator contract
        oneInchIntegrator = new OneInchIntegrator();
        
        // Set vault address
        oneInchIntegrator.setVaultAddress(vaultAddress);
        
        // Mint tokens to vault
        mockDai.mint(vaultAddress, 10000 * 10**18); // 10,000 DAI
        mockEth.mint(vaultAddress, 10 * 10**18);    // 10 ETH
        
        vm.stopPrank();
    }
    
    function test_OnlyVaultCanSwap() public {
        // User tries to call swap (should revert)
        vm.startPrank(user);
        
        vm.expectRevert("Only vault can call");
        oneInchIntegrator.swap(
            address(mockDai),
            address(mockEth),
            1000 * 10**18
        );
        
        vm.stopPrank();
        
        // Vault calls swap (should succeed)
        vm.startPrank(vaultAddress);
        
        uint256 toAmount = oneInchIntegrator.swap(
            address(mockDai),
            address(mockEth),
            1000 * 10**18
        );
        
        // In our dummy implementation, this should return the same amount
        assertEq(toAmount, 1000 * 10**18, "Swap amount incorrect");
        
        vm.stopPrank();
    }
    
    function test_GetSwapQuote() public {
        // Anyone can get a quote
        vm.startPrank(user);
        
        uint256 quoteAmount = oneInchIntegrator.getSwapQuote(
            address(mockDai),
            address(mockEth),
            1000 * 10**18
        );
        
        // In our dummy implementation, this should return the same amount
        assertEq(quoteAmount, 1000 * 10**18, "Quote amount incorrect");
        
        vm.stopPrank();
    }
    
    function test_SetVaultAddress() public {
        // Only owner can set vault address
        address newVault = vm.addr(4);
        
        // User tries to set vault address (should revert)
        vm.startPrank(user);
        
        // Use bytes4 selector for the error
        bytes memory encodedError = abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user);
        vm.expectRevert(encodedError);
        oneInchIntegrator.setVaultAddress(newVault);
        
        vm.stopPrank();
        
        // Owner sets vault address (should succeed)
        vm.startPrank(deployer);
        
        oneInchIntegrator.setVaultAddress(newVault);
        assertEq(oneInchIntegrator.vaultAddress(), newVault, "Vault address not updated");
        
        vm.stopPrank();
    }
    
    function test_InsufficientBalance() public {
        // Try to swap more than the vault has
        vm.startPrank(vaultAddress);
        
        vm.expectRevert("Insufficient source tokens");
        oneInchIntegrator.swap(
            address(mockDai),
            address(mockEth),
            20000 * 10**18  // Vault only has 10,000 DAI
        );
        
        vm.stopPrank();
    }
    
    function test_SwapToSameToken() public {
        // Swap DAI to DAI
        vm.startPrank(vaultAddress);
        
        uint256 toAmount = oneInchIntegrator.swap(
            address(mockDai),
            address(mockDai),
            1000 * 10**18
        );
        
        // Should be a 1:1 conversion
        assertEq(toAmount, 1000 * 10**18, "Same token swap amount incorrect");
        
        vm.stopPrank();
    }
    
    function test_InvalidVaultAddress() public {
        // Reset vault address to zero
        vm.startPrank(deployer);
        
        vm.expectRevert("Invalid vault address");
        oneInchIntegrator.setVaultAddress(address(0));
        
        vm.stopPrank();
    }
}
