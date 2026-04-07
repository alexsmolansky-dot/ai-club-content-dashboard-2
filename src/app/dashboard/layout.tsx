import { DashboardShell } from "@/components/dashboard-shell";
import { PostsProvider } from "@/lib/posts-context";
import { ToastProvider } from "@/components/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PostsProvider>
      <ToastProvider>
        <DashboardShell>{children}</DashboardShell>
      </ToastProvider>
    </PostsProvider>
  );
}
