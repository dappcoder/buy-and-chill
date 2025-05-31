import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

/**
 * Custom hook for interacting with the Vault contract
 * Provides typed functions for common operations
 */
export function useVaultContract() {
  // Read functions
  const { data: maValue, refetch: refetchMAValue } = useScaffoldReadContract({
    contractName: "Vault",
    functionName: "getMAValue",
    args: [0] as const, // Default to ETH MA type, will be overridden when called
  });

  const { data: latestPrice, refetch: refetchLatestPrice } = useScaffoldReadContract({
    contractName: "Vault",
    functionName: "getLatestPrice",
    args: [0] as const, // Default to ETH MA type, will be overridden when called
  });

  const { data: rebalanceThreshold } = useScaffoldReadContract({
    contractName: "Vault",
    functionName: "rebalanceThreshold",
    // @ts-ignore - This function doesn't need args but the type system requires it
    args: undefined,
  });

  const { data: slippageTolerance } = useScaffoldReadContract({
    contractName: "Vault",
    functionName: "slippageTolerance",
    // @ts-ignore - This function doesn't need args but the type system requires it
    args: undefined,
  });

  const { data: tokenBalance, refetch: refetchTokenBalance } = useScaffoldReadContract({
    contractName: "Vault",
    functionName: "balanceOf",
    args: ["0x0000000000000000000000000000000000000000"] as const, // Default address, will be overridden when called
  });

  const { data: daiAddress } = useScaffoldReadContract({
    contractName: "Vault",
    functionName: "daiAddress",
    // @ts-ignore - This function doesn't need args but the type system requires it
    args: undefined,
  });

  const { data: ethAddress } = useScaffoldReadContract({
    contractName: "Vault",
    functionName: "ethAddress",
    // @ts-ignore - This function doesn't need args but the type system requires it
    args: undefined,
  });

  const { data: btcAddress } = useScaffoldReadContract({
    contractName: "Vault",
    functionName: "btcAddress",
    // @ts-ignore - This function doesn't need args but the type system requires it
    args: undefined,
  });

  // Write functions
  const { writeContractAsync: depositAsync } = useScaffoldWriteContract("Vault");
  const { writeContractAsync: withdrawAsync } = useScaffoldWriteContract("Vault");

  // Helper function to deposit DAI and mint MA tokens
  const deposit = async (maType: number, daiAmount: bigint) => {
    if (!depositAsync) return;
    return depositAsync({
      functionName: "deposit",
      args: [maType, daiAmount],
    });
  };

  // Helper function to withdraw DAI by burning MA tokens
  const withdraw = async (maType: number, maTokens: bigint) => {
    if (!withdrawAsync) return;
    return withdrawAsync({
      functionName: "withdraw",
      args: [maType, maTokens],
    });
  };

  return {
    // Data
    maValue,
    latestPrice,
    rebalanceThreshold,
    slippageTolerance,
    tokenBalance,
    daiAddress,
    ethAddress,
    btcAddress,
    
    // Refetch functions
    refetchMAValue,
    refetchLatestPrice,
    refetchTokenBalance,
    
    // Write functions
    deposit,
    withdraw,
  };
}
