"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { useI18n } from "@/providers/i18n";
import { useAuth } from "@/providers/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const { users } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!exists) {
      toast("No account found with this email", "error");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <h3 className="mt-3 font-bold">{t("auth.resetSent")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent instructions to <span className="font-semibold text-foreground">{email}</span>.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          (Demo: no real email is sent. Reset your password by logging into your account.)
        </p>
        <Button className="mt-5 w-full" variant="outline" onClick={() => router.push("/login")}>
          {t("auth.login")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" variant="gradient" size="lg" className="w-full">
        <Send className="h-4 w-4" />
        {t("auth.sendReset")}
      </Button>
      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("auth.login")}
      </Link>
    </form>
  );
}
