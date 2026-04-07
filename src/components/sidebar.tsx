"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  CalendarDays,
  LayoutDashboard,
  Sparkles,
  Zap,
  Settings,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    gradient: "from-blue-500 to-purple-500",
  },
  {
    label: "Instagram",
    href: "/dashboard/instagram",
    icon: Camera,
    gradient: "from-pink-500 to-orange-400",
    badge: "3",
  },
  {
    label: "Content Calendar",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    gradient: "from-purple-500 to-blue-500",
    badge: "2",
  },
  {
    label: "AI Generator",
    href: "/dashboard/ai-assistant",
    icon: Sparkles,
    gradient: "from-purple-500 to-cyan-400",
  },
];

const bottomItems = [
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-80 max-w-[86vw] flex-col border-r border-white/[0.06] bg-[oklch(0.09_0.015_264)] shadow-2xl shadow-black/40 transition-transform duration-300 ease-out sm:w-64 lg:static lg:translate-x-0 lg:shadow-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo */}
      <div className="flex h-24 items-center gap-4 border-b border-white/[0.06] px-6 sm:h-16 sm:gap-3 sm:px-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 shadow-lg shadow-purple-500/30 sm:h-8 sm:w-8 sm:rounded-lg">
          <Zap className="h-5 w-5 text-white sm:h-4 sm:w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-semibold leading-none text-white sm:text-sm">AI Club</span>
          <span className="mt-1.5 text-sm leading-none text-white/45 sm:mt-0.5 sm:text-[10px] sm:text-white/40">Content Dashboard</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-6 sm:gap-1 sm:px-3 sm:py-4">
        <p className="mb-2 px-2 text-sm font-semibold uppercase tracking-widest text-white/40 sm:text-[10px] sm:text-white/25">
          Workspace
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex min-h-14 items-center gap-4 rounded-xl px-4 py-3.5 text-lg font-semibold transition-all duration-200 sm:min-h-0 sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm sm:font-medium",
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br transition-all duration-200 sm:h-7 sm:w-7",
                  item.gradient,
                  isActive ? "opacity-100 shadow-lg" : "opacity-50 group-hover:opacity-75"
                )}
              >
                <Icon className="h-[18px] w-[18px] text-white sm:h-3.5 sm:w-3.5" />
              </div>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge
                  className={cn(
                    "h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold leading-none sm:h-4 sm:min-w-4 sm:px-1 sm:text-[10px]",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/[0.07] text-white/50 group-hover:bg-white/[0.1] group-hover:text-white/70"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}

        <div className="mt-auto pt-4">
          <p className="mb-2 px-2 text-sm font-semibold uppercase tracking-widest text-white/40 sm:text-[10px] sm:text-white/25">
            System
          </p>
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex min-h-14 items-center gap-4 rounded-xl px-4 py-3.5 text-lg font-semibold transition-all duration-200 sm:min-h-0 sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm sm:font-medium",
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/60"
                )}
              >
                <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-white/[0.06] px-4 py-4 sm:px-3 sm:py-3">
        <div className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.04] sm:px-3 sm:py-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white sm:h-8 sm:w-8 sm:text-xs">
            AC
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-base font-medium text-white sm:text-xs">AI Club</span>
            <span className="truncate text-xs text-white/40 sm:text-[10px]">Admin</span>
          </div>
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
        </div>
      </div>
    </aside>
  );
}
