const PatreonManager = artifacts.require("PatreonManager");

contract("PatreonManager", (accounts) => {
    console.log("Running PatreonManager tests");
    let patreonManagerInstance;

    before(async () => {
        patreonManagerInstance = await PatreonManager.deployed();
    });

    /*it("should mint a new Patreon NFT", async () => {
        await patreonManagerInstance.addPatreon(accounts[1], { from: accounts[0] });
        const patreonsCount = await patreonManagerInstance.patreonsCount();
        assert.equal(patreonsCount.toNumber(), 1, "Patreon not minted correctly");
    });

    it("should select a random patreon", async () => {
        const patreonAddress = await patreonManagerInstance.selectRandomPatreon();
        assert(patreonAddress, "Random patreon selection failed");
    });*/
});
