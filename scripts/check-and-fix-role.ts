import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "seanspm1007@gmail.com"; // Change this to your email
  
  console.log(`\n🔍 Checking user role for: ${email}\n`);
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    console.log("❌ User not found!");
    return;
  }

  console.log("✅ User found in database:");
  console.log(JSON.stringify(user, null, 2));
  
  // Update to CEO if not already
  if (user.role !== "CEO") {
    console.log("\n🔄 Updating user to CEO...");
    const updated = await prisma.user.update({
      where: { email },
      data: {
        role: "CEO",
      },
    });
    console.log("✅ Updated successfully!");
    console.log(JSON.stringify(updated, null, 2));
  } else {
    console.log("\n✅ User is already CEO!");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
