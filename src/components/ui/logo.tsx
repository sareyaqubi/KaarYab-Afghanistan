import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n";

export function Logo({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  const { t } = useI18n();
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md shadow-teal-500/25 transition-transform group-hover:scale-105",
          iconClassName
        )}
      >
        <BriefcaseBusiness className="h-5 w-5" />
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        {t("brand")}
        <span className="gradient-text">.af</span>
      </span>
    </Link>
  );
}
