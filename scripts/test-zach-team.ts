/**
 * Test Zach's Team Deployments
 * Run with: npx tsx scripts/test-zach-team.ts
 */

import "dotenv/config";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = "team_H5n6qhWhqnaVOtn3CxKOvhVG"; // Zach's team

async function testZachTeam() {
  if (!VERCEL_TOKEN) {
    console.error("❌ VERCEL_TOKEN not found");
    return;
  }

  const headers = {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
  };

  console.log("🔍 Fetching Zach's Team Data...\n");

  // Get projects
  console.log("📦 Projects in zach-robards-projects:");
  const projectsRes = await fetch(
    `https://api.vercel.com/v9/projects?teamId=${TEAM_ID}&limit=20`,
    { headers }
  );

  if (projectsRes.ok) {
    const data = await projectsRes.json();
    console.log(`Found ${data.projects?.length || 0} projects:\n`);
    data.projects?.forEach((p: any) => {
      console.log(`  ✅ ${p.name}`);
      console.log(`     Framework: ${p.framework || "None"}`);
      console.log(`     URL: https://vercel.com/zach-robards-projects/${p.name}`);
      console.log();
    });
  } else {
    console.error(`❌ Failed: ${projectsRes.status}`);
    return;
  }

  // Get deployments
  console.log("\n🚀 Recent Deployments:");
  const deploymentsRes = await fetch(
    `https://api.vercel.com/v6/deployments?teamId=${TEAM_ID}&limit=10`,
    { headers }
  );

  if (deploymentsRes.ok) {
    const data = await deploymentsRes.json();
    console.log(`Found ${data.deployments?.length || 0} deployments:\n`);
    data.deployments?.forEach((d: any, i: number) => {
      console.log(`  ${i + 1}. ${d.name}`);
      console.log(`     State: ${d.state}`);
      console.log(`     URL: https://${d.url}`);
      console.log(`     Created: ${new Date(d.createdAt).toLocaleString()}`);
      if (d.meta?.githubCommitRef) {
        console.log(`     Branch: ${d.meta.githubCommitRef}`);
      }
      console.log();
    });
  } else {
    console.error(`❌ Failed: ${deploymentsRes.status}`);
  }
}

testZachTeam().catch(console.error);
