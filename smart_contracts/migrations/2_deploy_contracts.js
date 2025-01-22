const ANGRY = artifacts.require("ANGRY");
const FragmentCollectionManager = artifacts.require("FragmentCollectionManager");
const ArtWorkPoolManager = artifacts.require("ArtWorkPoolManager");
const FragmentCollection = artifacts.require("FragmentCollection");
const env = process.env.NODE_ENV || "test";

module.exports = async function (deployer) {
  // Deploy ANGRY contract
  await deployer.deploy(ANGRY);
  const angryInstance = await ANGRY.deployed();
  
  // Deploy FragmentCollectionManager contract with ANGRY address
  await deployer.deploy(FragmentCollectionManager, angryInstance.address);
  const fragmentCollectionManagerInstance = await FragmentCollectionManager.deployed();
  
  // Deploy ArtWorkPoolManager contract with ANGRY address
  await deployer.deploy(ArtWorkPoolManager, angryInstance.address, fragmentCollectionManagerInstance.address);
  
  // Set FragmentCollectionManager contract address in ANGRY contract
  await angryInstance.setFragmentCollectionManagerAddress(FragmentCollectionManager.address);

  // Set ArtWorkPoolManager contract address in ANGRY contract
  await angryInstance.setArtWorkPoolAddress(ArtWorkPoolManager.address);

  // ONLY FOR TESTING
  // if (env === "test") {
  await deployer.deploy(FragmentCollection, "Fragment Collection NTFS", "SC", 1, 20, "http://...", fragmentCollectionManagerInstance.address);
  // }
};
