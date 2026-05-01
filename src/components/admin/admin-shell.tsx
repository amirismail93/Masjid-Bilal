"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Moon,
  Megaphone,
  BookOpen,
  Users,
  Film,
  Settings,
  LogOut,
  ArrowLeft,
  Calendar,
  FileText,
  ListVideo,
  HeartHandshake,
  UserCog,
  LayoutTemplate,
  Briefcase,
  GraduationCap,
  Info,
  FolderOpen,
  Inbox,
  ClipboardList,
  DollarSign,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  section: string;
  items: NavLink[];
}

const navGroups: NavGroup[] = [
  {
    section: "",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Worship & Prayer",
    items: [
      { href: "/admin/prayer-times", label: "Prayer Times", icon: Clock },
      { href: "/admin/jumuah", label: "Jumu'ah", icon: CalendarDays },
      { href: "/admin/ramadan", label: "Ramadan", icon: Moon },
    ],
  },
  {
    section: "Events & Programs",
    items: [
      { href: "/admin/events", label: "Events", icon: Calendar },
      { href: "/admin/event-pages", label: "Event Pages", icon: LayoutTemplate },
      { href: "/admin/programs", label: "Programs", icon: BookOpen },
      { href: "/admin/classes", label: "Classes", icon: GraduationCap },
    ],
  },
  {
    section: "Services & Requests",
    items: [
      { href: "/admin/services", label: "Services", icon: Briefcase },
      { href: "/admin/forms", label: "Forms", icon: ClipboardList },
      { href: "/admin/nikah-requests", label: "Nikah Requests", icon: HeartHandshake },
      { href: "/admin/submissions", label: "Submissions", icon: Inbox },
    ],
  },
  {
    section: "Content & Media",
    items: [
      { href: "/admin/page-sections", label: "Page Sections", icon: FileText },
      { href: "/admin/about", label: "About & Content", icon: Info },
      { href: "/admin/resources", label: "Resources", icon: FolderOpen },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/media", label: "Media", icon: Film },
      { href: "/admin/playlists", label: "Playlists", icon: ListVideo },
    ],
  },
  {
    section: "Finance",
    items: [
      { href: "/admin/payments", label: "Payments", icon: DollarSign },
    ],
  },
  {
    section: "People",
    items: [
      { href: "/admin/staff", label: "Staff", icon: Users },
    ],
  },
  {
    section: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

interface Props {
  user: User | null;
  children: React.ReactNode;
}

function NavSection({ group, pathname }: { group: NavGroup; pathname: string }) {
  const hasActiveChild = group.items.some((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );
  const [open, setOpen] = useState(group.section === "" || hasActiveChild);

  // No section header for the Dashboard group
  if (group.section === "") {
    return (
      <div className="space-y-0.5">
        {group.items.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              active ? "bg-sage/10 text-sage" : "text-charcoal/60 hover:text-charcoal hover:bg-warm-gray/50"
            )}>
              <item.icon className="size-4" />{item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-3 py-1.5 mb-0.5 group"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-charcoal transition-colors">
          {group.section}
        </span>
        <ChevronDown className={cn(
          "size-3 text-muted-foreground transition-transform duration-200",
          open ? "rotate-0" : "-rotate-90"
        )} />
      </button>
      {open && (
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-sage/10 text-sage" : "text-charcoal/60 hover:text-charcoal hover:bg-warm-gray/50"
              )}>
                <item.icon className="size-4" />{item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminShell({ user, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  // Login page renders without shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    return null;
  }

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-warm-white flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border/60 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-border/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-white font-bold text-xs">
            MB
          </div>
          <div className="leading-tight">
            <p className="font-heading text-sm font-bold text-charcoal">
              Masjid Bilal
            </p>
            <p className="text-[10px] text-muted-foreground">Admin Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
          {navGroups.map((group) => (
            <NavSection key={group.section || "top"} group={group} pathname={pathname} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-border/60 space-y-2">
          <Link
            href="/admin/account"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors",
              pathname === "/admin/account"
                ? "bg-sage/10 text-sage"
                : "text-muted-foreground hover:text-charcoal"
            )}
          >
            <UserCog className="size-3.5" />
            My Account
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to website
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 w-full transition-colors"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-14 border-b border-border/60 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <p className="text-sm text-muted-foreground">
            {user?.email ?? "Not signed in"}
          </p>
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
