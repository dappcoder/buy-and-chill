//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract {
    // State Variables
    address public immutable owner;
    string public greeting = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint256) public userGreetingCounter;
    
    // Buy and Chill SMA Token Variables
    mapping(address => mapping(string => uint256)) public tokenBalances;
    mapping(string => uint256[]) public historicalPrices;

    // Events: a way to emit log statements from smart contract that can be listened to by external parties
    event GreetingChange(address indexed greetingSetter, string newGreeting, bool premium, uint256 value);

    // Constructor: Called once on contract deployment
    // Check packages/foundry/deploy/Deploy.s.sol
    constructor(address _owner) {
        owner = _owner;
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    // Check the withdraw() function
    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    /**
     * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
     *
     * @param _newGreeting (string memory) - new greeting to save on the contract
     */
    function setGreeting(string memory _newGreeting) public payable {
        // Print data to the anvil chain console. Remove when deploying to a live network.

        console.logString("Setting new greeting");
        console.logString(_newGreeting);

        greeting = _newGreeting;
        totalCounter += 1;
        userGreetingCounter[msg.sender] += 1;

        // msg.value: built-in global variable that represents the amount of ether sent with the transaction
        if (msg.value > 0) {
            premium = true;
        } else {
            premium = false;
        }

        // emit: keyword used to trigger an event
        emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
    }

    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() public isOwner {
        (bool success,) = owner.call{ value: address(this).balance }("");
        require(success, "Failed to send Ether");
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable { }

    // Buy and Chill SMA Token Functions

    /**
     * Get the current price of the specified SMA token instrument
     * @param instrument The name of the instrument ("ETH/USD 2000 DMA" or "BTC/USD 200 WMA")
     * @return The current price in USD (scaled by 10^18)
     */
    function getTokenPrice(string memory instrument) public pure returns (uint256) {
        // Return dummy prices based on instrument name
        if (keccak256(bytes(instrument)) == keccak256(bytes("ETH/USD 2000 DMA"))) {
            return 1993 * 10**18;  // $1993
        } else {
            return 34321 * 10**18; // $34,321
        }
    }

    /**
     * Get the token balance for a specific user and instrument
     * @param user The address of the user
     * @param instrument The name of the instrument
     * @return The token balance (scaled by 10^18)
     */
    function getTokenBalance(address user, string memory instrument) public view returns (uint256) {
        return tokenBalances[user][instrument];
    }

    /**
     * Get the DAI balance for a specific user
     * @param user The address of the user
     * @return The DAI balance (scaled by 10^18)
     */
    function getDaiBalance(address user) public pure returns (uint256) {
        // Return dummy DAI balance
        return 5000 * 10**18; // 5000 DAI
    }

    /**
     * Get historical prices for an instrument
     * @param instrument The name of the instrument
     * @return An array of historical prices
     */
    function getHistoricalPrices(string memory instrument) public pure returns (uint256[] memory) {
        uint256[] memory prices = new uint256[](30);
        uint256 basePrice;
        
        // Set base price based on instrument
        if (keccak256(bytes(instrument)) == keccak256(bytes("ETH/USD 2000 DMA"))) {
            basePrice = 1900 * 10**18;
        } else {
            basePrice = 33000 * 10**18;
        }
        
        // Generate dummy historical data with slight variations
        for (uint i = 0; i < 30; i++) {
            // Create some variation in the price (±5%)
            int256 variation = int256(i * 7 + 42) % 100;
            if (variation < 0) variation = -variation;
            
            prices[i] = basePrice + (basePrice * uint256(variation) / 2000);
        }
        
        return prices;
    }

    /**
     * Get performance data for an instrument
     * @param instrument The name of the instrument
     * @return Performance percentages for different time periods
     */
    function getPerformanceData(string memory instrument) public pure returns (int256[] memory) {
        int256[] memory performance = new int256[](6);
        
        // Dummy performance data (in basis points, 100 = 1%)
        // [1 Week, 1 Month, 6 Months, 1 Year, 2 Years, 3 Years]
        if (keccak256(bytes(instrument)) == keccak256(bytes("ETH/USD 2000 DMA"))) {
            performance[0] = 224;  // 2.24%
            performance[1] = 543;  // 5.43%
            performance[2] = 1232; // 12.32%
            performance[3] = 2541; // 25.41%
            performance[4] = 4832; // 48.32%
            performance[5] = 7621; // 76.21%
        } else {
            performance[0] = 312;  // 3.12%
            performance[1] = 721;  // 7.21%
            performance[2] = 1845; // 18.45%
            performance[3] = 3267; // 32.67%
            performance[4] = 5943; // 59.43%
            performance[5] = 8834; // 88.34%
        }
        
        return performance;
    }

    /**
     * Buy tokens for the specified instrument
     * @param instrument The name of the instrument
     * @param daiAmount The amount of DAI to spend (scaled by 10^18)
     * @return Success status
     */
    function buyToken(string memory instrument, uint256 daiAmount) public payable returns (bool) {
        // Calculate token amount based on current price
        uint256 price = getTokenPrice(instrument);
        uint256 tokenAmount = (daiAmount * 10**18) / price;
        
        // Update token balance
        tokenBalances[msg.sender][instrument] += tokenAmount;
        
        // Emit event or log for debugging
        console.logString("Bought tokens");
        console.logString(instrument);
        console.logUint(tokenAmount);
        
        return true;
    }

    /**
     * Sell tokens for the specified instrument
     * @param instrument The name of the instrument
     * @param tokenAmount The amount of tokens to sell (scaled by 10^18)
     * @return Success status
     */
    function sellToken(string memory instrument, uint256 tokenAmount) public returns (bool) {
        // Check if user has enough tokens
        require(tokenBalances[msg.sender][instrument] >= tokenAmount, "Insufficient token balance");
        
        // Update token balance
        tokenBalances[msg.sender][instrument] -= tokenAmount;
        
        // Emit event or log for debugging
        console.logString("Sold tokens");
        console.logString(instrument);
        console.logUint(tokenAmount);
        
        return true;
    }
}
