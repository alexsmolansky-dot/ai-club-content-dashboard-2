// ─── Platform / format / pillar ──────────────────────────────────────────────

export type Platform = "instagram" | "linkedin" | "tiktok";

export type PostFormat =
  | "image"
  | "carousel"
  | "video"
  | "text"
  | "article"
  | "reel"
  | "story";

export type ContentPillar =
  | "education"
  | "community"
  | "industry"
  | "events"
  | "behind-the-scenes"
  | "tools";

// ─── Status types ─────────────────────────────────────────────────────────────

/**
 * Editorial workflow status — controlled by users in the UI.
 * Stored in the `status` column.
 */
export type PostStatus = "draft" | "scheduled" | "review" | "published";

/**
 * Publishing pipeline status — driven by the scheduler.
 * Stored in the `publish_status` column.
 *
 *   draft      → saved, not queued
 *   scheduled  → queued; scheduler will publish at `scheduled_for`
 *   publishing → scheduler picked it up; publish in progress
 *   published  → successfully published
 *   failed     → scheduler attempted and failed; see `publishError`
 */
export type PublishStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed";

// ─── Post interface ───────────────────────────────────────────────────────────

export interface PostStats {
  reach?: number;
  likes?: number;
  comments?: number;
  saves?: number;
}

export interface Post {
  id: string;
  title: string;
  caption: string;
  platform: Platform[];
  format: PostFormat;
  /** Editorial workflow status */
  status: PostStatus;
  /** Publishing pipeline status */
  publishStatus: PublishStatus;
  /** Error message from last failed publish attempt */
  publishError?: string;
  scheduledFor?: string;
  publishedAt?: string;
  createdAt?: string;
  pillar: ContentPillar;
  author: string;
  thumbnail: string;
  tags: string[];
  stats?: PostStats;
}

// ─── Badge / style maps ───────────────────────────────────────────────────────

export const PLATFORM_BADGE: Record<Platform, string> = {
  instagram: "bg-pink-500/15 text-pink-300 border border-pink-500/30",
  linkedin:  "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  tiktok:    "bg-slate-500/15 text-slate-300 border border-slate-500/30",
};

export const PILLAR_BADGE_COLORS: Record<ContentPillar, string> = {
  education:          "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  community:          "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30",
  industry:           "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  events:             "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  "behind-the-scenes":"bg-purple-500/15 text-purple-300 border border-purple-500/30",
  tools:              "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
};

/**
 * Styles for the editorial `status` field (used in the modal and
 * as a secondary indicator in the planner).
 */
export const STATUS_STYLES: Record<
  PostStatus,
  { label: string; badge: string; dot: string }
> = {
  draft:     { label: "Draft",      badge: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",   dot: "bg-yellow-400"  },
  scheduled: { label: "Scheduled",  badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20", dot: "bg-emerald-400" },
  review:    { label: "In Review",  badge: "bg-blue-500/15 text-blue-400 border border-blue-500/20",          dot: "bg-blue-400"    },
  published: { label: "Published",  badge: "bg-purple-500/15 text-purple-400 border border-purple-500/20",    dot: "bg-purple-400"  },
};

/**
 * Styles for the pipeline `publishStatus` field — the primary
 * status shown in the planner. Extends STATUS_STYLES with
 * "publishing" (animated) and "failed" (red).
 */
export const PUBLISH_STATUS_STYLES: Record<
  PublishStatus,
  { label: string; badge: string; dot: string; pulse?: boolean }
> = {
  draft:      { label: "Draft",        badge: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",    dot: "bg-yellow-400"  },
  scheduled:  { label: "Scheduled",    badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",  dot: "bg-emerald-400" },
  publishing: { label: "Publishing…",  badge: "bg-blue-500/15 text-blue-400 border border-blue-500/20",           dot: "bg-blue-400", pulse: true },
  published:  { label: "Published",    badge: "bg-purple-500/15 text-purple-400 border border-purple-500/20",     dot: "bg-purple-400"  },
  failed:     { label: "Failed",       badge: "bg-red-500/15 text-red-400 border border-red-500/20",              dot: "bg-red-400"     },
};

// No static mock data — all posts come from Supabase
export const posts: Post[] = [];
