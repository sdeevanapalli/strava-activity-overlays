import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LandingPage from "@/components/LandingPage";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }
  const { error } = await searchParams;
  return <LandingPage error={error} />;
}
