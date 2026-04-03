"use client";

import { useEffect, useState } from "react";
import { Group, Image, Rect } from "react-konva";
import type { CanvasElement } from "@/store/editorStore";
import type { StravaStreams } from "@/types/strava";
import { decodePolyline, polylineToSvgPath, getStartEndPoints } from "@/lib/polyline";

interface MapElementProps {
  element: CanvasElement;
  isSelected: boolean;
  color: string;
  polyline: string;
  streams: StravaStreams | null;
  onSelect: () => void;
  onDragMove: (e: any) => void;
  onDragEnd: (e: any) => void;
}

export default function MapElement({
  element,
  isSelected,
  color,
  polyline,
  streams,
  onSelect,
  onDragMove,
  onDragEnd,
}: MapElementProps) {
  const [image, setImage] = useState<HTMLCanvasElement | null>(null);
  const w = element.width || 600;
  const h = element.height || 600;

  useEffect(() => {
    if (!polyline) return;
    const coords = decodePolyline(polyline);
    if (!coords || coords.length === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    const svgPath = polylineToSvgPath(coords, w, h, 30);
    const points = getStartEndPoints(coords, w, h, 30);

    const path2d = new Path2D(svgPath);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke(path2d);

    ctx.beginPath();
    ctx.arc(points.start.x, points.start.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(points.end.x, points.end.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();

    setImage(canvas);
  }, [polyline, color, w, h]);

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
      {image && <Image image={image} width={w} height={h} />}

      {!image && (
        <Rect
          width={w}
          height={h}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.2)"
          cornerRadius={8}
        />
      )}

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
          cornerRadius={10}
          listening={false}
        />
      )}
    </Group>
  );
}
