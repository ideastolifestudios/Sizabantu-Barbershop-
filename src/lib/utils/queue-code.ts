export function generateQueueCode(position: number): string {
  return `SZB-${String(position).padStart(3, "0")}`;
}

export function generateSessionToken(len = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function estimateWaitMinutes(position: number, avgMinutes = 20): number {
  return Math.max(0, (position - 1) * avgMinutes);
}

export function formatWait(minutes: number): string {
  if (minutes === 0) return "You're next!";
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `~${h}h ${m}min` : `~${h}h`;
}
