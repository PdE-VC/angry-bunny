const SeedCollectionManager = artifacts.require("SeedCollectionManager");
const VariationPoolManager = artifacts.require("VariationPoolManager");
const PatreonManager = artifacts.require("PatreonManager");
const ABAC = artifacts.require("ABAC");

async function selectVariation(accounts, variationPoolManagerInstance) {
    const numberVariations = await variationPoolManagerInstance.getVariationsLength(1);
    const difficulty = 3
    await variationPoolManagerInstance.setDifficulty(difficulty, { from: accounts[0] });
    for (let i = 0; i < difficulty - numberVariations; i++) {
        await variationPoolManagerInstance.proposeVariation(1, `http://${i}`, accounts[1], { from: accounts[0] });
    }
    
    return await variationPoolManagerInstance.selectVariation(1, 1, { from: accounts[0] });
}

contract("Integration", (accounts) => {
    console.log("Running Integration tests");
    let seedCollectionManagerInstance;
    let variationPoolManagerInstance;
    let patreonManagerInstance;
    let abacInstance;

    before(async () => {
        seedCollectionManagerInstance = await SeedCollectionManager.deployed();
        variationPoolManagerInstance = await VariationPoolManager.deployed();
        patreonManagerInstance = await PatreonManager.deployed();
        abacInstance = await ABAC.deployed();
    });

    it("should fail to create a new variation since there is no seed", async () => {
        try {
            await variationPoolManagerInstance.proposeVariation(1, "contentURI", accounts[1], { from: accounts[0] });
        } catch (error) {
            assert(error.message.includes("Seed does not exist"), 
                `Error message does not match expected: Seed does not exist - found: ${error.message}`);
        }
    });

    it("should emit a new validation event since the seed is ready to validate", async () => {
        await seedCollectionManagerInstance.createSeed("Seed1", "S1", 1, 1, "ipfs uri", accounts[3], { from: accounts[0] });
        await variationPoolManagerInstance.setDifficulty(1, { from: accounts[0] });
        const result = await variationPoolManagerInstance.proposeVariation(1, "contentURI", accounts[1], { from: accounts[0] });

        assert.equal(result.logs[1].event, "SeedReadyToCurate", "Validation event not emitted");
        assert.equal(result.logs[1].args.seedId.toNumber(), 1, "SeedId does not match expected");
    });

    it("should not emit a new validation event since the seed is not ready to validate", async () => {
        const variations = await variationPoolManagerInstance.validatedVariationCountBySeed(1);
        await variationPoolManagerInstance.setDifficulty(variations + 3, { from: accounts[0] });
        const result = await variationPoolManagerInstance.proposeVariation(1, "contentURI", accounts[1], { from: accounts[0] });

        assert.equal(result.logs.length, 1, "Validation event emitted");
    });

    // it("should fail to validate a new variation since the limit for ABAC tokens is reached", async () => {
    //     ...
    // });

    it("should create an nft and reward the owner since there is no patreon", async () => {
        const owner = accounts[0];
        
        let initial_owner_balance = await abacInstance.balanceOf(owner);
        initial_owner_balance = web3.utils.BN(initial_owner_balance, 'ether');

        const result = await selectVariation(accounts, variationPoolManagerInstance);

        let final_owner_balance = await abacInstance.balanceOf(owner);
        final_owner_balance = web3.utils.BN(final_owner_balance);

        assert(final_owner_balance.gt(initial_owner_balance), 
            `Owner balance did not increase {initial: ${initial_owner_balance}, final: ${final_owner_balance}}`);
    });

    it("should create an nft and reward every part with the correct distribution", async () => {
        const seed = 1;

        const owner = accounts[0];
        const generatorAccount = accounts[1];
        const patreon = accounts[2];
        const seedCreator = await seedCollectionManagerInstance.getSeedCreator(seed);

        // Get initial balances
        let initial_owner_balance = await abacInstance.balanceOf(owner);
        initial_owner_balance = web3.utils.BN(initial_owner_balance, 'ether');

        let initial_generator_balance = await abacInstance.balanceOf(generatorAccount);
        initial_generator_balance = web3.utils.BN(initial_generator_balance, 'ether');

        let initial_patreon_balance = await abacInstance.balanceOf(patreon);
        initial_patreon_balance = web3.utils.BN(initial_patreon_balance, 'ether');

        let initial_seed_creator_balance = await abacInstance.balanceOf(seedCreator);
        initial_seed_creator_balance = web3.utils.BN(initial_seed_creator_balance, 'ether');
        
        // Propose and select a variation
        const result = await selectVariation(accounts, variationPoolManagerInstance);
        
        // Get final balances
        let final_owner_balance = await abacInstance.balanceOf(owner);
        final_owner_balance = web3.utils.BN(final_owner_balance);

        let final_generator_balance = await abacInstance.balanceOf(generatorAccount);
        final_generator_balance = web3.utils.BN(final_generator_balance);

        let final_patreon_balance = await abacInstance.balanceOf(patreon);
        final_patreon_balance = web3.utils.BN(final_patreon_balance);

        let final_seed_creator_balance = await abacInstance.balanceOf(seedCreator);
        final_seed_creator_balance = web3.utils.BN(final_seed_creator_balance);

        // Calculate distribution rewards
        const total_reward = await abacInstance.tokensPerBlock();
        const patreonReward = total_reward / 2
        const generatorReward = (total_reward * 40) / 100
        const seedCreatorReward = (total_reward * 5) / 100
        const owner_reward = total_reward - patreonReward - generatorReward - seedCreatorReward

        const expected_owner_balance = initial_owner_balance.add(web3.utils.BN(owner_reward, 'ether'));
        const expected_generator_balance = initial_generator_balance.add(web3.utils.BN(generatorReward, 'ether'));
        const expected_patreon_balance = initial_patreon_balance.add(web3.utils.BN(patreonReward, 'ether'));
        const expected_seed_creator_balance = initial_seed_creator_balance.add(web3.utils.BN(seedCreatorReward, 'ether'));

        // Assert balances
        assert.equal(final_owner_balance, expected_owner_balance,
            `Owner was not rewarded correctly {expected: ${initial_owner_balance}, final: ${final_owner_balance}}`);

        assert.equal(final_generator_balance, expected_generator_balance,
            `Generator was not rewarded correctly {expected: ${expected_generator_balance}, final: ${final_generator_balance}}`);

        assert.equal(final_patreon_balance, expected_patreon_balance,
            `Patreon was not rewarded correctly {expected: ${initial_patreon_balance}, final: ${final_patreon_balance}}`);

        assert.equal(final_seed_creator_balance, expected_seed_creator_balance,
            `Seed creator was not rewarded correctly {expected: ${initial_seed_creator_balance}, final: ${final_seed_creator_balance}}`);
    });

    // // TODO: Tests de halving

    // it("should create an nft and reward a patreon since there is at least one", async () => {
    //     ...
    // });

    // // TODO: Algun test que pase la primera validación de la existencia de seed pero falle al encontrar esa misma seed en seedCollectionManager

    // it("should reward all the parts with te correct distribution", async () => {
    //     ...
    // });

    // it("should fail to mint a new variation since the nft limit at the seed collection is reached", async () => {
    //     ...
    // });

    // it("should create a new NFT variation from curator validation", async () => {
    //     ...
    // });
    
});
