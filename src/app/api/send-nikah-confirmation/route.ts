import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();
    const {
      bride_name,
      groom_name,
      bride_wali_name,
      bride_wali_phone,
      groom_phone,
      requested_date,
      requested_time,
      location_preference,
      additional_notes,
      user_email,
    } = body;

    // Fetch payment link from site_settings
    const supabase = await createClient();
    const { data: setting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "nikah_payment_link")
      .single();
    const paymentLink = setting?.value || "#";

    const adminEmail = process.env.ADMIN_EMAIL || "admin@masjidbilal.org";
    const submittedAt = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    // ── User confirmation email ──────────────────────────────────
    const userHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF8; border-radius: 16px; overflow: hidden;">
      <div style="background: #6B8F71; padding: 32px 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">Masjid Bilal</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Nikah Request Confirmation</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #2C2C2A; font-size: 15px; margin: 0 0 16px;">
          <strong>Assalamu Alaikum,</strong>
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
          JazakAllahu Khayran for submitting your Nikah request. Here is a summary of the details you provided:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 10px 12px; color: #888; font-size: 13px; width: 40%;">Bride&rsquo;s Name</td>
            <td style="padding: 10px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${bride_name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 10px 12px; color: #888; font-size: 13px;">Groom&rsquo;s Name</td>
            <td style="padding: 10px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${groom_name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 10px 12px; color: #888; font-size: 13px;">Bride&rsquo;s Wali</td>
            <td style="padding: 10px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${bride_wali_name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 10px 12px; color: #888; font-size: 13px;">Wali Phone</td>
            <td style="padding: 10px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${bride_wali_phone}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 10px 12px; color: #888; font-size: 13px;">Groom&rsquo;s Phone</td>
            <td style="padding: 10px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${groom_phone}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 10px 12px; color: #888; font-size: 13px;">Preferred Date</td>
            <td style="padding: 10px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${requested_date}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 10px 12px; color: #888; font-size: 13px;">Preferred Time</td>
            <td style="padding: 10px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${requested_time}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 10px 12px; color: #888; font-size: 13px;">Location</td>
            <td style="padding: 10px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${location_preference}</td>
          </tr>
          ${additional_notes ? `<tr><td style="padding: 10px 12px; color: #888; font-size: 13px;">Notes</td><td style="padding: 10px 12px; color: #2C2C2A; font-size: 13px;">${additional_notes}</td></tr>` : ""}
        </table>

        <div style="background: #F0EDE8; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <h3 style="color: #2C2C2A; font-size: 14px; margin: 0 0 8px;">Next Steps</h3>
          <ol style="color: #555; font-size: 13px; line-height: 1.7; margin: 0; padding-left: 20px;">
            <li>Complete the Nikah fee payment using the button below.</li>
            <li>A member of the Masjid Bilal team will contact you within 2-3 business days to confirm details.</li>
            <li>A pre-marital counseling session is required before the ceremony.</li>
            <li>Please bring valid identification and marriage license to the ceremony.</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${paymentLink}" style="display: inline-block; background: #C4A44A; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; font-weight: 700;">
            Complete Your Payment
          </a>
        </div>
      </div>
      <div style="background: #2C2C2A; padding: 20px 24px; text-align: center;">
        <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">
          Masjid Bilal &bull; Houston, TX &bull; (713) 555-1234 &bull; info@masjidbilal.org
        </p>
      </div>
    </div>`;

    // ── Admin notification email ─────────────────────────────────
    const adminHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF8; border-radius: 16px; overflow: hidden;">
      <div style="background: #6B8F71; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">New Nikah Request</h1>
      </div>
      <div style="padding: 24px;">
        <p style="color: #555; font-size: 14px; margin: 0 0 16px;">A new Nikah request has been submitted.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 20px;">
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 8px 12px; color: #888; font-size: 13px; width: 40%;">Bride</td>
            <td style="padding: 8px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${bride_name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 8px 12px; color: #888; font-size: 13px;">Groom</td>
            <td style="padding: 8px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${groom_name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 8px 12px; color: #888; font-size: 13px;">Bride&rsquo;s Wali</td>
            <td style="padding: 8px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${bride_wali_name} (${bride_wali_phone})</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 8px 12px; color: #888; font-size: 13px;">Groom Phone</td>
            <td style="padding: 8px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${groom_phone}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 8px 12px; color: #888; font-size: 13px;">Email</td>
            <td style="padding: 8px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${user_email}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 8px 12px; color: #888; font-size: 13px;">Date / Time</td>
            <td style="padding: 8px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${requested_date} at ${requested_time}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 8px 12px; color: #888; font-size: 13px;">Location</td>
            <td style="padding: 8px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${location_preference}</td>
          </tr>
          ${additional_notes ? `<tr style="border-bottom: 1px solid #E8E6E1;"><td style="padding: 8px 12px; color: #888; font-size: 13px;">Notes</td><td style="padding: 8px 12px; color: #2C2C2A; font-size: 13px;">${additional_notes}</td></tr>` : ""}
          <tr>
            <td style="padding: 8px 12px; color: #888; font-size: 13px;">Submitted</td>
            <td style="padding: 8px 12px; color: #2C2C2A; font-size: 13px;">${submittedAt}</td>
          </tr>
        </table>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? req.nextUrl.origin : ""}/admin/nikah-requests" style="display: inline-block; background: #6B8F71; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 13px; font-weight: 700;">
            View in Admin Portal
          </a>
        </div>
      </div>
    </div>`;

    // Send both emails
    await Promise.all([
      resend.emails.send({
        from: "Masjid Bilal <onboarding@resend.dev>",
        to: user_email,
        subject: "Nikah Request Received — Masjid Bilal",
        html: userHtml,
      }),
      resend.emails.send({
        from: "Masjid Bilal <onboarding@resend.dev>",
        to: adminEmail,
        subject: `New Nikah Request — ${bride_name} & ${groom_name}`,
        html: adminHtml,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Nikah email error:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation emails" },
      { status: 500 }
    );
  }
}
