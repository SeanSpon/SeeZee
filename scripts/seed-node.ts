/**
 * Seed a WorkflowNode with generated API key
 * 
 * Usage:
 *   ts-node scripts/seed-node.ts --name "My Node" --type GIT_AGENT
 */

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

async function generateApiKey() {
  // Generate a random 32-byte secret
  const secret = randomBytes(32).toString("hex");
  
  // Generate a random key ID
  const apiKeyId = `node_${randomBytes(16).toString("hex")}`;
  
  // Hash the secret
  const apiKeyHash = await bcrypt.hash(secret, 10);
  
  // Return full key and components
  const fullKey = `${apiKeyId}.${secret}`;
  
  return { apiKeyId, apiKeyHash, fullKey };
}

async function main() {
  const args = process.argv.slice(2);
  
  let name = "Default Node";
  let type = "GIT_AGENT";
  
  // Parse args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name" && args[i + 1]) {
      name = args[i + 1];
      i++;
    }
    if (args[i] === "--type" && args[i + 1]) {
      type = args[i + 1];
      i++;
    }
  }

  console.log("🔐 Generating API key...");
  const { apiKeyId, apiKeyHash, fullKey } = await generateApiKey();

  console.log("💾 Creating node in database...");
  const node = await prisma.workflowNode.create({
    data: {
      name,
      type,
      status: "OFFLINE",
      apiKeyId,
      apiKeyHash,
      capabilities: {
        git: true,
        build: false,
        test: false,
      },
    },
  });

  console.log("\n✅ Node created successfully!\n");
  console.log("=".repeat(60));
  console.log(`Node ID: ${node.id}`);
  console.log(`Name: ${node.name}`);
  console.log(`Type: ${node.type}`);
  console.log("=".repeat(60));
  console.log("\n🔑 API Key (save this securely):\n");
  console.log(`   ${fullKey}\n`);
  console.log("=".repeat(60));
  console.log("\nAdd these to your .env.local:\n");
  console.log(`NODE_ID=${node.id}`);
  console.log(`NODE_API_KEY=${fullKey}`);
  console.log("\nThen run the worker:");
  console.log(`npm run worker:git-agent`);
  console.log("=".repeat(60));
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
