// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AreaCollection is ERC721URIStorage, Ownable {
    uint256 public maxArtWorks;
    uint256 public emmitedArtWorks;
    uint256 public zone;

    string public uri;

    address public areaCreator;

    constructor(string memory name, string memory symbol, uint256 _zone, uint256 _maxArts,
                    string memory _uri, address _areaCreator
                    ) ERC721(name, symbol) {
        maxArtWorks = _maxArts;
        emmitedArtWorks = 0;
        zone = _zone;
        uri = _uri;
        areaCreator = _areaCreator;
    }

    function createNFTArt(address recipient, string memory variationURI
            ) public onlyOwner returns (uint256) {
        require(emmitedArtWorks < maxArtWorks, "Maximum art works reached");
        uint256 newItemId = emmitedArtWorks;
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, variationURI);
        emmitedArtWorks++;
        return newItemId;
    }

    function isFull() public view returns (bool) {
        return emmitedArtWorks >= maxArtWorks;
    }
}