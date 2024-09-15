// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISeedCollectionManager {
    function mintVariation(uint256 seedId, string memory imageURI) external;

    function getSeedCreator(uint256 seedId) external view returns (address);

    function createSeed(string memory name, string memory symbol, uint256 zone, uint256 maxVariations,
                    uint256 universe, string memory uri, address seedCreator) external returns (uint256);
}