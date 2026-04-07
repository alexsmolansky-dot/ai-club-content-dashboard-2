"use client";

import { useState } from "react";
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  PenLine,
  ImageIcon,
  Layers,
  Video,
  AlignLeft,
  BookOpen,
} from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { CreatePostModal } from "@/components/create-post-modal";
import { usePosts } from "@/lib/posts-context";
import { Post } from "@/lib/data/posts";

// ─── Config ───────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FORMAT_CHIP: Record<string, string> = {
  image:    "bg-purple-500/20 text-purple-400 border-purple-500/20",
  carousel: "bg-cyan-500/20   text-cyan-400   border-cyan-500/20",
  video:    "bg-pink-500/20   text-pink-400   border-pink-500/20",
  reel:     "bg-pink-500/20   text-pink-400   border-pink-500/20",
  story:    "bg-blue-500/20   text-blue-400   border-blue-500/20",
  text:     "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  article:  "bg-amber-500/20  text-amber-400  border-amber-500/20",
};

const FORMAT_ICONS: Record<string, React.ElementType> = {
  image: ImageIcon, carousel: Layers, video: Video,
  reel: Video, story: ImageIcon, text: AlignLeft, article: BookOpen,
};

const STATUS_UPCOMING = {
  scheduled: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  draft:     { icon: PenLine,      color: "text-yellow-400",  bg: "bg-yellow-500/10"  },
  review:    { icon: Clock,        color: "text-blue-400",    bg: "bg-blue-500/10"    },
  published: { icon: CheckCircle2, color: "text-white/30",    bg: "bg-white/[0.05]"   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUpcomingDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.round((d.setHours(0,0,0,0) - now.setHours(0,0,0,0)) / 86400000);
  const time = new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Tomorrow, ${time}`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { posts, loading } = usePosts();
  const [modalOpen, setModalOpen] = useState(false);

  // ── Date maths ──────────────────────────────────────────────────────────────
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();         // 0-indexed
  const today = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset: Sun=0 → 6, Mon=0, Tue=1 …
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // ── Group posts in this month by day ────────────────────────────────────────
  const postsByDay = new Map<number, Post[]>();
  posts.forEach((post) => {
    if (!post.scheduledFor) return;
    const d = new Date(post.scheduledFor);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      postsByDay.set(day, [...(postsByDay.get(day) ?? []), post]);
    }
  });

  // ── Upcoming: next 5 posts with a future scheduledFor ───────────────────────
  const upcoming = posts
    .filter((p) => p.scheduledFor && new Date(p.scheduledFor) > new Date())
    .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime())
    .slice(0, 5);

  // ── Summary counts ──────────────────────────────────────────────────────────
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const draftCount     = posts.filter((p) => p.status === "draft").length;

  // ── Gap detection: next 14 days, first day with no content ─────────────────
  let gapLabel: string | null = null;
  for (let d = today + 1; d <= Math.min(today + 14, daysInMonth); d++) {
    if (!postsByDay.has(d)) {
      gapLabel = new Date(year, month, d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      break;
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="animate-pulse text-base text-white/30 sm:text-sm">Loading calendar…</p>
      </div>
    );
  }

  return (
    <>
      <CreatePostModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex flex-col gap-16 p-9 sm:gap-8 sm:p-6">
        <PageHeader
          title="Content Calendar"
          description="Plan and visualize your entire content strategy"
          icon={CalendarDays}
          iconGradient="from-purple-500 to-blue-500"
        >
          <button
            onClick={() => setModalOpen(true)}
            className="flex min-h-[62px] items-center gap-2.5 rounded-[1.35rem] bg-gradient-to-r from-purple-400 to-blue-500 px-8 py-3 text-lg font-semibold text-white shadow-xl shadow-purple-500/35 transition-all hover:opacity-95 sm:min-h-0 sm:gap-1.5 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs sm:font-medium sm:shadow-lg sm:shadow-purple-500/20"
          >
            <Plus className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
            Add Content
          </button>
        </PageHeader>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-3 sm:gap-2">
          <Badge className="h-10 rounded-full border px-[18px] py-2 text-base leading-[1.4] bg-emerald-500/[0.07] text-emerald-300/85 border-emerald-500/15 sm:h-5 sm:border-emerald-500/20 sm:bg-emerald-500/10 sm:px-3 sm:py-1 sm:text-xs sm:leading-normal sm:text-emerald-400">
            {scheduledCount} scheduled
          </Badge>
          <Badge className="h-10 rounded-full border px-[18px] py-2 text-base leading-[1.4] bg-yellow-500/[0.07] text-yellow-300/85 border-yellow-500/15 sm:h-5 sm:border-yellow-500/20 sm:bg-yellow-500/10 sm:px-3 sm:py-1 sm:text-xs sm:leading-normal sm:text-yellow-400">
            {draftCount} {draftCount === 1 ? "draft" : "drafts"}
          </Badge>
          {gapLabel && (
            <Badge className="h-10 rounded-full border px-[18px] py-2 text-base leading-[1.4] bg-red-500/[0.07] text-red-300/85 border-red-500/15 sm:h-5 sm:border-red-500/20 sm:bg-red-500/10 sm:px-3 sm:py-1 sm:text-xs sm:leading-normal sm:text-red-400">
              Gap: {gapLabel}
            </Badge>
          )}
          {!gapLabel && (
            <Badge className="h-10 rounded-full border px-[18px] py-2 text-base leading-[1.4] bg-white/[0.035] text-white/38 border-white/[0.04] sm:h-5 sm:border-white/[0.08] sm:bg-white/[0.05] sm:px-3 sm:py-1 sm:text-xs sm:leading-normal sm:text-white/40">
              No gaps in next 14 days
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-14 sm:gap-6 lg:grid-cols-3">
          {/* Calendar grid */}
          <div className="lg:col-span-2">
            <SectionCard title={monthLabel} description="Content overview">
              {/* Weekday headers */}
              <div className="mb-4 grid grid-cols-7 gap-2 sm:mb-2 sm:gap-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-2 text-center text-sm font-semibold uppercase leading-[1.4] text-white/32 sm:py-1 sm:text-[10px] sm:leading-normal sm:text-white/25">
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid cells */}
              <div className="grid grid-cols-7 gap-2 sm:gap-1">
                {/* Leading empty cells */}
                {Array.from({ length: startOffset }, (_, i) => (
                  <div key={`empty-${i}`} className="h-28 rounded-2xl p-2.5 sm:h-20 sm:rounded-lg sm:p-1.5" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dayPosts = postsByDay.get(day) ?? [];
                  const isToday = day === today;
                  const first = dayPosts[0];
                  const FormatIcon = first ? (FORMAT_ICONS[first.format] ?? ImageIcon) : null;

                  return (
                    <div
                      key={day}
                      onClick={() => setModalOpen(true)}
                      className={`h-32 rounded-2xl border p-3 transition-all duration-200 cursor-pointer sm:h-20 sm:rounded-xl sm:p-1.5 ${
                        isToday
                          ? "border-purple-500/30 bg-purple-500/[0.075]"
                          : dayPosts.length > 0
                          ? "border-white/[0.03] bg-white/[0.018] hover:border-white/[0.075] sm:border-white/[0.06] sm:bg-white/[0.02] sm:hover:border-white/[0.1]"
                          : "border-transparent hover:bg-white/[0.018] hover:border-white/[0.03] sm:hover:bg-white/[0.02] sm:hover:border-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-lg font-semibold leading-[1.3] sm:text-[11px] sm:leading-normal ${isToday ? "text-purple-300" : "text-white/48 sm:text-white/40"}`}>
                          {day}
                        </span>
                        {dayPosts.length > 1 && (
                          <span className="text-sm leading-[1.4] text-white/34 sm:text-[9px] sm:leading-normal sm:text-white/30">+{dayPosts.length - 1}</span>
                        )}
                      </div>
                      {first && FormatIcon && (
                        <div className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-sm font-medium leading-[1.35] sm:gap-0.5 sm:rounded sm:px-1 sm:py-0.5 sm:text-[9px] sm:leading-normal ${FORMAT_CHIP[first.format] ?? FORMAT_CHIP.image} truncate`}>
                          <FormatIcon className="h-3.5 w-3.5 shrink-0 sm:h-2.5 sm:w-2.5" />
                          <span className="truncate">{first.title || first.caption.slice(0, 16)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          {/* Upcoming content list */}
          <SectionCard title="Upcoming" description="Next scheduled posts">
            <div className="flex flex-col gap-5 sm:gap-3">
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center gap-5 py-12 text-center sm:gap-3 sm:py-8">
                  <CalendarDays className="h-10 w-10 text-white/10 sm:h-8 sm:w-8" />
                  <p className="text-xl leading-[1.35] text-white/45 sm:text-sm sm:leading-normal sm:text-white/30">No upcoming posts</p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="min-h-12 rounded-xl px-5 text-base font-semibold text-purple-400/85 transition-colors hover:text-purple-400 sm:min-h-0 sm:rounded-lg sm:px-0 sm:text-xs sm:font-normal sm:text-purple-400/70"
                  >
                    + Schedule a post
                  </button>
                </div>
              ) : (
                upcoming.map((post) => {
                  const cfg = STATUS_UPCOMING[post.status] ?? STATUS_UPCOMING.draft;
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={post.id}
                      className="flex items-start gap-5 rounded-[1.5rem] border border-white/[0.03] bg-white/[0.018] p-6 sm:gap-3 sm:rounded-xl sm:border-white/[0.06] sm:bg-white/[0.02] sm:p-3"
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-6 sm:w-6 ${cfg.bg}`}>
                        <StatusIcon className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-lg font-semibold leading-[1.3] text-white/90 sm:text-xs sm:font-medium sm:leading-normal sm:text-white/80">
                          {post.title || post.caption.slice(0, 40)}
                        </p>
                        <div className="mt-2 flex items-center gap-2.5 sm:mt-1 sm:gap-2">
                          <span className="text-sm leading-[1.45] text-white/34 sm:text-[10px] sm:leading-normal sm:text-white/30">
                            {formatUpcomingDate(post.scheduledFor!)}
                          </span>
                          <Badge className="h-8 rounded-full bg-white/[0.045] px-3 text-sm leading-[1.4] text-white/42 sm:h-3.5 sm:bg-white/[0.07] sm:px-1.5 sm:text-[9px] sm:leading-normal sm:text-white/40">
                            {post.format}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {gapLabel && (
              <div className="mt-7 flex items-start gap-3 rounded-[1.5rem] border border-red-500/15 bg-red-500/[0.055] p-6 sm:mt-4 sm:gap-2 sm:rounded-xl sm:border-red-500/20 sm:bg-red-500/[0.07] sm:p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400 sm:h-3.5 sm:w-3.5" />
                <p className="text-base leading-[1.55] text-red-400/85 sm:text-[11px] sm:leading-normal sm:text-red-400/80">
                  <strong>{gapLabel}</strong> has no content scheduled. Consider adding a post to maintain consistency.
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
