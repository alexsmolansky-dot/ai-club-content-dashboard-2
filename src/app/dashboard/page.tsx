"use client";

import { useState } from "react";
import {
  FileText,
  CalendarDays,
  Lightbulb,
  Sparkles,
  Users,
  Eye,
  Heart,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  PenLine,
  TrendingUp,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/create-post-modal";
import Link from "next/link";
import { usePosts } from "@/lib/posts-context";
import { ideas } from "../../lib/data/ideas";

const quickLinks = [
  {
    title: "Content Planner",
    description: "Manage posts across all platforms",
    href: "/dashboard/planner",
    gradient: "from-pink-500 to-rose-500",
    icon: FileText,
    badge: "3 in review",
  },
  {
    title: "Calendar",
    description: "Visualize your monthly schedule",
    href: "/dashboard/calendar",
    gradient: "from-purple-500 to-blue-500",
    icon: CalendarDays,
  },
  {
    title: "Idea Bank",
    description: "Browse and vote on content ideas",
    href: "/dashboard/ideas",
    gradient: "from-amber-500 to-orange-400",
    icon: Lightbulb,
    badge: "9 ideas",
  },
  {
    title: "AI Assistant",
    description: "Generate captions and content ideas",
    href: "/dashboard/ai-assistant",
    gradient: "from-violet-500 to-purple-400",
    icon: Sparkles,
    badge: "New",
  },
];

const statusColors: Record<string, string> = {
  scheduled: "bg-emerald-500/15 text-emerald-400",
  draft: "bg-yellow-500/15 text-yellow-400",
  review: "bg-blue-500/15 text-blue-400",
  published: "bg-white/[0.06] text-white/40",
};

const platformColors: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-300",
  linkedin: "bg-blue-500/20 text-blue-300",
  tiktok: "bg-slate-500/20 text-slate-300",
};

