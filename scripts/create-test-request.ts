/**
 * Create a test ExecutionRequest to trigger the worker
 * 
 * Usage:
 *   ts-node scripts/create-test-request.ts --todo <todoId> --repo <repoUrl>
 */

import { prisma } from "../src/lib/prisma";

async function main() {
  const args = process.argv.slice(2);
  
  let todoId: string | undefined;
  let repoUrl: string | undefined;
  
  // Parse args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--todo" && args[i + 1]) {
      todoId = args[i + 1];
      i++;
    }
    if (args[i] === "--repo" && args[i + 1]) {
      repoUrl = args[i + 1];
      i++;
    }
  }

  if (!todoId) {
    console.error("❌ --todo parameter required");
    console.log("\nUsage:");
    console.log('  ts-node scripts/create-test-request.ts --todo <todoId> --repo <repoUrl>');
    console.log("\nExample:");
    console.log('  ts-node scripts/create-test-request.ts --todo cm123abc --repo https://github.com/user/repo');
    process.exit(1);
  }

  if (!repoUrl) {
    console.error("❌ --repo parameter required");
    process.exit(1);
  }

  // Verify todo exists
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    select: { id: true, title: true },
  });

  if (!todo) {
    console.error(`❌ Todo not found: ${todoId}`);
    process.exit(1);
  }

  console.log(`📝 Creating request for todo: ${todo.title}`);

  // Create ExecutionRequest
  const request = await prisma.executionRequest.create({
    data: {
      todoId,
      repoUrl,
      branchName: `seezee/req-${Date.now()}`, // Temporary - will be replaced with proper ID
      priority: "MEDIUM",
      status: "QUEUED",
    },
  });

  // Update branchName with actual request ID
  const updated = await prisma.executionRequest.update({
    where: { id: request.id },
    data: {
      branchName: `seezee/req-${request.id}`,
    },
  });

  console.log("\n✅ ExecutionRequest created!\n");
  console.log("=".repeat(60));
  console.log(`Request ID: ${updated.id}`);
  console.log(`Todo: ${todo.title}`);
  console.log(`Repo: ${repoUrl}`);
  console.log(`Branch: ${updated.branchName}`);
  console.log(`Status: ${updated.status}`);
  console.log(`Priority: ${updated.priority}`);
  console.log("=".repeat(60));
  console.log("\nThe worker will pick this up on its next poll cycle.");
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
