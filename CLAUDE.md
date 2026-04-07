@AGENTS.md

# AI Club Content Dashboard

A content management platform for the AI Club, built with Next.js, Tailwind CSS v4, and shadcn/ui.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Icons**: lucide-react
- **Language**: TypeScript

## Project Structure

```
src/
  app/
    layout.tsx          # Root layout (dark class, TooltipProvider, metadata)
    page.tsx            # Redirects to /dashboard
    globals.css         # Design tokens (OKLCH colors), utility classes
    dashboard/
      layout.tsx        # Sidebar + main area shell
      page.tsx          # Overview / home
      instagram/page.tsx
      analytics/page.tsx
      calendar/page.tsx
      competitors/page.tsx
      news/page.tsx
  components/
    sidebar.tsx         # Fixed sidebar with nav items + user footer
    stat-card.tsx       # Metric card with icon, value, trend
    page-header.tsx     # Consistent page title + action slot
    section-card.tsx    # Bordered card with optional header/actions
    ui/                 # shadcn/ui primitives
```

## Design System

### Colors (OKLCH)
- **Background**: `oklch(0.08 0.01 264)` — deep dark blue-gray
- **Card**: `oklch(0.11 0.015 264)` — slightly lighter surface
- **Primary**: `oklch(0.65 0.22 270)` — purple
- **Gradients**: blue → purple → cyan (AI club branding)

### Key CSS Classes
- `.gradient-text` — blue/purple/cyan gradient text
- `.gradient-border` — gradient border via pseudo-element mask
- `.glow-blue / .glow-purple / .glow-cyan` — ambient glow shadows

### Component Patterns
- All pages follow: `PageHeader` → `StatCard` grid → `SectionCard` content
- Hover states use `border-white/[0.1]` and `bg-white/[0.04]` lifts
- Badges use low-opacity color tints: `bg-emerald-500/15 text-emerald-400`

## Dashboard Sections

| Section | Route | Description |
|---|---|---|
| Overview | `/dashboard` | Stats summary, quick access, activity feed |
| Instagram Manager | `/dashboard/instagram` | Post scheduler, queue, performance |
| Analytics | `/dashboard/analytics` | Reach, engagement, audience demographics |
| Content Calendar | `/dashboard/calendar` | Monthly view, upcoming content, gap detection |
| Competitor Tracker | `/dashboard/competitors` | Rival account monitoring + AI insights |
| News Consolidator | `/dashboard/news` | Curated AI/tech news by category |

## Development

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint check
```

## Conventions

- All pages are **server components** (no `"use client"` unless required)
- `"use client"` is only used in `sidebar.tsx` (for `usePathname`)
- Data is currently **static/mock** — ready for API integration
- Tailwind classes prefer inline `bg-white/[0.06]` style opacity for precision
