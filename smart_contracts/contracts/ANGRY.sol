// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPatreonManager.sol";
import "./interfaces/IAreaCollectionManager.sol";

contract ANGRY is ERC20, Ownable {
    uint256 public constant MIN_TOKENS_PER_BLOCK = 10;
    uint256 public constant MAX_SUPPLY = 21 * 10**3 * 10**6 * 10**18;
    uint256 public constant INITIAL_TOKENS_PER_BLOCK = 50 * 10**3 * 10**18;
    uint256 public constant HALVING_BLOCK_INTERVAL = 4 * 365 * 24 * 60 * 6;
    uint256 public constant INITIAL_SUPPLY = (MAX_SUPPLY * 4) / 100;
    uint256 public constant PATREON_PERCENTAGE_REWARD = 50;
    uint256 public constant ARTIST_PERCENTAGE_REWARD = 40;
    uint256 public constant AREA_CREATOR_PERCENTAGE_REWARD = 5;

    uint256 public block_number;
    uint256 public tokensPerBlock;

    bool public areaCollectionManagerAlreadySet = false;
    bool public patreonManagerAddressAlreadySet = false;

    IAreaCollectionManager public areaCollectionManager;
    IPatreonManager public patreonManager;

    address public artWorkPoolAddress;

    event Halving(uint256 newTokensPerBlock);
    event ArtWorkMinted(address artist, uint256 areaId, string imageURI, address selectedPatreon, address areaCreator);

    constructor() ERC20("Angry Bunny", "ANGRY") {
        _mint(msg.sender, INITIAL_SUPPLY);
        tokensPerBlock = INITIAL_TOKENS_PER_BLOCK;
    }

    function setPatreonManagerAddress(address _patreonManagerAddress) external onlyOwner {
        require(!patreonManagerAddressAlreadySet, "Address already set");
        require(_patreonManagerAddress != address(0), "Invalid address");
        patreonManager = IPatreonManager(_patreonManagerAddress);
        patreonManagerAddressAlreadySet = true;
    }

    function setAreaCollectionManagerAddress(address areaCollectionManagerAddress) external onlyOwner {
        require(!areaCollectionManagerAlreadySet, "Address already set");
        require(areaCollectionManagerAddress != address(0), "Invalid address");
        areaCollectionManager = IAreaCollectionManager(areaCollectionManagerAddress);
        areaCollectionManagerAlreadySet = true;
    }

    function setArtWorkPoolAddress(address _artWorkPoolAddress) external onlyOwner {
        require(artWorkPoolAddress == address(0), "Address already set");
        require(_artWorkPoolAddress != address(0), "Invalid address");
        artWorkPoolAddress = _artWorkPoolAddress;
    }

    modifier onlyArtWorkPool() {
        require(msg.sender == artWorkPoolAddress,
                "Caller is not the art work pool");
        _;
    }

    function mintTokenAndArtWork(uint256 area, address artist, string memory contentUri) external onlyArtWorkPool {
        require(totalSupply() + tokensPerBlock <= MAX_SUPPLY, "Max supply reached");

        _applyHalving();

        address selectedPatreon = patreonManager.selectRandomHolder();

        address areaCreator = areaCollectionManager.getAreaCreator(area);

        uint256 patreonReward = (tokensPerBlock * PATREON_PERCENTAGE_REWARD) / 100;
        uint256 artistReward = (tokensPerBlock * ARTIST_PERCENTAGE_REWARD) / 100;
        uint256 areaCreatorReward = (tokensPerBlock * AREA_CREATOR_PERCENTAGE_REWARD) / 100;
        uint256 ownerReward = tokensPerBlock - (patreonReward + artistReward + areaCreatorReward); // Owner gets the rest

        _mint(selectedPatreon, patreonReward);
        _mint(artist, artistReward);
        _mint(areaCreator, areaCreatorReward);
        _mint(owner(), ownerReward);

        areaCollectionManager.mintArtWork(area, contentUri);

        emit ArtWorkMinted(artist, area, contentUri, selectedPatreon, areaCreator);
    }

    function _applyHalving() internal {
        require(HALVING_BLOCK_INTERVAL > 0, "Invalid halving block interval");
        if ((block_number % HALVING_BLOCK_INTERVAL) == 0) {
            uint256 halvings = block_number / HALVING_BLOCK_INTERVAL;
            uint256 newTokensPerBlock = INITIAL_TOKENS_PER_BLOCK >> halvings;

            if (newTokensPerBlock < MIN_TOKENS_PER_BLOCK) {
                tokensPerBlock = MIN_TOKENS_PER_BLOCK;
            } else {
                tokensPerBlock = newTokensPerBlock;
            }

            emit Halving(tokensPerBlock);

            patreonManager.mintNewSupply();
        }
    }
}
