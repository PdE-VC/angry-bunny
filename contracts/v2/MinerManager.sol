// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MinerNFT is ERC721Enumerable, Ownable {
    uint256 public constant MAX_MINERS_BLOCK = 1001;
    uint256 public constant MINERS_PER_BLOCK = 1000;
    uint256 public nextTokenId;
    uint256 public minersCount;

    constructor(address foundationAddress) ERC721("MinerNFT", "MNFT") {
        addMiner(foundationAddress);
    }

    function addMiner(address miner) external onlyOwner {
        require(minersCount < MAX_MINERS_BLOCK, "Max number of miners reached");

        for (uint256 i = 0; i < MINERS_PER_BLOCK; i++) {
            _mint(miner, nextTokenId);
            nextTokenId++;
        }

        minersCount++;
    }

    function selectRandomMiner() external view returns (address) {
        require(totalSupply() > 0, "No NFTs minted yet");
        
        uint256 randomTokenId = _random() % totalSupply();
        return ownerOf(randomTokenId);
    }

    function _random() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.prevrandao,
            block.gaslimit,
            block.number,
            block.timestamp,
            blockhash(block.number - 1)
        )));
    }
}

