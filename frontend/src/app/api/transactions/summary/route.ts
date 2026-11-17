import {NextRequest,NextResponse} from "next/server";
import {userOrError,noStore} from "@/lib/server/transaction-http";
import {getSummary} from "@/lib/server/transaction-service";
import {parseMonth} from "@/lib/transaction-input";
export async function GET(req:NextRequest){const auth=await userOrError();if("response" in auth)return auth.response;const month=parseMonth(new URL(req.url).searchParams.get("month"));if(!month)return NextResponse.json({error:"Provide a valid month (YYYY-MM)."},{status:400});try{return NextResponse.json(await getSummary(auth.userId,month),{headers:noStore});}catch{return NextResponse.json({error:"Could not load summary."},{status:500});}}
