import {describe,it,expect} from "vitest";
import {summarize} from "./transaction-analytics";
describe("monthly transaction analytics",()=>{
 const rows=[
  {kind:"INCOME" as const,amount:"1000.10",category:"Employment",occurredOn:"2026-11-01"},
  {kind:"EXPENSE" as const,amount:"250.05",category:"Groceries",occurredOn:"2026-11-04"},
  {kind:"EXPENSE" as const,amount:"10.01",category:"Groceries",occurredOn:"2026-11-17"},
  {kind:"EXPENSE" as const,amount:"10.00",category:"Dining",occurredOn:"2026-10-30"},
 ];
 it("computes income, expenses and net without floating point rounding",()=>{
  const result=summarize(rows,"2026-11");expect(result.income).toBe("1000.10");expect(result.expenses).toBe("260.06");expect(result.net).toBe("740.04");
  expect(result.byCategory).toEqual([{category:"Groceries",amount:"260.06"}]);
 });
 it("includes six calendar months in the trend",()=>{
  const result=summarize(rows,"2026-11");expect(result.monthly).toHaveLength(6);expect(result.monthly[0].month).toBe("2026-06");expect(result.monthly.at(-1)?.month).toBe("2026-11");expect(result.monthly.find(v=>v.month==="2026-10")?.expenses).toBe("10.00");
 });
});
