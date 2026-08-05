"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useI18n } from "@/providers/i18n";
import { useAuth } from "@/providers/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function VerifyEmailForm() {
  const { t } = useI18n();
  const { verifyEmail } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (i: number, value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 1);
    const next = [...code];
    next[i] = digits;
    setCode(next);
    if (digits && i < 5) {
      document.getElementById(`vcode-${i + 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    setCode([...digits, ...Array(6 - digits.length).fill("")]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.join("").length < 6) return;
    setLoading(true);
    setTimeout(() => {
      verifyEmail();
      setLoading(false);
      setDone(true);
      toast(t("auth.verified"));
      setTimeout(() => router.push("/dashboard"), 1400);
    }, 900);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <h3 className="mt-3 font-bold">{t("auth.verified")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Redirecting you to your dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>
          For this demo, enter <strong>123456</strong> (or any 6 digits) to verify.
        </span>
      </div>

      <div className="flex justify-between gap-2">
        {code.map((digit, i) => (
          <input
            key={i}
            id={`vcode-${i}`}
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onPaste={handlePaste}
            aria-label={`Verification digit ${i + 1}`}
            className="h-14 w-12 rounded-xl border border-input bg-card text-center text-xl font-bold shadow-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        ))}
      </div>

      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading || code.join("").length < 6}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {t("auth.verify")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive a code?{" "}
        <button
          type="button"
          onClick={() => toast("A new code was sent (demo).", "info")}
          className="font-semibold text-primary hover:underline"
        >
          {t("auth.resend")}
        </button>
      </p>
    </form>
  );
}
