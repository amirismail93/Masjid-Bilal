/* ------------------------------------------------------------------ */
/*  Masjidal API Integration                                          */
/*  Endpoint: https://masjidal.com/api/v1/time/range                  */
/* ------------------------------------------------------------------ */

export interface PrayerEntry {
  name: string;
  adhan: string;
  iqama: string;
}

export interface DayTimes {
  date: string;
  hijriDate: string;
  hijriMonth: string;
  dayName: string;
  sunrise: string;
  prayers: PrayerEntry[];
  isRamadan: boolean;
}

export interface MonthDay {
  day: number;
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  fajrIqama: string;
  dhuhrIqama: string;
  asrIqama: string;
  maghribIqama: string;
  ishaIqama: string;
}

const MASJID_ID = process.env.NEXT_PUBLIC_MASJIDAL_MASJID_ID ?? "";
const BASE_URL = "https://masjidal.com/api/v1/time/range";

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

interface MasjdalSalah {
  date: string;
  hijri_date: string;
  hijri_month: string;
  day: string;
  fajr: string;
  sunrise: string;
  zuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface MasjdalIqamah {
  date: string;
  fajr: string;
  zuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah1?: string;
  jummah2?: string;
}

interface MasjdalResponse {
  status: string;
  data: {
    salah: MasjdalSalah[];
    iqamah: MasjdalIqamah[];
  };
}

async function fetchRange(from: string, to: string): Promise<MasjdalResponse | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const url = `${BASE_URL}?masjid_id=${MASJID_ID}&from_date=${from}&to_date=${to}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as MasjdalResponse;
  } catch {
    return null;
  }
}

/**
 * Fetch today's prayer times.
 * Returns null if API is unreachable.
 */
export async function fetchTodayTimes(): Promise<DayTimes | null> {
  const today = formatDate(new Date());
  const data = await fetchRange(today, today);
  if (!data || !data.data.salah.length) return null;

  const s = data.data.salah[0];
  const iq = data.data.iqamah[0];

  return {
    date: s.date,
    hijriDate: s.hijri_date,
    hijriMonth: s.hijri_month,
    dayName: s.day,
    sunrise: s.sunrise,
    isRamadan: s.hijri_month === "Ramadan",
    prayers: [
      { name: "Fajr", adhan: s.fajr, iqama: iq.fajr },
      { name: "Dhuhr", adhan: s.zuhr, iqama: iq.zuhr },
      { name: "Asr", adhan: s.asr, iqama: iq.asr },
      { name: "Maghrib", adhan: s.maghrib, iqama: iq.maghrib },
      { name: "Isha", adhan: s.isha, iqama: iq.isha },
    ],
  };
}

/**
 * Fetch a full month of prayer times for the timetable.
 */
export async function fetchMonthTimes(
  year: number,
  month: number
): Promise<MonthDay[]> {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const data = await fetchRange(from, to);
  if (!data || !data.data.salah.length) return [];

  return data.data.salah.map((s, i) => {
    const iq = data.data.iqamah[i] ?? data.data.iqamah[0];
    return {
      day: i + 1,
      date: s.date,
      fajr: s.fajr,
      sunrise: s.sunrise,
      dhuhr: s.zuhr,
      asr: s.asr,
      maghrib: s.maghrib,
      isha: s.isha,
      fajrIqama: iq.fajr,
      dhuhrIqama: iq.zuhr,
      asrIqama: iq.asr,
      maghribIqama: iq.maghrib,
      ishaIqama: iq.isha,
    };
  });
}

/**
 * Parse a Masjidal time string like "5:39AM" to a comparable Date object for today.
 */
export function parseTimeToDate(timeStr: string): Date {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return new Date(0);
  let hours = parseInt(match[1]);
  const mins = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, mins, 0, 0);
  return d;
}

/**
 * Returns the index of the next upcoming prayer (0-4), or -1 if all have passed.
 */
export function getNextPrayerIndex(prayers: PrayerEntry[]): number {
  const now = new Date();
  for (let i = 0; i < prayers.length; i++) {
    if (parseTimeToDate(prayers[i].adhan) > now) return i;
  }
  return -1;
}
