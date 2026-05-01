"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Sunrise, Sun, CloudSun, Sunset, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PrayerRow {
  name: string;
  icon: LucideIcon;
  adhan: string;
  iqama: string;
  highlight: boolean;
}

const PRAYERS: Omit<PrayerRow, "highlight">[] = [
  { name: "Fajr", icon: Sunrise, adhan: "5:45 AM", iqama: "6:00 AM" },
  { name: "Dhuhr", icon: Sun, adhan: "1:15 PM", iqama: "1:30 PM" },
  { name: "Asr", icon: CloudSun, adhan: "5:00 PM", iqama: "5:15 PM" },
  { name: "Maghrib", icon: Sunset, adhan: "7:45 PM", iqama: "7:50 PM" },
  { name: "Isha", icon: Moon, adhan: "9:15 PM", iqama: "9:30 PM" },
  { name: "Jumu'ah", icon: Sun, adhan: "1:00 PM", iqama: "1:30 PM" },
];

function todayFormatted() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function nextPrayerIndex(): number {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const mins = h * 60 + m;

  const adhanMinutes = [345, 795, 1020, 1185, 1275]; // Fajr 5:45, Dhuhr 13:15, Asr 17:00, Maghrib 19:45, Isha 21:15
  for (let i = 0; i < adhanMinutes.length; i++) {
    if (mins < adhanMinutes[i]) return i;
  }
  return 0; // wrap to Fajr
}

export function PrayerTimesToday() {
  const today = useMemo(() => todayFormatted(), []);
  const nextIdx = useMemo(() => nextPrayerIndex(), []);

  return (
    <Card className="bg-card border-border/60 shadow-sm overflow-hidden">
      <div className="bg-sage px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">
            Today&apos;s Prayer Times
          </h2>
          <p className="text-white/70 text-sm">{today}</p>
        </div>
        <Badge className="bg-card/15 text-white border-0 text-xs w-fit">
          <Clock className="size-3 mr-1" />
          Houston, TX
        </Badge>
      </div>
      <CardContent className="p-0">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_120px_120px] px-6 py-3 border-b border-border/40 bg-warm-gray/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Prayer</span>
          <span className="text-center">Adhan</span>
          <span className="text-center">Iqama</span>
        </div>

        {PRAYERS.map((prayer, i) => {
          const isNext = i === nextIdx && i < 5;
          return (
            <div
              key={prayer.name}
              className={`grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_120px_120px] px-6 py-3.5 items-center border-b border-border/30 last:border-b-0 transition-colors ${
                isNext ? "bg-gold/8 border-l-4 border-l-gold" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isNext
                      ? "bg-gold/15 text-gold-dark"
                      : "bg-sage/8 text-sage"
                  }`}
                >
                  <prayer.icon className="size-4" />
                </div>
                <div>
                  <p
                    className={`font-medium text-sm ${
                      isNext ? "text-gold-dark font-semibold" : "text-charcoal"
                    }`}
                  >
                    {prayer.name}
                    {isNext && (
                      <span className="ml-2 text-[10px] font-bold uppercase bg-gold/15 text-gold-dark px-1.5 py-0.5 rounded">
                        Next
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <p
                className={`text-center font-heading font-bold text-sm ${
                  isNext ? "text-gold-dark" : "text-charcoal"
                }`}
              >
                {prayer.adhan}
              </p>
              <p
                className={`text-center font-heading font-bold text-sm ${
                  isNext ? "text-gold-dark" : "text-sage"
                }`}
              >
                {prayer.iqama}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
