import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";
export default async function LoginPage() {
  if ((await auth())?.user?.id) redirect("/dashboard");
  return <LoginForm />;
}
