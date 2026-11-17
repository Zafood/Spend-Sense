import { z } from "zod";

export const DEFAULT_CATEGORIES = {
  EXPENSE: ["Groceries", "Housing", "Utilities", "Transportation", "Dining", "Entertainment", "Subscriptions", "Healthcare", "Shopping", "Other Expense"],
  INCOME: ["Employment", "Freelance", "Investment", "Gift", "Other Income"],
} as const;
export type Kind = "INCOME" | "EXPENSE";
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const amountPattern = /^(?:0|[1-9]\d{0,9})\.\d{2}$/;
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const categoryInput = z.object({
  kind: z.enum(["INCOME", "EXPENSE"]),
  name: z.string().trim().min(1).max(80).refine(v => !/[\u0000-\u001f]/.test(v), "Invalid category name"),
}).strict();
export const transactionInput = z.object({
  kind: z.enum(["INCOME", "EXPENSE"]),
  amount: z.string().regex(amountPattern, "Enter a positive CAD amount with exactly two decimal places (e.g. 12.50).")
    .refine(v => !amountPattern.test(v) || (BigInt(v.replace(".", "")) > 0n && BigInt(v.replace(".", "")) <= 999999999999n), "Amount out of range"),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).nullable(),
  occurredOn: z.string().regex(datePattern).refine(v => {
    const date = new Date(v + "T00:00:00.000Z");
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === v;
  }, "Invalid calendar date"),
}).strict();
export function parseMonth(month: string | null): string | null {
  if (!month || !/^(19|20|21)\d{2}-(0[1-9]|1[0-2])$/.test(month)) return null;
  return month;
}
export function toCents(value: string): bigint { return BigInt(value.replace(".", "")); }
export function fromCents(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const n = value < 0n ? -value : value;
  return `${sign}${n / 100n}.${String(n % 100n).padStart(2, "0")}`;
}
