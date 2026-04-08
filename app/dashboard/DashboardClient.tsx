"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/store/editorStore";
import type { StravaActivity } from "@/types/strava";
import { formatDistance, formatTime } from "@/lib/units";

const SPORT_COLORS: Record<string, string> = {
  Run: "#FC4C02",
  VirtualRun: "#FC4C02",
  Ride: "#3B82F6",
  VirtualRide: "#3B82F6",
  Swim: "#06B6D4",
  Walk: "#6B6B6B",
  Hike: "#6B6B6B",
};

function SportDot({ sportType }: { sportType: string }) {
  const color = SPORT_COLORS[sportType] || "#6B6B6B";
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

function ActivityRow({ activity }: { activity: StravaActivity }) {
  const router = useRouter();
  const { resetEditor } = useEditorStore();
  const date = new Date(activity.start_date_local);
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const handleClick = () => {
    resetEditor();
    router.push(`/editor/${activity.id}`);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={`Edit activity ${activity.name}`}
      className="w-full text-left transition-all"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: 6,
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        borderLeft: "3px solid transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderLeft = "3px solid #FC4C02";
        (e.currentTarget as HTMLButtonElement).style.background = "#FAFAFA";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderLeft = "3px solid transparent";
        (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <SportDot sportType={activity.sport_type || activity.type} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="text-2xl font-bold truncate"
          style={{ fontFamily: "var(--font-nunito), sans-serif", color: "#111111" }}
        >
          {formatDistance(activity.distance, "metric")}
        </p>
        <p className="text-sm truncate" style={{ color: "#111111", marginTop: 2 }}>
          {activity.name}
        </p>
        <p className="text-xs" style={{ color: "#6B6B6B", marginTop: 2 }}>
          {dateStr} · {timeStr}
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, flexShrink: 0, textAlign: "right" }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#111111" }}>{formatTime(activity.moving_time)}</p>
          <p className="text-xs" style={{ color: "#6B6B6B" }}>time</p>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold" style={{ color: "#111111" }}>
            {Math.round(activity.total_elevation_gain)}m
          </p>
          <p className="text-xs" style={{ color: "#6B6B6B" }}>elev</p>
        </div>
      </div>

      <svg
        className="w-4 h-4 flex-shrink-0"
        style={{ color: "#6B6B6B" }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

export default function DashboardClient() {
  const router = useRouter();
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchActivities = useCallback(async (pageNum: number, reset = false) => {
    try {
      const params = new URLSearchParams({ page: String(pageNum), per_page: "10" });
      const res = await fetch(`/api/strava/activities?${params}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        if (reset) {
          setActivities(data);
        } else {
          setActivities((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === 10);
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchActivities(1, true);
  }, [fetchActivities]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchActivities(nextPage);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F5" }}>
      <header
        className="sticky top-0 z-10"
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E5E5",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1
            className="text-xl font-extrabold"
            style={{ color: "#111111", fontFamily: "var(--font-nunito), sans-serif" }}
          >
            ActivityOverlays
          </h1>
          <button
            onClick={() => router.push("/api/auth/signout")}
            className="text-sm transition-colors px-3 py-1.5"
            style={{ color: "#6B6B6B" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#111111"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6B6B6B"; }}
          >
            Disconnect Strava
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: "#111111", fontFamily: "var(--font-nunito), sans-serif" }}
          >
            Your Activities
          </h2>
          <p style={{ color: "#6B6B6B" }}>Select an activity to create an overlay</p>
        </div>

        {loading ? (
          <div className="grid gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse"
                style={{ background: "#E5E5E5", borderRadius: 6 }}
              />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#6B6B6B" }}>
            <p className="text-lg">No activities found</p>
            <p className="text-sm mt-1">Go for a run and sync it to Strava!</p>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              {activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 text-sm transition-all disabled:opacity-50"
                  style={{
                    border: "1px solid #E5E5E5",
                    background: "#FFFFFF",
                    borderRadius: 6,
                    color: "#111111",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F5F5"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF"; }}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-[#E5E5E5] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col items-center gap-2 text-xs text-[#6B6B6B] sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="font-medium hover:text-[#111111]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="font-medium hover:text-[#111111]">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
