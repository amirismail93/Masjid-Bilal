import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,        // in dollars (e.g. 50)
      category,      // e.g. "general", "education", "zakat"
      designation,   // e.g. "General Fund"
      donor_name,
      donor_email,
      is_recurring,  // boolean
      interval,      // "month" | "year"
      linked_type,   // e.g. "form_submission", "class_enrollment", "nikah_request"
      linked_id,     // the record id
    } = body;

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const amountCents = Math.round(amount * 100);

    if (is_recurring) {
      // Create a recurring price on the fly
      const price = await stripe.prices.create({
        unit_amount: amountCents,
        currency: "usd",
        recurring: { interval: interval === "year" ? "year" : "month" },
        product_data: {
          name: `${designation || "Donation"} — Masjid Bilal`,
        },
      });

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: price.id, quantity: 1 }],
        customer_email: donor_email || undefined,
        success_url: linked_type
          ? `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`
          : `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: linked_type
          ? `${origin}/pay/${linked_type.split("_")[0]}_${linked_id}`
          : `${origin}/donate`,
        metadata: {
          category: category || "general",
          designation: designation || "",
          donor_name: donor_name || "",
          is_recurring: "true",
          interval: interval || "month",
          ...(linked_type && { linked_type }),
          ...(linked_id && { linked_id }),
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // One-time payment
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `${designation || "Donation"} — Masjid Bilal`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: donor_email || undefined,
      success_url: linked_type
        ? `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`
        : `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: linked_type
        ? `${origin}/pay/${linked_type.split("_")[0]}_${linked_id}`
        : `${origin}/donate`,
      metadata: {
        category: category || "general",
        designation: designation || "",
        donor_name: donor_name || "",
        is_recurring: "false",
        ...(linked_type && { linked_type }),
        ...(linked_id && { linked_id }),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
