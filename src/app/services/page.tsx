import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageSections } from "@/lib/get-page-sections";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HeroSection } from "@/components/hero-section";
import { RentalRequestForm } from "@/components/rental-request-form";
import {
  Heart,
  Users,
  ShieldCheck,
  Stethoscope,
  Handshake,
  Hospital,
  Building2,
  Sparkles,
  Phone,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Baby,
  GraduationCap,
  HandHeart,
  Globe,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import type { ServiceItem, JanazahStep, RentalTier } from "@/types/database";

export const metadata: Metadata = {
  title: "Community Services — Masjid Bilal",
  description:
    "Janazah, nikah, counseling, hospital visitation, and community support services at Masjid Bilal, Houston TX.",
};

/* ------------------------------------------------------------------ */
/*  ICON MAP — maps string icon names from DB to Lucide components     */
/* ------------------------------------------------------------------ */

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Heart,
  Users,
  Handshake,
  Hospital,
  Building2,
  Sparkles,
  BookOpen,
  Phone,
  Stethoscope,
  Baby,
  GraduationCap,
  HandHeart,
  Globe,
};

/* ------------------------------------------------------------------ */
/*  FALLBACK DATA (used if Supabase tables are empty)                  */
/* ------------------------------------------------------------------ */

const fallbackServices: Omit<ServiceItem, "id">[] = [
  { icon: "ShieldCheck", title: "Janazah (Funeral) Services", description: "Complete funeral services including ghusl (ritual washing), kafan (shrouding), janazah prayer, and burial coordination. Our team is available 24/7 to support families during their time of loss.", cta_label: "Contact for Janazah", cta_href: "/contact", display_order: 1, is_active: true },
  { icon: "Heart", title: "Nikah Services", description: "Islamic marriage ceremonies officiated by our imam. We guide couples through requirements including wali consent, mahr agreement, witnesses, and documentation for legal recognition.", cta_label: "Schedule a Nikah", cta_href: "/services/nikah-request", display_order: 2, is_active: true },
  { icon: "Users", title: "Islamic Counseling", description: "Confidential individual and family counseling rooted in Islamic principles. Our trained counselors help with personal challenges, marital issues, grief, and spiritual growth.", cta_label: "Book a Session", cta_href: "/contact", display_order: 3, is_active: true },
  { icon: "Handshake", title: "Pre-Marital Counseling", description: "Prepare for a strong Islamic marriage through structured sessions covering communication, expectations, finances, and Islamic rights and responsibilities of spouses.", cta_label: "Schedule Counseling", cta_href: "/contact", display_order: 4, is_active: true },
  { icon: "Hospital", title: "Hospital Visitation", description: "Request a visit from our imam or community volunteers when you or a loved one is hospitalized. We offer du'a, companionship, and spiritual comfort during difficult times.", cta_label: "Request a Visit", cta_href: "/contact", display_order: 5, is_active: true },
  { icon: "Building2", title: "Prison Ministry & Outreach", description: "Our outreach team provides Islamic education, mentorship, and re-entry support for incarcerated and formerly incarcerated Muslims in the greater Houston area.", cta_label: "Learn More", cta_href: "/contact", display_order: 6, is_active: true },
  { icon: "Sparkles", title: "New Muslim / Revert Support", description: "A welcoming program for those new to Islam: one-on-one mentoring, shahada ceremony, starter resource kits, community introductions, and ongoing learning support.", cta_label: "Get Connected", cta_href: "/contact", display_order: 7, is_active: true },
];

const fallbackJanazahSteps = [
  "Contact Masjid Bilal immediately — our 24/7 line is always open.",
  "Our team coordinates with the family on timing, burial, and logistics.",
  "Ghusl (ritual washing) is performed by trained community volunteers.",
  "The deceased is wrapped in a white kafan (shroud).",
  "Janazah (funeral) prayer is held at the masjid with the community.",
  "Burial is coordinated at an Islamic-section cemetery in the Houston area.",
  "Follow-up bereavement support and du'a gatherings for the family.",
];

