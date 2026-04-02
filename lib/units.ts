export type UnitSystem = "metric" | "imperial";

export function formatDistance(meters: number, unit: UnitSystem): string {
  if (unit === "imperial") {
    const miles = meters / 1609.344;
    return `${miles.toFixed(2)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}

export function formatPace(metersPerSec: number, unit: UnitSystem): string {
  if (metersPerSec === 0) return "--";
  if (unit === "imperial") {
    const secPerMile = 1609.344 / metersPerSec;
    const min = Math.floor(secPerMile / 60);
    const sec = Math.round(secPerMile % 60);
    return `${min}:${String(sec).padStart(2, "0")} /mi`;
  }
  const secPerKm = 1000 / metersPerSec;
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${String(sec).padStart(2, "0")} /km`;
}

export function formatSpeed(metersPerSec: number, unit: UnitSystem): string {
  if (unit === "imperial") {
    const mph = metersPerSec * 2.23694;
    return `${mph.toFixed(1)} mph`;
  }
  const kph = metersPerSec * 3.6;
  return `${kph.toFixed(1)} km/h`;
}

export function formatElevation(meters: number, unit: UnitSystem): string {
  if (unit === "imperial") {
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft`;
  }
  return `${Math.round(meters)} m`;
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }) + " · " + date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
