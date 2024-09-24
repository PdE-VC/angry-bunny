const SeedCollectionManager = artifacts.require("SeedCollectionManager");
const SeedCollection = artifacts.require("SeedCollection");

contract("SeedCollection", (accounts) => {
    console.log("Running SeedCollection tests");
    let seedCollectionManagerInstance;
    let seedCollectionInstance
    let seedCollectionOwner;

    before(async () => {
        seedCollectionManagerInstance = await SeedCollectionManager.deployed();
        seedCollectionOwner = seedCollectionManagerInstance.address;
        await seedCollectionManagerInstance.createSeed("seed name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[0] });
        let seedCounter = await seedCollectionManagerInstance.seedCounter();
        let seedCollectionAddress = await seedCollectionManagerInstance.getSeedAddress(seedCounter);
        seedCollectionInstance = await SeedCollection.at(seedCollectionAddress);
    });

    it("should create a new NFT variation", async () => {
        await seedCollectionInstance.createNFTVariation(accounts[1], "seedURI", { from: seedCollectionOwner });
        const tokenURI = await seedCollectionInstance.tokenURI(0);
        assert.equal(tokenURI, "seedURI", "Seed not minted correctly");
    });

    it("should new variation belong to the owner", async () => {
        await seedCollectionInstance.createNFTVariation(accounts[1], "seedURI", { from: seedCollectionOwner });
        const owner = await seedCollectionInstance.ownerOf(0);
        assert.equal(owner, accounts[1], "Seed not minted correctly");
    });

    it("should update token URI", async () => {
        await seedCollectionInstance.setTokenURI(0, "newSeedURI", { from: seedCollectionOwner });
        const tokenURI = await seedCollectionInstance.tokenURI(0);
        assert.equal(tokenURI, "newSeedURI", "Token URI not updated correctly");
    });

    it("should fail to update token URI since the caller is not the owner", async () => {
        try {
            await seedCollectionInstance.setTokenURI(0, "newSeedURI", { from: accounts[1] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });

    it("should return false since collection is not full", async () => {
        const isFull = await seedCollectionInstance.isFull();
        assert.equal(isFull, false, "Collection is full");
    });

    it("should return true since collection is full", async () => {
        for (let i = 0; i < 101; i++) {
            await seedCollectionInstance.createNFTVariation(accounts[1], "seedURI", { from: seedCollectionOwner });
        }
        const isFull = await seedCollectionInstance.isFull();
        assert.equal(isFull, true, "Collection is not full");
    });
});
