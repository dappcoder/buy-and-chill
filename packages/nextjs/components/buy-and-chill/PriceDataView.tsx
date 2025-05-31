"use client";

import { useState, useEffect } from "react";
import { useContractRead } from "wagmi";
import { formatUnits } from "viem";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

// ABIs for contract functions
const PRICE_DATA_ABI = [
  {
    name: "getPriceCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "instrument", type: "uint8" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "getMA",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "instrument", type: "uint8" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "getPriceRange",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "instrument", type: "uint8" },
      { name: "startIndex", type: "uint256" },
      { name: "count", type: "uint256" }
    ],
    outputs: [
      { name: "timestamps", type: "uint256[]" },
      { name: "prices", type: "uint256[]" }
    ]
  }
];

interface PricePoint {
  timestamp: number;
  price: string;
}

const PriceDataView = ({ 
  priceDataStorageAddress 
}: { 
  priceDataStorageAddress: `0x${string}` 
}) => {
  const [selectedInstrument, setSelectedInstrument] = useState<number>(0); // 0 = ETH, 1 = BTC
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [maValue, setMaValue] = useState<string>("0");
  const [error, setError] = useState<string | null>(null);
  
  // Items per page
  const PAGE_SIZE = 20;
  
  const instrumentNames = [
    "ETH/USD 2000 DMA",
    "BTC/USD 200 WMA"
  ];
  
  // Get total number of price points
  const { data: countData, refetch: refetchCount, isError: isCountError, error: countError } = useContractRead({
    address: priceDataStorageAddress,
    abi: PRICE_DATA_ABI,
    functionName: "getPriceCount",
    args: [BigInt(selectedInstrument)],
  });
  
  // Get MA value
  const { data: maData, refetch: refetchMA } = useContractRead({
    address: priceDataStorageAddress,
    abi: PRICE_DATA_ABI,
    functionName: "getMA",
    args: [BigInt(selectedInstrument)],
  });
  
  // Calculate starting index for data pagination
  const calculateStartIndex = () => {
    if (!countData || currentPage <= 0) return BigInt(0);
    const total = Number(countData);
    const start = Math.max(0, total - (currentPage * PAGE_SIZE));
    return BigInt(start);
  };
  
  // Get price range for current page
  const { data: rangeData, refetch: refetchRange } = useContractRead({
    address: priceDataStorageAddress,
    abi: PRICE_DATA_ABI,
    functionName: "getPriceRange",
    args: [BigInt(selectedInstrument), calculateStartIndex(), BigInt(PAGE_SIZE)],
  });
  
  // Update price points when range data changes
  useEffect(() => {
    if (rangeData) {
      const [timestamps, prices] = rangeData as [bigint[], bigint[]];
      
      if (timestamps && prices && timestamps.length > 0) {
        // Format data
        const formattedData: PricePoint[] = timestamps.map((timestamp, i) => ({
          timestamp: Number(timestamp),
          price: formatUnits(prices[i] || BigInt(0), 8),
        })).reverse(); // Reverse to show newest first
        
        setPricePoints(formattedData);
        setError(null); // Clear any previous errors
      } else {
        setPricePoints([]);
      }
      
      setLoading(false);
    }
  }, [rangeData]);
  
  // Make sure loading state is updated when countData is available, even if it's zero
  useEffect(() => {
    // If we've gotten a response (even zero), stop the loading state
    if (countData !== undefined) {
      setLoading(false);
    }
  }, [countData]);
  
  // Handle errors from contract read operations
  useEffect(() => {
    if (isCountError && countError) {
      console.error("Error reading price count:", countError);
      setError("Failed to connect to the contract. Please verify the contract address and network connection.");
      setLoading(false);
    }
  }, [isCountError, countError]);
  
  // Update total points when count data changes
  useEffect(() => {
    if (countData !== undefined) {
      setTotalPoints(Number(countData));
    }
  }, [countData]);
  
  // Update MA value when data changes
  useEffect(() => {
    if (maData !== undefined) {
      setMaValue(formatUnits(maData as bigint, 8));
    }
  }, [maData]);
  
  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    refetchCount();
    refetchMA();
    refetchRange();
  };
  
  // Change instrument
  const handleInstrumentChange = (instrumentId: number) => {
    setSelectedInstrument(instrumentId);
    setCurrentPage(1); // Reset to first page
    setLoading(true);
  };
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalPoints / PAGE_SIZE));
  
  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 sm:mb-0">Historical Price Data</h2>
        <div className="flex items-center">
          <button 
            onClick={handleRefresh} 
            className="btn btn-circle btn-ghost mr-2"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="join">
            {instrumentNames.map((name, idx) => (
              <button
                key={idx}
                className={`join-item btn ${selectedInstrument === idx ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleInstrumentChange(idx)}
                disabled={loading}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="stats shadow mb-6 w-full">
        <div className="stat">
          <div className="stat-title">Current MA Value</div>
          <div className="stat-value">${parseFloat(maValue).toFixed(2)}</div>
          <div className="stat-desc">
            {selectedInstrument === 0 ? '2000-day Moving Average' : '200-week Moving Average'}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Total Data Points</div>
          <div className="stat-value">{totalPoints}</div>
          <div className="stat-desc">
            {selectedInstrument === 0 ? 'Daily prices' : 'Weekly prices'}
          </div>
        </div>
      </div>
      
      {error ? (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Price (USD)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center py-10">
                    <span className="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
              ) : pricePoints.length > 0 ? (
                pricePoints.map((point, index) => (
                  <tr key={index}>
                    <td>{formatTimestamp(point.timestamp)}</td>
                    <td>${parseFloat(point.price).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium text-lg">No price data available</p>
                      <p className="text-base-content/70 max-w-md text-center">
                        {totalPoints === 0 ? 
                          "The contract has 0 data points. Please initialize the contract with price data first." : 
                          "No data found for the selected page."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button 
              className="join-item btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || loading}
            >
              «
            </button>
            <button
              className="join-item btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              ‹
            </button>
            <button className="join-item btn">
              Page {currentPage} of {totalPages}
            </button>
            <button
              className="join-item btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
            >
              ›
            </button>
            <button
              className="join-item btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || loading}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceDataView;
