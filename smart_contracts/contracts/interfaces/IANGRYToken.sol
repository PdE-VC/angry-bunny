// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IANGRYToken {
    function mintArtWork(uint256 fragment, address artist, string memory contentUri) external;

    function tokensPerBlock() external view returns (uint256);

    function mint(address to, uint256 amount) external;
}