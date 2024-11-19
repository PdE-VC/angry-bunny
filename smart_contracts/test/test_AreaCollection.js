const AreaCollection = artifacts.require("AreaCollection");

contract("AreaCollection", (accounts) => {
    console.log("Running AreaCollection tests");
    let areaCollectionInstance;

    before(async () => {
        areaCollectionInstance = await AreaCollection.deployed();
    });

    it("should create a new NFT art work", async () => {
        await areaCollectionInstance.createNFTArt(accounts[1], "areaURI", { from: accounts[0] });
        const tokenURI = await areaCollectionInstance.tokenURI(0);
        assert.equal(tokenURI, "areaURI", "Area not minted correctly");
    });

    it("should new art work belong to the owner", async () => {
        await areaCollectionInstance.createNFTArt(accounts[1], "areaURI", { from: accounts[0] });
        const owner = await areaCollectionInstance.ownerOf(0);
        assert.equal(owner, accounts[1], "Area not minted correctly");
    });

    it("should return false since collection is not full", async () => {
        const isFull = await areaCollectionInstance.isFull();
        assert.equal(isFull, false, "Collection is full");
    });

    it("should return true since collection is full", async () => {
        for (let i = 0; i < 20; i++) {
            try {
                await areaCollectionInstance.createNFTArt(accounts[1], "areaURI", { from: accounts[0] });
            } catch (error) {
                continue;
            }
        }
        const isFull = await areaCollectionInstance.isFull();
        assert.equal(isFull, true, "Collection is not full");
    });

    it("should fail to create a new NFT art work since collection is full", async () => {
        try {
            await areaCollectionInstance.createNFTArt(accounts[1], "areaURI", { from: accounts[0] });
        } catch (error) {
            assert(error.message.includes("Maximum art works reached"), "Error message does not match");
        }
    });
});
