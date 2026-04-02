import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LandingPage from "@/components/LandingPage";

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }
  return <LandingPage />;
}
