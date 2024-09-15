// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IABACToken {
    function mintTokenAndVariation(uint256 seed, address generator, string memory contentUri) external;
}