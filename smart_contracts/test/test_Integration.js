const AreaCollectionManager = artifacts.require("AreaCollectionManager");
const ArtWorkPoolManager = artifacts.require("ArtWorkPoolManager");
const PatreonManager = artifacts.require("PatreonManager");
const ANGRY = artifacts.require("ANGRY");

async function selectArtWork(accounts, artWorkPoolManagerInstance, area=1) {
    const numberArtWorks = await artWorkPoolManagerInstance.getArtWorksLength(1);
    const difficulty = 3
    await artWorkPoolManagerInstance.setDifficulty(difficulty, { from: accounts[0] });
    for (let i = 0; i < difficulty - numberArtWorks; i++) {
        await artWorkPoolManagerInstance.proposeArtWork(area, `http://${i}`, accounts[1], { from: accounts[0] });
    }
    
    return artWorkPoolManagerInstance.selectArtWork(area, 1, { from: accounts[0] });
}

contract("Integration", (accounts) => {
    console.log("Running Integration tests");
    let areaCollectionManagerInstance;
    let artWorkPoolManagerInstance;
    let patreonManagerInstance;
    let angryInstance;

    before(async () => {
        areaCollectionManagerInstance = await AreaCollectionManager.deployed();
        artWorkPoolManagerInstance = await ArtWorkPoolManager.deployed();
        patreonManagerInstance = await PatreonManager.deployed();
        angryInstance = await ANGRY.deployed();

        await areaCollectionManagerInstance.createArea("Area2", "S1", 1, 20, "ipfs uri", accounts[3], { from: accounts[0] });
    });

    it("should fail to create a new art work since there is no area", async () => {
        try {
            await artWorkPoolManagerInstance.proposeArtWork(5, "contentURIII", accounts[1], { from: accounts[0] });
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

    // it("should fail to validate a new artWork since the limit for ANGRY tokens is reached", async () => {
    //     ...
    // });

    it("should create an nft and reward the owner since there is no patreon", async () => {
        const owner = accounts[0];
        
        let initialOwnerBalance = await angryInstance.balanceOf(owner);
        initialOwnerBalance = web3.utils.toBN(initialOwnerBalance);

        const result = await selectArtWork(accounts, artWorkPoolManagerInstance);

        // Get reward percentages
        const artistRewardPercentage = await angryInstance.ARTIST_PERCENTAGE_REWARD();
        const areaCreatorRewardPercentage = await angryInstance.AREA_CREATOR_PERCENTAGE_REWARD();

        const totalReward = web3.utils.toBN(await angryInstance.tokensPerBlock());
        const artistReward = totalReward.mul(web3.utils.toBN(artistRewardPercentage)).div(web3.utils.toBN(100));
        const areaCreatorReward = totalReward.mul(web3.utils.toBN(areaCreatorRewardPercentage)).div(web3.utils.toBN(100));
        const ownerReward = totalReward.sub(artistReward).sub(areaCreatorReward);

        let finalOwnerBalance = await angryInstance.balanceOf(owner);
        finalOwnerBalance = web3.utils.toBN(finalOwnerBalance);
        const expectedOwnerBalance = initialOwnerBalance.add(ownerReward);

        assert(finalOwnerBalance.eq(expectedOwnerBalance), 
            `Owner balance did not increase {initial: ${initialOwnerBalance}, final: ${finalOwnerBalance}}`);
    });

    it("should create an nft and reward every part with the correct distribution", async () => {
        const area = 1;
    
        const owner = accounts[0];
        const artistAccount = accounts[1];
        const patreon = accounts[2];
        const areaCreator = await areaCollectionManagerInstance.getAreaCreator(area);
        
        const ownerBalance = await patreonManagerInstance.balanceOf(owner);
        patreonManagerInstance.transfer(patreon, ownerBalance, {from : owner});
    
        // Get initial balances
        let initialOwnerBalance = web3.utils.toBN(await angryInstance.balanceOf(owner));
    
        let initialGeneratorBalance = web3.utils.toBN(await angryInstance.balanceOf(artistAccount));
    
        let initialPatreonBalance = web3.utils.toBN(await angryInstance.balanceOf(patreon));
    
        let initialAreaCreatorBalance = web3.utils.toBN(await angryInstance.balanceOf(areaCreator));
    
        // Propose and select a artWork
        const result = await selectArtWork(accounts, artWorkPoolManagerInstance);
    
        // Get final balances
        let finalOwnerBalance = web3.utils.toBN(await angryInstance.balanceOf(owner));
    
        let finalGeneratorBalance = web3.utils.toBN(await angryInstance.balanceOf(artistAccount));
    
        let finalPatreonBalance = web3.utils.toBN(await angryInstance.balanceOf(patreon));
    
        let finalAreaCreatorBalance = web3.utils.toBN(await angryInstance.balanceOf(areaCreator));

        // Get reward percentages
        const patreonRewardPercentage = await angryInstance.PATREON_PERCENTAGE_REWARD();
        const artistRewardPercentage = await angryInstance.ARTIST_PERCENTAGE_REWARD();
        const areaCreatorRewardPercentage = await angryInstance.AREA_CREATOR_PERCENTAGE_REWARD();
    
        // Calculate distribution rewards
        const totalReward = web3.utils.toBN(await angryInstance.tokensPerBlock());
        const patreonReward = totalReward.mul(web3.utils.toBN(patreonRewardPercentage)).div(web3.utils.toBN(100));
        const artistReward = totalReward.mul(web3.utils.toBN(artistRewardPercentage)).div(web3.utils.toBN(100));
        const areaCreatorReward = totalReward.mul(web3.utils.toBN(areaCreatorRewardPercentage)).div(web3.utils.toBN(100));
        const ownerReward = totalReward.sub(patreonReward).sub(artistReward).sub(areaCreatorReward);
    
        const expectedOwnerBalance = initialOwnerBalance.add(ownerReward);
        const expectedGeneratorBalance = initialGeneratorBalance.add(artistReward);
        const expectedPatreonBalance = initialPatreonBalance.add(patreonReward);
        const expectedAreaCreatorBalance = initialAreaCreatorBalance.add(areaCreatorReward);

        // Assert balances
        const ownerBalanceCorrect = finalOwnerBalance.eq(expectedOwnerBalance);
        assert(ownerBalanceCorrect, `Owner was not rewarded correctly {expected: ${expectedOwnerBalance.toString()}, final: ${finalOwnerBalance.toString()}}`);
    
        const artistBalanceCorrect = finalGeneratorBalance.eq(expectedGeneratorBalance);
        assert(artistBalanceCorrect, `Generator was not rewarded correctly {expected: ${expectedGeneratorBalance.toString()}, final: ${finalGeneratorBalance.toString()}}`);
    
        const patreonBalanceCorrect = finalPatreonBalance.eq(expectedPatreonBalance);
        assert(patreonBalanceCorrect, `Patreon was not rewarded correctly {expected: ${expectedPatreonBalance.toString()}, final: ${finalPatreonBalance.toString()}}`);
    
        const areaCreatorBalanceCorrect = finalAreaCreatorBalance.eq(expectedAreaCreatorBalance);
        assert(areaCreatorBalanceCorrect, `Area creator was not rewarded correctly {expected: ${expectedAreaCreatorBalance.toString()}, final: ${finalAreaCreatorBalance.toString()}}`);
    });

    it("should clean the artWork area pool since the art work was validated", async () => {
        const numberValidatedArtWorks = await artWorkPoolManagerInstance.validatedArtWorkCountByArea(1);
        const numberArtWorks = await artWorkPoolManagerInstance.getArtWorksLength(1);
        const difficulty = 3
        const area = 1
        await artWorkPoolManagerInstance.setDifficulty(difficulty, { from: accounts[0] });
        for (let i = 0; i < difficulty - numberArtWorks; i++) {
            await artWorkPoolManagerInstance.proposeArtWork(area, `http://${i}`, accounts[1], { from: accounts[0] });
        }
        
        await artWorkPoolManagerInstance.selectArtWork(area, 1, { from: accounts[0] });

        const artWorks = await artWorkPoolManagerInstance.validatedArtWorkCountByArea(1);
        assert.equal(artWorks.toNumber(), 1 + numberValidatedArtWorks.toNumber(), "ArtWorks not cleaned correctly");
    });

    it("should emit an AreaReadyToCurate event since the difficulty was changed to lower than the number of art works", async () => {
        await artWorkPoolManagerInstance.proposeArtWork(1, "contentURI", accounts[1], { from: accounts[0] });
        const artWorks = await artWorkPoolManagerInstance.validatedArtWorkCountByArea(1);
        await artWorkPoolManagerInstance.setDifficulty(artWorks - 1, { from: accounts[0] });
        const result = await artWorkPoolManagerInstance.proposeArtWork(1, "contentURI", accounts[1], { from: accounts[0] });

        assert.equal(result.logs[1].event, "AreaReadyToCurate", "Validation event not emitted");
        assert.equal(result.logs[1].args.areaId.toNumber(), 1, "AreaId does not match expected");
    });
});
