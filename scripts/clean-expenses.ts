/**
 * Clean up duplicate expenses
 * Removes all existing expenses and creates a clean set
 */

import { db } from "../src/server/db";

async function main() {
  console.log("🧹 Cleaning up expenses...");

  // Delete all existing expenses
  const deleted = await db.businessExpense.deleteMany({});
  console.log(`   Deleted ${deleted.count} existing expenses`);

  // Create a clean set of expenses based on your bank transactions
  // From your screenshots, you have these actual expenses:
  
  console.log("\n✨ Creating clean expense set...");

  // February 2026 expenses (current month)
  const febExpenses = [
    {
      name: "Google Ads",
      description: "Marketing and advertising",
      amount: 5339, // $53.39
      category: "MARKETING" as const,
      vendor: "Google",
      isRecurring: true,
      frequency: "monthly",
      expenseDate: new Date("2026-02-01"),
      paidAt: new Date("2026-02-01"),
    },
  ];

  // January 2026 expenses
  const janExpenses = [
    {
      name: "Cursor Usage Mid Jan",
      description: "Additional Cursor usage charges",
      amount: 21200, // $212.00
      category: "SOFTWARE" as const,
      vendor: "Cursor",
      isRecurring: false,
      frequency: null,
      expenseDate: new Date("2026-01-29"),
      paidAt: new Date("2026-01-29"),
    },
    {
      name: "Vercel Pro",
      description: "Hosting and deployment platform",
      amount: 4240, // $42.40
      category: "SOFTWARE" as const,
      vendor: "Vercel",
      isRecurring: true,
      frequency: "monthly",
      expenseDate: new Date("2026-01-19"),
      paidAt: new Date("2026-01-19"),
    },
    {
      name: "Cursor Pro+",
      description: "AI-powered code editor subscription",
      amount: 6360, // $63.60
      category: "SOFTWARE" as const,
      vendor: "Cursor",
      isRecurring: true,
      frequency: "monthly",
      expenseDate: new Date("2026-01-18"),
      paidAt: new Date("2026-01-18"),
    },
    {
      name: "Amazon Business Purchase",
      description: "Office supplies and equipment",
      amount: 71999, // $719.99
      category: "EQUIPMENT" as const,
      vendor: "Amazon",
      isRecurring: false,
      frequency: null,
      expenseDate: new Date("2026-01-16"),
      paidAt: new Date("2026-01-16"),
    },
    {
      name: "Squarespace",
      description: "Website hosting",
      amount: 1484, // $14.84
      category: "SOFTWARE" as const,
      vendor: "Squarespace",
      isRecurring: true,
      frequency: "monthly",
      expenseDate: new Date("2026-01-15"),
      paidAt: new Date("2026-01-15"),
    },
  ];

  const allExpenses = [...febExpenses, ...janExpenses];

  for (const expense of allExpenses) {
    const created = await db.businessExpense.create({
      data: {
        ...expense,
        status: "PAID",
      },
    });
    console.log(`   ✅ ${created.name} - $${(created.amount / 100).toFixed(2)} - ${created.expenseDate.toISOString().split('T')[0]}`);
  }

  // Calculate totals
  const feb2026Total = febExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const jan2026Total = janExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const recurringMonthly = allExpenses
    .filter(e => e.isRecurring)
    .reduce((sum, exp) => sum + exp.amount, 0);

  console.log("\n📊 Summary:");
  console.log(`   January 2026: $${(jan2026Total / 100).toFixed(2)}`);
  console.log(`   February 2026: $${(feb2026Total / 100).toFixed(2)}`);
  console.log(`   Monthly Recurring: $${(recurringMonthly / 100).toFixed(2)}`);
  console.log("\n✨ Done! Duplicates removed.");
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
