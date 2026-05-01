import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import type { FormField } from "@/types/database";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      form_name,
      form_slug,
      notification_emails,
      fields,
      data,
    } = body as {
      form_name: string;
      form_slug: string;
      notification_emails: string;
      fields: FormField[];
      data: Record<string, string>;
    };

    if (!notification_emails) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const recipients = notification_emails
      .split(",")
      .map((e: string) => e.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const submittedAt = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    // Build a nice table of field values
    const rows = fields
      .filter((f) => data[f.name] && data[f.name].trim() !== "")
      .map(
        (f) =>
          `<tr style="border-bottom: 1px solid #E8E6E1;">
            <td style="padding: 10px 12px; color: #888; font-size: 13px; width: 35%;">${f.label}</td>
            <td style="padding: 10px 12px; color: #2C2C2A; font-size: 13px; font-weight: 600;">${data[f.name]}</td>
          </tr>`
      )
      .join("");

    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF8; border-radius: 16px; overflow: hidden;">
      <div style="background: #6B8F71; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">New Submission: ${form_name}</h1>
      </div>
      <div style="padding: 24px;">
        <p style="color: #555; font-size: 14px; margin: 0 0 16px;">
          A new <strong>${form_name}</strong> submission was received on ${submittedAt}.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 20px;">
          ${rows}
        </table>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/admin/submissions"
             style="display: inline-block; background: #6B8F71; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 13px; font-weight: 700;">
            View in Admin Portal
          </a>
        </div>
      </div>
      <div style="background: #2C2C2A; padding: 16px 24px; text-align: center;">
        <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 0;">
          Masjid Bilal &bull; Automated Form Notification
        </p>
      </div>
    </div>`;

    await resend.emails.send({
      from: "Masjid Bilal <onboarding@resend.dev>",
      to: recipients,
      subject: `New ${form_name} Submission — Masjid Bilal`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Form notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
