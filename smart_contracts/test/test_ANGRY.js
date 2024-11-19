const ANGRY = artifacts.require("ANGRY");

contract("ANGRY", (accounts) => {
    console.log("Running ANGRY tests");
    let angryInstance;

    before(async () => {
        angryInstance = await ANGRY.deployed();
    });

    it("should return the correct max supply", async () => {
        const maxSupply = await angryInstance.MAX_SUPPLY();
        assert.equal(parseInt(maxSupply).toString(), (21 * 10**9 * 10**18).toString(), "Max supply is incorrect");
    });

    it("should fail to update the collection manager address if the caller is not the owner", async () => {
        try {
            await angryInstance.setAreaCollectionManagerAddress(accounts[1], { from: accounts[1] });
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });

    it("should fail to update the art work pool address if the caller is not the owner", async () => {
        try {
            await angryInstance.setArtWorkPoolAddress(accounts[1], { from: accounts[1] });
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });

    it("should fail to update the patreon manager address if the caller is not the owner", async () => {
        try {
            await angryInstance.setPatreonManagerAddress(accounts[1], { from: accounts[1] });
            assert.fail("The transaction should have thrown an error");
        }
        catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });

    it("should fail to update the collection manager address if it has already been updated", async () => {
        try {
            await angryInstance.setAreaCollectionManagerAddress(accounts[2]);
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert(error.message.includes("Address already set"), error.message);
        }
    });

    it("should fail to update the variation pool address if it has already been updated", async () => {
        try {
            await angryInstance.setArtWorkPoolAddress(accounts[2]);
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert(error.message.includes("Address already set"), error.message);
        }
    });

    it("should fail to update the patreon manager address if it has already been updated", async () => {
        try {
            await angryInstance.setPatreonManagerAddress(accounts[4]);
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert(error.message.includes("Address already set"), error.message);
        }
    });
});
