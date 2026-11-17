import { validateBudget } from "./budget";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseNewSavingsGoal(raw: unknown, today = new Date().toISOString().slice(0, 10)) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { error: "Invalid request body." } as const;
  const input = raw as Record<string, unknown>;
  if (typeof input.name !== "string" || typeof input.targetDate !== "string" ||
      typeof input.targetAmount !== "number" || typeof input.currentAmount !== "number") {
    return { error: "Invalid budget information." } as const;
  }
  if (input.name.trim().length > 120 || !/^\d{4}-\d{2}-\d{2}$/.test(input.targetDate)) {
    return { error: "Name or target date is invalid." } as const;
  }
  const date = new Date(`${input.targetDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || formatDate(date) !== input.targetDate) {
    return { error: "Invalid target date." } as const;
  }
  const error = validateBudget(input.name, input.targetAmount, input.currentAmount, input.targetDate, today);
  if (error) return { error } as const;
  // PostgreSQL DECIMAL(12,2) has a maximum of 9,999,999,999.99.
  if ([input.targetAmount, input.currentAmount].some((value) => value > 9999999999.99 ||
      Math.round(value * 100) / 100 !== value)) {
    return { error: "Amounts must be within range and have at most two decimal places." } as const;
  }
  return { value: {
    name: input.name.trim(),
    targetAmount: input.targetAmount.toFixed(2),
    currentAmount: input.currentAmount.toFixed(2),
    targetDate: date,
  } } as const;
}

