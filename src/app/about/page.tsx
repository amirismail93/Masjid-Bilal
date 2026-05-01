import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageSections } from "@/lib/get-page-sections";
import type { BoardMember, CommunityStat } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import {
  Target,
  Eye,
  Heart,
  Globe,
  MessageCircle,
  Play,
  ExternalLink,
  Calendar,
  Users,
  BookOpen,
  Clock,
  ImageIcon,
  HandHeart,
  Mail,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Masjid Bilal",
  description:
    "Learn about the history, mission, leadership, and community impact of Masjid Bilal in Houston, TX.",
};

/* ------------------------------------------------------------------ */
/*  MISSION / VISION / VALUES                                          */
/* ------------------------------------------------------------------ */

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    text: "To provide a welcoming space for worship, education, and community building rooted in the Quran and Sunnah — serving Muslims of all backgrounds in the greater Houston area.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    text: "A thriving, united Muslim community that is spiritually grounded, socially engaged, and recognized as a positive force in Houston and beyond.",
  },
  {
    icon: Heart,
    title: "Our Values",
    text: "Compassion, inclusivity, knowledge, service, and transparency guide everything we do — from our daily prayers to our largest community programs.",
  },
];

/* ------------------------------------------------------------------ */
/*  LEADERSHIP                                                         */
/* ------------------------------------------------------------------ */

const imam = {
  name: "Imam Ahmad Hassan",
  title: "Resident Imam & Religious Director",
  bio: "Imam Ahmad Hassan has served as the resident imam of Masjid Bilal since 2015. He holds an Ijazah in Quran recitation and a Master's degree in Islamic Studies from the International Islamic University. Known for his approachable style and community-first leadership, he oversees religious programming, khutbahs, counseling, and interfaith relations.",
  initials: "AH",
  socials: [
    { icon: Globe, href: "#", label: "Website" },
    { icon: MessageCircle, href: "#", label: "Instagram" },
    { icon: Play, href: "#", label: "YouTube" },
  ],
};

const fallbackBoard = [
  { name: "Dr. Yusuf Ali", role: "Board Chair" },
  { name: "Sr. Khadijah Williams", role: "Vice Chair" },
  { name: "Br. Omar Faruq", role: "Treasurer" },
  { name: "Sr. Fatima Rahman", role: "Secretary" },
  { name: "Br. Ibrahim Patel", role: "Community Liaison" },
  { name: "Dr. Amina Osman", role: "Education Chair" },
];

/* ------------------------------------------------------------------ */
/*  STATS                                                              */
/* ------------------------------------------------------------------ */

const iconMap: Record<string, typeof Calendar> = { Calendar, Users, BookOpen, Clock, Heart, Globe, Target, Eye };

