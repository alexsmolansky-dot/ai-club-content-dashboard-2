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
 * Production cron:
 *   Vercel Cron calls this route from vercel.json once per day.
 *   Set CRON_SECRET to the same value as SCHEDULER_SECRET so Vercel sends:
 *   Authorization: Bearer <SCHEDULER_SECRET>
 *
 * Production manual:
 *   The Planner "Run Scheduler" button still calls this route directly.
 */

import { NextRequest } from "next/server";
import { runScheduler } from "@/lib/scheduler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const authorization = request.headers.get("authorization");
  const isVercelCron = userAgent.includes("vercel-cron/1.0");
  const isBearerRequest = authorization?.startsWith("Bearer ") ?? false;
  const isAuthorizedRequest = isVercelCron || isBearerRequest;

  // ── Cron secret check ───────────────────────────────────────────────────
  const secret = process.env.SCHEDULER_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    console.error("[api/scheduler/run] Missing SCHEDULER_SECRET in production");
    return Response.json(
      { error: "Scheduler is not configured. Set SCHEDULER_SECRET." },
      { status: 500 }
    );
  }

  if (isAuthorizedRequest && authorization !== `Bearer ${secret}`) {
    console.warn("[api/scheduler/run] Unauthorized scheduler request", {
      hasAuthorization: Boolean(authorization),
      isVercelCron,
      userAgent,
    });
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[api/scheduler/run] Starting scheduler", {
      source: isVercelCron ? "vercel-cron" : isBearerRequest ? "bearer" : "manual",
      userAgent,
    });

    const result = await runScheduler();
    console.log("[api/scheduler/run] Scheduler completed", result);
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
