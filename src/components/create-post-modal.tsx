"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  Camera,
  BriefcaseIcon,
  CalendarDays,
  Layers,
  AlignLeft,
  ImageIcon,
  Video,
  BookOpen,
  Check,
  Sparkles,
  PenLine,
  CheckCircle2,
  Eye,
  Hash,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/lib/posts-context";
import { useToast } from "@/components/toast";
import { Post, Platform, PostFormat, ContentPillar, PostStatus } from "@/lib/data/posts";

// ─── Config ───────────────────────────────────────────────────────────────────

const PLATFORMS: { value: Platform; label: string; icon: React.ReactNode; badge: string }[] = [
  {
    value: "instagram",
    label: "Instagram",
    icon: <Camera className="h-5 w-5 sm:h-3.5 sm:w-3.5" />,
    badge: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: <BriefcaseIcon className="h-5 w-5 sm:h-3.5 sm:w-3.5" />,
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: (
      <svg className="h-5 w-5 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.14a8.19 8.19 0 004.79 1.52V7.23a4.85 4.85 0 01-1.02-.54z" />
      </svg>
    ),
    badge: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
];

const FORMATS: { value: PostFormat; label: string; icon: React.ReactNode }[] = [
  { value: "image", label: "Image", icon: <ImageIcon className="h-5 w-5 sm:h-3.5 sm:w-3.5" /> },
  { value: "carousel", label: "Carousel", icon: <Layers className="h-5 w-5 sm:h-3.5 sm:w-3.5" /> },
  { value: "video", label: "Video", icon: <Video className="h-5 w-5 sm:h-3.5 sm:w-3.5" /> },
  { value: "text", label: "Text", icon: <AlignLeft className="h-5 w-5 sm:h-3.5 sm:w-3.5" /> },
  { value: "article", label: "Article", icon: <BookOpen className="h-5 w-5 sm:h-3.5 sm:w-3.5" /> },
];

const PILLARS: { value: ContentPillar; label: string }[] = [
  { value: "education", label: "Education" },
  { value: "community", label: "Community" },
  { value: "industry", label: "Industry News" },
  { value: "events", label: "Events" },
  { value: "behind-the-scenes", label: "Behind the Scenes" },
  { value: "tools", label: "Tools & Resources" },
];

const STATUSES: {
  value: PostStatus;
  label: string;
  icon: React.ElementType;
  active: string;
}[] = [
  {
    value: "draft",
    label: "Draft",
    icon: PenLine,
    active: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  },
  {
    value: "scheduled",
    label: "Scheduled",
    icon: CalendarDays,
    active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  {
    value: "review",
    label: "In Review",
    icon: Eye,
    active: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  },
  {
    value: "published",
    label: "Published",
    icon: CheckCircle2,
    active: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  },
];

const CHAR_LIMITS: Record<Platform, number> = {
  instagram: 2200,
  linkedin: 3000,
  tiktok: 2200,
};

// ─── Form types ───────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  caption: string;
  /** Comma-separated hashtags displayed in a text input */
  tagsRaw: string;
  platforms: Platform[];
  format: PostFormat;
  pillar: ContentPillar;
  status: PostStatus;
  scheduledDate: string;
  scheduledTime: string;
}

const DEFAULT_FORM: FormState = {
  title: "",
  caption: "",
  tagsRaw: "",
  platforms: ["instagram"],
  format: "image",
  pillar: "education",
  status: "draft",
  scheduledDate: "",
  scheduledTime: "09:00",
};

function postToFormState(post: Post): FormState {
  let scheduledDate = "";
  let scheduledTime = "09:00";
  if (post.scheduledFor) {
    const d = new Date(post.scheduledFor);
    scheduledDate = d.toISOString().split("T")[0];
    scheduledTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  // Map all statuses; fall back to "draft" for unknown values
  const validStatuses: PostStatus[] = ["draft", "scheduled", "review", "published"];
  const status: PostStatus = validStatuses.includes(post.status) ? post.status : "draft";

  return {
    title: post.title,
    caption: post.caption,
    tagsRaw: (post.tags ?? []).join(", "),
    platforms: post.platform,
    format: FORMATS.some((f) => f.value === post.format)
      ? (post.format as FormState["format"])
      : "image",
    pillar: post.pillar,
    status,
    scheduledDate,
    scheduledTime,
  };
}

/** Parse "  #AIClub , #Tech  " → ["#AIClub", "#Tech"] */
function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => {
      const trimmed = t.trim();
      if (!trimmed) return null;
      return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    })
    .filter((t): t is string => t !== null && t.length > 1);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the new/edited post id after a successful save */
  onCreated?: (id?: string) => void;
  post?: Post;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreatePostModal({ open, onClose, onCreated, post }: CreatePostModalProps) {
  const { addPost, updatePost } = usePosts();
  const toast = useToast();
  const isEditing = Boolean(post);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset/populate form whenever modal opens or target post changes
  useEffect(() => {
    if (open) {
      setForm(post ? postToFormState(post) : DEFAULT_FORM);
      setErrors({});
      setSaving(false);
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [open, post]);

  // Escape key closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  // ── Field helpers ─────────────────────────────────────────────────────────

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const togglePlatform = (p: Platform) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.length > 1
          ? f.platforms.filter((x) => x !== p)
          : f.platforms
        : [...f.platforms, p],
    }));
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const charLimit = Math.min(...form.platforms.map((p) => CHAR_LIMITS[p as Platform]));
  const charCount = form.caption.length;
  const charPct = Math.min(charCount / charLimit, 1);
  const charColor =
    charPct > 0.9 ? "text-red-400" : charPct > 0.75 ? "text-amber-400" : "text-white/30";

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.caption.trim()) e.caption = "Caption is required";
    if (form.caption.length > charLimit) e.caption = `Exceeds ${charLimit} character limit`;
    if (form.status === "scheduled" && !form.scheduledDate) e.scheduledDate = "Pick a date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate() || saving) return;
    setSaving(true);

    const scheduledFor =
      form.status === "scheduled" && form.scheduledDate
        ? new Date(`${form.scheduledDate}T${form.scheduledTime}`).toISOString()
        : undefined;

    const tags = parseTags(form.tagsRaw);
    const title = form.title.trim() || form.caption.slice(0, 60);

    try {
      if (isEditing && post) {
        await updatePost(post.id, {
          title,
          caption: form.caption.trim(),
          platform: form.platforms,
          format: form.format,
          status: form.status,
          scheduledFor: scheduledFor ?? null,
          pillar: form.pillar,
          tags,
        });
        onCreated?.(post.id);
      } else {
        // addPost returns the new post's id
        const newId = await addPost({
          title,
          caption: form.caption.trim(),
          platform: form.platforms,
          format: form.format,
          // addPost only accepts draft | scheduled for initial status
          status: (form.status === "scheduled" ? "scheduled" : "draft") as "draft" | "scheduled",
          scheduledFor,
          pillar: form.pillar,
          tags,
        });
        onCreated?.(newId);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({
        type: "error",
        title: "Save failed",
        description: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-4">
        <div
          className="pointer-events-auto flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-[1.65rem] border border-white/[0.055] bg-[oklch(0.1_0.015_264)] shadow-2xl shadow-black/60 sm:max-h-[90vh] sm:rounded-2xl sm:border-white/[0.1]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/[0.04] px-8 py-7 sm:border-white/[0.07] sm:px-5 sm:py-4">
            <div className="flex items-center gap-4 sm:gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg sm:h-8 sm:w-8 ${
                  isEditing
                    ? "from-blue-500 to-indigo-500 shadow-blue-500/25"
                    : "from-pink-500 to-rose-500 shadow-pink-500/25"
                }`}
              >
                {isEditing ? (
                  <PenLine className="h-5 w-5 text-white sm:h-4 sm:w-4" />
                ) : (
                  <FileText className="h-5 w-5 text-white sm:h-4 sm:w-4" />
                )}
              </div>
              <div>
                <h2 className="text-[1.7rem] font-semibold leading-[1.15] text-white sm:text-sm sm:leading-normal">
                  {isEditing ? "Edit Post" : "New Post"}
                </h2>
                <p className="mt-2 text-base leading-[1.45] text-white/38 sm:mt-0.5 sm:text-[10px] sm:leading-normal sm:text-white/35">
                  {isEditing ? "Update this post in Supabase" : "Create content for your platforms"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center rounded-xl text-white/42 transition-all hover:bg-white/[0.045] hover:text-white sm:h-7 sm:w-7 sm:rounded-lg sm:text-white/40 sm:hover:bg-white/[0.07]"
            >
              <X className="h-5 w-5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 space-y-9 overflow-y-auto px-8 py-8 sm:space-y-5 sm:px-5 sm:py-5">

            {/* Platform */}
            <div>
              <label className="mb-3 block text-sm font-semibold uppercase leading-[1.45] tracking-wider text-white/38 sm:mb-2 sm:text-[11px] sm:leading-normal sm:text-white/35">
                Platform{" "}
                <span className="font-normal normal-case text-white/20">
                  (select all that apply)
                </span>
              </label>
              <div className="flex gap-2">
                {PLATFORMS.map((p) => {
                  const active = form.platforms.includes(p.value);
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => togglePlatform(p.value)}
                      className={`flex min-h-[58px] flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-base font-semibold leading-[1.4] transition-all sm:min-h-0 sm:gap-1.5 sm:rounded-xl sm:py-2.5 sm:text-xs sm:font-medium sm:leading-normal ${
                        active
                          ? `border ${p.badge}`
                          : "border-white/[0.04] text-white/30 hover:border-white/[0.09] hover:text-white/55 sm:border-white/[0.07] sm:hover:border-white/[0.12] sm:hover:text-white/60"
                      }`}
                    >
                      {p.icon}
                      {p.label}
                      {active && <Check className="h-4 w-4 sm:h-3 sm:w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-3 block text-sm font-semibold uppercase leading-[1.45] tracking-wider text-white/38 sm:mb-2 sm:text-[11px] sm:leading-normal sm:text-white/35">
                Title{" "}
                <span className="font-normal normal-case text-white/20">
                  (optional — used in planner)
                </span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Prompt Engineering 101"
                className="w-full rounded-[1.35rem] border border-white/[0.04] bg-white/[0.025] px-5 py-[18px] text-lg leading-[1.45] text-white placeholder:text-white/24 transition-all focus:border-white/15 focus:bg-white/[0.04] focus:outline-none sm:rounded-xl sm:border-white/[0.08] sm:bg-white/[0.03] sm:px-3.5 sm:py-2.5 sm:text-sm sm:leading-normal sm:placeholder:text-white/20 sm:focus:border-white/20"
              />
            </div>

            {/* Caption */}
            <div>
              <div className="mb-3 flex items-center justify-between sm:mb-2">
                <label className="block text-sm font-semibold uppercase leading-[1.45] tracking-wider text-white/38 sm:text-[11px] sm:leading-normal sm:text-white/35">
                  Caption <span className="text-rose-400">*</span>
                </label>
                <span className={`font-mono text-sm transition-colors sm:text-[11px] ${charColor}`}>
                  {charCount} / {charLimit}
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={form.caption}
                onChange={(e) => set("caption", e.target.value)}
                placeholder="Write your caption here… Add hashtags, emojis, and a call to action."
                rows={5}
                className={`w-full resize-none rounded-[1.35rem] border bg-white/[0.025] px-5 py-[18px] text-lg leading-[1.6] text-white placeholder:text-white/24 transition-all focus:bg-white/[0.04] focus:outline-none sm:rounded-xl sm:bg-white/[0.03] sm:px-3.5 sm:py-3 sm:text-sm sm:leading-normal sm:placeholder:text-white/20 ${
                  errors.caption
                    ? "border-rose-500/50 focus:border-rose-500/70"
                    : "border-white/[0.04] focus:border-white/15 sm:border-white/[0.08] sm:focus:border-white/20"
                }`}
              />
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.05] sm:mt-1.5 sm:h-0.5">
                <div
                  className={`h-full rounded-full transition-all ${
                    charPct > 0.9 ? "bg-red-500" : charPct > 0.75 ? "bg-amber-500" : "bg-blue-500/50"
                  }`}
                  style={{ width: `${charPct * 100}%` }}
                />
              </div>
              {errors.caption && (
                <p className="mt-2 text-sm leading-[1.45] text-rose-400 sm:mt-1 sm:text-[11px] sm:leading-normal">{errors.caption}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase leading-[1.45] tracking-wider text-white/38 sm:mb-2 sm:gap-1.5 sm:text-[11px] sm:leading-normal sm:text-white/35">
                <Hash className="h-4 w-4 sm:h-3 sm:w-3" />
                Hashtags / Tags{" "}
                <span className="font-normal normal-case text-white/20">
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                value={form.tagsRaw}
                onChange={(e) => set("tagsRaw", e.target.value)}
                placeholder="#AIClub, #Tech, #Innovation"
                className="w-full rounded-[1.35rem] border border-white/[0.04] bg-white/[0.025] px-5 py-[18px] text-lg leading-[1.45] text-white placeholder:text-white/24 transition-all focus:border-cyan-500/30 focus:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-cyan-500/15 sm:rounded-xl sm:border-white/[0.08] sm:bg-white/[0.03] sm:px-3.5 sm:py-2.5 sm:text-sm sm:leading-normal sm:placeholder:text-white/20 sm:focus:border-cyan-500/40 sm:focus:ring-cyan-500/20"
              />
              {/* Tag preview */}
              {parseTags(form.tagsRaw).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 sm:mt-2 sm:gap-1.5">
                  {parseTags(form.tagsRaw).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-1.5 text-sm font-medium text-cyan-400 sm:px-2.5 sm:py-0.5 sm:text-[10px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Format */}
            <div>
              <label className="mb-3 block text-sm font-semibold uppercase leading-[1.45] tracking-wider text-white/50 sm:mb-2 sm:text-[11px] sm:leading-normal sm:text-white/35">
                Format
              </label>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => set("format", f.value)}
                    className={`flex min-h-12 items-center gap-2 rounded-2xl border px-5 py-3 text-base font-semibold leading-[1.4] transition-all sm:min-h-0 sm:gap-1.5 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs sm:font-medium sm:leading-normal ${
                      form.format === f.value
                        ? "border-white/20 bg-white/[0.09] text-white"
                        : "border-white/[0.07] text-white/35 hover:border-white/[0.12] hover:text-white/60"
                    }`}
                  >
                    {f.icon}
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content pillar */}
            <div>
              <label className="mb-3 block text-sm font-semibold uppercase leading-[1.45] tracking-wider text-white/50 sm:mb-2 sm:text-[11px] sm:leading-normal sm:text-white/35">
                Content Pillar
              </label>
              <select
                value={form.pillar}
                onChange={(e) => set("pillar", e.target.value as ContentPillar)}
                className="w-full rounded-2xl border border-white/[0.08] bg-[oklch(0.1_0.015_264)] px-5 py-[18px] text-lg leading-[1.45] text-white/85 transition-all focus:border-white/20 focus:outline-none sm:rounded-xl sm:px-3.5 sm:py-2.5 sm:text-sm sm:leading-normal sm:text-white/80"
              >
                {PILLARS.map((p) => (
                  <option key={p.value} value={p.value} className="bg-[oklch(0.1_0.015_264)]">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-3 block text-sm font-semibold uppercase leading-[1.45] tracking-wider text-white/50 sm:mb-2 sm:text-[11px] sm:leading-normal sm:text-white/35">
                Post Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map((s) => {
                  const Icon = s.icon;
                  const active = form.status === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set("status", s.value)}
                      className={`flex min-h-[58px] items-center justify-center gap-2.5 rounded-2xl border py-3 text-base font-semibold leading-[1.4] transition-all sm:min-h-0 sm:gap-2 sm:rounded-xl sm:py-2.5 sm:text-xs sm:font-medium sm:leading-normal ${
                        active
                          ? s.active
                          : "border-white/[0.07] text-white/35 hover:border-white/[0.12] hover:text-white/60"
                      }`}
                    >
                      <Icon className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* Schedule date/time — shown only when status = scheduled */}
              {form.status === "scheduled" && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-3 sm:grid-cols-2 sm:gap-3">
                  <div>
                    <label className="mb-2 block text-sm leading-[1.45] text-white/45 sm:mb-1.5 sm:text-[11px] sm:leading-normal sm:text-white/30">
                      Date <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.scheduledDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => set("scheduledDate", e.target.value)}
                      className={`w-full rounded-2xl border bg-[oklch(0.1_0.015_264)] px-5 py-[18px] text-lg leading-[1.45] text-white/85 transition-all focus:border-white/20 focus:outline-none sm:rounded-xl sm:px-3.5 sm:py-2.5 sm:text-sm sm:leading-normal sm:text-white/80 ${
                        errors.scheduledDate ? "border-rose-500/50" : "border-white/[0.08]"
                      }`}
                    />
                    {errors.scheduledDate && (
                      <p className="mt-2 text-sm leading-[1.45] text-rose-400 sm:mt-1 sm:text-[11px] sm:leading-normal">{errors.scheduledDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm leading-[1.45] text-white/45 sm:mb-1.5 sm:text-[11px] sm:leading-normal sm:text-white/30">Time</label>
                    <input
                      type="time"
                      value={form.scheduledTime}
                      onChange={(e) => set("scheduledTime", e.target.value)}
                      className="w-full rounded-2xl border border-white/[0.08] bg-[oklch(0.1_0.015_264)] px-5 py-[18px] text-lg leading-[1.45] text-white/85 transition-all focus:border-white/20 focus:outline-none sm:rounded-xl sm:px-3.5 sm:py-2.5 sm:text-sm sm:leading-normal sm:text-white/80"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 flex-col gap-5 border-t border-white/[0.07] px-7 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-5 sm:py-4">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-2">
              {form.platforms.map((p) => {
                const cfg = PLATFORMS.find((x) => x.value === p)!;
                return (
                  <Badge
                    key={p}
                    className={`flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm leading-[1.4] sm:h-5 sm:gap-1 sm:px-2 sm:text-[10px] sm:leading-normal ${cfg.badge}`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </Badge>
                );
              })}
            </div>

            <div className="flex items-center gap-3 sm:gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={saving}
                className="h-[52px] flex-1 rounded-2xl px-6 text-base font-semibold text-white/55 hover:bg-white/[0.06] hover:text-white sm:h-8 sm:flex-none sm:rounded-lg sm:px-2.5 sm:text-xs sm:font-medium sm:text-white/40"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className={`h-[52px] flex-1 gap-2.5 rounded-2xl border-0 px-6 text-base font-semibold text-white shadow-lg transition-all disabled:opacity-60 sm:h-8 sm:flex-none sm:gap-1.5 sm:rounded-lg sm:px-2.5 sm:text-xs sm:font-medium ${
                  isEditing
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/25 hover:opacity-90"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/25 hover:opacity-90"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : isEditing ? (
                  <>
                    <PenLine className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                ) : form.status === "scheduled" ? (
                  <>
                    <CalendarDays className="h-3.5 w-3.5" />
                    Schedule Post
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Save Draft
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
