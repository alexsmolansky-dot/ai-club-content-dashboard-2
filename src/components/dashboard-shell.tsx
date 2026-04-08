"use client";

import { useEffect, useState } from "react";
import { Menu, Zap } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-[var(--app-overlay)] backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        mobileOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-30 flex h-[92px] shrink-0 items-center justify-between border-b border-[var(--app-border-soft)] bg-[color-mix(in_oklch,var(--app-bg)_95%,transparent)] px-7 backdrop-blur-md lg:hidden">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--app-border-soft)] bg-[var(--app-card)] text-[var(--app-text)] transition-colors hover:bg-[var(--app-card-soft)] active:bg-[var(--app-card-soft)]"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 shadow-lg shadow-purple-500/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-[1.2] text-[var(--app-text)]">AI Club</span>
              <span className="mt-1 text-sm leading-[1.3] text-[var(--app-text-subtle)]">
                Content Dashboard
              </span>
            </div>
          </div>

          <div className="h-14 w-14" aria-hidden="true" />
        </header>

        {children}
      </main>
    </div>
  );
}
