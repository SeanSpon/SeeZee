import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("\n🔍 SYSTEM STATE CHECK\n");
  console.log("=" .repeat(60));

  // Check Nodes
  const nodes = await prisma.workflowNode.findMany({
    include: {
      _count: {
        select: {
          executionRuns: true,
          claimedRequests: true,
        },
      },
    },
  });
  
  console.log(`\n📦 Workflow Nodes: ${nodes.length}`);
  if (nodes.length === 0) {
    console.log("   ⚠️  No nodes found! Run: npm run seed:node");
  } else {
    nodes.forEach((n) => {
      console.log(
        `   - ${n.name} (${n.status}) | ${(n._count as any).executionRuns || 0} runs | ${(n._count as any).claimedRequests || 0} claimed | Last seen: ${n.lastHeartbeatAt ? new Date(n.lastHeartbeatAt).toLocaleTimeString() : "never"}`
      );
    });
  }

  // Check ExecutionRequests
  const requests = await prisma.executionRequest.findMany({
    include: {
      todo: {
        select: {
          title: true,
        },
      },
      targetNode: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });
  
  console.log(`\n📋 Execution Requests: ${requests.length}`);
  if (requests.length === 0) {
    console.log("   ℹ️  No execution requests in database");
    console.log("   💡 Create one by clicking 'Dispatch to Bus' on a task");
  } else {
    const byStatus = requests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`   Status breakdown:`);
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });
    
    console.log(`\n   Recent requests:`);
    requests.slice(0, 5).forEach((r) => {
      console.log(
        `     - ${r.todo?.title || "No title"} (${r.status}) | Priority: ${r.priority} | Node: ${r.targetNode?.name || "any"}`
      );
    });
  }

  // Check ExecutionRuns
  const runs = await prisma.executionRun.findMany({
    include: {
      node: {
        select: {
          name: true,
        },
      },
      request: {
        include: {
          todo: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
    take: 10,
  });
  
  console.log(`\n🏃 Recent Execution Runs: ${runs.length}`);
  if (runs.length === 0) {
    console.log("   ℹ️  No runs yet - worker hasn't claimed any work");
  } else {
    runs.forEach((r) => {
      const title = r.request?.todo?.title || r.branchName || "No title";
      const elapsed = r.completedAt
        ? `Completed in ${Math.round((new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime()) / 1000)}s`
        : `Running for ${Math.round((Date.now() - new Date(r.startedAt).getTime()) / 1000)}s`;
      console.log(
        `   - ${title} (${r.status}) | ${r.node.name} | ${elapsed}`
      );
      if (r.prUrl) {
        console.log(`     PR: ${r.prUrl}`);
      }
    });
  }

  // Check GitHub Repos
  const repos = await prisma.project.findMany({
    where: {
      githubRepo: {
        not: null,
      },
    },
    select: {
      name: true,
      githubRepo: true,
      _count: {
        select: {
          todos: true,
        },
      },
    },
  });
  
  console.log(`\n🏢 Projects with GitHub Repos: ${repos.length}`);
  if (repos.length === 0) {
    console.log("   ⚠️  No projects have GitHub repos configured");
    console.log("   💡 Add a githubRepo field to a project to see it on the map");
  } else {
    repos.forEach((p) => {
      console.log(`   - ${p.name} | ${p._count.todos} tasks | ${p.githubRepo}`);
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ System state check complete\n");

  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
