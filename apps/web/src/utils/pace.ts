export function parsePace(pace: string): number | null {
  const [min, sec] = pace.split(":").map(Number);
  if (isNaN(min) || isNaN(sec)) return null;
  // Convert min/km → sec/m
  return Math.round((min * 60 + sec) / 1000);
}