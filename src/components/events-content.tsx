"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  Star,
  CalendarDays,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  TYPES & DATA                                                       */
/* ------------------------------------------------------------------ */

interface EventItem {
  title: string;
  date: string;
  dateBadge: string;
  time: string;
  location: string;
  category: string;
  description: string;
}

const categories = [
  "All",
  "Ramadan",
  "Eid",
  "Fundraising",
  "Community",
  "Youth",
  "Education",
];

const categoryColors: Record<string, string> = {
  Ramadan: "bg-gold/10 text-gold-dark",
  Eid: "bg-gold/10 text-gold-dark",
  Fundraising: "bg-amber-50 text-amber-700",
  Community: "bg-sage/10 text-sage",
  Youth: "bg-blue-50 text-blue-700",
  Education: "bg-purple-50 text-purple-700",
};

const upcomingEvents: EventItem[] = [
  {
    title: "Community Iftar Dinner",
    date: "2026-03-15",
    dateBadge: "Mar 15",
    time: "7:30 PM",
    location: "Masjid Bilal Hall",
    category: "Ramadan",
    description:
      "Join the community for a warm iftar dinner during Ramadan. Delicious food, good company, and spiritual fellowship for all.",
  },
  {
    title: "Eid al-Fitr Festival",
    date: "2026-04-10",
    dateBadge: "Apr 10",
    time: "8:00 AM – 2:00 PM",
    location: "Masjid Bilal Grounds",
    category: "Eid",
    description:
      "Celebrate Eid with prayer, carnival rides, food vendors, henna, and family activities. A joyous day for the whole community.",
  },
  {
    title: "Youth Sports Tournament",
    date: "2026-03-22",
    dateBadge: "Mar 22",
    time: "9:00 AM – 3:00 PM",
    location: "Community Center Field",
    category: "Youth",
    description:
      "Annual basketball and soccer tournament for youth ages 12–25. Teams of all skill levels welcome. Prizes and meals provided.",
  },
  {
    title: "Annual Fundraising Gala",
    date: "2026-05-03",
    dateBadge: "May 3",
    time: "6:00 PM",
    location: "Houston Grand Ballroom",
    category: "Fundraising",
    description:
      "Our flagship fundraiser supporting masjid expansion and community programs. Keynote speaker, dinner, and silent auction.",
  },
  {
    title: "Qiyam al-Layl Night",
    date: "2026-03-25",
    dateBadge: "Mar 25",
    time: "12:00 AM – Fajr",
    location: "Masjid Bilal Main Hall",
    category: "Ramadan",
    description:
      "A special night of worship during the last ten nights of Ramadan. Tahajjud, du'a, and community suhoor provided.",
  },
  {
    title: "Interfaith Dialogue Series",
    date: "2026-04-05",
    dateBadge: "Apr 5",
    time: "2:00 PM",
    location: "Masjid Bilal Library",
    category: "Education",
    description:
      "Open dialogue with leaders from local churches and synagogues. Building bridges of understanding in our diverse community.",
  },
  {
    title: "Family Fun Day",
    date: "2026-04-19",
    dateBadge: "Apr 19",
    time: "10:00 AM – 4:00 PM",
    location: "Masjid Bilal Grounds",
    category: "Community",
    description:
      "Face painting, bounce houses, BBQ, and outdoor games for families. A relaxed day to connect with neighbors and friends.",
  },
  {
    title: "Youth Leadership Retreat",
    date: "2026-05-10",
    dateBadge: "May 10",
    time: "All Day",
    location: "Camp Lakeview, TX",
    category: "Youth",
    description:
      "A weekend retreat focused on leadership skills, team building, and Islamic identity for teens and college students.",
  },
  {
    title: "Quran Competition",
    date: "2026-05-17",
    dateBadge: "May 17",
    time: "10:00 AM",
    location: "Masjid Bilal Main Hall",
    category: "Education",
    description:
      "Annual Quran recitation and memorization competition for students of all ages. Trophies, prizes, and certificates awarded.",
  },
];

