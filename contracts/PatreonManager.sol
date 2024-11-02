// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PatreonManager is ERC20, Ownable {

    uint256 public totalPeriods;  // Number of periods elapsed
    uint256 public constant initialSupply = 1000; // Initial supply (1,000 tokens)
    uint256 public constant maxGrowthPeriods = 4; // Growth lasts for 4 periods (16 years)
    mapping(address => uint256) public userTokenCount; // Tracking users token count
    address[] public holders; // List of holders
    address angryContract; // Address of the ANGRY contract

    constructor(string memory name, string memory symbol, address _angryContract) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply); // Mint initial supply to owner
        userTokenCount[msg.sender] = initialSupply; // Track the owner's token count
        totalPeriods = 0; // No periods elapsed yet
        angryContract = _angryContract;
    }

    // Override decimals to make the token non-divisible
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    modifier onlyANGRY() {
        require(msg.sender == angryContract, "Caller is not ANGRY contract");
        _;
    }

    // Minting function that only the owner can call, and only when a period has passed
    function mintNewSupply() external onlyANGRY {
        totalPeriods++;
        uint256 newSupply = calculateSupply();
        _mint(owner(), newSupply); // Mint to owner
    }

    // Calculate the supply to mint based on the exponential growth in the first 16 years, and no growth after that
    function calculateSupply() internal view returns (uint256) {
        if (totalPeriods < maxGrowthPeriods) {
            // Exponential growth during the first 16 years
            return initialSupply * (2 ** totalPeriods);
        } else {
            // After 16 years, no more new tokens are minted
            return 0;
        }
    }

    // Function to transfer and update the holders
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        super.transfer(recipient, amount);
        updateHolders(msg.sender, recipient, amount);
        return true;
    }

    // Update the holder list after a transfer
    function updateHolders(address sender, address recipient, uint256 amount) internal {
        if (balanceOf(sender) == 0) {
            removeHolder(sender);
        }

        if (balanceOf(recipient) == amount) { // First time receiving tokens
            addHolder(recipient);
        }
    }

    // Add a holder to the list
    function addHolder(address account) internal {
        if (userTokenCount[account] == 0) {
            holders.push(account);
        }
        userTokenCount[account] = balanceOf(account);
    }

    // Remove a holder from the list
    function removeHolder(address account) internal {
        userTokenCount[account] = 0;
        for (uint256 i = 0; i < holders.length; i++) {
            if (holders[i] == account) {
                holders[i] = holders[holders.length - 1]; // Replace with the last one
                holders.pop();
                break;
            }
        }
    }

    // Function to choose a random holder based on their token weight
    function selectRandomHolder() external view returns (address) {
        uint256 totalHoldedTokens = totalSupply() - balanceOf(owner());

        if (totalHoldedTokens == 0 || holders.length == 0) {
            return owner();
        }

        uint256 random = uint256(keccak256(abi.encodePacked(
            block.prevrandao,
            block.gaslimit,
            block.number,
            block.timestamp,
            blockhash(block.number - 1)
            ))) % totalHoldedTokens;
            
        uint256 cumulativeSum = 0;

        for (uint256 i = 0; i < holders.length; i++) {
            cumulativeSum += balanceOf(holders[i]);
            if (random < cumulativeSum) {
                return holders[i];
            }
        }

        return holders[holders.length - 1]; // Fallback in case something goes wrong
    }
}
