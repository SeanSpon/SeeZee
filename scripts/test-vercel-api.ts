/**
 * Test Vercel API Connection
 * Run with: npx tsx scripts/test-vercel-api.ts
 */

import "dotenv/config";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

async function testVercelAPI() {
  if (!VERCEL_TOKEN) {
    console.error("❌ VERCEL_TOKEN not found in .env");
    return;
  }

  console.log("🔍 Testing Vercel API...\n");
  console.log(`Token: ${VERCEL_TOKEN.substring(0, 10)}...`);
  console.log(`Team ID: ${VERCEL_TEAM_ID || "Not set"}\n`);

  const headers = {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
  };

  // Test 1: Get user info
  console.log("📋 Test 1: Get User Info");
  try {
    const userRes = await fetch("https://api.vercel.com/v2/user", { headers });
    if (userRes.ok) {
      const userData = await userRes.json();
      console.log("✅ User authenticated:");
      console.log(`   Name: ${userData.user?.name || userData.name}`);
      console.log(`   Username: ${userData.user?.username || userData.username}`);
      console.log(`   Email: ${userData.user?.email || userData.email}\n`);
    } else {
      console.error(`❌ Failed: ${userRes.status} ${userRes.statusText}`);
      const error = await userRes.text();
      console.error(`   Error: ${error}\n`);
      return;
    }
  } catch (error) {
    console.error("❌ Network error:", error);
    return;
  }

  // Test 2: Get teams
  console.log("📋 Test 2: Get Teams");
  try {
    const teamsRes = await fetch("https://api.vercel.com/v2/teams", { headers });
    if (teamsRes.ok) {
      const teamsData = await teamsRes.json();
      if (teamsData.teams && teamsData.teams.length > 0) {
        console.log(`✅ Found ${teamsData.teams.length} team(s):`);
        teamsData.teams.forEach((team: any) => {
          console.log(`   - ${team.name} (ID: ${team.id})`);
          console.log(`     Slug: ${team.slug}`);
        });
        console.log();
      } else {
        console.log("ℹ️  No teams found (personal account)\n");
      }
    } else {
      console.error(`❌ Failed: ${teamsRes.status} ${teamsRes.statusText}\n`);
    }
  } catch (error) {
    console.error("❌ Error:", error, "\n");
  }

  // Test 3: Get projects (without team ID)
  console.log("📋 Test 3: Get Projects (Personal Account)");
  try {
    const projectsRes = await fetch(
      "https://api.vercel.com/v9/projects?limit=5",
      { headers }
    );
    if (projectsRes.ok) {
      const projectsData = await projectsRes.json();
      console.log(`✅ Found ${projectsData.projects?.length || 0} project(s):`);
      projectsData.projects?.forEach((project: any) => {
        console.log(`   - ${project.name}`);
        console.log(`     Framework: ${project.framework || "None"}`);
        console.log(`     Link: https://vercel.com/${project.accountId}/${project.name}`);
      });
      console.log();
    } else {
      console.error(`❌ Failed: ${projectsRes.status} ${projectsRes.statusText}\n`);
    }
  } catch (error) {
    console.error("❌ Error:", error, "\n");
  }

  // Test 4: Get deployments (without team ID)
  console.log("📋 Test 4: Get Deployments (Personal Account)");
  try {
    const deploymentsRes = await fetch(
      "https://api.vercel.com/v6/deployments?limit=5",
      { headers }
    );
    if (deploymentsRes.ok) {
      const deploymentsData = await deploymentsRes.json();
      console.log(`✅ Found ${deploymentsData.deployments?.length || 0} deployment(s):`);
      deploymentsData.deployments?.forEach((deployment: any) => {
        console.log(`   - ${deployment.name}`);
        console.log(`     State: ${deployment.state}`);
        console.log(`     URL: https://${deployment.url}`);
        console.log(`     Created: ${new Date(deployment.createdAt).toLocaleString()}`);
      });
      console.log();
    } else {
      console.error(`❌ Failed: ${deploymentsRes.status} ${deploymentsRes.statusText}\n`);
    }
  } catch (error) {
    console.error("❌ Error:", error, "\n");
  }

  // Test 5: Try with team ID if set
  if (VERCEL_TEAM_ID) {
    console.log("📋 Test 5: Get Deployments (With Team ID)");
    try {
      const deploymentsRes = await fetch(
        `https://api.vercel.com/v6/deployments?limit=5&teamId=${VERCEL_TEAM_ID}`,
        { headers }
      );
      if (deploymentsRes.ok) {
        const deploymentsData = await deploymentsRes.json();
        console.log(`✅ Found ${deploymentsData.deployments?.length || 0} deployment(s) with team ID`);
        console.log();
      } else {
        console.error(`❌ Failed with team ID: ${deploymentsRes.status} ${deploymentsRes.statusText}`);
        const error = await deploymentsRes.text();
        console.error(`   Error: ${error}`);
        console.log("\n⚠️  Your VERCEL_TEAM_ID might be incorrect. Try removing it from .env\n");
      }
    } catch (error) {
      console.error("❌ Error:", error, "\n");
    }
  }

  console.log("✅ Testing complete!");
  console.log("\n💡 Recommendations:");
  console.log("   1. If you see projects/deployments in Test 3/4, your token works!");
  console.log("   2. If Test 5 fails, remove or fix VERCEL_TEAM_ID in .env");
  console.log("   3. Restart your dev server after any .env changes");
}

testVercelAPI().catch(console.error);
