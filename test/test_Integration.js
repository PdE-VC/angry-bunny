const AreaCollectionManager = artifacts.require("AreaCollectionManager");
const ArtWorkPoolManager = artifacts.require("ArtWorkPoolManager");
const PatreonManager = artifacts.require("PatreonManager");
const ABAC = artifacts.require("ABAC");

async function selectArtWork(accounts, artWorkPoolManagerInstance) {
    const numberArtWorks = await artWorkPoolManagerInstance.getArtWorksLength(1);
    const difficulty = 3
    await artWorkPoolManagerInstance.setDifficulty(difficulty, { from: accounts[0] });
    for (let i = 0; i < difficulty - numberArtWorks; i++) {
        await artWorkPoolManagerInstance.proposeArtWork(1, `http://${i}`, accounts[1], { from: accounts[0] });
    }
    
    return await artWorkPoolManagerInstance.selectArtWork(1, 1, { from: accounts[0] });
}

contract("Integration", (accounts) => {
    console.log("Running Integration tests");
    let areaCollectionManagerInstance;
    let artWorkPoolManagerInstance;
    let patreonManagerInstance;
    let abacInstance;

    before(async () => {
        areaCollectionManagerInstance = await AreaCollectionManager.deployed();
        artWorkPoolManagerInstance = await ArtWorkPoolManager.deployed();
        patreonManagerInstance = await PatreonManager.deployed();
        abacInstance = await ABAC.deployed();
    });

    it("should fail to create a new art work since there is no area", async () => {
        try {
            await artWorkPoolManagerInstance.proposeArtWork(1, "contentURI", accounts[1], { from: accounts[0] });
        } catch (error) {
            assert(error.message.includes("Area does not exist"), 
                `Error message does not match expected: Area does not exist - found: ${error.message}`);
        }
    });

    it("should emit a new validation event since the area is ready to validate", async () => {
        await areaCollectionManagerInstance.createArea("Area1", "S1", 1, 1, "ipfs uri", accounts[3], { from: accounts[0] });
        await artWorkPoolManagerInstance.setDifficulty(1, { from: accounts[0] });
        const result = await artWorkPoolManagerInstance.proposeArtWork(1, "contentURI", accounts[1], { from: accounts[0] });

        assert.equal(result.logs[1].event, "AreaReadyToCurate", "Validation event not emitted");
        assert.equal(result.logs[1].args.areaId.toNumber(), 1, "AreaId does not match expected");
    });

    it("should not emit a new validation event since the area is not ready to validate", async () => {
        const artWorks = await artWorkPoolManagerInstance.validatedArtWorkCountByArea(1);
        await artWorkPoolManagerInstance.setDifficulty(artWorks + 3, { from: accounts[0] });
        const result = await artWorkPoolManagerInstance.proposeArtWork(1, "contentURI", accounts[1], { from: accounts[0] });

        assert.equal(result.logs.length, 1, "Validation event emitted");
    });

    // it("should fail to validate a new artWork since the limit for ABAC tokens is reached", async () => {
    //     ...
    // });

    it("should create an nft and reward the owner since there is no patreon", async () => {
        const owner = accounts[0];
        
        let initialOwnerBalance = await abacInstance.balanceOf(owner);
        initialOwnerBalance = web3.utils.toBN(initialOwnerBalance);

        const result = await selectArtWork(accounts, artWorkPoolManagerInstance);

        const totalReward = web3.utils.toBN(await abacInstance.tokensPerBlock());
        const patreonReward = totalReward.div(web3.utils.toBN(2));
        const generatorReward = totalReward.mul(web3.utils.toBN(40)).div(web3.utils.toBN(100));
        const areaCreatorReward = totalReward.mul(web3.utils.toBN(5)).div(web3.utils.toBN(100));
        const ownerReward = totalReward.sub(generatorReward).sub(areaCreatorReward);

        let finalOwnerBalance = await abacInstance.balanceOf(owner);
        finalOwnerBalance = web3.utils.toBN(finalOwnerBalance);
        const expectedOwnerBalance = initialOwnerBalance.add(ownerReward);

        assert(finalOwnerBalance.eq(expectedOwnerBalance), 
            `Owner balance did not increase {initial: ${initialOwnerBalance}, final: ${finalOwnerBalance}}`);
    });

    it("should create an nft and reward every part with the correct distribution", async () => {
        const area = 1;
    
        const owner = accounts[0];
        const generatorAccount = accounts[1];
        const patreon = accounts[2];
        const areaCreator = await areaCollectionManagerInstance.getAreaCreator(area);
        
        const ownerBalance = await patreonManagerInstance.balanceOf(owner);
        patreonManagerInstance.transfer(patreon, ownerBalance, {from : owner});
    
        // Get initial balances
        let initialOwnerBalance = web3.utils.toBN(await abacInstance.balanceOf(owner));
    
        let initialGeneratorBalance = web3.utils.toBN(await abacInstance.balanceOf(generatorAccount));
    
        let initialPatreonBalance = web3.utils.toBN(await abacInstance.balanceOf(patreon));
    
        let initialAreaCreatorBalance = web3.utils.toBN(await abacInstance.balanceOf(areaCreator));
    
        // Propose and select a artWork
        const result = await selectArtWork(accounts, artWorkPoolManagerInstance);
    
        // Get final balances
        let finalOwnerBalance = web3.utils.toBN(await abacInstance.balanceOf(owner));
    
        let finalGeneratorBalance = web3.utils.toBN(await abacInstance.balanceOf(generatorAccount));
    
        let finalPatreonBalance = web3.utils.toBN(await abacInstance.balanceOf(patreon));
    
        let finalAreaCreatorBalance = web3.utils.toBN(await abacInstance.balanceOf(areaCreator));
    
        // Calculate distribution rewards
        const totalReward = web3.utils.toBN(await abacInstance.tokensPerBlock());
        const patreonReward = totalReward.div(web3.utils.toBN(2));
        const generatorReward = totalReward.mul(web3.utils.toBN(40)).div(web3.utils.toBN(100));
        const areaCreatorReward = totalReward.mul(web3.utils.toBN(5)).div(web3.utils.toBN(100));
        const ownerReward = totalReward.sub(patreonReward).sub(generatorReward).sub(areaCreatorReward);
    
        const expectedOwnerBalance = initialOwnerBalance.add(ownerReward);
        const expectedGeneratorBalance = initialGeneratorBalance.add(generatorReward);
        const expectedPatreonBalance = initialPatreonBalance.add(patreonReward);
        const expectedAreaCreatorBalance = initialAreaCreatorBalance.add(areaCreatorReward);

        // Assert balances
        const ownerBalanceCorrect = finalOwnerBalance.eq(expectedOwnerBalance);
        assert(ownerBalanceCorrect, `Owner was not rewarded correctly {expected: ${expectedOwnerBalance.toString()}, final: ${finalOwnerBalance.toString()}}`);
    
        const generatorBalanceCorrect = finalGeneratorBalance.eq(expectedGeneratorBalance);
        assert(generatorBalanceCorrect, `Generator was not rewarded correctly {expected: ${expectedGeneratorBalance.toString()}, final: ${finalGeneratorBalance.toString()}}`);
    
        const patreonBalanceCorrect = finalPatreonBalance.eq(expectedPatreonBalance);
        assert(patreonBalanceCorrect, `Patreon was not rewarded correctly {expected: ${expectedPatreonBalance.toString()}, final: ${finalPatreonBalance.toString()}}`);
    
        const areaCreatorBalanceCorrect = finalAreaCreatorBalance.eq(expectedAreaCreatorBalance);
        assert(areaCreatorBalanceCorrect, `Area creator was not rewarded correctly {expected: ${expectedAreaCreatorBalance.toString()}, final: ${finalAreaCreatorBalance.toString()}}`);
    });

    it("should emit an AreaReadyToCurate event since the difficulty was changed to lower than the number of art works", async () => {
        const artWorks = await artWorkPoolManagerInstance.validatedArtWorkCountByArea(1);
        await artWorkPoolManagerInstance.setDifficulty(artWorks - 1, { from: accounts[0] });
        const result = await artWorkPoolManagerInstance.proposeArtWork(1, "contentURI", accounts[1], { from: accounts[0] });

        assert.equal(result.logs[1].event, "AreaReadyToCurate", "Validation event not emitted");
        assert.equal(result.logs[1].args.areaId.toNumber(), 1, "AreaId does not match expected");
    });
    
    // // TODO: Tests de halving

    // // TODO: Algun test que pase la primera validación de la existencia de area pero falle al encontrar esa misma area en areaCollectionManager

    // it("should fail to mint a new artWork since the nft limit at the area collection is reached", async () => {
    //     const nftLimit = (await areaCollectionManagerInstance.maxAreaArtWorks()).toNumber();
    //     const remainingArtWorks = nftLimit - (await artWorkPoolManagerInstance.validatedArtWorkCountByArea(1)).toNumber();
    //     for (let i = 0; i < remainingArtWorks; i++) {
    //         await selectArtWork(accounts, artWorkPoolManagerInstance);
    //     }

    //     try {
    //         await selectArtWork(accounts, artWorkPoolManagerInstance);
    //     } catch (error) {
    //         assert(error.message.includes("Area reached the limit of artWorks"), 
    //             `Error message does not match expected: Area reached the limit of artWorks - found: ${error.message}`);
    //     }
    // });

    // it("should create a new NFT artWork from curator validation", async () => {
    //     ...
    // });
    
});
