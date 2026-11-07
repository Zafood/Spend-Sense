export type Budget = {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
};

// Checks whether the budget information is valid.
export function validateBudget(
  name: string,
  targetAmount: number,
  currentAmount: number,
  targetDate: string,
  today: string,
): string | null {
  if (!name.trim()) {
    return "Please enter a budget name.";
  }

  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    return "Target amount must be greater than zero.";
  }

  if (!Number.isFinite(currentAmount) || currentAmount < 0) {
    return "Current amount cannot be negative or empty.";
  }

  if (!targetDate || targetDate <= today) {
    return "Please select a future target date.";
  }

  return null;
}

// Calculates how much money is left in a budget.
export function calculateRemaining(budget: Budget): number {
  return Math.max(0, budget.targetAmount - budget.currentAmount);
}

// Calculates the percentage of the budget completed.
export function calculateProgress(budget: Budget): number {
  return Math.min(100, (budget.currentAmount / budget.targetAmount) * 100);
}

// Calculates the monthly savings needed to reach a goal.
export function calculateMonthlySavings(budget: Budget, today: string): number {
  const remaining = calculateRemaining(budget);

  const startDate = new Date(today + "T12:00:00");
  const endDate = new Date(budget.targetDate + "T12:00:00");

  // Calculates the number of days remaining.
  const daysRemaining = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  // Converts the remaining days into 30-day months.
  const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));

  return remaining / monthsRemaining;
}
