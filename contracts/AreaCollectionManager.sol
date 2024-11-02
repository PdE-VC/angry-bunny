// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AreaCollection.sol";

contract AreaCollectionManager is Ownable {
    mapping(uint256 => address) public areas;
    
    uint256 public areaCounter;

    address public angryContract;

    constructor(address _angryContract) {
        require(_angryContract != address(0), "Invalid ANGRY contract address");
        angryContract = _angryContract;
    }

    modifier onlyANGRY() {
        require(msg.sender == angryContract, "Caller is not ANGRY contract");
        _;
    }

    function mintArtWork(uint256 areaId, string memory imageURI) external onlyANGRY {
        AreaCollection areaCollection = AreaCollection(areas[areaId]);
        require(areaCollection.emmitedArtWorks() < areaCollection.maxArtWorks(), "Max variations reached");
        areaCollection.createNFTArt(owner(), imageURI);
    }

    function getAreaCreator(uint256 areaId) external view returns (address) {
        return AreaCollection(areas[areaId]).areaCreator();
    }

    function createArea(string memory name, string memory symbol, uint256 zone,
                    uint256 maxArtWorks, string memory uri, address areaCreator
                    ) public onlyOwner {
        areaCounter++;
        AreaCollection newCollection = new AreaCollection(name, symbol, zone, maxArtWorks, 
                                                uri, areaCreator);
        areas[areaCounter] = address(newCollection);
    }

    function getAreaAddress(uint256 areaId) external view returns (address) {
        return areas[areaId];
    }

    function areaIsFull(uint256 areaId) external view returns (bool) {
        require(areas[areaId] != address(0), "Area not found");
        return AreaCollection(areas[areaId]).isFull();
    }
}