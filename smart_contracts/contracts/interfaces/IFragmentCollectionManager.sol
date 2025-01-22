// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFragmentCollectionManager {
    function mintArtWork(uint256 seedId, string memory imageURI) external;

    function getFragmentCreator(uint256 seedId) external view returns (address);

    function fragmentCounter() external view returns (uint256);

    function createFragment(string memory name, string memory symbol, uint256 zone, uint256 maxVariations,
                    uint256 universe, string memory uri, address seedCreator) external returns (uint256);
    
    function fragmentIsFull(uint256 fragmentId) external view returns (bool);
}