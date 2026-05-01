import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IslamicPattern } from "@/components/islamic-pattern";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { createClient } from "@/lib/supabase/server";
import { getPageSections } from "@/lib/get-page-sections";
import { fetchTodayTimes, getNextPrayerIndex } from "@/lib/masjidal";
import {
  Clock,
  BookOpen,
  Calendar,
  Heart,
  ArrowRight,
  Phone,
  HandHelping,
  ImageIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const quickLinks = [
  {
    icon: BookOpen,
    title: "Programs",
    description: "Quran classes, weekend school, and adult education for every age.",
    href: "/programs",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Community gatherings, celebrations, and interfaith dialogues.",
    href: "/events",
  },
  {
    icon: Heart,
    title: "Donate",
    description: "Support the masjid with your generous zakat and sadaqah.",
    href: "/donate",
  },
  {
    icon: Phone,
    title: "Contact",
    description: "Get in touch, visit us, or ask a question — we're here for you.",
    href: "/contact",
  },
];

const fallbackEvents = [
  { title: "Community Iftar Dinner", event_date: "2025-03-15", description: "Join us for a community iftar during the blessed month of Ramadan. Bring your family and friends — all are welcome." },
  { title: "Youth Sports Tournament", event_date: "2025-03-22", description: "Annual basketball and soccer tournament for youth of all skill levels. Prizes, food, and fun for the whole family." },
  { title: "Eid al-Fitr Celebration", event_date: "2025-04-10", description: "Celebrate Eid with prayer, carnival rides, food vendors, and family activities on the masjid grounds." },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default async function Home() {
  const supabase = await createClient();
  const [s, todayTimes] = await Promise.all([
    getPageSections("home"),
    fetchTodayTimes(),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const { data: dbEvents } = await supabase
    .from("events")
    .select("title, event_date, description")
    .eq("is_published", true)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(3);
  const upcomingEvents = dbEvents && dbEvents.length > 0 ? dbEvents : fallbackEvents;
  const nextIdx = todayTimes ? getNextPrayerIndex(todayTimes.prayers) : -1;
  return (
    <>
      {/* ── 1. HERO ────────────────────────────────────────────────── */}
      <section className="relative bg-sage overflow-hidden">
        <IslamicPattern />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            {s.get("hero_title") ?? "Welcome to Masjid Bilal"}
          </h1>
          <p className="text-white/80 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            {s.get("hero_subtitle") ?? "A home for worship, learning, and community in Houston, TX."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/prayer-times">
              <Button className="bg-gold hover:bg-gold-dark text-white font-semibold rounded-full px-7 h-12 shadow-md text-base">
                <Clock className="size-4 mr-2" />
                Prayer Times
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-card/10 hover:text-white rounded-full px-7 h-12 text-base"
              >
                <HandHelping className="size-4 mr-2" />
                Get Involved
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. PRAYER TIMES STRIP ──────────────────────────────────── */}
      <section className="bg-card border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <Clock className="size-4 text-sage" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-charcoal">
              Today&apos;s Prayer Times
            </h2>
          </div>
          {todayTimes ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {todayTimes.prayers.map((prayer, i) => {
                  const isNext = i === nextIdx;
                  return (
                    <div
                      key={prayer.name}
                      className={`text-center rounded-xl py-3 px-2 transition-shadow ${
                        isNext
                          ? "bg-gold/10 ring-2 ring-gold/40 shadow-sm"
                          : "bg-warm-white"
                      }`}
                    >
                      <p
                        className={`text-[11px] font-semibold uppercase tracking-wider mb-0.5 ${
                          isNext ? "text-gold-dark" : "text-sage"
                        }`}
                      >
                        {prayer.name}
                      </p>
                      <p
                        className={`font-heading text-base sm:text-lg font-bold ${
                          isNext ? "text-gold-dark" : "text-charcoal"
                        }`}
                      >
                        {prayer.adhan}
                      </p>
                      <p
                        className={`font-heading text-base sm:text-lg font-bold ${
                          isNext ? "text-gold-dark" : "text-sage"
                        }`}
                      >
                        {prayer.iqama}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Iqama</p>
                      {isNext && (
                        <span className="text-[10px] font-medium text-gold-dark">
                          Next
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-[10px] text-muted-foreground mt-2">
                Updated live from Masjidal
              </p>
            </>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              Prayer times temporarily unavailable. Please check back shortly.
            </p>
          )}
        </div>
      </section>

      {/* ── 3. QUICK LINKS GRID ────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickLinks.map((item) => (
              <Link key={item.title} href={item.href}>
                <Card className="h-full bg-card border-border/60 hover:border-sage/40 hover:shadow-lg transition-all group">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/10 text-sage mb-4 group-hover:bg-sage group-hover:text-white transition-colors">
                      <item.icon className="size-5" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-charcoal mb-1.5 group-hover:text-sage transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. UPCOMING EVENTS ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-warm-gray">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal mb-1">
                Upcoming Events
              </h2>
              <p className="text-muted-foreground text-sm">
                Join us for these community gatherings
              </p>
            </div>
            <Link
              href="/events"
              className="hidden sm:inline-flex items-center gap-1 text-sage hover:text-sage-dark font-medium text-sm transition-colors"
            >
              View all events
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card
                key={event.title}
                className="bg-card border-border/60 hover:shadow-lg transition-shadow group"
              >
                <CardContent className="p-6">
                  <Badge className="bg-sage/10 text-sage border-0 text-xs font-semibold mb-3">
                    {new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </Badge>
                  <h3 className="font-heading text-lg font-semibold text-charcoal mb-2 group-hover:text-sage transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {event.description}
                  </p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-1 text-sage hover:text-sage-dark font-medium text-sm transition-colors"
                  >
                    Learn More
                    <ArrowRight className="size-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/events"
              className="inline-flex items-center gap-1 text-sage hover:text-sage-dark font-medium text-sm transition-colors"
            >
              View all events
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. ABOUT SNIPPET ───────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Text */}
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal mb-4">
                About Masjid Bilal
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded in 1995, Masjid Bilal has grown from a small prayer room
                into a vibrant community center serving thousands of families
                across greater Houston. Our mission is to provide a welcoming
                space for worship, education, and service to all.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We offer daily congregational prayers, a full-time Islamic
                school, youth development programs, family counseling, and
                community outreach initiatives. Whether you are a lifelong
                Muslim or simply curious about Islam, our doors are always open.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-sage hover:text-sage-dark font-medium transition-colors"
              >
                Learn More About Us
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Placeholder image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-warm-gray flex items-center justify-center overflow-hidden shadow-sm border border-border/40">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="size-16 mx-auto mb-3 text-sage/20" />
                  <p className="text-sm font-medium">Masjid Bilal Photo</p>
                  <p className="text-xs mt-0.5">Replace with an actual image</p>
                </div>
              </div>
              {/* Decorative dot */}
              <div className="hidden lg:block absolute -bottom-4 -left-4 h-24 w-24 rounded-2xl bg-gold/10 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. ANNOUNCEMENT BANNER ─────────────────────────────────── */}
      <AnnouncementBanner />

      {/* ── 7. NEWSLETTER SIGNUP ───────────────────────────────────── */}
      <NewsletterSignup />
    </>
  );
}
