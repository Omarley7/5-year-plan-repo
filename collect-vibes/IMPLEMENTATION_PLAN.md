# Collect Vibes — Implementation Plan

Implements the "Quick Capture" design handoff (`Daily note capture app.zip`) as a new app in this repo at `collect-vibes/`, with two deltas from the handoff:

1. **Sentiment is editable after capture**, in the same inline fashion as tags.
2. **Copy is rewritten** to match what the research taught us about the three capture tags (see "Copy changes" below) — the handoff's microcopy is superseded.

## 1. Stack & file layout

Static HTML app, vanilla JS, CSS variables, no build step:

```
collect-vibes/
  index.html            # entire app: markup, styles, logic
  manifest.json         # PWA manifest (installable, standalone display)
  sw.js                 # service worker: network-first page, cache-first assets
  icon.svg              # app icon source (compass on green, rounded square)
  icon-192.png          # PWA icon
  icon-512.png          # PWA icon (also maskable)
  apple-touch-icon.png  # iOS home-screen icon
  IMPLEMENTATION_PLAN.md
  Dockerfile            # nginx static image, built/pushed by CI
```

Design tokens live in the `:root` block of `index.html` (they match the handoff 1:1: bg, ink, muted, border, like/dislike, tag colors + softs, shadow) and should stay in sync with `livskompas.dk`.

## 2. Data model

```js
// localStorage key: "livskompas-entries"
{ id: string, text: string, sentiment: "like" | "dislike",
  tags: string[],   // subset of ["relationship","aspiration","friction"]
  ts: number }
```

Array is newest-first; persist on every add/edit/delete. `sentiment` is now mutable (was write-once in the prototype). No backend; local-only.

## 3. Copy changes (supersedes handoff copy)

Principle from the research notes: keep the core loop dead simple (type a thing, tap Like or Dislike); tags are optional one-tap seeds for later framework steps, and their wording should say what each capture is *for* — not a mood adjective.

| Element | Handoff copy | New copy |
|---|---|---|
| Relationship tag description | "someone to nurture" | "someone I don't want to lose" |
| Aspiration tag description | "something sparking ideas" | "I'm reaching for something like that" |
| Friction tag description | "something nagging at you" | "this got in the way" |
| Tag picker label | "What kind of moment is this? (optional)" | keep — it already signals optionality |
| Overview intro | "Liked and disliked moments each form their own map…" | "Liked and disliked moments each form a map of who you don't want to lose (Relationship), what you're reaching for (Aspiration), and what got in the way (Friction). Entries with more than one tag float in the overlap; untagged ones sit on the line below. Click an entry to edit its text; hold focus to change its tags or flip like/dislike." |

Rationale, so future edits don't drift back:

- **Relationship** = relationships to *preserve*. People systematically underweight relationships when picturing a good life; this bucket exists to counteract that, so the wording is about not losing someone, not generic nurturing.
- **Aspiration** = *pull*. Captures anchored to a real reaction ("I'm reaching for something like that") feed the future-self exercise later; the wording should point at the pull, not at "ideas".
- **Friction** = the seed of obstacle-naming (WOOP). It's more specific than dislike: not "I don't like this" but "this is what's stopping something" / "this drained me". Wording must name obstruction, not annoyance.
- **No domain taxonomy at capture.** Do not add health/career/finance/etc. categories to this app — clustering into domains happens in the later mapping step. Tags stay optional and minimal; never make them required.

## 4. Build steps

### Step 1 — Capture screen

Per handoff spec (high fidelity, recreate pixel-for-pixel): header with compass logo + "View all" pill; capture card with optional 3-tag multi-select picker (new descriptions above), auto-growing textarea (46px rest → 200px max, maxlength 280, Enter = Like, Shift+Enter = newline), Like/Dislike buttons disabled until non-whitespace text. Submit: trim, prepend entry, persist, clear form, refocus.

### Step 2 — Recent list (with sentiment toggle)

Last 3 entries as specified: colored dot, editable text input (blur saves, empty reverts), relative timestamp, always-visible R/A/F tag toggle chips, ✕ delete.

