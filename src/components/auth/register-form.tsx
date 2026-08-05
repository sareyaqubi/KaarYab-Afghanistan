"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BriefcaseBusiness, Eye, EyeOff, Loader2, ShieldCheck, UserRound, UserRoundPlus } from "lucide-react";
import { useAuth } from "@/providers/auth";
import { useI18n } from "@/providers/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    role: z.enum(["applicant", "employer", "admin"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const roles: { value: FormValues["role"]; icon: React.ReactNode; title: string; desc: string }[] = [
  {
    value: "applicant",
    icon: <UserRound className="h-5 w-5" />,
    title: "Job Seeker",
    desc: "Find jobs, internships and scholarships",
  },
  {
    value: "employer",
    icon: <BriefcaseBusiness className="h-5 w-5" />,
    title: "Employer",
    desc: "Post opportunities and hire talent",
  },
  {
    value: "admin",
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Administrator",
    desc: "Platform management",
  },
];

export function RegisterForm() {
  const { t } = useI18n();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "applicant" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: FormValues) => {
    const result = registerUser(values.name, values.email, values.password, values.role);
    if (!result.ok) {
      toast(t("auth.errors.emailExists"), "error");
      return;
    }
    toast(t("auth.registered"));
    router.push("/verify-email");
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label>{t("auth.role")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setValue("role", r.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all",
                  selectedRole === r.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                )}
                aria-pressed={selectedRole === r.value}
              >
                {r.icon}
                <span className="text-xs font-bold">{r.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="name">{t("auth.name")}</Label>
          <Input id="name" placeholder="Ahmad Karimi" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="mt-1 text-xs text-rose-500">{t("auth.errors.required")}</p>}
        </div>

        <div>
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
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
              placeholder="At least 8 characters"
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

        <div>
          <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat your password"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-500">{t("auth.errors.passwordMismatch")}</p>
          )}
        </div>

        <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundPlus className="h-4 w-4" />}
          {t("auth.register")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t("auth.loginLink")}
        </Link>
      </p>
    </div>
  );
}
