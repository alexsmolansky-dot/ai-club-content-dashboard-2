import { cn } from "@/lib/utils";
import { AiToolOfWeekTemplate } from "@/app/api/ai-template/generate/route";

interface AiToolTemplatePreviewProps {
  data: AiToolOfWeekTemplate;
  className?: string;
}

export function AiToolTemplatePreview({ data, className }: AiToolTemplatePreviewProps) {
  return (
    <div
      className={cn(
        "app-surface relative overflow-hidden rounded-2xl border",
        className
      )}
    >
      {/* Ambient glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
      </div>

      {/* Top gradient bar */}
      <div className="relative h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400" />

      <div className="relative flex flex-col gap-5 p-6">
        {/* Subtitle row */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            {data.subtitle}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Headline */}
        <div className="text-center">
          <h2
            className="text-2xl font-extrabold leading-tight tracking-tight text-white"
            dir="auto"
          >
            {data.headline}
          </h2>
        </div>

        {/* Tool name pill */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/15 px-5 py-2 text-sm font-bold text-purple-200 shadow-lg shadow-purple-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow shadow-purple-400/50" />
            {data.tool_name}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06]" />

        {/* Caption */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/30 mb-2">
            Caption
          </p>
          <p
            className="text-sm leading-relaxed text-white/70 whitespace-pre-line"
            dir="auto"
          >
            {data.caption}
          </p>
        </div>

        {/* Hashtags */}
        {data.hashtags.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/30 mb-2">
              Hashtags
            </p>
            <div className="flex flex-wrap gap-2">
              {data.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
