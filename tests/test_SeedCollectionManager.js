const SeedCollectionManager = artifacts.require("SeedCollectionManager");
const zero_address = "0x0000000000000000000000000000000000000000";

contract("SeedCollectionManager", (accounts) => {
    console.log("Running SeedCollectionManager tests");
    let seedCollectionManagerInstance;

    before(async () => {
        seedCollectionManagerInstance = await SeedCollectionManager.deployed();
    });

    it("should create a new seed", async () => {
        await seedCollectionManagerInstance.createSeed("seed name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[0] });
        const seedCounter = await seedCollectionManagerInstance.seedCounter();
        assert.equal(seedCounter.toNumber(), 1, "Seed collection not created correctly");
    });

    it("should create a new seed collection", async () => {
        await seedCollectionManagerInstance.createSeed("seed name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[0] });
        const seedId = await seedCollectionManagerInstance.seedCounter();
        const collectionAddress = await seedCollectionManagerInstance.getSeedAddress(seedId);
        assert.notEqual(collectionAddress, zero_address, "Seed collection not created correctly");
    });

    it("should fail to create a new seed collection since the caller is not the owner", async () => {
        try {
            await seedCollectionManagerInstance.createSeed("seed name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[1] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });

    it("should fail to mint a variation since the caller is not ABAC", async () => {
        try {
            await seedCollectionManagerInstance.createSeed("seed name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[0] });
            const seedId = await seedCollectionManagerInstance.seedCounter();
            await seedCollectionManagerInstance.mintVariation(seedId, "http...", { from: accounts[1] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Caller is not ABAC contract"), error.message);
        }
    });
});
