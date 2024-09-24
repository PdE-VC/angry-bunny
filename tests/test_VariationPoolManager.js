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
});
