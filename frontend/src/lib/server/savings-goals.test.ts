import { describe, it, expect, vi } from "vitest";

const { db } = vi.hoisted(() => ({ db: {
  savingsGoal: { findMany: vi.fn(), deleteMany: vi.fn() },
} }));
vi.mock("server-only", () => ({}));
vi.mock("./prisma", () => ({ prisma: { savingsGoal: db.savingsGoal } }));
import { listSavingsGoals, deleteSavingsGoal } from "./savings-goals";

describe("savings-goal user isolation", () => {
  it("filters reads by authenticated user ID", async () => {
    db.savingsGoal.findMany.mockResolvedValueOnce([]);
    await listSavingsGoals("user-a");
    expect(db.savingsGoal.findMany).toHaveBeenCalledWith({ where: { userId: "user-a" }, orderBy: { createdAt: "asc" } });
  });
  it("filters deletes by authenticated user ID and goal ID", async () => {
    db.savingsGoal.deleteMany.mockResolvedValueOnce({ count: 0 });
    expect(await deleteSavingsGoal("user-a", "some-goal")).toBe(false);
    expect(db.savingsGoal.deleteMany).toHaveBeenCalledWith({ where: { id: "some-goal", userId: "user-a" } });
  });
});
