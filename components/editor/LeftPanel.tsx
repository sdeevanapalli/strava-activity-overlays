"use client";

import { useEditorStore } from "@/store/editorStore";
import type { StravaActivity, StravaStreams } from "@/types/strava";
import type { CanvasElement } from "@/store/editorStore";

interface StatChip {
  key: string;
  label: string;
  icon: string;
  available: (activity: StravaActivity) => boolean;
}

const STAT_CHIPS: StatChip[] = [
  { key: "distance", label: "Distance", icon: "—", available: () => true },
  { key: "moving_time", label: "Moving Time", icon: "—", available: () => true },
  { key: "elapsed_time", label: "Elapsed Time", icon: "—", available: () => true },
  { key: "elevation", label: "Elevation Gain", icon: "—", available: () => true },
  { key: "avg_pace", label: "Avg Pace", icon: "—", available: (a) => !!a.average_speed },
  { key: "max_speed", label: "Max Speed", icon: "—", available: (a) => !!a.max_speed },
  { key: "avg_speed", label: "Avg Speed", icon: "—", available: (a) => !!a.average_speed },
  { key: "calories", label: "Calories", icon: "—", available: (a) => !!a.calories },
  { key: "avg_hr", label: "Avg Heart Rate", icon: "—", available: (a) => !!a.average_heartrate },
  { key: "max_hr", label: "Max Heart Rate", icon: "—", available: (a) => !!a.max_heartrate },
  { key: "avg_cadence", label: "Avg Cadence", icon: "—", available: (a) => !!a.average_cadence },
  { key: "avg_power", label: "Avg Power", icon: "—", available: (a) => !!a.average_watts },
  { key: "activity_name", label: "Activity Name", icon: "—", available: () => true },
  { key: "date", label: "Date & Time", icon: "—", available: () => true },
  { key: "sport_type", label: "Sport Type", icon: "—", available: () => true },
  { key: "gear", label: "Gear", icon: "—", available: (a) => !!a.gear },
  { key: "relative_effort", label: "Relative Effort", icon: "—", available: (a) => !!a.suffer_score },
];

interface LeftPanelProps {
  activity: StravaActivity;
  streams: StravaStreams | null;
}

export default function LeftPanel({ activity, streams }: LeftPanelProps) {
  const { addElement } = useEditorStore();

  // Use x: -1, y: -1 as sentinel for smart auto-placement
  const handleAddStat = (chip: StatChip) => {
    const newEl: CanvasElement = {
      id: `${chip.key}-${Date.now()}`,
      type: "stat",
      statKey: chip.key,
      label: chip.label.toUpperCase(),
      x: -1, // sentinel: auto-place
      y: -1,
      fontSize: 80,
      opacity: 1,
      background: "none",
    };
    addElement(newEl);
  };

  const handleAddMap = () => {
    if (!activity.map?.summary_polyline) {
      alert("No GPS data available for this activity.");
      return;
    }
    const newEl: CanvasElement = {
      id: `map-${Date.now()}`,
      type: "map",
      x: (1080 - 600) / 2,
      y: (1920 - 600) / 2,
      width: 600,
      height: 600,
    };
    addElement(newEl);
  };

  const handleAddSplits = () => {
    if (!activity.splits_metric?.length) {
      alert("No splits data available for this activity.");
      return;
    }
    const newEl: CanvasElement = {
      id: `splits-${Date.now()}`,
      type: "splits",
      x: 100,
      y: 1600,
      width: 880,
      height: 200,
    };
    addElement(newEl);
  };

  const availableChips = STAT_CHIPS.filter((chip) => chip.available(activity));

  return (
    <div className="p-4 space-y-4">
      {/* Stats section */}
      <div>
        <h3
          className="mb-3"
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#6B6B6B",
          }}
        >
          Stats
        </h3>
        <div className="space-y-1.5">
          {availableChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => handleAddStat(chip)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left transition-all group"
              style={{
                background: "#1A1A1A",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">
                {chip.label}
              </span>
              <span
                className="text-xs transition-colors group-hover:text-[#FC4C02]"
                style={{ color: "#6B6B6B" }}
              >
                +
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

      {/* Visuals section */}
      <div>
        <h3
          className="mb-3"
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#6B6B6B",
          }}
        >
          Visuals
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={handleAddMap}
            disabled={!activity.map?.summary_polyline}
            className="w-full flex items-center gap-3 px-3 py-2 text-left transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              if (!(e.currentTarget as HTMLButtonElement).disabled) {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">
              Route Map
            </span>
            <span
              className="text-xs transition-colors group-hover:text-[#FC4C02]"
              style={{ color: "#6B6B6B" }}
            >
              +
            </span>
          </button>
          <button
            onClick={handleAddSplits}
            disabled={!activity.splits_metric?.length}
            className="w-full flex items-center gap-3 px-3 py-2 text-left transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              if (!(e.currentTarget as HTMLButtonElement).disabled) {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">
              Splits Chart
            </span>
            <span
              className="text-xs transition-colors group-hover:text-[#FC4C02]"
              style={{ color: "#6B6B6B" }}
            >
              +
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
