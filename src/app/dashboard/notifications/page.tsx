import { Bell } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <PageHeader
        title="Notifications"
        description="Activity and alerts"
        icon={Bell}
        iconGradient="from-blue-500 to-purple-500"
      />

      <SectionCard title="No notifications" description="You're all caught up">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <Bell className="h-7 w-7 text-white/20" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/50">No notifications yet</p>
            <p className="text-xs text-white/25 mt-1">
              Alerts for scheduled posts and activity will appear here.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
