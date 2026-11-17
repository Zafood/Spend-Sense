import {describe,expect,it} from "vitest";
import {categoryInput,transactionInput,parseMonth,toCents,fromCents} from "./transaction-input";
const valid={kind:"EXPENSE",amount:"24.50",category:"Groceries",description:null,occurredOn:"2026-11-17"};
describe("transaction validation",()=>{
 it("accepts exact CAD amounts and dates",()=>expect(transactionInput.safeParse(valid).success).toBe(true));
 it.each(["0.00","-1.00","1.2","1.234","abc","1e2","","99999999999.00"])("rejects invalid amount %s",amount=>expect(transactionInput.safeParse({...valid,amount}).success).toBe(false));
 it.each(["2026-02-30","2026-13-01","2026-11-00","not-a-date"])("rejects bad date %s",occurredOn=>expect(transactionInput.safeParse({...valid,occurredOn}).success).toBe(false));
 it("rejects extra fields",()=>expect(transactionInput.safeParse({...valid,userId:"someone-else"}).success).toBe(false));
 it("rejects empty or excessively long categories",()=>expect(categoryInput.safeParse({kind:"EXPENSE",name:""}).success).toBe(false));
 it("validates month filters",()=>{expect(parseMonth("2026-11")).toBe("2026-11");expect(parseMonth("2026-00")).toBeNull();expect(parseMonth("oops")).toBeNull();});
 it("converts cents exactly",()=>{expect(toCents("0.01")).toBe(1n);expect(fromCents(-201n)).toBe("-2.01");});
});
