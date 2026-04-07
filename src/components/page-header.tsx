import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconGradient?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconGradient = "from-blue-500 to-purple-500",
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4", className)}>
      <div className="flex items-center gap-[18px] sm:gap-4">
        {Icon && (
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg sm:h-11 sm:w-11",
              iconGradient
            )}
          >
            <Icon className="h-6 w-6 text-white sm:h-5 sm:w-5" />
          </div>
        )}
        <div>
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-white sm:text-xl sm:leading-normal">{title}</h1>
          {description && (
            <p className="mt-2 text-[17px] leading-relaxed text-white/50 sm:mt-0.5 sm:text-sm sm:leading-normal sm:text-white/40">{description}</p>
          )}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">{children}</div>}
    </div>
  );
}
