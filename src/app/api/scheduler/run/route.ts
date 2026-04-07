/**
 * GET /api/scheduler/run
 *
 * Triggers the publishing scheduler. Finds all posts with
 * publish_status = "scheduled" and scheduled_for <= now(),
 * then attempts to publish each one.
 *
 * Security
 * ─────────
 * Set SCHEDULER_SECRET in .env.local / Vercel. In production, the
 * endpoint refuses to run unless this variable is configured.
 *
 * Usage
 * ─────
 * Local dev (open):
 *   curl http://localhost:3000/api/scheduler/run
 *
 * Production:
 *   curl https://your-domain.com/api/scheduler/run?secret=<SCHEDULER_SECRET>
 *
 * Cron (e.g. Vercel Cron, GitHub Actions, Upstash):
 *   Schedule a GET to the URL above every minute or however often you need.
 */

import { NextRequest } from "next/server";
import { runScheduler } from "@/lib/scheduler";

export async function GET(request: NextRequest) {
  // ── Secret check ────────────────────────────────────────────────────────
  const secret = process.env.SCHEDULER_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Scheduler is not configured. Set SCHEDULER_SECRET." },
      { status: 500 }
    );
  }

  if (secret && request.nextUrl.searchParams.get("secret") !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runScheduler();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/scheduler/run]", message);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

// Also accept POST so webhook-based cron services (e.g. Inngest, Trigger.dev)
// can call it easily
export const POST = GET;
