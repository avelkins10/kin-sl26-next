# Dev Scope: KINsight Visual Redesign v2 — FULL DESIGN SYSTEM
**Requested by:** Jake Stewart + Matt Gehrke
**Scoped by:** Blaze
**Date:** 2026-04-01
**Priority:** URGENT — Ignition kicks off Apr 6
**Repo:** `/Users/jerrybotkin/kin-sl26-next`
**Live site:** https://kin-sl26-next.vercel.app/
**Design reference (source of truth):** `/Users/jerrybotkin/.openclaw/workspace-sales/kinsight/index.html`
**Status:** ✅ READY FOR DEV — supersedes v1 scope

---

## Context — Why v2

The v1 scope only swapped logos. Matt and Jake confirmed the full HTML prototype design needs to be matched: light background, phone-shell layout, white card tiles, accent-colored section content cards with large prize photos, and the full mobile-first screen navigation. This scope covers everything.

---

## Overall Design Direction — HTML Prototype vs Current Next.js

| Element | Current Next.js (dark desktop) | Target (HTML prototype) |
|---------|-------------------------------|------------------------|
| Background | `#080b0f` dark | `#F5F5F0` warm off-white |
| Layout | Two-column desktop sidebar + detail | Single-column mobile-first, centered, max-width 390px |
| Cards | Dark `#0f1318` with dark border | White `#fff` with soft shadow |
| Card inner | `#141920` dark | Light `#F5F5F0` / `rgba(255,255,255,0.12)` inside colored cards |
| Navigation | Tabs + sidebar filter pills | Screen-based: Home → Detail → Section → Back |
| Section content | Tabbed panel | Full-screen colored card (accent color bg, white text) |
| Competition icons | 40px emoji or logo img | 40×40px rounded tile, accent-tint bg, logo with multiply blend |
| Header | Dark sticky bar | Light `#F5F5F0` wordmark header |
| Text colors | White/gray on dark | `#1a1a1a` on light; `#aaa` for secondary |
| Scrollbar | Dark 4px | Light `#ddd` 3px |

---

## Body & Shell

**Replace** the current dark full-width layout with a centered phone-shell:

```css
body {
  font-family: 'Inter', sans-serif;
  background: #e8e8e0;  /* warm gray page bg */
  min-height: 100dvh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

#shell {  /* or the root wrapper */
  width: 100%;
  max-width: 390px;
  min-height: 100dvh;
  background: #F5F5F0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* On wider screens — show as phone */
@media (min-width: 480px) {
  body { padding: 32px 16px; align-items: center; }
  #shell {
    min-height: 820px;
    max-height: 820px;
    border-radius: 44px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12);
    overflow: hidden;
  }
}
```

Remove the current `max-w-6xl` desktop two-column layout entirely. Replace with a single centered column.

---

## Screen-Based Navigation (replace tabs/sidebar)

The HTML prototype uses 3 screens that swap in/out:
1. **Home** — list of all competitions
2. **Detail** — competition selected → logo + 4 section buttons (Rules, Metrics, Incentives, Standings)
3. **Content** — section selected → colored full-screen card with content

React state for this:
```ts
type Screen = "home" | "detail" | "content";
const [screen, setScreen] = useState<Screen>("home");
const [activeComp, setActiveComp] = useState<Comp | null>(null);
const [activeSection, setActiveSection] = useState<string | null>(null);
```

Remove the current tab system (`activeTab` state, `Overview/Prizes/Standings/Rules` tabs) and sidebar `CompCard` component. Replace with the 3-screen pattern below.

---

## Screen 1 — Home

### Header
```tsx
<header style={{ padding: "20px 20px 12px", background: "#F5F5F0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ width: 34, height: 34, background: "#1a1a1a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 900, letterSpacing: -1 }}>正</div>
    <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", letterSpacing: -0.5 }}>KINsight<sup style={{ fontSize: 10, fontWeight: 700 }}>™</sup></div>
  </div>
  <div style={{ fontSize: 12, fontWeight: 500, color: "#aaa" }}>{dateString}</div>
</header>
```

### Group Labels
```css
font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
color: #b0aea8; margin: 20px 0 8px 2px;
```
Labels: `SL28 PROGRAMS` | `SUMMER LONG` | `YEAR LONG`

