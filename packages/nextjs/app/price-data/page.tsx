"use client";

import { useState, FormEvent } from "react";
import { isAddress } from "viem";
import PriceDataView from "~~/components/buy-and-chill/PriceDataView";

export default function PriceDataPage() {
  const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(null);
  const [inputAddress, setInputAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(e.target.value);
    setError(null);
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputAddress) {
      setError('Contract address is required');
      return;
    }
    
    if (!isAddress(inputAddress)) {
      setError('Invalid Ethereum address');
      return;
    }
    
    setContractAddress(inputAddress as `0x${string}`);
  };
  
  return (
    <>
      <div className="flex flex-col py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-8">Historical Price Data</h1>
        
        <div className="max-w-3xl mx-auto w-full mb-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">About This Page</h2>
              <p className="mb-4">
                This page displays historical price data and moving average (MA) values for ETH/USD and BTC/USD from the 
                on-chain PriceDataStorage contract. The Buy and Chill vault uses these moving averages to determine
                when to rebalance between assets.
              </p>
              <div className="alert mb-4">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info flex-shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>
                    <strong>ETH/USD 2000 DMA:</strong> 2000-day moving average of ETH price in USD
                  </span>
                </div>
              </div>
              <div className="alert mb-4">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info flex-shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>
                    <strong>BTC/USD 200 WMA:</strong> 200-week moving average of BTC price in USD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto w-full mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="form-control flex-1">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter PriceDataStorage contract address"
                  className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
                  value={inputAddress}
                  onChange={handleAddressChange}
                />
                <button type="submit" className="btn btn-primary">
                  Load Data
                </button>
              </div>
              {error && (
                <label className="label">
                  <span className="label-text-alt text-error">{error}</span>
                </label>
              )}
            </div>
          </form>
        </div>
        
        {contractAddress ? (
          <div className="max-w-5xl mx-auto w-full">
            <PriceDataView priceDataStorageAddress={contractAddress} />
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl max-w-3xl mx-auto">
            <div className="card-body">
              <div className="flex flex-col items-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <h3 className="text-xl font-medium text-center">Enter the PriceDataStorage contract address to view historical data</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
