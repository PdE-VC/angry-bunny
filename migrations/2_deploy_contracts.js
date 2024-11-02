const ANGRY = artifacts.require("ANGRY");
const PatreonManager = artifacts.require("PatreonManager");
const AreaCollectionManager = artifacts.require("AreaCollectionManager");
const ArtWorkPoolManager = artifacts.require("ArtWorkPoolManager");
const AreaCollection = artifacts.require("AreaCollection");
const env = process.env.NODE_ENV || "test";

module.exports = async function (deployer) {
  // Deploy ANGRY contract
  await deployer.deploy(ANGRY);
  const angryInstance = await ANGRY.deployed();
  
  // Deploy PatreonManager contract
  await deployer.deploy(PatreonManager, "Patreon Manager NTFS", "PM", angryInstance.address);
  const patreonManagerInstance = await PatreonManager.deployed();
  
  // Deploy AreaCollectionManager contract with ANGRY address
  await deployer.deploy(AreaCollectionManager, angryInstance.address);
  const areaCollectionManagerInstance = await AreaCollectionManager.deployed();
  
  // Deploy ArtWorkPoolManager contract with ANGRY address
  await deployer.deploy(ArtWorkPoolManager, angryInstance.address, areaCollectionManagerInstance.address);
  
  // Set AreaCollectionManager contract address in ANGRY contract
  await angryInstance.setAreaCollectionManagerAddress(AreaCollectionManager.address);

  // Set PatreonManager contract address in ANGRY contract
  await angryInstance.setPatreonManagerAddress(PatreonManager.address);

  // Set ArtWorkPoolManager contract address in ANGRY contract
  await angryInstance.setArtWorkPoolAddress(ArtWorkPoolManager.address);

  // ONLY FOR TESTING
  if (env === "test") {
    await deployer.deploy(AreaCollection, "Area Collection NTFS", "SC", 1, 20, "http://...", areaCollectionManagerInstance.address);
  }
};
