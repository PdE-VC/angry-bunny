const SeedCollection = artifacts.require("SeedCollection");

contract("SeedCollection", (accounts) => {
    console.log("Running SeedCollection tests");
    let seedCollectionInstance;

    before(async () => {
        seedCollectionInstance = await SeedCollection.deployed();
    });

    it("should create a new NFT variation", async () => {
        await seedCollectionInstance.createNFTVariation(accounts[1], "seedURI", { from: accounts[0] });
        const tokenURI = await seedCollectionInstance.tokenURI(0);
        assert.equal(tokenURI, "seedURI", "Seed not minted correctly");
    });

    it("should new variation belong to the owner", async () => {
        await seedCollectionInstance.createNFTVariation(accounts[1], "seedURI", { from: accounts[0] });
        const owner = await seedCollectionInstance.ownerOf(0);
        assert.equal(owner, accounts[1], "Seed not minted correctly");
    });

    it("should return false since collection is not full", async () => {
        const isFull = await seedCollectionInstance.isFull();
        assert.equal(isFull, false, "Collection is full");
    });

    it("should return true since collection is full", async () => {
        for (let i = 0; i < 20; i++) {
            try {
                await seedCollectionInstance.createNFTVariation(accounts[1], "seedURI", { from: accounts[0] });
            } catch (error) {
                continue;
            }
        }
        const isFull = await seedCollectionInstance.isFull();
        assert.equal(isFull, true, "Collection is not full");
    });

    it("should fail to create a new NFT variation since collection is full", async () => {
        try {
            await seedCollectionInstance.createNFTVariation(accounts[1], "seedURI", { from: accounts[0] });
        } catch (error) {
            assert(error.message.includes("Maximum variations reached"), "Error message does not match");
        }
    });
});
