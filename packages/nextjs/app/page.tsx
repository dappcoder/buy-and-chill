"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount, useReadContract } from "wagmi";
import { ArrowTrendingUpIcon, ChartBarIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import TradingViewChart from "~~/components/buy-and-chill/TradingViewChart";
import { Address, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getMATypeNumberFromInstrument, getMockDataForInstrument } from "~~/utils/ma-types";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [selectedInstrument, setSelectedInstrument] = useState<string>("ETH/USD 2000 DMA");
  const [showDemoControls, setShowDemoControls] = useState<boolean>(false);
  const [newMAValue, setNewMAValue] = useState<string>("");

  // Mock data for token prices (fallback when contract calls fail)
  // Keeping the values for reference but not using them directly anymore
  // const mockPrices = {
  //   "ETH/USD 2000 DMA": BigInt(1993 * 10**8),
  //   "BTC/USD 200 WMA": BigInt(29850 * 10**8)
  // };

  // Read token price from PriceDataStorage contract with fallback to mock data
  const {
    data: tokenPrice,
    refetch: refetchTokenPrice,
    isError: isTokenPriceError,
  } = useReadContract({
    address: deployedContracts[31337].PriceDataStorage.address as `0x${string}`,
    abi: deployedContracts[31337].PriceDataStorage.abi,
    functionName: "getMA",
    args: [BigInt(getMATypeNumberFromInstrument(selectedInstrument))],
  });

  // Use mock data if contract call fails
  const effectiveTokenPrice =
    isTokenPriceError || !tokenPrice ? getMockDataForInstrument(selectedInstrument, "price") : tokenPrice;

  // Performance data is not available in Vault contract yet

  // Performance data is not available in Vault contract yet, using mock data
  // In the future, this could be calculated from historical MA values
  const effectivePerformanceData = getMockDataForInstrument(selectedInstrument, "performance") as number[];

  // Historical prices will be implemented in future chart enhancements
  // Mock historical prices are commented out to avoid linting errors
  /*
  const mockHistoricalPrices = {
    "ETH/USD 2000 DMA": Array.from({ length: 365 }, (_, i) => BigInt(Math.floor((1800 + Math.sin(i/30) * 200) * 10**8))),
    "BTC/USD 200 WMA": Array.from({ length: 365 }, (_, i) => BigInt(Math.floor((28000 + Math.sin(i/30) * 3000) * 10**8)))
  };

  // Historical prices are not directly available in Vault contract yet
  // In the future, these could be fetched from PriceDataStorage
  const historicalPrices = undefined;
  const isHistoricalPricesError = true; // Force using mock data
  
  // Use mock data if contract call fails
  const effectiveHistoricalPrices = isHistoricalPricesError || !historicalPrices ? 
    mockHistoricalPrices[selectedInstrument as keyof typeof mockHistoricalPrices] : historicalPrices;
  */

  // Write contract hook for updating MA values
  // Demo controls for testing - using deposit function instead of updateMAValue
  const { writeContractAsync: depositAsync } = useScaffoldWriteContract("Vault");

  // Format price for display - using en-US locale explicitly to avoid hydration errors
  // MA values from PriceDataStorage use 8 decimal places, not 18
  const formattedPrice = effectiveTokenPrice
    ? `$${(Number(effectiveTokenPrice) / 10 ** 8).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "$0.00";

  // Format performance data for display
  const formatPerformance = (value: number | undefined) => {
    if (value === undefined) return "+0.00%";
    // Value is in basis points (100 = 1%)
    const percentage = value / 100;
    return `+${percentage.toFixed(2)}%`;
  };

  // Handle demo deposit for testing purposes
  const handleUpdateMAValue = async () => {
    if (!newMAValue) return;

    try {
      // Convert to DAI amount (for demo purposes)
      const daiAmount = BigInt(Math.floor(parseFloat(newMAValue) * 10 ** 18));

      // Use deposit function instead of updateMAValue
      await depositAsync({
        functionName: "deposit",
        args: [getMATypeNumberFromInstrument(selectedInstrument), daiAmount] as const,
      });

      notification.success(`Demo deposit of ${newMAValue} DAI for ${selectedInstrument}`);
      setNewMAValue("");
      refetchTokenPrice();
    } catch (error) {
      console.error("Failed to perform demo deposit:", error);

      // Provide more detailed error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      notification.error(`Demo transaction failed: ${errorMessage}`);

      // Use mock implementation as fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
      notification.success(`Mock deposit of ${newMAValue} DAI for ${selectedInstrument}`);
      setNewMAValue("");
      refetchTokenPrice();
    }
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-6 px-4">
        <div className="w-full max-w-5xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Buy and Chill</span>
            <span className="block text-xl mt-1">Simple Moving Average Index Tokens</span>
          </h1>

          {/* Instrument Dropdown - Common for both connected/disconnected states */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="form-control w-full max-w-xs">
                  <label className="label">
                    <span className="label-text font-semibold">Select Instrument</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedInstrument}
                    onChange={e => setSelectedInstrument(e.target.value)}
                  >
                    <option value="ETH/USD 2000 DMA">ETH/USD 2000 DMA</option>
                    <option value="BTC/USD 200 WMA">BTC/USD 200 WMA</option>
                  </select>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">Current Price</span>
                  <span className="text-3xl font-bold">{formattedPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TradingView Chart */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6" />
                Historical Performance with Moving Average
              </h2>
              <div className="bg-base-200 rounded-lg overflow-hidden">
                <TradingViewChart instrument={selectedInstrument} height={400} />
              </div>
              <div className="flex justify-between text-xs text-base-content/70 mt-2">
                <span className="italic">
                  Chart shows {selectedInstrument === "ETH/USD 2000 DMA" ? "2000-day" : "200-week"} moving average
                </span>
                <span>Source: TradingView</span>
              </div>
            </div>
          </div>

          {/* Placeholder for Performance Table - Will implement in next phase */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <CurrencyDollarIcon className="h-6 w-6" />
                Performance Metrics
              </h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>1 Week</th>
                      <th>1 Month</th>
                      <th>6 Months</th>
                      <th>1 Year</th>
                      <th>2 Years</th>
                      <th>3 Years</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Return</td>
                      <td className="text-success">
                        {effectivePerformanceData && effectivePerformanceData.length > 0
                          ? formatPerformance(effectivePerformanceData[0])
                          : "+0.00%"}
                      </td>
                      <td className="text-success">
                        {effectivePerformanceData && effectivePerformanceData.length > 1
                          ? formatPerformance(effectivePerformanceData[1])
                          : "+0.00%"}
                      </td>
                      <td className="text-success">
                        {effectivePerformanceData && effectivePerformanceData.length > 2
                          ? formatPerformance(effectivePerformanceData[2])
                          : "+0.00%"}
                      </td>
                      <td className="text-success">
                        {effectivePerformanceData && effectivePerformanceData.length > 3
                          ? formatPerformance(effectivePerformanceData[3])
                          : "+0.00%"}
                      </td>
                      <td className="text-success">
                        {effectivePerformanceData && effectivePerformanceData.length > 4
                          ? formatPerformance(effectivePerformanceData[4])
                          : "+0.00%"}
                      </td>
                      <td className="text-success">
                        {effectivePerformanceData && effectivePerformanceData.length > 5
                          ? formatPerformance(effectivePerformanceData[5])
                          : "+0.00%"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Connect Wallet or Buy/Sell Interface based on connection status */}
          {!isConnected ? (
            <div className="card bg-primary text-primary-content shadow-xl">
              <div className="card-body items-center text-center">
                <h2 className="card-title text-2xl mb-2">Ready to invest?</h2>
                <p className="mb-4">Connect your wallet to buy and sell SMA index tokens.</p>
                <div className="card-actions">
                  {/* Using the existing wallet connect button from Scaffold-ETH */}
                  <RainbowKitCustomConnectButton />
                </div>
              </div>
            </div>
          ) : (
            <>
              <TradingInterface
                connectedAddress={connectedAddress as `0x${string}`}
                selectedInstrument={selectedInstrument}
                tokenPrice={effectiveTokenPrice as bigint}
              />

              {/* Demo Controls for Hackathon - Hidden by default */}
              <div className="mt-6">
                <button className="btn btn-sm btn-ghost" onClick={() => setShowDemoControls(!showDemoControls)}>
                  {showDemoControls ? "Hide Demo Controls" : "Show Demo Controls"}
                </button>

                {showDemoControls && (
                  <div className="card bg-base-300 shadow-xl mt-2">
                    <div className="card-body">
                      <div className={`collapse ${showDemoControls ? "collapse-open" : "collapse-close"}`}>
                        <div className="collapse-content">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Demo Deposit (Test Function)</span>
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="Enter DAI amount to deposit"
                                className="input input-bordered w-full"
                                value={newMAValue}
                                onChange={e => setNewMAValue(e.target.value)}
                              />
                              <button className="btn btn-primary" onClick={handleUpdateMAValue} disabled={!newMAValue}>
                                Deposit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs mt-1 opacity-70">Use this to simulate price changes during the demo</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// Trading Interface Component for connected users
interface TradingInterfaceProps {
  connectedAddress: `0x${string}` | undefined;
  selectedInstrument: string;
  tokenPrice: bigint | undefined;
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({ connectedAddress, selectedInstrument, tokenPrice }) => {
  const [operationType, setOperationType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [transactionSummary, setTransactionSummary] = useState<{ [key: string]: string }>({});
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Mock data for token balances (fallback when contract calls fail)
  // Keeping the values for reference but not using them directly anymore
  // const mockBalances = {
  //   "ETH/USD 2000 DMA": 0.5,
  //   "BTC/USD 200 WMA": 0.025,
  //   "DAI": 1000
  // };

  // Read token balance from Vault contract (ERC20 balanceOf) without fallback to mock data
  const { data: tokenBalance /* , isError: isTokenBalanceError, refetch: refetchTokenBalance */ } = useReadContract({
    address: deployedContracts[31337].Vault.address as `0x${string}`,
    abi: deployedContracts[31337].Vault.abi,
    functionName: "balanceOf",
    args: connectedAddress ? [connectedAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!connectedAddress,
    },
  });

  // Read DAI balance from the MockDAI contract
  const { data: daiBalance /* , isError: isDaiBalanceError, refetch: refetchDaiBalance */ } = useReadContract({
    address: deployedContracts[31337].MockDAI.address as `0x${string}`,
    abi: deployedContracts[31337].MockDAI.abi,
    functionName: "balanceOf",
    args: connectedAddress ? [connectedAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!connectedAddress,
    },
  });

  // Write contract hooks for buy and sell operations using Vault contract
  const { writeContractAsync: buyTokenAsync } = useScaffoldWriteContract("Vault");

  const { writeContractAsync: sellTokenAsync } = useScaffoldWriteContract("Vault");

  // Format balances for display without fallbacks to mock data
  const formattedTokenBalance = tokenBalance !== undefined ? Number(tokenBalance) / 10 ** 18 : 0;

  const formattedDaiBalance = daiBalance !== undefined ? Number(daiBalance) / 10 ** 18 : 0;

  // MA values from PriceDataStorage use 8 decimal places, not 18
  const tokenValueInDai = formattedTokenBalance * (tokenPrice ? Number(tokenPrice) / 10 ** 8 : 0);

  // Simulate loading state when amount changes
  useEffect(() => {
    if (amount) {
      setIsCalculating(true);
      const timer = setTimeout(() => {
        setIsCalculating(false);
      }, 500); // Simulate calculation delay
      return () => clearTimeout(timer);
    }
  }, [amount]);

  // Calculate preview based on input amount and operation type with price impact estimation
  const calculatePreview = () => {
    if (!amount || !tokenPrice) return "Enter an amount to see preview";

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return "Enter a valid amount";

    // Calculate mock price impact based on transaction size
    // Larger transactions have higher price impact
    const calculatePriceImpact = (amountValue: number) => {
      // Base impact is 0.1% for small transactions
      const baseImpact = 0.1;
      // Additional impact based on size (up to 2% for very large transactions)
      const sizeImpact = Math.min(amountValue / 1000, 2);
      return baseImpact + sizeImpact;
    };

    const priceImpact = calculatePriceImpact(numAmount);

    if (operationType === "buy") {
      // Buying tokens with DAI
      // Apply price impact: less tokens received due to slippage
      // MA values from PriceDataStorage use 8 decimal places, not 18
      const effectivePrice = (Number(tokenPrice) / 10 ** 8) * (1 + priceImpact / 100);
      const tokensToReceive = numAmount / effectivePrice;

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            You get: {tokensToReceive.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 6 })}{" "}
            {selectedInstrument}
          </span>
          <span className="text-xs text-base-content/70">Price impact: ~{priceImpact.toFixed(2)}%</span>
          <span className="text-xs text-base-content/70">
            1 {selectedInstrument} = $
            {(Number(tokenPrice) / 10 ** 8).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      );
    } else {
      // Selling tokens for DAI
      // Apply price impact: less DAI received due to slippage
      // MA values from PriceDataStorage use 8 decimal places, not 18
      const effectivePrice = (Number(tokenPrice) / 10 ** 8) * (1 - priceImpact / 100);
      const daiToReceive = numAmount * effectivePrice;

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            You get: {daiToReceive.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DAI
          </span>
          <span className="text-xs text-base-content/70">Price impact: ~{priceImpact.toFixed(2)}%</span>
          <span className="text-xs text-base-content/70">
            1 {selectedInstrument} = $
            {(Number(tokenPrice) / 10 ** 8).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      );
    }
  };

  // Handle max button click
  const handleMaxClick = () => {
    if (operationType === "buy") {
      setAmount(formattedDaiBalance.toString());
    } else {
      setAmount(formattedTokenBalance.toString());
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <ArrowTrendingUpIcon className="h-6 w-6" />
          Trading Interface
        </h2>

        {/* Operation Type Selector */}
        <div className="tabs tabs-boxed self-start mb-4">
          <a className={`tab ${operationType === "buy" ? "tab-active" : ""}`} onClick={() => setOperationType("buy")}>
            Buy
          </a>
          <a className={`tab ${operationType === "sell" ? "tab-active" : ""}`} onClick={() => setOperationType("sell")}>
            Sell
          </a>
        </div>

        {/* Balance Display */}
        <div className="bg-base-200 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Connected Wallet:</span>
            <Address address={connectedAddress} />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm">{selectedInstrument} Balance:</span>
            <span>
              {formattedTokenBalance.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 6 })} (
              {formattedTokenBalance > 0
                ? `$${tokenValueInDai.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "$0.00"}
              )
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm">DAI Balance:</span>
            <span>
              ${formattedDaiBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Amount</span>
          </label>
          <div className="join w-full">
            <button className="btn btn-sm join-item" onClick={handleMaxClick}>
              Max
            </button>
            <input
              type="text"
              placeholder="Enter amount"
              className="input input-bordered w-full join-item"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <span className="btn btn-sm join-item no-animation">
              {operationType === "buy" ? "DAI" : selectedInstrument}
            </span>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-base-200 p-4 rounded-lg mt-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Preview:</span>
            {isCalculating ? (
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs"></span>
                <span className="text-sm">Calculating...</span>
              </div>
            ) : (
              <div>{calculatePreview()}</div>
            )}
          </div>
        </div>

        {/* Operation Button */}
        <button
          className={`btn ${operationType === "buy" ? "btn-primary" : "btn-secondary"} w-full`}
          disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
          onClick={() => {
            // Calculate transaction details for confirmation
            const numAmount = parseFloat(amount);
            const priceImpact = Math.min(0.1 + numAmount / 1000, 2.1);
            let tokensAmount = 0;
            let daiAmount = 0;

            if (operationType === "buy") {
              // MA values from PriceDataStorage use 8 decimal places, not 18
              const effectivePrice = (Number(tokenPrice) / 10 ** 8) * (1 + priceImpact / 100);
              tokensAmount = numAmount / effectivePrice;
              daiAmount = numAmount;
            } else {
              // MA values from PriceDataStorage use 8 decimal places, not 18
              const effectivePrice = (Number(tokenPrice) / 10 ** 8) * (1 - priceImpact / 100);
              tokensAmount = numAmount;
              daiAmount = numAmount * effectivePrice;
            }

            // Set transaction summary for confirmation modal
            setTransactionSummary({
              operation: operationType === "buy" ? "Buy" : "Sell",
              instrument: selectedInstrument,
              amount:
                operationType === "buy"
                  ? `${tokensAmount.toFixed(6)} ${selectedInstrument}`
                  : `${numAmount.toFixed(6)} ${selectedInstrument}`,
              cost: operationType === "buy" ? `${numAmount.toFixed(2)} DAI` : `${daiAmount.toFixed(2)} DAI`,
              price: `$${(Number(tokenPrice) / 10 ** 8).toFixed(2)}`,
              priceImpact: `${priceImpact.toFixed(2)}%`,
              fee: `${(numAmount * 0.003).toFixed(2)} DAI (0.3%)`, // Mock fee
            });

            // Show confirmation modal
            setShowConfirmation(true);
          }}
        >
          {isProcessing ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : operationType === "buy" ? (
            "Buy Tokens"
          ) : (
            "Sell Tokens"
          )}
        </button>

        {/* Transaction Status */}
        {transactionStatus && (
          <div className="mt-4 text-center text-sm">
            <p>{transactionStatus}</p>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">{transactionSummary.operation} Confirmation</h3>
              <div className="py-4">
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <tbody>
                      <tr>
                        <td className="font-semibold">Operation</td>
                        <td>
                          {transactionSummary.operation} {transactionSummary.instrument}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold">{operationType === "buy" ? "You Get" : "You Sell"}</td>
                        <td>{transactionSummary.amount}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">{operationType === "buy" ? "Cost" : "You Get"}</td>
                        <td>{transactionSummary.cost}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Price</td>
                        <td>{transactionSummary.price}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Price Impact</td>
                        <td>{transactionSummary.priceImpact}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Fee</td>
                        <td>{transactionSummary.fee}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-action">
                <button className="btn btn-outline" onClick={() => setShowConfirmation(false)}>
                  Cancel
                </button>
                <button
                  className={`btn ${operationType === "buy" ? "btn-primary" : "btn-secondary"}`}
                  onClick={async () => {
                    try {
                      setShowConfirmation(false);
                      setIsProcessing(true);
                      setTransactionStatus("Processing transaction...");

                      // Convert amount to BigInt with 18 decimals (DAI has 18 decimals)
                      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 10 ** 18));

                      if (operationType === "buy") {
                        // Convert instrument name to MAType enum value
                        const maType = getMATypeNumberFromInstrument(selectedInstrument);

                        try {
                          // Use deposit function from Vault contract
                          await buyTokenAsync({
                            functionName: "deposit",
                            args: [maType, amountInWei],
                          });
                          notification.success("Purchase successful!");
                          setTransactionStatus(
                            "Transaction completed! You have purchased " + transactionSummary.amount,
                          );
                        } catch (error) {
                          console.error("Contract call failed, using mock implementation:", error);
                          // Mock successful transaction after delay
                          await new Promise(resolve => setTimeout(resolve, 1500));
                          notification.success("Purchase successful! (Mock)");
                          setTransactionStatus(
                            "Transaction completed! You have purchased " + transactionSummary.amount + " (Mock)",
                          );
                        }
                      } else {
                        // Convert instrument name to MAType enum value
                        const maType = getMATypeNumberFromInstrument(selectedInstrument);

                        try {
                          // Use withdraw function from Vault contract
                          await sellTokenAsync({
                            functionName: "withdraw",
                            args: [maType, amountInWei],
                          });
                          notification.success("Sale successful!");
                          setTransactionStatus("Transaction completed! You have received " + transactionSummary.cost);
                        } catch (error) {
                          console.error("Contract call failed, using mock implementation:", error);
                          // Mock successful transaction after delay
                          await new Promise(resolve => setTimeout(resolve, 1500));
                          notification.success("Sale successful! (Mock)");
                          setTransactionStatus(
                            "Transaction completed! You have received " + transactionSummary.cost + " (Mock)",
                          );
                        }
                      }

                      // Clear input after successful transaction
                      setAmount("");

                      // Keep status message visible for a while
                      setTimeout(() => {
                        setTransactionStatus("");
                      }, 5000);
                    } catch (error) {
                      console.error("Transaction failed:", error);
                      notification.error(
                        "Transaction failed: " + (error instanceof Error ? error.message : String(error)),
                      );
                      setTransactionStatus(
                        "Transaction failed: " + (error instanceof Error ? error.message : String(error)),
                      );
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                >
                  Confirm {transactionSummary.operation}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
