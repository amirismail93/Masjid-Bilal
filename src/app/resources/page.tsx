import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { getPageSections } from "@/lib/get-page-sections";
import type { HalalRestaurant, MuslimBusiness, RecommendedApp, RecommendedBook, FaqItem, DownloadableResource } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import { ZakatCalculator } from "@/components/zakat-calculator";
import { FaqAccordion } from "@/components/faq-accordion";
import {
  MapPin,
  ExternalLink,
  Smartphone,
  BookOpen,
  Download,
  FileText,
  Scale,
  Store,
  Briefcase,
  ScrollText,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Islamic Resources — Masjid Bilal",
  description:
    "Zakat calculator, halal directory, FAQs, recommended apps & books, and downloadable resources from Masjid Bilal.",
};

/* ------------------------------------------------------------------ */
/*  ZAKAT & SADAQAH FAQ                                                */
/* ------------------------------------------------------------------ */

const fallbackZakatFaq = [
  {
    question: "Who is obligated to pay Zakat?",
    answer:
      "Zakat is obligatory on every adult, sane Muslim whose total eligible wealth exceeds the Nisab threshold for a full lunar year. Eligible wealth includes cash, gold, silver, business inventory, and investments.",
  },
  {
    question: "What is the Nisab threshold?",
    answer:
      "The Nisab is the minimum amount of wealth a Muslim must possess before Zakat becomes due. It is equivalent to 87.48 grams of gold or 612.36 grams of silver. Most scholars recommend using the silver standard to benefit more recipients.",
  },
  {
    question: "What is the difference between Zakat and Sadaqah?",
    answer:
      "Zakat is an obligatory annual payment of 2.5% on eligible wealth and is one of the five pillars of Islam. Sadaqah is voluntary charity that can be given at any time, in any amount, and to anyone in need.",
  },
  {
    question: "What is Fidyah and when is it required?",
    answer:
      "Fidyah is a compensation paid by those who cannot fast during Ramadan due to chronic illness, old age, or pregnancy. It typically involves feeding one poor person for each day missed — roughly $10–$15 per day.",
  },
  {
    question: "What is Kaffarah?",
    answer:
      "Kaffarah is a penalty for deliberately breaking a fast without a valid reason. It requires fasting for 60 consecutive days or feeding 60 poor people for each day intentionally broken.",
  },
  {
    question: "Can I give my Zakat to Masjid Bilal?",
    answer:
      "Yes. Masjid Bilal distributes Zakat funds to eligible recipients in the Houston area according to the eight categories specified in the Quran (Surah At-Tawbah 9:60). Visit the Donate page to designate your Zakat.",
  },
];

/* ------------------------------------------------------------------ */
/*  HALAL RESTAURANTS                                                  */
/* ------------------------------------------------------------------ */

const fallbackRestaurants = [
  { name: "Salam Grill", cuisine: "Mediterranean", area: "Hillcroft" },
  { name: "Bismillah Biryani House", cuisine: "Pakistani / Indian", area: "Southwest Houston" },
  { name: "Al-Ameer Restaurant", cuisine: "Lebanese", area: "Westheimer" },
  { name: "Nile River Café", cuisine: "Somali / East African", area: "Bissonnet" },
  { name: "Turkish Kebab House", cuisine: "Turkish", area: "Harwin" },
  { name: "Halal Guys Houston", cuisine: "American Halal", area: "Rice Village" },
];

/* ------------------------------------------------------------------ */
/*  LOCAL MUSLIM BUSINESSES                                            */
/* ------------------------------------------------------------------ */

const fallbackBusinesses = [
  { name: "Crescent Auto Repair", type: "Automotive", area: "Gessner" },
  { name: "Barakah Tax & Accounting", type: "Financial Services", area: "Sugar Land" },
  { name: "Noor Dental Clinic", type: "Healthcare", area: "Hillcroft" },
  { name: "Iman Realty Group", type: "Real Estate", area: "Katy" },
  { name: "Al-Falah Grocery", type: "Grocery / Halal Meat", area: "Southwest Houston" },
  { name: "Sunnah Wellness", type: "Hijama & Wellness", area: "Missouri City" },
];

/* ------------------------------------------------------------------ */
/*  APPS & BOOKS                                                       */
/* ------------------------------------------------------------------ */

const fallbackApps = [
  { name: "Muslim Pro", description: "Prayer times, Quran, Qibla compass" },
  { name: "Quran.com", description: "Read, listen, and study the Quran" },
  { name: "MyDuaa", description: "Daily adhkar and du'a collections" },
  { name: "Pillars", description: "Habit tracker for Islamic practices" },
  { name: "Tarteel AI", description: "AI-powered Quran recitation feedback" },
];

