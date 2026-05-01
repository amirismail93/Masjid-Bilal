"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Lock, Mail } from "lucide-react";

export default function AccountPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (newPw.length < 8) {
      setToast({ type: "error", msg: "New password must be at least 8 characters." });
      return;
    }
    if (newPw !== confirmPw) {
      setToast({ type: "error", msg: "New password and confirmation do not match." });
      return;
    }

    setSaving(true);

    // Verify current password by re-signing in
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password: currentPw,
    });
    if (signInErr) {
      setToast({ type: "error", msg: "Current password is incorrect." });
      setSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);

    if (error) {
      setToast({ type: "error", msg: error.message });
    } else {
      setToast({ type: "success", msg: "Password updated successfully." });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal mb-1">
        My Account
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Manage your login credentials
      </p>

      {/* Toast */}
      {toast && (
        <div
          className={`mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
            toast.type === "success"
              ? "bg-sage/10 text-sage"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="max-w-md space-y-6">
        {/* Email (read-only) */}
        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <label className="block text-xs font-medium text-charcoal mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                readOnly
                value={email}
                className={inputClass + " pl-10 opacity-60 cursor-not-allowed"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Password change */}
        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <h2 className="font-heading text-base font-bold text-charcoal mb-4">
              Change Password
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className={inputClass + " pl-10"}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={inputClass + " pl-10"}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className={inputClass + " pl-10"}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-10 shadow-sm"
              >
                {saving ? "Updating…" : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
