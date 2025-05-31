// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import "../contracts/Vault.sol";
import "../contracts/PriceDataStorage.sol";
import "../contracts/PythIntegrator.sol";
import "../contracts/1inchIntegrator.sol";
import "../contracts/mocks/MockERC20.sol";

// Interface to access internal state of PriceDataStorage
interface IPriceDataStorageTest {
    function maValues(uint8) external view returns (uint256);
}

contract VaultIntegrationTest is Test {
    // Contracts
    Vault public vault;
    PriceDataStorage public priceDataStorage;
    PythIntegrator public pythIntegrator;
    OneInchIntegrator public oneInchIntegrator;
    
    // Mock tokens
    MockERC20 public mockDai;
    MockERC20 public mockEth;
    MockERC20 public mockBtc;
    
    // Test user
    address public user = address(2);
    
    // Test amounts
    uint256 public constant DAI_AMOUNT = 1000 * 10**18; // 1000 DAI
    
    function setUp() public {
        // Deploy as owner
        vm.startPrank(address(1));
        
        // Deploy mock tokens
        mockDai = new MockERC20("Mock DAI", "DAI", 18);
        mockEth = new MockERC20("Mock WETH", "WETH", 18);
        mockBtc = new MockERC20("Mock WBTC", "WBTC", 8);
        
        // Deploy PriceDataStorage
        priceDataStorage = new PriceDataStorage();
        
        // Deploy PythIntegrator with a mock Pyth address
        pythIntegrator = new PythIntegrator(address(0x123));
        
        // Deploy OneInchIntegrator
        oneInchIntegrator = new OneInchIntegrator();
        
        // Deploy Vault
        vault = new Vault(
            address(priceDataStorage),
            address(pythIntegrator),
            address(oneInchIntegrator),
            address(mockDai),
            address(mockEth),
            address(mockBtc)
        );
        
        // Set Vault address in OneInchIntegrator
        oneInchIntegrator.setVaultAddress(address(vault));
        
        vm.stopPrank();
    }
    
    function testVaultTokenAddresses() public {
        // Verify token addresses in Vault
        assertEq(vault.daiAddress(), address(mockDai), "DAI address mismatch");
        assertEq(vault.ethAddress(), address(mockEth), "ETH address mismatch");
        assertEq(vault.btcAddress(), address(mockBtc), "BTC address mismatch");
    }
}
