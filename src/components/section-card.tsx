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
        "rounded-[1.35rem] border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm sm:rounded-2xl",
        className
      )}
    >
      {(title || headerActions) && (
        <div className="flex flex-col gap-4 border-b border-white/[0.06] px-7 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-5 sm:py-4">
          <div>
            {title && (
              <h2 className="text-2xl font-semibold leading-[1.2] text-white sm:text-sm sm:leading-normal">{title}</h2>
            )}
            {description && (
              <p className="mt-2 text-[17px] leading-[1.5] text-white/50 sm:mt-0.5 sm:text-xs sm:leading-normal sm:text-white/40">{description}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}
      <div className="p-7 sm:p-5">{children}</div>
    </div>
  );
}
