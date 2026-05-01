"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { RegistrationField } from "@/types/database";

interface Props {
  eventPageId: string;
  fields: RegistrationField[];
  isFull: boolean;
}

const inputClass =
  "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

export function EventRegistrationForm({ eventPageId, fields, isFull }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach((f) => (init[f.key] = ""));
    return init;
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    for (const f of fields) {
      if (f.required && !formData[f.key]?.trim()) {
        setError(`${f.label} is required.`);
        return;
      }
    }

    setSubmitting(true);

    const supabase = createClient();
    const { error: insertErr } = await supabase
      .from("event_registrations")
      .insert({ event_page_id: eventPageId, data: formData });

    setSubmitting(false);

    if (insertErr) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  };

  if (isFull) {
    return (
      <Card className="bg-card border-border/60 sticky top-20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="size-8 text-gold mx-auto mb-3" />
          <h3 className="font-heading text-lg font-bold text-charcoal mb-1">
            Registration Full
          </h3>
          <p className="text-sm text-muted-foreground">
            This event has reached maximum capacity. Please contact the masjid for
            waitlist information.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="bg-card border-sage/30 sticky top-20">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="size-10 text-sage mx-auto mb-3" />
          <h3 className="font-heading text-lg font-bold text-charcoal mb-1">
            You&apos;re Registered!
          </h3>
          <p className="text-sm text-muted-foreground">
            Thank you for registering. We look forward to seeing you at the event.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border/60 sticky top-20">
      <CardContent className="p-6">
        <h3 className="font-heading text-lg font-bold text-charcoal mb-1">
          Register Now
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          Fill out the form below to secure your spot.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                {f.label}
                {f.required && <span className="text-destructive ml-0.5">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={formData[f.key]}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className={inputClass + " resize-y"}
                />
              ) : f.type === "select" && f.options ? (
                <select
                  value={formData[f.key]}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"}
                  value={formData[f.key]}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className={inputClass}
                />
              )}
            </div>
          ))}

          {error && (
            <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-sage hover:bg-sage-dark text-white font-semibold rounded-full h-11 shadow-sm"
          >
            {submitting ? "Submitting…" : "Register"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