const fallbackStats = [
  { icon: "Calendar", value: "1998", label: "Year Established" },
  { icon: "Users", value: "2,500+", label: "Community Members" },
  { icon: "BookOpen", value: "15+", label: "Weekly Programs" },
  { icon: "Clock", value: "27", label: "Years Serving Houston" },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default async function AboutPage() {
  const supabase = await createClient();
  const s = await getPageSections("about");

  const { data: dbBoard } = await supabase.from("board_members").select("*").order("display_order", { ascending: true });
  const boardMembers = dbBoard && dbBoard.length > 0 ? (dbBoard as BoardMember[]) : (fallbackBoard as unknown as BoardMember[]);

  const { data: dbStats } = await supabase.from("community_stats").select("*").order("display_order", { ascending: true });
  const stats = dbStats && dbStats.length > 0 ? (dbStats as CommunityStat[]) : (fallbackStats as unknown as CommunityStat[]);

  return (
    <>
      {/* ── 1. PAGE HEADER ──────────────────────────────────────── */}
      <HeroSection
        title={s.get("hero_title") ?? "About Masjid Bilal"}
        subtitle={s.get("hero_subtitle") ?? "A home for worship, learning, and community in the heart of Houston."}
      />

      <div className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-20">
          {/* ── 2. OUR STORY ─────────────────────────────────────── */}
          <section>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Text */}
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal mb-5">
                  Our Story
                </h2>
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                  <p>
                    Masjid Bilal was founded in 1998 by a small group of Muslim
                    families who gathered for prayer in a rented storefront on
                    Houston&apos;s southwest side. Named after Bilal ibn Rabah
                    (RA), the beloved companion of the Prophet Muhammad ﷺ and
                    the first mu&apos;adhin of Islam, the masjid was built on
                    principles of equality, service, and devotion.
                  </p>
                  <p>
                    Over the past two decades, what began as a single room has
                    grown into a full-service Islamic center spanning 18,000
                    square feet. Today, Masjid Bilal serves more than 2,500
                    community members with daily prayers, a weekend Islamic
                    school, youth programs, social services, and interfaith
                    outreach.
                  </p>
                  <p>
                    Our community is beautifully diverse — representing families
                    from over 30 countries. We are united by our commitment to
                    the Quran and Sunnah, our love for Houston, and our belief
                    that the masjid should be the beating heart of a thriving
                    Muslim community.
                  </p>
                </div>
              </div>

              {/* Image placeholder */}
              <div className="bg-warm-gray rounded-2xl aspect-[4/3] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="size-14 mx-auto mb-2 text-sage/20" />
                  <p className="text-sm">Masjid Bilal exterior photo</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. MISSION & VALUES ──────────────────────────────── */}
          <section>
            <div className="grid sm:grid-cols-3 gap-5">
              {pillars.map((p) => (
                <Card
                  key={p.title}
                  className="bg-card border-border/60 hover:shadow-lg transition-shadow group"
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/10 text-sage mx-auto mb-4 group-hover:bg-sage group-hover:text-white transition-colors">
                      <p.icon className="size-5" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-charcoal mb-2 group-hover:text-sage transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {p.text}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ── 4. LEADERSHIP TEAM ───────────────────────────────── */}
          <section>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal mb-1">
              Leadership
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              The people who guide and serve Masjid Bilal.
            </p>

            {/* Imam feature card */}
            <Card className="bg-card border-border/60 mb-8 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid sm:grid-cols-5">
                  {/* Photo placeholder */}
                  <div className="sm:col-span-2 bg-warm-gray flex items-center justify-center min-h-[220px]">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-sage/10 text-sage font-heading text-4xl font-bold">
                      {imam.initials}
                    </div>
                  </div>
                  {/* Bio */}
                  <div className="sm:col-span-3 p-6 sm:p-8 flex flex-col justify-center">
                    <h3 className="font-heading text-xl font-bold text-charcoal mb-0.5">
                      {imam.name}
                    </h3>
                    <p className="text-xs text-sage font-medium mb-3">
                      {imam.title}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {imam.bio}
                    </p>
                    <div className="flex gap-2">
                      {imam.socials.map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/10 text-sage hover:bg-sage hover:text-white transition-colors"
                        >
                          <s.icon className="size-3.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Board members */}
            <h3 className="font-heading text-lg font-bold text-charcoal mb-4">
              Board of Directors
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {boardMembers.map((m) => (
                <Card
                  key={m.name}
                  className="bg-card border-border/60 text-center"
                >
                  <CardContent className="p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/10 text-sage font-heading text-xs font-bold mx-auto mb-2">
                      {m.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <p className="text-xs font-semibold text-charcoal leading-snug">
                      {m.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {m.role}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ── 5. BY THE NUMBERS ────────────────────────────────── */}
          <section>
            <Card className="bg-sage text-white border-0">
              <CardContent className="p-6 sm:p-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  {stats.map((s) => {
                    const StatIcon = iconMap[s.icon] ?? Calendar;
                    return (
                    <div key={s.label}>
                      <StatIcon className="size-6 mx-auto mb-2 text-gold" />
                      <p className="font-heading text-3xl sm:text-4xl font-bold">
                        {s.value}
                      </p>
                      <p className="text-white/60 text-xs mt-1 uppercase tracking-wider">
                        {s.label}
                      </p>
                    </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 6. JOIN US CTA ───────────────────────────────────── */}
          <section className="text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal mb-3">
              Masjid Bilal is your home.
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-7">
              Whether you&apos;ve been with us for decades or are visiting for
              the first time, you are always welcome here. Get involved today.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/donate">
                <Button className="bg-gold hover:bg-gold-dark text-white font-semibold rounded-full px-6 h-11 shadow-sm">
                  <HandHeart className="size-4 mr-2" />
                  Donate
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="rounded-full border-sage text-sage hover:bg-sage hover:text-white font-semibold px-6 h-11"
                >
                  <Heart className="size-4 mr-2" />
                  Volunteer
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="rounded-full border-sage text-sage hover:bg-sage hover:text-white font-semibold px-6 h-11"
                >
                  <Mail className="size-4 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
