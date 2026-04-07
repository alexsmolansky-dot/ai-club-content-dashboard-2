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
    <div className={cn("flex items-start justify-between", className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
              iconGradient
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-white/40 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
