// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IABACToken {
    function mintTokenAndArtWork(uint256 seed, address artist, string memory contentUri) external;
}