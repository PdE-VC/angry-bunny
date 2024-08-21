// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.9.6/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.9.6/access/Ownable.sol";
import "@openzeppelin/contracts@4.9.6/utils/structs/EnumerableSet.sol";
import "./INFTCollection.sol";
import "./NFTCollection.sol";

contract ABAC is ERC20, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private activeMiners;

    struct NextNFTInfo {
        address miner;
        uint256 seedNumber;
        string imageURI;
        uint256 lastUpdated;
    }

    NextNFTInfo public nextNFTInfo;
    mapping(uint256 => address) public seedToCollection;
    uint256 public tokensPerBlock = 10 * 10**18;
    uint256 public constant MIN_TOKENS_PER_BLOCK = 1 * 10**18;
    uint256 public constant maxSupply = 21 * 10**9 * 10**18;
    uint256 public immutable startTime;
    uint256 public constant HALVING_INTERVAL = 4 * 365 * 24 * 60 * 60;
    uint256 public maxNFTs = 100;
    uint256 public constant MINT_INTERVAL = 10 minutes;
    uint256 public lastMintTime;
    uint256 public collectionCounter;
    uint256 public maxCollections = 10000;

    constructor(uint256 initialSupply) ERC20("Angry Bunny Art Coin", "ABAC") {
        _mint(msg.sender, initialSupply);
        startTime = block.timestamp;
    }

    function addActiveMiner(address miner) external onlyOwner {
        require(miner != address(0), "Invalid address");
        activeMiners.add(miner);
    }

    function removeActiveMiner(address miner) external onlyOwner {
        activeMiners.remove(miner);
    }

    function updateNextNFTInfo(address miner, uint256 seedNumber, string memory imageURI) external onlyOwner {
        require(miner != address(0), "Invalid miner address");
        require(seedToCollection[seedNumber] != address(0), "Invalid seed number");
        require(activeMiners.contains(miner), "Miner is not active");

        nextNFTInfo = NextNFTInfo({
            miner: miner,
            seedNumber: seedNumber,
            imageURI: imageURI,
            lastUpdated: block.timestamp
        });
    }

    function mintAndReward() external {
        require(block.timestamp >= lastMintTime + MINT_INTERVAL, "Minting too soon");
        require(nextNFTInfo.lastUpdated + MINT_INTERVAL > block.timestamp, "Next NFT info outdated");

        address collectionAddress = seedToCollection[nextNFTInfo.seedNumber];
        INFTCollection nftCollection = INFTCollection(collectionAddress);
        require(nftCollection.tokenCounter() < maxNFTs, "Max NFT limit reached");

        _applyHalving();
        require(totalSupply() + tokensPerBlock <= maxSupply, "Max supply reached");

        nftCollection.createNFT(owner(), nextNFTInfo.imageURI);
        _mint(nextNFTInfo.miner, tokensPerBlock);
        lastMintTime = block.timestamp;
    }

    function createNewNFTCollection(string memory name, string memory symbol) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Collection name cannot be empty");
        require(bytes(symbol).length > 0, "Collection symbol cannot be empty");

        collectionCounter++;
        uint256 seedNumber = collectionCounter;

        require(collectionCounter > maxCollections, "Max colecction limit reached");
        
        NFTCollection newCollection = new NFTCollection(name, symbol);
        seedToCollection[seedNumber] = address(newCollection);

        return seedNumber;
    }

    function getActiveMiners() external view returns (address[] memory) {
        return activeMiners.values();
    }

    function isActiveMiner(address miner) external view returns (bool) {
        return activeMiners.contains(miner);
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
