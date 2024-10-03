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
        
        let initialOwnerBalance = await abacInstance.balanceOf(owner);
        initialOwnerBalance = web3.utils.toBN(initialOwnerBalance);

        const result = await selectVariation(accounts, variationPoolManagerInstance);

        const totalReward = web3.utils.toBN(await abacInstance.tokensPerBlock());
        const patreonReward = totalReward.div(web3.utils.toBN(2));
        const generatorReward = totalReward.mul(web3.utils.toBN(40)).div(web3.utils.toBN(100));
        const seedCreatorReward = totalReward.mul(web3.utils.toBN(5)).div(web3.utils.toBN(100));
        const ownerReward = totalReward.sub(generatorReward).sub(seedCreatorReward);

        let finalOwnerBalance = await abacInstance.balanceOf(owner);
        finalOwnerBalance = web3.utils.toBN(finalOwnerBalance);
        const expectedOwnerBalance = initialOwnerBalance.add(ownerReward);

        assert(finalOwnerBalance.eq(expectedOwnerBalance), 
            `Owner balance did not increase {initial: ${initialOwnerBalance}, final: ${finalOwnerBalance}}`);
    });

    it("should create an nft and reward every part with the correct distribution", async () => {
        const seed = 1;
    
        const owner = accounts[0];
        const generatorAccount = accounts[1];
        const patreon = accounts[2];
        const seedCreator = await seedCollectionManagerInstance.getSeedCreator(seed);
        
        const ownerBalance = await patreonManagerInstance.balanceOf(owner);
        patreonManagerInstance.transfer(patreon, ownerBalance, {from : owner});
    
        // Get initial balances
        let initialOwnerBalance = web3.utils.toBN(await abacInstance.balanceOf(owner));
    
        let initialGeneratorBalance = web3.utils.toBN(await abacInstance.balanceOf(generatorAccount));
    
        let initialPatreonBalance = web3.utils.toBN(await abacInstance.balanceOf(patreon));
    
        let initialSeedCreatorBalance = web3.utils.toBN(await abacInstance.balanceOf(seedCreator));
    
        // Propose and select a variation
        const result = await selectVariation(accounts, variationPoolManagerInstance);
    
        // Get final balances
        let finalOwnerBalance = web3.utils.toBN(await abacInstance.balanceOf(owner));
    
        let finalGeneratorBalance = web3.utils.toBN(await abacInstance.balanceOf(generatorAccount));
    
        let finalPatreonBalance = web3.utils.toBN(await abacInstance.balanceOf(patreon));
    
        let finalSeedCreatorBalance = web3.utils.toBN(await abacInstance.balanceOf(seedCreator));
    
        // Calculate distribution rewards
        const totalReward = web3.utils.toBN(await abacInstance.tokensPerBlock());
        const patreonReward = totalReward.div(web3.utils.toBN(2));
        const generatorReward = totalReward.mul(web3.utils.toBN(40)).div(web3.utils.toBN(100));
        const seedCreatorReward = totalReward.mul(web3.utils.toBN(5)).div(web3.utils.toBN(100));
        const ownerReward = totalReward.sub(patreonReward).sub(generatorReward).sub(seedCreatorReward);
    
        const expectedOwnerBalance = initialOwnerBalance.add(ownerReward);
        const expectedGeneratorBalance = initialGeneratorBalance.add(generatorReward);
        const expectedPatreonBalance = initialPatreonBalance.add(patreonReward);
        const expectedSeedCreatorBalance = initialSeedCreatorBalance.add(seedCreatorReward);

        // Assert balances
        const ownerBalanceCorrect = finalOwnerBalance.eq(expectedOwnerBalance);
        assert(ownerBalanceCorrect, `Owner was not rewarded correctly {expected: ${expectedOwnerBalance.toString()}, final: ${finalOwnerBalance.toString()}}`);
    
        const generatorBalanceCorrect = finalGeneratorBalance.eq(expectedGeneratorBalance);
        assert(generatorBalanceCorrect, `Generator was not rewarded correctly {expected: ${expectedGeneratorBalance.toString()}, final: ${finalGeneratorBalance.toString()}}`);
    
        const patreonBalanceCorrect = finalPatreonBalance.eq(expectedPatreonBalance);
        assert(patreonBalanceCorrect, `Patreon was not rewarded correctly {expected: ${expectedPatreonBalance.toString()}, final: ${finalPatreonBalance.toString()}}`);
    
        const seedCreatorBalanceCorrect = finalSeedCreatorBalance.eq(expectedSeedCreatorBalance);
        assert(seedCreatorBalanceCorrect, `Seed creator was not rewarded correctly {expected: ${expectedSeedCreatorBalance.toString()}, final: ${finalSeedCreatorBalance.toString()}}`);
    });
    
    // // TODO: Tests de halving

    // // TODO: Algun test que pase la primera validación de la existencia de seed pero falle al encontrar esa misma seed en seedCollectionManager

    // it("should fail to mint a new variation since the nft limit at the seed collection is reached", async () => {
    //     const nftLimit = (await seedCollectionManagerInstance.maxSeedVariations()).toNumber();
    //     const remainingVariations = nftLimit - (await variationPoolManagerInstance.validatedVariationCountBySeed(1)).toNumber();
    //     for (let i = 0; i < remainingVariations; i++) {
    //         await selectVariation(accounts, variationPoolManagerInstance);
    //     }

    //     try {
    //         await selectVariation(accounts, variationPoolManagerInstance);
    //     } catch (error) {
    //         assert(error.message.includes("Seed reached the limit of variations"), 
    //             `Error message does not match expected: Seed reached the limit of variations - found: ${error.message}`);
    //     }
    // });

    // it("should create a new NFT variation from curator validation", async () => {
    //     ...
    // });
    
});
