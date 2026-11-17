import {redirect} from "next/navigation";
import Link from "next/link";
import {auth,signOut} from "@/auth";
import TransactionsClient from "./transactions-client";
export default async function TransactionsPage(){const session=await auth();if(!session?.user?.id)redirect("/login");return <main style={{padding:"1.5rem",width:"min(1100px,100%)",margin:"0 auto"}}><header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"1rem",flexWrap:"wrap",marginBottom:"1.5rem"}}><div><h1>Spend Sense</h1><p>Transaction management · CAD</p></div><nav style={{display:"flex",alignItems:"center",gap:"1rem"}}><Link href="/dashboard">Savings goals</Link><Link href="/settings/accounts">Connected accounts</Link><form action={async()=>{"use server";await signOut({redirectTo:"/login"});}}><button type="submit">Log out</button></form></nav></header><TransactionsClient/></main>}
