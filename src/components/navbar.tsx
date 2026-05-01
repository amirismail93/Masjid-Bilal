"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Heart, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/prayer-times", label: "Prayer Times" },
  { href: "/programs", label: "Programs" },
  { href: "/classes", label: "Classes" },
  { href: "/events", label: "Events" },
  { href: "/media", label: "Media" },
  { href: "/services", label: "Services" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-warm-white/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-white font-bold text-sm">
            MB
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-lg font-bold text-charcoal leading-none">
              Masjid Bilal
            </span>
            <span className="text-xs text-muted-foreground leading-none mt-0.5">
              Houston, TX
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-sage bg-sage/10"
                  : "text-charcoal/70 hover:text-sage hover:bg-sage/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: Theme toggle + Donate + Mobile Menu */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/admin/login" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="rounded-full px-4 h-9 text-sm font-medium text-charcoal/70 hover:text-sage hidden sm:inline-flex">
              <LogIn className="size-4 mr-1.5" />
              Login
            </Button>
          </Link>
          <Link href="/donate">
            <Button className="bg-gold hover:bg-gold-dark text-white font-semibold rounded-full px-5 h-9 shadow-sm">
              <Heart className="size-4 mr-1.5" />
              Donate
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden" />
              }
            >
              <Menu className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-warm-white transition-colors">
              <SheetTitle className="font-heading text-lg font-bold text-charcoal px-2 mb-4">
                Masjid Bilal
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "text-sage bg-sage/10"
                        : "text-charcoal/70 hover:text-sage hover:bg-sage/5"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
