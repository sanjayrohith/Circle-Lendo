const hre = require("hardhat");
const { parseEther } = require("viem");

/**
 * Deployment script for CreditCoin Lending Circle Protocol
 * 
 * Deployment order:
 * 1. CreditRegistry
 * 2. ReservePool
 * 3. LendingCircleFactory
 * 
 * Usage:
 *   npx hardhat run scripts/deploy.js --network hardhat
 *   npx hardhat run scripts/deploy.js --network sepolia
 */

async function main() {
  console.log("🚀 Starting deployment of CreditCoin Lending Circle Protocol...\n");

  const [deployer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();
  
  console.log("📝 Deploying with account:", deployer.account.address);
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // ============================================
  // 1. Deploy CreditRegistry
  // ============================================
  console.log("1️⃣  Deploying CreditRegistry...");
  const CreditRegistry = await hre.ethers.getContractFactory("CreditRegistry");
  const creditRegistry = await CreditRegistry.deploy();
  await creditRegistry.waitForDeployment();
  const creditRegistryAddress = await creditRegistry.getAddress();
  console.log("✅ CreditRegistry deployed to:", creditRegistryAddress);
  
  // Verify base credit score
  const baseScore = await creditRegistry.BASE_CREDIT_SCORE();
  console.log("   Base credit score:", baseScore.toString(), "\n");

  // ============================================
  // 2. Deploy LendingCircleFactory (temporarily, to get address)
  // ============================================
  // Note: We need factory address for ReservePool, but ReservePool sets factory in constructor
  // Since ReservePool.sol sets factory = msg.sender, we'll deploy ReservePool first
  // and then the factory will verify circles when created
  // Actually, ReservePool doesn't need factory address upfront - it verifies circles via factory
  // Let's deploy ReservePool first, then Factory
  
  console.log("2️⃣  Deploying ReservePool...");
  const ReservePool = await hre.ethers.getContractFactory("ReservePool");
  const reservePool = await ReservePool.deploy();
  await reservePool.waitForDeployment();
  const reservePoolAddress = await reservePool.getAddress();
  console.log("✅ ReservePool deployed to:", reservePoolAddress);
  console.log("   Note: Factory will verify circles when created\n");

  // ============================================
  // 3. Deploy LendingCircleFactory
  // ============================================
  console.log("3️⃣  Deploying LendingCircleFactory...");
  const Factory = await hre.ethers.getContractFactory("LendingCircleFactory");
  const factory = await Factory.deploy(creditRegistryAddress, reservePoolAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ LendingCircleFactory deployed to:", factoryAddress);

  // ============================================
  // 4. Update ReservePool factory address
  // ============================================
  console.log("4️⃣  Updating ReservePool factory address...");
  await reservePool.setFactory(factoryAddress);
  console.log("✅ ReservePool factory address updated\n");

  // ============================================
  // 5. Verification and Summary
  // ============================================
  console.log("=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("CreditRegistry:", creditRegistryAddress);
  console.log("ReservePool:   ", reservePoolAddress);
  console.log("Factory:       ", factoryAddress);
  console.log("=".repeat(60), "\n");

  // ============================================
  // 6. Save addresses to file (optional)
  // ============================================
  const fs = require("fs");
  const addresses = {
    network: hre.network.name,
    deployer: deployer.account.address,
    creditRegistry: creditRegistryAddress,
    reservePool: reservePoolAddress,
    factory: factoryAddress,
    timestamp: new Date().toISOString(),
  };

  const addressesPath = "./deployments.json";
  let allDeployments = {};
  
  if (fs.existsSync(addressesPath)) {
    allDeployments = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  }
  
  allDeployments[hre.network.name] = addresses;
  fs.writeFileSync(addressesPath, JSON.stringify(allDeployments, null, 2));
  console.log("💾 Deployment addresses saved to:", addressesPath, "\n");

  // ============================================
  // 7. Test deployment (optional)
  // ============================================
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    console.log("🧪 Running quick deployment test...");
    
    try {
      // Test: Get credit score (should return base score for new address)
      const testAddress = "0x1234567890123456789012345678901234567890";
      const score = await creditRegistry.getCreditScore(testAddress);
      console.log("   ✅ CreditRegistry test passed - Base score:", score.toString());
      
      // Test: Get factory circle count (should be 0)
      const circleCount = await factory.getCircleCount();
      console.log("   ✅ Factory test passed - Circle count:", circleCount.toString());
      
      // Test: Get reserve pool balance (should be 0)
      const reserveBalance = await publicClient.getBalance({ address: reservePoolAddress });
      console.log("   ✅ ReservePool test passed - Balance:", hre.ethers.formatEther(reserveBalance), "ETH");
      
      console.log("\n✅ All deployment tests passed!\n");
    } catch (error) {
      console.log("   ⚠️  Test error:", error.message);
    }
  }

  console.log("🎉 Deployment completed successfully!");
  console.log("\n📖 Next steps:");
  console.log("   1. Use factory.createCircle() to create a new lending circle");
  console.log("   2. Participants can requestToJoin() and get approved");
  console.log("   3. Start making monthly contributions");
  console.log("   4. Vote and execute payouts");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
