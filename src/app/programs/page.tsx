import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getPageSections } from "@/lib/get-page-sections";
import { HeroSection } from "@/components/hero-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  Users,
  Heart,
  Mic,
  Globe,
  Sparkles,
  ExternalLink,
  ArrowRight,
  School,
  Baby,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programs & Education — Masjid Bilal",
  description:
    "Quran classes, halaqas, youth programs, Arabic classes, and more at Masjid Bilal, Houston TX.",
};

/* ------------------------------------------------------------------ */
/*  PROGRAMS DATA                                                      */
/* ------------------------------------------------------------------ */

const programs = [
  {
    icon: BookOpen,
    title: "Quran Classes (Children)",
    schedule: "Mon–Thu, 4:30–6:00 PM",
    description:
      "Tajweed, memorization, and Quranic Arabic for ages 5–12. Small class sizes with certified instructors and progress tracking.",
  },
  {
    icon: GraduationCap,
    title: "Quran Classes (Adults)",
    schedule: "Tue & Thu, 7:30–9:00 PM",
    description:
      "Learn to read, improve tajweed, or begin a hifdh program. Beginner-friendly sessions as well as advanced recitation circles.",
  },
  {
    icon: Mic,
    title: "Halaqa / Study Circles",
    schedule: "Wed, 8:00–9:15 PM",
    description:
      "Weekly study circles on tafsir, hadith, and fiqh led by community scholars. Open to all — questions encouraged.",
  },
  {
    icon: Heart,
    title: "Sisters' Programs",
    schedule: "Sat, 10:30 AM–12:00 PM",
    description:
      "Dedicated programs for women including Quran study, Islamic parenting workshops, book clubs, and social gatherings.",
  },
  {
    icon: Users,
    title: "Youth Programs",
    schedule: "Fri, 7:00–9:00 PM",
    description:
      "Mentorship, sports, community service, and Islamic identity workshops for teens and young adults ages 13–25.",
  },
  {
    icon: Baby,
    title: "New Muslim Classes",
    schedule: "By Appointment",
    description:
      "A warm, step-by-step introduction to Islamic beliefs and practices. One-on-one mentoring with community volunteers.",
  },
  {
    icon: Globe,
    title: "Arabic Language Classes",
    schedule: "Sun, 11:00 AM–12:30 PM",
    description:
      "Classical and conversational Arabic courses. Focus on Quranic vocabulary, grammar, and everyday communication.",
  },
  {
    icon: Sparkles,
    title: "Visiting Scholar Lectures",
    schedule: "Monthly (check Events)",
    description:
      "Guest scholars deliver lectures on contemporary and classical Islamic topics. Past speakers include nationally renowned educators.",
  },
];

/* ------------------------------------------------------------------ */
/*  WEEKLY SCHEDULE DATA                                               */
/* ------------------------------------------------------------------ */

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const timeSlots: { time: string; classes: Record<string, string> }[] = [
  {
    time: "10:00 – 12:00",
    classes: { Sat: "Sisters' Program", Sun: "Arabic Language" },
  },
  {
    time: "4:30 – 6:00",
    classes: { Mon: "Quran (Children)", Tue: "Quran (Children)", Wed: "Quran (Children)", Thu: "Quran (Children)" },
  },
  {
    time: "7:00 – 9:00",
    classes: { Fri: "Youth Program" },
  },
  {
    time: "7:30 – 9:00",
    classes: { Tue: "Quran (Adults)", Thu: "Quran (Adults)" },
  },
  {
    time: "8:00 – 9:15",
    classes: { Wed: "Halaqa" },
  },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default async function ProgramsPage() {
  const sec = await getPageSections("programs");
  return (
    <>
      {/* ── 1. PAGE HEADER ──────────────────────────────────────── */}
      <HeroSection
        title={sec.get("hero_title") ?? "Programs & Education"}
        subtitle={sec.get("hero_subtitle") ?? "From Quran memorization to youth mentorship — nurturing faith and knowledge for every age and background."}
      />

      <div className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* ── 2. PROGRAMS GRID ─────────────────────────────────── */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {programs.map((program) => (
                <Card
                  key={program.title}
                  className="bg-card border-border/60 hover:border-sage/40 hover:shadow-lg transition-all group"
                >
                  <CardContent className="p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage/10 text-sage mb-4 group-hover:bg-sage group-hover:text-white transition-colors">
                      <program.icon className="size-5" />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-charcoal mb-1 group-hover:text-sage transition-colors">
                      {program.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-normal mb-3"
                    >
                      {program.schedule}
                    </Badge>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {program.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ── 3. ISLAMIC SCHOOL CALLOUT ─────────────────────────── */}
          <section>
            <Card className="bg-sage text-white border-0 overflow-hidden">
              <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card/15 shrink-0">
                    <School className="size-6" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold mb-1">
                      Looking for our full-time Islamic School?
                    </h2>
                    <p className="text-white/70 text-sm max-w-lg">
                      Al-Bilal Academy offers Pre-K through 8th grade with an integrated
                      Islamic and academic curriculum. Accredited, nurturing, and
                      community-centered.
                    </p>
                  </div>
                </div>
                <a
                  href="https://albilalacademy.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-gold hover:bg-gold-dark text-white font-semibold rounded-full px-6 h-11 shadow-sm whitespace-nowrap">
                    Visit Al-Bilal Academy
                    <ExternalLink className="size-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>

          {/* ── 4. SCHEDULE TABLE ─────────────────────────────────── */}
          <section>
            <div className="mb-5">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">
                Weekly Schedule
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                All programs held at Masjid Bilal unless noted otherwise.
              </p>
            </div>

            <Card className="bg-card border-border/60 overflow-x-auto">
              <CardContent className="p-0">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-warm-gray/50">
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider w-[120px]">
                        Time
                      </th>
                      {days.map((d) => (
                        <th
                          key={d}
                          className="px-3 py-3 text-center font-semibold text-muted-foreground text-xs uppercase tracking-wider"
                        >
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot) => (
                      <tr
                        key={slot.time}
                        className="border-b border-border/20 last:border-b-0 hover:bg-warm-gray/30"
                      >
                        <td className="px-4 py-3 text-charcoal font-medium whitespace-nowrap">
                          {slot.time}
                        </td>
                        {days.map((d) => {
                          const cls = slot.classes[d];
                          return (
                            <td key={d} className="px-3 py-3 text-center">
                              {cls ? (
                                <span className="inline-block bg-sage/10 text-sage text-xs font-medium rounded-lg px-2.5 py-1">
                                  {cls}
                                </span>
                              ) : (
                                <span className="text-border">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>

          {/* ── 5. REGISTER CTA ──────────────────────────────────── */}
          <section className="text-center bg-warm-gray rounded-2xl p-8 sm:p-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal mb-3">
              Interested in joining a class?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Registration is open year-round for most programs. Reach out and
              we&apos;ll help you find the right fit.
            </p>
            <Link href="/contact">
              <Button className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-7 h-11 shadow-sm text-base">
                Contact Us to Register
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
