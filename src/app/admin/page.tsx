import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Calendar,
  Megaphone,
  BookOpen,
  Users,
  Film,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [events, announcements, programs, staff, media, prayerTimes] =
    await Promise.all([
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase
        .from("announcements")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("programs")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("staff")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase.from("media").select("id", { count: "exact", head: true }),
      supabase.from("prayer_times").select("id", { count: "exact", head: true }),
    ]);

  const stats = [
    {
      label: "Prayer Times",
      value: prayerTimes.count ?? 0,
      icon: Clock,
      href: "/admin/prayer-times",
      color: "bg-sage/10 text-sage",
    },
    {
      label: "Events",
      value: events.count ?? 0,
      icon: Calendar,
      href: "/admin/events",
      color: "bg-gold/10 text-gold-dark",
    },
    {
      label: "Active Announcements",
      value: announcements.count ?? 0,
      icon: Megaphone,
      href: "/admin/announcements",
      color: "bg-destructive/10 text-destructive",
    },
    {
      label: "Active Programs",
      value: programs.count ?? 0,
      icon: BookOpen,
      href: "/admin/programs",
      color: "bg-sage/10 text-sage",
    },
    {
      label: "Staff Members",
      value: staff.count ?? 0,
      icon: Users,
      href: "/admin/staff",
      color: "bg-gold/10 text-gold-dark",
    },
    {
      label: "Media Items",
      value: media.count ?? 0,
      icon: Film,
      href: "/admin/media",
      color: "bg-sage/10 text-sage",
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal mb-1">
        Dashboard
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Overview of Masjid Bilal content
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="bg-card border-border/60 hover:shadow-md transition-shadow group">
              <CardContent className="p-5 flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color} shrink-0`}
                >
                  <s.icon className="size-5" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-charcoal">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
