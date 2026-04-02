"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Stage, Layer, Rect, Line } from "react-konva";
import type Konva from "konva";
import type { StravaActivity, StravaStreams } from "@/types/strava";
import { useEditorStore } from "@/store/editorStore";
import StatBlock from "./StatBlock";
import MapElement from "./MapElement";
import SplitsChart from "./SplitsChart";
import SnapGuides, { type SnapLine } from "./SnapGuides";
import { formatDistance, formatTime, formatPace, formatSpeed, formatElevation, formatDate } from "@/lib/units";

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const DISPLAY_W = 380;
const DISPLAY_H = (DISPLAY_W / CANVAS_W) * CANVAS_H;

// Snap thresholds
const CENTER_SNAP_THRESHOLD = 8;
const EDGE_SNAP_THRESHOLD = 12;
const MARGIN_SNAP_THRESHOLD = 16;
const MARGIN_DIST = 40;

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
    case "distance":
      return formatDistance(activity.distance, unitSystem);
    case "moving_time":
      return formatTime(activity.moving_time);
    case "elapsed_time":
      return formatTime(activity.elapsed_time);
    case "elevation":
      return formatElevation(activity.total_elevation_gain, unitSystem);
    case "avg_pace":
      return formatPace(activity.average_speed, unitSystem);
    case "max_speed":
      return formatSpeed(activity.max_speed, unitSystem);
    case "avg_speed":
      return formatSpeed(activity.average_speed, unitSystem);
    case "calories":
      return activity.calories ? `${Math.round(activity.calories)} kcal` : "--";
    case "avg_hr":
      return activity.average_heartrate ? `${Math.round(activity.average_heartrate)} bpm` : "--";
    case "max_hr":
      return activity.max_heartrate ? `${Math.round(activity.max_heartrate)} bpm` : "--";
    case "avg_cadence":
      return activity.average_cadence ? `${Math.round(activity.average_cadence)} spm` : "--";
    case "avg_power":
      return activity.average_watts ? `${Math.round(activity.average_watts)} W` : "--";
    case "activity_name":
      return activity.name;
    case "date":
      return formatDate(activity.start_date_local);
    case "sport_type":
      return activity.sport_type || activity.type;
    case "gear":
      return activity.gear?.name || "--";
    case "relative_effort":
      return activity.suffer_score ? String(activity.suffer_score) : "--";
    default:
      return "--";
  }
}

