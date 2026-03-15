
# CapSync — Full Feature Upgrade Plan

## Overview

The goal is to transform the current static mock UI into a feature-rich, polished SaaS platform. Given the constraints of a pure React/Vite/Tailwind stack (no real backend yet), the features will be implemented as high-fidelity UI with realistic simulated interactions and streaming animations. Features requiring a true backend (auth, vector DB, real AI) are architected as ready-to-connect stubs.

The 18 features are grouped into logical implementation batches across multiple new pages and components.

---

## Architecture & New Routes

```text
/ ─────────────────── Landing Page (enhanced with new sections)
/generate ────────────── Caption Generator (upgraded with streaming + editor)
/dashboard ───────────── Caption History + Analytics Dashboard
/editor ──────────────── Smart Writing Workspace (doc-style editor)
/templates ───────────── Prompt Templates Marketplace
/second-brain ────────── AI Second Brain / Knowledge Base
/analytics ───────────── Writing Analytics Dashboard
```

**New Navbar links:** Home · Generate · Editor · Templates · Dashboard · Brain

---

## Feature Groups & Implementation Details

### Group 1 — Generate Page Overhaul (Features 1, 2, 4, 7, 13, 18)

**File: `src/pages/GeneratePage.tsx`** (complete rewrite)

#### Feature 1 — Real-Time Streaming Output
- Replace static dump with a character-by-character typing animation using `setInterval` + `useState`
- Each caption card streams in token-by-token with a blinking cursor
- "Regenerate this caption" button per card (not full-page regenerate)
- Inline editing: clicking on caption text turns it into a `contenteditable` div with a save/cancel micro-interaction

#### Feature 7 — AI Writing Analytics (per caption)
- Each caption card shows an analytics chip row:
  - Readability score (Flesch-style, simulated)
  - Emotional tone tag (e.g. "Inspiring", "Playful")
  - Keyword density badge
  - Engagement prediction bar

#### Feature 13 — Fact-Check / Mode Toggle
- Toggle switch in the input panel: **Creative Mode** vs **Research Mode**
- In Research Mode: output captions include "Sources" section with placeholder citation chips and a "confidence" badge
- Uncertain sentences highlighted in amber

#### Feature 18 — Micro-Interactions & Delight
- Confetti burst on first successful generation (using CSS keyframe + particles)
- Hover glow effects on caption cards already exist — enhance with scale transform
- AI avatar (animated Sparkles icon with pulse ring) in generating state
- Smooth enter/exit transitions for all caption cards via `AnimatePresence`

#### Feature 2 — AI Memory / Style Profile (UI layer)
- Collapsible "Your Writing Style" panel in input sidebar
- Shows detected tone profile: "You tend to write: Bold · Motivational"
- "Write like my previous posts" toggle button
- Persisted to `localStorage` for session continuity

---

### Group 2 — Smart Editor Page (Features 4, 6, 9, 10, 12)

**New file: `src/pages/EditorPage.tsx`**

#### Feature 4 — Multi-Mode Writing Workspace
- Full-width document-style editor with `contenteditable` div (styled like Google Docs)
- Floating toolbar appears on text selection: **Rewrite | Expand | Shorten | Tone ↕**
- Tone slider (Formal ↔ Casual) and Creativity slider using Radix `<Slider>`
- AI inline suggestion ghost text (simulated typing after pause)
- Sidebar panel for AI context: platform, tone, goal

#### Feature 6 — Voice Integration
- "Voice Input" button using `window.SpeechRecognition` Web API (no API key needed)
- Live transcript display as user speaks
- "Read Aloud" button using `window.speechSynthesis` Web API
- Voice style selector: Podcast / Narrator / Storyteller (changes pitch/rate)

#### Feature 9 — Auto-Workflow Builder (visual)
- Drag-and-drop node canvas using pure CSS + mouse events (no external lib needed)
- Pre-built workflow nodes: Prompt → Summarize → Convert → Translate → Export
- Node connections visualized with SVG lines
- "Run Workflow" button animates through nodes sequentially

#### Feature 10 — Smart Export Engine
- Export modal with format selector: Blog HTML · Markdown · LinkedIn · Twitter Thread · Instagram Pack · Email Newsletter
- Platform-specific formatting applied (e.g., Twitter thread splits at 280 chars)
- Download as `.txt` / `.md` / `.html` using `Blob` + `URL.createObjectURL`

#### Feature 12 — Context-Aware Sidebar Assistant
- Collapsible right sidebar that follows cursor position
- "Improve clarity" suggestion chips appear on hover over paragraphs
- AI feedback panel: "This sentence could be clearer — click to rewrite"

---

### Group 3 — Templates Marketplace (Feature 5)

**New file: `src/pages/TemplatesPage.tsx`**

- Grid of template cards with category filters (Marketing · Educational · Personal · Storytelling)
- Each card: title, description, use count, star rating, author avatar
- "Use Template" loads it into the Generate page
- "Save Template" stores to `localStorage`
- Search bar + sort (Trending / Newest / Top Rated)
- "Fork" button copies template for editing

---

### Group 4 — Dashboard (Features 3, 5, 15, 16)

**New file: `src/pages/DashboardPage.tsx`**

