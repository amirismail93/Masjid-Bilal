/**
 * Convert a 24-hour time string (e.g. "13:00", "09:30") to 12-hour format
 * (e.g. "1:00 PM", "9:30 AM"). Returns the original string if it can't be parsed
 * or is already in 12-hour format.
 */
export function to12hr(time: string | null | undefined): string {
  if (!time) return "";
  // Already in 12hr format (contains AM/PM)?
  if (/am|pm/i.test(time)) return time;
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time;
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
}
