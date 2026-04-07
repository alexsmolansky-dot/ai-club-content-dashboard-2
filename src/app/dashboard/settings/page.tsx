import { Settings } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <PageHeader
        title="Settings"
        description="Account and workspace preferences"
        icon={Settings}
        iconGradient="from-slate-500 to-slate-400"
      />

      <SectionCard title="Coming Soon" description="Settings are not yet implemented">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <Settings className="h-7 w-7 text-white/20" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/50">Settings coming soon</p>
            <p className="text-xs text-white/25 mt-1">
              Configure your workspace, team members, and integrations.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
