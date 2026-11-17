import "server-only";
import { prisma } from "./prisma";
import { parseNewSavingsGoal } from "../savings-goal-input";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function serialize(goal: {
  id: string;
  name: string;
  targetAmount: { toString(): string };
  currentAmount: { toString(): string };
  targetDate: Date;
}) {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: Number(goal.targetAmount.toString()),
    currentAmount: Number(goal.currentAmount.toString()),
    targetDate: formatDate(goal.targetDate),
  };
}

export async function listSavingsGoals(userId: string) {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId }, orderBy: { createdAt: "asc" },
  });
  return goals.map(serialize);
}


export async function createSavingsGoal(userId: string, raw: unknown) {
  const parsed = parseNewSavingsGoal(raw);
  if ("error" in parsed) return parsed;
  const goal = await prisma.savingsGoal.create({ data: { ...parsed.value, userId } });
  return { value: serialize(goal) } as const;
}

export async function deleteSavingsGoal(userId: string, id: string) {
  const result = await prisma.savingsGoal.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
