const ABAC = artifacts.require("ABAC");
const NFTCollection = artifacts.require("NFTCollection");

contract("ABAC", (accounts) => {
    let abacInstance;
    let collectionInstance;
    const owner = accounts[0];
    const miner = accounts[1];
    const buyer = accounts[2];
    const seedNumber = 1;
    const nftPrice = web3.utils.toWei("1", "ether");

    beforeEach(async () => {
        abacInstance = await ABAC.new(web3.utils.toWei("10000", "ether"), { from: owner });
        await abacInstance.addActiveMiner(miner, { from: owner });
    });

    it("should create a new NFT collection", async () => {
        await abacInstance.createNewNFTCollection(seedNumber, "MyNFTCollection", "MNC", { from: owner });
        const collectionAddress = await abacInstance.seedToCollection(seedNumber);
        assert(collectionAddress !== "0x0000000000000000000000000000000000000000", "Collection not created correctly");
    });

    it("should mint and reward a miner", async () => {
        await abacInstance.updateNextNFTInfo(miner, seedNumber, "imageURI", { from: owner });
        await abacInstance.mintAndReward({ from: miner });
        const balance = await abacInstance.balanceOf(miner);
        assert(balance.toString() === web3.utils.toWei("10", "ether"), "Miner reward not issued correctly");
    });

    it("should allow a user to buy an NFT", async () => {
        await abacInstance.createNewNFTCollection(seedNumber, "TestCollection", "TC", { from: owner });
        const collectionAddress = await abacInstance.seedToCollection(seedNumber);
        collectionInstance = await NFTCollection.at(collectionAddress);

        // Mint an NFT
        await abacInstance.updateNextNFTInfo(miner, seedNumber, "imageURI", { from: owner });
        await abacInstance.mintAndReward({ from: miner });

        // Buyer buys the NFT
        await abacInstance.buyNFT(seedNumber, 1, { from: buyer, value: nftPrice });
        const newOwner = await collectionInstance.ownerOf(1);
        assert(newOwner === buyer, "NFT not correctly transferred to buyer");
    });
});
