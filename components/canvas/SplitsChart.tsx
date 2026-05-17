"use client";

import { useMemo } from "react";
import { Group, Image, Rect } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { CanvasElement } from "@/store/editorStore";
import type { Split } from "@/types/strava";

interface SplitsChartProps {
  element: CanvasElement;
  isSelected: boolean;
  color: string;
  splits: Split[];
  canvasScale: number;
  onSelect: () => void;
  onDragMove: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
}

export default function SplitsChart({
  element,
  isSelected,
  color,
  splits,
  canvasScale,
  onSelect,
  onDragMove,
  onDragEnd,
}: SplitsChartProps) {
  const w = (element.width || 400) * canvasScale;
  const h = (element.height || 120) * canvasScale;

  const image = useMemo(() => {
    if (!splits || splits.length === 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    const paces = splits.map((s) =>
      s.moving_time > 0 ? s.moving_time / (s.distance / 1000) : 0
    );
    const maxPace = Math.max(...paces);
    const minPace = Math.min(...paces.filter((p) => p > 0));
    const paceRange = maxPace - minPace || 1;

    const barW = (w - 20) / paces.length - 2;
    const padding = 10;

    paces.forEach((pace, i) => {
      if (pace === 0) return;
      const normalized = (pace - minPace) / paceRange;
      const barH = (h - padding * 2) * (1 - normalized * 0.6 + 0.1);
      const x = padding + i * (barW + 2);
      const y = h - padding - barH;

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6 + normalized * 0.4;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 3);
      ctx.fill();
    });

    return canvas;
  }, [splits, color, w, h]);

  return (
    <Group
      x={element.x}
      y={element.y}
      draggable
      opacity={element.opacity ?? 1}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    >
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {image && <Image image={image} width={w} height={h} />}

      {isSelected && (
        <Rect
          x={-2}
          y={-2}
          width={w + 4}
          height={h + 4}
          stroke="#FC4C02"
          strokeWidth={2}
          dash={[8, 4]}
          fill="transparent"
          cornerRadius={6}
          listening={false}
        />
      )}
    </Group>
  );
}
