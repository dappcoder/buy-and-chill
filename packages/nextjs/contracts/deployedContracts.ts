/**
 * Generated from Foundry deployment artifacts
 * Generated on: 2025-05-31T13:08:30.847Z
 * DO NOT MODIFY MANUALLY - use the generateDeployedContracts.js script
 */

import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    MockERC20: {
      address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      abi:       [
            {
                  "type": "constructor",
                  "inputs": [
                        {
                              "name": "name",
                              "type": "string",
                              "internalType": "string"
                        },
                        {
                              "name": "symbol",
                              "type": "string",
                              "internalType": "string"
                        },
                        {
                              "name": "decimals_",
                              "type": "uint8",
                              "internalType": "uint8"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "allowance",
                  "inputs": [
                        {
                              "name": "owner",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "spender",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "approve",
                  "inputs": [
                        {
                              "name": "spender",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "balanceOf",
                  "inputs": [
                        {
                              "name": "account",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "decimals",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint8",
                              "internalType": "uint8"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mint",
                  "inputs": [
                        {
                              "name": "to",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "amount",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "name",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "string",
                              "internalType": "string"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "symbol",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "string",
                              "internalType": "string"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "totalSupply",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "transfer",
                  "inputs": [
                        {
                              "name": "to",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "transferFrom",
                  "inputs": [
                        {
                              "name": "from",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "to",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "event",
                  "name": "Approval",
                  "inputs": [
                        {
                              "name": "owner",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "spender",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "Transfer",
                  "inputs": [
                        {
                              "name": "from",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "to",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "error",
                  "name": "ERC20InsufficientAllowance",
                  "inputs": [
                        {
                              "name": "spender",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "allowance",
                              "type": "uint256",
                              "internalType": "uint256"
                        },
                        {
                              "name": "needed",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "ERC20InsufficientBalance",
                  "inputs": [
                        {
                              "name": "sender",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "balance",
                              "type": "uint256",
                              "internalType": "uint256"
                        },
                        {
                              "name": "needed",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "ERC20InvalidApprover",
                  "inputs": [
                        {
                              "name": "approver",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "ERC20InvalidReceiver",
                  "inputs": [
                        {
                              "name": "receiver",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "ERC20InvalidSender",
                  "inputs": [
                        {
                              "name": "sender",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "ERC20InvalidSpender",
                  "inputs": [
                        {
                              "name": "spender",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            }
      ],
    },
    PriceDataStorage: {
      address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      abi:       [
            {
                  "type": "constructor",
                  "inputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "addPrice",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        },
                        {
                              "name": "timestamp",
                              "type": "uint256",
                              "internalType": "uint256"
                        },
                        {
                              "name": "price",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "authorizedUpdaters",
                  "inputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getLatestPrice",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getMA",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getPriceAt",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        },
                        {
                              "name": "index",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "timestamp",
                              "type": "uint256",
                              "internalType": "uint256"
                        },
                        {
                              "name": "price",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getPriceCount",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getPricePoints",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256[]",
                              "internalType": "uint256[]"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getPriceRange",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        },
                        {
                              "name": "startIndex",
                              "type": "uint256",
                              "internalType": "uint256"
                        },
                        {
                              "name": "count",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "timestamps",
                              "type": "uint256[]",
                              "internalType": "uint256[]"
                        },
                        {
                              "name": "prices",
                              "type": "uint256[]",
                              "internalType": "uint256[]"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getTimestamps",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256[]",
                              "internalType": "uint256[]"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "hasValidMA",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "initializePrices",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        },
                        {
                              "name": "timestamps",
                              "type": "uint256[]",
                              "internalType": "uint256[]"
                        },
                        {
                              "name": "prices",
                              "type": "uint256[]",
                              "internalType": "uint256[]"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "maLengths",
                  "inputs": [
                        {
                              "name": "",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "maValues",
                  "inputs": [
                        {
                              "name": "",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "overrideMAForTesting",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        },
                        {
                              "name": "newMAValue",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "owner",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "priceData",
                  "inputs": [
                        {
                              "name": "",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        },
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "timestamp",
                              "type": "uint256",
                              "internalType": "uint256"
                        },
                        {
                              "name": "price",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "renounceOwnership",
                  "inputs": [],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMALengthForTesting",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        },
                        {
                              "name": "newMALength",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setUpdaterAuthorization",
                  "inputs": [
                        {
                              "name": "updater",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "status",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "transferOwnership",
                  "inputs": [
                        {
                              "name": "newOwner",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "event",
                  "name": "MAUpdated",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "indexed": false,
                              "internalType": "enum PriceDataStorage.Instrument"
                        },
                        {
                              "name": "maValue",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "OwnershipTransferred",
                  "inputs": [
                        {
                              "name": "previousOwner",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "newOwner",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "PriceAdded",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "indexed": false,
                              "internalType": "enum PriceDataStorage.Instrument"
                        },
                        {
                              "name": "timestamp",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        },
                        {
                              "name": "price",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "PricesInitialized",
                  "inputs": [
                        {
                              "name": "instrument",
                              "type": "uint8",
                              "indexed": false,
                              "internalType": "enum PriceDataStorage.Instrument"
                        },
                        {
                              "name": "count",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "UpdaterAuthorized",
                  "inputs": [
                        {
                              "name": "updater",
                              "type": "address",
                              "indexed": false,
                              "internalType": "address"
                        },
                        {
                              "name": "status",
                              "type": "bool",
                              "indexed": false,
                              "internalType": "bool"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "error",
                  "name": "OwnableInvalidOwner",
                  "inputs": [
                        {
                              "name": "owner",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "OwnableUnauthorizedAccount",
                  "inputs": [
                        {
                              "name": "account",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            }
      ],
    },
    PythIntegrator: {
      address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      abi:       [
            {
                  "type": "constructor",
                  "inputs": [
                        {
                              "name": "pythContract",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "BTC_USD_PRICE_ID",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bytes32",
                              "internalType": "bytes32"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "ETH_USD_PRICE_ID",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bytes32",
                              "internalType": "bytes32"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "authorizedUpdaters",
                  "inputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getBtcUsdPrice8Decimals",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getEthUsdPrice8Decimals",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getLatestBtcUsdPrice",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "tuple",
                              "internalType": "struct PythStructs.Price",
                              "components": [
                                    {
                                          "name": "price",
                                          "type": "int64",
                                          "internalType": "int64"
                                    },
                                    {
                                          "name": "conf",
                                          "type": "uint64",
                                          "internalType": "uint64"
                                    },
                                    {
                                          "name": "expo",
                                          "type": "int32",
                                          "internalType": "int32"
                                    },
                                    {
                                          "name": "publishTime",
                                          "type": "uint256",
                                          "internalType": "uint256"
                                    }
                              ]
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getLatestEthUsdPrice",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "tuple",
                              "internalType": "struct PythStructs.Price",
                              "components": [
                                    {
                                          "name": "price",
                                          "type": "int64",
                                          "internalType": "int64"
                                    },
                                    {
                                          "name": "conf",
                                          "type": "uint64",
                                          "internalType": "uint64"
                                    },
                                    {
                                          "name": "expo",
                                          "type": "int32",
                                          "internalType": "int32"
                                    },
                                    {
                                          "name": "publishTime",
                                          "type": "uint256",
                                          "internalType": "uint256"
                                    }
                              ]
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getLatestPrice",
                  "inputs": [
                        {
                              "name": "priceId",
                              "type": "bytes32",
                              "internalType": "bytes32"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "tuple",
                              "internalType": "struct PythStructs.Price",
                              "components": [
                                    {
                                          "name": "price",
                                          "type": "int64",
                                          "internalType": "int64"
                                    },
                                    {
                                          "name": "conf",
                                          "type": "uint64",
                                          "internalType": "uint64"
                                    },
                                    {
                                          "name": "expo",
                                          "type": "int32",
                                          "internalType": "int32"
                                    },
                                    {
                                          "name": "publishTime",
                                          "type": "uint256",
                                          "internalType": "uint256"
                                    }
                              ]
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getPriceUsd8Decimals",
                  "inputs": [
                        {
                              "name": "priceId",
                              "type": "bytes32",
                              "internalType": "bytes32"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getUpdateFee",
                  "inputs": [
                        {
                              "name": "priceUpdateData",
                              "type": "bytes[]",
                              "internalType": "bytes[]"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "lastUpdateBlock",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "latestPrices",
                  "inputs": [
                        {
                              "name": "",
                              "type": "bytes32",
                              "internalType": "bytes32"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "price",
                              "type": "int64",
                              "internalType": "int64"
                        },
                        {
                              "name": "conf",
                              "type": "uint64",
                              "internalType": "uint64"
                        },
                        {
                              "name": "expo",
                              "type": "int32",
                              "internalType": "int32"
                        },
                        {
                              "name": "publishTime",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockDelayedUpdateEnabled",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockModeEnabled",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockNetworkOutageEnabled",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockPrices",
                  "inputs": [
                        {
                              "name": "",
                              "type": "bytes32",
                              "internalType": "bytes32"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "price",
                              "type": "int64",
                              "internalType": "int64"
                        },
                        {
                              "name": "conf",
                              "type": "uint64",
                              "internalType": "uint64"
                        },
                        {
                              "name": "expo",
                              "type": "int32",
                              "internalType": "int32"
                        },
                        {
                              "name": "publishTime",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockUpdateDelayBlocks",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockVolatilityPercent",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "owner",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "pyth",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "contract IPyth"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "renounceOwnership",
                  "inputs": [],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockDelayedUpdate",
                  "inputs": [
                        {
                              "name": "_enabled",
                              "type": "bool",
                              "internalType": "bool"
                        },
                        {
                              "name": "_delayBlocks",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockModeEnabled",
                  "inputs": [
                        {
                              "name": "_enabled",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockNetworkOutage",
                  "inputs": [
                        {
                              "name": "_enabled",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockPrice",
                  "inputs": [
                        {
                              "name": "priceId",
                              "type": "bytes32",
                              "internalType": "bytes32"
                        },
                        {
                              "name": "price",
                              "type": "int64",
                              "internalType": "int64"
                        },
                        {
                              "name": "conf",
                              "type": "uint64",
                              "internalType": "uint64"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockVolatility",
                  "inputs": [
                        {
                              "name": "_volatilityPercent",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setUpdaterAuthorization",
                  "inputs": [
                        {
                              "name": "updater",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "status",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "transferOwnership",
                  "inputs": [
                        {
                              "name": "newOwner",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "updatePriceFeeds",
                  "inputs": [
                        {
                              "name": "priceUpdateData",
                              "type": "bytes[]",
                              "internalType": "bytes[]"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "payable"
            },
            {
                  "type": "event",
                  "name": "AllPricesUpdated",
                  "inputs": [
                        {
                              "name": "updateTime",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        },
                        {
                              "name": "fee",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "MockFailureToggled",
                  "inputs": [
                        {
                              "name": "failureType",
                              "type": "string",
                              "indexed": false,
                              "internalType": "string"
                        },
                        {
                              "name": "isEnabled",
                              "type": "bool",
                              "indexed": false,
                              "internalType": "bool"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "MockModeToggled",
                  "inputs": [
                        {
                              "name": "isMockEnabled",
                              "type": "bool",
                              "indexed": false,
                              "internalType": "bool"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "MockParamsUpdated",
                  "inputs": [
                        {
                              "name": "paramName",
                              "type": "string",
                              "indexed": false,
                              "internalType": "string"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "MockPriceUpdated",
                  "inputs": [
                        {
                              "name": "priceId",
                              "type": "bytes32",
                              "indexed": true,
                              "internalType": "bytes32"
                        },
                        {
                              "name": "price",
                              "type": "int64",
                              "indexed": false,
                              "internalType": "int64"
                        },
                        {
                              "name": "conf",
                              "type": "uint64",
                              "indexed": false,
                              "internalType": "uint64"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "OwnershipTransferred",
                  "inputs": [
                        {
                              "name": "previousOwner",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "newOwner",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "PriceUpdated",
                  "inputs": [
                        {
                              "name": "priceId",
                              "type": "bytes32",
                              "indexed": true,
                              "internalType": "bytes32"
                        },
                        {
                              "name": "price",
                              "type": "int64",
                              "indexed": false,
                              "internalType": "int64"
                        },
                        {
                              "name": "conf",
                              "type": "uint64",
                              "indexed": false,
                              "internalType": "uint64"
                        },
                        {
                              "name": "expo",
                              "type": "int32",
                              "indexed": false,
                              "internalType": "int32"
                        },
                        {
                              "name": "publishTime",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "UpdaterAuthorized",
                  "inputs": [
                        {
                              "name": "updater",
                              "type": "address",
                              "indexed": false,
                              "internalType": "address"
                        },
                        {
                              "name": "status",
                              "type": "bool",
                              "indexed": false,
                              "internalType": "bool"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "error",
                  "name": "OwnableInvalidOwner",
                  "inputs": [
                        {
                              "name": "owner",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "OwnableUnauthorizedAccount",
                  "inputs": [
                        {
                              "name": "account",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            }
      ],
    },
    OneInchIntegrator: {
      address: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
      abi:       [
            {
                  "type": "constructor",
                  "inputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "getEstimatedGas",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getMockSwapPath",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "protocols",
                              "type": "address[]",
                              "internalType": "address[]"
                        },
                        {
                              "name": "tokens",
                              "type": "address[]",
                              "internalType": "address[]"
                        },
                        {
                              "name": "portions",
                              "type": "uint256[]",
                              "internalType": "uint256[]"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getSwapQuote",
                  "inputs": [
                        {
                              "name": "fromToken",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "toToken",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "fromAmount",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockGasEstimate",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockHighPriceImpactEnabled",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockInsufficientLiquidityEnabled",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockLatencyMs",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockLiquidityThreshold",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockModeEnabled",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockNetworkErrorEnabled",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockPriceImpactPercent",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockSlippagePercent",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "mockSwapPath",
                  "inputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "protocol",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "fromToken",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "toToken",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "portion",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "owner",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "renounceOwnership",
                  "inputs": [],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockGasEstimate",
                  "inputs": [
                        {
                              "name": "_gasEstimate",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockHighPriceImpact",
                  "inputs": [
                        {
                              "name": "_enabled",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockInsufficientLiquidity",
                  "inputs": [
                        {
                              "name": "_enabled",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockLatency",
                  "inputs": [
                        {
                              "name": "_latencyMs",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockLiquidityThreshold",
                  "inputs": [
                        {
                              "name": "_liquidityThreshold",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockModeEnabled",
                  "inputs": [
                        {
                              "name": "_enabled",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockNetworkError",
                  "inputs": [
                        {
                              "name": "_enabled",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockPriceImpact",
                  "inputs": [
                        {
                              "name": "_priceImpactPercent",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockSlippage",
                  "inputs": [
                        {
                              "name": "_slippagePercent",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setMockSwapPath",
                  "inputs": [
                        {
                              "name": "_protocols",
                              "type": "address[]",
                              "internalType": "address[]"
                        },
                        {
                              "name": "_tokens",
                              "type": "address[]",
                              "internalType": "address[]"
                        },
                        {
                              "name": "_portions",
                              "type": "uint256[]",
                              "internalType": "uint256[]"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setVaultAddress",
                  "inputs": [
                        {
                              "name": "_vaultAddress",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "swap",
                  "inputs": [
                        {
                              "name": "fromToken",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "toToken",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "fromAmount",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "transferOwnership",
                  "inputs": [
                        {
                              "name": "newOwner",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "vaultAddress",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "event",
                  "name": "MockFailureToggled",
                  "inputs": [
                        {
                              "name": "failureType",
                              "type": "string",
                              "indexed": false,
                              "internalType": "string"
                        },
                        {
                              "name": "isEnabled",
                              "type": "bool",
                              "indexed": false,
                              "internalType": "bool"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "MockLatencyUpdated",
                  "inputs": [
                        {
                              "name": "latencyMs",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "MockModeToggled",
                  "inputs": [
                        {
                              "name": "isMockEnabled",
                              "type": "bool",
                              "indexed": false,
                              "internalType": "bool"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "MockParamsUpdated",
                  "inputs": [
                        {
                              "name": "paramName",
                              "type": "string",
                              "indexed": false,
                              "internalType": "string"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "OwnershipTransferred",
                  "inputs": [
                        {
                              "name": "previousOwner",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "newOwner",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "SwapExecuted",
                  "inputs": [
                        {
                              "name": "fromToken",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "toToken",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "fromAmount",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        },
                        {
                              "name": "toAmount",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        },
                        {
                              "name": "isMockSwap",
                              "type": "bool",
                              "indexed": false,
                              "internalType": "bool"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "error",
                  "name": "OwnableInvalidOwner",
                  "inputs": [
                        {
                              "name": "owner",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "OwnableUnauthorizedAccount",
                  "inputs": [
                        {
                              "name": "account",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            }
      ],
    },
    Vault: {
      address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
      abi:       [
            {
                  "type": "constructor",
                  "inputs": [
                        {
                              "name": "_priceDataStorage",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "_pythIntegrator",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "_oneInchIntegrator",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "_daiAddress",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "_ethAddress",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "_btcAddress",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "DAI_DECIMALS",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint8",
                              "internalType": "uint8"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "PRICE_DECIMALS",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint8",
                              "internalType": "uint8"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "allowance",
                  "inputs": [
                        {
                              "name": "owner",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "spender",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "approve",
                  "inputs": [
                        {
                              "name": "spender",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "balanceOf",
                  "inputs": [
                        {
                              "name": "account",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "btcAddress",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "daiAddress",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "decimals",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint8",
                              "internalType": "uint8"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "deposit",
                  "inputs": [
                        {
                              "name": "maType",
                              "type": "uint8",
                              "internalType": "enum Vault.MAType"
                        },
                        {
                              "name": "daiAmount",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "ethAddress",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getLatestPrice",
                  "inputs": [
                        {
                              "name": "maType",
                              "type": "uint8",
                              "internalType": "enum Vault.MAType"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "getMAValue",
                  "inputs": [
                        {
                              "name": "maType",
                              "type": "uint8",
                              "internalType": "enum Vault.MAType"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "instrumentMapping",
                  "inputs": [
                        {
                              "name": "",
                              "type": "uint8",
                              "internalType": "enum Vault.MAType"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint8",
                              "internalType": "enum PriceDataStorage.Instrument"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "maTokens",
                  "inputs": [
                        {
                              "name": "",
                              "type": "uint8",
                              "internalType": "enum Vault.MAType"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "contract ERC20"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "name",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "string",
                              "internalType": "string"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "oneInchIntegrator",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "contract OneInchIntegrator"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "owner",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "priceDataStorage",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "contract PriceDataStorage"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "pythIntegrator",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "address",
                              "internalType": "contract PythIntegrator"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "rebalanceThreshold",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "renounceOwnership",
                  "inputs": [],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setRebalanceThreshold",
                  "inputs": [
                        {
                              "name": "_rebalanceThreshold",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "setSlippageTolerance",
                  "inputs": [
                        {
                              "name": "_slippageTolerance",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "slippageTolerance",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "symbol",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "string",
                              "internalType": "string"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "totalSupply",
                  "inputs": [],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "view"
            },
            {
                  "type": "function",
                  "name": "transfer",
                  "inputs": [
                        {
                              "name": "to",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "transferFrom",
                  "inputs": [
                        {
                              "name": "from",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "to",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "bool",
                              "internalType": "bool"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "transferOwnership",
                  "inputs": [
                        {
                              "name": "newOwner",
                              "type": "address",
                              "internalType": "address"
                        }
                  ],
                  "outputs": [],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "function",
                  "name": "withdraw",
                  "inputs": [
                        {
                              "name": "maType",
                              "type": "uint8",
                              "internalType": "enum Vault.MAType"
                        },
                        {
                              "name": "maTokenAmount",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "outputs": [
                        {
                              "name": "",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ],
                  "stateMutability": "nonpayable"
            },
            {
                  "type": "event",
                  "name": "Approval",
                  "inputs": [
                        {
                              "name": "owner",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "spender",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "Deposit",
                  "inputs": [
                        {
                              "name": "user",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "maType",
                              "type": "uint8",
                              "indexed": true,
                              "internalType": "enum Vault.MAType"
                        },
                        {
                              "name": "daiAmount",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        },
                        {
                              "name": "maTokens",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "OwnershipTransferred",
                  "inputs": [
                        {
                              "name": "previousOwner",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "newOwner",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "Rebalanced",
                  "inputs": [
                        {
                              "name": "maType",
                              "type": "uint8",
                              "indexed": true,
                              "internalType": "enum Vault.MAType"
                        },
                        {
                              "name": "ethAllocation",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        },
                        {
                              "name": "daiAllocation",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "Transfer",
                  "inputs": [
                        {
                              "name": "from",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "to",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "value",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "event",
                  "name": "Withdraw",
                  "inputs": [
                        {
                              "name": "user",
                              "type": "address",
                              "indexed": true,
                              "internalType": "address"
                        },
                        {
                              "name": "maType",
                              "type": "uint8",
                              "indexed": true,
                              "internalType": "enum Vault.MAType"
                        },
                        {
                              "name": "maTokens",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        },
                        {
                              "name": "daiAmount",
                              "type": "uint256",
                              "indexed": false,
                              "internalType": "uint256"
                        }
                  ],
                  "anonymous": false
            },
            {
                  "type": "error",
                  "name": "ERC20InsufficientAllowance",
                  "inputs": [
                        {
                              "name": "spender",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "allowance",
                              "type": "uint256",
                              "internalType": "uint256"
                        },
                        {
                              "name": "needed",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "ERC20InsufficientBalance",
                  "inputs": [
                        {
                              "name": "sender",
                              "type": "address",
                              "internalType": "address"
                        },
                        {
                              "name": "balance",
                              "type": "uint256",
                              "internalType": "uint256"
                        },
                        {
                              "name": "needed",
                              "type": "uint256",
                              "internalType": "uint256"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "ERC20InvalidApprover",
                  "inputs": [
                        {
                              "name": "approver",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "ERC20InvalidReceiver",
                  "inputs": [
                        {
                              "name": "receiver",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "ERC20InvalidSender",
                  "inputs": [
                        {
                              "name": "sender",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "ERC20InvalidSpender",
                  "inputs": [
                        {
                              "name": "spender",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "OwnableInvalidOwner",
                  "inputs": [
                        {
                              "name": "owner",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            },
            {
                  "type": "error",
                  "name": "OwnableUnauthorizedAccount",
                  "inputs": [
                        {
                              "name": "account",
                              "type": "address",
                              "internalType": "address"
                        }
                  ]
            }
      ],
    },
  },
} as const;

export default deployedContracts as GenericContractsDeclaration;
