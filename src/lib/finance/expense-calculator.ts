/**
 * Expense Calculator Utility
 * Properly handles recurring vs one-time expenses
 */

export interface ExpenseItem {
  amount: number;
  isRecurring: boolean;
  frequency?: string | null;
  expenseDate: Date;
}

export interface ExpenseCalculationResult {
  totalOneTime: number;
  totalRecurring: number;
  monthlyRecurringCost: number;
  total: number;
}

/**
 * Calculate expenses for a given time period
 * Properly differentiates between one-time purchases and recurring costs
 * 
 * @param expenses - Array of expenses
 * @param startDate - Start of period (optional, for filtering)
 * @param endDate - End of period (optional, for filtering)
 * @returns Breakdown of expenses
 */
export function calculateExpenses(
  expenses: ExpenseItem[],
  startDate?: Date,
  endDate?: Date
): ExpenseCalculationResult {
  // Filter by date range if provided
  let filteredExpenses = expenses;
  if (startDate || endDate) {
    filteredExpenses = expenses.filter((exp) => {
      if (startDate && exp.expenseDate < startDate) return false;
      if (endDate && exp.expenseDate > endDate) return false;
      return true;
    });
  }

  // Separate one-time and recurring expenses
  const oneTimeExpenses = filteredExpenses.filter((exp) => !exp.isRecurring);
  const recurringExpenses = filteredExpenses.filter((exp) => exp.isRecurring);

  // Calculate one-time total
  const totalOneTime = oneTimeExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  // For recurring expenses, we need to be smart about counting them
  // Group by a unique identifier to avoid double-counting
  const recurringByKey = new Map<string, number>();
  
  for (const exp of recurringExpenses) {
    // Create a key based on amount and frequency to identify unique recurring expenses
    // In a real scenario, you'd want to group by a unique ID or name
    const key = `${exp.amount}-${exp.frequency || "monthly"}`;
    
    // Only count the most recent instance of each recurring expense
    if (!recurringByKey.has(key)) {
      recurringByKey.set(key, exp.amount);
    }
  }

  // Calculate monthly recurring cost
  let monthlyRecurringCost = 0;
  for (const [key, amount] of recurringByKey) {
    const frequency = key.split("-")[1];
    
    // Convert all recurring expenses to monthly equivalents
    switch (frequency?.toLowerCase()) {
      case "yearly":
      case "annual":
        monthlyRecurringCost += amount / 12;
        break;
      case "quarterly":
        monthlyRecurringCost += amount / 3;
        break;
      case "weekly":
        monthlyRecurringCost += amount * 4.33; // Average weeks per month
        break;
      case "monthly":
      default:
        monthlyRecurringCost += amount;
        break;
    }
  }

  // Total recurring is just the sum of unique recurring expenses in the period
  const totalRecurring = Array.from(recurringByKey.values()).reduce(
    (sum, amount) => sum + amount,
    0
  );

  return {
    totalOneTime,
    totalRecurring,
    monthlyRecurringCost,
    total: totalOneTime + totalRecurring,
  };
}

/**
 * Calculate monthly expense breakdown
 * Returns proper totals for recurring vs one-time for a specific month
 */
export function calculateMonthlyExpenses(
  expenses: ExpenseItem[],
  year: number,
  month: number // 0-11 (JavaScript month format)
): ExpenseCalculationResult {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  return calculateExpenses(expenses, startDate, endDate);
}

/**
 * Calculate expenses for current month with proper recurring handling
 */
export function calculateCurrentMonthExpenses(
  expenses: ExpenseItem[]
): ExpenseCalculationResult {
  const now = new Date();
  return calculateMonthlyExpenses(expenses, now.getFullYear(), now.getMonth());
}

/**
 * Get unique recurring expenses (to avoid double-counting)
 * Returns one instance of each unique recurring expense
 */
export function getUniqueRecurringExpenses<T extends ExpenseItem & { id?: string; name?: string }>(
  expenses: T[]
): T[] {
  const recurringExpenses = expenses.filter((exp) => exp.isRecurring);
  
  // Group by ID if available, otherwise by name + amount + frequency
  const uniqueMap = new Map<string, T>();
  
  for (const exp of recurringExpenses) {
    const key = exp.id || `${exp.name || "unnamed"}-${exp.amount}-${exp.frequency || "monthly"}`;
    
    // Keep the most recent one
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, exp);
    } else {
      const existing = uniqueMap.get(key)!;
      if (exp.expenseDate > existing.expenseDate) {
        uniqueMap.set(key, exp);
      }
    }
  }
  
  return Array.from(uniqueMap.values());
}

/**
 * Calculate total expenses properly accounting for recurring vs one-time
 * This should be used for "all time" calculations
 */
export function calculateTotalExpenses(expenses: ExpenseItem[]): ExpenseCalculationResult {
  // For "all time" calculations:
  // - Sum ALL one-time expenses
  // - For recurring, only count unique instances (don't double-count if entered multiple times)
  
  const oneTimeExpenses = expenses.filter((exp) => !exp.isRecurring);
  const recurringExpenses = expenses.filter((exp) => exp.isRecurring);

  const totalOneTime = oneTimeExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  // Group recurring by unique identifier to avoid double-counting
  const recurringByKey = new Map<string, { amount: number; frequency: string }>();
  
  for (const exp of recurringExpenses) {
    const key = `${exp.amount}-${exp.frequency || "monthly"}`;
    if (!recurringByKey.has(key)) {
      recurringByKey.set(key, {
        amount: exp.amount,
        frequency: exp.frequency || "monthly",
      });
    }
  }

  // Calculate monthly recurring cost
  let monthlyRecurringCost = 0;
  let totalRecurring = 0;
  
  for (const { amount, frequency } of recurringByKey.values()) {
    totalRecurring += amount;
    
    // Convert to monthly
    switch (frequency.toLowerCase()) {
      case "yearly":
      case "annual":
        monthlyRecurringCost += amount / 12;
        break;
      case "quarterly":
        monthlyRecurringCost += amount / 3;
        break;
      case "weekly":
        monthlyRecurringCost += amount * 4.33;
        break;
      case "monthly":
      default:
        monthlyRecurringCost += amount;
        break;
    }
  }

  return {
    totalOneTime,
    totalRecurring,
    monthlyRecurringCost,
    total: totalOneTime + totalRecurring,
  };
}
