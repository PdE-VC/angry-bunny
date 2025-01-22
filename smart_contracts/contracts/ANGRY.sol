// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IFragmentCollectionManager.sol";

contract ANGRY is ERC20, Ownable {
    uint256 public constant MIN_TOKENS_PER_BLOCK = 10;
    uint256 public constant MAX_SUPPLY = 21 * 10**3 * 10**6 * 10**18;
    uint256 public constant INITIAL_TOKENS_PER_BLOCK = 50 * 10**3 * 10**18;
    uint256 public constant HALVING_BLOCK_INTERVAL = 4 * 365 * 24 * 60 * 6;
    uint256 public constant INITIAL_SUPPLY = (MAX_SUPPLY * 4) / 100;
    uint256 public constant ARTIST_PERCENTAGE_REWARD = 40;
    uint256 public constant FRAGMENT_CREATOR_PERCENTAGE_REWARD = 5;

    uint256 public block_number;
    uint256 public tokensPerBlock;

    bool public fragmentCollectionManagerAlreadySet = false;

    IFragmentCollectionManager public fragmentCollectionManager;

    address public artWorkPoolAddress;

    event Halving(uint256 newTokensPerBlock);
    event ArtWorkMinted(address artist, uint256 fragmentId, string imageURI);

    constructor() ERC20("Angry Bunny", "ANGRY") {
        _mint(msg.sender, INITIAL_SUPPLY);
        tokensPerBlock = INITIAL_TOKENS_PER_BLOCK;
    }

    function setFragmentCollectionManagerAddress(address fragmentCollectionManagerAddress) external onlyOwner {
        require(!fragmentCollectionManagerAlreadySet, "Address already set");
        require(fragmentCollectionManagerAddress != address(0), "Invalid address");
        fragmentCollectionManager = IFragmentCollectionManager(fragmentCollectionManagerAddress);
        fragmentCollectionManagerAlreadySet = true;
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

    function mint(address to, uint256 amount) external onlyArtWorkPool {
        require(totalSupply() + tokensPerBlock <= MAX_SUPPLY, "Max supply reached");
        _mint(to, amount);
    }

    function mintArtWork(uint256 fragment, address artist, string memory contentUri) external onlyArtWorkPool {
        block_number = block_number + 1;
        _applyHalving();

        fragmentCollectionManager.mintArtWork(fragment, contentUri);

        emit ArtWorkMinted(artist, fragment, contentUri);
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
        }
    }
}