const fallbackTiers = [
  { name: "Community Room", capacity: "Up to 50 guests", price: "$150 / half day" },
  { name: "Main Hall", capacity: "Up to 200 guests", price: "$500 / half day" },
  { name: "Full Facility", capacity: "Up to 300+ guests", price: "$900 / full day" },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default async function ServicesPage() {
  const supabase = await createClient();
  const sec = await getPageSections("services");

  // Fetch services
  const { data: dbServices } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const services =
    dbServices && dbServices.length > 0
      ? (dbServices as ServiceItem[])
      : (fallbackServices as unknown as ServiceItem[]);

  // Fetch janazah steps
  const { data: dbSteps } = await supabase
    .from("janazah_steps")
    .select("*")
    .order("step_number", { ascending: true });

  const janazahSteps =
    dbSteps && dbSteps.length > 0
      ? (dbSteps as JanazahStep[]).map((s) => s.description)
      : fallbackJanazahSteps;

  // Fetch rental tiers
  const { data: dbTiers } = await supabase
    .from("rental_tiers")
    .select("*")
    .order("display_order", { ascending: true });

  const rentalTiers =
    dbTiers && dbTiers.length > 0
      ? (dbTiers as RentalTier[])
      : (fallbackTiers as unknown as RentalTier[]);

  return (
    <>
      {/* ── 1. PAGE HEADER ──────────────────────────────────────── */}
      <HeroSection
        title={sec.get("hero_title") ?? "Community Services"}
        subtitle={sec.get("hero_subtitle") ?? "Supporting our community through every stage of life — from birth to burial and everything in between."}
      />

      <div className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* ── 2. SERVICES GRID ─────────────────────────────────── */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => {
                const Icon = iconMap[s.icon] ?? Heart;
                return (
                  <Card
                    key={s.title}
                    className="bg-card border-border/60 hover:border-sage/40 hover:shadow-lg transition-all group flex flex-col"
                  >
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage/10 text-sage mb-4 group-hover:bg-sage group-hover:text-white transition-colors">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-heading text-base font-semibold text-charcoal mb-2 group-hover:text-sage transition-colors">
                        {s.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">
                        {s.description}
                      </p>
                      <Link href={s.cta_href}>
                        <Button
                          variant="outline"
                          className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-sm w-full"
                        >
                          {s.cta_label}
                          <ArrowRight className="size-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* ── 3. JANAZAH DETAIL CARD ───────────────────────────── */}
          <section>
            <Card className="bg-sage text-white border-0 overflow-hidden">
              <CardContent className="p-6 sm:p-10">
                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Steps */}
                  <div className="lg:col-span-3">
                    <Badge className="bg-card/15 text-white border-0 text-xs mb-3">
                      24/7 Service
                    </Badge>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-5">
                      Janazah Process
                    </h2>
                    <ol className="space-y-3">
                      {janazahSteps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card/15 text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-white/80 text-sm leading-relaxed">
                            {step}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Contact panel */}
                  <div className="lg:col-span-2 flex flex-col items-center justify-center text-center lg:border-l lg:border-white/15 lg:pl-8">
                    <Phone className="size-8 text-gold mb-3" />
                    <p className="text-xs uppercase tracking-widest text-white/50 mb-2">
                      24/7 Janazah Hotline
                    </p>
                    <p className="font-heading text-3xl sm:text-4xl font-bold text-gold mb-2">
                      (713) 555-1234
                    </p>
                    <p className="text-white/60 text-sm max-w-xs">
                      Call immediately upon a death in the family. Our team will
                      guide you through every step.
                    </p>
                    <Separator className="bg-card/15 my-5 w-24" />
                    <Link href="/contact">
                      <Button className="bg-gold hover:bg-gold-dark text-white font-semibold rounded-full px-6 h-10 shadow-sm">
                        Contact Janazah Team
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 4. FACILITY RENTAL ───────────────────────────────── */}
          <section>
            <div className="mb-5">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">
                Facility Rental
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Host your next event in our well-maintained, versatile spaces.
              </p>
            </div>

            <Card className="bg-card border-border/60 mb-8">
              <CardContent className="p-6 sm:p-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {rentalTiers.map((tier) => (
                    <div
                      key={tier.name}
                      className="rounded-xl border border-border/60 p-5 hover:border-sage/40 transition-colors"
                    >
                      <h4 className="font-heading text-base font-semibold text-charcoal mb-1">
                        {tier.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        {tier.capacity}
                      </p>
                      <p className="font-heading text-lg font-bold text-sage">
                        {tier.price}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium text-charcoal">Included:</span>{" "}
                  Tables, chairs, basic AV, kitchen access, parking, and setup/teardown assistance.
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-charcoal">Note:</span>{" "}
                  All events must comply with Islamic guidelines. Alcohol and non-halal food are not permitted on the premises.
                </p>

                <div className="mt-6">
                  <a href="#rental-form">
                    <Button className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-10 shadow-sm">
                      Submit a Rental Request
                      <ArrowRight className="size-4 ml-1.5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* ── 5. RENTAL REQUEST FORM ──────────────────────────── */}
            <RentalRequestForm />
          </section>
        </div>
      </div>
    </>
  );
}
