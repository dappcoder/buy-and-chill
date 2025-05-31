//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.temp.sol";
import { DeployYourContract } from "./DeployYourContract.s.sol";
import { DeployVault } from "./DeployVault.s.sol";

/**
 * @notice Temporary deployment script that uses modified helpers to avoid permission issues
 * @dev This is a workaround for the deployments directory permission issue
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // Deploys all your contracts sequentially
        // Add new deployments here when needed

        DeployYourContract deployYourContract = new DeployYourContract();
        deployYourContract.run();

        // Deploy Vault and its dependencies
        DeployVault deployVault = new DeployVault();
        deployVault.run();
    }
}
