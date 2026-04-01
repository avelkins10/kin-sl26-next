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

interface CompTheme {
  accent: string;
  accentSoft: string;
  accentText: string;
  tag: string;
  logo: string | null;
  logoAlt?: string;
  btnTextColor?: string;
}

interface Comp {
  id: string;
  name: string;
  emoji: string;
  group: "sl28" | "summer" | "yearlong";
  stub: boolean;
  dates: { start: string; end: string };
  subtitle: string;
  theme: CompTheme;
  rounds?: Round[];
  bloodTiers?: { label: string; prize: string }[];
  dropCalendar?: { day: string; date: string; prize: string }[];
  tiers?: { setter: number[]; closer: number[] };
  rules?: string;
}

type Screen = "home" | "detail" | "content" | "soon";
type SectionKey = "rules" | "metrics" | "incentives" | "standings";

// ─────────────────────────────────────────────
// COMPETITION DATA
// ─────────────────────────────────────────────

const COMPS: Comp[] = [
  // ── SL28 ──
  {
    id: "ignition",
    name: "Ignition",
    emoji: "🏁",
    group: "sl28",
    stub: false,
    dates: { start: "2026-04-06", end: "2026-05-03" },
    subtitle: "Hit the threshold. Earn the prize.",
    theme: {
      accent: "#2a6ca0",
      accentSoft: "rgba(42,108,160,0.10)",
      accentText: "#2a6ca0",
      tag: "SL28",
      logo: "ignition-logo.png",
      logoAlt: "Ignition",
    },
    rounds: [
      { label: "Round 1", dates: "Apr 6–12",     prize: "Anker 621 MagSafe Battery",  targets: { Rookie: 1, Veteran: 3, Closer: 5 } },
      { label: "Round 2", dates: "Apr 13–19",    prize: "New Polo",                    targets: { Rookie: 1, Veteran: 3, Closer: 5 } },
      { label: "Round 3", dates: "Apr 20–26",    prize: "Knocking Hat",                targets: { Rookie: 2, Veteran: 4, Closer: 6 } },
      { label: "Round 4", dates: "Apr 27–May 3", prize: "Short Sleeve Rain Jacket",    targets: { Rookie: 2, Veteran: 4, Closer: 6 } },
    ],
    rules: `Ignition is simple: hit your weekly KCA target and you win the prize. Every rep who qualifies wins.\n\nEach week is a new round. Each round is independent. Hit the metric each round to unlock the incentive.\n\nYour target is based on your role:\n• Rookie — your first summer with KIN\n• Veteran Setter — returning setter\n• Closer — closer role\n\nKCAs are counted using your Sale Date in QuickBase — your deal must reach KCA or Active status within the round window.\n\nPrize Distribution: Prizes ship to your office at the end of each round. Please allow 2 weeks for prizes to ship.\n\nEligibility: Active reps only. Only deals set and closed within the round dates count. Cancelled/Deactivated accounts are ineligible.`,
  },
  {
    id: "wars",
    name: "Wars",
    emoji: "⚔️",
    group: "sl28",
    stub: true,
    dates: { start: "2026-05-04", end: "2026-05-31" },
    subtitle: "Office vs. office — best PRA wins.",
    theme: {
      accent: "#d2fa06",
      accentSoft: "rgba(210,250,6,0.18)",
      accentText: "#5a6b00",
      tag: "SL28",
      logo: "wars-logo.png",
      logoAlt: "Wars",
      btnTextColor: "#1a1a1a",
    },
  },
  {
    id: "the-drop",
    name: "The Drop",
    emoji: "📦",
    group: "sl28",
    stub: true,
    dates: { start: "2026-06-01", end: "2026-06-27" },
    subtitle: "New prize every day. Will you earn it?",
    theme: {
      accent: "#db08f9",
      accentSoft: "rgba(219,8,249,0.10)",
      accentText: "#9600b0",
      tag: "SL28",
      logo: "the-drop-logo.png",
      logoAlt: "The Drop",
    },
  },
  {
    id: "supercrown",
    name: "Supercrown",
    emoji: "👑",
    group: "sl28",
    stub: true,
    dates: { start: "2026-06-29", end: "2026-08-02" },
    subtitle: "1 setter + 1 closer winner every week.",
    theme: {
      accent: "#bce9c8",
      accentSoft: "rgba(188,233,200,0.25)",
      accentText: "#1e7a40",
      tag: "SL28",
      logo: "supercrown-logo.png",
      logoAlt: "Supercrown",
      btnTextColor: "#1a1a1a",
    },
  },
  {
    id: "the-throne",
    name: "The Throne",
    emoji: "🪑",
    group: "sl28",
    stub: true,
    dates: { start: "2026-08-03", end: "2026-08-29" },
    subtitle: "March Madness bracket. D4W-seeded.",
    theme: {
      accent: "#e64d57",
      accentSoft: "rgba(230,77,87,0.10)",
      accentText: "#b82832",
      tag: "SL28",
      logo: "the-throne-logo.png",
      logoAlt: "The Throne",
    },
  },
  // ── SUMMER LONG ──
  {
    id: "d4w",
    name: "D4W",
    emoji: "🍽️",
    group: "summer",
    stub: true,
    dates: { start: "2026-04-27", end: "2026-08-30" },
    subtitle: "Dinners for Winners. 18 weeks.",
    theme: {
      accent: "#b45309",
      accentSoft: "rgba(180,83,9,0.10)",
      accentText: "#b45309",
      tag: "Summer Long",
      logo: null,
    },
  },
  {
    id: "kwclub",
    name: "kW Club",
    emoji: "⚡",
    group: "summer",
    stub: true,
    dates: { start: "2026-04-27", end: "2026-09-12" },
    subtitle: "Stack deals. Unlock gear.",
    theme: {
      accent: "#15803d",
      accentSoft: "rgba(21,128,61,0.10)",
      accentText: "#15803d",
      tag: "Summer Long",
      logo: null,
    },
  },
  {
    id: "the-ten",
    name: "The Ten",
    emoji: "🏅",
    group: "summer",
    stub: true,
    dates: { start: "2026-04-27", end: "2026-09-12" },
    subtitle: "Top 10 reps. All summer. One trip.",
    theme: {
      accent: "#0369a1",
      accentSoft: "rgba(3,105,161,0.10)",
      accentText: "#0369a1",
      tag: "Summer Long",
      logo: null,
    },
  },
  // ── YEAR LONG ──
  {
    id: "blood-club",
    name: "Blood Club",
    emoji: "🩸",
    group: "yearlong",
    stub: false,
    dates: { start: "2026-01-01", end: "2026-12-31" },
    subtitle: "2 same-day closes on a Saturday.",
    theme: {
      accent: "#b91c1c",
      accentSoft: "rgba(185,28,28,0.10)",
      accentText: "#b91c1c",
      tag: "Year Long",
      logo: "blood-club-logo.png",
      logoAlt: "Blood Club",
    },
    bloodTiers: [
      { label: "1st Entry", prize: "Blood Polo" },
      { label: "2nd Entry", prize: "Blood Hat" },
      { label: "3rd Entry", prize: "Blood ¼ Zip Jacket" },
    ],
  },
];

