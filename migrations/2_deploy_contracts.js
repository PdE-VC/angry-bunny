const ABAC = artifacts.require("ABAC");
const PatreonManager = artifacts.require("PatreonManager");
const SeedCollectionManager = artifacts.require("SeedCollectionManager");
const VariationPoolManager = artifacts.require("VariationPoolManager");

module.exports = async function (deployer) {
  // Deploy PatreonManager contract
  await deployer.deploy(PatreonManager, "Patreon Manager NTFS", "PM");
  const patreonManagerInstance = await PatreonManager.deployed();
  
  // Deploy ABAC contract
  await deployer.deploy(ABAC, patreonManagerInstance.address);
  const abacInstance = await ABAC.deployed();
  
  // Deploy SeedCollectionManager contract with ABAC address
  await deployer.deploy(SeedCollectionManager, abacInstance.address);
  const seedCollectionManagerInstance = await SeedCollectionManager.deployed();
  
  // Deploy VariationPoolManager contract with ABAC address
  await deployer.deploy(VariationPoolManager, abacInstance.address, seedCollectionManagerInstance.address);
  
  // Set SeedCollectionManager contract address in ABAC contract
  await abacInstance.setCollectionManagerAddress(SeedCollectionManager.address);

  // Set VariationPoolManager contract address in ABAC contract
  await abacInstance.setVariationPoolAddress(VariationPoolManager.address);
};
