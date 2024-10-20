const ArtWorkPoolManager = artifacts.require("ArtWorkPoolManager");
const AreaCollectionManager = artifacts.require("AreaCollectionManager");
const zero_address = "0x0000000000000000000000000000000000000000";

contract("ArtWorkPoolManager", (accounts) => {
    console.log("Running ArtWorkPoolManager tests");
    let artWorkPoolManagerInstance;

    before(async () => {
        let areaCollectionManagerInstance = await AreaCollectionManager.deployed();
        artWorkPoolManagerInstance = await ArtWorkPoolManager.deployed();
        await areaCollectionManagerInstance.createArea("area name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[0] });
    });

    it("shoud fail to add art work since the area does not exists", async () => {
        try {
            await artWorkPoolManagerInstance.proposeArtWork(10, "newUri", accounts[1], { from: accounts[0] });
            const artWork = await artWorkPoolManagerInstance.artWorksByArea(10, 0);
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Area does not exist"), error.message);
        }
    });

    it("should add a new art work", async () => {
        await artWorkPoolManagerInstance.proposeArtWork(1, "newUri", accounts[1], { from: accounts[0] });
        const artWork = await artWorkPoolManagerInstance.artWorksByArea(1, 0);
        assert.equal(artWork.contentUri, "newUri", "ArtWork not added correctly");
    });

    it("should fail to add a new art work sice the artist is zero address", async () => {
        try {
            await artWorkPoolManagerInstance.proposeArtWork(1, "newUri", zero_address, { from: accounts[0] });
            const artWork = await artWorkPoolManagerInstance.artWorksByArea(0);
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Generator address is required"), error.message);
        }
    });

    it("should fail to more art works than the difficulty", async () => {
        try {
            const difficulty = await artWorkPoolManagerInstance.difficulty();
            for (let i = 0; i < difficulty + 1; i++) {
                await artWorkPoolManagerInstance.proposeArtWork(1, "newUri", accounts[1], { from: accounts[0] });
            }
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("ArtWork limit reached for this area"), error.message);
        }
    });

    it("should change the difficulty", async () => {
        await artWorkPoolManagerInstance.setDifficulty(1, { from: accounts[0] });
        const difficulty = await artWorkPoolManagerInstance.difficulty();
        assert.equal(difficulty.toNumber(), 1, "Difficulty not changed correctly");
    });

    it("should fail to change the difficulty since the caller is not the owner", async () => {
        try {
            await artWorkPoolManagerInstance.setDifficulty(1, { from: accounts[1] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });
    
    it("should clean the art work pool for a area", async () => {
        await artWorkPoolManagerInstance.rejectAllArtWorks(1, { from: accounts[0] });
        const artWorks = await artWorkPoolManagerInstance.validatedArtWorkCountByArea(1);
        assert.equal(artWorks.toNumber(), 0, "ArtWorks not cleaned correctly");
    });

    it("should fail to clean the art work pool since the caller is not the owner", async () => {
        try {
            await artWorkPoolManagerInstance.rejectAllArtWorks(1, { from: accounts[1] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });

    it("should fail to clean the art work pool since the difficulty has not been reached", async () => {
        try {
            await artWorkPoolManagerInstance.rejectAllArtWorks(1, { from: accounts[0] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("ArtWork limit not reached yet"), error.message)
        }
    });

    it("should emit a new art work validated event and clean the artWork area pool since the a art work was validated", async () => {
        await artWorkPoolManagerInstance.setDifficulty(3, { from: accounts[0] });
        for (let i = 0; i < 3; i++) {
            await artWorkPoolManagerInstance.proposeArtWork(1, `http://${i}`, accounts[1], { from: accounts[0] });
        }

        const result = await artWorkPoolManagerInstance.selectArtWork(1, 1, { from: accounts[0] });

        const validatedArtWorks = await artWorkPoolManagerInstance.validatedArtWorkCountByArea(1);

        assert.equal(result.logs[0].event, "ArtWorkSelected", "Validation event not emitted");
        assert.equal(result.logs[0].args.areaId.toNumber(), 1, "AreaId does not match expected");
        assert.equal(result.logs[0].args.contentUri, "http://1", "ArtWorkId does not match expected");
        assert.equal(result.logs[0].args.generator, accounts[1], "Generator does not match expected");
        assert.equal(validatedArtWorks.toNumber(), 1, "ArtWork not added to validated artWork count");

        try {
            await artWorkPoolManagerInstance.artWorksByArea(1, 0);
        } catch (error) {
            assert(error.message.includes("revert"), "Proposed artWork pool not cleared");
        }
    });

    it("should fail to select an art work since the difficulty has not been reached", async () => {
        try {
            await artWorkPoolManagerInstance.selectArtWork(1, 1, { from: accounts[0] });
            assert.fail("The function did not throw");
        } catch (error) {
            assert(error.message.includes("ArtWork limit not reached yet"), error.message);
        }
    });
});
