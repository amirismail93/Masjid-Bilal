import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HeroSection } from "@/components/hero-section";
import { ContactForm } from "@/components/contact-form";
import type { SocialLink } from "@/types/database";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  MessageCircle,
  Play,
  ExternalLink,
  Heart,
  Users,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get in Touch — Masjid Bilal",
  description:
    "Contact Masjid Bilal — visit, call, or send a message. Staff directory, volunteer opportunities, and membership info.",
};

/* ------------------------------------------------------------------ */
/*  CONTACT INFO                                                       */
/* ------------------------------------------------------------------ */

const contactDetails = [
  {
    icon: MapPin,
    title: "Address",
    lines: ["1234 Main Street", "Houston, TX 77001"],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["(713) 555-1234"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["info@masjidbilal.org"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    lines: ["Mon–Fri: 10:00 AM – 5:00 PM", "Sat–Sun: 10:00 AM – 2:00 PM"],
  },
];

/* ------------------------------------------------------------------ */
/*  STAFF DIRECTORY                                                    */
/* ------------------------------------------------------------------ */

const staff = [
  {
    name: "Imam Ahmad Hassan",
    title: "Resident Imam",
    email: "imam@masjidbilal.org",
    initials: "AH",
  },
  {
    name: "Sr. Mariam Osman",
    title: "Office Manager",
    email: "office@masjidbilal.org",
    initials: "MO",
  },
  {
    name: "Br. Khalid Johnson",
    title: "Youth Director",
    email: "youth@masjidbilal.org",
    initials: "KJ",
  },
  {
    name: "Sr. Aisha Siddiqui",
    title: "Sisters' Programs Coordinator",
    email: "sisters@masjidbilal.org",
    initials: "AS",
  },
];

/* ------------------------------------------------------------------ */
/*  SOCIAL LINKS                                                       */
/* ------------------------------------------------------------------ */

const socialIconMap: Record<string, typeof Globe> = { Globe, MessageCircle, Play, ExternalLink, Heart, Users };

const fallbackSocials = [
  { label: "Facebook", icon: "Globe", href: "https://facebook.com/masjidbilal" },
  { label: "Instagram", icon: "MessageCircle", href: "https://instagram.com/masjidbilal" },
  { label: "YouTube", icon: "Play", href: "https://youtube.com/@masjidbilal" },
  { label: "X (Twitter)", icon: "ExternalLink", href: "https://x.com/masjidbilal" },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: dbSocials } = await supabase.from("social_links").select("*").order("display_order", { ascending: true });
  const socials = dbSocials && dbSocials.length > 0 ? (dbSocials as SocialLink[]) : (fallbackSocials as unknown as SocialLink[]);

  return (
    <>
      {/* ── 1. PAGE HEADER ──────────────────────────────────────── */}
      <HeroSection
        title="Get in Touch"
        subtitle="We'd love to hear from you — whether you have a question, want to volunteer, or just want to say salaam."
      />

      <div className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* ── 2. TWO-COLUMN LAYOUT ─────────────────────────────── */}
          <section>
            <div className="grid lg:grid-cols-5 gap-10 lg:gap-12">
              {/* LEFT — Contact Form */}
              <div className="lg:col-span-3">
                <ContactForm />
              </div>

              {/* RIGHT — Contact Info + Map */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card border-border/60">
                  <CardContent className="p-6">
                    <h2 className="font-heading text-lg font-bold text-charcoal mb-5">
                      Contact Information
                    </h2>
                    <div className="space-y-5">
                      {contactDetails.map((item) => (
                        <div key={item.title} className="flex gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage/10 text-sage shrink-0">
                            <item.icon className="size-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-charcoal mb-0.5">
                              {item.title}
                            </p>
                            {item.lines.map((line) => (
                              <p
                                key={line}
                                className="text-sm text-muted-foreground"
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Google Maps iframe */}
                <Card className="bg-card border-border/60 overflow-hidden">
                  <CardContent className="p-0">
                    <iframe
                      title="Masjid Bilal Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3464.123456789!2d-95.4!3d29.76!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDQ1JzM2LjAiTiA5NcKwMjQnMDAuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
                      width="100%"
                      height="220"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* ── 3. STAFF DIRECTORY ────────────────────────────────── */}
          <section>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-charcoal mb-1">
              Staff Directory
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Reach out directly to our team.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {staff.map((person) => (
                <Card
                  key={person.name}
                  className="bg-card border-border/60 hover:shadow-md transition-shadow text-center"
                >
                  <CardContent className="p-6">
                    {/* Avatar placeholder */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/10 text-sage font-heading text-xl font-bold mx-auto mb-3">
                      {person.initials}
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-charcoal">
                      {person.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {person.title}
                    </p>
                    <a
                      href={`mailto:${person.email}`}
                      className="text-sage hover:text-sage-dark text-xs font-medium transition-colors"
                    >
                      {person.email}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ── 4. SOCIAL MEDIA ROW ──────────────────────────────── */}
          <section className="text-center">
            <p className="text-muted-foreground text-sm mb-5">
              Follow us on social media
            </p>
            <div className="flex justify-center gap-4">
              {socials.map((s) => {
                const SIcon = socialIconMap[s.icon] ?? Globe;
                return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/10 text-sage hover:bg-sage hover:text-white transition-colors"
                  aria-label={s.label}
                >
                  <SIcon className="size-5" />
                </a>
                );
              })}
            </div>
          </section>

          {/* ── 5. VOLUNTEER CTA ─────────────────────────────────── */}
          <section>
            <Card className="bg-sage text-white border-0">
              <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card/15 shrink-0">
                    <Heart className="size-6" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold mb-1">
                      Want to serve the community?
                    </h2>
                    <p className="text-white/70 text-sm max-w-md">
                      Masjid Bilal runs on the dedication of its volunteers.
                      Whether you can give an hour or a day, there&apos;s a role
                      for you — from event setup to teaching to food drives.
                    </p>
                  </div>
                </div>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-gold hover:bg-gold-dark text-white font-semibold rounded-full px-6 h-11 shadow-sm whitespace-nowrap">
                    Sign Up to Volunteer
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>

          {/* ── 6. MEMBERSHIP LINK ───────────────────────────────── */}
          <section>
            <Card className="bg-card border-border/60">
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold-dark shrink-0">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-charcoal mb-1">
                      Become a Member of Masjid Bilal
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-lg">
                      Members receive voting rights, priority program
                      enrollment, and help shape the future of our community.
                      Annual membership is open to all Muslims in the greater
                      Houston area.
                    </p>
                  </div>
                </div>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="rounded-full border-sage text-sage hover:bg-sage hover:text-white font-semibold px-6 h-10 whitespace-nowrap"
                  >
                    Apply for Membership
                    <ExternalLink className="size-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}
