// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IANGRYToken.sol";
import "./interfaces/IAreaCollectionManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArtWorkPoolManager is Ownable {
    struct ArtWork {
        string contentUri;
        address artist;
    }

    IANGRYToken public angryToken;
    IAreaCollectionManager public areaCollectionManager;

    mapping(uint256 => ArtWork[]) public artWorksByArea;
    mapping(uint256 => uint256) public validatedArtWorkCountByArea;

    uint256 public difficulty = 10;

    event ArtWorkProposed(uint256 areaId, address miner, string contentUri, address artist);
    event AreaReadyToCurate(uint256 areaId);

    constructor(address _angryToken, address areaCollectionManagerAddress) {
        angryToken = IANGRYToken(_angryToken);
        areaCollectionManager = IAreaCollectionManager(areaCollectionManagerAddress);
    }

    function setDifficulty(uint256 _difficulty) external onlyOwner {
        require(_difficulty > 0, "Invalid difficulty");
        bool isLowerDifficulty = difficulty > _difficulty;
        difficulty = _difficulty;
        
        if (isLowerDifficulty) {
            for (uint256 i = 1; i <= areaCollectionManager.areaCounter(); i++) {
                if (artWorksByArea[i].length >= difficulty) {
                    emit AreaReadyToCurate(i);
                }
            }
        }
    }

    // Función para que los artistas propongan obras de arte
    function proposeArtWork(uint256 areaId, string memory contentUri, address artist) external {
        require(areaCollectionManager.areaCounter() >= areaId && areaId > 0, "Area does not exist");
        require(artist != address(0), "Artist address is required");
        require(!areaCollectionManager.areaIsFull(areaId), "Area collection is full");
        require(artWorksByArea[areaId].length < difficulty, "ArtWork limit reached for this area ");

        artWorksByArea[areaId].push(ArtWork(contentUri, artist));
        emit ArtWorkProposed(areaId, msg.sender, contentUri, artist);

        if (artWorksByArea[areaId].length == difficulty) {
            emit AreaReadyToCurate(areaId);
        }
    }

    function getArtWorksLength(uint256 areaId) public view returns (uint256) {
        return artWorksByArea[areaId].length;
    }

    function getArtWorksByArea(uint256 areaId) external view returns (ArtWork[] memory) {
        return artWorksByArea[areaId];
    }
    
    // Función para que el curador seleccione una variación
    function selectArtWork(uint256 areaId, uint256 artWorkIndex) external onlyOwner {
        require(areaCollectionManager.areaCounter() >= areaId, "Area does not exist");
        
        ArtWork[] memory artWorks = artWorksByArea[areaId];
        require(artWorks.length >= difficulty, "ArtWork limit not reached yet");
        require(artWorkIndex < artWorks.length, "Invalid variation index");

        ArtWork memory selectedArtWork = artWorks[artWorkIndex];

        angryToken.mintTokenAndArtWork(areaId, selectedArtWork.artist,
                                            selectedArtWork.contentUri);

        // Limpiar las variaciones de la semilla
        delete artWorksByArea[areaId];

        // TODO: Que no se permita hacer mas nada en este bloque
        
        validatedArtWorkCountByArea[areaId]++;
    }

    function rejectAllArtWorks(uint256 areaId) external onlyOwner {
        ArtWork[] memory artWorks = artWorksByArea[areaId];
        require(artWorks.length >= difficulty, "ArtWork limit not reached yet");
        delete artWorksByArea[areaId];
    }
}
