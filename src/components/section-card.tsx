import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export function SectionCard({
  title,
  description,
  children,
  className,
  headerActions,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm",
        className
      )}
    >
      {(title || headerActions) && (
        <div className="flex flex-col gap-4 border-b border-white/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-5 sm:py-4">
          <div>
            {title && (
              <h2 className="text-xl font-semibold text-white sm:text-sm">{title}</h2>
            )}
            {description && (
              <p className="mt-1.5 text-base text-white/50 sm:mt-0.5 sm:text-xs sm:text-white/40">{description}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}
      <div className="p-6 sm:p-5">{children}</div>
    </div>
  );
}
