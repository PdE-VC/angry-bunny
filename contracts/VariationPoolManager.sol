// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IABACToken.sol";
import "./interfaces/ISeedCollectionManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VariationPoolManager is Ownable {
    struct Variation {
        string contentUri;
        address generator;
    }

    // WATCH OUT!! ALSO IN SeedCollectionManager.sol
    uint256 public constant maxSeedVariations = 100;

    IABACToken public abacToken;
    ISeedCollectionManager public seedCollectionManager;

    mapping(uint256 => Variation[]) public variationsBySeed;
    mapping(uint256 => uint256) public validatedVariationCountBySeed;

    uint256 public difficulty = 10;

    event VariationProposed(uint256 seedId, address miner, string contentUri, address generator);
    event SeedReadyToCurate(uint256 seedId);
    event VariationSelected(uint256 seedId, string contentUri, address generator);

    constructor(address _abacToken, address seedCollectionManagerAddress) {
        abacToken = IABACToken(_abacToken);
        seedCollectionManager = ISeedCollectionManager(seedCollectionManagerAddress);
    }

    function setDifficulty(uint256 _difficulty) external onlyOwner {
        difficulty = _difficulty;
    }

    // Función para que los mineros propongan variaciones
    function proposeVariation(uint256 seedId, string memory contentUri, address generator) external {
        require(seedCollectionManager.seedCounter() >= seedId && seedId > 0, "Seed does not exist");
        require(generator != address(0), "Generator address is required");
        require(validatedVariationCountBySeed[seedId] < maxSeedVariations, "Seed collection is full");
        require(variationsBySeed[seedId].length < difficulty, "Variation limit reached for this seed");

        variationsBySeed[seedId].push(Variation(contentUri, generator));
        emit VariationProposed(seedId, msg.sender, contentUri, generator);

        if (variationsBySeed[seedId].length == difficulty) {
            emit SeedReadyToCurate(seedId);
        }
    }

    function getVariationsLength(uint256 seedId) public view returns (uint256) {
        return variationsBySeed[seedId].length;
    }

    function getVariationsBySeed(uint256 seedId) external view returns (Variation[] memory) {
        return variationsBySeed[seedId];
    }
    
    // Función para que el curador seleccione una variación
    function selectVariation(uint256 seedId, uint256 variationIndex) external onlyOwner {
        require(seedCollectionManager.seedCounter() >= seedId, "Seed does not exist");
        
        Variation[] memory variations = variationsBySeed[seedId];
        require(variations.length >= difficulty, "Variation limit not reached yet");
        require(variationIndex < variations.length, "Invalid variation index");

        Variation memory selectedVariation = variations[variationIndex];

        abacToken.mintTokenAndVariation(seedId, selectedVariation.generator,
                                            selectedVariation.contentUri);

        emit VariationSelected(seedId, selectedVariation.contentUri, selectedVariation.generator);

        // Limpiar las variaciones de la semilla
        delete variationsBySeed[seedId];
        
        validatedVariationCountBySeed[seedId]++;
    }

    function rejectAllVariations(uint256 seedId) external onlyOwner {
        Variation[] memory variations = variationsBySeed[seedId];
        require(variations.length >= difficulty, "Variation limit not reached yet");
        delete variationsBySeed[seedId];
    }
}
