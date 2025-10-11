/**
 * Normalize user roles: migrate accountType logic into role field
 * Run BEFORE dropping accountType column
 */
import { prisma } from "../src/lib/prisma";

async function run() {
  console.log("🔄 Starting role normalization...\n");

  const users = await prisma.user.findMany({
    select: { 
      id: true, 
      email: true,
      role: true, 
      accountType: true 
    },
  });

  console.log(`Found ${users.length} users to process\n`);

  let updated = 0;
  for (const u of users) {
    let nextRole = u.role ?? "CLIENT";
    const acct = (u.accountType || "").toUpperCase();

    // Precedence rules:
    // 1. If role is already CEO or ADMIN, keep it
    // 2. Else if accountType is STAFF, set role to STAFF
    // 3. Else if accountType is CLIENT, set role to CLIENT (which maps to USER in new schema)
    
    if (nextRole === "CEO" || nextRole === "ADMIN") {
      // Keep existing admin roles
      console.log(`  ✅ ${u.email}: Already ${nextRole}, keeping it`);
    } else if (acct === "CEO") {
      nextRole = "CEO";
      console.log(`  🔄 ${u.email}: accountType=CEO → role=CEO`);
      updated++;
    } else if (acct === "ADMIN") {
      nextRole = "ADMIN";
      console.log(`  🔄 ${u.email}: accountType=ADMIN → role=ADMIN`);
      updated++;
    } else if (acct === "STAFF") {
      // You have STAFF role in your enum, so use it
      nextRole = "STAFF";
      console.log(`  🔄 ${u.email}: accountType=STAFF → role=STAFF`);
      updated++;
    } else if (acct === "CLIENT" || !acct) {
      // Default to CLIENT for regular users
      nextRole = "CLIENT";
      if (u.role !== "CLIENT") {
        console.log(`  🔄 ${u.email}: accountType=CLIENT → role=CLIENT`);
        updated++;
      } else {
        console.log(`  ✅ ${u.email}: Already CLIENT`);
      }
    }

    // Update the user's role
    await prisma.user.update({ 
      where: { id: u.id }, 
      data: { role: nextRole as any } 
    });
  }

  console.log(`\n✅ Normalized ${users.length} users (${updated} updated)`);
  console.log("📋 Safe to drop accountType column now");
}

run()
  .then(() => process.exit(0))
  .catch((e) => { 
    console.error("❌ Error:", e); 
    process.exit(1); 
  });
