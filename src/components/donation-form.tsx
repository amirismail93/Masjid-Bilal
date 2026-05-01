"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Repeat, Loader2 } from "lucide-react";

const donationAmounts = [25, 50, 100, 250, 500, 1000];

interface Props {
  categories: string[];
}

export function DonationForm({ categories }: Props) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [designation, setDesignation] = useState(categories[0] || "General Fund");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  const handleCheckout = async () => {
    if (!amount || amount < 1) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          category: designation.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
          designation,
          donor_name: donorName,
          donor_email: donorEmail,
          is_recurring: isRecurring,
          interval,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border/60 shadow-sm mb-12">
      <CardContent className="p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold mx-auto mb-4">
            <Heart className="size-6" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal mb-2">
            Make a Donation
          </h2>
          <p className="text-muted-foreground">
            Choose an amount or enter a custom donation
          </p>
        </div>

        {/* Donation Type Toggle */}
        <div className="flex justify-center gap-3 mb-8">
          <Badge
            onClick={() => setIsRecurring(false)}
            className={`px-5 py-1.5 text-sm cursor-pointer border-0 transition-colors ${
              !isRecurring ? "bg-sage text-white" : "bg-warm-gray text-charcoal hover:bg-sage/10"
            }`}
          >
            One-time
          </Badge>
          <Badge
            onClick={() => setIsRecurring(true)}
            className={`px-5 py-1.5 text-sm cursor-pointer border-0 transition-colors ${
              isRecurring ? "bg-sage text-white" : "bg-warm-gray text-charcoal hover:bg-sage/10"
            }`}
          >
            <Repeat className="size-3 mr-1" />
            Monthly
          </Badge>
        </div>

        {/* Recurring Interval */}
        {isRecurring && (
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setInterval("month")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                interval === "month" ? "bg-sage/10 text-sage border border-sage/30" : "bg-warm-gray/50 text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("year")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                interval === "year" ? "bg-sage/10 text-sage border border-sage/30" : "bg-warm-gray/50 text-muted-foreground"
              }`}
            >
              Yearly
            </button>
          </div>
        )}

        {/* Amount Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {donationAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
              className={`rounded-xl border-2 py-3 px-4 text-center transition-colors ${
                selectedAmount === amt
                  ? "border-sage bg-sage/5"
                  : "border-border hover:border-sage"
              }`}
            >
              <span className={`font-heading text-lg font-bold ${
                selectedAmount === amt ? "text-sage" : "text-charcoal"
              }`}>
                ${amt}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            Custom Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              $
            </span>
            <input
              type="number"
              min="1"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              className="w-full rounded-xl border border-border bg-warm-white pl-8 pr-4 py-3 text-lg text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
              placeholder="Enter amount"
            />
          </div>
        </div>

        {/* Designation */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            Designate To
          </label>
          <select
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="w-full rounded-xl border border-border bg-warm-white px-4 py-3 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Donor Info (optional) */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Name <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Email <span className="text-muted-foreground text-xs">(for receipt)</span>
            </label>
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <Button
          onClick={handleCheckout}
          disabled={loading || !amount || amount < 1}
          className="w-full bg-gold hover:bg-gold-dark text-white font-semibold rounded-full h-12 text-base shadow-md disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="size-4 mr-2 animate-spin" />Processing…</>
          ) : (
            <><Heart className="size-4 mr-2" />Donate {amount > 0 ? `$${amount}` : "Now"}{isRecurring ? ` / ${interval}` : ""}</>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Masjid Bilal is a 501(c)(3) non-profit organization. All donations are tax-deductible.
        </p>
      </CardContent>
    </Card>
  );
}