const fallbackBooks = [
  { name: "The Sealed Nectar", description: "Biography of Prophet Muhammad ﷺ" },
  { name: "Purification of the Heart", description: "Imam al-Mawlud, translated by Hamza Yusuf" },
  { name: "Riyad as-Salihin", description: "Classic hadith collection by Imam an-Nawawi" },
  { name: "In the Footsteps of the Prophet", description: "Tariq Ramadan's accessible seerah" },
  { name: "Reclaim Your Heart", description: "Yasmin Mogahed on spiritual healing" },
];

/* ------------------------------------------------------------------ */
/*  NON-MUSLIM VISITOR FAQ                                             */
/* ------------------------------------------------------------------ */

const fallbackVisitorFaq = [
  {
    question: "What should I wear when visiting the masjid?",
    answer:
      "We ask all visitors — men and women — to dress modestly. Long pants or skirts and shirts that cover the shoulders are appreciated. Women are welcome to wear a headscarf; we also have loaner scarves at the entrance if needed.",
  },
  {
    question: "Can I attend Jumu'ah (Friday) prayer as a non-Muslim?",
    answer:
      "Absolutely! You are welcome to sit quietly and observe the khutbah (sermon) and prayer. We have a designated visitor seating area with informational pamphlets. Feel free to ask questions afterward.",
  },
  {
    question: "Do I need to remove my shoes?",
    answer:
      "Yes, shoes are removed before entering the prayer hall. We have shoe racks at the entrance. Socks or bare feet are both fine.",
  },
  {
    question: "Is there a fee to visit or attend events?",
    answer:
      "No. All prayers, tours, and most community events are completely free. Some fundraising dinners may have a suggested donation, but there is never a required fee.",
  },
  {
    question: "How do I arrange a group tour of the masjid?",
    answer:
      "Contact our office at (713) 555-1234 or email info@masjidbilal.org to schedule a guided tour. We welcome school groups, interfaith delegations, and curious individuals any day of the week.",
  },
];

/* ------------------------------------------------------------------ */
/*  DOWNLOADS                                                          */
/* ------------------------------------------------------------------ */

