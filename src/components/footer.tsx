import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Globe, MessageCircle, Play } from "lucide-react";

const quickLinks = [
  { href: "/prayer-times", label: "Prayer Times" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
  { href: "/donate", label: "Donate" },
];

const resourceLinks = [
  { href: "/media", label: "Media" },
  { href: "/resources", label: "Resources" },
  { href: "/programs", label: "Youth Programs" },
  { href: "/services", label: "Marriage Services" },
  { href: "/services", label: "Funeral Services" },
];

export function Footer() {
  return (
    <footer className="bg-[#2C2C2A] text-white/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-white font-bold text-sm">
                MB
              </div>
              <span className="font-heading text-lg font-bold text-white">
                Masjid Bilal
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Serving the Houston Muslim community with prayer, education, and
              outreach since 1995. All are welcome.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-sage transition-colors"
              >
                <Globe className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-sage transition-colors"
              >
                <MessageCircle className="size-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-sage transition-colors"
              >
                <Play className="size-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="size-4 mt-0.5 shrink-0 text-sage" />
                <span>
                  1234 Main Street
                  <br />
                  Houston, TX 77001
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Phone className="size-4 shrink-0 text-sage" />
                <a href="tel:+17135551234" className="hover:text-white transition-colors">
                  (713) 555-1234
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Mail className="size-4 shrink-0 text-sage" />
                <a
                  href="mailto:info@masjidbilal.org"
                  className="hover:text-white transition-colors"
                >
                  info@masjidbilal.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} Masjid Bilal. All rights reserved.</p>
          <p>Houston, Texas &middot; Serving the community with faith and love</p>
        </div>
      </div>
    </footer>
  );
}
