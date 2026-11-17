import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "./register-form";
export default async function RegisterPage() {
  if ((await auth())?.user?.id) redirect("/dashboard");
  return <RegisterForm />;
}
