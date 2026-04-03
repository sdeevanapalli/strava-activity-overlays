"use client";

import { useEditorStore } from "@/store/editorStore";
import type { StravaActivity, StravaStreams } from "@/types/strava";
import type { CanvasElement } from "@/store/editorStore";

interface StatChip {
  key: string;
  label: string;
  available: (activity: StravaActivity) => boolean;
}

const STAT_CHIPS: StatChip[] = [
  { key: "distance",       label: "Distance",         available: () => true },
  { key: "moving_time",    label: "Moving Time",      available: () => true },
  { key: "elapsed_time",   label: "Elapsed Time",     available: () => true },
  { key: "elevation",      label: "Elevation Gain",   available: () => true },
  { key: "avg_pace",       label: "Avg Pace",         available: (a) => !!a.average_speed },
  { key: "max_speed",      label: "Max Speed",        available: (a) => !!a.max_speed },
  { key: "avg_speed",      label: "Avg Speed",        available: (a) => !!a.average_speed },
  { key: "calories",       label: "Calories",         available: (a) => !!a.calories },
  { key: "avg_hr",         label: "Avg Heart Rate",   available: (a) => !!a.average_heartrate },
  { key: "max_hr",         label: "Max Heart Rate",   available: (a) => !!a.max_heartrate },
  { key: "avg_cadence",    label: "Avg Cadence",      available: (a) => !!a.average_cadence },
  { key: "avg_power",      label: "Avg Power",        available: (a) => !!a.average_watts },
  { key: "activity_name",  label: "Activity Name",    available: () => true },
  { key: "date",           label: "Date & Time",      available: () => true },
  { key: "sport_type",     label: "Sport Type",       available: () => true },
  { key: "gear",           label: "Gear",             available: (a) => !!a.gear },
  { key: "relative_effort",label: "Relative Effort",  available: (a) => !!a.suffer_score },
];

interface LeftPanelProps {
  activity: StravaActivity;
  streams: StravaStreams | null;
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "#6B6B6B",
  marginBottom: 10,
  display: "block",
};

export default function LeftPanel({ activity, streams }: LeftPanelProps) {
  const { addElement } = useEditorStore();

  const handleAddStat = (chip: StatChip) => {
    const newEl: CanvasElement = {
      id: `${chip.key}-${Date.now()}`,
      type: "stat",
      statKey: chip.key,
      label: chip.label.toUpperCase(),
      x: -1,
      y: -1,
      fontSize: 48,
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

  const itemStyle: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid #E5E5E5",
    borderRadius: 4,
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <span style={SECTION_LABEL}>Stats</span>
        <div className="space-y-1.5">
          {availableChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => handleAddStat(chip)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left transition-all"
              style={itemStyle}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#F5F5F5";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#FC4C02";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E5";
              }}
            >
              <span className="text-sm flex-1" style={{ color: "#111111" }}>
                {chip.label}
              </span>
              <span className="text-xs" style={{ color: "#6B6B6B" }}>+</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #E5E5E5" }} />

      <div>
        <span style={SECTION_LABEL}>Visuals</span>
        <div className="space-y-1.5">
          <button
            onClick={handleAddMap}
            disabled={!activity.map?.summary_polyline}
            className="w-full flex items-center gap-3 px-3 py-2 text-left transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={itemStyle}
            onMouseEnter={(e) => {
              if (!(e.currentTarget as HTMLButtonElement).disabled) {
                (e.currentTarget as HTMLButtonElement).style.background = "#F5F5F5";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#FC4C02";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E5";
            }}
          >
            <span className="text-sm flex-1" style={{ color: "#111111" }}>Route Map</span>
            <span className="text-xs" style={{ color: "#6B6B6B" }}>+</span>
          </button>

          <button
            onClick={handleAddSplits}
            disabled={!activity.splits_metric?.length}
            className="w-full flex items-center gap-3 px-3 py-2 text-left transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={itemStyle}
            onMouseEnter={(e) => {
              if (!(e.currentTarget as HTMLButtonElement).disabled) {
                (e.currentTarget as HTMLButtonElement).style.background = "#F5F5F5";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#FC4C02";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E5";
            }}
          >
            <span className="text-sm flex-1" style={{ color: "#111111" }}>Splits Chart</span>
            <span className="text-xs" style={{ color: "#6B6B6B" }}>+</span>
          </button>
        </div>
      </div>
    </div>
  );
}
