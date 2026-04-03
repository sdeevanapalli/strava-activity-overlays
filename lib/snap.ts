import type { CanvasElement } from "@/store/editorStore";

export type SnapLine = {
  type: "horizontal" | "vertical";
  /** x coordinate for vertical lines, y coordinate for horizontal lines */
  position: number;
  /** start of the line span (y for vertical, x for horizontal) */
  start: number;
  /** end of the line span */
  end: number;
  color: "center" | "edge" | "canvas-edge";
};

export type SnapResult = {
  x: number;
  y: number;
  activeSnaps: SnapLine[];
};

const DEFAULT_THRESHOLDS = { center: 16, edge: 10, canvasEdge: 12 };

/**
 * Pure function — no Konva imports.
 * Returns the magnetically snapped position and the guidelines to draw.
 * All coordinates are in canvas space (1080×1920), not screen pixels.
 */
export function computeSnap(
  pos: { x: number; y: number },
  size: { width: number; height: number },
  elementId: string,
  allElements: CanvasElement[],
  canvas: { width: number; height: number },
  thresholds = DEFAULT_THRESHOLDS
): SnapResult {
  const { x, y } = pos;
  const { width: w, height: h } = size;
  const others = allElements.filter((el) => el.id !== elementId);
  const snaps: SnapLine[] = [];

  // ── X axis ──────────────────────────────────────────────────────────────
  let snappedX = x;
  const leftEdge = x;
  const rightEdge = x + w;
  const centerX = x + w / 2;
  const canvasCenterX = canvas.width / 2;

  xSnap: {
    // Canvas horizontal center line
    if (Math.abs(centerX - canvasCenterX) <= thresholds.center) {
      snappedX = canvasCenterX - w / 2;
      snaps.push({ type: "vertical", position: canvasCenterX, start: 0, end: canvas.height, color: "center" });
      break xSnap;
    }
    // Canvas left edge
    if (Math.abs(leftEdge) <= thresholds.canvasEdge) {
      snappedX = 0;
      snaps.push({ type: "vertical", position: 0, start: 0, end: canvas.height, color: "canvas-edge" });
      break xSnap;
    }
    // Canvas right edge
    if (Math.abs(rightEdge - canvas.width) <= thresholds.canvasEdge) {
      snappedX = canvas.width - w;
      snaps.push({ type: "vertical", position: canvas.width, start: 0, end: canvas.height, color: "canvas-edge" });
      break xSnap;
    }
    // Element-to-element X snaps
    for (const other of others) {
      const ow = other.width || 300;
      const oh = other.height || 100;
      const oLeft = other.x;
      const oRight = other.x + ow;
      const oCenterX = other.x + ow / 2;
      const vStart = Math.min(y, other.y);
      const vEnd = Math.max(y + h, other.y + oh);

      if (Math.abs(leftEdge - oLeft) <= thresholds.edge) {
        snappedX = oLeft;
        snaps.push({ type: "vertical", position: oLeft, start: vStart, end: vEnd, color: "edge" });
        break xSnap;
      }
      if (Math.abs(leftEdge - oRight) <= thresholds.edge) {
        snappedX = oRight;
        snaps.push({ type: "vertical", position: oRight, start: vStart, end: vEnd, color: "edge" });
        break xSnap;
      }
      if (Math.abs(rightEdge - oRight) <= thresholds.edge) {
        snappedX = oRight - w;
        snaps.push({ type: "vertical", position: oRight, start: vStart, end: vEnd, color: "edge" });
        break xSnap;
      }
      if (Math.abs(rightEdge - oLeft) <= thresholds.edge) {
        snappedX = oLeft - w;
        snaps.push({ type: "vertical", position: oLeft, start: vStart, end: vEnd, color: "edge" });
        break xSnap;
      }
      if (Math.abs(centerX - oCenterX) <= thresholds.edge) {
        snappedX = oCenterX - w / 2;
        snaps.push({ type: "vertical", position: oCenterX, start: vStart, end: vEnd, color: "edge" });
        break xSnap;
      }
    }
  }

  // ── Y axis ──────────────────────────────────────────────────────────────
  let snappedY = y;
  const topEdge = y;
  const bottomEdge = y + h;
  const centerY = y + h / 2;
  const canvasCenterY = canvas.height / 2;

  ySnap: {
    // Canvas vertical center line
    if (Math.abs(centerY - canvasCenterY) <= thresholds.center) {
      snappedY = canvasCenterY - h / 2;
      snaps.push({ type: "horizontal", position: canvasCenterY, start: 0, end: canvas.width, color: "center" });
      break ySnap;
    }
    // Canvas top edge
    if (Math.abs(topEdge) <= thresholds.canvasEdge) {
      snappedY = 0;
      snaps.push({ type: "horizontal", position: 0, start: 0, end: canvas.width, color: "canvas-edge" });
      break ySnap;
    }
    // Canvas bottom edge
    if (Math.abs(bottomEdge - canvas.height) <= thresholds.canvasEdge) {
      snappedY = canvas.height - h;
      snaps.push({ type: "horizontal", position: canvas.height, start: 0, end: canvas.width, color: "canvas-edge" });
      break ySnap;
    }
    // Element-to-element Y snaps (use snappedX for horizontal guideline span)
    for (const other of others) {
      const ow = other.width || 300;
      const oh = other.height || 100;
      const oTop = other.y;
      const oBottom = other.y + oh;
      const oCenterY = other.y + oh / 2;
      const hStart = Math.min(snappedX, other.x);
      const hEnd = Math.max(snappedX + w, other.x + ow);

      if (Math.abs(topEdge - oTop) <= thresholds.edge) {
        snappedY = oTop;
        snaps.push({ type: "horizontal", position: oTop, start: hStart, end: hEnd, color: "edge" });
        break ySnap;
      }
      if (Math.abs(topEdge - oBottom) <= thresholds.edge) {
        snappedY = oBottom;
        snaps.push({ type: "horizontal", position: oBottom, start: hStart, end: hEnd, color: "edge" });
        break ySnap;
      }
      if (Math.abs(bottomEdge - oBottom) <= thresholds.edge) {
        snappedY = oBottom - h;
        snaps.push({ type: "horizontal", position: oBottom, start: hStart, end: hEnd, color: "edge" });
        break ySnap;
      }
      if (Math.abs(bottomEdge - oTop) <= thresholds.edge) {
        snappedY = oTop - h;
        snaps.push({ type: "horizontal", position: oTop, start: hStart, end: hEnd, color: "edge" });
        break ySnap;
      }
      if (Math.abs(centerY - oCenterY) <= thresholds.edge) {
        snappedY = oCenterY - h / 2;
        snaps.push({ type: "horizontal", position: oCenterY, start: hStart, end: hEnd, color: "edge" });
        break ySnap;
      }
    }
  }

  return { x: snappedX, y: snappedY, activeSnaps: snaps };
}
