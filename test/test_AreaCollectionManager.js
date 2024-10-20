const AreaCollectionManager = artifacts.require("AreaCollectionManager");
const zero_address = "0x0000000000000000000000000000000000000000";

contract("AreaCollectionManager", (accounts) => {
    console.log("Running AreaCollectionManager tests");
    let areaCollectionManagerInstance;

    before(async () => {
        areaCollectionManagerInstance = await AreaCollectionManager.deployed();
    });

    it("should create a new area", async () => {
        await areaCollectionManagerInstance.createArea("area name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[0] });
        const areaCounter = await areaCollectionManagerInstance.areaCounter();
        assert.equal(areaCounter.toNumber(), 1, "Area collection not created correctly");
    });

    it("should create a new area collection", async () => {
        await areaCollectionManagerInstance.createArea("area name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[0] });
        const areaId = await areaCollectionManagerInstance.areaCounter();
        const collectionAddress = await areaCollectionManagerInstance.getAreaAddress(areaId);
        assert.notEqual(collectionAddress, zero_address, "Area collection not created correctly");
    });

    it("should fail to create a new area collection since the caller is not the owner", async () => {
        try {
            await areaCollectionManagerInstance.createArea("area name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[1] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });

    it("should fail to mint an art work since the caller is not ABAC", async () => {
        try {
            await areaCollectionManagerInstance.createArea("area name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[0] });
            const areaId = await areaCollectionManagerInstance.areaCounter();
            await areaCollectionManagerInstance.mintArtWork(areaId, "http...", { from: accounts[1] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Caller is not ABAC contract"), error.message);
        }
    });
});
