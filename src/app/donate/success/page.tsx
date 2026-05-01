import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You — Masjid Bilal",
};

export default function DonateSuccessPage() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center bg-warm-white py-16 px-4">
      <Card className="bg-card border-border/60 max-w-md w-full">
        <CardContent className="p-8 sm:p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/10 text-sage mx-auto mb-5">
            <CheckCircle className="size-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-charcoal mb-2">
            JazakAllahu Khayran!
          </h1>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Your donation has been received. May Allah reward you abundantly for
            your generosity. A confirmation has been sent to your email.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/donate">
              <Button variant="outline" className="rounded-full px-6 h-10 text-sm w-full">
                <Heart className="size-4 mr-2" />Donate Again
              </Button>
            </Link>
            <Link href="/">
              <Button className="bg-sage hover:bg-sage-dark text-white rounded-full px-6 h-10 text-sm w-full">
                <ArrowLeft className="size-4 mr-2" />Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
