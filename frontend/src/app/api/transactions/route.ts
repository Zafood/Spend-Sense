import { NextRequest, NextResponse } from "next/server";
import { userOrError, mutationError, jsonBody, noStore } from "@/lib/server/transaction-http";
import { listTransactions, saveTransaction } from "@/lib/server/transaction-service";
import {parseMonth} from "@/lib/transaction-input";
export async function GET(req:NextRequest) {
  const auth=await userOrError(); if ("response" in auth) return auth.response;
  const params=new URL(req.url).searchParams;
  const month=params.get("month"), kind=params.get("kind"),category=params.get("category");
  if (month && !parseMonth(month)) return NextResponse.json({error:"Invalid month."},{status:400});
  if (kind && kind!=="INCOME" && kind!=="EXPENSE") return NextResponse.json({error:"Invalid type."},{status:400});
  if (category && category.length>80) return NextResponse.json({error:"Invalid category."},{status:400});
  try {return NextResponse.json(await listTransactions(auth.userId,{month:month??undefined,kind:kind as "INCOME"|"EXPENSE"|undefined,category:category??undefined}),{headers:noStore});}
  catch{return NextResponse.json({error:"Could not load transactions."},{status:500});}
}
export async function POST(req:NextRequest) {
  const auth=await userOrError(); if ("response" in auth) return auth.response;
  const error=mutationError(req);if(error)return error;
  const body=await jsonBody(req);if(body===null)return NextResponse.json({error:"Invalid JSON."},{status:400});
  try {const result=await saveTransaction(auth.userId,body);return "error" in result?NextResponse.json(result,{status:400}):NextResponse.json(result.value,{status:201,headers:noStore});}
  catch{return NextResponse.json({error:"Could not create transaction."},{status:500});}
}
