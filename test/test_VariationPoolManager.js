const VariationPoolManager = artifacts.require("VariationPoolManager");
const SeedCollectionManager = artifacts.require("SeedCollectionManager");
const zero_address = "0x0000000000000000000000000000000000000000";

contract("VariationPoolManager", (accounts) => {
    console.log("Running VariationPoolManager tests");
    let variationPoolManagerInstance;

    before(async () => {
        let seedCollectionManagerInstance = await SeedCollectionManager.deployed();
        variationPoolManagerInstance = await VariationPoolManager.deployed();
        await seedCollectionManagerInstance.createSeed("seed name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[0] });
    });

    it("shoud fail to add variation since the seed does not exists", async () => {
        try {
            await variationPoolManagerInstance.proposeVariation(10, "newUri", accounts[1], { from: accounts[0] });
            const variation = await variationPoolManagerInstance.variationsBySeed(10, 0);
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Seed does not exist"), error.message);
        }
    });

    it("should add a new variation", async () => {
        await variationPoolManagerInstance.proposeVariation(1, "newUri", accounts[1], { from: accounts[0] });
        const variation = await variationPoolManagerInstance.variationsBySeed(1, 0);
        assert.equal(variation.contentUri, "newUri", "Variation not added correctly");
    });

    it("should fail to add a new variation sice the generator is zero address", async () => {
        try {
            await variationPoolManagerInstance.proposeVariation(1, "newUri", zero_address, { from: accounts[0] });
            const variation = await variationPoolManagerInstance.variationsBySeed(0);
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Generator address is required"), error.message);
        }
    });

    it("should fail to add 101 new variations since the limit is 100", async () => {
        try {
            const difficulty = await variationPoolManagerInstance.difficulty();
            for (let i = 0; i < difficulty + 1; i++) {
                await variationPoolManagerInstance.proposeVariation(1, "newUri", accounts[1], { from: accounts[0] });
            }
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Variation limit reached for this seed"), error.message);
        }
    });

    it("should change the difficulty", async () => {
        await variationPoolManagerInstance.setDifficulty(1, { from: accounts[0] });
        const difficulty = await variationPoolManagerInstance.difficulty();
        assert.equal(difficulty.toNumber(), 1, "Difficulty not changed correctly");
    });

    it("should fail to change the difficulty since the caller is not the owner", async () => {
        try {
            await variationPoolManagerInstance.setDifficulty(1, { from: accounts[1] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });
    
    it("should clean the variation pool for a seed", async () => {
        await variationPoolManagerInstance.rejectAllVariations(1, { from: accounts[0] });
        const variations = await variationPoolManagerInstance.validatedVariationCountBySeed(1);
        assert.equal(variations.toNumber(), 0, "Variations not cleaned correctly");
    });

    it("should fail to clean the variation pool since the caller is not the owner", async () => {
        try {
            await variationPoolManagerInstance.rejectAllVariations(1, { from: accounts[1] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });

    it("should fail to clean the variation pool since the difficulty has not been reached", async () => {
        try {
            await variationPoolManagerInstance.rejectAllVariations(1, { from: accounts[0] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Variation limit not reached yet"), error.message)
        }
    });

    it("should emit a new variation validated event and clean the variation seed pool since the a variation was validated", async () => {
        await variationPoolManagerInstance.setDifficulty(3, { from: accounts[0] });
        for (let i = 0; i < 3; i++) {
            await variationPoolManagerInstance.proposeVariation(1, `http://${i}`, accounts[1], { from: accounts[0] });
        }

        const result = await variationPoolManagerInstance.selectVariation(1, 1, { from: accounts[0] });

        const validatedVariations = await variationPoolManagerInstance.validatedVariationCountBySeed(1);

        assert.equal(result.logs[0].event, "VariationSelected", "Validation event not emitted");
        assert.equal(result.logs[0].args.seedId.toNumber(), 1, "SeedId does not match expected");
        assert.equal(result.logs[0].args.contentUri, "http://1", "VariationId does not match expected");
        assert.equal(result.logs[0].args.generator, accounts[1], "Generator does not match expected");
        assert.equal(validatedVariations.toNumber(), 1, "Variation not added to validated variation count");

        try {
            await variationPoolManagerInstance.variationsBySeed(1, 0);
        } catch (error) {
            assert(error.message.includes("revert"), "Proposed variation pool not cleared");
        }
    });

});
