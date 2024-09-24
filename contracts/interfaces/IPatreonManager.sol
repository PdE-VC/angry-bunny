// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPatreonManager {
    function selectRandomHolder() external view returns (address);
    function mintNewSupply() external;
}