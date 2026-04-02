import polyline from "@mapbox/polyline";

export interface Point {
  x: number;
  y: number;
}

export function decodePolyline(encoded: string): [number, number][] {
  return polyline.decode(encoded);
}

export function polylineToSvgPath(
  coords: [number, number][],
  width: number,
  height: number,
  padding = 20
): string {
  if (!coords || coords.length === 0) return "";

  const lats = coords.map((c) => c[0]);
  const lngs = coords.map((c) => c[1]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const availW = width - padding * 2;
  const availH = height - padding * 2;

  // Maintain aspect ratio
  const scale = Math.min(availW / lngRange, availH / latRange);
  const offsetX = (availW - lngRange * scale) / 2 + padding;
  const offsetY = (availH - latRange * scale) / 2 + padding;

  const points = coords.map(([lat, lng]) => {
    const x = (lng - minLng) * scale + offsetX;
    const y = (maxLat - lat) * scale + offsetY; // flip Y
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return `M ${points.join(" L ")}`;
}

export function getStartEndPoints(
  coords: [number, number][],
  width: number,
  height: number,
  padding = 20
): { start: Point; end: Point } {
  if (!coords || coords.length < 2) return { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };

  const lats = coords.map((c) => c[0]);
  const lngs = coords.map((c) => c[1]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const availW = width - padding * 2;
  const availH = height - padding * 2;

  const scale = Math.min(availW / lngRange, availH / latRange);
  const offsetX = (availW - lngRange * scale) / 2 + padding;
  const offsetY = (availH - latRange * scale) / 2 + padding;

  const toPoint = ([lat, lng]: [number, number]): Point => ({
    x: (lng - minLng) * scale + offsetX,
    y: (maxLat - lat) * scale + offsetY,
  });

  return {
    start: toPoint(coords[0]),
    end: toPoint(coords[coords.length - 1]),
  };
}
