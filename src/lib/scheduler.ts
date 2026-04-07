/**
 * scheduler.ts — Publishing pipeline logic
 *
 * Keeps all scheduling concerns in one place, separate from HTTP handlers
 * and UI. Call `runScheduler()` from a cron route, a webhook, or the
 * manual "Run Now" button in the planner.
 *
 * To wire up a real platform API:
 *   1. Replace `simulatePublish()` with your actual API call.
 *   2. The rest of the flow (mark publishing → success/failure) stays unchanged.
 */

import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SchedulerPostRow {
  id: string;
  title: string;
  caption: string;
  platform: string[];
  tags: string[];
  scheduled_for: string;
}

export interface SchedulerOutcome {
  id: string;
  title: string;
  result: "published" | "failed";
  error?: string;
}

export interface SchedulerResult {
  /** ISO timestamp when the run started */
  startedAt: string;
  /** Number of posts that were due */
  processed: number;
  succeeded: number;
  failed: number;
  /** Per-post detail */
  outcomes: SchedulerOutcome[];
}

// ─── Supabase client (server-side only) ──────────────────────────────────────
//
// Uses the anon key + permissive RLS policies set in schema.sql.
// For stricter production use, swap in SUPABASE_SERVICE_ROLE_KEY so the
// scheduler can bypass RLS without relying on permissive policies.

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Platform publisher ───────────────────────────────────────────────────────
//
// Replace the body of this function with a real API call when you have
// platform credentials (e.g. Instagram Graph API, LinkedIn API).
//
// Throw any Error to trigger the "failed" path and record publish_error.

async function publishToplatform(post: SchedulerPostRow): Promise<void> {
  // ── TODO: replace with real API integration ────────────────────────────────
  //
  // Example Instagram Graph API skeleton:
  //   const mediaRes = await fetch(
  //     `https://graph.instagram.com/${IG_USER_ID}/media`,
  //     { method: "POST", body: JSON.stringify({ caption: post.caption, ... }) }
  //   );
  //   if (!mediaRes.ok) throw new Error(await mediaRes.text());
  //   const { id: creationId } = await mediaRes.json();
  //   const publishRes = await fetch(
  //     `https://graph.instagram.com/${IG_USER_ID}/media_publish`,
  //     { method: "POST", body: JSON.stringify({ creation_id: creationId }) }
  //   );
  //   if (!publishRes.ok) throw new Error(await publishRes.text());
  //
  // ── For now: simulated 200ms delay, always succeeds ────────────────────────
  await new Promise<void>((resolve) => setTimeout(resolve, 200));

  // To manually test the failure path, uncomment:
  // throw new Error("Simulated platform API failure");
  void post; // suppress unused-variable warning during simulation
}

// ─── Core scheduler ───────────────────────────────────────────────────────────

export async function runScheduler(): Promise<SchedulerResult> {
  const supabase = getSupabase();
  const startedAt = new Date().toISOString();

  // ── 1. Find all posts that are due ────────────────────────────────────────
  const { data: duePosts, error: fetchError } = await supabase
    .from("posts")
    .select("id, title, caption, platform, tags, scheduled_for")
    .eq("publish_status", "scheduled")
    .lte("scheduled_for", startedAt); // scheduled_for <= now

  if (fetchError) {
    throw new Error(`Scheduler: failed to query posts — ${fetchError.message}`);
  }

  const posts = (duePosts ?? []) as SchedulerPostRow[];

  const result: SchedulerResult = {
    startedAt,
    processed: posts.length,
    succeeded: 0,
    failed: 0,
    outcomes: [],
  };

  if (posts.length === 0) return result;

  // ── 2. Process each post ──────────────────────────────────────────────────
  for (const post of posts) {
    // Mark as "publishing" immediately so concurrent runs skip this post
    const { error: lockError } = await supabase
      .from("posts")
      .update({ publish_status: "publishing" })
      .eq("id", post.id)
      .eq("publish_status", "scheduled"); // guard against race conditions

    if (lockError) {
      console.error(`[scheduler] Could not lock post ${post.id}:`, lockError.message);
      continue; // another runner may have grabbed it
    }

    try {
      // ── 3. Attempt to publish ──────────────────────────────────────────────
      await publishToplatform(post);

      // ── 4. Success path ────────────────────────────────────────────────────
      await supabase
        .from("posts")
        .update({
          publish_status: "published",
          status: "published",         // also update editorial status
          published_at: new Date().toISOString(),
          publish_error: null,
        })
        .eq("id", post.id);

      result.succeeded++;
      result.outcomes.push({ id: post.id, title: post.title, result: "published" });
      console.log(`[scheduler] ✓ Published: ${post.title} (${post.id})`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      // ── 5. Failure path ────────────────────────────────────────────────────
      await supabase
        .from("posts")
        .update({
          publish_status: "failed",
          publish_error: errorMsg,
          // Leave status as "scheduled" so the user can inspect and retry
        })
        .eq("id", post.id);

      result.failed++;
      result.outcomes.push({
        id: post.id,
        title: post.title,
        result: "failed",
        error: errorMsg,
      });
      console.error(`[scheduler] ✗ Failed:   ${post.title} (${post.id}) — ${errorMsg}`);
    }
  }

  console.log(
    `[scheduler] Done — ${result.succeeded} published, ${result.failed} failed of ${result.processed} processed`
  );
  return result;
}

/**
 * Requeue a failed post back to "scheduled" so the next scheduler run
 * will retry it. Call this from an API route or admin UI.
 */
export async function requeuePost(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("posts")
    .update({ publish_status: "scheduled", publish_error: null })
    .eq("id", id)
    .eq("publish_status", "failed");

  if (error) throw new Error(`Requeue failed: ${error.message}`);
}
