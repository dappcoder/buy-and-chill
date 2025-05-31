/**
 * Enum representing Moving Average types in the Vault contract
 * Matches the MAType enum in Vault.sol
 */
export enum MAType {
  ETH_USD_2000_DMA = 0,
  BTC_USD_200_WMA = 1,
}

/**
 * Convert a UI-friendly instrument name to MAType enum value
 */
export function instrumentToMAType(instrument: string): MAType {
  switch (instrument) {
    case "ETH/USD 2000 DMA":
      return MAType.ETH_USD_2000_DMA;
    case "BTC/USD 200 WMA":
      return MAType.BTC_USD_200_WMA;
    default:
      throw new Error(`Unknown instrument: ${instrument}`);
  }
}

/**
 * Convert MAType enum value to UI-friendly instrument name
 */
export function maTypeToInstrument(maType: MAType): string {
  switch (maType) {
    case MAType.ETH_USD_2000_DMA:
      return "ETH/USD 2000 DMA";
    case MAType.BTC_USD_200_WMA:
      return "BTC/USD 200 WMA";
    default:
      throw new Error(`Unknown MAType: ${maType}`);
  }
}

/**
 * Get the instrument name from a numeric MAType value
 * This is useful when working with contract return values
 */
export function getInstrumentFromNumber(maTypeNumber: number): string {
  return maTypeToInstrument(maTypeNumber as MAType);
}

/**
 * Get a numeric MAType value from an instrument name
 * This is useful when calling contract functions
 */
export function getMATypeNumberFromInstrument(instrument: string): number {
  return instrumentToMAType(instrument);
}

/**
 * Get mock data for an instrument
 * This is useful for fallbacks when contract calls fail
 */
export function getMockDataForInstrument(instrument: string, dataType: "price" | "performance" | "balance") {
  const mockData = {
    price: {
      "ETH/USD 2000 DMA": BigInt(1850 * 10 ** 8),
      "BTC/USD 200 WMA": BigInt(29850 * 10 ** 8),
    },
    performance: {
      "ETH/USD 2000 DMA": [125, 350, 780, 1450, 2200, 3100], // in basis points (100 = 1%)
      "BTC/USD 200 WMA": [80, 280, 650, 1200, 1950, 2800],
    },
    balance: {
      "ETH/USD 2000 DMA": 2.5,
      "BTC/USD 200 WMA": 0.75,
      DAI: 1000,
    },
  };

  return mockData[dataType][instrument as keyof (typeof mockData)[typeof dataType]];
}
