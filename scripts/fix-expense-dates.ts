import { db } from "../src/server/db";

async function main() {
  console.log("🔧 Fixing expense dates for timezone...");
  
  // Update Google Ads to be at noon UTC so it's definitely in February
  const googleAds = await db.businessExpense.findFirst({
    where: { name: "Google Ads" }
  });
  
  if (googleAds) {
    await db.businessExpense.update({
      where: { id: googleAds.id },
      data: {
        expenseDate: new Date("2026-02-01T12:00:00.000Z"),
        paidAt: new Date("2026-02-01T12:00:00.000Z"),
      }
    });
    console.log("✅ Updated Google Ads date to noon UTC");
  }
  
  console.log("\n✨ Done!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
