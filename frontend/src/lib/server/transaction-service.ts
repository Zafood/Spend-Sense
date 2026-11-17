import "server-only";
import { prisma } from "@/lib/server/prisma";
import { Prisma, type TransactionKind } from "@prisma/client";
import { DEFAULT_CATEGORIES, categoryInput, transactionInput, type Kind } from "@/lib/transaction-input";
import { summarize, type AnalyticsRow } from "@/lib/transaction-analytics";

function formatTx(tx: { id: string; kind: TransactionKind; amount: Prisma.Decimal; category: string; description: string | null; occurredOn: Date }) {
  return { id: tx.id, kind: tx.kind, amount: tx.amount.toFixed(2), category: tx.category, description: tx.description, occurredOn: tx.occurredOn.toISOString().slice(0,10) };
}
function bad(error: string) { return {error} as const; }
export async function categoriesFor(userId: string) {
  const customs = await prisma.transactionCategory.findMany({where: {userId}, select: {id:true,kind:true,name:true}, orderBy: {name:"asc"}});
  return { EXPENSE: [...DEFAULT_CATEGORIES.EXPENSE.map(name => ({id: null, name, kind:"EXPENSE" as const})), ...customs.filter(c=>c.kind === "EXPENSE")], INCOME: [...DEFAULT_CATEGORIES.INCOME.map(name=>({id:null,name,kind:"INCOME" as const})), ...customs.filter(c=>c.kind === "INCOME")] };
}
async function isAllowedCategory(userId: string, kind: Kind, name: string) {
  if ((DEFAULT_CATEGORIES[kind] as readonly string[]).includes(name)) return true;
  return Boolean(await prisma.transactionCategory.findFirst({where: {userId,kind,name}, select:{id:true}}));
}
export async function addCategory(userId: string, raw: unknown) {
  const parsed = categoryInput.safeParse(raw);
  if (!parsed.success) return bad("Invalid category.");
  const {kind,name} = parsed.data;
  if ((DEFAULT_CATEGORIES[kind] as readonly string[]).some(c=>c.toLowerCase()===name.toLowerCase())) return bad("Category already exists.");
  const exists = await prisma.transactionCategory.findFirst({where:{userId,kind,name:{equals:name,mode:"insensitive"}}});
  if (exists) return bad("Category already exists.");
  try { const category = await prisma.transactionCategory.create({data:{userId,kind,name}}); return {value: {id: category.id,kind:category.kind,name:category.name}}; }
  catch(e) { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return bad("Category already exists."); throw e; }
}
export async function removeCategory(userId:string,id:string) {
  const item = await prisma.transactionCategory.findFirst({where:{id,userId}});
  if (!item) return {status:404,error:"Category not found."};
  const used = await prisma.transaction.count({where:{userId,kind:item.kind,category:item.name}});
  if (used) return {status:409,error:"This category is used by transactions. Reassign or delete those transactions first."};
  await prisma.transactionCategory.deleteMany({where:{id,userId}});
  return {status:204};
}
export async function listTransactions(userId:string, filters: {month?:string,kind?:Kind,category?:string}) {
  const where: Prisma.TransactionWhereInput = {userId};
  if (filters.kind) where.kind = filters.kind;
  if (filters.category) where.category = filters.category;
  if (filters.month) {
    const [year,month] = filters.month.split("-").map(Number);
    where.occurredOn = {gte: new Date(Date.UTC(year,month-1,1)), lt:new Date(Date.UTC(year,month,1))};
  }
  return (await prisma.transaction.findMany({where,orderBy:[{occurredOn:"desc"},{createdAt:"desc"}],take:1000})).map(formatTx);
}
export async function saveTransaction(userId:string,raw:unknown,id?:string) {
  const parsed = transactionInput.safeParse(raw);
  if (!parsed.success) return bad(parsed.error.issues[0]?.message ?? "Invalid transaction.");
  const {kind,category,amount,description,occurredOn} = parsed.data;
  if (!await isAllowedCategory(userId,kind,category)) return bad("Select an existing category.");
  const data = {kind,category,amount:new Prisma.Decimal(amount),description,occurredOn: new Date(`${occurredOn}T00:00:00.000Z`)};
  if (id) {
    const updated = await prisma.transaction.updateMany({where:{id,userId},data});
    if (!updated.count) return bad("Transaction not found.");
    const tx = await prisma.transaction.findFirst({where:{id,userId}});
    if (!tx) return bad("Transaction not found.");
    return {value:formatTx(tx)};
  }
  const tx = await prisma.transaction.create({data:{...data,userId}});
  return {value:formatTx(tx)};
}
export async function removeTransaction(userId:string,id:string) {
  return (await prisma.transaction.deleteMany({where:{id,userId}})).count > 0;
}
export async function getSummary(userId:string,month:string) {
  const [year,m] = month.split("-").map(Number);
  const beginning = new Date(Date.UTC(year,m-6,1));
  const ending = new Date(Date.UTC(year,m,1));
  const rows = await prisma.transaction.findMany({where:{userId,occurredOn:{gte:beginning,lt:ending}},select:{kind:true,amount:true,category:true,occurredOn:true}});
  const values: AnalyticsRow[] = rows.map(r=>({kind:r.kind,amount:r.amount.toFixed(2),category:r.category,occurredOn:r.occurredOn.toISOString().slice(0,10)}));
  return summarize(values,month);
}
