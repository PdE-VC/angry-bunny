const FragmentCollectionManager = artifacts.require("FragmentCollectionManager");
const ArtWorkPoolManager = artifacts.require("ArtWorkPoolManager");
const ANGRY = artifacts.require("ANGRY");

async function selectArtWork(accounts, artWorkPoolManagerInstance, fragment = 1) {
    const numberArtWorks = await artWorkPoolManagerInstance.getArtWorksLength(fragment);
    const difficulty = 3;
    await artWorkPoolManagerInstance.setDifficulty(difficulty, { from: accounts[0] });

    for (let i = 0; i < difficulty - numberArtWorks; i++) {
        await artWorkPoolManagerInstance.proposeArtWork(fragment, `http://${i}`, accounts[1], { from: accounts[0] });
    }

    return artWorkPoolManagerInstance.selectArtWork(fragment, 1, { from: accounts[0] });
}

contract("Integration", (accounts) => {
    let fragmentCollectionManagerInstance;
    let artWorkPoolManagerInstance;
    let angryInstance;

    const [owner, artist, unauthorized] = accounts;

    before(async () => {
        fragmentCollectionManagerInstance = await FragmentCollectionManager.deployed();
        artWorkPoolManagerInstance = await ArtWorkPoolManager.deployed();
        angryInstance = await ANGRY.deployed();

        // Crear fragmentos iniciales
        await fragmentCollectionManagerInstance.createFragment("Fragment1", "F1", 1, 10, "ipfs://uri1", artist, {
            from: owner,
        });
        await fragmentCollectionManagerInstance.createFragment("Fragment2", "F2", 1, 5, "ipfs://uri2", artist, {
            from: owner,
        });
    });

    describe("Fragment and Artwork Pool Integration", () => {
        it("should fail to propose an artwork for a non-existent fragment", async () => {
            try {
                await artWorkPoolManagerInstance.proposeArtWork(99, "ipfs://invalid", artist, { from: owner });
                assert.fail("Should not allow proposing an artwork for a non-existent fragment");
            } catch (error) {
                assert(error.message.includes("Fragment does not exist"), error.message);
            }
        });

        it("should emit FragmentReadyToCurate event when difficulty is met", async () => {
            await artWorkPoolManagerInstance.setDifficulty(1, { from: owner });
            const tx = await artWorkPoolManagerInstance.proposeArtWork(1, "ipfs://artwork1", artist, { from: owner });

            const event = tx.logs.find((log) => log.event === "FragmentReadyToCurate");
            assert(event, "FragmentReadyToCurate event not emitted");
            assert.equal(event.args.fragmentId.toNumber(), 1, "FragmentId does not match expected");
        });

        it("should select an artwork and distribute rewards", async () => {
            const initialOwnerBalance = web3.utils.toBN(await angryInstance.balanceOf(owner));
            const initialArtistBalance = web3.utils.toBN(await angryInstance.balanceOf(artist));
            const fragmentCreator = await fragmentCollectionManagerInstance.getFragmentCreator(1);

            const initialFragmentCreatorBalance = web3.utils.toBN(
                await angryInstance.balanceOf(fragmentCreator)
            );

            // Select artwork
            await selectArtWork(accounts, artWorkPoolManagerInstance);

            // Fetch balances
            const finalOwnerBalance = web3.utils.toBN(await angryInstance.balanceOf(owner));
            const finalArtistBalance = web3.utils.toBN(await angryInstance.balanceOf(artist));
            const finalFragmentCreatorBalance = web3.utils.toBN(
                await angryInstance.balanceOf(fragmentCreator)
            );

            const tokensPerBlock = web3.utils.toBN(await angryInstance.tokensPerBlock());
            const artistReward = tokensPerBlock.mul(web3.utils.toBN(await angryInstance.ARTIST_PERCENTAGE_REWARD())).div(web3.utils.toBN(100));
            const fragmentCreatorReward = tokensPerBlock.mul(web3.utils.toBN(await angryInstance.FRAGMENT_CREATOR_PERCENTAGE_REWARD())).div(web3.utils.toBN(100));
            const ownerReward = tokensPerBlock.sub(artistReward).sub(fragmentCreatorReward);

            assert(
                finalOwnerBalance.eq(initialOwnerBalance.add(ownerReward)),
                `Owner reward incorrect. Expected: ${initialOwnerBalance
                    .add(ownerReward)
                    .toString()}, Got: ${finalOwnerBalance.toString()}`
            );
            assert(
                finalArtistBalance.eq(initialArtistBalance.add(artistReward)),
                `Artist reward incorrect. Expected: ${initialArtistBalance
                    .add(artistReward)
                    .toString()}, Got: ${finalArtistBalance.toString()}`
            );
            assert(
                finalFragmentCreatorBalance.eq(initialFragmentCreatorBalance.add(fragmentCreatorReward)),
                `Fragment creator reward incorrect. Expected: ${initialFragmentCreatorBalance
                    .add(fragmentCreatorReward)
                    .toString()}, Got: ${finalFragmentCreatorBalance.toString()}`
            );
        });

        it("should clean the artWork fragment pool after selection", async () => {
            const validatedBefore = await artWorkPoolManagerInstance.validatedArtWorkCountByFragment(1);
            await selectArtWork(accounts, artWorkPoolManagerInstance);

            const validatedAfter = await artWorkPoolManagerInstance.validatedArtWorkCountByFragment(1);
            assert.equal(
                validatedAfter.toNumber(),
                validatedBefore.toNumber() + 1,
                "Validated artwork count did not increase correctly"
            );

            const artworks = await artWorkPoolManagerInstance.getArtWorksLength(1);
            assert.equal(artworks.toNumber(), 0, "Artwork pool not cleaned correctly");
        });
    });

    describe("Halving and Reward Limits", () => {
        it("should reduce tokensPerBlock after halving", async () => {
            const initialTokensPerBlock = await angryInstance.tokensPerBlock();
            const halvingInterval = await angryInstance.HALVING_BLOCK_INTERVAL();

            for (let i = 0; i < halvingInterval.toNumber(); i++) {
                await selectArtWork(accounts, artWorkPoolManagerInstance, 1);
            }

            const reducedTokensPerBlock = await angryInstance.tokensPerBlock();
            assert(reducedTokensPerBlock.lt(initialTokensPerBlock), "tokensPerBlock was not reduced after halving");
        });

        it("should not reduce tokensPerBlock below the minimum", async () => {
            const minTokensPerBlock = await angryInstance.MIN_TOKENS_PER_BLOCK();

            for (let i = 0; i < 100; i++) {
                await selectArtWork(accounts, artWorkPoolManagerInstance, 1);
            }

            const tokensPerBlock = await angryInstance.tokensPerBlock();
            assert(tokensPerBlock.gte(minTokensPerBlock), "tokensPerBlock fell below the minimum");
        });
    });
});