import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/hero-section";
import { getPageSections } from "@/lib/get-page-sections";
import { ClassRegistrationCard } from "@/components/class-registration-card";
import type { Metadata } from "next";
import type { ClassItem } from "@/types/database";

export const metadata: Metadata = {
  title: "Classes — Masjid Bilal",
  description: "Browse and register for Islamic classes and courses at Masjid Bilal, Houston TX.",
};

export default async function ClassesPage() {
  const supabase = await createClient();
  const sec = await getPageSections("classes");

  const { data } = await supabase
    .from("classes")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const classes = (data as ClassItem[]) ?? [];

  return (
    <>
      <HeroSection
        title={sec.get("hero_title") ?? "Classes & Courses"}
        subtitle={sec.get("hero_subtitle") ?? "Grow your knowledge of Islam. Browse our current classes and register online."}
      />

      <div className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {classes.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-20">
              No classes are currently available. Please check back soon!
            </p>
          ) : (
            <div className="grid gap-6">
              {classes.map((cls) => (
                <ClassRegistrationCard key={cls.id} classItem={cls} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
