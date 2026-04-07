"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Camera,
  Clock,
  CheckCircle2,
  PenLine,
  AlertCircle,
  ImageIcon,
  Video,
  AlignLeft,
  LayoutGrid,
  BookOpen,
  Layers,
  BriefcaseIcon,
  Trash2,
  Hash,
  Play,
  Loader2,
  XCircle,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Post,
  PublishStatus,
  PILLAR_BADGE_COLORS,
  PLATFORM_BADGE,
  PUBLISH_STATUS_STYLES,
} from "@/lib/data/posts";
import { usePosts } from "@/lib/posts-context";
import { useToast } from "@/components/toast";
import { CreatePostModal } from "@/components/create-post-modal";

// ─── Config ───────────────────────────────────────────────────────────────────

const FORMAT_ICONS: Record<string, React.ElementType> = {
  image:    ImageIcon,
  carousel: Layers,
  video:    Video,
  reel:     Video,
  story:    ImageIcon,
  text:     AlignLeft,
  article:  BookOpen,
};

const PUBLISH_STATUS_ICONS: Record<PublishStatus, React.ElementType> = {
  published:  CheckCircle2,
  scheduled:  Clock,
  publishing: Loader2,
  draft:      PenLine,
  failed:     XCircle,
};

const GRADIENT_CYCLE = [
  "from-blue-600 to-purple-600",
  "from-purple-600 to-pink-600",
  "from-cyan-600 to-blue-600",
  "from-pink-600 to-rose-600",
  "from-indigo-600 to-violet-600",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeDate(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  <  2) return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  === 1) return "yesterday";
  if (days  <  7) return `${days}d ago`;
  return formatDate(iso);
}

// ─── PostRow ─────────────────────────────────────────────────────────────────