const pastEvents: EventItem[] = [
  {
    title: "Winter Coat Drive",
    date: "2025-12-15",
    dateBadge: "Dec 15",
    time: "10:00 AM – 2:00 PM",
    location: "Masjid Bilal Lobby",
    category: "Community",
    description:
      "Collected over 500 coats for families in need across the Houston area. Thank you to all who contributed!",
  },
  {
    title: "Islamic History Lecture",
    date: "2025-11-20",
    dateBadge: "Nov 20",
    time: "7:30 PM",
    location: "Masjid Bilal Library",
    category: "Education",
    description:
      "Dr. Amina Wadud delivered a lecture on the golden age of Islamic civilization. Over 200 attendees.",
  },
  {
    title: "Eid al-Adha BBQ",
    date: "2025-06-17",
    dateBadge: "Jun 17",
    time: "12:00 PM",
    location: "Masjid Bilal Grounds",
    category: "Eid",
    description:
      "A memorable Eid celebration with qurbani distribution, community BBQ, and family activities.",
  },
];

/* ------------------------------------------------------------------ */
/*  FEATURED EVENT (first event)                                       */
/* ------------------------------------------------------------------ */

const featured = upcomingEvents[0];

/* ------------------------------------------------------------------ */
/*  MINI CALENDAR HELPERS                                              */
/* ------------------------------------------------------------------ */

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function EventsContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [view, setView] = useState<"grid" | "calendar">("grid");
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());

  const filteredEvents = useMemo(
    () =>
      activeCategory === "All"
        ? upcomingEvents
        : upcomingEvents.filter((e) => e.category === activeCategory),
    [activeCategory]
  );

  // calendar data
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const calLabel = new Date(calYear, calMonth).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  // events that fall in the calendar month
  const eventsInMonth = upcomingEvents.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === calMonth && d.getFullYear() === calYear;
  });
  const eventDayMap = new Map<number, EventItem[]>();
  eventsInMonth.forEach((e) => {
    const day = new Date(e.date).getDate();
    const existing = eventDayMap.get(day) || [];
    existing.push(e);
    eventDayMap.set(day, existing);
  });

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-16">
      {/* ── 2. FEATURED EVENT ──────────────────────────────────── */}
      <section>
        <Card className="bg-sage text-white border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-5">
              {/* Left accent panel */}
              <div className="lg:col-span-2 bg-sage-dark/30 p-8 sm:p-10 flex flex-col justify-center items-center text-center">
                <Star className="size-8 text-gold mb-3" />
                <p className="text-xs uppercase tracking-widest text-white/50 mb-1">
                  Featured Event
                </p>
                <p className="font-heading text-4xl sm:text-5xl font-bold text-gold leading-none">
                  {featured.dateBadge.split(" ")[1]}
                </p>
                <p className="text-white/70 text-sm mt-1">
                  {featured.dateBadge.split(" ")[0]} 2026
                </p>
              </div>

              {/* Content */}
              <div className="lg:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
                <Badge className="bg-card/15 text-white border-0 text-xs w-fit mb-3">
                  {featured.category}
                </Badge>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
                  {featured.title}
                </h2>
                <p className="text-white/70 text-sm leading-relaxed mb-5 max-w-lg">
                  {featured.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-white/50 mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {featured.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {featured.location}
                  </span>
                </div>
                <Button className="bg-gold hover:bg-gold-dark text-white font-semibold rounded-full px-6 h-10 shadow-sm w-fit">
                  RSVP Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── 3. FILTER BAR + 5. VIEW TOGGLE ─────────────────────── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Filter pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-sage text-white shadow-sm"
                    : "bg-warm-gray text-charcoal/70 hover:bg-sage/10 hover:text-sage"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-1 bg-warm-gray rounded-lg p-1 w-fit">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === "grid"
                  ? "bg-card text-charcoal shadow-sm"
                  : "text-charcoal/50 hover:text-charcoal"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              Grid
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === "calendar"
                  ? "bg-card text-charcoal shadow-sm"
                  : "text-charcoal/50 hover:text-charcoal"
              }`}
            >
              <CalendarDays className="size-3.5" />
              Calendar
            </button>
          </div>
        </div>

        {/* ── 4. EVENTS GRID ─────────────────────────────────────── */}
        {view === "grid" ? (
          filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((event) => (
                <EventCard key={event.title} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No events in this category yet. Check back soon!</p>
            </div>
          )
        ) : (
          /* ── 5. CALENDAR VIEW ────────────────────────────────── */
          <Card className="bg-card border-border/60">
            <CardContent className="p-4 sm:p-6">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-warm-gray transition-colors"
                >
                  <ChevronLeft className="size-5 text-charcoal" />
                </button>
                <h3 className="font-heading text-lg font-bold text-charcoal">
                  {calLabel}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-warm-gray transition-colors"
                >
                  <ChevronRight className="size-5 text-charcoal" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-px bg-border/30 border border-border/30 rounded-lg overflow-hidden">
                {/* Empty leading cells */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e-${i}`} className="bg-warm-gray/30 min-h-[72px]" />
                ))}
                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = eventDayMap.get(day);
                  const isToday =
                    day === new Date().getDate() &&
                    calMonth === new Date().getMonth() &&
                    calYear === new Date().getFullYear();
                  return (
                    <div
                      key={day}
                      className={`bg-card min-h-[72px] p-1.5 ${
                        isToday ? "ring-2 ring-inset ring-sage/40" : ""
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          isToday
                            ? "bg-sage text-white rounded-full w-6 h-6 flex items-center justify-center"
                            : "text-charcoal/70"
                        }`}
                      >
                        {day}
                      </span>
                      {dayEvents?.map((ev) => (
                        <div
                          key={ev.title}
                          className="mt-1 text-[10px] bg-sage/10 text-sage font-medium rounded px-1 py-0.5 truncate"
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* ── 6. PAST EVENTS ────────────────────────────────────── */}
      <section>
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-charcoal mb-1">
          Past Events
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          A look back at recent community gatherings.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
          {pastEvents.map((event) => (
            <Card
              key={event.title}
              className="bg-card border-border/60 grayscale-[30%]"
            >
              <CardContent className="p-5">
                <Badge
                  variant="secondary"
                  className="text-[11px] font-normal mb-2"
                >
                  {event.dateBadge} &middot; Past
                </Badge>
                <h3 className="font-heading text-base font-semibold text-charcoal mb-1.5">
                  {event.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Want to host an event at Masjid Bilal?{" "}
          <Link
            href="/contact"
            className="text-sage hover:underline font-medium"
          >
            Contact us
          </Link>{" "}
          for details and booking.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  EVENT CARD SUB-COMPONENT                                           */
/* ------------------------------------------------------------------ */

function EventCard({ event }: { event: EventItem }) {
  return (
    <Card className="bg-card border-border/60 hover:shadow-lg transition-shadow group flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge className="bg-sage/10 text-sage border-0 text-xs font-semibold">
            {event.dateBadge}
          </Badge>
          <Badge
            className={`border-0 text-[11px] ${
              categoryColors[event.category] || "bg-gray-100 text-gray-700"
            }`}
          >
            {event.category}
          </Badge>
        </div>

        <h3 className="font-heading text-base font-semibold text-charcoal mb-2 group-hover:text-sage transition-colors">
          {event.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
          {event.description}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {event.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {event.location}
          </span>
        </div>

        <Button
          variant="outline"
          className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-sm w-full"
        >
          RSVP / Learn More
        </Button>
      </CardContent>
    </Card>
  );
}
