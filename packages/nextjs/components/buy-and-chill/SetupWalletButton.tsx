"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { maxUint256, parseEther } from "viem";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

/**
 * SetupWalletButton component that extends the faucet functionality
 * to set up the wallet for testing with:
 * 1. 10,000 mock DAI
 * 2. MAX allowance for the Vault
 */
export const SetupWalletButton = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  
  // Get contract info
  const { data: mockDaiContract } = useDeployedContractInfo("MockERC20");
  const { data: vaultContract } = useDeployedContractInfo("Vault");
  const { data: pythIntegratorContract } = useDeployedContractInfo("PythIntegrator");
  const { data: oneInchIntegratorContract } = useDeployedContractInfo("OneInchIntegrator");
  
  const { writeContractAsync } = useWriteContract();

  const setupWallet = async () => {
    if (!address || !mockDaiContract?.address || !vaultContract?.address) {
      notification.error("Contract addresses not available");
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Mint 10,000 mock DAI
      notification.info("Step 1/2: Minting 10,000 mock DAI...");
      await writeContractAsync({
        address: mockDaiContract.address,
        abi: mockDaiContract.abi,
        functionName: "mint",
        args: [address, parseEther("10000")]
      });
      
      // Step 2: Set MAX allowance for Vault
      notification.info("Step 2/2: Setting MAX allowance for Vault...");
      await writeContractAsync({
        address: mockDaiContract.address,
        abi: mockDaiContract.abi,
        functionName: "approve",
        args: [vaultContract.address, maxUint256]
      });
      
      notification.success(
        "Wallet setup complete! You now have 10,000 DAI and MAX allowance for the Vault."
      );
      
      // Note about mock controls
      notification.info(
        "Note: To enable mock controls, you need admin access. Please use the Foundry script to set up mock mode.",
        { duration: 8000 }
      );
      
      setLoading(false);
    } catch (error) {
      console.error("Error setting up wallet:", error);
      notification.error("Failed to set up wallet");
      setLoading(false);
    }
  };

  return (
    <div className="ml-1 tooltip tooltip-bottom tooltip-primary" data-tip="Setup wallet for testing">
      <button 
        className="btn btn-primary btn-sm px-2 rounded-full" 
        onClick={setupWallet} 
        disabled={loading}
      >
        {!loading ? (
          <BanknotesIcon className="h-4 w-4" />
        ) : (
          <span className="loading loading-spinner loading-xs"></span>
        )}
      </button>
    </div>
  );
};
