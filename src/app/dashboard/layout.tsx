import { Sidebar } from "@/components/sidebar";
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
        <div className="flex h-screen overflow-hidden bg-[oklch(0.08_0.01_264)]">
          <Sidebar />
          <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
        </div>
      </ToastProvider>
    </PostsProvider>
  );
}
