import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { ExclamationTriangleIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";

/**
 * MockControls component for controlling mock functionality of integrator contracts
 */
export const MockControls = () => {
  // Account hook to get the connected wallet address
  const { address: connectedAddress } = useAccount();
  
  // Contract hooks
  const { data: pythIntegratorContract } = useScaffoldContract({ contractName: "PythIntegrator" });
  const { data: oneInchIntegratorContract } = useScaffoldContract({ contractName: "OneInchIntegrator" });
  
  // State for ownership status
  const [isOwner, setIsOwner] = useState(false);

  // State for mock mode status
  const [pythMockEnabled, setPythMockEnabled] = useState(false);
  const [oneInchMockEnabled, setOneInchMockEnabled] = useState(false);

  // State for mock parameters
  const [ethPrice, setEthPrice] = useState("2500.00");
  const [btcPrice, setBtcPrice] = useState("35000.00");
  const [volatilityBps, setVolatilityBps] = useState("200");
  const [slippageBps, setSlippageBps] = useState("50");
  const [priceImpactBps, setPriceImpactBps] = useState("30");
  const [liquidityThreshold, setLiquidityThreshold] = useState("1000");
  const [networkLatency, setNetworkLatency] = useState("2000");
  const [updateDelayBlocks, setUpdateDelayBlocks] = useState("2");

  // State for failure scenarios
  const [networkOutage, setNetworkOutage] = useState(false);
  const [delayedUpdates, setDelayedUpdates] = useState(false);
  const [insufficientLiquidity, setInsufficientLiquidity] = useState(false);
  const [highPriceImpact, setHighPriceImpact] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  // Read mock mode status from contracts
  const { data: pythMockModeEnabled } = useReadContract({
    address: pythIntegratorContract?.address,
    abi: pythIntegratorContract?.abi,
    functionName: "mockModeEnabled",
  });

  const { data: oneInchMockModeEnabled } = useReadContract({
    address: oneInchIntegratorContract?.address,
    abi: oneInchIntegratorContract?.abi,
    functionName: "mockModeEnabled",
  });
  
  // Read owner of contracts
  const { data: pythOwner } = useReadContract({
    address: pythIntegratorContract?.address,
    abi: [
      {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "owner",
  });
  
  const { data: oneInchOwner } = useReadContract({
    address: oneInchIntegratorContract?.address,
    abi: [
      {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "owner",
  });

  // Contract write functions using wagmi's useWriteContract
  const { writeContractAsync } = useWriteContract();
  
  // Function to write to PythIntegrator contract
  const writeToPythIntegrator = async (functionName: string, args: any[]) => {
    if (!pythIntegratorContract?.address || !pythIntegratorContract?.abi) return;
    
    return writeContractAsync({
      address: pythIntegratorContract.address,
      abi: pythIntegratorContract.abi,
      functionName: functionName as any,
      args,
    });
  };
  
  // Function to write to OneInchIntegrator contract
  const writeToOneInchIntegrator = async (functionName: string, args: any[]) => {
    if (!oneInchIntegratorContract?.address || !oneInchIntegratorContract?.abi) return;
    
    return writeContractAsync({
      address: oneInchIntegratorContract.address,
      abi: oneInchIntegratorContract.abi,
      functionName: functionName as any,
      args,
    });
  };
  
  // Contract write functions for Pyth Integrator
  const setPythMockMode = () => writeToPythIntegrator("setMockModeEnabled", [!pythMockEnabled]);
  
  const setPythMockEthPrice = () => writeToPythIntegrator("setMockPrice", [
    "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH_USD_PRICE_ID
    parseUnits(ethPrice || "0", 8),
    parseUnits("0.1", 8), // 0.1 USD confidence
  ]);
  
  const setPythMockBtcPrice = () => writeToPythIntegrator("setMockPrice", [
    "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // BTC_USD_PRICE_ID
    parseUnits(btcPrice || "0", 8),
    parseUnits("1", 8), // 1 USD confidence
  ]);
  
  const setPythMockVolatility = () => writeToPythIntegrator("setMockVolatility", [BigInt(volatilityBps || "0")]);
  
  const setPythNetworkOutage = () => writeToPythIntegrator("setMockNetworkOutage", [networkOutage]);
  
  const setPythDelayedUpdate = () => writeToPythIntegrator("setMockDelayedUpdate", [delayedUpdates, BigInt(updateDelayBlocks || "0")]);
  
  // Contract write functions for 1inch Integrator
  const setOneInchMockMode = () => writeToOneInchIntegrator("setMockModeEnabled", [!oneInchMockEnabled]);
  
  const setOneInchSlippage = () => writeToOneInchIntegrator("setMockSlippage", [BigInt(slippageBps || "0")]);

  const setOneInchPriceImpact = () => writeToOneInchIntegrator("setMockPriceImpact", [BigInt(priceImpactBps || "0")]);
  
  const setOneInchLiquidityThreshold = () => writeToOneInchIntegrator("setMockLiquidityThreshold", [parseUnits(liquidityThreshold || "0", 18)]);
  
  const setOneInchNetworkLatency = () => writeToOneInchIntegrator("setMockLatency", [BigInt(networkLatency || "0")]);
  
  const setOneInchInsufficientLiquidity = () => writeToOneInchIntegrator("setMockInsufficientLiquidity", [insufficientLiquidity]);
  
  const setOneInchHighPriceImpact = () => writeToOneInchIntegrator("setMockHighPriceImpact", [highPriceImpact]);
  
  const setOneInchNetworkError = () => writeToOneInchIntegrator("setMockNetworkError", [networkError]);

  // Update component state when contract data changes
  useEffect(() => {
    if (pythMockModeEnabled !== undefined) {
      setPythMockEnabled(!!pythMockModeEnabled);
    }
    if (oneInchMockModeEnabled !== undefined) {
      setOneInchMockEnabled(!!oneInchMockModeEnabled);
    }
    
    // Check if connected wallet is the owner of either contract
    if (connectedAddress && (pythOwner || oneInchOwner)) {
      setIsOwner(
        connectedAddress.toLowerCase() === (pythOwner as string)?.toLowerCase() || 
        connectedAddress.toLowerCase() === (oneInchOwner as string)?.toLowerCase()
      );
    }
  }, [pythMockModeEnabled, oneInchMockModeEnabled, pythOwner, oneInchOwner, connectedAddress]);

  // Handle toggle mock mode for Pyth
  const handleTogglePythMock = async () => {
    try {
      await setPythMockMode();
      // Update local state to reflect the change immediately for better UX
      setPythMockEnabled(!pythMockEnabled);
    } catch (error) {
      console.error("Error toggling Pyth mock mode:", error);
    }
  };

  // Handle toggle mock mode for 1inch
  const handleToggleOneInchMock = async () => {
    try {
      await setOneInchMockMode();
      // Update local state to reflect the change immediately for better UX
      setOneInchMockEnabled(!oneInchMockEnabled);
    } catch (error) {
      console.error("Error toggling 1inch mock mode:", error);
    }
  };

  // Handle updating Pyth mock prices
  const handleUpdatePythPrices = async () => {
    if (!pythMockEnabled) return;
    
    try {
      await setPythMockEthPrice();
      await setPythMockBtcPrice();
      await setPythMockVolatility();
      console.log("Updated Pyth mock prices successfully");
    } catch (error) {
      console.error("Error updating Pyth mock prices:", error);
    }
  };

  // Handle updating Pyth mock network conditions
  const handleUpdatePythNetwork = async () => {
    if (!pythMockEnabled) return;
    
    try {
      await setPythNetworkOutage();
      await setPythDelayedUpdate();
      console.log("Updated Pyth mock network conditions successfully");
    } catch (error) {
      console.error("Error updating Pyth mock network conditions:", error);
    }
  };

  // Handle updating 1inch mock parameters
  const handleUpdateOneInchParams = async () => {
    if (!oneInchMockEnabled) return;
    
    try {
      await setOneInchSlippage();
      await setOneInchPriceImpact();
      await setOneInchLiquidityThreshold();
      await setOneInchNetworkLatency();
      console.log("Updated 1inch mock parameters successfully");
    } catch (error) {
      console.error("Error updating 1inch mock parameters:", error);
    }
  };

  // Handle updating 1inch mock failure scenarios
  const handleUpdateOneInchFailures = async () => {
    if (!oneInchMockEnabled) return;
    
    try {
      // Update each failure scenario individually
      await setOneInchInsufficientLiquidity();
      await setOneInchHighPriceImpact();
      await setOneInchNetworkError();
      console.log("Updated 1inch mock failure scenarios successfully");
    } catch (error) {
      console.error("Error updating 1inch failure scenarios:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4 px-2">
      {/* Ownership Warning Banner */}
      {!isOwner && (
        <div className="alert alert-warning shadow-lg">
          <div>
            <ShieldExclamationIcon className="h-6 w-6" />
            <div>
              <h3 className="font-bold">Access Restricted</h3>
              <div className="text-sm">
                Your wallet ({connectedAddress ? <Address address={connectedAddress} /> : "Not connected"}) is not the owner of the mock integrator contracts.
                <br />
                Mock controls are view-only. Contract calls will revert due to missing ownership permissions.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mock Mode Toggle Controls */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Mock Mode Controls</h2>
          <div className="flex flex-row gap-4">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text mr-2">Pyth Mock</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={pythMockEnabled}
                  onChange={handleTogglePythMock}
                  disabled={!isOwner}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text mr-2">1inch Mock</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={oneInchMockEnabled}
                  onChange={handleToggleOneInchMock}
                  disabled={!isOwner}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pyth Mock Controls */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h3 className="card-title">Pyth Price Feed Mock</h3>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">ETH/USD Price ($)</span>
              </label>
              <input
                type="number"
                placeholder="2500.00"
                className="input input-bordered w-full"
                value={ethPrice}
                onChange={e => setEthPrice(e.target.value)}
                disabled={!pythMockEnabled || !isOwner}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">BTC/USD Price ($)</span>
              </label>
              <input
                type="number"
                placeholder="35000.00"
                className="input input-bordered w-full"
                value={btcPrice}
                onChange={e => setBtcPrice(e.target.value)}
                disabled={!pythMockEnabled || !isOwner}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Volatility (basis points, 100 = 1%)</span>
              </label>
              <input
                type="number"
                placeholder="200"
                className="input input-bordered w-full"
                value={volatilityBps}
                onChange={e => setVolatilityBps(e.target.value)}
                disabled={!pythMockEnabled || !isOwner}
              />
            </div>
            
            <button
              className="btn btn-primary mt-2"
              onClick={handleUpdatePythPrices}
              disabled={!pythMockEnabled || !isOwner}
            >
              Update Prices
            </button>
            
            <div className="divider"></div>
            
            <h4 className="font-semibold flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-1 text-warning" />
              Network Conditions
            </h4>
            
            <div className="flex flex-col gap-2">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Network Outage</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-warning"
                    checked={networkOutage}
                    onChange={e => setNetworkOutage(e.target.checked)}
                    disabled={!pythMockEnabled || !isOwner}
                  />
                </label>
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Delayed Updates</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-warning"
                    checked={delayedUpdates}
                    onChange={e => setDelayedUpdates(e.target.checked)}
                    disabled={!pythMockEnabled || !isOwner}
                  />
                </label>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Delay Blocks</span>
                </label>
                <input
                  type="number"
                  placeholder="2"
                  className="input input-bordered w-full"
                  value={updateDelayBlocks}
                  onChange={e => setUpdateDelayBlocks(e.target.value)}
                  disabled={!pythMockEnabled || !delayedUpdates || !isOwner}
                />
              </div>
            </div>
            
            <button
              className="btn btn-primary mt-2"
              onClick={handleUpdatePythNetwork}
              disabled={!pythMockEnabled || !isOwner}
            >
              Update Network Conditions
            </button>
          </div>
        </div>

        {/* 1inch Mock Controls */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h3 className="card-title">1inch Swap Mock</h3>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Slippage (basis points, 100 = 1%)</span>
              </label>
              <input
                type="number"
                placeholder="50"
                className="input input-bordered w-full"
                value={slippageBps}
                onChange={e => setSlippageBps(e.target.value)}
                disabled={!oneInchMockEnabled || !isOwner}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Price Impact (basis points, 100 = 1%)</span>
              </label>
              <input
                type="number"
                placeholder="30"
                className="input input-bordered w-full"
                value={priceImpactBps}
                onChange={e => setPriceImpactBps(e.target.value)}
                disabled={!oneInchMockEnabled || !isOwner}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Liquidity Threshold (tokens)</span>
              </label>
              <input
                type="number"
                placeholder="1000"
                className="input input-bordered w-full"
                value={liquidityThreshold}
                onChange={e => setLiquidityThreshold(e.target.value)}
                disabled={!oneInchMockEnabled || !isOwner}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Network Latency (ms)</span>
              </label>
              <input
                type="number"
                placeholder="2000"
                className="input input-bordered w-full"
                value={networkLatency}
                onChange={e => setNetworkLatency(e.target.value)}
                disabled={!oneInchMockEnabled || !isOwner}
              />
            </div>
            
            <button
              className="btn btn-primary mt-2"
              onClick={handleUpdateOneInchParams}
              disabled={!oneInchMockEnabled || !isOwner}
            >
              Update Parameters
            </button>
            
            <div className="divider"></div>
            
            <h4 className="font-semibold flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-1 text-warning" />
              Failure Scenarios
            </h4>
            
            <div className="flex flex-col gap-2">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Insufficient Liquidity</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-warning"
                    checked={insufficientLiquidity}
                    onChange={e => setInsufficientLiquidity(e.target.checked)}
                    disabled={!oneInchMockEnabled || !isOwner}
                  />
                </label>
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">High Price Impact</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-warning"
                    checked={highPriceImpact}
                    onChange={e => setHighPriceImpact(e.target.checked)}
                    disabled={!oneInchMockEnabled || !isOwner}
                  />
                </label>
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Network Error</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-warning"
                    checked={networkError}
                    onChange={e => setNetworkError(e.target.checked)}
                    disabled={!oneInchMockEnabled || !isOwner}
                  />
                </label>
              </div>
            </div>
            
            <button
              className="btn btn-primary mt-2"
              onClick={handleUpdateOneInchFailures}
              disabled={!oneInchMockEnabled || !isOwner}
            >
              Update Failure Scenarios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockControls;
