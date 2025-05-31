// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import "../contracts/Vault.sol";
import "../contracts/PriceDataStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CheckVaultSetup is Script {
    function run(address vaultAddress) external {
        Vault vault = Vault(vaultAddress);
        
        // Check contract addresses
        address priceDataStorageAddress = address(vault.priceDataStorage());
        address pythIntegratorAddress = address(vault.pythIntegrator());
        address oneInchIntegratorAddress = address(vault.oneInchIntegrator());
        
        console.log("Vault address:", vaultAddress);
        console.log("PriceDataStorage address:", priceDataStorageAddress);
        console.log("PythIntegrator address:", pythIntegratorAddress);
        console.log("OneInchIntegrator address:", oneInchIntegratorAddress);
        
        // Check token addresses
        address daiAddress = vault.daiAddress();
        address ethAddress = vault.ethAddress();
        address btcAddress = vault.btcAddress();
        
        console.log("DAI address:", daiAddress);
        console.log("ETH address:", ethAddress);
        console.log("BTC address:", btcAddress);
        
        // Check if tokens exist and have code
        console.log("DAI contract has code:", address(daiAddress).code.length > 0);
        console.log("ETH contract has code:", address(ethAddress).code.length > 0);
        console.log("BTC contract has code:", address(btcAddress).code.length > 0);
        
        // Check MA values
        PriceDataStorage priceDataStorage = PriceDataStorage(priceDataStorageAddress);
        
        try vault.getMAValue(Vault.MAType.ETH_USD_2000_DMA) returns (uint256 ethMaValue) {
            console.log("ETH MA value:", ethMaValue);
        } catch {
            console.log("Error getting ETH MA value");
        }
        
        try vault.getMAValue(Vault.MAType.BTC_USD_200_WMA) returns (uint256 btcMaValue) {
            console.log("BTC MA value:", btcMaValue);
        } catch {
            console.log("Error getting BTC MA value");
        }
        
        // Check latest prices
        try vault.getLatestPrice(Vault.MAType.ETH_USD_2000_DMA) returns (uint256 ethPrice) {
            console.log("ETH latest price:", ethPrice);
        } catch {
            console.log("Error getting ETH latest price");
        }
        
        try vault.getLatestPrice(Vault.MAType.BTC_USD_200_WMA) returns (uint256 btcPrice) {
            console.log("BTC latest price:", btcPrice);
        } catch {
            console.log("Error getting BTC latest price");
        }
    }
}
