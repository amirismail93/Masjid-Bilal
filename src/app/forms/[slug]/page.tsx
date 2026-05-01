import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/hero-section";
import { DynamicForm } from "@/components/dynamic-form";
import type { FormTemplate } from "@/types/database";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("form_templates")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!data) return { title: "Form Not Found — Masjid Bilal" };

  return {
    title: `${data.name} — Masjid Bilal`,
    description: data.description || undefined,
  };
}

export default async function FormPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("form_templates")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!data) notFound();

  const template = { ...data, fields: data.fields ?? [] } as FormTemplate;

  return (
    <>
      <HeroSection
        title={template.name}
        subtitle={template.description || undefined}
      />

      <div className="py-16 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <DynamicForm template={template} />
        </div>
      </div>
    </>
  );
}
