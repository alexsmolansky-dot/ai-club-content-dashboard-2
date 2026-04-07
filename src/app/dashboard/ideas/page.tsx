import { Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";

export default function IdeasPage() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <PageHeader
        title="Idea Bank"
        description="Browse and vote on content ideas"
        icon={Lightbulb}
        iconGradient="from-amber-500 to-orange-400"
      />

      <SectionCard title="Coming Soon" description="Idea Bank is not yet implemented">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <Lightbulb className="h-7 w-7 text-amber-400/60" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/50">Idea Bank coming soon</p>
            <p className="text-xs text-white/25 mt-1">
              Submit and vote on content ideas for the AI Club.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
