// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPatreonManager.sol";
import "./interfaces/ISeedCollectionManager.sol";

contract ABAC is ERC20, Ownable {
    uint256 public constant MIN_TOKENS_PER_BLOCK = 10;
    uint256 public constant MAX_SUPPLY = 21 * 10**3 * 10**6 * 10**18;
    uint256 public constant INITIAL_TOKENS_PER_BLOCK = 50 * 10**3 * 10**18;
    uint256 public constant HALVING_BLOCK_INTERVAL = 4 * 365 * 24 * 60 * 6;
    uint256 public constant INITIAL_SUPPLY = MAX_SUPPLY * 4 / 100;

    uint256 public block_number;
    uint256 public tokensPerBlock;

    bool public seedCollectionManagerAlreadySet = false;
    bool public patreonManagerAddressAlreadySet = false;

    ISeedCollectionManager public seedCollectionManager;
    IPatreonManager public patreonManager;

    address public variationPoolAddress;

    constructor() ERC20("Angry Bunny Art Coin", "ABAC") {
        _mint(msg.sender, 50 * 10 ** 18);
        tokensPerBlock = INITIAL_TOKENS_PER_BLOCK;
    }

    function setPatreonManagerAddress(address _patreonManagerAddress) external onlyOwner {
        require(!patreonManagerAddressAlreadySet, "Address already set");
        require(_patreonManagerAddress != address(0), "Invalid address");
        patreonManager = IPatreonManager(_patreonManagerAddress);
        patreonManagerAddressAlreadySet = true;
    }

    function setCollectionManagerAddress(address seedCollectionManagerAddress) external onlyOwner {
        require(!seedCollectionManagerAlreadySet, "Address already set");
        require(seedCollectionManagerAddress != address(0), "Invalid address");
        seedCollectionManager = ISeedCollectionManager(seedCollectionManagerAddress);
        seedCollectionManagerAlreadySet = true;
    }

    function setVariationPoolAddress(address _variationPoolAddress) external onlyOwner {
        require(variationPoolAddress == address(0), "Address already set");
        require(_variationPoolAddress != address(0), "Invalid address");
        variationPoolAddress = _variationPoolAddress;
    }

    modifier onlyVariationPool() {
        require(msg.sender == variationPoolAddress,
                "Caller is not the variation pool");
        _;
    }

    function mintTokenAndVariation(uint256 seed, address generator, string memory contentUri) external onlyVariationPool {
        require(totalSupply() + tokensPerBlock <= MAX_SUPPLY, "Max supply reached");

        _applyHalving();

        address selectedPatreon = patreonManager.selectRandomHolder();

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
        require(HALVING_BLOCK_INTERVAL > 0, "Invalid halving block interval");
        if ((block_number % HALVING_BLOCK_INTERVAL) == 0) {
            uint256 halvings = block_number / HALVING_BLOCK_INTERVAL;
            uint256 newTokensPerBlock = INITIAL_TOKENS_PER_BLOCK * 10**18 >> halvings;

            if (newTokensPerBlock < MIN_TOKENS_PER_BLOCK) {
                tokensPerBlock = MIN_TOKENS_PER_BLOCK;
            } else {
                tokensPerBlock = newTokensPerBlock;
            }

            patreonManager.mintNewSupply();
        }
    }
}
