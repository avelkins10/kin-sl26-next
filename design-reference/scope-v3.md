# Dev Scope: KINsight Visual Redesign v3
**Requested by:** Jake Stewart + Matt Gehrke
**Scoped by:** Blaze
**Date:** 2026-04-01
**Priority:** URGENT — Ignition kicks off Apr 6
**Repo:** `/Users/jerrybotkin/kin-sl26-next`
**Live site:** https://kin-sl26-next.vercel.app/
**Status:** ✅ READY FOR DEV — supersedes v2

---

## What Jake Said (verbatim summary)
> "The desktop version is just exactly the same layout and size of the mobile version. For the desktop it should feel like a desktop version of a website, not a desktop displaying a mobile version. I want the functionality to look like [screenshot 1 — the dark two-column layout], but it should be colored like the mobile version [screenshot 2 — light colors]."

**Translation:**
- **Desktop** → two-column layout (sidebar list on left, detail panel on right) — same structure as the old dark site
- **Mobile** → keep the current phone-shell / single-column screen-based flow
- **Colors everywhere** → light (`#F5F5F0` background, white cards) — NO dark mode on either

The v2 phone-shell design is correct for mobile only. On desktop (≥768px) it should expand to the full two-column desktop layout, re-skinned in the light color system.

---

## Changes Required

### Change 1 — Desktop layout: restore two-column, light-themed

On `md:` breakpoint and above, show:
- Left sidebar (fixed ~300px): scrollable competition list grouped by SL26 Monthly / Summer Long / Year Long
- Right detail panel (flex-1): competition detail — overview, prizes, standings, rules tabs
- Full-width light background: `#F5F5F0` or `#e8e8e0`
- NO phone shell, NO max-width 390px cap, NO border-radius phone frame on desktop

**Desktop header (light):**
```
background: #F5F5F0 (or white)
border-bottom: 1px solid rgba(0,0,0,0.08)
```

**Desktop sidebar cards (light):**
```
background: #fff
border: 1.5px solid transparent (active: accent color border)
border-radius: 16px
box-shadow: 0 1px 4px rgba(0,0,0,0.07)
padding: 14px 16px
color: #1a1a1a  (comp name)
color: #aaa     (dates, secondary)
```

**Desktop detail panel (light):**
```
background: transparent (sits on #F5F5F0 page bg)
cards inside: background #fff, border 1px solid rgba(0,0,0,0.08), border-radius: 16px
text: #1a1a1a (headings), #555 (body), #aaa (meta)
```

**Tab bar (detail panel):**
```
border-bottom: 1px solid rgba(0,0,0,0.1)
active tab: border-bottom color = comp.accent
inactive tab: color #999
```

**Status badges (desktop + mobile):**
```
LIVE      → background rgba(34,197,94,0.12); color #16a34a
UPCOMING  → background rgba(0,0,0,0.06);    color #888
SOON/DONE → background rgba(0,0,0,0.04);    color #bbb
```

**Section content (prizes, overview, etc.) on desktop:**
Keep the accent-colored full card style inside the detail panel (same as current — colored bg, white text for content sections). This is correct and Jake confirmed it. Just make sure it sits inside the light detail panel.

---

### Change 2 — Mobile stays phone-shell

Below `md:` breakpoint (< 768px): keep the current phone-shell / 3-screen flow from v2. Light colors, single column, back/close navigation. This is already correct on mobile.

---

### Change 3 — Fix label: "SL28 Programs" → "SL26 Programs"

In the home screen group label, change:
```
"SL28 Programs"  →  "SL26 Programs"
```
Also update the filter nav pill label if it says "SL28" anywhere → "SL26".

The `tag: 'SL28'` fields on each comp object in the data should also be updated to `'SL26'`.

---

### Change 4 — Fix all competition dates (1 day off)

Update COMPS data with the correct dates:

| Competition | Start | End |
|-------------|-------|-----|
| Ignition | 2026-04-06 | 2026-05-03 |
| Wars | 2026-05-04 | 2026-05-31 |
| The Drop | 2026-06-01 | 2026-06-27 |
| Supercrown | 2026-06-29 | 2026-08-01 |
| The Throne | 2026-08-03 | 2026-08-29 |

D4W, kW Club, The Ten, Blood Club dates — leave as-is unless Jake flags them separately.

---

### Change 5 — Replace KINsight header logo with SL26 wordmark

**New logo file:** `/public/sl26-logo.png` (already copied — black bold "STREET LEAGUE / SL26" wordmark on transparent background)

**How Jake wants it implemented:** Replace the current KINsight™ wordmark/symbol in the header with the SL26 logo image. Reference image 2 (the mobile screenshot Jake sent) shows "STREET LEAGUE SL26" as a bold two-line wordmark in the top-left of the header.

**Desktop header:**
```tsx
<img src="/sl26-logo.png" alt="Street League SL26"
     style={{ height: 40, objectFit: "contain" }} />
```

**Mobile header** (phone-shell home screen):
```tsx
<img src="/sl26-logo.png" alt="Street League SL26"
     style={{ height: 36, objectFit: "contain" }} />
```

Remove the `kinsight-symbol` square icon and `KINsight™` text wordmark. Replace entirely with the SL26 logo image.

Keep the "kinsight™" footer watermark at the bottom (small, subtle — that stays).

---

## What Does NOT Change
- All API routes and data logic (standings, QB queries)
- Competition content: rules text, round targets, prize names
- Accent colors and logo PNGs per competition
- Mobile phone-shell behavior below 768px (v2 is correct on mobile)
- Prize photos in Ignition Incentives section
- Blood Club content
- The `IgnitionStandings` fetch/display component

---

## Reference Images
- `design-reference/` folder has the HTML prototype and all assets
- **Image 1** Jake sent (dark two-column layout) = the STRUCTURE to match on desktop
- **Image 2** Jake sent (light phone-shell) = the COLORS to use everywhere
- **Image 3** Jake sent = `sl26-logo.png` already in `/public/` and `design-reference/`

---

## Testing Checklist
1. Desktop (≥768px): two-column layout — sidebar + detail panel — both light colored
2. Desktop: no phone shell visible — full width, no rounded phone frame
3. Desktop: competition sidebar cards are white on `#F5F5F0` bg
4. Desktop: detail panel tabs use competition accent color for active underline
5. Mobile (<768px): phone-shell single-column flow unchanged from v2
6. All screens: label reads "SL26 Programs" (not SL28)
7. All competition tags read "SL26" (not SL28)
8. Ignition dates: Apr 6 – May 3 ✓ | Wars: May 4–31 ✓ | Drop: Jun 1–27 ✓ | Supercrown: Jun 29–Aug 1 ✓ | Throne: Aug 3–29 ✓
9. Header shows SL26 logo image (not KINsight wordmark)
10. Footer still shows "kinsight™" watermark (small/subtle)
11. Screenshot desktop view + mobile view → send to Jake (U04JXLV5MT6) in `#mpdm-matt.gehrke--jakestewart--blaze-1` for final approval

---

## Estimated Dev Effort
~2–3 hours (responsive layout + header swap + data fixes)
