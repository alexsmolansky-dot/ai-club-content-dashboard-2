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
        "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.05]",
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
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          {change && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                changeType === "positive"
                  ? "text-emerald-400"
                  : changeType === "negative"
                    ? "text-red-400"
                    : "text-white/40"
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{change}</span>
              {description && <span className="text-white/30 font-normal">{description}</span>}
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
            iconGradient
          )}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
