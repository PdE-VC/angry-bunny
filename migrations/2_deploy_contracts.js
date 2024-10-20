const ABAC = artifacts.require("ABAC");
const PatreonManager = artifacts.require("PatreonManager");
const AreaCollectionManager = artifacts.require("AreaCollectionManager");
const ArtWorkPoolManager = artifacts.require("ArtWorkPoolManager");
const AreaCollection = artifacts.require("AreaCollection");
const env = process.env.NODE_ENV || "test";

module.exports = async function (deployer) {
  // Deploy ABAC contract
  await deployer.deploy(ABAC);
  const abacInstance = await ABAC.deployed();
  
  // Deploy PatreonManager contract
  await deployer.deploy(PatreonManager, "Patreon Manager NTFS", "PM", abacInstance.address);
  const patreonManagerInstance = await PatreonManager.deployed();
  
  // Deploy AreaCollectionManager contract with ABAC address
  await deployer.deploy(AreaCollectionManager, abacInstance.address);
  const areaCollectionManagerInstance = await AreaCollectionManager.deployed();
  
  // Deploy ArtWorkPoolManager contract with ABAC address
  await deployer.deploy(ArtWorkPoolManager, abacInstance.address, areaCollectionManagerInstance.address);
  
  // Set AreaCollectionManager contract address in ABAC contract
  await abacInstance.setAreaCollectionManagerAddress(AreaCollectionManager.address);

  // Set PatreonManager contract address in ABAC contract
  await abacInstance.setPatreonManagerAddress(PatreonManager.address);

  // Set ArtWorkPoolManager contract address in ABAC contract
  await abacInstance.setArtWorkPoolAddress(ArtWorkPoolManager.address);

  // ONLY FOR TESTING
  if (env === "test") {
    await deployer.deploy(AreaCollection, "Area Collection NTFS", "SC", 1, 20, "http://...", areaCollectionManagerInstance.address);
  }
};
