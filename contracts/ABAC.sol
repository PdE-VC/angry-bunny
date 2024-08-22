// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.9.6/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.9.6/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts@4.9.6/access/Ownable.sol";
import "@openzeppelin/contracts@4.9.6/utils/structs/EnumerableSet.sol";
import "./INFTCollection.sol";
import "./NFTCollection.sol";

contract ABAC is ERC20, Ownable {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    // List of active miners
    EnumerableSet.AddressSet private activeMiners;

    // Struct to store the information of the next NFT to mint
    struct NextNFTInfo {
        address miner;
        uint256 seedNumber;
        string imageURI;
        uint256 lastUpdated;
    }

    NextNFTInfo public nextNFTInfo;

    // Mapping between seed number and NFT collection address
    mapping(uint256 => address) public seedToCollection;

    // Tokens rewarded per block
    uint256 public tokensPerBlock = 10 * 10**18;

    // Valor mínimo de tokens por bloque
    uint256 public constant MIN_TOKENS_PER_BLOCK = 1 * 10**18;

    // Suministro máximo de tokens
    uint256 public constant maxSupply = 21 * 10**9 * 10**18;

    // Tiempo del primer bloque (inicio del contrato)
    uint256 public immutable startTime;

    // Intervalo para el halving (4 años en segundos)
    uint256 public constant HALVING_INTERVAL = 4 * 365 * 24 * 60 * 60;

    // Maximum number of NFTs allowed to mint across all collections
    uint256 public maxNFTs = 100;

    // Minimum interval between NFT minting (10 minutes)
    uint256 public constant MINT_INTERVAL = 10 minutes;
    uint256 public lastMintTime;

    // Counter for the number of NFT collections created
    uint256 public collectionCounter;

    // Precio para comprar un NFT en ABAC
    uint256 public nftPrice = 100 * 10**18; // Precio inicial

    constructor(uint256 initialSupply) ERC20("Angry Bunny Art Coin", "ABAC") {
        _mint(msg.sender, initialSupply);
        startTime = block.timestamp;
    }

    // Function to add an active miner (only owner)
    function addActiveMiner(address miner) external onlyOwner {
        require(miner != address(0), "Invalid address");
        activeMiners.add(miner);
    }

    // Function to remove an active miner (only owner)
    function removeActiveMiner(address miner) external onlyOwner {
        activeMiners.remove(miner);
    }

    // Function to update the next NFT information (only owner)
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

    // Function to mint an NFT and reward tokens, executable every 10 minutes
    function mintAndReward() external {
        require(block.timestamp >= lastMintTime + MINT_INTERVAL, "Minting too soon");
        require(nextNFTInfo.lastUpdated + MINT_INTERVAL > block.timestamp, "Next NFT info outdated");

        address collectionAddress = seedToCollection[nextNFTInfo.seedNumber];
        INFTCollection nftCollection = INFTCollection(collectionAddress);
        require(nftCollection.tokenCounter() < maxNFTs, "Max NFT limit reached");

        _applyHalving();

        require(totalSupply() + tokensPerBlock <= maxSupply, "Max supply reached");

        // Mint the NFT for the contract itself
        nftCollection.createNFT(address(this), nextNFTInfo.imageURI);

        _mint(nextNFTInfo.miner, tokensPerBlock);

        lastMintTime = block.timestamp;
    }

    // Function to create a new NFT collection (only owner)
    function createNewNFTCollection(string memory collectionName, string memory collectionSymbol) external onlyOwner returns (uint256) {
        collectionCounter++;
        NFTCollection newCollection = new NFTCollection(collectionName, collectionSymbol);
        seedToCollection[collectionCounter] = address(newCollection);
        return collectionCounter;
    }

    // Function to buy an NFT from a collection using ABAC tokens
    function buyNFT(uint256 collectionId, uint256 tokenId) external {
        address collectionAddress = seedToCollection[collectionId];
        require(collectionAddress != address(0), "Invalid collection ID");

        INFTCollection nftCollection = INFTCollection(collectionAddress);
        address currentOwner = nftCollection.ownerOf(tokenId);
        require(currentOwner == address(this), "NFT not available for sale");

        IERC20(this).safeTransferFrom(msg.sender, address(this), nftPrice);

        nftCollection.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    // Helper functions to get the number of active miners and check if an address is active
    function getActiveMiners() external view returns (address[] memory) {
        return activeMiners.values();
    }

    function isActiveMiner(address miner) external view returns (bool) {
        return activeMiners.contains(miner);
    }

    // Internal function to apply halving
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