**New — sentiment editing "in a similar fashion" to tags:** alongside the three tag chips in each row's meta row, render two sentiment chips, **♡ Like** and **✕ Dislike**, styled exactly like tag chips (active = like/dislike color border + soft bg + colored text; inactive = neutral). Exactly one is always active (radio behavior, not toggle-off). Clicking the inactive one flips `entry.sentiment`, persists, and recolors the row's dot. Soft colors: like `#E5F1E9`, dislike `#F7E9E4`.

### Step 3 — Overview screen

Per handoff: max-width 760px, intro paragraph (new copy), two Venn panels (Liked / Disliked), 3 circles r=85 at the specified centers/colors, entries as editable chips positioned by tag-combination region with golden-angle spiral + jitter for collisions, multi-tag gradient chips, General x-axis section for untagged entries (liked above the dashed line, disliked below).

**New — sentiment toggle in the focus popover:** the handoff's focus-within popover shows R/F/A circle buttons + a ✕ delete. Add a fourth control in the same popover row: a small circular **♡/✕ swap button** (title: "Move to Disliked" / "Move to Liked") that flips the entry's sentiment and re-renders — the chip jumps to the other Venn panel (or across the General axis line) immediately, same live-rebucket behavior tags already have.

### Step 4 — Shared behaviors

View switching via local state (no routing). Persistence helper wrapping all mutations. Safe-area insets, flex-wrap responsiveness, ≥44px touch targets — all per handoff.

### Step 5 — Native-app polish (added after initial build)

- **PWA:** manifest + service worker + icons, so the app installs to the home screen and works offline. Page fetches are network-first so deploys are picked up immediately; static assets cache-first.
- **Motion:** load-in rise for header/card/recent, slide transition between capture and overview, pop on the tapped Like/Dislike button, drop-in for the newly added Recent row, staggered fade-in for overview chips, compass-needle settle animation in the logo. All motion is disabled under `prefers-reduced-motion: reduce`.
- **Touch feel:** sticky blurred header, no tap highlight / text-selection on controls, `touch-action: manipulation`, overscroll containment, `maximum-scale=1` to stop iOS input auto-zoom, press-down scale states on every button.
- **Empty state** on the capture screen reflecting the research framing: prompts for relationships (who you don't want to lose), aspiration (what you're reaching for), and friction (what got in the way), plus explicit "a missed day erases nothing" anti-streak wording per the habit-formation research note.

## 5. Deployment

Follows the repo's Docker deployment pattern:

- `collect-vibes/Dockerfile` — nginx:alpine serving `index.html`.
- Root `docker-compose.yml` — local builds (`build: context: ./collect-vibes`).
- `deploy/docker-compose.yml` — production server; pre-built GHCR image only (`ghcr.io/omarley7/collect-vibes:latest`) with `wud.watch=true` and `wud.trigger.include=docker.local` labels so What's Up Docker pulls + restarts on new pushes.
- `.github/workflows/docker-publish.yml` — on push to main, builds `linux/amd64,linux/arm64` via Buildx and pushes to GHCR.

When adding a new service, update all three: the workflow file and both compose files.

## 6. Out of scope

Backend/sync, accounts, domain categories, export, and any link-up with `livskompas.dk` beyond shared tokens. Decide those in a later framework step.

## 7. Verification checklist

- [x] Capture → entry appears in Recent and survives reload (localStorage)
- [x] Enter submits as Like; Shift+Enter newlines; buttons disabled on whitespace-only
- [x] Tag toggle in Recent and in Overview popover re-buckets chips correctly (solo lobe / pairwise overlap / triple center / General)
- [x] Sentiment flip works from Recent chips and Overview popover; chip moves between panels; exactly one sentiment always active
- [x] Edit-then-blur saves; blur-on-empty reverts; delete works in all three surfaces
- [x] All visible copy matches the "Copy changes" table — no handoff phrasing remains
- [x] Mobile width: tag cards wrap, Venn panels stack, safe areas respected
