// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAreaCollectionManager {
    function mintArtWork(uint256 seedId, string memory imageURI) external;

    function getAreaCreator(uint256 seedId) external view returns (address);

    function areaCounter() external view returns (uint256);

    function createArea(string memory name, string memory symbol, uint256 zone, uint256 maxVariations,
                    uint256 universe, string memory uri, address seedCreator) external returns (uint256);
    
    function areaIsFull(uint256 areaId) external view returns (bool);
}