const fallbackDownloads = [
  { name: "Monthly Prayer Timetable", format: "PDF", size: "120 KB" },
  { name: "New Muslim Welcome Guide", format: "PDF", size: "2.4 MB" },
  { name: "501(c)(3) Tax-Exempt Letter", format: "PDF", size: "85 KB" },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default async function ResourcesPage() {
  const supabase = await createClient();
  const sec = await getPageSections("resources");

  const { data: dbRest } = await supabase.from("halal_restaurants").select("*").order("display_order");
  const halalRestaurants = dbRest && dbRest.length > 0 ? dbRest : fallbackRestaurants;

  const { data: dbBiz } = await supabase.from("muslim_businesses").select("*").order("display_order");
  const muslimBusinesses = dbBiz && dbBiz.length > 0 ? dbBiz : fallbackBusinesses;

  const { data: dbApps } = await supabase.from("recommended_apps").select("*").order("display_order");
  const apps = dbApps && dbApps.length > 0 ? dbApps : fallbackApps;

  const { data: dbBooks } = await supabase.from("recommended_books").select("*").order("display_order");
  const books = dbBooks && dbBooks.length > 0 ? dbBooks : fallbackBooks;

  const { data: dbZfaq } = await supabase.from("faq_items").select("*").eq("category", "zakat").order("display_order");
  const zakatFaq = dbZfaq && dbZfaq.length > 0 ? dbZfaq.map((f: { question: string; answer: string }) => ({ question: f.question, answer: f.answer })) : fallbackZakatFaq;

  const { data: dbVfaq } = await supabase.from("faq_items").select("*").eq("category", "visitor").order("display_order");
  const visitorFaq = dbVfaq && dbVfaq.length > 0 ? dbVfaq.map((f: { question: string; answer: string }) => ({ question: f.question, answer: f.answer })) : fallbackVisitorFaq;

  const { data: dbDl } = await supabase.from("downloadable_resources").select("*").order("display_order");
  const downloads = dbDl && dbDl.length > 0 ? dbDl : fallbackDownloads;

  return (
    <>
      {/* ── 1. PAGE HEADER ──────────────────────────────────────── */}
      <HeroSection
        title={sec.get("hero_title") ?? "Islamic Resources"}
        subtitle={sec.get("hero_subtitle") ?? "Tools, directories, FAQs, and downloads to support your faith and community life."}
      />

      <div className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* ── 2. ZAKAT CALCULATOR ────────────────────────────── */}
          <section>
            <ZakatCalculator />
          </section>

          {/* ── 3. ZAKAT & SADAQAH FAQ ─────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <Scale className="size-5" />
              </div>
              <h2 className="font-heading text-xl font-bold text-charcoal">
                Zakat &amp; Sadaqah FAQ
              </h2>
            </div>
            <FaqAccordion items={zakatFaq} />
          </section>

          {/* ── 4. HALAL RESTAURANT DIRECTORY ──────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <Store className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-charcoal">
                  Halal Restaurant Directory
                </h2>
                <p className="text-xs text-muted-foreground">
                  Houston-area halal dining
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {halalRestaurants.map((r) => (
                <Card
                  key={r.name}
                  className="bg-card border-border/60 hover:shadow-md transition-shadow group"
                >
                  <CardContent className="p-5">
                    <h4 className="font-heading text-sm font-semibold text-charcoal mb-1 group-hover:text-sage transition-colors">
                      {r.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {r.cuisine}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      {r.area}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Own a halal restaurant?{" "}
              <Link
                href="/contact"
                className="text-sage hover:underline font-medium"
              >
                Submit your business &rarr;
              </Link>
            </p>
          </section>

          {/* ── 5. LOCAL MUSLIM BUSINESS DIRECTORY ─────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <Briefcase className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-charcoal">
                  Local Muslim Business Directory
                </h2>
                <p className="text-xs text-muted-foreground">
                  Support Muslim-owned businesses in Houston
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {muslimBusinesses.map((b) => (
                <Card
                  key={b.name}
                  className="bg-card border-border/60 hover:shadow-md transition-shadow group"
                >
                  <CardContent className="p-5">
                    <h4 className="font-heading text-sm font-semibold text-charcoal mb-1 group-hover:text-sage transition-colors">
                      {b.name}
                    </h4>
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-normal mb-2"
                    >
                      {b.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      {b.area}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Want to list your business?{" "}
              <Link
                href="/contact"
                className="text-sage hover:underline font-medium"
              >
                Submit your business &rarr;
              </Link>
            </p>
          </section>

          {/* ── 6. RECOMMENDED APPS & BOOKS ────────────────────── */}
          <section>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Apps */}
              <Card className="bg-card border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage/10 text-sage">
                      <Smartphone className="size-4" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-charcoal">
                      Islamic Apps
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {apps.map((a) => (
                      <li key={a.name} className="flex items-start gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-sage mt-2 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-charcoal">
                            {a.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(a as {description?: string}).description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Books */}
              <Card className="bg-card border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage/10 text-sage">
                      <BookOpen className="size-4" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-charcoal">
                      Recommended Books
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {books.map((b) => (
                      <li key={b.name} className="flex items-start gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-gold mt-2 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-charcoal">
                            {b.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(b as {description?: string}).description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ── 7. ISLAMIC WILL INFO ───────────────────────────── */}
          <section>
            <Card className="bg-sage text-white border-0">
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card/15 shrink-0">
                    <ScrollText className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold mb-1">
                      Islamic Estate Planning &amp; Wills
                    </h3>
                    <p className="text-white/70 text-sm max-w-lg">
                      Every Muslim should have an Islamic will (wasiyyah) to
                      ensure assets are distributed according to Shariah. Without
                      one, state law determines inheritance — which may conflict
                      with Islamic obligations.
                    </p>
                  </div>
                </div>
                <a
                  href="https://www.myislamicwill.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-gold hover:bg-gold-dark text-white font-semibold rounded-full px-6 h-10 shadow-sm whitespace-nowrap">
                    Create Your Will
                    <ExternalLink className="size-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>

          {/* ── 8. NON-MUSLIM VISITOR FAQ ──────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-dark">
                <BookOpen className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-charcoal">
                  Visiting the Masjid — FAQ for Non-Muslims
                </h2>
                <p className="text-xs text-muted-foreground">
                  All are welcome — here&apos;s what to expect
                </p>
              </div>
            </div>
            <FaqAccordion items={visitorFaq} />
          </section>

          {/* ── 9. DOWNLOADS ───────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <Download className="size-5" />
              </div>
              <h2 className="font-heading text-xl font-bold text-charcoal">
                Downloads
              </h2>
            </div>
            <Card className="bg-card border-border/60">
              <CardContent className="p-0 divide-y divide-border/30">
                {downloads.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between px-5 py-4 hover:bg-warm-gray/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-sage shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-charcoal">
                          {d.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {d.format} &middot; {d.size}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-xs h-8 px-3"
                    >
                      <Download className="size-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}
