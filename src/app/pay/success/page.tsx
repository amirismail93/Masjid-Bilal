import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Complete — Masjid Bilal",
};

export default function PaySuccessPage() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center bg-warm-white py-16 px-4">
      <Card className="bg-card border-border/60 max-w-md w-full">
        <CardContent className="p-8 sm:p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/10 text-sage mx-auto mb-5">
            <CheckCircle className="size-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-charcoal mb-2">
            Payment Complete!
          </h1>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            JazakAllahu Khayran! Your payment has been received successfully.
            A confirmation receipt has been sent to your email.
          </p>
          <Link href="/">
            <Button className="bg-sage hover:bg-sage-dark text-white rounded-full px-6 h-10 text-sm">
              <ArrowLeft className="size-4 mr-2" />Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
