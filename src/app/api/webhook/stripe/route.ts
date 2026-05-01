import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Use service role for webhook inserts (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata ?? {};

        const payment = {
          stripe_session_id: session.id,
          stripe_payment_id: session.payment_intent as string | null,
          stripe_customer_id: session.customer as string | null,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          status: "completed" as const,
          category: meta.category || "general",
          designation: meta.designation || null,
          donor_name: meta.donor_name || session.customer_details?.name || null,
          donor_email: session.customer_details?.email || null,
          is_recurring: meta.is_recurring === "true",
          recurring_interval: meta.interval || null,
          stripe_subscription_id: session.subscription as string | null,
          linked_type: meta.linked_type || null,
          linked_id: meta.linked_id || null,
          metadata: meta,
        };

        await supabase.from("payments").insert(payment);

        // If this payment is linked to a class enrollment, mark it as paid
        if (meta.linked_type === "class_enrollment" && meta.linked_id) {
          await supabase
            .from("class_enrollments")
            .update({ payment_status: "paid" })
            .eq("id", meta.linked_id);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        // Update payment status to refunded
        if (charge.payment_intent) {
          await supabase
            .from("payments")
            .update({ status: "refunded" })
            .eq("stripe_payment_id", charge.payment_intent as string);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // Recurring subscription payment
        const invoice = event.data.object as Stripe.Invoice;
        const sub = (invoice as unknown as Record<string, unknown>).subscription as string | null;
        const paymentIntent = (invoice as unknown as Record<string, unknown>).payment_intent as string | null;
        const meta = invoice.metadata ?? {};

        // Avoid duplicating the initial checkout payment
        const { data: existing } = await supabase
          .from("payments")
          .select("id")
          .eq("stripe_subscription_id", sub)
          .limit(1);

        // Only insert renewal payments (not the first one which is captured by checkout.session.completed)
        if (existing && existing.length > 0 && invoice.billing_reason === "subscription_cycle") {
          await supabase.from("payments").insert({
            stripe_payment_id: paymentIntent,
            stripe_customer_id: invoice.customer as string,
            stripe_subscription_id: sub,
            amount: invoice.amount_paid ?? 0,
            currency: invoice.currency ?? "usd",
            status: "completed",
            category: meta.category || "general",
            designation: meta.designation || null,
            donor_name: meta.donor_name || null,
            donor_email: invoice.customer_email || null,
            is_recurring: true,
            recurring_interval: meta.interval || "month",
            metadata: meta,
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await supabase.from("payments").insert({
          stripe_payment_id: pi.id,
          stripe_customer_id: pi.customer as string | null,
          amount: pi.amount ?? 0,
          currency: pi.currency ?? "usd",
          status: "failed",
          category: (pi.metadata?.category) || "general",
          donor_email: pi.receipt_email || null,
          metadata: pi.metadata ?? {},
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
