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
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-white">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-white/40 mt-0.5">{description}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