### Competition Row Card
```css
/* Each row */
background: #fff;
border-radius: 16px;
padding: 14px 16px;
margin-bottom: 8px;
border: 1.5px solid transparent;
box-shadow: 0 1px 4px rgba(0,0,0,0.07);
cursor: pointer;
transition: box-shadow 0.15s, transform 0.1s;

/* Icon tile */
width: 40px; height: 40px;
border-radius: 10px;
overflow: hidden;
background: {comp.accentSoft}  /* e.g. rgba(42,108,160,0.10) */

/* Icon image */
width: 100%; height: 100%; object-fit: contain;
mix-blend-mode: multiply;

/* Comp name */
font-size: 15px; font-weight: 700; color: #1a1a1a;

/* Dates */
font-size: 11px; font-weight: 500; color: #aaa; margin-top: 2px;

/* Tag pill */
font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
background: {comp.accentSoft}; color: {comp.accentText};

/* Status badge */
font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
LIVE    → background: rgba(34,197,94,0.12); color: #16a34a;
UPCOMING→ background: rgba(0,0,0,0.06);    color: #888;
SOON    → background: rgba(0,0,0,0.05);    color: #aaa;
DONE    → background: rgba(0,0,0,0.04);    color: #bbb;

/* Chevron */
color: #ccc; font-size: 18px; margin-left: 6px;
```

### Footer
```tsx
<div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#c8c6c0", letterSpacing: 0.5, padding: "10px 0 18px" }}>
  kinsight<sup style={{ fontSize: 8, verticalAlign: "super" }}>™</sup>
</div>
```

---

## Screen 2 — Competition Detail

Shown when a competition row is tapped.

### Top Bar (back + close)
```tsx
/* Two circular icon buttons */
width: 34px; height: 34px;
border: none; background: rgba(0,0,0,0.07); border-radius: 50%;
font-size: 16px; color: #444; cursor: pointer;
```
Left: `‹` back to home. Right: `✕` close to home.

### Hero Logo Block
```tsx
<div style={{ padding: "18px 24px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
  <div style={{ background: comp.accentSoft, borderRadius: 16, padding: "16px 24px", display: "inline-block" }}>
    <img src={`/${comp.logo}`} alt={comp.name}
         style={{ maxHeight: 68, maxWidth: 260, objectFit: "contain", mixBlendMode: "multiply" }} />
  </div>
</div>
```

### Section Buttons
One large button per section (Rules, Metrics, Incentives, Standings):
```css
border: none;
border-radius: 16px;
padding: 20px 24px;
font-size: 17px; font-weight: 700;
cursor: pointer; text-align: center; color: #fff;
box-shadow: 0 4px 14px rgba(0,0,0,0.14);
background: {comp.accent};  /* full accent color */
color: {comp.btnTextColor || '#fff'};
transition: filter 0.15s;
```
Buttons stacked vertically in a scrollable area.

---

## Screen 3 — Content View (Rules / Metrics / Incentives / Standings)

### Top Bar
Same back/close buttons. Back goes to Detail screen; Close goes to Home.

### Logo + Section Label (above the card)
```tsx
<div style={{ padding: "12px 20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
  <div style={{ background: comp.accentSoft, borderRadius: 12, padding: "8px 18px" }}>
    <img src={`/${comp.logo}`} alt={comp.name}
         style={{ maxHeight: 36, maxWidth: 140, objectFit: "contain", mixBlendMode: "multiply" }} />
  </div>
  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: comp.accent }}>
    {sectionLabel}  {/* e.g. "INCENTIVES" */}
  </div>
</div>
```

### Content Card (full accent-color background)
```css
flex: 1;
overflow-y: auto;
margin: 12px 16px 0;
border-radius: 20px;
padding: 22px 20px;
background: {comp.accent};
color: #fff;
```

**Inside the card — all text is white on the accent background:**
```css
h3  { font-size: 17px; font-weight: 800; margin-bottom: 12px; }
p   { font-size: 14px; line-height: 1.65; opacity: 0.92; margin-bottom: 10px; }
ul  { padding-left: 18px; }
li  { font-size: 14px; line-height: 1.65; opacity: 0.92; margin-bottom: 5px; }
```

---

## Incentives Content — Prize Photo Cards

Inside the accent-color content card for Ignition incentives:

```css
/* Round block wrapper */
background: rgba(255,255,255,0.12);
border-radius: 12px;
padding: 14px;
margin-bottom: 10px;

/* Round header row */
.round-label { font-size: 14px; font-weight: 700; color: #fff; }
.round-dates { font-size: 12px; opacity: 0.7; color: #fff; }
.round-prize-pill {
  font-size: 11px; font-weight: 700;
  background: rgba(255,255,255,0.2);
  padding: 3px 10px; border-radius: 20px; color: #fff;
}

/* Prize photo */
width: 100%; max-height: 180px; object-fit: contain;
border-radius: 10px; display: block; margin: 10px 0;

/* Prize name below photo */
font-size: 14px; font-weight: 700; text-align: center; color: #fff;
```

**Prize photo file map (all in `/public/`):**
- Round 1 → `ignition-r1-anker-battery.png`
- Round 2 → `ignition-r2-polo.png`
- Round 3 → `ignition-r3-hat.png`
- Round 4 → `ignition-r4-rain-jacket.png`

---

## Target Chips (inside Metrics section)

