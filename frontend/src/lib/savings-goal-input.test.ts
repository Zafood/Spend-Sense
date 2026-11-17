import { describe, it, expect } from "vitest";
import { parseNewSavingsGoal } from "./savings-goal-input";

const today = "2026-11-17";
const valid = { name: "Car", targetAmount: 2000.25, currentAmount: 25.50, targetDate: "2027-11-17" };

describe("server-side savings goal validation", () => {
  it("accepts valid monetary amounts and a future date", () => {
    expect(parseNewSavingsGoal(valid, today)).toHaveProperty("value");
  });
  it("rejects malformed calendar dates", () => {
    expect(parseNewSavingsGoal({ ...valid, targetDate: "2027-02-30" }, today)).toHaveProperty("error");
  });
  it("rejects too many decimal places", () => {
    expect(parseNewSavingsGoal({ ...valid, targetAmount: 10.123 }, today)).toHaveProperty("error");
  });
  it("rejects oversized amounts", () => {
    expect(parseNewSavingsGoal({ ...valid, targetAmount: 10000000000 }, today)).toHaveProperty("error");
  });
  it("rejects unexpected types", () => {
    expect(parseNewSavingsGoal({ ...valid, name: 3 }, today)).toHaveProperty("error");
  });
});
