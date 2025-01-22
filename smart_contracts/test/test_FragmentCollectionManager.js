const FragmentCollectionManager = artifacts.require("FragmentCollectionManager");
const FragmentCollection = artifacts.require("FragmentCollection");
const zero_address = "0x0000000000000000000000000000000000000000";

contract("FragmentCollectionManager", (accounts) => {
    let fragmentCollectionManagerInstance;

    const [owner, angryContract, fragmentCreator, unauthorized] = accounts;
    const fragmentName = "Fragment Name";
    const fragmentSymbol = "FRAG";
    const zone = 1;
    const maxArtWorks = 5;
    const uri = "http://example.com";

    before(async () => {
        fragmentCollectionManagerInstance = await FragmentCollectionManager.deployed();
    });

    describe("Fragment creation", () => {
        it("should create a new fragment", async () => {
            const initialCounter = await fragmentCollectionManagerInstance.fragmentCounter();

            await fragmentCollectionManagerInstance.createFragment(
                fragmentName,
                fragmentSymbol,
                zone,
                maxArtWorks,
                uri,
                fragmentCreator,
                { from: owner }
            );

            const finalCounter = await fragmentCollectionManagerInstance.fragmentCounter();
            assert.equal(
                finalCounter.toNumber(),
                initialCounter.toNumber() + 1,
                "Fragment counter was not incremented correctly"
            );
        });

        it("should retrieve the fragment address", async () => {
            const fragmentId = await fragmentCollectionManagerInstance.fragmentCounter();
            const collectionAddress = await fragmentCollectionManagerInstance.getFragmentAddress(fragmentId);
            assert.notEqual(collectionAddress, zero_address, "Fragment address is invalid");
        });

        it("should fail to create a fragment if called by a non-owner", async () => {
            try {
                await fragmentCollectionManagerInstance.createFragment(
                    fragmentName,
                    fragmentSymbol,
                    zone,
                    maxArtWorks,
                    uri,
                    fragmentCreator,
                    { from: unauthorized }
                );
                assert.fail("Non-owner should not be able to create fragments");
            } catch (error) {
                assert(error.message.includes("Ownable: caller is not the owner"), error.message);
            }
        });
    });

    describe("Fragment interaction", () => {
        let fragmentId;

        before(async () => {
            fragmentId = await fragmentCollectionManagerInstance.fragmentCounter();
        });

        it("should retrieve the fragment creator", async () => {
            const creator = await fragmentCollectionManagerInstance.getFragmentCreator(fragmentId);
            assert.equal(creator, fragmentCreator, "Fragment creator address mismatch");
        });

        it("should confirm that a fragment is not full initially", async () => {
            const isFull = await fragmentCollectionManagerInstance.fragmentIsFull(fragmentId);
            assert(!isFull, "New fragment should not be marked as full");
        });

        it("should confirm that a fragment is full after emitting max artworks", async () => {
            const fragmentCollection = await FragmentCollection.at(
                await fragmentCollectionManagerInstance.getFragmentAddress(fragmentId)
            );

            for (let i = 0; i < maxArtWorks; i++) {
                await fragmentCollection.createNFTArt(fragmentCreator, `ipfs://artwork-${i}`, { from: owner });
            }

            const isFull = await fragmentCollectionManagerInstance.fragmentIsFull(fragmentId);
            assert(isFull, "Fragment should be marked as full after reaching max artworks");
        });
    });

    describe("Minting artworks", () => {
        let fragmentId;

        before(async () => {
            await fragmentCollectionManagerInstance.createFragment(
                fragmentName,
                fragmentSymbol,
                zone,
                maxArtWorks,
                uri,
                fragmentCreator,
                { from: owner }
            );
            fragmentId = await fragmentCollectionManagerInstance.fragmentCounter();
        });

        it("should mint an artwork and emit an event", async () => {
            const imageURI = "ipfs://example-artwork";
            const tx = await fragmentCollectionManagerInstance.mintArtWork(fragmentId, imageURI, { from: angryContract });

            const fragmentCollection = await FragmentCollection.at(
                await fragmentCollectionManagerInstance.getFragmentAddress(fragmentId)
            );

            const emittedArtworks = await fragmentCollection.emmitedArtWorks();
            assert.equal(emittedArtworks.toNumber(), 1, "Minted artwork count mismatch");

            const transferEvent = tx.logs.find((log) => log.event === "Transfer");
            assert(transferEvent, "Minting did not emit Transfer event");
        });

        it("should fail to mint artwork if caller is not ANGRY", async () => {
            try {
                await fragmentCollectionManagerInstance.mintArtWork(fragmentId, "ipfs://unauthorized-artwork", {
                    from: unauthorized,
                });
                assert.fail("Non-ANGRY contract should not be able to mint artworks");
            } catch (error) {
                assert(error.message.includes("Caller is not ANGRY contract"), error.message);
            }
        });

        it("should fail to mint artwork if fragment is full", async () => {
            const fragmentCollection = await FragmentCollection.at(
                await fragmentCollectionManagerInstance.getFragmentAddress(fragmentId)
            );

            for (let i = 0; i < maxArtWorks; i++) {
                await fragmentCollection.createNFTArt(fragmentCreator, `ipfs://artwork-${i}`, { from: owner });
            }

            try {
                await fragmentCollectionManagerInstance.mintArtWork(fragmentId, "ipfs://overflow-artwork", {
                    from: angryContract,
                });
                assert.fail("Should not allow minting when fragment is full");
            } catch (error) {
                assert(error.message.includes("Max variations reached"), error.message);
            }
        });
    });
});