import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };

export function RatingStars({ value, count, size = "sm", className }: RatingStarsProps) {
  const normalized = Math.max(0, Math.min(5, value));
  const full = Math.floor(normalized);
  const hasHalf = normalized - full >= 0.25 && normalized - full < 0.75;
  const rounded = normalized - full >= 0.75 ? full + 1 : full;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5 text-amber-400" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const isFull = i < (hasHalf ? full : rounded);
          const isHalf = hasHalf && i === full;
          return (
            <span key={i} className="relative inline-flex">
              <Star className={cn(sizes[size], "text-muted-foreground/30")} />
              {isFull && <Star className={cn(sizes[size], "absolute inset-0 fill-current text-amber-400")} />}
              {isHalf && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                  <Star className={cn(sizes[size], "fill-current text-amber-400")} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {typeof count === "number" && (
        <span className="text-xs font-medium text-muted-foreground">
          {value.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}
