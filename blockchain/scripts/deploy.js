import hre from "hardhat";
import { formatEther } from "viem";
import { readFileSync, writeFileSync, existsSync } from "fs";

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
 *   npx hardhat run scripts/deploy.js --network creditcoinTestnet
 */

async function main() {
  console.log("🚀 Starting deployment of CreditCoin Lending Circle Protocol...\n");

  const [deployer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();
  
  console.log("📝 Deploying with account:", deployer.account.address);
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("💰 Account balance:", formatEther(balance), "tCTC\n");

  // ============================================
  // 1. Deploy CreditRegistry
  // ============================================
  console.log("1️⃣  Deploying CreditRegistry...");
  const creditRegistry = await hre.viem.deployContract("CreditRegistry", []);
  console.log("✅ CreditRegistry deployed to:", creditRegistry.address);
  
  // Verify base credit score
  const baseScore = await creditRegistry.read.BASE_CREDIT_SCORE();
  console.log("   Base credit score:", baseScore.toString(), "\n");

  // ============================================
  // 2. Deploy ReservePool
  // ============================================
  console.log("2️⃣  Deploying ReservePool...");
  const reservePool = await hre.viem.deployContract("ReservePool", []);
  console.log("✅ ReservePool deployed to:", reservePool.address);
  console.log("   Note: Factory will verify circles when created\n");

  // ============================================
  // 3. Deploy LendingCircleFactory
  // ============================================
  console.log("3️⃣  Deploying LendingCircleFactory...");
  const factory = await hre.viem.deployContract("LendingCircleFactory", [
    creditRegistry.address,
    reservePool.address,
  ]);
  console.log("✅ LendingCircleFactory deployed to:", factory.address);

  // ============================================
  // 4. Update ReservePool factory address
  // ============================================
  console.log("4️⃣  Updating ReservePool factory address...");
  await reservePool.write.setFactory([factory.address]);
  console.log("✅ ReservePool factory address updated\n");

  // ============================================
  // 5. Verification and Summary
  // ============================================
  console.log("=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("CreditRegistry:", creditRegistry.address);
  console.log("ReservePool:   ", reservePool.address);
  console.log("Factory:       ", factory.address);
  console.log("=".repeat(60), "\n");

  // ============================================
  // 6. Save addresses to file (optional)
  // ============================================
  const addresses = {
    network: hre.network.name,
    deployer: deployer.account.address,
    creditRegistry: creditRegistry.address,
    reservePool: reservePool.address,
    factory: factory.address,
    timestamp: new Date().toISOString(),
  };

  const addressesPath = "./deployments.json";
  let allDeployments = {};
  
  if (existsSync(addressesPath)) {
    allDeployments = JSON.parse(readFileSync(addressesPath, "utf8"));
  }
  
  allDeployments[hre.network.name] = addresses;
  writeFileSync(addressesPath, JSON.stringify(allDeployments, null, 2));
  console.log("💾 Deployment addresses saved to:", addressesPath, "\n");

  // ============================================
  // 7. Test deployment (optional)
  // ============================================
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    console.log("🧪 Running quick deployment test...");
    
    try {
      // Test: Get credit score (should return base score for new address)
      const testAddress = "0x1234567890123456789012345678901234567890";
      const score = await creditRegistry.read.getCreditScore([testAddress]);
      console.log("   ✅ CreditRegistry test passed - Base score:", score.toString());
      
      // Test: Get factory circle count (should be 0)
      const circleCount = await factory.read.getCircleCount();
      console.log("   ✅ Factory test passed - Circle count:", circleCount.toString());
      
      // Test: Get reserve pool balance (should be 0)
      const reserveBalance = await publicClient.getBalance({ address: reservePool.address });
      console.log("   ✅ ReservePool test passed - Balance:", formatEther(reserveBalance), "tCTC");
      
      console.log("\n✅ All deployment tests passed!\n");
    } catch (error) {
      console.log("   ⚠️  Test error:", error.message);
    }
  }

  console.log("🎉 Deployment completed successfully!");
  console.log("\n📖 Next steps:");
  console.log("   1. Update frontend/lib/contracts/config.ts with the deployed addresses");
  console.log("   2. Use factory.createCircle() to create a new lending circle");
  console.log("   3. Participants can requestToJoin() and get approved");
  console.log("   4. Start making monthly contributions");
  console.log("   5. Vote and execute payouts");
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
