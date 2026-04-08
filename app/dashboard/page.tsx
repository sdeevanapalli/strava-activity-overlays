import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");
  return <DashboardClient />;
}
