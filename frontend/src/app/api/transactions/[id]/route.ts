import {NextRequest,NextResponse} from "next/server";
import {userOrError,mutationError,jsonBody,noStore} from "@/lib/server/transaction-http";
import {saveTransaction,removeTransaction} from "@/lib/server/transaction-service";
import {uuidPattern} from "@/lib/transaction-input";
type Ctx={params:Promise<{id:string}>};
export async function PATCH(req:NextRequest,ctx:Ctx){
 const auth=await userOrError();if("response" in auth)return auth.response;
 const e=mutationError(req);if(e)return e;
 const {id}=await ctx.params;if(!uuidPattern.test(id))return NextResponse.json({error:"Invalid ID."},{status:400});
 const body=await jsonBody(req);if(body===null)return NextResponse.json({error:"Invalid JSON."},{status:400});
 try {const result=await saveTransaction(auth.userId,body,id);return "error" in result?NextResponse.json(result,{status:result.error==="Transaction not found."?404:400}):NextResponse.json(result.value,{headers:noStore});}
 catch{return NextResponse.json({error:"Could not update transaction."},{status:500});}
}
export async function DELETE(req:NextRequest,ctx:Ctx){
 const auth=await userOrError();if("response" in auth)return auth.response;
 const e=mutationError(req);if(e)return e;
 const {id}=await ctx.params;if(!uuidPattern.test(id))return NextResponse.json({error:"Invalid ID."},{status:400});
 try {return await removeTransaction(auth.userId,id)?new NextResponse(null,{status:204}):NextResponse.json({error:"Transaction not found."},{status:404});}
 catch{return NextResponse.json({error:"Could not delete transaction."},{status:500});}
}
