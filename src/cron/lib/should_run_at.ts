import type { UserLocalTime } from "./user_local_now.js";

function roundTo5Min(h: number, m: number): string {
  const slot = Math.floor(m / 5) * 5;
  return `${String(h).padStart(2, "0")}:${String(slot).padStart(2, "0")}`;
}

function cueSlot(cueTimeLocal: string | null): string | null {
  if (!cueTimeLocal) return null;
  const [h, m] = cueTimeLocal.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return roundTo5Min(h, m);
}

export function shouldRunMorningCue(userLocal: UserLocalTime, cueTimeLocal: string | null): boolean {
  const slot = cueSlot(cueTimeLocal) ?? "07:00";
  const current = roundTo5Min(userLocal.hour, userLocal.minute);
  return current === slot;
}

export function shouldRunAt4am(userLocal: UserLocalTime): boolean {
  return userLocal.hour === 4 && userLocal.minute < 5;
}

export function shouldRunMonthly(userLocal: UserLocalTime): boolean {
  return userLocal.monthDay === 1 && userLocal.hour === 0 && userLocal.minute < 5;
}

export function shouldRunSundayEvening(userLocal: UserLocalTime, cueTimeLocal: string | null): boolean {
  if (userLocal.dayOfWeek !== 0) return false;
  const slot = cueSlot(cueTimeLocal) ?? "20:00";
  const current = roundTo5Min(userLocal.hour, userLocal.minute);
  return current === slot;
}
