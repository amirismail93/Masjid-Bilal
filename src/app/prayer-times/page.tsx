import { Card, CardContent } from "@/components/ui/card";
import { HeroSection } from "@/components/hero-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QiblaCompass } from "@/components/qibla-compass";
import { LivePrayerGrid } from "@/components/live-prayer-grid";
import { fetchTodayTimes, fetchMonthTimes } from "@/lib/masjidal";
import { createClient } from "@/lib/supabase/server";
import { to12hr } from "@/lib/format-time";
import type { JumuahTime, RamadanSchedule } from "@/types/database";
import {
  Download,
  Moon,
  Star,
  Compass,
  MapPin,
  CalendarHeart,
  Utensils,
  Sunrise,
  Sunset,
  AlertTriangle,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prayer Times — Masjid Bilal",
  description:
    "Daily prayer times, Jumu'ah schedule, monthly timetable, and Ramadan schedule at Masjid Bilal, Houston TX.",
};

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default async function PrayerTimesPage() {
  const now = new Date();
  const supabase = await createClient();

  // Parallel fetches
  const [today, monthDays, jumuahRes, ramadanRes] = await Promise.all([
    fetchTodayTimes(),
    fetchMonthTimes(now.getFullYear(), now.getMonth() + 1),
    supabase.from("jumuah_times").select("*").order("khutbah_time"),
    supabase
      .from("ramadan_schedule")
      .select("*")
      .order("date")
      .limit(1),
  ]);

  const jumuahTimes = (jumuahRes.data as JumuahTime[]) ?? [];
  const ramadanRows = (ramadanRes.data as RamadanSchedule[]) ?? [];
  const isRamadan = today?.isRamadan ?? false;

  const currentMonth = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* ── 1. PAGE HEADER ──────────────────────────────────────────── */}
      <HeroSection
        title="Prayer Times"
        subtitle="Daily salah schedule, Jumu'ah times, and seasonal prayer information for Masjid Bilal in Houston, TX."
      />

      <div className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* ── 2. TODAY'S PRAYER TIMES ────────────────────────────── */}
          <section>
            {today ? (
              <>
                <LivePrayerGrid prayers={today.prayers} hijriDate={today.hijriDate} hijriMonth={today.hijriMonth} sunrise={today.sunrise} />
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Updated live from Masjidal &middot; Refreshed hourly
                </p>
              </>
            ) : (
              <Card className="bg-gold/5 border-gold/20">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="size-6 text-gold-dark mx-auto mb-2" />
                  <p className="text-sm text-charcoal font-medium">
                    Prayer times temporarily unavailable.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please check back shortly or contact the masjid office.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* ── 3. JUMU'AH DETAILS ────────────────────────────────── */}
          <section>
            <Card className="bg-sage text-white border-0 overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <Badge className="bg-card/15 text-white border-0 text-xs mb-3">
                      Every Friday
                    </Badge>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-1">
                      Jumu&apos;ah Prayer
                    </h2>
                    <p className="text-white/70 text-sm max-w-md">
                      {jumuahTimes.length > 1
                        ? `${jumuahTimes.length} Jumu'ah services are held to accommodate our growing community.`
                        : "Jumu'ah service schedule."}{" "}
                      Please arrive early to secure seating.
                    </p>
                  </div>
                  <div className="flex gap-6 sm:gap-8">
                    {jumuahTimes.length > 0 ? (
                      jumuahTimes.map((jt, i) => (
                        <div key={jt.id} className="flex items-center gap-6 sm:gap-8">
                          {i > 0 && (
                            <Separator
                              orientation="vertical"
                              className="bg-card/15 h-16 self-center"
                            />
                          )}
                          <div className="text-center">
                            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                              {jt.session_label}
                            </p>
                            <p className="font-heading text-2xl font-bold text-gold">
                              {to12hr(jt.khutbah_time)}
                            </p>
                            <p className="text-xs text-white/50 mt-0.5">
                              Iqama {to12hr(jt.iqama_time)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/60 text-sm italic">
                        Check announcements for times.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 4. MONTHLY TIMETABLE ──────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">
                  Monthly Timetable
                </h2>
                <p className="text-sm text-muted-foreground">{currentMonth}</p>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-sm"
              >
                <Download className="size-4 mr-1.5" />
                Download PDF
              </Button>
            </div>

            <Card className="bg-card border-border/60 overflow-x-auto">
              <CardContent className="p-0">
                {monthDays.length > 0 ? (
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-warm-gray/50">
                        <th className="px-3 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Day
                        </th>
                        <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[10px] uppercase tracking-wider" colSpan={2}>
                          Fajr
                        </th>
                        <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
                          Sunrise
                        </th>
                        <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[10px] uppercase tracking-wider" colSpan={2}>
                          Dhuhr
                        </th>
                        <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[10px] uppercase tracking-wider" colSpan={2}>
                          Asr
                        </th>
                        <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[10px] uppercase tracking-wider" colSpan={2}>
                          Maghrib
                        </th>
                        <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[10px] uppercase tracking-wider" colSpan={2}>
                          Isha
                        </th>
                      </tr>
                      <tr className="border-b border-border/20 bg-warm-gray/30 text-[9px] text-muted-foreground uppercase tracking-widest">
                        <th />
                        <th className="px-1 py-1 text-center">Adhan</th>
                        <th className="px-1 py-1 text-center">Iqama</th>
                        <th />
                        <th className="px-1 py-1 text-center">Adhan</th>
                        <th className="px-1 py-1 text-center">Iqama</th>
                        <th className="px-1 py-1 text-center">Adhan</th>
                        <th className="px-1 py-1 text-center">Iqama</th>
                        <th className="px-1 py-1 text-center">Adhan</th>
                        <th className="px-1 py-1 text-center">Iqama</th>
                        <th className="px-1 py-1 text-center">Adhan</th>
                        <th className="px-1 py-1 text-center">Iqama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthDays.map((row) => {
                        const isToday = row.day === now.getDate();
                        return (
                          <tr
                            key={row.day}
                            className={`border-b border-border/20 last:border-b-0 ${
                              isToday
                                ? "bg-gold/5 font-semibold"
                                : "hover:bg-warm-gray/30"
                            }`}
                          >
                            <td className="px-3 py-2 text-charcoal whitespace-nowrap">
                              {row.day}
                              {isToday && (
                                <span className="ml-1.5 text-[10px] font-bold uppercase bg-gold/15 text-gold-dark px-1.5 py-0.5 rounded">
                                  Today
                                </span>
                              )}
                            </td>
                            <td className="px-1 py-2 text-center text-charcoal text-xs">{row.fajr}</td>
                            <td className="px-1 py-2 text-center text-sage text-xs font-medium">{row.fajrIqama}</td>
                            <td className="px-1 py-2 text-center text-muted-foreground text-xs">{row.sunrise}</td>
                            <td className="px-1 py-2 text-center text-charcoal text-xs">{row.dhuhr}</td>
                            <td className="px-1 py-2 text-center text-sage text-xs font-medium">{row.dhuhrIqama}</td>
                            <td className="px-1 py-2 text-center text-charcoal text-xs">{row.asr}</td>
                            <td className="px-1 py-2 text-center text-sage text-xs font-medium">{row.asrIqama}</td>
                            <td className="px-1 py-2 text-center text-charcoal text-xs">{row.maghrib}</td>
                            <td className="px-1 py-2 text-center text-sage text-xs font-medium">{row.maghribIqama}</td>
                            <td className="px-1 py-2 text-center text-charcoal text-xs">{row.isha}</td>
                            <td className="px-1 py-2 text-center text-sage text-xs font-medium">{row.ishaIqama}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Monthly timetable temporarily unavailable.
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* ── 5. RAMADAN SCHEDULE ───────────────────────────────── */}
          {(isRamadan || ramadanRows.length > 0) && today && (
            <section>
              <div className="mb-5">
                <Badge className="bg-gold/10 text-gold-dark border-0 text-xs font-semibold mb-2">
                  <Sunrise className="size-3 mr-1" />
                  Ramadan Schedule
                </Badge>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">
                  Ramadan Prayer &amp; Fasting Times
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Special Ramadan timings — updated as the month progresses.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-dark mx-auto mb-3">
                      <Utensils className="size-5" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Suhoor Ends
                    </p>
                    <p className="font-heading text-2xl font-bold text-charcoal mb-1">
                      {today.prayers[0].adhan}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      Stop eating before Fajr adhan
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-dark mx-auto mb-3">
                      <Sunset className="size-5" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Iftar
                    </p>
                    <p className="font-heading text-2xl font-bold text-charcoal mb-1">
                      {today.prayers[3].adhan}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      Break fast at Maghrib adhan
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-dark mx-auto mb-3">
                      <Moon className="size-5" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Taraweeh
                    </p>
                    <p className="font-heading text-2xl font-bold text-charcoal mb-1">
                      After Isha
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      20 raka&apos;at, full Quran recitation
                    </p>
                  </CardContent>
                </Card>
                {ramadanRows.length > 0 && ramadanRows[0].qiyam_time && (
                  <Card className="bg-card border-border/60 hover:shadow-md transition-shadow">
                    <CardContent className="p-5 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-dark mx-auto mb-3">
                        <Star className="size-5" />
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Qiyam al-Layl
                      </p>
                      <p className="font-heading text-2xl font-bold text-charcoal mb-1">
                        {to12hr(ramadanRows[0].qiyam_time)}
                      </p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        Last 10 nights of Ramadan
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          )}

          {/* ── 6 & 7. QIBLA + EID — side by side ────────────────── */}
          <section className="grid md:grid-cols-2 gap-6">
            {/* 6. QIBLA DIRECTION */}
            <Card className="bg-card border-border/60">
              <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage mb-4">
                  <Compass className="size-5" />
                </div>
                <h3 className="font-heading text-lg font-bold text-charcoal mb-1">
                  Qibla Direction
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                  From Houston, the Qibla (direction of Mecca) is approximately
                  <span className="font-semibold text-sage"> 48° NE</span>.
                </p>
                <QiblaCompass />
                <p className="text-xs text-muted-foreground mt-4">
                  Compass rose for reference — use a physical compass or app for precision.
                </p>
              </CardContent>
            </Card>

            {/* 7. EID PRAYER CARD */}
            <Card className="bg-gold/5 border-gold/20 overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dark mb-4">
                  <CalendarHeart className="size-5" />
                </div>
                <h3 className="font-heading text-lg font-bold text-charcoal mb-4">
                  Eid Prayers
                </h3>

                {/* Eid al-Fitr */}
                <div className="mb-5">
                  <Badge className="bg-sage/10 text-sage border-0 text-xs font-semibold mb-2">
                    Eid al-Fitr
                  </Badge>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">1st Prayer</span>
                      <span className="font-heading font-bold text-charcoal">8:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">2nd Prayer</span>
                      <span className="font-heading font-bold text-charcoal">9:30 AM</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="size-3 shrink-0" />
                      Masjid Bilal Main Hall &amp; Grounds
                    </div>
                  </div>
                </div>

                <Separator className="bg-gold/15 mb-5" />

                {/* Eid al-Adha */}
                <div>
                  <Badge className="bg-sage/10 text-sage border-0 text-xs font-semibold mb-2">
                    Eid al-Adha
                  </Badge>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">1st Prayer</span>
                      <span className="font-heading font-bold text-charcoal">8:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">2nd Prayer</span>
                      <span className="font-heading font-bold text-charcoal">9:30 AM</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="size-3 shrink-0" />
                      Masjid Bilal Main Hall &amp; Grounds
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-5 leading-relaxed">
                  Exact Eid dates follow the lunar calendar and will be confirmed via
                  announcement. Arrive early for best seating.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}
