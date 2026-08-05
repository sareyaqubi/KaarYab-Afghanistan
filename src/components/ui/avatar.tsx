import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-24 w-24 text-3xl",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={96}
        height={96}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-border",
          sizes[size],
          className
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 font-bold text-primary-foreground ring-2 ring-border",
        sizes[size],
        className
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
