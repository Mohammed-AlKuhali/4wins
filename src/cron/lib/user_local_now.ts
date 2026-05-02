export interface UserLocalTime {
  date: string;       // YYYY-MM-DD
  hour: number;       // 0-23
  minute: number;     // 0-59
  dayOfWeek: number;  // 0=Sun
  monthDay: number;   // 1-31
  monthYear: string;  // YYYY-MM
}

export function getUserLocalTime(timezone: string, now: Date = new Date()): UserLocalTime {
  const fmt = (type: Intl.DateTimeFormatPartTypes) =>
    new Intl.DateTimeFormat("en-US", { timeZone: timezone, [type]: "numeric" } as Intl.DateTimeFormatOptions)
      .formatToParts(now)
      .find((p) => p.type === type)?.value ?? "0";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hourRaw = parseInt(get("hour"), 10);
  const hour = hourRaw === 24 ? 0 : hourRaw;
  const minute = parseInt(get("minute"), 10);
  const weekdayStr = get("weekday");
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = weekdays.indexOf(weekdayStr);
  const monthDay = parseInt(day, 10);

  return {
    date: `${year}-${month}-${day}`,
    hour,
    minute,
    dayOfWeek,
    monthDay,
    monthYear: `${year}-${month}`,
  };
}
