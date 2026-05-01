import { Card, CardContent } from "@/components/ui/card";
import { HeroSection } from "@/components/hero-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { KhutbahArchive } from "@/components/khutbah-archive";
import { createClient } from "@/lib/supabase/server";
import type { YouTubePlaylist } from "@/types/database";
import {
  Play,
  Video,
  FileText,
  ExternalLink,
  Globe,
  MessageCircle,
  Tv,
  ImageIcon,
  ListVideo,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media & Content — Masjid Bilal",
  description:
    "Khutbahs, lectures, live streams, newsletters, and social media from Masjid Bilal.",
};

/* ------------------------------------------------------------------ */
/*  LECTURES DATA                                                      */
/* ------------------------------------------------------------------ */

const lectures = [
  {
    title: "Understanding Surah Al-Kahf",
    speaker: "Dr. Fatima Ali",
    date: "Mar 2, 2026",
  },
  {
    title: "The Life of Prophet Muhammad ﷺ — Part 12",
    speaker: "Imam Ahmad Hassan",
    date: "Feb 23, 2026",
  },
  {
    title: "Islamic Finance Basics",
    speaker: "Br. Yusuf Khan",
    date: "Feb 16, 2026",
  },
];

/* ------------------------------------------------------------------ */
/*  NEWSLETTER DATA                                                    */
/* ------------------------------------------------------------------ */

const newsletters = [
  { title: "March 2026 Newsletter", date: "Mar 1, 2026" },
  { title: "February 2026 Newsletter", date: "Feb 1, 2026" },
  { title: "January 2026 Newsletter", date: "Jan 1, 2026" },
  { title: "December 2025 Newsletter", date: "Dec 1, 2025" },
  { title: "November 2025 Newsletter", date: "Nov 1, 2025" },
];

/* ------------------------------------------------------------------ */
/*  SOCIAL LINKS                                                       */
/* ------------------------------------------------------------------ */

