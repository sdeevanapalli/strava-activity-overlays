"use client";

import { Layer, Line } from "react-konva";
import type { SnapLine } from "@/lib/snap";

interface SnapGuidesProps {
  snaps: SnapLine[];
  scale: number;
}

const COLORS: Record<SnapLine["color"], string> = {
  center: "#FC4C02",
  edge: "rgba(255, 255, 255, 0.9)",
  "canvas-edge": "rgba(255, 255, 255, 0.6)",
};

export default function SnapGuides({ snaps, scale }: SnapGuidesProps) {
  if (snaps.length === 0) return null;

  const sw = 1 / scale;

  return (
    <Layer listening={false}>
      {snaps.map((snap, i) => {
        const points =
          snap.type === "vertical"
            ? [snap.position, snap.start, snap.position, snap.end]
            : [snap.start, snap.position, snap.end, snap.position];

        return (
          <Line
            key={i}
            points={points}
            stroke={COLORS[snap.color]}
            strokeWidth={sw}
            listening={false}
          />
        );
      })}
    </Layer>
  );
}
