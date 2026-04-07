"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import {
  Post,
  Platform,
  PostFormat,
  ContentPillar,
  PostStatus,
  PublishStatus,
} from "./data/posts";

// ─── Input types ──────────────────────────────────────────────────────────────

export interface NewPostInput {
  title: string;
  caption: string;
  platform: Platform[];
  format: PostFormat;
  /** Editorial status; publish_status is derived automatically */
  status: "draft" | "scheduled";
  scheduledFor?: string;
  pillar: ContentPillar;
  /** Hashtag strings saved to the `tags` text[] column */
  tags?: string[];
}

export interface UpdatePostInput {
  title?: string;
  caption?: string;
  platform?: Platform[];
  format?: PostFormat;
  /** All editorial statuses are valid when editing */
  status?: PostStatus;
  scheduledFor?: string | null;
  pillar?: ContentPillar;
  tags?: string[];
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface PostsContextValue {
  posts: Post[];
  loading: boolean;
  fetchError: string | null;
  /** Returns the newly created post id so callers can highlight/navigate to it */
  addPost: (input: NewPostInput) => Promise<string>;
  updatePost: (id: string, input: UpdatePostInput) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  /** Re-fetches all posts from Supabase (e.g. after scheduler runs) */
  refreshPosts: () => Promise<void>;
}

const PostsContext = createContext<PostsContextValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_THUMBNAILS: Record<Platform, string> = {
  instagram: "from-pink-600 to-rose-600",
  linkedin:  "from-blue-600 to-indigo-600",
  tiktok:    "from-slate-700 to-slate-900",
};

/**
 * Derive the publish_status to write when the user changes editorial status.
 *
 *   draft     → draft     (not queued)
 *   scheduled → scheduled (queued for auto-publish)
 *   review    → draft     (editorial hold; not in pipeline)
 *   published → published (manually marked; mirrors a published result)
 */
function derivePublishStatus(status: PostStatus | "draft" | "scheduled"): PublishStatus {
  if (status === "scheduled") return "scheduled";
  if (status === "published") return "published";
  return "draft";
}

function rowToPost(row: Record<string, unknown>): Post {
  const hasStats =
    row.reach != null ||
    row.likes != null ||
    row.comments != null ||
    row.saves != null;

  return {
    id:           row.id as string,
    title:        row.title as string,
    caption:      row.caption as string,
    platform:     row.platform as Platform[],
    format:       row.format as PostFormat,
    pillar:       row.pillar as ContentPillar,
    status:       (row.status as PostStatus) ?? "draft",
    publishStatus:(row.publish_status as PublishStatus) ?? "draft",
    publishError: row.publish_error as string | undefined,
    author:       (row.author as string) ?? "team",
    thumbnail:    (row.thumbnail as string) ?? "from-pink-600 to-rose-600",
    tags:         (row.tags as string[]) ?? [],
    scheduledFor: row.scheduled_for as string | undefined,
    publishedAt:  row.published_at as string | undefined,
    createdAt:    row.created_at as string | undefined,
    stats: hasStats
      ? {
          reach:    row.reach    as number | undefined,
          likes:    row.likes    as number | undefined,
          comments: row.comments as number | undefined,
          saves:    row.saves    as number | undefined,
        }
      : undefined,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadPosts = useCallback(async (opts?: { initial?: boolean }) => {
    if (opts?.initial) setLoading(true);
    setFetchError(null);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[posts] fetch failed:", error.message);
      setFetchError("Could not load posts. Check your Supabase connection.");
    } else {
      setPosts((data ?? []).map(rowToPost));
    }

    if (opts?.initial) setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPosts({ initial: true });
  }, [loadPosts]);

  const refreshPosts = useCallback(async () => {
    await loadPosts({});
  }, [loadPosts]);

  // ── addPost ────────────────────────────────────────────────────────────────
  const addPost = useCallback(async (input: NewPostInput): Promise<string> => {
    const primaryPlatform = input.platform[0] ?? "instagram";

    const row = {
      title:         (input.title || input.caption.slice(0, 60)).trim(),
      caption:       input.caption.trim(),
      platform:      input.platform,
      format:        input.format,
      pillar:        input.pillar,
      status:        input.status,
      publish_status: derivePublishStatus(input.status),
      author:        "team",
      thumbnail:     PLATFORM_THUMBNAILS[primaryPlatform],
      scheduled_for: input.scheduledFor ?? null,
      tags:          input.tags ?? [],
    };

    const { data, error } = await supabase
      .from("posts")
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error("[posts] insert failed:", error.message);
      throw new Error(error.message);
    }

    const post = rowToPost(data);
    setPosts((prev) => [post, ...prev]);
    return post.id;
  }, []);

  // ── updatePost ─────────────────────────────────────────────────────────────
  const updatePost = useCallback(
    async (id: string, input: UpdatePostInput): Promise<void> => {
      const row: Record<string, unknown> = {};

      if (input.title    !== undefined) row.title    = input.title;
      if (input.caption  !== undefined) row.caption  = input.caption;
      if (input.platform !== undefined) row.platform = input.platform;
      if (input.format   !== undefined) row.format   = input.format;
      if (input.pillar   !== undefined) row.pillar   = input.pillar;
      if (input.tags     !== undefined) row.tags     = input.tags;

      if (input.status !== undefined) {
        row.status = input.status;
        // Sync publish_status when the user explicitly changes editorial status.
        // Don't override "publishing" or "failed" — the scheduler owns those.
        row.publish_status = derivePublishStatus(input.status);
      }

      if ("scheduledFor" in input) {
        row.scheduled_for = input.scheduledFor ?? null;
      }

      const { data, error } = await supabase
        .from("posts")
        .update(row)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("[posts] update failed:", error.message);
        throw new Error(error.message);
      }

      setPosts((prev) => prev.map((p) => (p.id === id ? rowToPost(data) : p)));
    },
    []
  );

  // ── deletePost ─────────────────────────────────────────────────────────────
  const deletePost = useCallback(async (id: string): Promise<void> => {
    // Optimistic removal
    setPosts((prev) => prev.filter((p) => p.id !== id));

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.error("[posts] delete failed:", error.message);
      throw new Error(error.message);
    }
  }, []);

  return (
    <PostsContext.Provider
      value={{ posts, loading, fetchError, addPost, updatePost, deletePost, refreshPosts }}
    >
      {children}
    </PostsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside <PostsProvider>");
  return ctx;
}
