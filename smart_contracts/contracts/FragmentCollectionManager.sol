// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FragmentCollection.sol";

contract FragmentCollectionManager is Ownable {
    mapping(uint256 => address) public fragments;
    
    uint256 public fragmentCounter;

    address public angryContract;

    constructor(address _angryContract) {
        require(_angryContract != address(0), "Invalid ANGRY contract address");
        angryContract = _angryContract;
    }

    modifier onlyANGRY() {
        require(msg.sender == angryContract, "Caller is not ANGRY contract");
        _;
    }

    function mintArtWork(uint256 fragmentId, string memory imageURI) external onlyANGRY {
        FragmentCollection fragmentCollection = FragmentCollection(fragments[fragmentId]);
        require(fragmentCollection.emmitedArtWorks() < fragmentCollection.maxArtWorks(), "Max variations reached");
        fragmentCollection.createNFTArt(owner(), imageURI);
    }

    function getFragmentCreator(uint256 fragmentId) external view returns (address) {
        return FragmentCollection(fragments[fragmentId]).fragmentCreator();
    }

    function createFragment(string memory name, string memory symbol, uint256 zone,
                    uint256 maxArtWorks, string memory uri, address fragmentCreator
                    ) public onlyOwner {
        fragmentCounter++;
        FragmentCollection newCollection = new FragmentCollection(name, symbol, zone, maxArtWorks, 
                                                uri, fragmentCreator);
        fragments[fragmentCounter] = address(newCollection);
    }

    function getFragmentAddress(uint256 fragmentId) external view returns (address) {
        return fragments[fragmentId];
    }

    function fragmentIsFull(uint256 fragmentId) external view returns (bool) {
        require(fragments[fragmentId] != address(0), "Fragment not found");
        return FragmentCollection(fragments[fragmentId]).isFull();
    }
}