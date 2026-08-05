"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, KeyRound, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/providers/auth";
import { useI18n } from "@/providers/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { demoCredentials } from "@/lib/data/users";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { t } = useI18n();
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    const result = login(values.email, values.password, values.remember ?? false);
    if (!result.ok) {
      toast(t("auth.errors.invalidCredentials"), "error");
      return;
    }
    toast(t("auth.loggedIn"));
    router.push("/dashboard");
  };

  const fillDemo = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-500">{t("auth.errors.invalidEmail")}</p>}
        </div>

        <div>
          <Label htmlFor="password">{t("auth.password")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-11"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-500">{t("auth.errors.shortPassword")}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-primary"
              {...register("remember")}
            />
            {t("auth.rememberMe")}
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            {t("auth.forgotPassword")}
          </Link>
        </div>

        <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {t("auth.login")}
        </Button>
      </form>

      {/* Demo accounts */}
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/40 p-4">
        <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <KeyRound className="h-3.5 w-3.5" />
          Demo accounts — click to fill
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {demoCredentials.map((d) => (
            <button
              key={d.role}
              type="button"
              onClick={() => fillDemo(d.email, d.password)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
            >
              {d.role}: {d.email}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          {t("auth.registerLink")}
        </Link>
      </p>
    </div>
  );
}
