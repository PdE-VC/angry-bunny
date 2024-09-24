const SeedCollectionManager = artifacts.require("SeedCollectionManager");
const VariationPoolManager = artifacts.require("VariationPoolManager");
const PatreonManager = artifacts.require("PatreonManager");
const SeedCollection = artifacts.require("SeedCollection");
const ABAC = artifacts.require("ABAC");

contract("SeedCollection", (accounts) => {
    console.log("Running SeedCollection tests");
    let seedCollectionManagerInstance;
    let seedCollectionInstance
    let seedCollectionOwner;
    let variationPoolManagerInstance;
    let patreonManagerInstance;
    let abacInstance;

    before(async () => {
        seedCollectionManagerInstance = await SeedCollectionManager.deployed();
        variationPoolManagerInstance = await VariationPoolManager.deployed();
        patreonManagerInstance = await PatreonManager.deployed();
        abacInstance = await ABAC.deployed();

        seedCollectionOwner = seedCollectionManagerInstance.address;
        await seedCollectionManagerInstance.createSeed("seed name", "symbol", 1, 5, "http...", accounts[1], { from: accounts[0] });
        let seedCounter = await seedCollectionManagerInstance.seedCounter();
        let seedCollectionAddress = await seedCollectionManagerInstance.getSeedAddress(seedCounter);
        seedCollectionInstance = await SeedCollection.at(seedCollectionAddress);
    });

    it("should fail to create a new variation since there is no seed", async () => {
        ...
    });

    it("should emit a new validation event since the seed is ready to validate", async () => {
        ...
    });

    it("should not emit a new validation event since the seed is not ready to validate", async () => {
        ...
    });

    it("should emit a new variation validated event since the a variation was validated", async () => {
        ...
    });

    it("should fail to validate a new variation since the limit for ABAC tokens is reached", async () => {
        ...
    });

    it("should create an nft and reward the owner since there is no patreon", async () => {
        ...
    });

    // TODO: Tests de halving

    it("should create an nft and reward a patreon since there is at least one", async () => {
        ...
    });

    // TODO: Algun test que pase la primera validación de la existencia de seed pero falle al encontrar esa misma seed en seedCollectionManager

    it("should reward all the parts with te correct distribution", async () => {
        ...
    });

    it("should fail to mint a new variation since the nft limit at the seed collection is reached", async () => {
        ...
    });

    it("should create a new NFT variation from curator validation", async () => {
        ...
    });
    
});
