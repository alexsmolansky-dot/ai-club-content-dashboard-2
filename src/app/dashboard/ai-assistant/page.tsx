"use client";

import { useState } from "react";
import {
  Sparkles,
  Wand2,
  Save,
  Loader2,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { AiToolTemplatePreview } from "@/components/ai-tool-template-preview";
import { usePosts } from "@/lib/posts-context";
import { useToast } from "@/components/toast";
import type { AiToolOfWeekTemplate } from "@/app/api/ai-template/generate/route";

// ─── Config ───────────────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  { value: "Hebrew", label: "עברית (Hebrew)" },
  { value: "English", label: "English" },
  { value: "Arabic", label: "العربية (Arabic)" },
  { value: "Spanish", label: "Español (Spanish)" },
];

const TONE_OPTIONS = [
  { value: "modern / exciting", label: "Modern & Exciting ✨" },
  { value: "professional / educational", label: "Professional & Educational 📚" },
  { value: "fun / playful", label: "Fun & Playful 🎉" },
  { value: "inspiring / motivational", label: "Inspiring & Motivational 🚀" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AiAssistantPage() {
  const { addPost } = usePosts();
  const toast = useToast();

  // Form state
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("Hebrew");
  const [tone, setTone] = useState("modern / exciting");

  // Async state
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<AiToolOfWeekTemplate | null>(null);

  // ── Generate ─────────────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!topic.trim() || generating) return;

    setGenerating(true);

    try {
      const res = await fetch("/api/ai-template/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), language, tone }),
      });

      const data = (await res.json()) as AiToolOfWeekTemplate & { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Content generation failed. Please try again.");
      }

      setResult(data);
    } catch (err) {
      toast({
        type: "error",
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Unexpected error.",
      });
    } finally {
      setGenerating(false);
    }
  }

  // ── Save as Draft ─────────────────────────────────────────────────────────────
  async function handleSaveDraft() {
    if (!result || saving) return;

    setSaving(true);

    try {
      // Headline + body as caption; hashtags go to the `tags` column
      await addPost({
        title: result.tool_name,
        caption: `${result.headline}\n\n${result.caption}`,
        tags: result.hashtags,
        platform: ["instagram"],
        format: "image",
        status: "draft",
        pillar: "tools",
      });

      toast({
        type: "success",
        title: `"${result.tool_name}" saved as draft`,
        description: 'Find it in the Content Planner under "Tools".',
      });
    } catch (err) {
      toast({
        type: "error",
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not write to Supabase.",
      });
    } finally {
      setSaving(false);
    }
  }

  const canGenerate = topic.trim().length > 0 && !generating;
  const canSave = !!result && !saving && !generating;

  return (
    <div className="flex flex-col gap-14 p-8 sm:gap-8 sm:p-6">
      <PageHeader
        title="AI Template Generator"
        description="Generate AI Tool of the Week posts in seconds"
        icon={Sparkles}
        iconGradient="from-violet-500 to-purple-400"
      />

      <div className="grid grid-cols-1 gap-11 sm:gap-6 lg:grid-cols-2">
        {/* ── Input panel ─────────────────────────────────────────────────── */}
        <SectionCard title="Generate Post" description="Fill in the details below">
          <div className="flex flex-col gap-8 sm:gap-5">

            {/* Topic */}
            <div className="flex flex-col gap-3 sm:gap-1.5">
              <label className="text-sm font-semibold uppercase leading-[1.45] tracking-widest text-white/50 sm:text-xs sm:leading-normal sm:text-white/40">
                Tool / Topic <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canGenerate && handleGenerate()}
                placeholder="e.g. ChatGPT, Midjourney, Perplexity…"
                disabled={generating}
                className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-[18px] text-lg leading-[1.45] text-white placeholder-white/30 outline-none transition focus:border-purple-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-purple-500/30 disabled:opacity-50 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm sm:leading-normal sm:placeholder-white/25"
              />
            </div>

            {/* Language */}
            <div className="flex flex-col gap-3 sm:gap-1.5">
              <label className="text-sm font-semibold uppercase leading-[1.45] tracking-widest text-white/50 sm:text-xs sm:leading-normal sm:text-white/40">
                Output Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={generating}
                  className="w-full appearance-none rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-[18px] pr-12 text-lg leading-[1.45] text-white outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 disabled:opacity-50 sm:rounded-xl sm:px-4 sm:py-3 sm:pr-10 sm:text-sm sm:leading-normal"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 sm:right-3 sm:h-4 sm:w-4 sm:text-white/30" />
              </div>
            </div>

            {/* Tone */}
            <div className="flex flex-col gap-3 sm:gap-1.5">
              <label className="text-sm font-semibold uppercase leading-[1.45] tracking-widest text-white/50 sm:text-xs sm:leading-normal sm:text-white/40">
                Tone
              </label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  disabled={generating}
                  className="w-full appearance-none rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-[18px] pr-12 text-lg leading-[1.45] text-white outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 disabled:opacity-50 sm:rounded-xl sm:px-4 sm:py-3 sm:pr-10 sm:text-sm sm:leading-normal"
                >
                  {TONE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 sm:right-3 sm:h-4 sm:w-4 sm:text-white/30" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:gap-3">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="min-h-[58px] flex-1 gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-7 py-3 text-[17px] font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:gap-2 sm:rounded-xl sm:px-2.5 sm:py-2.5 sm:text-sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin sm:h-4 sm:w-4" />
                    Generating…
                  </>
                ) : result ? (
                  <>
                    <RefreshCw className="h-5 w-5 sm:h-4 sm:w-4" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 sm:h-4 sm:w-4" />
                    Generate
                  </>
                )}
              </Button>

              {result && (
                <Button
                  onClick={handleSaveDraft}
                  disabled={!canSave}
                  variant="outline"
                  className="min-h-[58px] gap-2.5 rounded-2xl border-white/[0.1] bg-white/[0.04] px-7 py-3 text-[17px] font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:gap-2 sm:rounded-xl sm:px-2.5 sm:py-2.5 sm:text-sm"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin sm:h-4 sm:w-4" />
                  ) : (
                    <Save className="h-5 w-5 sm:h-4 sm:w-4" />
                  )}
                  {saving ? "Saving…" : "Save Draft"}
                </Button>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── Preview panel ────────────────────────────────────────────────── */}
        <SectionCard title="Preview" description="Live post preview">
          {/* Generating with no prior result */}
          {generating && !result && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
                <Sparkles className="h-6 w-6 animate-pulse text-purple-400" />
              </div>
              <p className="text-lg leading-[1.5] text-white/45 sm:text-sm sm:leading-normal sm:text-white/40">Crafting your post…</p>
            </div>
          )}

          {/* Regenerating — dim old result + overlay spinner */}
          {generating && result && (
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[2px]">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              </div>
              <AiToolTemplatePreview data={result} className="opacity-40" />
            </div>
          )}

          {/* Empty state */}
          {!generating && !result && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                <Wand2 className="h-6 w-6 text-white/20" />
              </div>
              <div>
                <p className="text-lg font-medium leading-[1.4] text-white/40 sm:text-sm sm:leading-normal sm:text-white/35">Preview appears here</p>
                <p className="mt-2 text-base leading-[1.5] text-white/25 sm:mt-1 sm:text-xs sm:leading-normal sm:text-white/20">
                  Enter a tool name and click Generate
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {!generating && result && <AiToolTemplatePreview data={result} />}
        </SectionCard>
      </div>

      {/* ── Template metadata ─────────────────────────────────────────────── */}
      <SectionCard
        title="About this Template"
        description="AI Tool of the Week — fixed Instagram template"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 sm:gap-4">
          {[
            { label: "Template", value: "AI Tool of the Week" },
            { label: "Format", value: "Image post" },
            { label: "Platform", value: "Instagram" },
            { label: "Pillar", value: "Tools" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-2 rounded-[1.35rem] border border-white/[0.06] bg-white/[0.02] px-6 py-5 sm:gap-1 sm:rounded-xl sm:px-4 sm:py-3"
            >
              <span className="text-xs font-semibold uppercase leading-[1.45] tracking-widest text-white/35 sm:text-[10px] sm:leading-normal sm:text-white/30">
                {label}
              </span>
              <span className="text-lg font-medium leading-[1.4] text-white/75 sm:text-sm sm:leading-normal sm:text-white/70">{value}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
