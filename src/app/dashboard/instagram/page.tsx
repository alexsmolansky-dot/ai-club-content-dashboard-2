"use client";

import { useState } from "react";
import {
  Camera,
  Heart,
  MessageCircle,
  Bookmark,
  Plus,
  ImageIcon,
  Video,
  Clock,
  Layers,
  AlignLeft,
  BookOpen,
  BarChart2,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { SectionCard } from "@/components/section-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { CreatePostModal } from "@/components/create-post-modal";
import { usePosts } from "@/lib/posts-context";
import { Post } from "@/lib/data/posts";

// ─── Config ───────────────────────────────────────────────────────────────────

const FORMAT_ICONS: Record<string, React.ElementType> = {
  image: ImageIcon, carousel: Layers, video: Video,
  reel: Video, story: ImageIcon, text: AlignLeft, article: BookOpen,
};

const GRADIENT_CYCLE = [
  "from-blue-600 to-purple-600",
  "from-purple-600 to-pink-600",
  "from-cyan-600 to-blue-600",
  "from-pink-600 to-rose-600",
  "from-indigo-600 to-violet-600",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatScheduledDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.round(
    (new Date(d).setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)) / 86400000
  );
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Tomorrow, ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + `, ${time}`;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} week${days >= 14 ? "s" : ""} ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScheduledPostCard({ post, index }: { post: Post; index: number }) {
  const FormatIcon = FORMAT_ICONS[post.format] ?? ImageIcon;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${post.thumbnail || GRADIENT_CYCLE[index % GRADIENT_CYCLE.length]}`}>
        <FormatIcon className="h-5 w-5 text-white/70" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
          {post.caption}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-white/40">
            <Clock className="h-3 w-3" />
            {post.scheduledFor ? formatScheduledDate(post.scheduledFor) : "Not scheduled"}
          </div>
          <Badge
            className={`h-4 rounded-full px-1.5 text-[10px] font-medium ${
              post.status === "scheduled"
                ? "bg-emerald-500/15 text-emerald-400"
                : post.status === "review"
                ? "bg-blue-500/15 text-blue-400"
                : "bg-yellow-500/15 text-yellow-400"
            }`}
          >
            {post.status}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function PublishedPostCard({ post }: { post: Post }) {
  const stats = post.stats;
  return (
    <div className="flex flex-col gap-2 border-b border-white/[0.04] pb-4 last:border-0 last:pb-0">
      <p className="text-xs text-white/70 leading-relaxed line-clamp-1">{post.caption}</p>
      {stats && (stats.likes != null || stats.comments != null || stats.saves != null) ? (
        <div className="grid grid-cols-3 gap-1">
          {[
            { icon: Heart,         value: stats.likes,    color: "text-pink-400"   },
            { icon: MessageCircle, value: stats.comments, color: "text-blue-400"   },
            { icon: Bookmark,      value: stats.saves,    color: "text-purple-400" },
          ].map(({ icon: Icon, value, color }, j) => (
            <div key={j} className="flex items-center gap-1">
              <Icon className={`h-3 w-3 ${color}`} />
              <span className="text-[10px] text-white/50">
                {value == null ? "—" : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-white/25 italic">No stats recorded</p>
      )}
      {post.publishedAt && (
        <p className="text-[10px] text-white/25">{formatRelativeTime(post.publishedAt)}</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InstagramPage() {
  const { posts, loading } = usePosts();
  const [modalOpen, setModalOpen] = useState(false);

  const igPosts = posts.filter((p) => p.platform.includes("instagram"));
  const queuePosts = igPosts
    .filter((p) => p.status === "scheduled" || p.status === "draft" || p.status === "review")
    .sort((a, b) => {
      if (!a.scheduledFor && !b.scheduledFor) return 0;
      if (!a.scheduledFor) return 1;
      if (!b.scheduledFor) return -1;
      return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
    })
    .slice(0, 5);

  const publishedPosts = igPosts
    .filter((p) => p.status === "published")
    .sort((a, b) => {
      if (!a.publishedAt || !b.publishedAt) return 0;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-white/30 animate-pulse">Loading Instagram data…</p>
      </div>
    );
  }

  return (
    <>
      <CreatePostModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex flex-col gap-8 p-6">
        <PageHeader
          title="Instagram Manager"
          description="Schedule, manage, and analyze your Instagram content"
          icon={Camera}
          iconGradient="from-pink-500 to-orange-400"
        >
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 px-3 py-2 text-xs font-medium text-white shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            New Post
          </button>
        </PageHeader>

        {/* Stats — static until Instagram Graph API is wired */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Followers"
            value="12.4K"
            change="+342"
            changeType="positive"
            description="this week"
            icon={Camera}
            iconGradient="from-pink-500 to-orange-400"
          />
          <StatCard
            title="Avg. Likes"
            value="847"
            change="+18%"
            changeType="positive"
            description="vs last week"
            icon={Heart}
            iconGradient="from-red-500 to-pink-500"
          />
          <StatCard
            title="Comments"
            value="63"
            change="+5.2%"
            changeType="positive"
            description="per post"
            icon={MessageCircle}
            iconGradient="from-blue-500 to-cyan-400"
          />
          <StatCard
            title="Posts in queue"
            value={String(queuePosts.length)}
            change={`${igPosts.filter(p => p.status === "published").length} published`}
            changeType="neutral"
            description="Instagram"
            icon={BarChart2}
            iconGradient="from-purple-500 to-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Scheduled / Draft queue */}
          <div className="lg:col-span-3">
            <SectionCard
              title="Upcoming Queue"
              description={`${queuePosts.length} Instagram post${queuePosts.length !== 1 ? "s" : ""} pending`}
              headerActions={
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-xs text-white/30 hover:text-white/70 transition-colors"
                >
                  + Add
                </button>
              }
            >
              {queuePosts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Camera className="h-8 w-8 text-white/10" />
                  <p className="text-sm text-white/30">No Instagram posts in queue</p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="text-xs text-pink-400/70 hover:text-pink-400 transition-colors"
                  >
                    + Schedule a post
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {queuePosts.map((post, i) => (
                    <ScheduledPostCard key={post.id} post={post} index={i} />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Published posts */}
          <div className="lg:col-span-2">
            <SectionCard title="Recent Posts" description="Performance overview">
              {publishedPosts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <BarChart2 className="h-8 w-8 text-white/10" />
                  <p className="text-sm text-white/30">No published posts yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {publishedPosts.map((post) => (
                    <PublishedPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
