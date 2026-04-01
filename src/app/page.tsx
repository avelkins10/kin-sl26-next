"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface Round {
  label: string;
  dates: string;
  prize: string;
  targets?: { Rookie: number; Veteran: number; Closer: number };
}

interface BloodTier {
  label: string;
  prize: string;
}

interface DropDay {
  day: string;
  date: string;
  prize: string;
}

interface Comp {
  id: string;
  name: string;
  emoji: string;
  logo?: string;
  accent?: string;
  accentSoft?: string;
  btnTextColor?: string;
  group: "monthly" | "summer" | "yearlong";
  tag: string;
  tagClass: string;
  dates: { start: string; end: string };
  subtitle: string;
  metric: string;
  format: string;
  rules: string;
  rounds?: Round[];
  grandPrize?: string;
  grandPrizeCondition?: string;
  leaderboardNote: string;
  dropCalendar?: DropDay[];
  bloodTiers?: BloodTier[];
  tiers?: { setter: number[]; closer: number[] };
  d4wLink?: boolean;
}

interface IgnitionRep {
  name: string;
  role: "Rookie" | "Veteran Setter" | "Closer";
  kca: number;
  kw: number;
  qualified: boolean;
}

interface IgnitionData {
  status?: "not_started" | "ended";
  round?: number;
  roundLabel?: string;
  startDate?: string;
  endDate?: string;
  targets?: { Rookie: number; Veteran: number; Closer: number };
  updatedAt?: string;
  reps?: IgnitionRep[];
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const COMPS: Comp[] = [
  // ── MONTHLY ──
  {
    id: "ignition",
    name: "Ignition",
    emoji: "🔥",
    logo: "ignition-logo.png",
    accent: "#f97316",
    accentSoft: "rgba(249,115,22,0.12)",
    btnTextColor: "#fff",
    group: "monthly",
    tag: "Preseason",
    tagClass: "tag-preseason",
    dates: { start: "2026-04-06", end: "2026-05-03" },
    subtitle: "Hit the threshold, earn the prize.",
    metric: "KCA Count by Role",
    format: "Individual threshold — everyone who qualifies wins.",
    rules: `Ignition is simple: hit your weekly KCA target and you win the prize. That's it. Every rep who qualifies, wins.\n\nEach week is a new round. Each round is independent of each other. Hit the metric each round to unlock the incentive.\n\nYour target is based on your role:\n• Rookie — your first summer with KIN (Rd 1 + Rd 2 = 1 KCA, Rd 3 + Rd 4 = 2 KCA)\n• Veteran Setter — returning setter (Rd 1 + Rd 2 = 3 KCA, Rd 3 + Rd 4 = 4 KCA)\n• Closer — closer role (Rd 1 + Rd 2 = 5 KCA, Rd 3 + Rd 4 = 6 KCA)\n\nTargets increase in Rounds 3 and 4, so start strong.\n\nKCAs are counted using your Sale Date in QuickBase — your deal must reach KCA or Active status within the round window to count. The round window closes at midnight Sunday night.\n\nPrize Distribution\nPrizes ship to your office at the end of each round. Disclaimer*, please allow 2 weeks for prizes to ship. Extenuating circumstances will be communicated.\n\nEligibility\n• Active reps only. You must be an active rep within the round dates.\n• Only deals set and closed (and KCAd) within the round dates will be counted.\n• Cancelled/Deactivated accounts are ineligible.`,
    rounds: [
      { label: "Round 1", dates: "Apr 6–12",     prize: "Anker 621 MagSafe Battery",  targets: { Rookie: 1, Veteran: 3, Closer: 5 } },
      { label: "Round 2", dates: "Apr 13–19",    prize: "New Polo",                    targets: { Rookie: 1, Veteran: 3, Closer: 5 } },
      { label: "Round 3", dates: "Apr 20–26",    prize: "Knocking Hat",                targets: { Rookie: 2, Veteran: 4, Closer: 6 } },
      { label: "Round 4", dates: "Apr 27–May 3", prize: "Short Sleeve Rain Jacket",    targets: { Rookie: 2, Veteran: 4, Closer: 6 } },
    ],
    leaderboardNote: "Live leaderboard coming once Ignition begins (Apr 6).",
  },
  {
    id: "wars",
    name: "Wars",
    emoji: "⚔️",
    logo: "wars-logo.png",
    accent: "#ef4444",
    accentSoft: "rgba(239,68,68,0.12)",
    btnTextColor: "#fff",
    group: "monthly",
    tag: "Monthly",
    tagClass: "tag-monthly",
    dates: { start: "2026-05-04", end: "2026-05-31" },
    subtitle: "Office vs. office — best PRA wins.",
    metric: "PRA (KCAs ÷ Active Reps)",
    format: "Office competition — highest Per Rep Average each round wins. Minimum 10 KCA required to be eligible.",
    rules: `PRA = Total Office KCAs ÷ Active Reps in that office during the round.\n\nTo be eligible for the round prize, an office must have at least 10 KCA during that window.\n\nGrand Prize: The office with the most KCA'd kW for the entire month, who also won at least 1 round, wins a group dinner/activity (~$25/active rep).`,
    rounds: [
      { label: "Round 1", dates: "May 4–10",  prize: "Custom Socks" },
      { label: "Round 2", dates: "May 11–17", prize: "Custom T-Shirt" },
      { label: "Round 3", dates: "May 18–24", prize: "Custom Hat" },
      { label: "Round 4", dates: "May 25–31", prize: "Custom Hoodie" },
    ],
    grandPrize: "Group Dinner/Activity (~$25/active rep)",
    grandPrizeCondition: "Most KCA'd kW in May AND won ≥1 round",
    leaderboardNote: "Live office PRA leaderboard coming May 4.",
  },
  {
    id: "the-drop",
    name: "The Drop",
    emoji: "📦",
    logo: "the-drop-logo.png",
    accent: "#8b5cf6",
    accentSoft: "rgba(139,92,246,0.12)",
    btnTextColor: "#fff",
    group: "monthly",
    tag: "Monthly",
    tagClass: "tag-monthly",
    dates: { start: "2026-06-01", end: "2026-06-27" },
    subtitle: "New prize every day. Will you earn it?",
    metric: "Daily points (setters) / Weekly kW (closers)",
    format: "Daily prizes Mon–Sat for setters. Weekly prizes for closers. Sundays off.",
    rules: `SETTERS — Daily Competition:\nA prize drops every morning (Mon–Sat). Most points on the day wins it.\n• 3-Star Appointment = 1 pt\n• Same-day KCA = 3 pts\nTie? The rep who hit the higher-point action first wins.\n\nCLOSERS — Weekly Competition:\nOne prize per week (Mon–Sun). Most KCA'd kW for the week wins. Prize announced each Monday morning. Closer prize = Saturday's prize for that week (subject to change).`,
    dropCalendar: [
      { day: "Mon", date: "Jun 1",  prize: "Whoop" },
      { day: "Tue", date: "Jun 2",  prize: "Ridge Wallet" },
      { day: "Wed", date: "Jun 3",  prize: "KIN Golfballs" },
      { day: "Thu", date: "Jun 4",  prize: "Pillowcube" },
      { day: "Fri", date: "Jun 5",  prize: "Oakley MetaGlasses" },
      { day: "Sat", date: "Jun 6",  prize: "DJI Nano" },
      { day: "Mon", date: "Jun 9",  prize: "DJI Mics" },
      { day: "Tue", date: "Jun 10", prize: "Sonos Speaker" },
      { day: "Wed", date: "Jun 11", prize: "Sneakers" },
      { day: "Thu", date: "Jun 12", prize: "Exclusive Hoodie" },
      { day: "Fri", date: "Jun 13", prize: "Malbon Driver Cover" },
      { day: "Sat", date: "Jun 14", prize: "Apple Watch" },
      { day: "Mon", date: "Jun 16", prize: "Knocking Shoes" },
      { day: "Tue", date: "Jun 17", prize: "Switch 2" },
      { day: "Wed", date: "Jun 18", prize: "TaylorMade Driver" },
      { day: "Thu", date: "Jun 19", prize: "Ice Pod" },
      { day: "Fri", date: "Jun 20", prize: "Exclusive T-Shirt" },
      { day: "Sat", date: "Jun 21", prize: "ReMarkable Tablet" },
      { day: "Mon", date: "Jun 23", prize: "Plaud AI Pin" },
      { day: "Tue", date: "Jun 24", prize: "Anker Charging Station" },
      { day: "Wed", date: "Jun 25", prize: "Exclusive Skateboard" },
      { day: "Thu", date: "Jun 26", prize: "Airtags" },
      { day: "Fri", date: "Jun 27", prize: "Scotty Cameron Putter" },
      { day: "Sat", date: "Jun 28", prize: "XBOX 1" },
    ],
    leaderboardNote: "Daily leaderboard goes live June 1.",
  },
  {
    id: "supercrown",
    name: "Supercrown",
    emoji: "👑",
    logo: "supercrown-logo.png",
    accent: "#eab308",
    accentSoft: "rgba(234,179,8,0.12)",
    btnTextColor: "#000",
    group: "monthly",
    tag: "Monthly",
    tagClass: "tag-monthly",
    dates: { start: "2026-06-29", end: "2026-08-02" },
    subtitle: "1 setter + 1 closer winner every week.",
    metric: "KCA'd kW",
    format: "Weekly competition — top setter and top closer by KCA'd kW wins each round. Grand prize for best of the full month.",
    rules: `Each week, 1 setter and 1 closer with the most KCA'd kW wins the round prize.\n\nA minimum KCA count is required to win (threshold TBD — will be updated before Supercrown begins).\n\nGrand Prize: Top Setter + Top Closer across the full month (Jun 29–Aug 2) each win a Super 73 eBike (subject to change; minimum threshold also TBD).`,
    rounds: [
      { label: "Round 1", dates: "Jun 29–Jul 5", prize: "Exclusive T-Shirt" },
      { label: "Round 2", dates: "Jul 6–12",     prize: "Exclusive Zip Hoodie" },
      { label: "Round 3", dates: "Jul 13–19",    prize: "Exclusive Shirt" },
      { label: "Round 4", dates: "Jul 20–26",    prize: "Exclusive Sweatsuit" },
      { label: "Round 5", dates: "Jul 27–Aug 2", prize: "Exclusive Windbreaker/Rain Jacket" },
    ],
    grandPrize: "Super 73 eBike (each — setter + closer)",
    grandPrizeCondition: "Top kW for full month (Jun 29–Aug 2) — subject to change",
    leaderboardNote: "Live leaderboard starts June 29.",
  },
  {
    id: "the-throne",
    name: "The Throne",
    emoji: "🪑",
    logo: "the-throne-logo.png",
    accent: "#a855f7",
    accentSoft: "rgba(168,85,247,0.12)",
    btnTextColor: "#fff",
    group: "monthly",
    tag: "Monthly",
    tagClass: "tag-monthly",
    dates: { start: "2026-08-03", end: "2026-08-29" },
    subtitle: "March Madness bracket. D4W-seeded.",
    metric: "D4W Wins (seeding) + weekly matchup score",
    format: "Bracket tournament seeded by D4W wins. Teams compete Mon–Wed and Thu–Sat each week.",
    rules: `SEEDING: Your D4W win total throughout the summer determines your bracket seed. Most wins = #1 seed. Matchups follow March Madness format: 1 vs 8, 2 vs 7, 3 vs 6, 4 vs 5.\n\nROUND STRUCTURE: Each week has two rounds — Mon–Wed and Thu–Sat. Teams compete using the same metrics as D4W (run throughout the summer).\n\nTIEBREAKER: Most wins → then total points, or total KCA'd kW for the month (TBD).\n\nGRAND PRIZE: Winning team earns a team trip valued at ~$300/active rep.`,
    grandPrize: "Team Trip (~$300/active rep)",
    grandPrizeCondition: "Tournament winner",
    leaderboardNote: "Bracket seeds determined by end of D4W season (Aug 2). Bracket revealed Aug 3.",
  },

  // ── SUMMER LONG ──
  {
    id: "kwclub",
    name: "kWclub",
    emoji: "⚡",
    group: "summer",
    tag: "Summer Long",
    tagClass: "tag-summer",
    dates: { start: "2026-04-27", end: "2026-09-12" },
    subtitle: "Stack deals. Unlock gear.",
    metric: "Cumulative deals (TBD)",
    format: "Tiered milestone competition — hit deal thresholds to unlock exclusive gear all summer long.",
    rules: `Unlock gear as you stack deals throughout the summer. Thresholds are cumulative — you're building toward each tier from April 27 through September 12.\n\nSETTERS: Unlock a new polo at 10, 20, 30 deals (and beyond).\nCLOSERS: Unlock at 20, 40 deals (and beyond).\n\nExact metrics are being finalized — this page will update before kWclub begins.`,
    tiers: {
      setter: [10, 20, 30, 40, 50],
      closer: [20, 40, 60, 80, 100],
    },
    leaderboardNote: "Metrics being finalized. Full details coming before Apr 27.",
  },
  {
    id: "the-ten",
    name: "The Ten",
    emoji: "🏅",
    group: "summer",
    tag: "Summer Long",
    tagClass: "tag-summer",
    dates: { start: "2026-04-27", end: "2026-09-12" },
    subtitle: "Top 10 reps. All summer. One trip.",
    metric: "KCA'd kW (cumulative)",
    format: "Three leaderboards — Top 10 Rookies, Top 10 Setters (overall), Top 10 Closers. Rankings accumulate across the entire summer.",
    rules: `Three categories. One goal: be in the top 10 by September 12.\n\nTOP 10 ROOKIES: Rookies only (first summer with KIN). Ranked by cumulative KCA'd kW.\n\nTOP 10 SETTERS: All setters. Ranked by cumulative KCA'd kW.\n\nTOP 10 CLOSERS: All closers. Ranked by cumulative KCA'd kW. (May be Top 5 — TBD.)\n\nPRIZE: Winners in each category earn a trip.`,
    leaderboardNote: "Live leaderboard starts April 27.",
  },
  {
    id: "d4w",
    name: "D4W",
    emoji: "🍽️",
    group: "summer",
    tag: "Summer Long",
    tagClass: "tag-summer",
    dates: { start: "2026-04-27", end: "2026-08-30" },
    subtitle: "Dinners for Winners. 18 weeks of office wars.",
    metric: "Rw/KCA, S/KCA%, KCA, PRA, kW",
    format: "Weekly office head-to-head matchups. 5 metrics, 5 points. 18 rounds across the summer.",
    rules: `D4W is KIN's weekly office competition. Each week, offices go head-to-head in 4 matchups (9 offices, 1 bye per week). 5 points available per matchup — one per metric.\n\n5 METRICS:\n1. Rw/KCA — Rookies with a KCA this week\n2. S/KCA% — Sit-to-KCA conversion %\n3. KCA — Total KCA count\n4. PRA — KCAs ÷ active reps\n5. kW — Total KCA'd kilowatts\n\nD4W win totals seed The Throne bracket in August. Most wins = #1 seed going into August.`,
    d4wLink: true,
    leaderboardNote: "See the full D4W site for live matchups and standings.",
  },

  // ── YEAR LONG ──
  {
    id: "blood-club",
    name: "The Blood Club",
    emoji: "🩸",
    logo: "blood-club-logo.png",
    accent: "#ef4444",
    accentSoft: "rgba(239,68,68,0.12)",
    btnTextColor: "#fff",
    group: "yearlong",
    tag: "Year Long",
    tagClass: "tag-yearlong",
    dates: { start: "2026-01-01", end: "2026-12-31" },
    subtitle: "2 same-day closes on a Saturday. Earn your blood.",
    metric: "Same-day Saturday closes",
    format: "Status earned by achieving same-day closes on a Saturday. Three prize tiers — earn them in order.",
    rules: `QUALIFICATION: A rep earns a Blood Club entry by getting 2 same-day closes on a single Saturday. Rookies only need 1.\n\nSAME-DAY RULE: Both the appointment SET and the deal CLOSED must happen on the same Saturday. Closes from other days do not count, even if submitted later.\n\nPRIZE TIERS (earned in order):\n1st Entry → Blood Polo\n2nd Entry → Blood Hat\n3rd Entry → Blood ¼ Zip Jacket\n\nThis is a year-long competition — Saturdays all year count.`,
    bloodTiers: [
      { label: "1st Entry", prize: "Blood Polo" },
      { label: "2nd Entry", prize: "Blood Hat" },
      { label: "3rd Entry", prize: "Blood ¼ Zip Jacket" },
    ],
    leaderboardNote: "Blood Club member roster tracked throughout the year.",
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getStatus(comp: Comp, now: Date): "active" | "upcoming" | "complete" {
  const start = new Date(comp.dates.start);
  const end = new Date(comp.dates.end);
  if (now >= start && now <= end) return "active";
  if (now < start) return "upcoming";
  return "complete";
}

function statusLabel(s: string): string {
  if (s === "active")   return `<span class="status-active   text-xs font-semibold px-2 py-0.5 rounded-full">LIVE</span>`;
  if (s === "upcoming") return `<span class="status-upcoming text-xs font-semibold px-2 py-0.5 rounded-full">UPCOMING</span>`;
  return                       `<span class="status-complete text-xs font-semibold px-2 py-0.5 rounded-full">DONE</span>`;
}

function daysUntil(dateStr: string, now: Date): string | null {
  const d = new Date(dateStr);
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff > 0) return `Starts in ${diff}d`;
  return null;
}

function daysLeft(dateStr: string, now: Date): string | null {
  const d = new Date(dateStr);
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff > 0) return `${diff}d left`;
  return null;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)}`;
}

function fmt(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─────────────────────────────────────────────
// IGNITION STANDINGS COMPONENT
// ─────────────────────────────────────────────

function IgnitionStandings() {
  const [data, setData] = useState<IgnitionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const ignitionStart = new Date("2026-04-06");
    if (now < ignitionStart) {
      setData({ status: "not_started" });
      setLoading(false);
      return;
    }

    fetch("/api/ignition/standings")
      .then((r) => r.json())
      .then((d: IgnitionData) => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load standings."); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="card p-6 text-center">
        <div className="text-3xl mb-3 animate-pulse">📊</div>
        <div className="font-bold text-white mb-2">Loading standings…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <div className="text-3xl mb-3">⚠️</div>
        <div className="font-bold text-white mb-2">Standings unavailable</div>
        <div className="text-sm text-gray-400">{error}</div>
      </div>
    );
  }

  if (!data || data.status === "not_started") {
    return (
      <div className="card p-6 text-center">
        <div className="text-3xl mb-3">📊</div>
        <div className="font-bold text-white mb-2">Live Standings</div>
        <div className="text-sm text-gray-400">Live leaderboard coming once Ignition begins (Apr 6).</div>
      </div>
    );
  }

  if (data.status === "ended") {
    return (
      <div className="card p-6 text-center">
        <div className="text-3xl mb-3">🏁</div>
        <div className="font-bold text-white mb-2">Ignition Complete</div>
        <div className="text-sm text-gray-400">Season ended May 3.</div>
      </div>
    );
  }

  const roles: Array<"Rookie" | "Veteran Setter" | "Closer"> = ["Rookie", "Veteran Setter", "Closer"];

  return (
    <div className="flex flex-col gap-4">
      {/* Round header */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <div className="font-black text-white text-lg">{data.roundLabel} · {fmt(data.startDate!)}–{fmt(data.endDate!)}</div>
          <div className="text-xs text-gray-500 mt-0.5">Live standings · updates every 15 min</div>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>

      {/* Per-role sections */}
      {roles.map((role) => {
        const reps = (data.reps || []).filter((r) => r.role === role).sort((a, b) => b.kca - a.kca);
        const target = data.targets?.[role === "Veteran Setter" ? "Veteran" : role] ?? 1;

        return (
          <div key={role} className="card p-5">
            <div className="section-header mb-3">{role}</div>
            {reps.length === 0 ? (
              <div className="text-sm text-gray-500 italic">No data yet</div>
            ) : (
              <div className="flex flex-col gap-2">
                {reps.map((rep) => {
                  const pct = Math.min(100, Math.round((rep.kca / target) * 100));
                  return (
                    <div key={rep.name} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-white">{rep.name}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-gray-400">{rep.kca}/{target} KCA</span>
                          {rep.qualified && <span title="Qualified">✅</span>}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {data.updatedAt && (
        <div className="text-xs text-gray-600 text-right">
          Updated {new Date(data.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DETAIL PANEL (reactive)
// ─────────────────────────────────────────────

function StandingsTab({ comp, status }: { comp: Comp; status: string }) {
  if (comp.id === "ignition") {
    return <IgnitionStandings />;
  }
  return (
    <div className="card p-6 text-center">
      <div className="text-3xl mb-3">📊</div>
      <div className="font-bold text-white mb-2">Live Standings</div>
      <div className="text-sm text-gray-400">{comp.leaderboardNote}</div>
      {status === "active" && (
        <div className="mt-4 text-xs text-green-400">🟢 Competition is LIVE — data integration in progress</div>
      )}
    </div>
  );
}

function DetailPanel({ comp, now }: { comp: Comp; now: Date }) {
  const [activeTab, setActiveTab] = useState<"overview" | "prizes" | "standings" | "rules">("overview");
  const status = getStatus(comp, now);

  // Reset tab when comp changes
  useEffect(() => {
    setActiveTab("overview");
  }, [comp.id]);

  return (
    <div className="fade-in">
      {/* Header card */}
      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
              {comp.logo ? (
                <img
                  src={`/${comp.logo}`}
                  alt={comp.name}
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "block";
                  }}
                />
              ) : null}
              <span className="text-4xl" style={{ display: comp.logo ? "none" : "block" }}>{comp.emoji}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-white">{comp.name}</h2>
                <span dangerouslySetInnerHTML={{ __html: statusLabel(status) }} />
              </div>
              <div className="text-gray-400 text-sm mt-1">{comp.subtitle}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><span className="text-gray-600">📅</span> {formatDateRange(comp.dates.start, comp.dates.end)}</div>
          <div className="flex items-center gap-1.5"><span className="text-gray-600">📊</span> {comp.metric}</div>
          <div className="flex items-center gap-1.5"><span className={`${comp.tagClass} px-2 py-0.5 rounded-full font-semibold`}>{comp.tag}</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-6 border-b border-gray-800 px-1">
        {(["overview", "prizes", "standings", "rules"] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab contents */}
      {activeTab === "overview" && <OverviewTab comp={comp} />}
      {activeTab === "prizes"   && <PrizesTab   comp={comp} />}
      {activeTab === "standings"&& <StandingsTab comp={comp} status={status} />}
      {activeTab === "rules"    && (
        <div className="card p-6 fade-in">
          <div className="section-header mb-4">{comp.id === "ignition" ? "Ignition Rules" : "Competition Rules"}</div>
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{comp.rules}</div>
        </div>
      )}
    </div>
  );
}

function OverviewTab({ comp }: { comp: Comp }) {
  if (comp.id === "ignition") {
    return (
      <div className="fade-in">
        <p className="text-sm text-gray-400 mb-4">{comp.format}</p>
        <div className="section-header mb-3">Rounds</div>
        <div className="flex flex-col gap-3">
          {comp.rounds!.map((r) => (
            <div key={r.label} className="card-inner p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-white text-sm">{r.label} <span className="text-gray-500 font-normal">· {r.dates}</span></div>
                <span className="prize-pill">{r.prize}</span>
              </div>
              <div className="flex gap-4">
                {Object.entries(r.targets!).map(([role, n]) => (
                  <div key={role} className="flex-1 text-center">
                    <div className="text-2xl font-black text-white">{n}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{role}</div>
                    <div className="text-xs text-gray-600">KCA</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (comp.id === "wars") {
    return (
      <div className="fade-in">
        <p className="text-sm text-gray-400 mb-4">{comp.format}</p>
        <div className="section-header mb-3">Rounds</div>
        <div className="flex flex-col gap-2 mb-5">
          {comp.rounds!.map((r) => (
            <div key={r.label} className="card-inner p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-sm">{r.label}</div>
                <div className="text-xs text-gray-500">{r.dates}</div>
              </div>
              <span className="prize-pill">{r.prize}</span>
            </div>
          ))}
        </div>
        <div className="card-inner p-4" style={{ borderColor: "rgba(249,115,22,0.2)" }}>
          <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">🏆 Grand Prize</div>
          <div className="font-bold text-white mb-1">{comp.grandPrize}</div>
          <div className="text-xs text-gray-500">{comp.grandPrizeCondition}</div>
        </div>
      </div>
    );
  }

  if (comp.id === "the-drop") {
    return (
      <div className="fade-in">
        <p className="text-sm text-gray-400 mb-4">{comp.format}</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="card-inner p-4">
            <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Setter Scoring</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-300">3-Star Appt</span><span className="font-bold text-white">1 pt</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-300">Same-day KCA</span><span className="font-bold text-green-400">3 pts</span></div>
            </div>
            <div className="text-xs text-gray-600 mt-3">Most points daily wins</div>
          </div>
          <div className="card-inner p-4">
            <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Closer</div>
            <div className="text-sm text-gray-300 mb-1">Most KCA&apos;d kW</div>
            <div className="text-xs text-gray-500">Weekly (Mon–Sun)</div>
            <div className="text-xs text-gray-600 mt-3">1 winner/week</div>
          </div>
        </div>
        <div className="section-header mb-3">Prize Calendar <span className="text-gray-600 font-normal normal-case tracking-normal">(subject to change)</span></div>
        <div className="flex flex-col gap-1.5">
          {comp.dropCalendar!.map((item) => (
            <div key={`${item.day}-${item.date}`} className={`card-inner p-3 flex items-center justify-between ${item.day === "Sat" ? "border-purple-500/20" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 text-center">
                  <div className={`text-xs font-bold ${item.day === "Sat" ? "text-purple-400" : "text-gray-400"}`}>{item.day}</div>
                  <div className="text-xs text-gray-600">{item.date}</div>
                </div>
                <div className="text-sm text-white font-medium">{item.prize}</div>
              </div>
              {item.day === "Sat" && <span className="text-xs text-purple-400 font-semibold">Closer</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (comp.id === "supercrown") {
    return (
      <div className="fade-in">
        <p className="text-sm text-gray-400 mb-4">{comp.format}</p>
        <div className="section-header mb-3">Rounds</div>
        <div className="flex flex-col gap-2 mb-5">
          {comp.rounds!.map((r) => (
            <div key={r.label} className="card-inner p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-sm">{r.label}</div>
                <div className="text-xs text-gray-500">{r.dates}</div>
              </div>
              <div className="text-right">
                <span className="prize-pill">{r.prize}</span>
                <div className="text-xs text-gray-600 mt-1">1 setter + 1 closer</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card-inner p-4" style={{ borderColor: "rgba(249,115,22,0.2)" }}>
          <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">🏆 Grand Prize</div>
          <div className="font-bold text-white mb-1">{comp.grandPrize}</div>
          <div className="text-xs text-gray-500">{comp.grandPrizeCondition}</div>
        </div>
      </div>
    );
  }

  if (comp.id === "the-throne") {
    return (
      <div className="fade-in">
        <p className="text-sm text-gray-400 mb-4">{comp.format}</p>
        <div className="card-inner p-4 mb-4">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Bracket Seeding (D4W Wins)</div>
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4,5,6,7,8].map((n) => (
              <div key={n} className="bracket-match flex items-center justify-between">
                <span className="text-sm font-bold text-gray-300">#{n}</span>
                <span className="vs-badge">vs</span>
                <span className="text-sm font-bold text-gray-300">#{9-n}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-600 mt-3">Seeding determined by D4W wins (Apr 27–Aug 2)</div>
        </div>
        <div className="card-inner p-4 mb-4">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Round Structure</div>
          <div className="flex gap-3">
            <div className="flex-1 text-center p-3 rounded-lg" style={{ background: "#0f1318" }}>
              <div className="font-bold text-white">Mon–Wed</div>
              <div className="text-xs text-gray-500 mt-1">Round 1 each week</div>
            </div>
            <div className="flex-1 text-center p-3 rounded-lg" style={{ background: "#0f1318" }}>
              <div className="font-bold text-white">Thu–Sat</div>
              <div className="text-xs text-gray-500 mt-1">Round 2 each week</div>
            </div>
          </div>
        </div>
        <div className="card-inner p-4" style={{ borderColor: "rgba(249,115,22,0.2)" }}>
          <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">🏆 Grand Prize</div>
          <div className="font-bold text-white mb-1">{comp.grandPrize}</div>
          <div className="text-xs text-gray-500">{comp.grandPrizeCondition}</div>
        </div>
      </div>
    );
  }

  if (comp.id === "kwclub") {
    const icons = ["🟢","🔵","🟣","🟠","🔴"];
    return (
      <div className="fade-in">
        <p className="text-sm text-gray-400 mb-5">{comp.format}</p>
        <div className="section-header mb-3">Setter Tiers</div>
        <div className="flex flex-col gap-2 mb-5">
          {comp.tiers!.setter.map((n, i) => (
            <div key={n} className="kw-tier p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg">{icons[i]}</div>
                <div>
                  <div className="font-semibold text-white text-sm">{n} Deals</div>
                  <div className="text-xs text-gray-500">Setter milestone</div>
                </div>
              </div>
              <span className="prize-pill">Polo Unlock</span>
            </div>
          ))}
        </div>
        <div className="section-header mb-3">Closer Tiers</div>
        <div className="flex flex-col gap-2">
          {comp.tiers!.closer.map((n, i) => (
            <div key={n} className="kw-tier p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg">{icons[i]}</div>
                <div>
                  <div className="font-semibold text-white text-sm">{n} Deals</div>
                  <div className="text-xs text-gray-500">Closer milestone</div>
                </div>
              </div>
              <span className="prize-pill">Polo Unlock</span>
            </div>
          ))}
        </div>
        <div className="mt-4 card-inner p-3 text-xs text-yellow-400/70" style={{ borderColor: "rgba(234,179,8,0.2)" }}>
          ⚠️ Exact metrics being finalized — details will update before Apr 27
        </div>
      </div>
    );
  }

  if (comp.id === "the-ten") {
    const cats = [
      { label: "Top 10 Rookies", icon: "🌱", desc: "First summer with KIN. Ranked by KCA'd kW." },
      { label: "Top 10 Setters", icon: "🚪", desc: "All setters. Ranked by KCA'd kW." },
      { label: "Top 10 Closers", icon: "✍️", desc: "All closers. Ranked by KCA'd kW. (May be Top 5 — TBD.)" },
    ];
    return (
      <div className="fade-in">
        <p className="text-sm text-gray-400 mb-5">{comp.format}</p>
        <div className="flex flex-col gap-3">
          {cats.map((cat) => (
            <div key={cat.label} className="card-inner p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{cat.icon}</div>
                <div className="font-bold text-white">{cat.label}</div>
              </div>
              <div className="text-sm text-gray-400">{cat.desc}</div>
              <div className="mt-3 flex items-center gap-2">
                <span className="prize-pill">Trip Prize</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (comp.id === "d4w") {
    const metrics = [
      { label: "Rw/KCA", desc: "Rookies with a KCA this week" },
      { label: "S/KCA%", desc: "Sit-to-KCA conversion %" },
      { label: "KCA",    desc: "Total KCA count" },
      { label: "PRA",    desc: "KCAs ÷ active reps" },
      { label: "kW",     desc: "Total KCA'd kilowatts" },
    ];
    return (
      <div className="fade-in">
        <p className="text-sm text-gray-400 mb-4">{comp.format}</p>
        <div className="card-inner p-4 mb-4">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">The 5 Metrics</div>
          <div className="flex flex-col gap-2">
            {metrics.map((m, i) => (
              <div key={m.label} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "#0f1318" }}>
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-xs font-bold text-green-400">{i+1}</div>
                <div className="font-semibold text-white text-sm w-16">{m.label}</div>
                <div className="text-xs text-gray-500">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-inner p-4 mb-4 border-green-500/20">
          <div className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-1">🔗 Seeds The Throne</div>
          <div className="text-sm text-gray-300">D4W win totals determine your Throne bracket seed. Most wins = #1 seed going into August.</div>
        </div>
        <button className="block w-full card-inner p-4 text-center font-bold text-green-400 hover:text-green-300 transition-colors" onClick={() => alert("D4W site link — coming soon")}>
          View Full D4W Site →
        </button>
      </div>
    );
  }

  if (comp.id === "blood-club") {
    return (
      <div className="fade-in">
        <p className="text-sm text-gray-400 mb-5">{comp.format}</p>
        <div className="section-header mb-3">Prize Tiers</div>
        <div className="flex flex-col gap-3 mb-5">
          {comp.bloodTiers!.map((tier, i) => (
            <div key={tier.label} className="card-inner p-4 flex items-center gap-4">
              <div className="text-3xl">🩸</div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{tier.label}</div>
                <div className="font-bold text-white mt-0.5">{tier.prize}</div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>{i+1}</div>
            </div>
          ))}
        </div>
        <div className="card-inner p-4" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">The Rule</div>
          <div className="text-sm text-gray-300 leading-relaxed">2 same-day closes on a single <strong className="text-white">Saturday</strong>.<br/>Rookies only need 1.<br/><br/>Both the appointment SET and deal CLOSED must happen the same Saturday.</div>
        </div>
      </div>
    );
  }

  return <div className="text-sm text-gray-400">{comp.format}</div>;
}

const IGNITION_PRIZE_PHOTOS: Record<string, string> = {
  "Round 1": "ignition-r1-anker-battery.png",
  "Round 2": "ignition-r2-polo.png",
  "Round 3": "ignition-r3-hat.png",
  "Round 4": "ignition-r4-rain-jacket.png",
};

function PrizesTab({ comp }: { comp: Comp }) {
  return (
    <div className="card p-6 fade-in">
      {comp.rounds && (
        <>
          <div className="section-header mb-4">Round Prizes</div>
          {/* Ignition: photo cards above each round row */}
          {comp.id === "ignition" ? (
            <div className="flex flex-col gap-4">
              {comp.rounds.map((r, i) => {
                const photo = IGNITION_PRIZE_PHOTOS[r.label];
                return (
                  <div key={r.label}>
                    {photo && (
                      <div className="rounded-xl overflow-hidden mb-2" style={{ background: "#141920", border: "1px solid #1e2530" }}>
                        <img
                          src={`/${photo}`}
                          alt={r.prize}
                          className="w-full object-cover"
                          style={{ maxHeight: "180px", objectPosition: "center" }}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "#141920", border: "1px solid #1e2530" }}>
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-xs font-black text-orange-400">{i+1}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{r.label} · {r.dates}</div>
                      </div>
                      <span className="prize-pill">{r.prize}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {comp.rounds.map((r, i) => (
                <div key={r.label} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "#141920", border: "1px solid #1e2530" }}>
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-xs font-black text-green-400">{i+1}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm">{r.label} · {r.dates}</div>
                  </div>
                  <span className="prize-pill">{r.prize}</span>
                </div>
              ))}
            </div>
          )}
          {comp.grandPrize && (
            <div className="mt-4 p-4 rounded-xl text-center" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
              <div className="text-orange-400 font-black text-lg mb-1">🏆 Grand Prize</div>
              <div className="text-white font-bold text-xl mb-2">{comp.grandPrize}</div>
              <div className="text-gray-400 text-sm">{comp.grandPrizeCondition}</div>
            </div>
          )}
        </>
      )}
      {comp.bloodTiers && (
        <div className="flex flex-col gap-3">
          {comp.bloodTiers.map((t) => (
            <div key={t.label} className="p-4 rounded-xl flex items-center gap-4" style={{ background: "#141920", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div className="text-3xl">🩸</div>
              <div>
                <div className="text-xs text-gray-500">{t.label}</div>
                <div className="font-bold text-white">{t.prize}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {comp.dropCalendar && (
        <>
          <div className="text-sm text-gray-400 mb-4">22 prizes across the month. Subject to change.</div>
          <div className="flex flex-col gap-1.5">
            {comp.dropCalendar.map((item) => (
              <div key={`${item.day}-${item.date}`} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#141920", border: "1px solid #1e2530" }}>
                <div className="text-xs text-gray-500 w-20">{item.day} {item.date}</div>
                <div className="text-sm text-white font-medium">{item.prize}</div>
              </div>
            ))}
          </div>
        </>
      )}
      {comp.tiers && (
        <p className="text-sm text-gray-400">Polo unlocks at each tier milestone. Full prize details coming before Apr 27.</p>
      )}
      {!comp.rounds && !comp.bloodTiers && !comp.dropCalendar && !comp.tiers && (
        <div className="text-sm text-gray-400 leading-relaxed">Prizes for this competition: <strong className="text-white">Trip</strong> for top 10 finishers in each category.</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMP CARD (sidebar)
// ─────────────────────────────────────────────

function CompCard({ comp, now, isActive, onClick }: { comp: Comp; now: Date; isActive: boolean; onClick: () => void }) {
  const status = getStatus(comp, now);
  let sub = "";
  if (status === "upcoming") sub = daysUntil(comp.dates.start, now) || "";
  else if (status === "active") sub = daysLeft(comp.dates.end, now) || "";
  else sub = "Season complete";

  return (
    <div
      className="card comp-card p-4"
      onClick={onClick}
      style={{ borderColor: isActive ? "#22c55e" : undefined }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            {comp.logo ? (
              <img
                src={`/${comp.logo}`}
                alt={comp.name}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = "block";
                }}
              />
            ) : null}
            <span className="text-2xl" style={{ display: comp.logo ? "none" : "block" }}>{comp.emoji}</span>
          </div>
          <div>
            <div className="font-bold text-white text-sm">{comp.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatDateRange(comp.dates.start, comp.dates.end)}</div>
          </div>
        </div>
        <span dangerouslySetInnerHTML={{ __html: statusLabel(status) }} />
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className={`${comp.tagClass} text-xs font-semibold px-2 py-0.5 rounded-full`}>{comp.tag}</span>
        <span className="text-xs text-gray-600">{sub}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function Page() {
  const [now] = useState(() => new Date());
  const [activeCompId, setActiveCompId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "monthly" | "summer" | "yearlong">("all");
  const detailRef = useRef<HTMLDivElement>(null);

  // Auto-open first active or upcoming on mount
  useEffect(() => {
    const active = COMPS.find((c) => getStatus(c, now) === "active");
    const first = active || COMPS.find((c) => getStatus(c, now) === "upcoming") || COMPS[0];
    if (first) setActiveCompId(first.id);
  }, [now]);

  const activeComp = COMPS.find((c) => c.id === activeCompId) ?? null;

  function handleSelectComp(id: string) {
    setActiveCompId(id);
    // Scroll to detail on mobile
    if (window.innerWidth < 768 && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const monthly  = COMPS.filter((c) => c.group === "monthly");
  const summer   = COMPS.filter((c) => c.group === "summer");
  const yearlong = COMPS.filter((c) => c.group === "yearlong");

  const showMonthly  = filter === "all" || filter === "monthly";
  const showSummer   = filter === "all" || filter === "summer";
  const showYearlong = filter === "all" || filter === "yearlong";

  return (
    <>
      <style>{`
        * { font-family: 'Inter', sans-serif; }
        body { background: #080b0f; color: #fff; }

        .card { background: #0f1318; border: 1px solid #1e2530; border-radius: 16px; }
        .card-inner { background: #141920; border: 1px solid #1e2530; border-radius: 12px; }

        .tag-monthly  { background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
        .tag-summer   { background: rgba(249,115,22,0.12); color: #f97316; border: 1px solid rgba(249,115,22,0.2); }
        .tag-yearlong { background: rgba(168,85,247,0.12); color: #a855f7; border: 1px solid rgba(168,85,247,0.2); }
        .tag-preseason{ background: rgba(59,130,246,0.12); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); }

        .status-active   { background: rgba(34,197,94,0.12); color: #22c55e; }
        .status-upcoming { background: rgba(100,116,139,0.12); color: #94a3b8; }
        .status-complete { background: rgba(100,116,139,0.08); color: #64748b; }

        .comp-card { cursor: pointer; transition: all 0.2s ease; }
        .comp-card:hover { border-color: #2d3748; transform: translateY(-1px); }

        .tab-btn { color: #64748b; border-bottom: 2px solid transparent; transition: all 0.2s; padding-bottom: 8px; }
        .tab-btn.active { color: #fff; border-bottom-color: #22c55e; }

        .progress-bar { background: #1e2530; border-radius: 99px; height: 6px; }
        .progress-fill { background: linear-gradient(90deg, #22c55e, #16a34a); border-radius: 99px; height: 6px; transition: width 0.5s ease; }

        .prize-pill { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); color: #f97316; border-radius: 99px; padding: 4px 12px; font-size: 12px; font-weight: 600; display: inline-block; }

        .bracket-match { background: #141920; border: 1px solid #1e2530; border-radius: 8px; padding: 10px 14px; }
        .vs-badge { background: #1e2530; color: #64748b; border-radius: 99px; padding: 2px 8px; font-size: 10px; font-weight: 700; }

        .kw-tier { background: #141920; border: 1px solid #1e2530; border-radius: 10px; }
        .kw-tier.unlocked { border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.04); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 99px; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.25s ease forwards; }

        .kin-logo { font-weight: 900; letter-spacing: -1px; }
        .kin-logo span { color: #22c55e; }

        .nav-item { color: #64748b; font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
        .nav-item:hover, .nav-item.active { color: #fff; background: #141920; }

        .section-header { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #475569; text-transform: uppercase; }

        @media (max-width: 768px) {
          .desktop-layout { flex-direction: column; }
          .sidebar { width: 100% !important; }
          .detail-col { width: 100% !important; }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800/50 backdrop-blur-md" style={{ background: "rgba(8,11,15,0.9)" }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="kin-logo text-xl">kin<span>sight</span>™</div>
            <div className="h-4 w-px bg-gray-700"></div>
            <div className="text-sm text-gray-500 font-medium">Street League 2026</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-600 hidden sm:block">
              {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Nav pills */}
      <div className="border-b border-gray-800/50 sticky top-14 z-40" style={{ background: "rgba(8,11,15,0.95)" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {(["all", "monthly", "summer", "yearlong"] as const).map((f) => (
              <button
                key={f}
                className={`nav-item whitespace-nowrap ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All Competitions" : f === "monthly" ? "Monthly SL26" : f === "summer" ? "Summer Long" : "Year Long"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6 desktop-layout">

          {/* Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0 sidebar">
            {showMonthly && (
              <div className="mb-6">
                <div className="section-header mb-3">Monthly — Street League</div>
                <div className="flex flex-col gap-2">
                  {monthly.map((c) => (
                    <CompCard key={c.id} comp={c} now={now} isActive={activeCompId === c.id} onClick={() => handleSelectComp(c.id)} />
                  ))}
                </div>
              </div>
            )}
            {showSummer && (
              <div className="mb-6">
                <div className="section-header mb-3">Summer Long</div>
                <div className="flex flex-col gap-2">
                  {summer.map((c) => (
                    <CompCard key={c.id} comp={c} now={now} isActive={activeCompId === c.id} onClick={() => handleSelectComp(c.id)} />
                  ))}
                </div>
              </div>
            )}
            {showYearlong && (
              <div className="mb-6">
                <div className="section-header mb-3">Year Long</div>
                <div className="flex flex-col gap-2">
                  {yearlong.map((c) => (
                    <CompCard key={c.id} comp={c} now={now} isActive={activeCompId === c.id} onClick={() => handleSelectComp(c.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="flex-1 detail-col" ref={detailRef}>
            {!activeComp ? (
              <div className="card p-10 flex flex-col items-center justify-center text-center min-h-64">
                <div className="text-4xl mb-4">🏆</div>
                <div className="text-lg font-bold text-white mb-2">Select a competition</div>
                <div className="text-sm text-gray-500">Tap any competition to see leaderboards, prizes, and rules</div>
              </div>
            ) : (
              <DetailPanel key={activeComp.id} comp={activeComp} now={now} />
            )}
          </div>

        </div>
      </div>
    </>
  );
}
