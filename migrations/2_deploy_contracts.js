const ABAC = artifacts.require("ABAC");
const PatreonManager = artifacts.require("PatreonManager");
const SeedCollectionManager = artifacts.require("SeedCollectionManager");
const VariationPoolManager = artifacts.require("VariationPoolManager");
const SeedCollection = artifacts.require("SeedCollection");
const env = process.env.NODE_ENV || "test";

module.exports = async function (deployer) {
  // Deploy ABAC contract
  await deployer.deploy(ABAC);
  const abacInstance = await ABAC.deployed();
  
  // Deploy PatreonManager contract
  await deployer.deploy(PatreonManager, "Patreon Manager NTFS", "PM", abacInstance.address);
  const patreonManagerInstance = await PatreonManager.deployed();
  
  // Deploy SeedCollectionManager contract with ABAC address
  await deployer.deploy(SeedCollectionManager, abacInstance.address);
  const seedCollectionManagerInstance = await SeedCollectionManager.deployed();
  
  // Deploy VariationPoolManager contract with ABAC address
  await deployer.deploy(VariationPoolManager, abacInstance.address, seedCollectionManagerInstance.address);
  
  // Set SeedCollectionManager contract address in ABAC contract
  await abacInstance.setCollectionManagerAddress(SeedCollectionManager.address);

  // Set PatreonManager contract address in ABAC contract
  await abacInstance.setPatreonManagerAddress(PatreonManager.address);

  // Set VariationPoolManager contract address in ABAC contract
  await abacInstance.setVariationPoolAddress(VariationPoolManager.address);

  // ONLY FOR TESTING
  if (env === "test") {
    await deployer.deploy(SeedCollection, "Seed Collection NTFS", "SC", 1, 20, 1, "http://...", seedCollectionManagerInstance.address);
  }
};