function PostRow({
  post,
  index,
  highlighted,
  onEdit,
  onDelete,
}: {
  post:        Post;
  index:       number;
  highlighted: boolean;
  onEdit:      (post: Post) => void;
  onDelete:    (id: string) => void;
}) {
  const FormatIcon      = FORMAT_ICONS[post.format] ?? ImageIcon;
  const StatusIcon      = PUBLISH_STATUS_ICONS[post.publishStatus];
  const publishStyle    = PUBLISH_STATUS_STYLES[post.publishStatus];
  const isPublishing    = post.publishStatus === "publishing";
  const isFailed        = post.publishStatus === "failed";
  const isScheduled     = post.publishStatus === "scheduled";

  return (
    <div
      className={`group flex items-start gap-5 rounded-[1.35rem] border p-6 transition-all duration-300 sm:gap-4 sm:rounded-xl sm:p-4 ${
        highlighted
          ? "border-purple-500/50 bg-purple-500/[0.07] shadow-lg shadow-purple-500/10"
          : isFailed
          ? "border-red-500/20 bg-red-500/[0.03] hover:border-red-500/30"
          : "border-white/[0.05] bg-white/[0.02] hover:border-white/[0.09] hover:bg-white/[0.03]"
      }`}
    >
      {/* Thumbnail */}
      <div
        className={`h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br sm:h-12 sm:w-12 sm:rounded-xl ${
          post.thumbnail || GRADIENT_CYCLE[index % GRADIENT_CYCLE.length]
        } flex items-center justify-center`}
      >
        <FormatIcon className="h-7 w-7 text-white/60 sm:h-5 sm:w-5" />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Title row + action buttons */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="truncate text-2xl font-semibold leading-[1.2] text-white/90 sm:text-sm sm:leading-normal">
              {post.title}
            </p>
            <p className="mt-2.5 line-clamp-2 text-[17px] leading-[1.55] text-white/55 sm:mt-0.5 sm:text-xs sm:leading-normal sm:text-white/40">
              {post.caption}
            </p>
          </div>

          {/* Hover actions */}
          <div className="flex shrink-0 items-center gap-1.5 opacity-100 transition-opacity sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(post)}
              className="h-12 rounded-xl px-5 text-base font-semibold text-white/55 hover:bg-white/[0.06] hover:text-white sm:h-7 sm:rounded-lg sm:px-2.5 sm:text-[11px] sm:font-medium sm:text-white/40"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post.id)}
              className="h-12 w-12 rounded-xl p-0 text-rose-400/65 hover:bg-rose-500/[0.08] hover:text-rose-400 sm:h-7 sm:w-7 sm:rounded-lg sm:text-rose-400/50"
            >
              <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-2 sm:gap-1.5">
            <Hash className="h-4 w-4 shrink-0 text-cyan-500/50 sm:h-3 sm:w-3" />
            {post.tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-cyan-500/20 bg-cyan-500/8 px-3.5 py-1.5 text-sm font-medium leading-[1.4] text-cyan-400/85 sm:px-2 sm:py-0.5 sm:text-[10px] sm:leading-normal sm:text-cyan-400/80"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 6 && (
              <span className="text-sm text-white/35 sm:text-[10px] sm:text-white/25">
                +{post.tags.length - 6} more
              </span>
            )}
          </div>
        )}

        {/* Publish-error banner */}
        {isFailed && post.publishError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-3 sm:mt-2 sm:gap-1.5 sm:px-3 sm:py-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400 sm:h-3 sm:w-3" />
            <p className="text-sm leading-[1.55] text-red-300/85 sm:text-[10px] sm:leading-snug sm:text-red-300/80">
              {post.publishError}
            </p>
          </div>
        )}

        {/* Meta badges row */}
        <div className="mt-3 flex flex-wrap items-center gap-2.5 sm:mt-2 sm:gap-2">
          {/* Publish status badge */}
          <Badge
            className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium leading-[1.4] sm:h-5 sm:gap-1 sm:px-2 sm:text-[10px] sm:leading-normal ${publishStyle.badge}`}
          >
            <StatusIcon
              className={`h-3.5 w-3.5 sm:h-2.5 sm:w-2.5 ${isPublishing ? "animate-spin" : ""}`}
            />
            {publishStyle.label}
          </Badge>

          {/* Pillar */}
          <Badge
            className={`h-9 rounded-full px-3.5 text-sm font-medium leading-[1.4] sm:h-5 sm:px-2 sm:text-[10px] sm:leading-normal ${PILLAR_BADGE_COLORS[post.pillar]}`}
          >
            {post.pillar.replace(/-/g, " ")}
          </Badge>

          {/* Platforms */}
          {post.platform.map((p) => (
            <Badge
              key={p}
              className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium leading-[1.4] sm:h-5 sm:gap-1 sm:px-2 sm:text-[10px] sm:leading-normal ${PLATFORM_BADGE[p]}`}
            >
              {p === "instagram" && <Camera className="h-3.5 w-3.5 sm:h-2.5 sm:w-2.5" />}
              {p === "linkedin"  && <BriefcaseIcon className="h-3.5 w-3.5 sm:h-2.5 sm:w-2.5" />}
              {p}
            </Badge>
          ))}

          {/* Scheduled time */}
          {isScheduled && post.scheduledFor && (
            <span className="flex items-center gap-1.5 text-sm leading-[1.45] text-emerald-400/75 sm:gap-1 sm:text-[10px] sm:leading-normal sm:text-emerald-400/60">
              <Clock className="h-3.5 w-3.5 sm:h-2.5 sm:w-2.5" />
              {formatDate(post.scheduledFor)}
            </span>
          )}

          {/* Published at */}
          {post.publishStatus === "published" && post.publishedAt && (
            <span className="flex items-center gap-1.5 text-sm leading-[1.45] text-purple-400/65 sm:gap-1 sm:text-[10px] sm:leading-normal sm:text-purple-400/50">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-2.5 sm:w-2.5" />
              Published {formatRelativeDate(post.publishedAt)}
            </span>
          )}

          {/* Created at — rightmost */}
          {post.createdAt && (
            <span className="ml-auto text-sm text-white/35 sm:text-[10px] sm:text-white/25">
              {formatRelativeDate(post.createdAt)}
            </span>
          )}
        </div>

        {/* Stats for published posts */}
        {post.publishStatus === "published" && post.stats && (
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {[
              { label: "Reach",    value: post.stats.reach    },
              { label: "Likes",    value: post.stats.likes    },
              { label: "Comments", value: post.stats.comments },
              { label: "Saves",    value: post.stats.saves    },
            ]
              .filter((s) => s.value !== undefined)
              .map((s) => (
                <div key={s.label} className="flex items-center gap-1">
                  <span className="text-sm text-white/35 sm:text-[10px] sm:text-white/25">{s.label}</span>
                  <span className="text-sm font-semibold text-white/60 sm:text-[10px] sm:text-white/50">
                    {s.value! >= 1000
                      ? `${(s.value! / 1000).toFixed(1)}K`
                      : s.value}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Filter types ─────────────────────────────────────────────────────────────

type FilterStatus = "all" | PublishStatus;
type FilterPlatform = "all" | "instagram" | "linkedin" | "tiktok";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const { posts, loading, fetchError, deletePost, refreshPosts } = usePosts();
  const toast = useToast();

  const [editingPost,     setEditingPost]     = useState<Post | null>(null);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [statusFilter,    setStatusFilter]    = useState<FilterStatus>("all");
  const [platformFilter,  setPlatformFilter]  = useState<FilterPlatform>("all");
  const [search,          setSearch]          = useState("");
  const [highlightId,     setHighlightId]     = useState<string | null>(null);
  const [schedulerRunning, setSchedulerRunning] = useState(false);

  // Clear highlight after 3 seconds
  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 3000);
    return () => clearTimeout(t);
  }, [highlightId]);

  const handleNewPost = () => {
    setEditingPost(null);
    setModalOpen(true);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingPost(null);
  };

  const handlePostCreated = useCallback(
    (id?: string) => {
      if (id) setHighlightId(id);
      toast({
        type: "success",
        title: editingPost ? "Post updated" : "Post saved",
        description: editingPost
          ? "Changes saved to Supabase."
          : "Draft added to your planner.",
      });
    },
    [editingPost, toast]
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deletePost(id);
      toast({ type: "success", title: "Post deleted" });
    } catch {
      toast({
        type: "error",
        title: "Delete failed",
        description: "Could not remove post. Check console.",
      });
    }
  };

  // ── Run Scheduler ──────────────────────────────────────────────────────────

  const handleRunScheduler = async () => {
    setSchedulerRunning(true);
    try {
      const res = await fetch("/api/scheduler/run");
      const data = (await res.json()) as {
        ok: boolean;
        processed?: number;
        succeeded?: number;
        failed?: number;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        toast({
          type: "error",
          title: "Scheduler error",
          description: data.error ?? `HTTP ${res.status}`,
        });
        return;
      }

      const { processed = 0, succeeded = 0, failed = 0 } = data;

      if (processed === 0) {
        toast({ type: "info", title: "No posts due", description: "Nothing scheduled for now." });
      } else {
        toast({
          type: failed > 0 ? "error" : "success",
          title: `Scheduler ran — ${succeeded}/${processed} published`,
          description:
            failed > 0
              ? `${failed} post${failed > 1 ? "s" : ""} failed. Check the error banners below.`
              : "All due posts published successfully.",
        });
      }

      // Reload posts to reflect updated publish_status values
      await refreshPosts();
    } catch (err) {
      toast({
        type: "error",
        title: "Scheduler unreachable",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSchedulerRunning(false);
    }
  };

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = posts.filter((p) => {
    if (statusFilter !== "all" && p.publishStatus !== statusFilter) return false;
    if (platformFilter !== "all" && !p.platform.includes(platformFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      const inTitle   = p.title.toLowerCase().includes(q);
      const inCaption = p.caption.toLowerCase().includes(q);
      const inTags    = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inCaption && !inTags) return false;
    }
    return true;
  });

  const counts: Record<FilterStatus, number> = {
    all:        posts.length,
    draft:      posts.filter((p) => p.publishStatus === "draft").length,
    scheduled:  posts.filter((p) => p.publishStatus === "scheduled").length,
    publishing: posts.filter((p) => p.publishStatus === "publishing").length,
    published:  posts.filter((p) => p.publishStatus === "published").length,
    failed:     posts.filter((p) => p.publishStatus === "failed").length,
  };

  // Summary tiles — show the most relevant pipeline states
  const TILE_STATUSES: PublishStatus[] = ["draft", "scheduled", "published", "failed"];

  // ── Loading / error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="animate-pulse text-base text-white/30 sm:text-sm">Loading posts…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-red-400/60" />
          <p className="text-base text-red-300/80 sm:text-sm">{fetchError}</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <CreatePostModal
        open={modalOpen}
        onClose={handleModalClose}
        onCreated={handlePostCreated}
        post={editingPost ?? undefined}
      />

      <div className="flex flex-col gap-14 p-8 sm:gap-8 sm:p-6">
        <PageHeader
          title="Content Planner"
          description="Manage all posts across Instagram, LinkedIn, and TikTok"
          icon={FileText}
          iconGradient="from-pink-500 to-rose-500"
        >
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
            {/* Run Scheduler */}
            <Button
              onClick={handleRunScheduler}
              disabled={schedulerRunning}
              className="h-[58px] justify-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-7 text-[17px] font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50 sm:h-8 sm:gap-1.5 sm:rounded-lg sm:px-3 sm:text-xs sm:font-medium"
            >
              {schedulerRunning ? (
                <Loader2 className="h-5 w-5 animate-spin sm:h-3.5 sm:w-3.5" />
              ) : (
                <Play className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
              )}
              {schedulerRunning ? "Running…" : "Run Scheduler"}
            </Button>

            {/* New Post */}
            <Button
              onClick={handleNewPost}
              className="h-[58px] justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-7 text-[17px] font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:opacity-90 sm:h-8 sm:gap-1.5 sm:rounded-lg sm:px-3 sm:text-xs sm:font-medium"
            >
              <Plus className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
              New Post
            </Button>
          </div>
        </PageHeader>

        {/* ── Status summary tiles ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-3">
          {TILE_STATUSES.map((s) => {
            const cfg    = PUBLISH_STATUS_STYLES[s];
            const Icon   = PUBLISH_STATUS_ICONS[s];
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(active ? "all" : s)}
                className={`flex min-h-28 items-center gap-4 rounded-[1.35rem] border px-6 py-6 text-left transition-all sm:min-h-0 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3 ${
                  active
                    ? "border-white/20 bg-white/[0.07]"
                    : "border-white/[0.05] bg-white/[0.02] hover:border-white/[0.09]"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-7 sm:w-7 ${cfg.badge}`}
                >
                  <Icon className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
                </div>
                <div>
                  <p className="text-[17px] leading-[1.45] text-white/55 sm:text-[10px] sm:leading-normal sm:text-white/40">{cfg.label}</p>
                  <p className="text-[2.15rem] font-bold leading-[1.05] text-white sm:text-xl sm:leading-normal">{counts[s]}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Inline alert when posts are actively publishing */}
        {counts.publishing > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-5 py-4 sm:gap-2.5 sm:px-4 sm:py-3">
            <Zap className="h-5 w-5 shrink-0 text-blue-400 sm:h-4 sm:w-4" />
            <p className="text-base text-blue-300/85 sm:text-xs sm:text-blue-300/80">
              <span className="font-semibold">{counts.publishing}</span>{" "}
              post{counts.publishing > 1 ? "s are" : " is"} currently being published by the scheduler.
            </p>
            <Loader2 className="ml-auto h-4 w-4 animate-spin text-blue-400/60 sm:h-3.5 sm:w-3.5" />
          </div>
        )}

        {/* ── Posts list ────────────────────────────────────────────────────── */}
        <SectionCard
          title="Posts"
          description={`${filtered.length} of ${posts.length} posts`}
          headerActions={
            <div className="flex items-center gap-1.5 text-base text-white/45 sm:gap-1 sm:text-xs sm:text-white/30">
              <Filter className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span>Filter</span>
            </div>
          }
        >
          {/* Filter controls */}
          <div className="mb-8 flex flex-wrap items-center gap-5 sm:mb-5 sm:gap-3">
            {/* Search */}
            <div className="relative min-w-48 flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30 sm:left-3 sm:h-3.5 sm:w-3.5 sm:text-white/25" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, caption, or tags…"
                className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] py-[18px] pl-12 pr-4 text-[17px] leading-[1.45] text-white placeholder:text-white/35 focus:border-white/20 focus:outline-none sm:rounded-lg sm:py-2 sm:pl-8 sm:text-xs sm:leading-normal sm:placeholder:text-white/25"
              />
            </div>

            {/* Status filter pills */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-2 sm:gap-1 sm:rounded-lg sm:p-1">
              {(["all", "draft", "scheduled", "publishing", "published", "failed"] as FilterStatus[]).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold leading-[1.4] capitalize transition-all sm:min-h-0 sm:rounded-md sm:px-2.5 sm:py-1 sm:text-[11px] sm:font-medium sm:leading-normal ${
                      statusFilter === s
                        ? "bg-white/[0.1] text-white"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    {s === "all"
                      ? `All (${counts.all})`
                      : PUBLISH_STATUS_STYLES[s].label}
                  </button>
                )
              )}
            </div>

            {/* Platform filter pills */}
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-2 sm:gap-1 sm:rounded-lg sm:p-1">
              {(["all", "instagram", "linkedin", "tiktok"] as FilterPlatform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold leading-[1.4] capitalize transition-all sm:min-h-0 sm:rounded-md sm:px-3 sm:py-1 sm:text-[11px] sm:font-medium sm:leading-normal ${
                    platformFilter === p
                      ? "bg-white/[0.1] text-white"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Post rows */}
          <div className="flex flex-col gap-5 sm:gap-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center sm:gap-3 sm:py-14">
                <LayoutGrid className="h-10 w-10 text-white/10 sm:h-8 sm:w-8" />
                <div>
                  <p className="text-lg text-white/40 sm:text-sm sm:text-white/30">No posts match your filters</p>
                  {posts.length === 0 && (
                    <p className="mt-1.5 text-base text-white/30 sm:mt-1 sm:text-xs sm:text-white/20">
                      Create your first post with the button above
                    </p>
                  )}
                </div>
              </div>
            ) : (
              filtered.map((post, i) => (
                <PostRow
                  key={post.id}
                  post={post}
                  index={i}
                  highlighted={post.id === highlightId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
