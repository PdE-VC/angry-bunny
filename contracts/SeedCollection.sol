// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SeedCollection is ERC721URIStorage, Ownable {
    uint256 private maxVariations;
    uint256 public tokenVariations;
    uint256 public zone;
    uint256 public universe;

    string public uri;

    address public seedCreator;

    constructor(string memory name, string memory symbol, uint256 _zone, uint256 _maxVariations,
                    uint256 _universe, string memory _uri, address _seedCreator
                    ) ERC721(name, symbol) {
        maxVariations = _maxVariations;
        tokenVariations = 0;
        zone = _zone;
        universe = _universe;
        uri = _uri;
        seedCreator = _seedCreator;
    }

    function createNFTVariation(address recipient, string memory variationURI
            ) public onlyOwner returns (uint256) {
        require(tokenVariations < maxVariations, "Maximum variations reached");
        uint256 newItemId = tokenVariations;
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, variationURI);
        tokenVariations++;
        return newItemId;
    }

    function isFull() public view returns (bool) {
        return tokenVariations >= maxVariations;
    }
}
