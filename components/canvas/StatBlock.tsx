"use client";

import { Group, Text, Rect } from "react-konva";
import type { CanvasElement } from "@/store/editorStore";

interface StatBlockProps {
  element: CanvasElement;
  isSelected: boolean;
  color: string;
  fontFamily: string;
  fontWeight: string;
  globalOpacity: number;
  value: string;
  onSelect: () => void;
  onDragMove: (e: any) => void;
  onDragEnd: (e: any) => void;
}

export default function StatBlock({
  element,
  isSelected,
  color,
  fontFamily,
  fontWeight,
  globalOpacity,
  value,
  onSelect,
  onDragMove,
  onDragEnd,
}: StatBlockProps) {
  const fontSize = element.fontSize || 48;
  const labelSize = Math.round(fontSize * 0.4);
  const padding = element.background !== "none" ? 20 : 0;
  const bgWidth = (element.width || 300) + padding * 2;
  const bgHeight = fontSize + labelSize + 20 + padding * 2;

  return (
    <Group
      x={element.x}
      y={element.y}
      draggable
      opacity={element.opacity !== undefined ? element.opacity : globalOpacity}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    >
      {/* Background */}
      {element.background === "frosted" && (
        <Rect
          x={-padding}
          y={-padding}
          width={bgWidth}
          height={bgHeight}
          fill="rgba(255,255,255,0.15)"
          cornerRadius={16}
        />
      )}
      {element.background === "solid" && (
        <Rect
          x={-padding}
          y={-padding}
          width={bgWidth}
          height={bgHeight}
          fill={element.backgroundColor || "rgba(0,0,0,0.5)"}
          cornerRadius={16}
        />
      )}

      {/* Value */}
      <Text
        text={value}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fontStyle={fontWeight}
        fill={color}
        y={0}
      />

      {/* Label */}
      {element.label && (
        <Text
          text={element.label}
          fontSize={labelSize}
          fontFamily={fontFamily}
          fill={color}
          opacity={0.7}
          y={fontSize + 4}
          letterSpacing={2}
        />
      )}

      {/* Selection border */}
      {isSelected && (
        <Rect
          x={-padding - 2}
          y={-padding - 2}
          width={bgWidth + 4}
          height={bgHeight + 4}
          stroke="#f97316"
          strokeWidth={2}
          dash={[8, 4]}
          fill="transparent"
          cornerRadius={18}
          listening={false}
        />
      )}
    </Group>
  );
}
