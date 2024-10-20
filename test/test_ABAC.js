const ABAC = artifacts.require("ABAC");

contract("ABAC", (accounts) => {
    console.log("Running ABAC tests");
    let abacInstance;

    before(async () => {
        abacInstance = await ABAC.deployed();
    });

    it("should return the correct max supply", async () => {
        const maxSupply = await abacInstance.MAX_SUPPLY();
        assert.equal(parseInt(maxSupply).toString(), (21 * 10**9 * 10**18).toString(), "Max supply is incorrect");
    });

    it("should fail to update the collection manager address if the caller is not the owner", async () => {
        try {
            await abacInstance.setAreaCollectionManagerAddress(accounts[1], { from: accounts[1] });
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });

    it("should fail to update the art work pool address if the caller is not the owner", async () => {
        try {
            await abacInstance.setArtWorkPoolAddress(accounts[1], { from: accounts[1] });
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });

    it("should fail to update the patreon manager address if the caller is not the owner", async () => {
        try {
            await abacInstance.setPatreonManagerAddress(accounts[1], { from: accounts[1] });
            assert.fail("The transaction should have thrown an error");
        }
        catch (error) {
            assert(error.message.includes("Ownable: caller is not the owner"), error.message);
        }
    });

    it("should fail to update the collection manager address if it has already been updated", async () => {
        try {
            await abacInstance.setAreaCollectionManagerAddress(accounts[2]);
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert(error.message.includes("Address already set"), error.message);
        }
    });

    it("should fail to update the variation pool address if it has already been updated", async () => {
        try {
            await abacInstance.setArtWorkPoolAddress(accounts[2]);
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert(error.message.includes("Address already set"), error.message);
        }
    });

    it("should fail to update the patreon manager address if it has already been updated", async () => {
        try {
            await abacInstance.setPatreonManagerAddress(accounts[4]);
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert(error.message.includes("Address already set"), error.message);
        }
    });
});
