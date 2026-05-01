"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-warm-gray">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal mb-3">
          Stay Connected
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Subscribe to our newsletter for prayer time updates, event announcements,
          and community news delivered to your inbox.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-sage font-medium">
            <CheckCircle className="size-5" />
            <span>Thank you for subscribing!</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 rounded-full border border-border bg-card px-5 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
            />
            <Button
              type="submit"
              className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-10 shadow-sm"
            >
              <Send className="size-4 mr-2" />
              Subscribe
            </Button>
          </form>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
