const ANGRY = artifacts.require("ANGRY");

contract("ANGRY", (accounts) => {
    let angryInstance;

    const [owner, artWorkPool, fragmentManager, unauthorized, artist] = accounts;

    before(async () => {
        angryInstance = await ANGRY.deployed();
    });

    describe("Initial Setup and Configuration", () => {
        it("should return the correct max supply", async () => {
            const maxSupply = await angryInstance.MAX_SUPPLY();
            assert.equal(
                maxSupply.toString(),
                (21 * 10 ** 9 * 10 ** 18).toString(),
                "Max supply is incorrect"
            );
        });

        it("should allow the owner to set the fragment collection manager address", async () => {
            await angryInstance.setFragmentCollectionManagerAddress(fragmentManager, { from: owner });
            const managerAddress = await angryInstance.fragmentCollectionManager();
            assert.equal(managerAddress, fragmentManager, "Fragment collection manager address is incorrect");
        });

        it("should fail to set the fragment collection manager address if not called by the owner", async () => {
            try {
                await angryInstance.setFragmentCollectionManagerAddress(accounts[1], { from: unauthorized });
                assert.fail("Non-owner should not be able to set the fragment collection manager address");
            } catch (error) {
                assert(error.message.includes("Ownable: caller is not the owner"), error.message);
            }
        });

        it("should fail to set the fragment collection manager address if already set", async () => {
            try {
                await angryInstance.setFragmentCollectionManagerAddress(accounts[2], { from: owner });
                assert.fail("Should not allow resetting the fragment collection manager address");
            } catch (error) {
                assert(error.message.includes("Address already set"), error.message);
            }
        });

        it("should allow the owner to set the artwork pool address", async () => {
            await angryInstance.setArtWorkPoolAddress(artWorkPool, { from: owner });
            const poolAddress = await angryInstance.artWorkPoolAddress();
            assert.equal(poolAddress, artWorkPool, "Art work pool address is incorrect");
        });

        it("should fail to set the artwork pool address if not called by the owner", async () => {
            try {
                await angryInstance.setArtWorkPoolAddress(accounts[1], { from: unauthorized });
                assert.fail("Non-owner should not be able to set the artwork pool address");
            } catch (error) {
                assert(error.message.includes("Ownable: caller is not the owner"), error.message);
            }
        });

        it("should fail to set the artwork pool address if already set", async () => {
            try {
                await angryInstance.setArtWorkPoolAddress(accounts[2], { from: owner });
                assert.fail("Should not allow resetting the artwork pool address");
            } catch (error) {
                assert(error.message.includes("Address already set"), error.message);
            }
        });
    });

    describe("Minting and Halving Logic", () => {
        it("should mint tokens from the artwork pool", async () => {
            const tokensBefore = await angryInstance.totalSupply();
            const mintAmount = web3.utils.toBN(1000);

            await angryInstance.mint(artist, mintAmount, { from: artWorkPool });

            const tokensAfter = await angryInstance.totalSupply();
            assert(tokensAfter.eq(tokensBefore.add(mintAmount)), "Minting did not increase the total supply");
        });

        it("should fail to mint from an unauthorized address", async () => {
            try {
                await angryInstance.mint(artist, 1000, { from: unauthorized });
                assert.fail("Non-artwork pool address should not be able to mint");
            } catch (error) {
                assert(error.message.includes("Caller is not the art work pool"), error.message);
            }
        });

        it("should reduce tokensPerBlock after halving", async () => {
            const tokensBefore = await angryInstance.tokensPerBlock();
            const halvingInterval = await angryInstance.HALVING_BLOCK_INTERVAL();

            // Simulate blocks to reach halving interval
            for (let i = 0; i < halvingInterval.toNumber(); i++) {
                await angryInstance.mintArtWork(1, artist, `ipfs://artwork-${i}`, { from: artWorkPool });
            }

            const tokensAfter = await angryInstance.tokensPerBlock();
            assert(tokensAfter.lt(tokensBefore), "Halving did not reduce tokensPerBlock");
        });

        it("should maintain MIN_TOKENS_PER_BLOCK after multiple halvings", async () => {
            const minTokens = await angryInstance.MIN_TOKENS_PER_BLOCK();

            for (let i = 0; i < 10; i++) {
                await angryInstance.mintArtWork(1, artist, `ipfs://artwork-${i}`, { from: artWorkPool });
            }

            const tokensPerBlock = await angryInstance.tokensPerBlock();
            assert(tokensPerBlock.gte(minTokens), "tokensPerBlock fell below the minimum limit");
        });
    });

    describe("ArtWork Minting", () => {
        it("should mint artwork and emit ArtWorkMinted event", async () => {
            const fragmentId = 1;
            const contentUri = "ipfs://example-artwork";

            const tx = await angryInstance.mintArtWork(fragmentId, artist, contentUri, { from: artWorkPool });
            const event = tx.logs.find((log) => log.event === "ArtWorkMinted");

            assert(event, "ArtWorkMinted event not emitted");
            assert.equal(event.args.artist, artist, "Artist address mismatch in event");
            assert.equal(event.args.fragmentId, fragmentId, "Fragment ID mismatch in event");
            assert.equal(event.args.imageURI, contentUri, "Content URI mismatch in event");
        });

        it("should fail to mint artwork if not called by the artwork pool", async () => {
            try {
                await angryInstance.mintArtWork(1, artist, "ipfs://unauthorized-artwork", { from: unauthorized });
                assert.fail("Non-artwork pool address should not be able to mint artwork");
            } catch (error) {
                assert(error.message.includes("Caller is not the art work pool"), error.message);
            }
        });
    });
});