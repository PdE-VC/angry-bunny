// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPatreonManager.sol";
import "./interfaces/ISeedCollectionManager.sol";

contract ABAC is ERC20, Ownable {
    
    uint256 public tokensPerBlock;
    uint256 public constant MIN_TOKENS_PER_BLOCK = 1 * 10**18;
    uint256 public constant maxSupply = 21 * 10**9 * 10**18;
    uint256 public constant INITIAL_TOKENS_PER_BLOCK = 50 * 10**18;

    uint256 public block_number;
    uint256 public constant HALVING_BLOCK_INTERVAL = 4 * 365 * 24 * 60 * 6;

    bool public seedCollectionManagerAlreadySet = false;

    ISeedCollectionManager public seedCollectionManager;
    IPatreonManager public patreonManager;

    address public variationPoolAddress;

    constructor(uint256 initialSupply, address _variationPoolAddress, 
            address patreonManagerAddress) ERC20("Angry Bunny Art Coin", "ABAC") {
        _mint(msg.sender, initialSupply);
        tokensPerBlock = INITIAL_TOKENS_PER_BLOCK;
        variationPoolAddress = _variationPoolAddress;
        patreonManager = IPatreonManager(patreonManagerAddress);
    }

    function setCollectionManagerAddress(address seedCollectionManagerAddress) external onlyOwner {
        require(seedCollectionManagerAlreadySet, "Address already set");
        require(seedCollectionManagerAddress != address(0), "Invalid address");
        seedCollectionManager = ISeedCollectionManager(seedCollectionManagerAddress);
        seedCollectionManagerAlreadySet = true;
    }

    modifier onlyVariationPool() {
        require(msg.sender == variationPoolAddress,
                "Caller is not the variation pool");
        _;
    }

    function mintTokenAndVariation(uint256 seed, address generator, string memory contentUri) external onlyVariationPool {
        require(totalSupply() + tokensPerBlock <= maxSupply, "Max supply reached");

        _applyHalving();

        address selectedPatreon = patreonManager.selectRandomPatreon();

        address seedCreator = seedCollectionManager.getSeedCreator(seed);

        // TODO: Pensar en la distribución de los tokens
        uint256 patreonReward = tokensPerBlock / 2; // 50%
        uint256 variationGeneratorReward = (tokensPerBlock * 40) / 100; // 40%
        uint256 seedCreatorReward = (tokensPerBlock * 5) / 100; // 5%
        uint256 ownerReward = tokensPerBlock - (patreonReward + variationGeneratorReward + seedCreatorReward); // 5% + cualquier residuo

        _mint(selectedPatreon, patreonReward);
        _mint(generator, variationGeneratorReward);
        _mint(seedCreator, seedCreatorReward);
        _mint(owner(), ownerReward);

        seedCollectionManager.mintVariation(seed, contentUri);
    }

    function _applyHalving() internal {
        if (block_number % HALVING_BLOCK_INTERVAL == 0) {
            uint256 halvings = block_number / HALVING_BLOCK_INTERVAL;
            uint256 newTokensPerBlock = INITIAL_TOKENS_PER_BLOCK * 10**18 >> halvings;

            if (newTokensPerBlock < MIN_TOKENS_PER_BLOCK) {
                tokensPerBlock = MIN_TOKENS_PER_BLOCK;
            } else {
                tokensPerBlock = newTokensPerBlock;
            }
        }
    }
}