const socials = [
  { label: "Facebook", icon: Globe, href: "https://facebook.com/masjidbilal" },
  { label: "Instagram", icon: MessageCircle, href: "https://instagram.com/masjidbilal" },
  { label: "YouTube", icon: Play, href: "https://youtube.com/@masjidbilal" },
  { label: "X (Twitter)", icon: ExternalLink, href: "https://x.com/masjidbilal" },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default async function MediaPage() {
  const supabase = await createClient();
  const { data: playlists } = await supabase
    .from("youtube_playlists")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  const activeP = (playlists as YouTubePlaylist[]) ?? [];
  return (
    <>
      {/* ── 1. PAGE HEADER ──────────────────────────────────────── */}
      <HeroSection
        title="Media & Content"
        subtitle="Khutbahs, lectures, live streams, and community publications — all in one place."
      />

      <div className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* ── 2. FEATURED KHUTBAH ────────────────────────────── */}
          <section>
            <Card className="bg-card border-border/60 overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-5">
                  {/* Video embed */}
                  <div className="lg:col-span-3 bg-[#2C2C2A] relative aspect-video lg:aspect-auto">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Featured Khutbah"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {/* Info panel */}
                  <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col justify-center">
                    <Badge className="bg-gold/10 text-gold-dark border-0 text-xs font-semibold w-fit mb-3">
                      <Video className="size-3 mr-1" />
                      Featured Khutbah
                    </Badge>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-charcoal mb-2">
                      The Mercy of Allah
                    </h2>
                    <p className="text-muted-foreground text-sm mb-1">
                      Imam Ahmad Hassan
                    </p>
                    <p className="text-xs text-muted-foreground">
                      March 7, 2026 &middot; 32 minutes
                    </p>
                    <Separator className="my-4" />
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      A beautiful reflection on the boundless mercy of Allah and
                      how it manifests in our daily lives. This khutbah explores
                      Quranic verses and prophetic traditions on compassion.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 3. KHUTBAH ARCHIVE ─────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <Play className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-charcoal">
                  Khutbah Archive
                </h2>
                <p className="text-xs text-muted-foreground">
                  120+ recordings &middot; Updated weekly
                </p>
              </div>
            </div>
            <KhutbahArchive />
          </section>

          {/* ── 4. LECTURES & EVENTS ───────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <Tv className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-charcoal">
                  Lectures &amp; Event Recordings
                </h2>
                <p className="text-xs text-muted-foreground">
                  45+ lectures &middot; Special events
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {lectures.map((lec) => (
                <Card
                  key={lec.title}
                  className="bg-card border-border/60 hover:shadow-lg transition-shadow group overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Thumbnail placeholder */}
                    <div className="aspect-video bg-warm-gray flex items-center justify-center relative">
                      <ImageIcon className="size-10 text-sage/20" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <div className="h-12 w-12 rounded-full bg-card/90 flex items-center justify-center">
                          <Play className="size-5 text-sage ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-heading text-sm font-semibold text-charcoal mb-1 group-hover:text-sage transition-colors">
                        {lec.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {lec.speaker}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-normal"
                      >
                        {lec.date}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ── 5. LIVE STREAM CARD ────────────────────────────── */}
          <section>
            <Card className="bg-sage text-white border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2">
                  {/* Embed placeholder */}
                  <div className="bg-[#2C2C2A] relative aspect-video lg:aspect-auto min-h-[220px]">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/live_stream?channel=PLACEHOLDER"
                      title="Masjid Bilal Live Stream"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {/* Info */}
                  <div className="p-6 sm:p-8 flex flex-col justify-center">
                    <Badge className="bg-red-500/20 text-red-200 border-0 text-xs font-semibold w-fit mb-3">
                      <span className="h-2 w-2 rounded-full bg-red-400 mr-1.5 animate-pulse" />
                      Live
                    </Badge>
                    <h2 className="font-heading text-2xl font-bold mb-2">
                      Join Us Live
                    </h2>
                    <p className="text-white/70 text-sm leading-relaxed mb-4">
                      Watch Jumu&apos;ah prayers and special events streamed live
                      every week. Subscribe to our YouTube channel for
                      notifications.
                    </p>
                    <div className="text-xs text-white/50 space-y-1">
                      <p>
                        <span className="font-semibold text-white/70">Jumu&apos;ah:</span>{" "}
                        Every Friday at 12:15 PM &amp; 1:30 PM CST
                      </p>
                      <p>
                        <span className="font-semibold text-white/70">Taraweeh:</span>{" "}
                        Nightly during Ramadan after Isha
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 6. NEWSLETTER ARCHIVE ──────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <FileText className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-charcoal">
                  Newsletter Archive
                </h2>
                <p className="text-xs text-muted-foreground">
                  Monthly community updates
                </p>
              </div>
            </div>
            <Card className="bg-card border-border/60">
              <CardContent className="p-0 divide-y divide-border/30">
                {newsletters.map((nl) => (
                  <div
                    key={nl.title}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-warm-gray/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-sage shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-charcoal">
                          {nl.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {nl.date}
                        </p>
                      </div>
                    </div>
                    <a
                      href="#"
                      className="text-sage hover:text-sage-dark text-sm font-medium transition-colors"
                    >
                      Read &rarr;
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* ── 7. YOUTUBE PLAYLISTS ────────────────────────────── */}
          {activeP.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                  <ListVideo className="size-5" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-charcoal">
                    YouTube Playlists
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Curated collections of khutbahs &amp; lectures
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {activeP.map((pl) => {
                  const embedId = new URL(pl.playlist_url).searchParams.get("list");
                  return (
                    <Card key={pl.id} className="bg-card border-border/60 overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        {embedId && (
                          <div className="aspect-video">
                            <iframe
                              className="w-full h-full"
                              src={`https://www.youtube.com/embed/videoseries?list=${embedId}`}
                              title={pl.label}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="font-heading text-base font-semibold text-charcoal mb-1">
                            {pl.label}
                          </h3>
                          {pl.description && (
                            <p className="text-xs text-muted-foreground mb-3">
                              {pl.description}
                            </p>
                          )}
                          <a
                            href={pl.playlist_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" className="rounded-full text-xs h-8 px-4 border-sage text-sage hover:bg-sage hover:text-white">
                              <Play className="size-3 mr-1.5" />
                              Watch Playlist
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── 8. SOCIAL MEDIA FEED ───────────────────────────── */}
          <section className="text-center">
            <p className="text-muted-foreground text-sm mb-5">
              Follow us to stay connected with Masjid Bilal
            </p>
            <div className="flex justify-center gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/10 text-sage hover:bg-sage hover:text-white transition-colors"
                  aria-label={s.label}
                >
                  <s.icon className="size-5" />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
