// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.9.6/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts@4.9.6/access/Ownable.sol";
import "./INFTCollection.sol";

contract NFTMarketplace is Ownable {
    using SafeERC20 for IERC20;

    uint256 public nftPrice = 100 * 10**18;

    address public abacContract;

    constructor(address _abacContract) {
        require(_abacContract != address(0), "Invalid ABAC contract address");
        abacContract = _abacContract;
    }

    function buyNFT(uint256 tokenId, address collectionAddress) external {
        IERC20 abacERC20 = IERC20(abacContract);
        require(abacERC20.balanceOf(msg.sender) >= nftPrice, "Insufficient balance");

        NFTCollection nftCollection = INFTCollection(collectionAddress);
        address currentOwner = nftCollection.ownerOf(tokenId);
        require(currentOwner == abacContract, "NFT not available for sale");

        abacERC20.safeTransferFrom(msg.sender, owner(), nftPrice);
        nftCollection.safeTransferFrom(abacContract, msg.sender, tokenId);
    }

    function setNFTPrice(uint256 newPrice) external onlyOwner {
        nftPrice = newPrice;
    }
}
