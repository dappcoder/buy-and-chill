"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { Address, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [selectedInstrument, setSelectedInstrument] = useState<string>("ETH/USD 2000 DMA");

  // Read token price from contract
  const { data: tokenPrice } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getTokenPrice",
    args: [selectedInstrument],
  });

  // Read performance data from contract
  const { data: performanceData } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPerformanceData",
    args: [selectedInstrument],
  });

  // Read historical prices from contract
  const { data: historicalPrices } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getHistoricalPrices",
    args: [selectedInstrument],
  });

  // Format price for display
  const formattedPrice = tokenPrice ? `$${(Number(tokenPrice) / 10**18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00";
  
  // Format performance data for display
  const formatPerformance = (value: number | undefined) => {
    if (value === undefined) return "+0.00%";
    // Value is in basis points (100 = 1%)
    const percentage = value / 100;
    return `+${percentage.toFixed(2)}%`;
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
                    onChange={(e) => setSelectedInstrument(e.target.value)}
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

          {/* Simple Chart Visualization */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6" />
                Historical Performance
              </h2>
              <div className="bg-base-200 rounded-lg h-64 p-4">
                {historicalPrices && historicalPrices.length > 0 ? (
                  <div className="w-full h-full flex items-end">
                    {historicalPrices.map((price, index) => {
                      // Calculate height percentage based on min/max prices
                      const prices = historicalPrices.map(p => Number(p));
                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);
                      const range = maxPrice - minPrice;
                      const heightPercentage = ((Number(price) - minPrice) / range) * 80 + 10; // 10-90% height
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-primary rounded-t-sm" 
                            style={{ height: `${heightPercentage}%` }}
                            title={`$${(Number(price) / 10**18).toFixed(2)}`}
                          />
                          {index % 5 === 0 && (
                            <span className="text-xs mt-1">{index + 1}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-base-content/60">Loading chart data...</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-base-content/70 mt-2">
                <span>3 Years Ago</span>
                <span>Present</span>
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
                      <td className="text-success">{performanceData ? formatPerformance(Number(performanceData[0])) : "+0.00%"}</td>
                      <td className="text-success">{performanceData ? formatPerformance(Number(performanceData[1])) : "+0.00%"}</td>
                      <td className="text-success">{performanceData ? formatPerformance(Number(performanceData[2])) : "+0.00%"}</td>
                      <td className="text-success">{performanceData ? formatPerformance(Number(performanceData[3])) : "+0.00%"}</td>
                      <td className="text-success">{performanceData ? formatPerformance(Number(performanceData[4])) : "+0.00%"}</td>
                      <td className="text-success">{performanceData ? formatPerformance(Number(performanceData[5])) : "+0.00%"}</td>
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
            <TradingInterface 
              connectedAddress={connectedAddress as `0x${string}`} 
              selectedInstrument={selectedInstrument}
              tokenPrice={tokenPrice}
            />
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
  const [operationType, setOperationType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  
  // Read token and DAI balances from contract
  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getTokenBalance",
    args: [connectedAddress as `0x${string}`, selectedInstrument],
  });
  
  const { data: daiBalance } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getDaiBalance",
    args: [connectedAddress as `0x${string}`],
  });
  
  // Write contract hooks for buy and sell operations
  const { writeContractAsync: buyTokenAsync } = useScaffoldWriteContract("YourContract");
  
  const { writeContractAsync: sellTokenAsync } = useScaffoldWriteContract("YourContract");
  
  // Format balances for display
  const formattedTokenBalance = tokenBalance ? Number(tokenBalance) / 10**18 : 0;
  const formattedDaiBalance = daiBalance ? Number(daiBalance) / 10**18 : 0;
  const tokenValueInDai = formattedTokenBalance * (tokenPrice ? Number(tokenPrice) / 10**18 : 0);
  
  // Calculate preview based on input amount and operation type
  const calculatePreview = () => {
    if (!amount || !tokenPrice) return "Enter an amount to see preview";
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return "Enter a valid amount";
    
    if (operationType === 'buy') {
      // Buying tokens with DAI
      const tokensToReceive = numAmount / (Number(tokenPrice) / 10**18);
      return `You get: ${tokensToReceive.toFixed(6)} ${selectedInstrument}`;
    } else {
      // Selling tokens for DAI
      const daiToReceive = numAmount * (Number(tokenPrice) / 10**18);
      return `You get: ${daiToReceive.toFixed(2)} DAI`;
    }
  };
  
  // Handle max button click
  const handleMaxClick = () => {
    if (operationType === 'buy') {
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
          <a 
            className={`tab ${operationType === 'buy' ? 'tab-active' : ''}`}
            onClick={() => setOperationType('buy')}
          >
            Buy
          </a>
          <a 
            className={`tab ${operationType === 'sell' ? 'tab-active' : ''}`}
            onClick={() => setOperationType('sell')}
          >
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
            <span>{formattedTokenBalance.toFixed(6)} ({formattedTokenBalance > 0 ? `$${tokenValueInDai.toFixed(2)}` : '$0.00'})</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm">DAI Balance:</span>
            <span>${formattedDaiBalance.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Amount Input */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Amount</span>
          </label>
          <div className="join w-full">
            <button 
              className="btn btn-sm join-item" 
              onClick={handleMaxClick}
            >
              Max
            </button>
            <input 
              type="text" 
              placeholder="Enter amount" 
              className="input input-bordered w-full join-item" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="btn btn-sm join-item no-animation">
              {operationType === 'buy' ? 'DAI' : selectedInstrument}
            </span>
          </div>
        </div>
        
        {/* Preview */}
        <div className="bg-base-200 p-4 rounded-lg mt-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Preview:</span>
            <span>{calculatePreview()}</span>
          </div>
        </div>
        
        {/* Operation Button */}
        <button 
          className={`btn ${operationType === 'buy' ? 'btn-primary' : 'btn-secondary'} w-full`}
          disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
          onClick={async () => {
            try {
              setIsProcessing(true);
              setTransactionStatus('Processing transaction...');
              
              const amountInWei = BigInt(Math.floor(parseFloat(amount) * 10**18));
              
              if (operationType === 'buy') {
                // Buy tokens
                await buyTokenAsync({
                  functionName: 'buyToken',
                  args: [selectedInstrument, amountInWei],
                  value: BigInt(0), // No ETH needed for our dummy implementation
                });
                notification.success('Purchase successful!');
              } else {
                // Sell tokens
                await sellTokenAsync({
                  functionName: 'sellToken',
                  args: [selectedInstrument, amountInWei],
                });
                notification.success('Sale successful!');
              }
              
              // Clear input and status after successful transaction
              setAmount('');
              setTransactionStatus('');
            } catch (error) {
              console.error('Transaction failed:', error);
              notification.error('Transaction failed: ' + (error instanceof Error ? error.message : String(error)));
              setTransactionStatus('Transaction failed');
            } finally {
              setIsProcessing(false);
            }
          }}
        >
          {isProcessing ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            operationType === 'buy' ? 'Buy Tokens' : 'Sell Tokens'
          )}
        </button>
        
        {/* Transaction Status */}
        {transactionStatus && (
          <div className="mt-4 text-center text-sm">
            <p>{transactionStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
