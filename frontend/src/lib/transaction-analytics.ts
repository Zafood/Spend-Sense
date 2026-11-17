import { fromCents, toCents, type Kind } from "./transaction-input";
export type AnalyticsRow = {kind: Kind; amount: string; category: string; occurredOn: string};
export function summarize(rows: AnalyticsRow[], selectedMonth: string) {
  const subset = rows.filter(r => r.occurredOn.startsWith(selectedMonth));
  let income = 0n, expenses = 0n;
  const spending = new Map<string, bigint>();
  for (const row of subset) {
    const cents = toCents(row.amount);
    if (row.kind === "INCOME") income += cents;
    else { expenses += cents; spending.set(row.category, (spending.get(row.category) ?? 0n) + cents); }
  }
  const monthly = Array.from({length: 6}, (_, i) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1 - (5 - i), 1));
    const key = date.toISOString().slice(0,7);
    let inc = 0n, exp = 0n;
    for (const row of rows) if (row.occurredOn.startsWith(key)) {
      if (row.kind === "INCOME") inc += toCents(row.amount); else exp += toCents(row.amount);
    }
    return {month: key, income: fromCents(inc), expenses: fromCents(exp)};
  });
  return {
    month: selectedMonth, income: fromCents(income), expenses: fromCents(expenses), net: fromCents(income - expenses),
    byCategory: [...spending].sort((a,b) => a[0].localeCompare(b[0])).map(([category,total]) => ({category, amount: fromCents(total)})),
    monthly,
  };
}
