import { HeroSection } from "@/components/hero-section";
import { EventsContent } from "@/components/events-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Calendar — Masjid Bilal",
  description:
    "Upcoming community events, gatherings, celebrations, and the Masjid Bilal calendar.",
};

export default function EventsPage() {
  return (
    <>
      {/* ── 1. PAGE HEADER ──────────────────────────────────────── */}
      <HeroSection
        title="Events & Community Calendar"
        subtitle="Stay connected with gatherings, celebrations, and programs happening at Masjid Bilal."
      />

      <div className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EventsContent />
        </div>
      </div>
    </>
  );
}
