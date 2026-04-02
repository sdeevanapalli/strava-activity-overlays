import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getActivity, getActivityStreams } from "@/lib/strava";
import EditorClient from "./EditorClient";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const { activityId } = await params;
  let activity = null;
  let streams = null;

  try {
    [activity, streams] = await Promise.all([
      getActivity(activityId),
      getActivityStreams(activityId).catch(() => null),
    ]);
  } catch {
    redirect("/dashboard");
  }

  return <EditorClient activity={activity} streams={streams} />;
}
