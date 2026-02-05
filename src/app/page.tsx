import { redirect } from "next/navigation";

export default async function Home() {
  // Always redirect to dashboard - it works in demo mode without auth
  redirect("/dashboard");
}
