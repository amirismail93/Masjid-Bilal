import { HeroSection } from "@/components/hero-section";
import { NikahRequestForm } from "@/components/nikah-request-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nikah Request — Masjid Bilal",
  description:
    "Submit a Nikah (Islamic marriage) request to Masjid Bilal, Houston TX.",
};

export default function NikahRequestPage() {
  return (
    <>
      <HeroSection
        title="Nikah Request"
        subtitle="Submit your Islamic marriage request below. Our team will follow up within 2-3 business days, insha'Allah."
      />

      <div className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <NikahRequestForm />
        </div>
      </div>
    </>
  );
}
