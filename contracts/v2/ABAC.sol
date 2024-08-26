// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.9.6/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.9.6/access/Ownable.sol";
import "./MinerManager.sol";
import "./NFTCollectionManager.sol";

contract ABAC is ERC20, Ownable {
    MinerManager private minerManager;
    NFTCollectionManager private nftCollectionManager;

    // Tokens rewarded per block
    uint256 public tokensPerBlock = 10 * 10**18;
    uint256 public constant MIN_TOKENS_PER_BLOCK = 1 * 10**18;
    uint256 public constant maxSupply = 21 * 10**9 * 10**18;

    uint256 public immutable startTime;
    uint256 public constant HALVING_INTERVAL = 4 * 365 * 24 * 60 * 60;

    constructor(uint256 initialSupply, address minerManagerAddress, address nftCollectionManagerAddress) 
        ERC20("Angry Bunny Art Coin", "ABAC") 
    {
        _mint(msg.sender, initialSupply);
        startTime = block.timestamp;
        minerManager =  new MinerManager(owner());
        nftCollectionManager = new NFTCollectionManager(address(this));
    }

    function mintAndReward() external {
        require(block.timestamp >= nftCollectionManager.lastMintTime() + nftCollectionManager.MINT_INTERVAL(), "Minting too soon");
        require(nftCollectionManager.isNextNFTInfoUpdated(), "Next NFT info outdated");
        require(totalSupply() + tokensPerBlock <= maxSupply, "Max supply reached");

        _applyHalving();

        address selectedMiner = minerManager.selectRandomMiner();
        nftCollectionManager.mintNFT();

        _mint(selectedMiner, tokensPerBlock);
    }

    function _applyHalving() internal {
        uint256 elapsedTime = block.timestamp - startTime;
        uint256 halvings = elapsedTime / HALVING_INTERVAL;

        uint256 newTokensPerBlock = 10 * 10**18 >> halvings;

        if (newTokensPerBlock < MIN_TOKENS_PER_BLOCK) {
            tokensPerBlock = MIN_TOKENS_PER_BLOCK;
        } else {
            tokensPerBlock = newTokensPerBlock;
        }
    }
}
