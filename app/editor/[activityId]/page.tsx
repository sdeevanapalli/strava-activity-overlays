import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getActivity } from "@/lib/strava";
import EditorClient from "./EditorClient";
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditorPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const { activityId } = await params;

  const activity = await getActivity(activityId).catch(() => null);
  if (!activity) {
    redirect("/dashboard");
  }

  return <EditorClient activity={activity} />;

}
