// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.9.6/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.9.6/access/Ownable.sol";
import "@openzeppelin/contracts@4.9.6/utils/structs/EnumerableSet.sol";
import "./INFTCollection.sol"; // Importamos la interfaz

contract ABAC is ERC20, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    // List of active miners
    EnumerableSet.AddressSet private activeMiners;

    // Struct to store the information of the next NFT to mint
    struct NextNFTInfo {
        address miner;
        uint256 seedNumber;
        string imageURI;
        uint256 lastUpdated;
    }

    NextNFTInfo public nextNFTInfo;

    // Mapping between seed number and NFT collection address
    mapping(uint256 => address) public seedToCollection;

    // Tokens rewarded per block
    uint256 public tokensPerBlock = 10 * 10**18; // Ejemplo inicial, ajustable según sea necesario

    // Valor mínimo de tokens por bloque para evitar underflow
    uint256 public constant MIN_TOKENS_PER_BLOCK = 1 * 10**18; // 1 token como mínimo

    // Suministro máximo de tokens
    uint256 public constant maxSupply = 21 * 10**9 * 10**18; // 21 mil millones de ABAC

    // Tiempo del primer bloque (inicio del contrato)
    uint256 public immutable startTime;

    // Intervalo para el halving (4 años en segundos)
    uint256 public constant HALVING_INTERVAL = 4 * 365 * 24 * 60 * 60; // 4 años en segundos

    // Maximum number of NFTs allowed to mint across all collections
    uint256 public maxNFTs = 100; // Valor a definir según el marco

    // Minimum interval between NFT minting (10 minutes)
    uint256 public constant MINT_INTERVAL = 10 minutes;
    uint256 public lastMintTime;

    constructor(uint256 initialSupply) ERC20("Angry Bunny Art Coin", "ABAC") {
        _mint(msg.sender, initialSupply);
        startTime = block.timestamp; // Registro del tiempo de inicio del contrato
    }

    // Function to add an active miner (only owner)
    function addActiveMiner(address miner) external onlyOwner {
        require(miner != address(0), "Invalid address");
        activeMiners.add(miner);
    }

    // Function to remove an active miner (only owner)
    function removeActiveMiner(address miner) external onlyOwner {
        activeMiners.remove(miner);
    }

    // Function to update the next NFT information (only owner)
    function updateNextNFTInfo(address miner, uint256 seedNumber, string memory imageURI) external onlyOwner {
        require(miner != address(0), "Invalid miner address");
        require(seedToCollection[seedNumber] != address(0), "Invalid seed number");
        require(activeMiners.contains(miner), "Miner is not active");

        nextNFTInfo = NextNFTInfo({
            miner: miner,
            seedNumber: seedNumber,
            imageURI: imageURI,
            lastUpdated: block.timestamp
        });
    }

    // Function to mint an NFT and reward tokens, executable every 10 minutes
    function mintAndReward() external {
        require(block.timestamp >= lastMintTime + MINT_INTERVAL, "Minting too soon");
        require(nextNFTInfo.lastUpdated + MINT_INTERVAL > block.timestamp, "Next NFT info outdated");

        // Obtener la dirección de la colección basada en el número de semilla
        address collectionAddress = seedToCollection[nextNFTInfo.seedNumber];

        // Verificar si el número total de NFTs en la colección ha alcanzado el límite máximo
        INFTCollection nftCollection = INFTCollection(collectionAddress);
        require(nftCollection.tokenCounter() < maxNFTs, "Max NFT limit reached");

        // Aplicar el halving si corresponde
        _applyHalving();

        // Verificar si el suministro máximo ha sido alcanzado
        require(totalSupply() + tokensPerBlock <= maxSupply, "Max supply reached");

        // Mint the NFT using the INFTCollection interface
        nftCollection.createNFT(nextNFTInfo.miner, nextNFTInfo.imageURI);

        // Reward the miner with ABAC tokens
        _mint(nextNFTInfo.miner, tokensPerBlock);

        // Update last mint time
        lastMintTime = block.timestamp;
    }

    // Helper functions to get the number of active miners and check if an address is active
    function getActiveMiners() external view returns (address[] memory) {
        return activeMiners.values();
    }

    function isActiveMiner(address miner) external view returns (bool) {
        return activeMiners.contains(miner);
    }

    // Internal function to apply halving
    function _applyHalving() internal {
        uint256 elapsedTime = block.timestamp - startTime;
        uint256 halvings = elapsedTime / HALVING_INTERVAL;
        
        // Calculate the new tokensPerBlock, should be equal to initial value of tokensPerBlock 
        uint256 newTokensPerBlock = 10 * 10**18 >> halvings; // Divide tokensPerBlock by 2^halvings

        // Ensure tokensPerBlock does not drop below the minimum threshold
        if (newTokensPerBlock < MIN_TOKENS_PER_BLOCK) {
            tokensPerBlock = MIN_TOKENS_PER_BLOCK;
        } else {
            tokensPerBlock = newTokensPerBlock;
        }
    }
}