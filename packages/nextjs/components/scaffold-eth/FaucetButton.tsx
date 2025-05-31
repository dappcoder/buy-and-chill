"use client";

import { useState } from "react";
import { createWalletClient, http, parseEther, maxUint256 } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useWriteContract } from "wagmi";
import { BanknotesIcon, WalletIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { notification } from "~~/utils/scaffold-eth";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "1";
const FAUCET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const localWalletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});

/**
 * FaucetButton button which lets you grab eth and set up your wallet for testing.
 */
export const FaucetButton = () => {
  const { address, chain: ConnectedChain } = useAccount();

  const { data: balance } = useWatchBalance({ address });

  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  // Get contract info for wallet setup
  const { data: mockDaiContract } = useDeployedContractInfo("MockERC20");
  const { data: vaultContract } = useDeployedContractInfo("Vault");
  const { data: pythIntegratorContract } = useDeployedContractInfo("PythIntegrator");
  const { data: oneInchIntegratorContract } = useDeployedContractInfo("OneInchIntegrator");
  
  const { writeContractAsync } = useWriteContract();
  const faucetTxn = useTransactor(localWalletClient);

  const sendETH = async () => {
    if (!address) return;
    try {
      setLoading(true);
      await faucetTxn({
        account: FAUCET_ADDRESS,
        to: address,
        value: parseEther(NUM_OF_ETH),
      });
      setLoading(false);
    } catch (error) {
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
      setLoading(false);
    }
  };

  /**
   * Sets up the wallet for testing with:
   * 1. 10,000 mock DAI
   * 2. MAX allowance for the Vault
   */
  const setupWallet = async () => {
    if (!address || !mockDaiContract?.address || !vaultContract?.address) {
      notification.error("Contract addresses not available");
      return;
    }

    try {
      setSetupLoading(true);
      
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
      
      setSetupLoading(false);
    } catch (error) {
      console.error("Error setting up wallet:", error);
      notification.error("Failed to set up wallet");
      setSetupLoading(false);
    }
  };

  // Render only on local chain
  if (ConnectedChain?.id !== hardhat.id) {
    return null;
  }

  const isBalanceZero = balance && balance.value === 0n;

  return (
    <div className="flex items-center gap-1">
      <div
        className={
          !isBalanceZero
            ? "tooltip tooltip-bottom"
            : "tooltip tooltip-bottom tooltip-primary tooltip-open font-bold before:left-auto before:transform-none before:content-[attr(data-tip)] before:-translate-x-2/5"
        }
        data-tip="Grab ETH from faucet"
      >
        <button className="btn btn-secondary btn-sm px-2 rounded-full" onClick={sendETH} disabled={loading}>
          {!loading ? (
            <BanknotesIcon className="h-4 w-4" />
          ) : (
            <span className="loading loading-spinner loading-xs"></span>
          )}
        </button>
      </div>
      
      <div className="tooltip tooltip-bottom" data-tip="Setup wallet with DAI, allowances & mock access">
        <button 
          className="btn btn-primary btn-sm px-2 rounded-full" 
          onClick={setupWallet} 
          disabled={setupLoading}
        >
          {!setupLoading ? (
            <WalletIcon className="h-4 w-4" />
          ) : (
            <span className="loading loading-spinner loading-xs"></span>
          )}
        </button>
      </div>
    </div>
  );
};
