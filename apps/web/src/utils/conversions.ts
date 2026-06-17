type DistanceType = "km" | "mile";

const METERS_PER_MILE = 1609.34398;

// --- Time ---

/** Converts mm:ss or hh:mm:ss string to total seconds */
export function timeToSeconds(time: string): number {
  const parts = time.split(":").map(Number);

  if (parts.some(isNaN)) throw new Error(`Invalid time format: "${time}"`);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];

  throw new Error(`Expected mm:ss or hh:mm:ss, got: "${time}"`);
}

/** Converts total seconds to mm:ss or hh:mm:ss string */
export function secondsToTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// --- Distance ---

/** Converts meters to km or miles */
export function metersToDistance(meters: number, distanceType: DistanceType): number {
  return distanceType === "km" ? meters / 1000 : meters / METERS_PER_MILE;
}

/** Converts km or miles back to meters */
export function distanceToMeters(distance: number, distanceType: DistanceType): number {
  return distanceType === "km" ? distance * 1000 : distance * METERS_PER_MILE;
}

// --- Pace ---

/** Converts sec/meter to a mm:ss/km or mm:ss/mile display string */
export function formatPace(secondsPerMeter: number, distanceType: DistanceType): string {
  const totalSeconds = distanceType === "km"
    ? secondsPerMeter * 1000
    : secondsPerMeter * METERS_PER_MILE;

  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);

  return `${m}:${String(s).padStart(2, "0")}`;
}

export function parsePace(pace: string): number | null {
  const [min, sec] = pace.split(":").map(Number);
  if (isNaN(min) || isNaN(sec)) return null;
  // Convert min/km → sec/m
  return Math.round((min * 60 + sec) / 1000);
}