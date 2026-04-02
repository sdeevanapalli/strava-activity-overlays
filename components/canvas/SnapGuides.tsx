"use client";

import { Layer, Line, Text, Circle } from "react-konva";

export type SnapLineType = "center" | "edge" | "margin";

export interface SnapLine {
  points: number[];
  type: SnapLineType;
  label?: string;
  /** When true this line spans only between two elements (bracket style), not the full canvas */
  bracket?: boolean;
}

interface SnapGuidesProps {
  snapLines: SnapLine[];
  /** Layer-level opacity for fade-out animation (0–1) */
  opacity: number;
  scale: number;
}

const SNAP_COLORS: Record<SnapLineType, string> = {
  center: "#FC4C02",
  edge: "rgba(255,255,255,0.7)",
  margin: "#3B82F6",
};

const STROKE_W: Record<SnapLineType, number> = {
  center: 1.5,
  edge: 1,
  margin: 1,
};

export default function SnapGuides({ snapLines, opacity, scale }: SnapGuidesProps) {
  if (snapLines.length === 0 || opacity <= 0) return null;

  // Find intersecting center lines for the crosshair dot
  const verticalCenter = snapLines.find(
    (l) => l.type === "center" && l.points[0] === l.points[2]
  );
  const horizontalCenter = snapLines.find(
    (l) => l.type === "center" && l.points[1] === l.points[3]
  );

  return (
    <Layer listening={false} opacity={opacity}>
      {snapLines.map((line, i) => {
        const color = SNAP_COLORS[line.type];
        const sw = STROKE_W[line.type] / scale;
        const isSolid = line.type === "center";

        return (
          <Line
            key={i}
            points={line.points}
            stroke={color}
            strokeWidth={sw}
            dash={isSolid ? undefined : [8 / scale, 4 / scale]}
            opacity={0.9}
          />
        );
      })}

      {/* Crosshair dot at center-to-center intersection */}
      {verticalCenter && horizontalCenter && (
        <Circle
          x={verticalCenter.points[0]}
          y={horizontalCenter.points[1]}
          radius={5 / scale}
          fill="#FC4C02"
          opacity={0.95}
        />
      )}

      {/* Margin distance labels */}
      {snapLines
        .filter((l) => l.type === "margin" && l.label)
        .map((line, i) => {
          const isVertical = line.points[0] === line.points[2];
          const midX = (line.points[0] + line.points[2]) / 2;
          const midY = (line.points[1] + line.points[3]) / 2;
          const offX = isVertical ? 6 / scale : 0;
          const offY = isVertical ? 0 : -14 / scale;
          return (
            <Text
              key={`lbl-${i}`}
              x={midX + offX}
              y={midY + offY}
              text={line.label}
              fontSize={11 / scale}
              fill="#3B82F6"
              opacity={0.95}
            />
          );
        })}
    </Layer>
  );
}
