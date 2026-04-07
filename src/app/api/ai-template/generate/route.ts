import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// ─── Public types (imported by the UI layer) ──────────────────────────────────

export interface TemplateGenerateRequest {
  topic: string;
  language?: string;
  tone?: string;
}

export interface AiToolOfWeekTemplate {
  type: "ai_tool_of_week";
  subtitle: string;
  headline: string;
  tool_name: string;
  caption: string;
  hashtags: string[];
}

// ─── Anthropic client (server-only — key never sent to the browser) ───────────

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Validation helper ────────────────────────────────────────────────────────

function isValidTemplate(obj: unknown): obj is AiToolOfWeekTemplate {
  if (!obj || typeof obj !== "object") return false;
  const t = obj as Record<string, unknown>;
  return (
    typeof t.subtitle === "string" &&
    typeof t.headline === "string" &&
    typeof t.tool_name === "string" &&
    typeof t.caption === "string" &&
    Array.isArray(t.hashtags) &&
    t.hashtags.every((h) => typeof h === "string")
  );
}

// ─── Real AI generation ───────────────────────────────────────────────────────

async function generateWithAI(
  topic: string,
  language: string,
  tone: string
): Promise<AiToolOfWeekTemplate> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: `You are a social media content expert for an AI Club with a large student following.
You write punchy, culturally relevant Instagram content that drives engagement.
Always respond with a single valid JSON object — no markdown fences, no commentary, nothing else.`,
    messages: [
      {
        role: "user",
        content: `Create an "AI Tool of the Week" Instagram post about: ${topic}

Language: ${language}
Tone: ${tone}

Requirements:
- subtitle: short section header translated into ${language} (e.g. "AI tool of the week")
- headline: max 7 words, bold and punchy, in ${language} — do NOT start every headline the same way
- tool_name: the tool name only, no surrounding words
- caption: 2–3 sentences in ${language}, conversational, include 1–2 relevant emoji, end with a question to drive comments
- hashtags: exactly 5 tags — mix of Hebrew/English as appropriate, highly relevant, no generic tags like #AI alone

Return ONLY this JSON (no extra text):
{
  "type": "ai_tool_of_week",
  "subtitle": "...",
  "headline": "...",
  "tool_name": "...",
  "caption": "...",
  "hashtags": ["...", "...", "...", "...", "..."]
}`,
      },
    ],
  });

  const raw =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  // Strip accidental markdown code fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `AI returned invalid JSON. Raw response: ${cleaned.slice(0, 200)}`
    );
  }

  if (!isValidTemplate(parsed)) {
    throw new Error("AI response is missing required fields.");
  }

  // Enforce discriminant and normalize hashtags (ensure leading #)
  parsed.type = "ai_tool_of_week";
  parsed.hashtags = parsed.hashtags.map((h) =>
    h.startsWith("#") ? h : `#${h}`
  );

  return parsed;
}

// ─── Mock fallback (active when ANTHROPIC_API_KEY is absent) ─────────────────

function mockGenerate(topic: string, language: string): AiToolOfWeekTemplate {
  const isHebrew =
    language.toLowerCase().includes("hebrew") ||
    language.toLowerCase().includes("עברית");

  if (isHebrew) {
    return {
      type: "ai_tool_of_week",
      subtitle: "כלי AI של השבוע",
      headline: `${topic} משנה את כל מה שידעתם`,
      tool_name: topic,
      caption: `✨ השבוע אנחנו מציגים את ${topic} – כלי AI שכבר משנה את הדרך שבה אנשים עובדים ויוצרים. כבר ניסיתם אותו? 🚀\n\nספרו לנו בתגובות מה הייתם עושים איתו! 👇`,
      hashtags: ["#AIClub", "#בינהמלאכותית", "#כליAI", "#חדשנות", "#טכנולוגיה"],
    };
  }

  return {
    type: "ai_tool_of_week",
    subtitle: "AI Tool of the Week",
    headline: `${topic} Is Changing the Game`,
    tool_name: topic,
    caption: `✨ This week we're spotlighting ${topic} — an AI tool already reshaping how people work and create.\n\nHave you tried it yet? Tell us what you'd use it for! 👇`,
    hashtags: ["#AIClub", "#ArtificialIntelligence", "#AITools", "#Innovation", "#Tech"],
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TemplateGenerateRequest;
    const { topic, language = "Hebrew", tone = "modern / exciting" } = body;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return Response.json({ error: "Please enter a tool or topic name." }, { status: 400 });
    }

    const trimmedTopic = topic.trim();

    const result = process.env.ANTHROPIC_API_KEY
      ? await generateWithAI(trimmedTopic, language, tone)
      : mockGenerate(trimmedTopic, language);

    return Response.json(result);
  } catch (err) {
    console.error("[ai-template/generate]", err);

    // Translate known Anthropic SDK errors into friendly messages
    const raw = err instanceof Error ? err.message : String(err);
    let userMessage = "Content generation failed. Please try again.";

    if (raw.includes("401") || raw.includes("authentication")) {
      userMessage = "Invalid Anthropic API key. Check your .env.local file.";
    } else if (raw.includes("429") || raw.includes("rate")) {
      userMessage = "Rate limit reached. Please wait a moment and try again.";
    } else if (raw.includes("invalid JSON") || raw.includes("missing required")) {
      userMessage = "The AI returned an unexpected response. Please try again.";
    }

    return Response.json({ error: userMessage }, { status: 500 });
  }
}
