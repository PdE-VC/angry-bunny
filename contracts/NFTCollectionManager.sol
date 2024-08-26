// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.9.6/access/Ownable.sol";
import "./INFTCollection.sol";
import "./NFTCollection.sol";

contract NFTCollectionManager is Ownable {
    struct NextNFTInfo {
        uint256 seedNumber;
        string imageURI;
        uint256 lastUpdated;
    }

    mapping(uint256 => address) public seedToCollection;
    NextNFTInfo public nextNFTInfo;
    uint256 public collectionCounter;
    uint256 public constant maxNFTs = 100;
    uint256 public constant MINT_INTERVAL = 10 minutes;
    uint256 public lastMintTime = 1;

    address public abacContract;

    constructor(address _abacContract) {
        require(_abacContract != address(0), "Invalid ABAC contract address");
        abacContract = _abacContract;
    }

    modifier onlyABAC() {
        require(msg.sender == abacContract, "Caller is not ABAC contract");
        _;
    }

    function updateNextNFTInfo(uint256 seedNumber, string memory imageURI) external onlyOwner {
        require(seedToCollection[seedNumber] != address(0), "Invalid seed number");
        require(lastMintTime > nextNFTInfo.lastUpdated, "Cannot update: lastMintTime must be greater than lastUpdated");

        address collectionAddress = seedToCollection[seedNumber];
        INFTCollection nftCollection = INFTCollection(collectionAddress);
        require(nftCollection.tokenCounter() < maxNFTs, "Max NFT limit reached");

        nextNFTInfo = NextNFTInfo({
            seedNumber: seedNumber,
            imageURI: imageURI,
            lastUpdated: block.timestamp
        });
    }

    function mintNFT() external onlyABAC {
        address collectionAddress = seedToCollection[nextNFTInfo.seedNumber];
        INFTCollection nftCollection = INFTCollection(collectionAddress);
        nftCollection.createNFT(abacContract, nextNFTInfo.imageURI);

        lastMintTime = block.timestamp;
    }

    function createNewNFTCollection(string memory collectionName, string memory collectionSymbol) external onlyOwner returns (uint256) {
        collectionCounter++;
        NFTCollection newCollection = new NFTCollection(collectionName, collectionSymbol);
        seedToCollection[collectionCounter] = address(newCollection);
        return collectionCounter;
    }

    function isNextNFTInfoUpdated() external view returns (bool) {
        return nextNFTInfo.lastUpdated > lastMintTime;
    }
}
