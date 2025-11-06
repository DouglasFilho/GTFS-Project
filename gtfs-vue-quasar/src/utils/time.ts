export function toHour(time: string): number {
  // GTFS HH:MM:SS can exceed 24 hours
  const [h] = String(time || '0:0:0').split(':')
  const num = Number(h)
  return ((isFinite(num) ? num : 0) % 24 + 24) % 24
}

