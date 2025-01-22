// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IANGRYToken.sol";
import "./interfaces/IFragmentCollectionManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArtWorkPoolManager is Ownable {
    struct ArtWork {
        string contentUri;
        address artist;
    }

    IANGRYToken public angryToken;
    IFragmentCollectionManager public fragmentCollectionManager;

    uint256 public constant OWNER_PERCENTAGE_REWARD = 2;
    uint256 public constant ARTIST_PERCENTAGE_REWARD = 7;
    uint256 public constant FRAGMENT_CREATOR_PERCENTAGE_REWARD = 1;

    mapping(uint256 => ArtWork[]) public artWorksByFragment;
    mapping(uint256 => uint256) public validatedArtWorkCountByFragment;

    uint256 public difficulty = 10;

    event ArtWorkProposed(uint256 fragmentId, address miner, string contentUri, address artist);
    event FragmentReadyToCurate(uint256 fragmentId);
    event RewardDistributed(address recipient, uint256 amount, string role);
    event RewardsSummary(uint256 fragmentId, uint256 totalReward, uint256 ownerReward,
        uint256 fragmentCreatorReward, uint256 selectedArtistReward, uint256 participantReward);

    constructor(address _angryToken, address fragmentCollectionManagerAddress) {
        angryToken = IANGRYToken(_angryToken);
        fragmentCollectionManager = IFragmentCollectionManager(fragmentCollectionManagerAddress);
    }

    function setDifficulty(uint256 _difficulty) external onlyOwner {
        require(_difficulty > 0, "Invalid difficulty");
        bool isLowerDifficulty = difficulty > _difficulty;
        difficulty = _difficulty;
        
        if (isLowerDifficulty) {
            for (uint256 i = 1; i <= fragmentCollectionManager.fragmentCounter(); i++) {
                if (artWorksByFragment[i].length >= difficulty) {
                    emit FragmentReadyToCurate(i);
                }
            }
        }
    }

    // Función para que los artistas propongan obras de arte
    function proposeArtWork(uint256 fragmentId, string memory contentUri, address artist) external {
        require(fragmentCollectionManager.fragmentCounter() >= fragmentId && fragmentId > 0, "Fragment does not exist");
        require(artist != address(0), "Artist address is required");
        require(!fragmentCollectionManager.fragmentIsFull(fragmentId), "Fragment collection is full");
        require(artWorksByFragment[fragmentId].length < difficulty, "ArtWork limit reached for this fragment ");

        artWorksByFragment[fragmentId].push(ArtWork(contentUri, artist));
        emit ArtWorkProposed(fragmentId, msg.sender, contentUri, artist);

        if (artWorksByFragment[fragmentId].length == difficulty) {
            emit FragmentReadyToCurate(fragmentId);
        }
    }

    function getArtWorksLength(uint256 fragmentId) public view returns (uint256) {
        return artWorksByFragment[fragmentId].length;
    }

    function getArtWorksByFragment(uint256 fragmentId) external view returns (ArtWork[] memory) {
        return artWorksByFragment[fragmentId];
    }
    
    function selectArtWork(uint256 fragmentId, uint256 artWorkIndex) external onlyOwner {
        require(fragmentCollectionManager.fragmentCounter() >= fragmentId, "Fragment does not exist");

        ArtWork[] memory artWorks = artWorksByFragment[fragmentId];
        require(artWorks.length >= difficulty, "ArtWork limit not reached yet");
        require(artWorkIndex < artWorks.length, "Invalid variation index");

        uint256 totalReward = angryToken.tokensPerBlock();
        uint256 ownerReward = (totalReward * OWNER_PERCENTAGE_REWARD) / 100;
        uint256 selectedArtistReward = (totalReward * ARTIST_PERCENTAGE_REWARD) / 100;
        uint256 fragmentCreatorReward = (totalReward * FRAGMENT_CREATOR_PERCENTAGE_REWARD) / 100;

        // Resto después de asignar recompensas fijas
        uint256 remainingReward = totalReward - ownerReward - selectedArtistReward - fragmentCreatorReward;

        // Recompensa base para cada participante
        uint256 baseParticipantReward = remainingReward / artWorks.length;

        // Ajustar la diferencia de redondeo
        uint256 totalDistributed = ownerReward + selectedArtistReward + fragmentCreatorReward;
        uint256 lastParticipantReward = remainingReward - (baseParticipantReward * (artWorks.length - 1));
        totalDistributed += lastParticipantReward;

        // Recompensar a cada participante
        for (uint256 i = 0; i < artWorks.length; i++) {
            address participant = artWorks[i].artist;

            // Asignar recompensa ajustada al último participante
            uint256 reward = (i == artWorks.length - 1) ? lastParticipantReward : baseParticipantReward;

            if (i == artWorkIndex) {
                reward += selectedArtistReward;
                emit RewardDistributed(participant, selectedArtistReward, "SelectedArtist");
            } else {
                emit RewardDistributed(participant, reward, "Participant");
            }

            angryToken.mint(participant, reward);
        }

        // Recompensa para el fragment creator
        address fragmentCreator = fragmentCollectionManager.getFragmentCreator(fragmentId);
        angryToken.mint(fragmentCreator, fragmentCreatorReward);

        // Recompensa para el propietario
        angryToken.mint(owner(), ownerReward);


        emit RewardDistributed(owner(), ownerReward, "Owner");
        emit RewardDistributed(fragmentCreator, fragmentCreatorReward, "FragmentCreator");

        emit RewardsSummary(
            fragmentId,
            totalReward,
            ownerReward,
            fragmentCreatorReward,
            selectedArtistReward,
            remainingReward
        );

        // Limpiar las variaciones de la semilla
        delete artWorksByFragment[fragmentId];

        validatedArtWorkCountByFragment[fragmentId]++;
    }

    function rejectAllArtWorks(uint256 fragmentId) external onlyOwner {
        ArtWork[] memory artWorks = artWorksByFragment[fragmentId];
        require(artWorks.length >= difficulty, "ArtWork limit not reached yet");
        delete artWorksByFragment[fragmentId];
    }
}
