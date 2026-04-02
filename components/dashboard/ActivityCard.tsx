"use client";

import { useRouter } from "next/navigation";
import type { StravaActivity } from "@/types/strava";
import { formatDistance, formatTime } from "@/lib/units";

const SPORT_ICONS: Record<string, string> = {
  Run: "🏃",
  Ride: "🚴",
  Swim: "🏊",
  Walk: "🚶",
  Hike: "🥾",
  VirtualRide: "🚴",
  VirtualRun: "🏃",
  WeightTraining: "🏋️",
  Yoga: "🧘",
  Workout: "💪",
};

export default function ActivityCard({ activity }: { activity: StravaActivity }) {
  const router = useRouter();
  const icon = SPORT_ICONS[activity.sport_type] || SPORT_ICONS[activity.type] || "⚡";
  const date = new Date(activity.start_date_local);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <button
      onClick={() => router.push(`/editor/${activity.id}`)}
      className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 rounded-2xl p-4 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
            {activity.name}
          </h3>
          <p className="text-sm text-gray-400">
            {dateStr} · {timeStr}
          </p>
        </div>
        <div className="flex gap-6 text-right flex-shrink-0">
          <div>
            <p className="text-sm font-semibold text-white">
              {formatDistance(activity.distance, "metric")}
            </p>
            <p className="text-xs text-gray-500">distance</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {formatTime(activity.moving_time)}
            </p>
            <p className="text-xs text-gray-500">time</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">
              {Math.round(activity.total_elevation_gain)}m
            </p>
            <p className="text-xs text-gray-500">elev</p>
          </div>
        </div>
        <svg
          className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
