const ArtWorkPoolManager = artifacts.require("ArtWorkPoolManager");
const FragmentCollectionManager = artifacts.require("FragmentCollectionManager");
const zero_address = "0x0000000000000000000000000000000000000000";

contract("ArtWorkPoolManager", (accounts) => {
    let artWorkPoolManagerInstance;
    let fragmentCollectionManagerInstance;

    const [owner, artist1, artist2, unauthorized] = accounts;
    const fragmentId = 1;
    const newDifficulty = 3;

    before(async () => {
        fragmentCollectionManagerInstance = await FragmentCollectionManager.deployed();
        artWorkPoolManagerInstance = await ArtWorkPoolManager.deployed();

        // Crear un fragmento inicial
        await fragmentCollectionManagerInstance.createFragment(
            "Fragment Name",
            "FRAG",
            1,
            5,
            "http://example.com",
            artist1,
            { from: owner }
        );
    });

    describe("Proposing artworks", () => {
        it("should fail to add artwork since the fragment does not exist", async () => {
            try {
                await artWorkPoolManagerInstance.proposeArtWork(10, "newUri", artist1, { from: owner });
                assert.fail("Should not allow adding artwork to a non-existent fragment");
            } catch (error) {
                assert(error.message.includes("Fragment does not exist"), error.message);
            }
        });

        it("should add a new artwork", async () => {
            await artWorkPoolManagerInstance.proposeArtWork(fragmentId, "ipfs://artwork1", artist1, { from: owner });
            const artworks = await artWorkPoolManagerInstance.getArtWorksByFragment(fragmentId);
            assert.equal(artworks[0].contentUri, "ipfs://artwork1", "Artwork not added correctly");
        });

        it("should fail to add artwork with zero address as artist", async () => {
            try {
                await artWorkPoolManagerInstance.proposeArtWork(fragmentId, "ipfs://invalid-artwork", zero_address, {
                    from: owner,
                });
                assert.fail("Should not allow artwork with zero address as artist");
            } catch (error) {
                assert(error.message.includes("Artist address is required"), error.message);
            }
        });

        it("should fail to add artworks beyond the difficulty limit", async () => {
            try {
                const difficulty = await artWorkPoolManagerInstance.difficulty();
                for (let i = 0; i <= difficulty; i++) {
                    await artWorkPoolManagerInstance.proposeArtWork(
                        fragmentId,
                        `ipfs://artwork-${i}`,
                        artist1,
                        { from: owner }
                    );
                }
                assert.fail("Should not allow adding artworks beyond the difficulty limit");
            } catch (error) {
                assert(error.message.includes("ArtWork limit reached for this fragment"), error.message);
            }
        });
    });

    describe("Changing difficulty", () => {
        it("should change the difficulty", async () => {
            await artWorkPoolManagerInstance.setDifficulty(newDifficulty, { from: owner });
            const difficulty = await artWorkPoolManagerInstance.difficulty();
            assert.equal(difficulty.toNumber(), newDifficulty, "Difficulty not changed correctly");
        });

        it("should fail to change difficulty if not called by owner", async () => {
            try {
                await artWorkPoolManagerInstance.setDifficulty(2, { from: unauthorized });
                assert.fail("Non-owner should not be able to change difficulty");
            } catch (error) {
                assert(error.message.includes("Ownable: caller is not the owner"), error.message);
            }
        });
    });

    describe("Rejecting artworks", () => {
        it("should reject all artworks for a fragment", async () => {
            await artWorkPoolManagerInstance.rejectAllArtWorks(fragmentId, { from: owner });
            const artworks = await artWorkPoolManagerInstance.getArtWorksLength(fragmentId);
            assert.equal(artworks.toNumber(), 0, "Artworks were not rejected properly");
        });

        it("should fail to reject artworks if difficulty not reached", async () => {
            try {
                await artWorkPoolManagerInstance.rejectAllArtWorks(fragmentId, { from: owner });
                assert.fail("Should not allow rejecting artworks before reaching difficulty");
            } catch (error) {
                assert(error.message.includes("ArtWork limit not reached yet"), error.message);
            }
        });

        it("should fail to reject artworks if not called by owner", async () => {
            try {
                await artWorkPoolManagerInstance.rejectAllArtWorks(fragmentId, { from: unauthorized });
                assert.fail("Non-owner should not be able to reject artworks");
            } catch (error) {
                assert(error.message.includes("Ownable: caller is not the owner"), error.message);
            }
        });
    });

    describe("Selecting artworks", () => {
        before(async () => {
            // Proponer artworks suficientes para alcanzar la dificultad
            for (let i = 0; i < newDifficulty; i++) {
                await artWorkPoolManagerInstance.proposeArtWork(fragmentId, `ipfs://artwork-${i}`, artist1, {
                    from: owner,
                });
            }
        });

        it("should select an artwork and distribute rewards", async () => {
            const tx = await artWorkPoolManagerInstance.selectArtWork(fragmentId, 0, { from: owner });

            // Verificar eventos de recompensa
            const rewardEvents = tx.logs.filter((log) => log.event === "RewardDistributed");
            assert(rewardEvents.length > 0, "RewardDistributed events not emitted");

            const selectedArtistEvent = rewardEvents.find((e) => e.args.role === "SelectedArtist");
            assert(selectedArtistEvent, "Selected artist reward not distributed");

            const participantEvent = rewardEvents.find((e) => e.args.role === "Participant");
            assert(participantEvent, "Participant rewards not distributed");
        });

        it("should fail to select artwork if difficulty not reached", async () => {
            try {
                await artWorkPoolManagerInstance.selectArtWork(fragmentId, 0, { from: owner });
                assert.fail("Should not allow selecting artwork before reaching difficulty");
            } catch (error) {
                assert(error.message.includes("ArtWork limit not reached yet"), error.message);
            }
        });

        it("should fail to select artwork if not called by owner", async () => {
            try {
                await artWorkPoolManagerInstance.selectArtWork(fragmentId, 0, { from: unauthorized });
                assert.fail("Non-owner should not be able to select artworks");
            } catch (error) {
                assert(error.message.includes("Ownable: caller is not the owner"), error.message);
            }
        });
    });
});