# Buy and Chill 🏖️

Innovative Always Up DeFi instrument! Reduces ETH and BTC volatility. Not financial advice. DYOR!

## Description (in detail)
This DApp implements a new DeFi instrument that tracks the price of a simple moving average like Bitcoin's 200 week moving average or Ether's 2000 day moving average. These two examples of moving averages have never had a negative day in history! Not financial advice! Do your own research!

The goal is to create a less volatile investment vehicle that still captures the long-term trend of the cryptocurrency.
It reduces volatility from the underlying asset like ETH/USD or BTC/USD. While most of the time, these particular MAs (moving averages) underperform the spot price for ETH and BTC, they are historically proven to give returns significantly higher than stable coins in protocols like AAVE or USD treasury bills. And they never had a negative day in history (doesn't guarantee future performance)!

A few pros for this instrument as opposed to the underlying assets or yield bearing stable coins:
1. Perfect for the granny: A BTC or ETH investment mechanism if you don’t like volatility, but still dislike FIAT devaluation.
2. Stablecoins portfolio alternative: Instead of protecting themselves from volatility by partially or fully parking jn stablecoins with yield, it is better to keep in one of the two indeces and get better return on it because it never went down so far. Users can do that at least until it has its first negative day.
3. These two instruments have medium of exchange qualities because they have low volatility. 
4. Finally! A form of deflationary money with steady appreciation and no negative movements.
These statements do not constitute financial advice! Do your own research and note that past performance does not guarantee future returns!

<< TODO: Add chart for comparative metrics BTC200WMA and ETH2000DMA vs AAVE USDC yield >>

Quick How It Works: The user deposits DAI and gets a newly minted index token. One unit of the index token closely follows the value of the corresponding Simple Moving Average. For example, at the time of writing, the ETH/USD 2000 Day SMA values $1991 (ETH/USD spot price is $2640). To get 1 ETHUSD2000DMA, the user must deposit 1991 DAI. The reverse - the user burns the index token and receives the equivalent DAI amount. The on-chain implementation is based on a vault that holds a combination of ETH and DAI to match the value of the moving average. When the user deposits DAI, the vault contract calculates if it is necessary to rebalance the vault and if necessary, execute a swap (i.e. buy a specific amount of ETH). When the user burns the index token, the vault calculates and sells enough ETH to keep the moving average and transfer the correct amount of DAI to the user. In general, every interaction with the vault can result in rebalancing ETH DAI holding if a given tolerance value has been exceeded (save gas for small amounts). 

## How it's made (the nitty-gritty technical details)

### High level architecure
This is a DApp that is built with solidity smart contracts and besides a frontend and a few initialisation scripts, it has no other centralised components. 
As frameworks and tooling - the Scaffold-ETH 2 is used both for contracts, scripts, tooling and frontend.
The DApp is deployed on Arbitrum Mainnet and was developed entirely based on a local Anvil mainnet fork. 

Vault Contract: This handles token management and rebalancing logic.

Pyth Network Oracle: The integration with Pyth Oracle is done via PythIntegrator.sol contract. The role of the oracle is to update daily asset prices and add them to the set of datapoints based on which the moving averages are calculated.

1Inch: We need to do rebalancing - it means we need to use a DEX. 1inch was chosen because we need TWAP strategy using Limit Orders to gradually build positions at the moving average price.

### Pyth Integration
The data set is initially populated in the PriceDataStorage.sol contract by a script that reads all the prices from the price_data.json file.
The file in turn is populated with historic data retrieved from PYTH TradingView API endpoint by FetchPythHistoricalData.js .
Once initialized, the system needs regular price updates to maintain accurate moving averages. 	The PythIntegrator.sol contract connects to the official Pyth Network contract on-chain. It implements the "Pull" model where fresh price data must be fetched from Pyth's Hermes service off-chain.

### 1inch Integration
Implemented in the 1inchIntegrator.sol 

### Vault Strategy
#### Asset Allocation
For each MA token type, the vault should maintain a dynamic allocation between:
1. The underlying cryptocurrency (ETH or BTC)
2. Stablecoins (DAI)

The allocation ratio is determined by the relationship between the current price and the MA:
* When price = MA: 50% crypto, 50% stablecoins
* When price > MA: Less crypto, more stablecoins
* When price < MA: More crypto, less stablecoins

The percentage allocated to the cryptocurrency can be calculated as: 
crypto_allocation = 50% * (MA / current_price)

This formula automatically adjusts allocation based on price deviation from the MA:
* At MA price: 50% * (MA/MA) = 50% in crypto
* At 2x MA price: 50% * (MA/(2*MA)) = 25% in crypto
* At 0.5x MA price: 50% * (MA/(0.5*MA)) = 100% in crypto (capped at 100%)

#### Rebalancing
When rebalancing is triggered:
1. Calculate Target Allocation:
    * Determine the current price and MA value
    * Calculate target crypto percentage using the formula
    * Calculate target DAI percentage (100% - crypto percentage)
2. Measure Current Allocation:
    * Calculate current value of crypto holdings
    * Calculate current value of DAI holdings
    * Determine current percentage allocation
3. Execute Swaps:
    * If current allocation deviates by >5% from target:
        * Swap crypto for DAI or vice versa to reach target allocation
    * Use a slippage tolerance of 0.5-1% for swaps
4. Gradual Execution for Large Rebalances:
    * For deviations >10%, split rebalancing into multiple smaller swaps
    * Execute these over 2-3 days to minimize price impact

#### User Interactions
When users deposit DAI:
1. Calculate target allocation at current price/MA ratio
2. Immediately swap appropriate portion of DAI for crypto
3. Hold remainder in DAI

When users withdraw MA tokens:
1. Burn the tokens
2. Return proportional amount of crypto and DAI based on current vault composition

#### Example Scenario
Let's walk through a practical example for BTC/USD 200 WMA:
1. Initial State:
    * BTC price: $60,000
    * 200-week MA: $30,000
    * Target allocation: 50% * (30,000/60,000) = 25% BTC, 75% DAI
2. Price Drops to $45,000:
    * New target allocation: 50% * (30,000/45,000) = 33.3% BTC, 66.7% DAI
    * Current allocation is 25% BTC, 75% DAI
    * Deviation: 8.3% (>5% threshold)
    * Action: Rebalance by swapping DAI for BTC to increase BTC allocation to 33.3%
3. Price Crashes to $25,000:
    * New target allocation: 50% * (30,000/25,000) = 60% BTC, 40% DAI
    * Current allocation is 33.3% BTC, 66.7% DAI
    * Deviation: 26.7% (>10% threshold)
    * Action: Execute rebalance in 3 tranches over 3 days, each day increasing BTC allocation by ~9%

This strategy creates a natural "buy low, sell high" mechanism that maintains the moving average tracking while reducing volatility and drawdowns compared to holding pure crypto.

### Frontend components
One page react app that has two screens (wallet not connected and connected).

Components when the wallet is NOT connected:
1. Instrument Drop down. Has two options “ETH/USD 2000 DMA” and “BTC/USD 200 WMA”.
2. The current price. Shows the current price of the selected instrument (1). Example: $1993
3. Chart. A chart component displaying the selected instrument on a fixed long term range (e.g. 3 years). On X axis show the min and max prices and on Y labels the year and months
4. Performance table. Two rows and 6 columns. On each column the labels 1 Week, 1 Month, 6 Months, 1 Year, 2 Years, 3 Years and the performance in percentage and green color. Example: “+2.24%”.
5. “Connect Wallet” button.

Components when the wallet is connected:
1. Instrument Drop down. Has two options “ETH/USD 2000 DMA” and “BTC/USD 200 WMA”.
2. The current price. Shows the current price of the selected instrument (1). Example: $1993
3. Chart. A chart component displaying the selected instrument on a fixed long term range (e.g. 3 years). On X axis show the min and max prices and on Y labels the year and months
4. Performance table. Two rows and 6 columns. On each column the labels 1 Week, 1 Month, 6 Months, 1 Year, 2 Years, 3 Years and the performance in percentage and green color. Example: “+2.24%”.
5. Operation selector. Can be two buttons or tabs: “BUY” and “SELL”
6. Balance. Displays the wallet balance of the selected instrument and the value in DAI.
7. Amount. Textfield to input the value of the desired amount to buy or to sell. A max button to the left (embedded in the textfield) and a label to the right saying “DAI” or the name of the instrument depending on the selected instrument and the selected operation.
8. Preview. Shows the preview of the operation if executed. For exammple: “You get: 1234 DAI” or “You get: 0.1234 ETH/USD 2000 DMA”
9. Operation button. The Buy or Sell button depending on the selected operation.

## Future improvements

### Optimize Rebalancing Strategy
There are several scenarios where the vault's value could decrease from say 1000 DAI to 900 DAI even when the MA index remains stable.
1. Trading Losses and Slippage. BTC oscillates around the MA but never strays far from it. This is a classic "whipsaw" problem where frequent trading around a range erodes capital. After multiple swaps, these costs accumulate to reduce vault value
2. Gas Costs for On-chain Rebalancing
3. Impermanent Loss-like Effect. When price moves above MA, the vault reduces crypto exposure. If price continues upward significantly before returning to MA, the vault misses some upside. When price finally returns to MA, the vault has less total value than if it had simply held
With back testing and careful calibration of parameters, these risks of decreasing vault NAV can be mitigated. And at the same time, these losses be compensated with “accidental” profits from swapping. 

So here are some potential mitigation:
1. Calibrate rebalancing thresholds carefully (use backtesting data):
    * Too frequent = excessive costs
    * Too infrequent = missed rebalancing opportunities
2. Add yield generation:
    * Deploy the stablecoin portion in yield-generating protocols
    * Even a 3-5% yield on the stablecoin portion can offset most operational costs
3. Optimize for tax efficiency:
    * In many jurisdictions, trading losses can offset gains for tax purposes
    * This can improve after-tax returns
4. Implement anti-slippage measures:
    * Use limit orders where possible
    * Execute larger trades in tranches
    * Trade during lower-volatility periods
