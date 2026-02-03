/**
 * Seed Business Expenses
 * Populates the BusinessExpense table with actual business expenses
 * Run with: npx tsx scripts/seed-business-expenses.ts
 */

import { db } from "../src/server/db";

async function main() {
  console.log("🌱 Seeding business expenses...");

  // Define your recurring monthly expenses
  const recurringExpenses = [
    {
      name: "Cursor Pro+",
      description: "AI-powered code editor subscription",
      amount: 6400, // $64.00 in cents
      category: "SOFTWARE" as const,
      vendor: "Cursor",
      isRecurring: true,
      frequency: "monthly",
      expenseDate: new Date("2026-01-15"),
    },
    {
      name: "Vercel Pro",
      description: "Hosting and deployment platform",
      amount: 4240, // $42.40 in cents
      category: "SOFTWARE" as const,
      vendor: "Vercel",
      isRecurring: true,
      frequency: "monthly",
      expenseDate: new Date("2026-01-19"),
    },
    {
      name: "Google Ads",
      description: "Marketing and advertising",
      amount: 5339, // $53.39 average
      category: "MARKETING" as const,
      vendor: "Google",
      isRecurring: true,
      frequency: "monthly",
      expenseDate: new Date("2026-02-01"),
    },
    {
      name: "Squarespace",
      description: "Website hosting",
      amount: 1484, // $14.84 in cents
      category: "SOFTWARE" as const,
      vendor: "Squarespace",
      isRecurring: true,
      frequency: "monthly",
      expenseDate: new Date("2026-01-15"),
    },
  ];

  // One-time expenses
  const oneTimeExpenses = [
    {
      name: "Amazon Business Purchase",
      description: "Office supplies and equipment",
      amount: 71999, // $719.99 in cents
      category: "EQUIPMENT" as const,
      vendor: "Amazon",
      isRecurring: false,
      frequency: null,
      expenseDate: new Date("2026-01-16"),
    },
    {
      name: "Cursor Usage Mid Jan",
      description: "Additional Cursor usage charges",
      amount: 21200, // $212.00 in cents
      category: "SOFTWARE" as const,
      vendor: "Cursor",
      isRecurring: false,
      frequency: null,
      expenseDate: new Date("2026-01-29"),
    },
  ];

  // Create all expenses
  const allExpenses = [...recurringExpenses, ...oneTimeExpenses];

  for (const expense of allExpenses) {
    const created = await db.businessExpense.create({
      data: {
        ...expense,
        status: "PAID",
        paidAt: expense.expenseDate,
      },
    });
    console.log(`✅ Created: ${created.name} - $${(created.amount / 100).toFixed(2)}`);
  }

  // Calculate totals
  const totalRecurring = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalOneTime = oneTimeExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyRecurringCost = totalRecurring; // All are monthly

  console.log("\n📊 Summary:");
  console.log(`   Monthly Recurring: $${(monthlyRecurringCost / 100).toFixed(2)}`);
  console.log(`   One-Time Expenses: $${(totalOneTime / 100).toFixed(2)}`);
  console.log(`   Total This Month: $${((monthlyRecurringCost + totalOneTime) / 100).toFixed(2)}`);
  console.log("\n✨ Done! Your finance dashboard should now show expenses.");
}

main()
  .catch((error) => {
    console.error("❌ Error seeding expenses:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
