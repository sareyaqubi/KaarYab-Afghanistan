import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-secondary text-secondary-foreground border border-border",
        outline: "border border-border text-foreground bg-transparent",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25",
        danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25",
        info: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25",
        gradient: "gradient-brand text-white border-transparent",
        gold: "bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-400/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
