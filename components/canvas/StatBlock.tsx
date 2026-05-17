"use client";

import { useRef, useEffect } from "react";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { Group, Text, Rect } from "react-konva";
import type { CanvasElement } from "@/store/editorStore";

interface StatBlockProps {
  element: CanvasElement;
  isSelected: boolean;
  color: string;
  fontFamily: string;
  fontWeight: string;
  value: string;
  canvasWidth: number;
  canvasScale: number;
  onSelect: () => void;
  onDragMove: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
}

const BASE_H_PAD  = 24;  // horizontal padding per side (inside block)
const BASE_V_PAD  = 12;  // top and bottom padding
const BASE_GAP    = 8;   // gap between value and label
const BASE_MARGIN = 20;  // minimum distance from canvas edge

/**
 * Measure text width using a temporary Konva.Text node.
 * This is identical to what Konva uses internally, so measured === rendered.
 */
function measureKonvaText(
  text: string,
  fontStyle: string,
  fontSize: number,
  fontFamily: string
): number {
  if (typeof window === "undefined") {
    // SSR fallback — rough estimate
    return Math.ceil(text.length * fontSize * 0.55);
  }
  const node = new Konva.Text({ text, fontStyle, fontSize, fontFamily });
  const w = Math.ceil(node.getTextWidth());
  node.destroy();
  return w;
}

/**
 * Find the largest fontSize at which the value fits on one line within maxWidth.
 * Returns { effectiveFontSize, valueTextW }.
 */
function fitFontSize(
  value: string,
  fontWeight: string,
  fontSize: number,
  fontFamily: string,
  maxWidth: number,
  horizontalPadding: number
): { effectiveFontSize: number; valueTextW: number } {
  let fs = fontSize;
  while (fs > 10) {
    const w = measureKonvaText(value, fontWeight, fs, fontFamily);
    if (w + horizontalPadding * 2 <= maxWidth) return { effectiveFontSize: fs, valueTextW: w };
    fs = Math.max(10, fs - 2);
  }
  return {
    effectiveFontSize: 10,
    valueTextW: measureKonvaText(value, fontWeight, 10, fontFamily),
  };
}

export default function StatBlock({
  element,
  isSelected,
  color,
  fontFamily,
  fontWeight,
  value,
  canvasWidth,
  canvasScale,
  onSelect,
  onDragMove,
  onDragEnd,
}: StatBlockProps) {
  const groupRef = useRef<Konva.Group>(null);

  const hPad = BASE_H_PAD * canvasScale;
  const vPad = BASE_V_PAD * canvasScale;
  const gap = BASE_GAP * canvasScale;
  const margin = BASE_MARGIN * canvasScale;

  // ── Layout constants derived from fontSize ────────────────────────────────
  const requestedSize  = (element.fontSize || 80) * canvasScale;
  const maxBlockW      = canvasWidth - margin * 2;

  // Shrink fontSize until value fits on one line; never wrap
  const { effectiveFontSize, valueTextW } = fitFontSize(
    value, fontWeight, requestedSize, fontFamily, maxBlockW, hPad
  );

  const labelFontSize  = Math.max(1, Math.round(effectiveFontSize * 0.35));
  const letterSpacing  = Math.max(1, Math.round(effectiveFontSize * 0.04));

  // ── Block dimensions ──────────────────────────────────────────────────────
  // Width: fit the value text exactly (label is center-aligned inside same width)
  const blockW = Math.min(valueTextW + hPad * 2, maxBlockW);

  // Height formula (all terms explicit):
  //   V_PAD + effectiveFontSize + GAP + labelFontSize + V_PAD
  const blockH = vPad + effectiveFontSize + gap + labelFontSize + vPad;

  // ── Y positions — every value derived from the formula ────────────────────
  const valueY = vPad;
  const labelY = vPad + effectiveFontSize + gap;

  // ── Background box ────────────────────────────────────────────────────────
  const hasBg = element.background === "frosted" || element.background === "solid";

  // ── Force layer redraw when any sizing input changes ──────────────────────
  useEffect(() => {
    const layer = groupRef.current?.getLayer?.();
    if (layer) layer.batchDraw();
  }, [effectiveFontSize, value, element.background, element.opacity, color, canvasScale]);

  return (
    <Group
      ref={groupRef}
      x={element.x}
      y={element.y}
      draggable
      opacity={element.opacity ?? 1}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    >
      {/* Background covers the full block */}
      {element.background === "frosted" && (
        <Rect
          x={0} y={0} width={blockW} height={blockH}
          fill="rgba(255,255,255,0.15)"
          cornerRadius={Math.round(effectiveFontSize * 0.18)}
        />
      )}
      {element.background === "solid" && (
        <Rect
          x={0} y={0} width={blockW} height={blockH}
          fill={element.backgroundColor || "rgba(0,0,0,0.5)"}
          cornerRadius={Math.round(effectiveFontSize * 0.18)}
        />
      )}

      {/* Value — pre-measured width, wrap disabled, single line guaranteed */}
      <Text
        text={value}
        fontSize={effectiveFontSize}
        fontFamily={fontFamily}
        fontStyle={fontWeight}
        fill={color}
        x={0}
        y={valueY}
        width={blockW}
        height={effectiveFontSize}
        align="center"
        wrap="none"
        ellipsis={false}
      />

      {/* Label — same width as block, center-aligned, strictly below value */}
      {element.label && (
        <Text
          text={element.label}
          fontSize={labelFontSize}
          fontFamily={fontFamily}
          fontStyle="normal"
          fill={color}
          opacity={0.55}
          x={0}
          y={labelY}
          width={blockW}
          height={labelFontSize}
          align="center"
          wrap="none"
          ellipsis={false}
          letterSpacing={letterSpacing}
        />
      )}

      {/* Selection border wraps the full block */}
      {isSelected && (
        <Rect
          x={-2} y={-2}
          width={blockW + 4} height={blockH + 4}
          stroke="#FC4C02"
          strokeWidth={2}
          dash={[8, 4]}
          fill="transparent"
          cornerRadius={hasBg ? Math.round(effectiveFontSize * 0.18) + 2 : 4}
          listening={false}
        />
      )}
    </Group>
  );
}
