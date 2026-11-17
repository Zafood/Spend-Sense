import {NextRequest,NextResponse} from "next/server";
import {userOrError,mutationError} from "@/lib/server/transaction-http";
import {removeCategory} from "@/lib/server/transaction-service";
import {uuidPattern} from "@/lib/transaction-input";
export async function DELETE(req:NextRequest,ctx:{params:Promise<{id:string}>}){const auth=await userOrError();if("response" in auth)return auth.response;const e=mutationError(req);if(e)return e;const {id}=await ctx.params;if(!uuidPattern.test(id))return NextResponse.json({error:"Invalid ID."},{status:400});try{const result=await removeCategory(auth.userId,id);return result.status===204?new NextResponse(null,{status:204}):NextResponse.json({error:result.error},{status:result.status});}catch{return NextResponse.json({error:"Could not delete category."},{status:500});}}