export default function CanvasStage({ stageRef, activity, streams }: CanvasStageProps) {
  const scale = DISPLAY_W / CANVAS_W;
  const {
    elements,
    selectedIds,
    unitSystem,
    theme,
    customColor,
    fontStyle,
    globalOpacity,
    previewMode,
    selectElement,
    clearSelection,
    updateElement,
    pushHistory,
  } = useEditorStore();

  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);

  const getThemeColor = useCallback(() => {
    if (theme === "white") return "#ffffff";
    if (theme === "black") return "#000000";
    return customColor;
  }, [theme, customColor]);

  const getFontFamily = useCallback(() => {
    return "Inter, sans-serif";
  }, []);

  const getFontWeight = useCallback(() => {
    if (fontStyle === "bold") return "bold";
    if (fontStyle === "minimal") return "300";
    return "normal";
  }, [fontStyle]);

  // Compute snap targets
  const getSnapTargets = useCallback(
    (dragId: string) => {
      const targets = {
        x: [0, CANVAS_W / 2, CANVAS_W, MARGIN_DIST, CANVAS_W - MARGIN_DIST],
        y: [0, CANVAS_H / 2, CANVAS_H, MARGIN_DIST, CANVAS_H - MARGIN_DIST],
        elements: elements.filter((el) => el.id !== dragId),
      };
      return targets;
    },
    [elements]
  );

  const snapValue = (val: number, targets: number[], threshold: number) => {
    for (const t of targets) {
      if (Math.abs(val - t) < threshold) return { snapped: t, diff: t - val };
    }
    return { snapped: val, diff: 0 };
  };

  const handleDragMove = useCallback(
    (e: any, id: string) => {
      const node = e.target;
      const x = node.x();
      const y = node.y();
      const w = node.width() || 200;
      const h = node.height() || 50;

      const { x: xTargets, y: yTargets, elements: otherElements } = getSnapTargets(id);
      const lines: SnapLine[] = [];

      // Build extended x/y targets from other elements
      const allXTargets = [...xTargets];
      const allYTargets = [...yTargets];
      otherElements.forEach((el) => {
        const elW = el.width || 200;
        const elH = el.height || 50;
        allXTargets.push(el.x, el.x + elW / 2, el.x + elW);
        allYTargets.push(el.y, el.y + elH / 2, el.y + elH);
      });

      // Snap X
      const snapLeft = snapValue(x, allXTargets, EDGE_SNAP_THRESHOLD);
      const snapCenterX = snapValue(x + w / 2, allXTargets, CENTER_SNAP_THRESHOLD);
      const snapRight = snapValue(x + w, allXTargets, EDGE_SNAP_THRESHOLD);

      let newX = x;
      if (Math.abs(snapCenterX.diff) <= CENTER_SNAP_THRESHOLD) {
        newX = snapCenterX.snapped - w / 2;
        // Is it canvas center?
        const isCanvasCenter = Math.abs(snapCenterX.snapped - CANVAS_W / 2) < 2;
        lines.push({
          points: [snapCenterX.snapped, 0, snapCenterX.snapped, CANVAS_H],
          type: "center",
        });
      } else if (Math.abs(snapLeft.diff) <= EDGE_SNAP_THRESHOLD) {
        newX = snapLeft.snapped;
        // Check if snapping to margin
        const isMargin = Math.abs(snapLeft.snapped - MARGIN_DIST) < 2 || Math.abs(snapLeft.snapped - (CANVAS_W - MARGIN_DIST)) < 2;
        lines.push({
          points: [snapLeft.snapped, 0, snapLeft.snapped, CANVAS_H],
          type: isMargin ? "margin" : "edge",
          label: isMargin ? `${MARGIN_DIST}px` : undefined,
        });
      } else if (Math.abs(snapRight.diff) <= EDGE_SNAP_THRESHOLD) {
        newX = snapRight.snapped - w;
        const isMargin = Math.abs(snapRight.snapped - MARGIN_DIST) < 2 || Math.abs(snapRight.snapped - (CANVAS_W - MARGIN_DIST)) < 2;
        lines.push({
          points: [snapRight.snapped, 0, snapRight.snapped, CANVAS_H],
          type: isMargin ? "margin" : "edge",
          label: isMargin ? `${MARGIN_DIST}px` : undefined,
        });
      }

      // Snap Y
      const snapTop = snapValue(y, allYTargets, EDGE_SNAP_THRESHOLD);
      const snapCenterY = snapValue(y + h / 2, allYTargets, CENTER_SNAP_THRESHOLD);
      const snapBottom = snapValue(y + h, allYTargets, EDGE_SNAP_THRESHOLD);

      let newY = y;
      if (Math.abs(snapCenterY.diff) <= CENTER_SNAP_THRESHOLD) {
        newY = snapCenterY.snapped - h / 2;
        lines.push({
          points: [0, snapCenterY.snapped, CANVAS_W, snapCenterY.snapped],
          type: "center",
        });
      } else if (Math.abs(snapTop.diff) <= EDGE_SNAP_THRESHOLD) {
        newY = snapTop.snapped;
        const isMargin = Math.abs(snapTop.snapped - MARGIN_DIST) < 2 || Math.abs(snapTop.snapped - (CANVAS_H - MARGIN_DIST)) < 2;
        lines.push({
          points: [0, snapTop.snapped, CANVAS_W, snapTop.snapped],
          type: isMargin ? "margin" : "edge",
          label: isMargin ? `${MARGIN_DIST}px` : undefined,
        });
      } else if (Math.abs(snapBottom.diff) <= EDGE_SNAP_THRESHOLD) {
        newY = snapBottom.snapped - h;
        const isMargin = Math.abs(snapBottom.snapped - MARGIN_DIST) < 2 || Math.abs(snapBottom.snapped - (CANVAS_H - MARGIN_DIST)) < 2;
        lines.push({
          points: [0, snapBottom.snapped, CANVAS_W, snapBottom.snapped],
          type: isMargin ? "margin" : "edge",
          label: isMargin ? `${MARGIN_DIST}px` : undefined,
        });
      }

      node.x(newX);
      node.y(newY);
      setSnapLines(lines);
    },
    [getSnapTargets]
  );

  const handleDragEnd = useCallback(
    (e: any, id: string) => {
      setSnapLines([]);
      updateElement(id, { x: e.target.x(), y: e.target.y() });
      pushHistory();
    },
    [updateElement, pushHistory]
  );

  return (
    <div className="relative" style={{ width: DISPLAY_W, height: DISPLAY_H }}>
      {/* Dot-grid background (editor only) */}
      {!previewMode && (
        <div
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            backgroundColor: "#111111",
          }}
        />
      )}

      <Stage
        ref={stageRef}
        width={DISPLAY_W}
        height={DISPLAY_H}
        scaleX={scale}
        scaleY={scale}
        style={{ position: "relative", zIndex: 1 }}
        onClick={(e) => {
          if (e.target === e.target.getStage()) {
            clearSelection();
          }
        }}
      >
        {/* Main layer */}
        <Layer>
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
                  globalOpacity={globalOpacity}
                  value={getActivityValue(el.statKey!, activity, unitSystem)}
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
                  globalOpacity={globalOpacity}
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
                  globalOpacity={globalOpacity}
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

        {/* Snap guides layer */}
        {!previewMode && (
          <SnapGuides snapLines={snapLines} scale={scale} />
        )}
      </Stage>
    </div>
  );
}
