// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SeedCollection.sol";

contract SeedCollectionManager is Ownable {

    mapping(uint256 => address) public seeds;
    
    uint256 public seedCounter;
    // WATCH OUT!! ALSO IN VariationPoolManager.sol
    uint256 public constant maxSeedVariations = 100;

    address public abacContract;

    constructor(address _abacContract) {
        require(_abacContract != address(0), "Invalid ABAC contract address");
        abacContract = _abacContract;
    }

    modifier onlyABAC() {
        require(msg.sender == abacContract, "Caller is not ABAC contract");
        _;
    }

    function mintVariation(uint256 seedId, string memory imageURI) external onlyABAC {
        SeedCollection seedCollection = SeedCollection(seeds[seedId]);
        require(seedCollection.tokenVariations() < maxSeedVariations, "Max variations reached");
        seedCollection.createNFTVariation(abacContract, imageURI);
    }

    function getSeedCreator(uint256 seedId) external view returns (address) {
        return SeedCollection(seeds[seedId]).seedCreator();
    }

    function createSeed(string memory name, string memory symbol, uint256 zone,
                    uint256 universe, string memory uri, address seedCreator
                    ) public onlyOwner {
        seedCounter++;
        SeedCollection newCollection = new SeedCollection(name, symbol, zone, maxSeedVariations, 
                                                universe, uri, seedCreator);
        seeds[seedCounter] = address(newCollection);
    }

    function getSeedAddress(uint256 seedId) external view returns (address) {
        return seeds[seedId];
    }
}
