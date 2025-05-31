// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {PriceDataStorage} from "../contracts/PriceDataStorage.sol";
import {PythIntegrator} from "../contracts/PythIntegrator.sol";
import {OneInchIntegrator} from "../contracts/1inchIntegrator.sol";
import {Vault} from "../contracts/Vault.sol";
import {MockERC20} from "../contracts/mocks/MockERC20.sol";

/**
 * @title DeployWithTokenDistribution
 * @dev Script to deploy all contracts and distribute tokens to test wallets
 */
contract DeployWithTokenDistribution is Script {
    // Scaffold-ETH burner wallet for testing
    address public constant BURNER_WALLET = 0x8399dEcA75d4FF19B9d4AC617885D36E8C27dcAa;

    // Contract addresses
    address public priceDataStorage;
    address public pythIntegrator;
    address public oneInchIntegrator;
    address public mockDai;
    address public mockWeth;
    address public mockWbtc;
    address public vault;

    /**
     * @dev Run the deployment script
     */
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console2.log("Deploying contracts with deployer:", deployer);
        
        // Deploy all contracts
        deployContracts(deployerPrivateKey);
        
        // Distribute tokens
        distributeTokens(deployer);
    }

    /**
     * @dev Deploy all contracts
     */
    function deployContracts(uint256 deployerPrivateKey) internal {
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy PriceDataStorage
        PriceDataStorage pds = new PriceDataStorage();
        priceDataStorage = address(pds);
        console2.log("PriceDataStorage deployed at:", priceDataStorage);
        
        // Deploy PythIntegrator - Use Sepolia Pyth contract for local testing
        address pythAddress = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729; // Sepolia Pyth address
        PythIntegrator pi = new PythIntegrator(pythAddress);
        pythIntegrator = address(pi);
        console2.log("PythIntegrator deployed at:", pythIntegrator);
        
        // Deploy OneInchIntegrator
        OneInchIntegrator oi = new OneInchIntegrator();
        oneInchIntegrator = address(oi);
        console2.log("OneInchIntegrator deployed at:", oneInchIntegrator);
        
        // Deploy mock tokens
        MockERC20 dai = new MockERC20("Mock DAI", "mDAI", 18);
        mockDai = address(dai);
        console2.log("Mock DAI deployed at:", mockDai);
        
        MockERC20 weth = new MockERC20("Mock WETH", "mWETH", 18);
        mockWeth = address(weth);
        console2.log("Mock WETH deployed at:", mockWeth);
        
        MockERC20 wbtc = new MockERC20("Mock WBTC", "mWBTC", 8);
        mockWbtc = address(wbtc);
        console2.log("Mock WBTC deployed at:", mockWbtc);
        
        // Deploy Vault contract
        Vault v = new Vault(
            priceDataStorage,
            pythIntegrator,
            oneInchIntegrator,
            mockDai,
            mockWeth,
            mockWbtc
        );
        vault = address(v);
        console2.log("Vault deployed at:", vault);
        
        // Set the vault address in the OneInchIntegrator
        oi.setVaultAddress(vault);
        console2.log("Set vault address in OneInchIntegrator");
        
        // Set the PriceDataStorage updater authorization for the deployer
        address deployer = vm.addr(deployerPrivateKey);
        pds.setUpdaterAuthorization(deployer, true);
        console2.log("Set updater authorization in PriceDataStorage for:", deployer);
        
        // Set the PriceDataStorage updater authorization for the BURNER_WALLET
        pds.setUpdaterAuthorization(BURNER_WALLET, true);
        console2.log("Set updater authorization in PriceDataStorage for BURNER_WALLET:", BURNER_WALLET);
        
        // Transfer ownership of PythIntegrator to BURNER_WALLET
        pi.transferOwnership(BURNER_WALLET);
        console2.log("Transferred ownership of PythIntegrator to BURNER_WALLET:", BURNER_WALLET);
        
        // Transfer ownership of OneInchIntegrator to BURNER_WALLET
        oi.transferOwnership(BURNER_WALLET);
        console2.log("Transferred ownership of OneInchIntegrator to BURNER_WALLET:", BURNER_WALLET);
        
        vm.stopBroadcast();
    }

    /**
     * @dev Distribute tokens to test wallets
     */
    function distributeTokens(address deployer) internal {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        // Get token contracts
        MockERC20 dai = MockERC20(mockDai);
        MockERC20 weth = MockERC20(mockWeth);
        MockERC20 wbtc = MockERC20(mockWbtc);
        
        // Mint tokens to the deployer
        dai.mint(deployer, 1_000_000 * 10**18); // 1,000,000 DAI
        console2.log("Minted 1,000,000 DAI to deployer");
        
        weth.mint(deployer, 1_000 * 10**18);    // 1,000 WETH
        console2.log("Minted 1,000 WETH to deployer");
        
        wbtc.mint(deployer, 100 * 10**8);       // 100 WBTC
        console2.log("Minted 100 WBTC to deployer");
        
        // Distribute 10,000 DAI to the Scaffold-ETH burner wallet
        uint256 distributionAmount = 10_000 * 10**18; // 10,000 DAI
        
        dai.mint(BURNER_WALLET, distributionAmount);
        console2.log("Minted 10,000 DAI to Scaffold-ETH burner wallet:", BURNER_WALLET);
        
        // Approve tokens for vault (for the deployer)
        dai.approve(vault, type(uint256).max);
        weth.approve(vault, type(uint256).max);
        wbtc.approve(vault, type(uint256).max);
        console2.log("Approved tokens for vault");
        
        vm.stopBroadcast();
    }
}
