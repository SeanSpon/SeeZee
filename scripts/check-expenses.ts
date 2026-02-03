import { db } from "../src/server/db";

async function main() {
  const expenses = await db.businessExpense.findMany({
    orderBy: { expenseDate: 'desc' }
  });
  
  console.log("\n📊 All Expenses:");
  expenses.forEach(e => {
    console.log(`  ${e.name}: $${(e.amount/100).toFixed(2)} - ${e.expenseDate.toISOString().split('T')[0]} - ${e.isRecurring ? 'Recurring' : 'One-time'}`);
  });
  
  // Check what month we're in
  const now = new Date();
  console.log(`\n📅 Current date: ${now.toISOString()}`);
  console.log(`   Current month: ${now.getMonth() + 1}/${now.getFullYear()}`);
  
  // Calculate this month's expenses
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  const thisMonthExpenses = expenses.filter(e => {
    const expDate = new Date(e.expenseDate);
    return expDate >= thisMonth && expDate < nextMonth;
  });
  
  console.log(`\n💰 This month's expenses (${thisMonth.toLocaleDateString()} - ${nextMonth.toLocaleDateString()}):`);
  thisMonthExpenses.forEach(e => {
    console.log(`  ${e.name}: $${(e.amount/100).toFixed(2)}`);
  });
  
  const total = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  console.log(`\n   Total: $${(total/100).toFixed(2)}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
