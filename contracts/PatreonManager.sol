// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PatreonManager is ERC721Enumerable, Ownable {
    uint256 public constant MAX_PATREONS_BLOCK = 1001;
    uint256 public constant PATREONS_PER_BLOCK = 1000;
    uint256 public nextTokenId;
    uint256 public patreonsCount;

    constructor(address foundationAddress) ERC721("PatreonManager", "PNFT") {
        addPatreon(foundationAddress);
    }

    function addPatreon(address patreon) public onlyOwner {
        require(patreonsCount < MAX_PATREONS_BLOCK, "Max number of patreons reached");

        for (uint256 i = 0; i < PATREONS_PER_BLOCK; i++) {
            _mint(patreon, nextTokenId);
            nextTokenId++;
        }

        patreonsCount++;
    }

    function selectRandomPatreon() external view returns (address) {
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
