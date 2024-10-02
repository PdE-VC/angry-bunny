const PatreonManager = artifacts.require("PatreonManager");

contract("PatreonManager", (accounts) => {
    console.log("Running PatreonManager tests");
    let patreonManagerInstance;

    before(async () => {
        patreonManagerInstance = await PatreonManager.deployed();
    });
});