#### Feature 15 — Usage Intelligence
- Productivity heatmap (contribution-graph style, pure CSS grid)
- Stats: Total captions, Most used tone, Platform breakdown
- Writing speed chart (simulated line graph using inline SVG or simple div bars)
- Prompt type breakdown (pie chart using inline SVG arcs)

#### Feature 16 — AI Second Brain
- Tab: "Saved Drafts" — list of saved incomplete captions from `localStorage`
- Tab: "Ideas" — free-form note cards, add/delete ideas
- "Connect Ideas" button: AI suggests how two saved ideas relate (simulated)
- Topic suggestion panel: "Based on your notes, try writing about: [X, Y, Z]"

#### Feature 3 — Document-Aware (RAG UI)
- Upload area for PDF/doc with drag-drop styling
- After upload: shows document summary card + Q&A input
- "Generate captions from this document" button
- Simulated RAG response showing highlighted source excerpt

---

### Group 5 — AI Collaboration Mode (Feature 8)

**New section in DashboardPage or standalone modal**

- "Share Session" button generates a fake shareable link
- Live collaborators panel with avatar bubbles and typing indicators
- Comment mode: highlight text → add comment sidebar
- AI suggestion panel visible to all "collaborators"

---

### Group 6 — AI Agent Mode (Feature 17)

**New component: `src/components/AgentMode.tsx`** (used in GeneratePage)

- Toggle: **Simple Mode** vs **Agent Mode**
- In Agent Mode: user enters a long task (e.g., "Research 5 competitors and write a comparison blog")
- AI breaks it into steps with animated step-by-step execution display
- "Thinking..." step shows with animated dots
- Each step completes with a checkmark before moving to next
- Final output assembled from all steps

---

### Group 7 — AI Personas (Feature 11)

**New component: `src/components/PersonaSelector.tsx`**

- Persona cards: Startup Founder · Technical Educator · Gen Z Creator · Academic Researcher · Custom
- Each persona has a style description and example output
- Selected persona persists and influences tone in Generate page
- "Train on my writing" upload area for sample text

---

### Group 8 — Adaptive UI & Dark Mode Enhancement (Feature 14)

**Updates to `src/index.css` and `tailwind.config.ts`**

- Task-based layout modes: **Writing Mode** (full-width, minimal UI), **Brainstorm Mode** (card grid), **Focus Mode** (hides sidebar)
- Minimal distraction mode: hides navbar + sidebar, only editor visible
- Mode switcher in navbar with smooth CSS transitions

---

### Group 9 — Landing Page Enhancements

**Updates to `src/pages/Index.tsx`**

- Add a "How It Works" 3-step visual section
- Add new feature cards for: Smart Editor, Templates, Agent Mode, Voice Input
- Add a Pricing section with Free / Pro / Team tiers (visual only)
- Add testimonials/social proof strip
- Animated stat counters (10k+ creators, 500k+ captions, etc.)

---

### Group 10 — Navbar & Navigation Upgrade

**Updates to `src/components/Navbar.tsx`**

- Expand to include nav links: Generate · Editor · Templates · Dashboard
- Mobile hamburger menu (Sheet from Radix UI)
- Active route highlighting with animated underline indicator

---

## New Files to Create

| File | Purpose |
|---|---|
| `src/pages/EditorPage.tsx` | Smart writing workspace |
| `src/pages/TemplatesPage.tsx` | Prompt templates marketplace |
| `src/pages/DashboardPage.tsx` | History, analytics, second brain |
| `src/components/AgentMode.tsx` | AI agent step-by-step task execution |
| `src/components/PersonaSelector.tsx` | AI persona switcher |
| `src/components/StreamingCaption.tsx` | Token-by-token streaming caption card |
| `src/components/ExportModal.tsx` | Smart export engine modal |
| `src/components/WritingAnalytics.tsx` | Per-caption analytics chips |
| `src/components/WorkflowBuilder.tsx` | Visual workflow node builder |
| `src/components/VoiceInput.tsx` | Voice recording + TTS component |
| `src/components/CollaborationPanel.tsx` | Realtime collab UI (simulated) |

## Files to Modify

| File | Changes |
|---|---|
| `src/App.tsx` | Add new routes |
| `src/components/Navbar.tsx` | Add nav links + mobile menu |
| `src/pages/GeneratePage.tsx` | Full rewrite with streaming, agent mode, analytics |
| `src/pages/Index.tsx` | Add new landing sections |
| `src/index.css` | Add adaptive mode classes, confetti animation |
| `tailwind.config.ts` | Add new animation keyframes |

---

## Implementation Order

1. Update `tailwind.config.ts` + `src/index.css` with new animations and mode classes
2. Rewrite `src/pages/GeneratePage.tsx` (streaming, analytics, agent mode, personas)
3. Create `src/pages/EditorPage.tsx` (writing workspace, voice, export, workflow)
4. Create `src/pages/TemplatesPage.tsx` (marketplace)
5. Create `src/pages/DashboardPage.tsx` (analytics, second brain, history)
6. Create all supporting components
7. Update `src/components/Navbar.tsx` with new links + mobile menu
8. Update `src/pages/Index.tsx` with new landing sections
9. Wire all new routes in `src/App.tsx`

All features use only existing dependencies (React, Framer Motion, Tailwind, Radix UI, Lucide icons) — no new packages required.