const IGNITION_PRIZE_PHOTOS: Record<string, string> = {
  "Round 1": "ignition-r1-anker-battery.png",
  "Round 2": "ignition-r2-polo.png",
  "Round 3": "ignition-r3-hat.png",
  "Round 4": "ignition-r4-rain-jacket.png",
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getStatus(comp: Comp, now: Date): "live" | "upcoming" | "done" {
  const s = new Date(comp.dates.start);
  const e = new Date(comp.dates.end);
  if (now >= s && now <= e) return "live";
  if (now < s) return "upcoming";
  return "done";
}

function fmtRange(start: string, end: string): string {
  const o: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${new Date(start).toLocaleDateString("en-US", o)} – ${new Date(end).toLocaleDateString("en-US", o)}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function daysNote(comp: Comp, now: Date): string {
  if (comp.stub) return "Coming Soon";
  const status = getStatus(comp, now);
  if (status === "done") return "Complete";
  const target = status === "live" ? comp.dates.end : comp.dates.start;
  const d = Math.ceil((new Date(target).getTime() - now.getTime()) / 86400000);
  if (status === "live") return `${d}d left`;
  if (status === "upcoming") return d > 0 ? `Starts in ${d}d` : "Starting soon";
  return "";
}

// ─────────────────────────────────────────────
// IGNITION STANDINGS (live fetch)
// ─────────────────────────────────────────────

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

function fmt(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function IgnitionStandingsContent({ accent }: { accent: string }) {
  const [data, setData] = useState<IgnitionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    if (now < new Date("2026-04-06")) {
      setData({ status: "not_started" });
      setLoading(false);
      return;
    }
    fetch("/api/ignition/standings")
      .then((r) => r.json())
      .then((d: IgnitionData) => { setData(d); setLoading(false); })
      .catch(() => { setData({ status: "not_started" }); setLoading(false); });
  }, []);

  if (loading) {
    return <p style={{ opacity: 0.7, fontSize: 14 }}>Loading standings…</p>;
  }

  if (!data || data.status === "not_started") {
    return (
      <>
        <h3>Live Standings</h3>
        <p>Leaderboard goes live April 6 when Ignition begins.</p>
        {COMPS.find(c => c.id === "ignition")?.rounds?.map(r => (
          <div key={r.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{r.label}</span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>{r.dates}</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(255,255,255,0.55)", textAlign: "left", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>#</th>
                  <th style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(255,255,255,0.55)", textAlign: "left", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>Rep</th>
                  <th style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(255,255,255,0.55)", textAlign: "right", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>KCA</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={3} style={{ textAlign: "center", padding: "16px 0", opacity: 0.5, fontSize: 13 }}>Starts {r.dates.split("–")[0].trim()}</td></tr>
              </tbody>
            </table>
          </div>
        ))}
      </>
    );
  }

  if (data.status === "ended") {
    return (
      <>
        <h3>Ignition Complete</h3>
        <p>Season ended May 3.</p>
      </>
    );
  }

  const roles: Array<"Rookie" | "Veteran Setter" | "Closer"> = ["Rookie", "Veteran Setter", "Closer"];
  const rankStyles: Record<number, React.CSSProperties> = {
    1: { background: "#f5c842", color: "#1a1a1a" },
    2: { background: "#c0c0c0", color: "#1a1a1a" },
    3: { background: "#cd7f32", color: "#fff" },
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ marginBottom: 0 }}>{data.roundLabel} · {fmt(data.startDate!)}–{fmt(data.endDate!)}</h3>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
      </div>
      {roles.map(role => {
        const reps = (data.reps || []).filter(r => r.role === role).sort((a, b) => b.kca - a.kca);
        const target = data.targets?.[role === "Veteran Setter" ? "Veteran" : role] ?? 1;
        return (
          <div key={role} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, marginBottom: 8 }}>{role}</div>
            {reps.length === 0 ? (
              <div style={{ fontSize: 13, opacity: 0.5, fontStyle: "italic" }}>No data yet</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["#", "Rep", "KCA"].map((h, i) => (
                      <th key={h} style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(255,255,255,0.55)", textAlign: i === 2 ? "right" : "left", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reps.map((rep, i) => (
                    <tr key={rep.name}>
                      <td style={{ padding: "9px 0", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", fontSize: 11, fontWeight: 800, ...(rankStyles[i + 1] || { background: "rgba(255,255,255,0.15)", color: "#fff" }) }}>{i + 1}</span>
                      </td>
                      <td style={{ padding: "9px 0", fontSize: 13, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>{rep.name}{rep.qualified && " ✅"}</td>
                      <td style={{ padding: "9px 0", fontSize: 13, color: "#fff", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>{rep.kca}/{target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
      {data.updatedAt && <p style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>Updated {new Date(data.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>}
    </>
  );
}

// ─────────────────────────────────────────────
// SECTION CONTENT RENDERERS
// ─────────────────────────────────────────────

function renderRules(comp: Comp) {
  if (comp.id === "ignition") {
    return (
      <>
        <h3>How Ignition Works</h3>
        <p>Individual threshold competition — every rep who hits their weekly KCA target during the round window earns the prize. No ranking, no competition. Hit the number and get it.</p>
        <p><strong>Eligibility by role:</strong></p>
        <ul>
          <li><strong>Rookie</strong> — first summer with KIN</li>
          <li><strong>Veteran</strong> — returning setter</li>
          <li><strong>Closer</strong> — closer role</li>
        </ul>
        <p>KCAs counted from QuickBase (Status = KCA or Active) using sale date within each round window. Round closes at midnight Sunday night.</p>
        <p><strong>Prize Distribution:</strong> Prizes ship to your office at the end of each round. Allow 2 weeks for delivery.</p>
        <p><strong>Eligibility:</strong> Active reps only. Only deals set, closed, and KCA&apos;d within round dates count. Cancelled/Deactivated accounts are ineligible.</p>
      </>
    );
  }
  if (comp.id === "blood-club") {
    return (
      <>
        <h3>How Blood Club Works</h3>
        <p>Blood Club is the ultimate closer challenge — running all year long. To earn membership, you must close <strong>2 deals on the same Saturday</strong>.</p>
        <p><strong>The rules:</strong></p>
        <ul>
          <li>Both closes must have the same sale date in QuickBase</li>
          <li>That sale date must fall on a Saturday</li>
          <li>Both deals must reach KCA status (no cancels)</li>
          <li>Achievement is permanent — once you&apos;re in, you&apos;re in</li>
        </ul>
        <p>Rookies only need 1 same-day Saturday close to qualify.</p>
        <p>Blood Club members earn exclusive recognition and are eligible for member-only incentives throughout 2026.</p>
      </>
    );
  }
  return <p style={{ opacity: 0.8 }}>Rules coming soon.</p>;
}

function renderMetrics(comp: Comp) {
  if (comp.id === "ignition" && comp.rounds) {
    return (
      <>
        <h3>KCA Targets by Round</h3>
        <p>Hit your role&apos;s weekly target to win the round prize. Every qualifying rep wins — no cap on winners.</p>
        {comp.rounds.map(r => (
          <div key={r.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.label}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{r.dates}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20 }}>{r.prize}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {Object.entries(r.targets!).map(([role, n]) => (
                <div key={role} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 4px" }}>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{n}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>{role}</div>
                  <div style={{ fontSize: 10, opacity: 0.5 }}>KCA</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    );
  }
  if (comp.id === "blood-club") {
    return (
      <>
        <h3>The Qualifying Standard</h3>
        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>2 Closes</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Same Saturday</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20 }}>Blood Club Entry</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ n: "2", role: "Closes", unit: "same day" }, { n: "1", role: "Saturday", unit: "any week" }, { n: "KCA", role: "Status", unit: "required" }].map(c => (
              <div key={c.role} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 4px" }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{c.n}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>{c.role}</div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>{c.unit}</div>
              </div>
            ))}
          </div>
        </div>
        <p>Both deals must reach KCA status. Saturdays only — not Sunday, not weekday.</p>
      </>
    );
  }
  return <p style={{ opacity: 0.8 }}>Metrics coming soon.</p>;
}

function renderIncentives(comp: Comp) {
  if (comp.id === "ignition" && comp.rounds) {
    return (
      <>
        <h3>Round Prizes</h3>
        <p>Earn every round independently — each week resets. Hit the target, win the prize.</p>
        {comp.rounds.map(r => {
          const photo = IGNITION_PRIZE_PHOTOS[r.label];
          return (
            <div key={r.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: photo ? 8 : 0 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{r.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{r.dates}</div>
                </div>
              </div>
              {photo && (
                <div style={{ borderRadius: 12, overflow: "hidden", background: "rgba(0,0,0,0.2)", marginTop: 4 }}>
                  <img
                    src={`/${photo}`}
                    alt={r.prize}
                    style={{ width: "100%", maxHeight: 200, objectFit: "contain", display: "block" }}
                  />
                  <div style={{ textAlign: "center", padding: "10px 12px 12px", fontSize: 14, fontWeight: 700 }}>{r.prize}</div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }
  if (comp.id === "blood-club" && comp.bloodTiers) {
    return (
      <>
        <h3>Blood Club Rewards</h3>
        <p>Once you&apos;re in, you&apos;re recognized all year and eligible for exclusive member-only incentives.</p>
        {comp.bloodTiers.map(t => (
          <div key={t.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{t.prize}</div>
          </div>
        ))}
      </>
    );
  }
  return <p style={{ opacity: 0.8 }}>Incentives coming soon.</p>;
}

function renderStandings(comp: Comp) {
  if (comp.id === "ignition") {
    return <IgnitionStandingsContent accent={comp.theme.accent} />;
  }
  if (comp.id === "blood-club") {
    return (
      <>
        <h3>Blood Club Members — 2026</h3>
        <p>These closers have earned Blood Club status by closing 2 deals on a Saturday.</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["#", "Closer", "Date", "Entries"].map((h, i) => (
                <th key={h} style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(255,255,255,0.55)", textAlign: i === 3 ? "right" : "left", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={4} style={{ textAlign: "center", padding: "24px 0", opacity: 0.5, fontSize: 13 }}>No members yet — be the first 🩸</td></tr>
          </tbody>
        </table>
      </>
    );
  }
  return <p style={{ opacity: 0.8 }}>Standings coming soon.</p>;
}

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "rules",      label: "Rules" },
  { key: "metrics",    label: "Metrics" },
  { key: "incentives", label: "Incentives" },
  { key: "standings",  label: "Standings" },
];

// ─────────────────────────────────────────────
// ICON TILE
// ─────────────────────────────────────────────

function CompIcon({ comp, size = 40 }: { comp: Comp; size?: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.25),
      background: comp.theme.accentSoft,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", flexShrink: 0,
      fontSize: Math.round(size * 0.5),
    }}>
      {comp.theme.logo && !imgFailed ? (
        <img
          src={`/${comp.theme.logo}`}
          alt={comp.theme.logoAlt || comp.name}
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4, mixBlendMode: "multiply" }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span>{comp.emoji}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function Page() {
  const [now] = useState(() => new Date());
  const [screen, setScreen] = useState<Screen>("home");
  const [activeComp, setActiveComp] = useState<Comp | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const contentCardRef = useRef<HTMLDivElement>(null);

  // Scroll content card to top on section change
  useEffect(() => {
    if (contentCardRef.current) contentCardRef.current.scrollTop = 0;
  }, [activeSection, activeComp?.id]);

  const dateString = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  function goHome() {
    setScreen("home");
    setActiveComp(null);
    setActiveSection(null);
  }

  function openComp(comp: Comp) {
    setActiveComp(comp);
    setActiveSection(null);
    setScreen(comp.stub ? "soon" : "detail");
  }

  function openSection(key: SectionKey) {
    setActiveSection(key);
    setScreen("content");
  }

  function backToDetail() {
    setActiveSection(null);
    setScreen("detail");
  }

  const groups: { key: Comp["group"]; label: string }[] = [
    { key: "sl28",     label: "SL28 Programs" },
    { key: "summer",   label: "Summer Long" },
    { key: "yearlong", label: "Year Long" },
  ];

  const activeSectionMeta = SECTIONS.find(s => s.key === activeSection);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #e8e8e0;
          min-height: 100dvh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        @media (min-width: 480px) {
          body { padding: 32px 16px; align-items: center; }
          #shell {
            min-height: 820px !important;
            max-height: 820px !important;
            border-radius: 44px !important;
            box-shadow: 0 24px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12) !important;
            overflow: hidden !important;
          }
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 99px; }

        .prog-row { transition: box-shadow 0.15s, transform 0.1s; }
        .prog-row:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.11) !important; }
        .prog-row:active { transform: scale(0.975); }

        .section-btn:hover { filter: brightness(1.08); }
        .section-btn:active { transform: scale(0.97); }

        .btn-nav:hover { background: rgba(0,0,0,0.13) !important; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div
        id="shell"
        style={{
          width: "100%",
          maxWidth: 390,
          minHeight: "100dvh",
          background: "#F5F5F0",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >

        {/* ══════════════════════════════
            SCREEN 1 — HOME
        ══════════════════════════════ */}
        {screen === "home" && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "20px 20px 12px", background: "#F5F5F0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 34, height: 34, background: "#1a1a1a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 900, letterSpacing: -1, flexShrink: 0 }}>正</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", letterSpacing: -0.5, lineHeight: 1 }}>
                  KINsight<sup style={{ fontSize: 10, fontWeight: 700 }}>™</sup>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#aaa" }}>{dateString}</div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 32px" }}>
              {groups.map(g => {
                const comps = COMPS.filter(c => c.group === g.key);
                if (!comps.length) return null;
                return (
                  <div key={g.key}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "#b0aea8", margin: "20px 0 8px 2px" }}>{g.label}</div>
                    {comps.map(comp => {
                      const status = comp.stub ? "soon" : getStatus(comp, now);
                      const statusStyles: Record<string, React.CSSProperties> = {
                        live:     { background: "rgba(34,197,94,0.12)", color: "#16a34a" },
                        upcoming: { background: "rgba(0,0,0,0.06)",     color: "#888" },
                        soon:     { background: "rgba(0,0,0,0.05)",     color: "#aaa" },
                        done:     { background: "rgba(0,0,0,0.04)",     color: "#bbb" },
                      };
                      const statusLabels: Record<string, string> = { live: "LIVE", upcoming: "UPCOMING", soon: "SOON", done: "DONE" };
                      return (
                        <div
                          key={comp.id}
                          className="prog-row"
                          onClick={() => openComp(comp)}
                          style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 16, padding: "14px 16px", marginBottom: 8, cursor: "pointer", border: "1.5px solid transparent", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", position: "relative" }}
                        >
                          <CompIcon comp={comp} size={40} />
                          <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{comp.name}</div>
                            <div style={{ fontSize: 11, fontWeight: 500, color: "#aaa", marginTop: 2 }}>{fmtRange(comp.dates.start, comp.dates.end)}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0, marginLeft: 10 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: comp.theme.accentSoft, color: comp.theme.accentText }}>{comp.theme.tag}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, ...statusStyles[status] }}>{statusLabels[status]}</span>
                          </div>
                          <span style={{ color: "#ccc", fontSize: 18, marginLeft: 6 }}>›</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#c8c6c0", letterSpacing: 0.5, padding: "10px 0 18px", flexShrink: 0 }}>
              kinsight<sup style={{ fontSize: 8, verticalAlign: "super" }}>™</sup>
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            SCREEN 2 — COMPETITION DETAIL
        ══════════════════════════════ */}
        {screen === "detail" && activeComp && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0", flexShrink: 0 }}>
              <button className="btn-nav" onClick={goHome} style={{ width: 34, height: 34, border: "none", background: "rgba(0,0,0,0.07)", borderRadius: "50%", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#444" }}>‹</button>
              <button className="btn-nav" onClick={goHome} style={{ width: 34, height: 34, border: "none", background: "rgba(0,0,0,0.07)", borderRadius: "50%", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#444" }}>✕</button>
            </div>

            {/* Hero logo */}
            <div style={{ padding: "18px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              {activeComp.theme.logo ? (
                <div style={{ background: activeComp.theme.accentSoft, borderRadius: 16, padding: "16px 24px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={`/${activeComp.theme.logo}`}
                    alt={activeComp.theme.logoAlt || activeComp.name}
                    style={{ maxHeight: 68, maxWidth: 260, objectFit: "contain", mixBlendMode: "multiply" }}
                  />
                </div>
              ) : (
                <div style={{ fontSize: 56, lineHeight: 1 }}>{activeComp.emoji}</div>
              )}
            </div>

            {/* Section buttons */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, padding: "20px 20px 24px" }}>
              {SECTIONS.map(sec => (
                <button
                  key={sec.key}
                  className="section-btn"
                  onClick={() => openSection(sec.key)}
                  style={{
                    border: "none",
                    borderRadius: 16,
                    padding: "20px 24px",
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: 0.2,
                    cursor: "pointer",
                    textAlign: "center",
                    background: activeComp.theme.accent,
                    color: activeComp.theme.btnTextColor || "#fff",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
                  }}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#c8c6c0", letterSpacing: 0.5, padding: "10px 0 18px", flexShrink: 0 }}>
              kinsight<sup style={{ fontSize: 8, verticalAlign: "super" }}>™</sup>
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            SCREEN 3 — CONTENT VIEW
        ══════════════════════════════ */}
        {screen === "content" && activeComp && activeSection && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0", flexShrink: 0 }}>
              <button className="btn-nav" onClick={backToDetail} style={{ width: 34, height: 34, border: "none", background: "rgba(0,0,0,0.07)", borderRadius: "50%", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#444" }}>‹</button>
              <button className="btn-nav" onClick={goHome} style={{ width: 34, height: 34, border: "none", background: "rgba(0,0,0,0.07)", borderRadius: "50%", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#444" }}>✕</button>
            </div>

            {/* Logo + section label */}
            <div style={{ padding: "12px 20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
              {activeComp.theme.logo ? (
                <div style={{ background: activeComp.theme.accentSoft, borderRadius: 12, padding: "8px 18px" }}>
                  <img
                    src={`/${activeComp.theme.logo}`}
                    alt={activeComp.theme.logoAlt || activeComp.name}
                    style={{ maxHeight: 36, maxWidth: 140, objectFit: "contain", display: "block", mixBlendMode: "multiply" }}
                  />
                </div>
              ) : (
                <div style={{ fontSize: 32 }}>{activeComp.emoji}</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: activeComp.theme.accent }}>
                {activeSectionMeta?.label}
              </div>
            </div>

            {/* Content card */}
            <div
              ref={contentCardRef}
              style={{
                flex: 1,
                overflowY: "auto",
                margin: "12px 16px 0",
                borderRadius: 20,
                padding: "22px 20px",
                background: activeComp.theme.accent,
                color: activeComp.theme.btnTextColor && activeComp.theme.btnTextColor !== "#fff" ? activeComp.theme.btnTextColor : "#fff",
              }}
            >
              <style>{`
                #content-inner h3 { font-size: 17px; font-weight: 800; margin-bottom: 12px; color: inherit; }
                #content-inner p  { font-size: 14px; line-height: 1.65; opacity: 0.92; margin-bottom: 10px; color: inherit; }
                #content-inner ul { padding-left: 18px; margin-bottom: 10px; }
                #content-inner li { font-size: 14px; line-height: 1.65; opacity: 0.92; margin-bottom: 5px; color: inherit; }
                #content-inner strong { font-weight: 700; }
              `}</style>
              <div id="content-inner">
                {activeSection === "rules"      && renderRules(activeComp)}
                {activeSection === "metrics"    && renderMetrics(activeComp)}
                {activeSection === "incentives" && renderIncentives(activeComp)}
                {activeSection === "standings"  && renderStandings(activeComp)}
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#c8c6c0", letterSpacing: 0.5, padding: "10px 0 18px", flexShrink: 0 }}>
              kinsight<sup style={{ fontSize: 8, verticalAlign: "super" }}>™</sup>
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            SCREEN 4 — COMING SOON
        ══════════════════════════════ */}
        {screen === "soon" && activeComp && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", top: 16, right: 20 }}>
              <button className="btn-nav" onClick={goHome} style={{ width: 34, height: 34, border: "none", background: "rgba(0,0,0,0.07)", borderRadius: "50%", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#444" }}>✕</button>
            </div>
            <div style={{ textAlign: "center", padding: "40px 28px" }}>
              {activeComp.theme.logo ? (
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                  <div style={{ background: activeComp.theme.accentSoft, borderRadius: 16, padding: "16px 24px", display: "inline-block" }}>
                    <img
                      src={`/${activeComp.theme.logo}`}
                      alt={activeComp.name}
                      style={{ height: 56, maxWidth: 200, objectFit: "contain", display: "block", mixBlendMode: "multiply" }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 52, marginBottom: 16 }}>{activeComp.emoji}</div>
              )}
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", marginBottom: 8 }}>{activeComp.name}</div>
              <div style={{ fontSize: 14, color: "#888", lineHeight: 1.5, marginBottom: 28 }}>Content for this competition is coming soon. Check back before it begins!</div>
              <button
                onClick={goHome}
                style={{ border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 15, fontWeight: 700, color: activeComp.theme.btnTextColor || "#fff", background: activeComp.theme.accent, cursor: "pointer" }}
              >
                ← Back to Programs
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