```css
/* Row of 3 chips: Rookie / Veteran / Closer */
.target-chip {
  flex: 1; text-align: center;
  background: rgba(255,255,255,0.1);
  border-radius: 8px; padding: 8px 4px;
}
.target-num  { font-size: 22px; font-weight: 900; color: #fff; }
.target-role { font-size: 10px; opacity: 0.7; color: #fff; margin-top: 1px; }
.target-unit { font-size: 10px; opacity: 0.5; color: #fff; }
```

---

## Standings Table (inside Standings section)

```css
.standings-table th {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px;
  color: rgba(255,255,255,0.55); text-align: left;
  padding: 0 0 8px; border-bottom: 1px solid rgba(255,255,255,0.15);
}
.standings-table td { padding: 9px 0; font-size: 13px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); }

/* Rank badges */
#1 → background: #f5c842; color: #1a1a1a; (gold)
#2 → background: #c0c0c0; color: #1a1a1a; (silver)
#3 → background: #cd7f32; color: #fff;    (bronze)
#N → background: rgba(255,255,255,0.15); color: #fff;
```

---

## Competition Theme Data (complete — all comps)

```ts
// Ignition
accent: '#2a6ca0', accentSoft: 'rgba(42,108,160,0.10)', accentText: '#2a6ca0',
logo: 'ignition-logo.png', tag: 'SL28'

// Wars
accent: '#d2fa06', accentSoft: 'rgba(210,250,6,0.18)', accentText: '#5a6b00',
logo: 'wars-logo.png', tag: 'SL28', btnTextColor: '#1a1a1a'

// The Drop
accent: '#db08f9', accentSoft: 'rgba(219,8,249,0.10)', accentText: '#9600b0',
logo: 'the-drop-logo.png', tag: 'SL28'

// Supercrown
accent: '#bce9c8', accentSoft: 'rgba(188,233,200,0.25)', accentText: '#1e7a40',
logo: 'supercrown-logo.png', tag: 'SL28', btnTextColor: '#1a1a1a'

// The Throne
accent: '#e64d57', accentSoft: 'rgba(230,77,87,0.10)', accentText: '#b82832',
logo: 'the-throne-logo.png', tag: 'SL28'

// D4W
accent: '#b45309', accentSoft: 'rgba(180,83,9,0.10)', accentText: '#b45309',
logo: null, tag: 'Summer Long'

// kW Club
accent: '#15803d', accentSoft: 'rgba(21,128,61,0.10)', accentText: '#15803d',
logo: null, tag: 'Summer Long'

// The Ten
accent: '#0369a1', accentSoft: 'rgba(3,105,161,0.10)', accentText: '#0369a1',
logo: null, tag: 'Summer Long'

// Blood Club
accent: '#b91c1c', accentSoft: 'rgba(185,28,28,0.10)', accentText: '#b91c1c',
logo: 'blood-club-logo.png', tag: 'Year Long'
```

---

## Scrollbar
```css
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #ddd; border-radius: 99px; }
```

---

## What Does NOT Change
- All API routes (`/api/ignition/standings/route.ts`) — untouched
- All competition data (dates, rules text, round targets, prizes)
- Score calculations, standings logic, QB/RepCard queries
- `layout.tsx` and font imports
- The `IgnitionStandings` fetch/display logic — just re-skin it to fit the new accent-card style

---

## Section Labels Mapping (HTML → Next.js)
| HTML label | Current Next.js tab |
|------------|-------------------|
| Rules | Rules |
| Metrics | Overview (rename to Metrics) |
| Incentives | Prizes (rename to Incentives) |
| Standings | Standings |

---

## Testing Checklist
1. Home screen — `#F5F5F0` light background, white cards, accent-tint logo tiles for all 6 branded comps
2. Tap any comp → detail screen shows logo hero + 4 full-width accent-color buttons
3. Tap a section → full-screen accent-color card, white text
4. Ignition Incentives → 4 prize photo cards inside blue content card
5. Ignition Metrics → round blocks with target chips (Rookie/Veteran/Closer)
6. Ignition Standings → table with gold/silver/bronze rank badges (or "not started" state)
7. Wars/Drop/Supercrown/Throne/Blood Club → each shows their accent color correctly on detail + content screens
8. D4W / kW Club / The Ten → emoji fallback, accent color still applies to buttons and content card
9. Phone shell visible on desktop (centered, rounded corners, `max-width: 390px`)
10. Screenshot full flow (Home → Ignition detail → Incentives) → send to Jake for final approval before merge

---

## Estimated Dev Effort
~4–6 hours (full layout + navigation pattern redesign, new CSS system, no logic changes)

---

## Deployment
After Jake approves screenshots, merge to main. Vercel auto-deploys.
Screenshot confirmation required from Jake (Slack: U04JXLV5MT6) in `#mpdm-matt.gehrke--jakestewart--blaze-1`.
