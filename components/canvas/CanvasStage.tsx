"use client";

import { useCallback, useState } from "react";
import { Stage, Layer } from "react-konva";
import type { StravaActivity, StravaStreams } from "@/types/strava";
import { useEditorStore, CANVAS_DIMS, BASE_DISPLAY_W } from "@/store/editorStore";
import StatBlock from "./StatBlock";
import MapElement from "./MapElement";
import SplitsChart from "./SplitsChart";
import SnapGuides from "./SnapGuides";
import { computeSnap, type SnapLine } from "@/lib/snap";
import { formatDistance, formatTime, formatPace, formatSpeed, formatElevation, formatDate } from "@/lib/units";

interface CanvasStageProps {
  stageRef: React.MutableRefObject<any>;
  activity: StravaActivity;
  streams: StravaStreams | null;
}

function getActivityValue(
  key: string,
  activity: StravaActivity,
  unitSystem: "metric" | "imperial"
): string {
  switch (key) {
    case "distance":      return formatDistance(activity.distance, unitSystem);
    case "moving_time":   return formatTime(activity.moving_time);
    case "elapsed_time":  return formatTime(activity.elapsed_time);
    case "elevation":     return formatElevation(activity.total_elevation_gain, unitSystem);
    case "avg_pace":      return formatPace(activity.average_speed, unitSystem);
    case "max_speed":     return formatSpeed(activity.max_speed, unitSystem);
    case "avg_speed":     return formatSpeed(activity.average_speed, unitSystem);
    case "calories":      return activity.calories ? `${Math.round(activity.calories)} kcal` : "--";
    case "avg_hr":        return activity.average_heartrate ? `${Math.round(activity.average_heartrate)} bpm` : "--";
    case "max_hr":        return activity.max_heartrate ? `${Math.round(activity.max_heartrate)} bpm` : "--";
    case "avg_cadence":   return activity.average_cadence ? `${Math.round(activity.average_cadence)} spm` : "--";
    case "avg_power":     return activity.average_watts ? `${Math.round(activity.average_watts)} W` : "--";
    case "activity_name": return activity.name;
    case "date":          return formatDate(activity.start_date_local);
    case "sport_type":    return activity.sport_type || activity.type;
    case "gear":          return activity.gear?.name || "--";
    case "relative_effort": return activity.suffer_score ? String(activity.suffer_score) : "--";
    default:              return "--";
  }
}

export default function CanvasStage({ stageRef, activity, streams }: CanvasStageProps) {
  const {
    elements,
    selectedIds,
    unitSystem,
    theme,
    customColor,
    fontStyle,
    globalOpacity,
    orientation,
    previewMode,
    selectElement,
    clearSelection,
    updateElement,
    pushHistory,
  } = useEditorStore();

  const { width: canvasW, height: canvasH } = CANVAS_DIMS[orientation];
  const scale = BASE_DISPLAY_W / 1080; // fixed visual scale, same for both orientations
  const displayW = Math.round(canvasW * scale);
  const displayH = Math.round(canvasH * scale);

  const [activeSnaps, setActiveSnaps] = useState<SnapLine[]>([]);

  const getThemeColor = useCallback(() => {
    if (theme === "white") return "#ffffff";
    if (theme === "black") return "#000000";
    return customColor;
  }, [theme, customColor]);

  const getFontFamily = useCallback(() => "Inter, sans-serif", []);

  const getFontWeight = useCallback(() => {
    if (fontStyle === "bold") return "bold";
    if (fontStyle === "minimal") return "300";
    return "normal";
  }, [fontStyle]);

  const handleDragMove = useCallback(
    (e: any, id: string) => {
      const node = e.target;
      const el = elements.find((el) => el.id === id);
      const w = el?.width ?? (node.width() > 0 ? node.width() * node.scaleX() : 300);
      const h = el?.height ?? (node.height() > 0 ? node.height() * node.scaleY() : 100);

      const result = computeSnap(
        { x: node.x(), y: node.y() },
        { width: w, height: h },
        id,
        elements,
        { width: canvasW, height: canvasH }
      );

      node.x(result.x);
      node.y(result.y);
      setActiveSnaps(result.activeSnaps);
    },
    [elements, canvasW, canvasH]
  );

  const handleDragEnd = useCallback(
    (e: any, id: string) => {
      setActiveSnaps([]);
      updateElement(id, { x: e.target.x(), y: e.target.y() });
      pushHistory();
    },
    [updateElement, pushHistory]
  );

  return (
    <div className="relative" style={{ width: displayW, height: displayH, flexShrink: 0 }}>
      {/* Canvas background — neutral gray checkerboard so both black AND white
          text elements are visible while editing. Does not affect PNG export
          (Konva renders to a transparent canvas). In preview mode show black. */}
      {/* Mid-gray checkerboard: ~50% lightness so white AND black text are both
          legible. Does not affect PNG export (Konva renders transparent). */}
      <div
        className="absolute inset-0"
        style={previewMode ? { background: "#000000" } : {
          backgroundImage: `
            linear-gradient(45deg, #6E6E6E 25%, transparent 25%),
            linear-gradient(-45deg, #6E6E6E 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #6E6E6E 75%),
            linear-gradient(-45deg, transparent 75%, #6E6E6E 75%)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          backgroundColor: "#888888",
        }}
      />

      <Stage
        ref={stageRef}
        width={displayW}
        height={displayH}
        scaleX={scale}
        scaleY={scale}
        onClick={(e) => {
          if (e.target === e.target.getStage()) clearSelection();
        }}
      >
        {/* Main content layer — globalOpacity applied here, once */}
        <Layer opacity={globalOpacity}>
          {elements.map((el) => {
            const isSelected = selectedIds.includes(el.id);
            const color = el.color || getThemeColor();
            const fontFamily = getFontFamily();
            const fontWeight = el.fontWeight || getFontWeight();

            if (el.type === "stat") {
              return (
                <StatBlock
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  color={color}
                  fontFamily={fontFamily}
                  fontWeight={fontWeight}
                  value={getActivityValue(el.statKey!, activity, unitSystem)}
                  canvasWidth={canvasW}
                  onSelect={() => selectElement(el.id)}
                  onDragMove={(e) => handleDragMove(e, el.id)}
                  onDragEnd={(e) => handleDragEnd(e, el.id)}
                />
              );
            }

            if (el.type === "map") {
              return (
                <MapElement
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  color={color}
                  polyline={activity.map?.summary_polyline || ""}
                  streams={streams}
                  onSelect={() => selectElement(el.id)}
                  onDragMove={(e) => handleDragMove(e, el.id)}
                  onDragEnd={(e) => handleDragEnd(e, el.id)}
                />
              );
            }

            if (el.type === "splits") {
              return (
                <SplitsChart
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  color={color}
                  splits={activity.splits_metric || []}
                  onSelect={() => selectElement(el.id)}
                  onDragMove={(e) => handleDragMove(e, el.id)}
                  onDragEnd={(e) => handleDragEnd(e, el.id)}
                />
              );
            }

            return null;
          })}
        </Layer>

        {/* Snap guidelines layer */}
        {!previewMode && <SnapGuides snaps={activeSnaps} scale={scale} />}
      </Stage>
    </div>
  );
}
