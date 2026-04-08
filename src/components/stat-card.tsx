import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconGradient?: string;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconGradient = "from-blue-500 to-purple-500",
  description,
  className,
}: StatCardProps) {
  const TrendIcon =
    changeType === "positive"
      ? TrendingUp
      : changeType === "negative"
        ? TrendingDown
        : Minus;

  return (
    <div
      className={cn(
        "app-surface relative overflow-hidden rounded-[1.5rem] border p-8 backdrop-blur-sm transition-all duration-300 hover:bg-[var(--app-card-soft)] sm:rounded-2xl sm:p-5",
        className
      )}
    >
      {/* Subtle ambient glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl",
          iconGradient
        )}
      />

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5 sm:gap-1">
          <p className="text-[15px] font-semibold uppercase leading-[1.45] tracking-wider text-[var(--app-text-subtle)] sm:text-xs sm:font-medium sm:leading-normal">{title}</p>
          <p className="text-[3rem] font-bold leading-none tracking-tight text-[var(--app-text)] sm:text-2xl sm:leading-normal">{value}</p>
          {change && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-[15px] font-medium leading-[1.45] sm:gap-1 sm:text-xs sm:leading-normal",
                changeType === "positive"
                  ? "text-emerald-400"
                  : changeType === "negative"
                    ? "text-red-400"
                    : "text-[var(--app-text-subtle)]"
              )}
            >
              <TrendIcon className="h-4 w-4 sm:h-3 sm:w-3" />
              <span>{change}</span>
              {description && <span className="font-normal text-[var(--app-text-subtle)]">{description}</span>}
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg sm:h-10 sm:w-10",
            iconGradient
          )}
        >
          <Icon className="h-6 w-6 text-white sm:h-5 sm:w-5" />
        </div>
      </div>
    </div>
  );
}
