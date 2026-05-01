import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IslamicPattern } from "@/components/islamic-pattern";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import type { EventPage } from "@/types/database";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventPageRoute({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("event_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!event) notFound();

  const ep = event as EventPage;

  // Count existing registrations
  const { count } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_page_id", ep.id);

  const regCount = count ?? 0;
  const isFull = ep.max_registrations ? regCount >= ep.max_registrations : false;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-sage overflow-hidden">
        <IslamicPattern />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <Badge className="bg-white/15 text-white border-0 text-xs font-medium mb-4">
            Event
          </Badge>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            {ep.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/80 text-sm">
            {ep.event_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {new Date(ep.event_date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
            {ep.event_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {ep.event_time}
              </span>
            )}
            {ep.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {ep.location}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Content + Form */}
      <section className="py-14 sm:py-20 bg-warm-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            {/* Description */}
            <div>
              <h2 className="font-heading text-xl font-bold text-charcoal mb-4">
                About This Event
              </h2>
              <div className="text-charcoal/80 text-sm leading-relaxed whitespace-pre-line">
                {ep.description}
              </div>

              {/* Info cards */}
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {ep.event_date && (
                  <div className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border/60">
                    <Calendar className="size-5 text-sage mt-0.5" />
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </p>
                      <p className="text-sm font-semibold text-charcoal">
                        {new Date(ep.event_date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" }
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {ep.event_time && (
                  <div className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border/60">
                    <Clock className="size-5 text-sage mt-0.5" />
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Time
                      </p>
                      <p className="text-sm font-semibold text-charcoal">
                        {ep.event_time}
                      </p>
                    </div>
                  </div>
                )}
                {ep.location && (
                  <div className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border/60">
                    <MapPin className="size-5 text-sage mt-0.5" />
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Location
                      </p>
                      <p className="text-sm font-semibold text-charcoal">
                        {ep.location}
                      </p>
                    </div>
                  </div>
                )}
                {ep.registration_enabled && (
                  <div className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border/60">
                    <Users className="size-5 text-sage mt-0.5" />
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Spots
                      </p>
                      <p className="text-sm font-semibold text-charcoal">
                        {ep.max_registrations
                          ? `${regCount} / ${ep.max_registrations} registered`
                          : `${regCount} registered`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Form */}
            {ep.registration_enabled && (
              <div>
                <EventRegistrationForm
                  eventPageId={ep.id}
                  fields={ep.registration_fields}
                  isFull={isFull}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
