const FragmentCollection = artifacts.require("FragmentCollection");

contract("FragmentCollection", (accounts) => {
    let fragmentCollectionInstance;

    const [owner, recipient, unauthorized] = accounts;
    const maxArtWorks = 5;
    const tokenBaseURI = "fragmentURI";

    before(async () => {
        fragmentCollectionInstance = await FragmentCollection.new(
            "TestFragment",
            "TFRAG",
            1, // Zone
            maxArtWorks,
            tokenBaseURI,
            owner
        );
    });

    describe("Minting NFT Artworks", () => {
        it("should create a new NFT artwork and verify its token URI", async () => {
            await fragmentCollectionInstance.createNFTArt(recipient, "ipfs://example-artwork-1", { from: owner });
            const tokenURI = await fragmentCollectionInstance.tokenURI(0);
            assert.equal(tokenURI, "ipfs://example-artwork-1", "Token URI mismatch for minted artwork");
        });

        it("should assign the new NFT to the correct recipient", async () => {
            const tokenId = await fragmentCollectionInstance.createNFTArt.call(recipient, "ipfs://example-artwork-2", {
                from: owner,
            });
            await fragmentCollectionInstance.createNFTArt(recipient, "ipfs://example-artwork-2", { from: owner });

            const tokenOwner = await fragmentCollectionInstance.ownerOf(tokenId);
            assert.equal(tokenOwner, recipient, "Token was not assigned to the correct recipient");
        });

        it("should fail to create a new NFT if the caller is not the owner", async () => {
            try {
                await fragmentCollectionInstance.createNFTArt(recipient, "ipfs://unauthorized-artwork", {
                    from: unauthorized,
                });
                assert.fail("Non-owner should not be able to create NFTs");
            } catch (error) {
                assert(error.message.includes("Ownable: caller is not the owner"), "Unexpected error message");
            }
        });

        it("should fail to create a new NFT if the collection is full", async () => {
            for (let i = 2; i < maxArtWorks; i++) {
                await fragmentCollectionInstance.createNFTArt(recipient, `ipfs://example-artwork-${i}`, { from: owner });
            }

            try {
                await fragmentCollectionInstance.createNFTArt(recipient, "ipfs://overflow-artwork", { from: owner });
                assert.fail("Should not allow creating NFT when collection is full");
            } catch (error) {
                assert(error.message.includes("Maximum art works reached"), "Error message does not match");
            }
        });

        it("should verify that the emitted artworks counter is incremented correctly", async () => {
            const emittedBefore = await fragmentCollectionInstance.emmitedArtWorks();
            await fragmentCollectionInstance.createNFTArt(recipient, "ipfs://example-counter", { from: owner });
            const emittedAfter = await fragmentCollectionInstance.emmitedArtWorks();
            assert.equal(
                emittedAfter.toNumber(),
                emittedBefore.toNumber() + 1,
                "Emitted artworks counter was not incremented correctly"
            );
        });

        it("should fail to retrieve token URI for a non-existent token", async () => {
            try {
                await fragmentCollectionInstance.tokenURI(100);
                assert.fail("Should not allow retrieving token URI for a non-existent token");
            } catch (error) {
                assert(error.message.includes("ERC721: invalid token ID"), "Unexpected error message");
            }
        });
    });

    describe("Validation methods", () => {
        it("should return false if the collection is not full", async () => {
            const newFragment = await FragmentCollection.new(
                "TestFragment2",
                "TFRAG2",
                1, // Zone
                maxArtWorks,
                tokenBaseURI,
                owner
            );

            const isFull = await newFragment.isFull();
            assert.equal(isFull, false, "Collection should not be full initially");
        });

        it("should return true when the collection is full", async () => {
            const fragmentCollection = await FragmentCollection.new(
                "TestFragment3",
                "TFRAG3",
                1, // Zone
                maxArtWorks,
                tokenBaseURI,
                owner
            );

            for (let i = 0; i < maxArtWorks; i++) {
                await fragmentCollection.createNFTArt(recipient, `ipfs://full-artwork-${i}`, { from: owner });
            }

            const isFull = await fragmentCollection.isFull();
            assert.equal(isFull, true, "Collection should be full");
        });

        it("should correctly report maxArtWorks and emmitedArtWorks", async () => {
            const max = await fragmentCollectionInstance.maxArtWorks();
            const emitted = await fragmentCollectionInstance.emmitedArtWorks();
            assert.equal(max.toNumber(), maxArtWorks, "maxArtWorks does not match expected value");
            assert(emitted.lte(max), "emmitedArtWorks exceeds maxArtWorks");
        });
    });

    describe("Security and edge cases", () => {
        it("should prevent minting when maxArtWorks is set to zero", async () => {
            const fragmentCollection = await FragmentCollection.new(
                "TestFragment4",
                "TFRAG4",
                1, // Zone
                0, // maxArtWorks
                tokenBaseURI,
                owner
            );

            try {
                await fragmentCollection.createNFTArt(recipient, "ipfs://no-mint-possible", { from: owner });
                assert.fail("Should not allow minting when maxArtWorks is zero");
            } catch (error) {
                assert(error.message.includes("Maximum art works reached"), "Unexpected error message");
            }
        });

        it("should prevent operations on invalid token IDs", async () => {
            try {
                await fragmentCollectionInstance.ownerOf(999);
                assert.fail("Should not allow querying non-existent token IDs");
            } catch (error) {
                assert(error.message.includes("ERC721: invalid token ID"), "Unexpected error message");
            }
        });
    });
});