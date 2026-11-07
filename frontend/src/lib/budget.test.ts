import { describe, it, expect } from "vitest";

import {
  validateBudget,
  calculateRemaining,
  calculateProgress,
  calculateMonthlySavings,
  type Budget,
} from "./budget";

const today = "2026-11-07";

// Example budget used by the tests.
const exampleBudget: Budget = {
  id: 1,
  name: "New Car",
  targetAmount: 5000,
  currentAmount: 500,
  targetDate: "2027-02-07",
};

describe("Budget Validation", () => {
  it("accepts valid budget information", () => {
    const result = validateBudget("New Car", 5000, 500, "2027-02-07", today);

    expect(result).toBeNull();
  });

  it("rejects an empty budget name", () => {
    const result = validateBudget("", 5000, 500, "2027-02-07", today);

    expect(result).toBe("Please enter a budget name.");
  });

  it("rejects an invalid target amount", () => {
    const result = validateBudget("New Car", 0, 500, "2027-02-07", today);

    expect(result).toBe("Target amount must be greater than zero.");
  });

  it("rejects a negative current amount", () => {
    const result = validateBudget("New Car", 5000, -100, "2027-02-07", today);

    expect(result).toBe("Current amount cannot be negative or empty.");
  });

  it("rejects a past target date", () => {
    const result = validateBudget("New Car", 5000, 500, "2026-10-01", today);

    expect(result).toBe("Please select a future target date.");
  });
});

describe("Budget Calculations", () => {
  it("calculates the remaining budget amount", () => {
    expect(calculateRemaining(exampleBudget)).toBe(4500);
  });

  it("calculates budget progress", () => {
    expect(calculateProgress(exampleBudget)).toBe(10);
  });

  // Checks the monthly savings calculation over four months.
  it("calculates the required monthly savings", () => {
    expect(calculateMonthlySavings(exampleBudget, today)).toBe(1125);
  });

  it("does not return a negative remaining amount", () => {
    const budget = {
      ...exampleBudget,
      currentAmount: 6000,
    };

    expect(calculateRemaining(budget)).toBe(0);
  });
});
