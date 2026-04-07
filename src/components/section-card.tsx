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
        "rounded-[1.5rem] border border-white/[0.035] bg-white/[0.025] backdrop-blur-sm sm:rounded-2xl sm:border-white/[0.06] sm:bg-white/[0.03]",
        className
      )}
    >
      {(title || headerActions) && (
        <div className="flex flex-col gap-4 border-b border-white/[0.04] px-8 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:border-white/[0.06] sm:px-5 sm:py-4">
          <div>
            {title && (
              <h2 className="text-[1.7rem] font-semibold leading-[1.15] text-white sm:text-sm sm:leading-normal">{title}</h2>
            )}
            {description && (
              <p className="mt-2.5 text-base leading-[1.5] text-white/42 sm:mt-0.5 sm:text-xs sm:leading-normal sm:text-white/40">{description}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}
      <div className="p-8 sm:p-5">{children}</div>
    </div>
  );
}