export default function DashboardPage() {
  const { posts, loading } = usePosts();
  const [modalOpen, setModalOpen] = useState(false);

  const scheduledPosts = posts.filter((p) => p.status === "scheduled");
  const draftPosts = posts.filter((p) => p.status === "draft");
  const reviewPosts = posts.filter((p) => p.status === "review");
  const publishedPosts = posts.filter((p) => p.status === "published");
  const pendingIdeas = ideas.filter((i) => i.status === "new");

  const upcomingPosts = posts
    .filter((p) => p.scheduledFor)
    .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-white/30 animate-pulse">Loading posts…</p>
      </div>
    );
  }
  return (
    <>
      <CreatePostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <div className="flex flex-col gap-9 p-6 sm:gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60 animate-pulse" />
              <span className="text-sm font-medium text-white/45 sm:text-xs sm:text-white/40">Live Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-2xl">
              Good morning,{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI Club
              </span>
            </h1>
            <p className="mt-2 text-base leading-relaxed text-white/45 sm:mt-1 sm:text-sm sm:leading-normal sm:text-white/40">
              You have {reviewPosts.length} posts in review and {pendingIdeas.length} new ideas waiting.
            </p>
          </div>

          {/* ── New Post button ── */}
          <Button
            onClick={() => setModalOpen(true)}
            className="min-h-11 bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:opacity-90 transition-all sm:min-h-0"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Followers"
            value="12.4K"
            change="+8.2%"
            changeType="positive"
            description="vs last month"
            icon={Users}
            iconGradient="from-blue-500 to-purple-500"
          />
          <StatCard
            title="Post Reach"
            value="48.7K"
            change="+24.1%"
            changeType="positive"
            description="this week"
            icon={Eye}
            iconGradient="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Engagement Rate"
            value="6.8%"
            change="+1.2%"
            changeType="positive"
            description="vs avg"
            icon={Heart}
            iconGradient="from-pink-500 to-orange-400"
          />
          <StatCard
            title="Posts Scheduled"
            value={String(scheduledPosts.length)}
            change={scheduledPosts.length > 0 ? "Next: Apr 5" : "None yet"}
            changeType="neutral"
            description=""
            icon={TrendingUp}
            iconGradient="from-cyan-500 to-blue-500"
          />
        </div>

        {/* Pipeline status bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-3">
          {[
            { label: "Published", count: publishedPosts.length, icon: CheckCircle, color: "text-white/40", bg: "bg-white/[0.03]", border: "border-white/[0.05]" },
            { label: "Scheduled", count: scheduledPosts.length, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/[0.04]", border: "border-emerald-500/20" },
            { label: "In Review", count: reviewPosts.length, icon: AlertCircle, color: "text-blue-400", bg: "bg-blue-500/[0.04]", border: "border-blue-500/20" },
            { label: "Drafts", count: draftPosts.length, icon: PenLine, color: "text-yellow-400", bg: "bg-yellow-500/[0.04]", border: "border-yellow-500/20" },
          ].map(({ label, count, icon: Icon, color, bg, border }) => (
            <Link
              key={label}
              href="/dashboard/planner"
              className={`flex min-h-20 items-center gap-3 rounded-xl border ${border} ${bg} px-4 py-4 transition-all hover:brightness-110 sm:min-h-0 sm:py-3`}
            >
              <Icon className={`h-4 w-4 ${color}`} />
              <div>
                <p className="text-sm text-white/45 sm:text-xs sm:text-white/40">{label}</p>
                <p className={`text-2xl font-bold sm:text-xl ${color}`}>{count}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-7 sm:gap-6 lg:grid-cols-3">
          {/* Quick Access */}
          <div className="lg:col-span-2">
            <SectionCard title="Quick Access" description="Jump to any section">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex min-h-20 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04] sm:min-h-0"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-medium text-white sm:text-sm">{item.title}</span>
                          {item.badge && (
                            <Badge className="h-6 rounded-full bg-white/[0.08] px-2 text-xs text-white/60 sm:h-4 sm:px-1.5 sm:text-[10px] sm:text-white/50">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 truncate text-sm text-white/45 sm:mt-0.5 sm:text-xs sm:text-white/40">{item.description}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-white/20 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/40" />
                    </Link>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          {/* Upcoming posts — now live from context */}
          <SectionCard
            title="Upcoming Posts"
            description="Next in queue"
            headerActions={
              <>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex min-h-9 items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/70 sm:min-h-0 sm:px-2 sm:py-1 sm:text-xs sm:text-white/30"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
                <Link href="/dashboard/planner" className="flex min-h-9 items-center px-2 text-sm text-white/45 transition-colors hover:text-white sm:min-h-0 sm:px-0 sm:text-xs sm:text-white/40">
                  All →
                </Link>
              </>
            }
          >
            <div className="flex flex-col gap-3">
              {upcomingPosts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                    <CalendarDays className="h-5 w-5 text-white/20" />
                  </div>
                  <div>
                    <p className="text-base text-white/35 sm:text-sm sm:text-white/30">No posts scheduled</p>
                    <p className="mt-1 text-sm text-white/25 sm:mt-0.5 sm:text-xs sm:text-white/20">Create a post to get started</p>
                  </div>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="min-h-9 rounded-lg px-3 text-sm text-pink-400/80 transition-colors hover:text-pink-400 sm:min-h-0 sm:px-0 sm:text-xs sm:text-pink-400/70"
                  >
                    + New Post
                  </button>
                </div>
              ) : (
                upcomingPosts.map((post) => (
                  <div key={post.id} className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                    <div className={`h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br ${post.thumbnail} flex items-center justify-center`}>
                      <FileText className="h-3.5 w-3.5 text-white/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-white/85 sm:text-xs sm:text-white/80">{post.title}</p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <Badge className={`h-6 rounded-full px-2 text-xs sm:h-4 sm:px-1.5 sm:text-[10px] ${statusColors[post.status]}`}>
                          {post.status}
                        </Badge>
                        {post.platform.slice(0, 2).map((p) => (
                          <Badge key={p} className={`h-6 rounded-full px-2 text-xs sm:h-4 sm:px-1.5 sm:text-[10px] ${platformColors[p]}`}>
                            {p}
                          </Badge>
                        ))}
                      </div>
                      {post.scheduledFor && (
                        <p className="mt-1 text-xs text-white/35 sm:text-[10px] sm:text-white/30">
                          <Clock className="inline h-2.5 w-2.5 mr-0.5" />
                          {new Date(post.scheduledFor).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
