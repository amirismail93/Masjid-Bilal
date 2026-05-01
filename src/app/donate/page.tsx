import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSection } from "@/components/hero-section";
import { Heart, Building, BookOpen, Users, Utensils, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import type { DonationCategory } from "@/types/database";
import { DonationForm } from "@/components/donation-form";

export const metadata: Metadata = {
  title: "Donate — Masjid Bilal",
  description: "Support Masjid Bilal with your generous contributions. Every dollar makes a difference.",
};

const donIconMap: Record<string, LucideIcon> = { Building, BookOpen, Users, Utensils, Heart };

const fallbackCategories = [
  { icon: "Building", title: "General Fund", description: "Supports daily masjid operations, utilities, and maintenance." },
  { icon: "BookOpen", title: "Education Fund", description: "Funds Islamic school, Quran classes, and teacher salaries." },
  { icon: "Users", title: "Youth Programs", description: "Supports mentorship, sports, and enrichment activities for youth." },
  { icon: "Utensils", title: "Community Kitchen", description: "Provides meals for community events, iftars, and those in need." },
  { icon: "Building", title: "Building Expansion", description: "Contributes to the masjid expansion and renovation project." },
  { icon: "Heart", title: "Zakat & Sadaqah", description: "Distributed to eligible recipients according to Islamic guidelines." },
];

export default async function DonatePage() {
  const supabase = await createClient();
  const { data: dbCats } = await supabase.from("donation_categories").select("*").eq("is_active", true).order("display_order", { ascending: true });
  const donationCategories = dbCats && dbCats.length > 0 ? (dbCats as DonationCategory[]) : (fallbackCategories as unknown as DonationCategory[]);
  const categoryNames = donationCategories.map((c) => c.title);

  return (
    <>
      <HeroSection
        title="Support Masjid Bilal"
        subtitle="Your generosity helps us serve the community and spread knowledge"
      />

      <section className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <DonationForm categories={categoryNames} />

          {/* Donation Categories */}
          <h3 className="font-heading text-xl font-bold text-charcoal mb-6 text-center">
            Where Your Donation Goes
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {donationCategories.map((cat) => {
              const CatIcon = donIconMap[(cat as unknown as { icon: string }).icon] ?? Heart;
              return (
              <Card key={cat.title} className="bg-card border-border/60">
                <CardContent className="p-5 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage mx-auto mb-3">
                    <CatIcon className="size-5" />
                  </div>
                  <h4 className="font-heading font-semibold text-charcoal mb-1">
                    {cat.title}
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {cat.description}
                  </p>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
