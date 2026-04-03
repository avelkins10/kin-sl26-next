"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

// ─── Test mode context ────────────────────────
const TestModeContext = createContext(false);
function useTestMode() { return useContext(TestModeContext); }
const TEST_NOW_DATE = new Date("2026-02-25T12:00:00");

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
  group: "sl26" | "summer" | "yearlong";
  stub: boolean;
  dates: { start: string; end: string };
  subtitle: string;
  theme: CompTheme;
  rounds?: Round[];
  bloodTiers?: { label: string; prize: string; photo?: string }[];
}

type MobileScreen = "home" | "detail" | "content" | "soon";
type SectionKey = "rules" | "incentives" | "standings";

// ─────────────────────────────────────────────
// COMPETITION DATA
// ─────────────────────────────────────────────

const COMPS: Comp[] = [
  // ── SL26 Monthly ──
  {
    id: "ignition",
    name: "Ignition",
    emoji: "🏁",
    group: "sl26",
    stub: false,
    dates: { start: "2026-04-06", end: "2026-05-03" },
    subtitle: "Hit the threshold. Earn the prize.",
    theme: {
      accent: "#2a6ca0",
      accentSoft: "rgba(42,108,160,0.10)",
      accentText: "#2a6ca0",
      tag: "SL26",
      logo: "ignition-logo.png",
      logoAlt: "Ignition",
    },
    rounds: [
      { label: "Round 1", dates: "Apr 6–12",     prize: "Anker 621 MagSafe Battery",  targets: { Rookie: 1, Veteran: 3, Closer: 5 } },
      { label: "Round 2", dates: "Apr 13–19",    prize: "New Polo",                    targets: { Rookie: 1, Veteran: 3, Closer: 5 } },
      { label: "Round 3", dates: "Apr 20–26",    prize: "Knocking Hat",                targets: { Rookie: 2, Veteran: 4, Closer: 6 } },
      { label: "Round 4", dates: "Apr 27–May 3", prize: "Short Sleeve Rain Jacket",    targets: { Rookie: 2, Veteran: 4, Closer: 6 } },
    ],
  },
  {
    id: "wars",
    name: "Wars",
    emoji: "⚔️",
    group: "sl26",
    stub: true,
    dates: { start: "2026-05-04", end: "2026-05-31" },
    subtitle: "Office vs. office — best PRA wins.",
    theme: {
      accent: "#d2fa06",
      accentSoft: "rgba(210,250,6,0.18)",
      accentText: "#5a6b00",
      tag: "SL26",
      logo: "wars-logo.png",
      logoAlt: "Wars",
      btnTextColor: "#1a1a1a",
    },
  },
  {
    id: "the-drop",
    name: "The Drop",
    emoji: "📦",
    group: "sl26",
    stub: true,
    dates: { start: "2026-06-01", end: "2026-06-27" },
    subtitle: "New prize every day. Will you earn it?",
    theme: {
      accent: "#db08f9",
      accentSoft: "rgba(219,8,249,0.10)",
      accentText: "#9600b0",
      tag: "SL26",
      logo: "the-drop-logo.png",
      logoAlt: "The Drop",
    },
  },
  {
    id: "supercrown",
    name: "Supercrown",
    emoji: "👑",
    group: "sl26",
    stub: true,
    dates: { start: "2026-06-29", end: "2026-08-01" },
    subtitle: "1 setter + 1 closer winner every week.",
    theme: {
      accent: "#bce9c8",
      accentSoft: "rgba(188,233,200,0.25)",
      accentText: "#1e7a40",
      tag: "SL26",
      logo: "supercrown-logo.png",
      logoAlt: "Supercrown",
      btnTextColor: "#1a1a1a",
    },
  },
  {
    id: "the-throne",
    name: "The Throne",
    emoji: "🪑",
    group: "sl26",
    stub: true,
    dates: { start: "2026-08-03", end: "2026-08-29" },
    subtitle: "March Madness bracket. D4W-seeded.",
    theme: {
      accent: "#e64d57",
      accentSoft: "rgba(230,77,87,0.10)",
      accentText: "#b82832",
      tag: "SL26",
      logo: "the-throne-logo.png",
      logoAlt: "The Throne",
    },
  },
  // ── Summer Long ──
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
  // ── Year Long ──
  {
    id: "blood-club",
    name: "Blood Club",
    emoji: "🩸",
    group: "yearlong",
    stub: false,
    dates: { start: "2026-01-01", end: "2026-12-31" },
    subtitle: "KIN's Most Elite Group.",
    theme: {
      accent: "#b91c1c",
      accentSoft: "rgba(185,28,28,0.10)",
      accentText: "#b91c1c",
      tag: "Year Long",
      logo: "blood-club-logo.png",
      logoAlt: "Blood Club",
    },
    bloodTiers: [
      { label: "1st Entry", prize: "Blood Polo",    photo: "blood-club-polo.png" },
      { label: "2nd Entry", prize: "Blood Hat",     photo: "blood-club-hat.png" },
      { label: "3rd Entry", prize: "Blood ½ Zip",   photo: "blood-club-qzip.png" },
    ],
  },
];

const GROUPS: { key: Comp["group"]; label: string }[] = [
  { key: "sl26",     label: "SL26 Programs" },
  { key: "summer",   label: "Summer Long" },
  { key: "yearlong", label: "Year Long" },
];

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "standings",  label: "Standings" },
  { key: "incentives", label: "Incentives" },
  { key: "rules",      label: "Rules" },
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

function parseLocal(s: string): Date { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); }

function getStatus(comp: Comp, now: Date): "live" | "upcoming" | "done" {
  const s = parseLocal(comp.dates.start);
  const e = parseLocal(comp.dates.end);
  if (now >= s && now <= e) return "live";
  if (now < s) return "upcoming";
  return "done";
}

function fmtRange(start: string, end: string): string {
  const o: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${parseLocal(start).toLocaleDateString("en-US", o)} – ${parseLocal(end).toLocaleDateString("en-US", o)}`;
}

function statusBadge(comp: Comp, now: Date): { label: string; style: React.CSSProperties } {
  if (comp.stub) return { label: "SOON", style: { background: "rgba(0,0,0,0.05)", color: "#aaa" } };
  const s = getStatus(comp, now);
  if (s === "live")     return { label: "LIVE",     style: { background: "rgba(34,197,94,0.12)", color: "#16a34a" } };
  if (s === "upcoming") return { label: "UPCOMING", style: { background: "rgba(0,0,0,0.06)",    color: "#888" } };
  return { label: "DONE", style: { background: "rgba(0,0,0,0.04)", color: "#bbb" } };
}

// ─────────────────────────────────────────────
// SHARED: ICON TILE
// ─────────────────────────────────────────────
// WINNERS MODAL
// ─────────────────────────────────────────────

type WinnerRole = "Rookie" | "Veteran Setter" | "Veteran" | "Closer";

interface WinnersModalProps {
  roundLabel: string;
  roundDates: string;
  roundStart: string;
  role: WinnerRole;
  accent: string;
  onClose: () => void;
}

function WinnersModal({ roundLabel, roundDates, roundStart, role, accent, onClose }: WinnersModalProps) {
  const [winners, setWinners]   = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const testMode = useTestMode();
  const now = testMode ? TEST_NOW_DATE : new Date();
  const started = now >= parseLocal(roundStart);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    if (!started) { setLoading(false); return; }
    const url = testMode ? "/api/ignition/standings?test=feb22" : "/api/ignition/standings";
    fetch(url)
      .then(r => r.json())
      .then((d: IgnitionData) => {
        // "Veteran" chip label maps to API role "Veteran Setter"
        const apiRole = role === "Veteran" ? "Veteran Setter" : role;
        const qualified = (d.reps || [])
          .filter(rep => rep.role === apiRole && rep.qualified)
          .map(rep => rep.name);
        setWinners(qualified);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, roundStart, testMode]);

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Card — stop propagation so clicking card doesn't close */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20,
          width: "100%", maxWidth: 340,
          maxHeight: "70vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>{role} Winners</div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{roundLabel} · {roundDates}</div>
            </div>
            <button
              onClick={onClose}
              style={{ background: "rgba(0,0,0,0.07)", border: "none", borderRadius: "50%", width: 32, height: 32, fontSize: 14, cursor: "pointer", color: "#555", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            >✕</button>
          </div>
          {/* Accent underline */}
          <div style={{ height: 2, background: accent, borderRadius: 2, marginBottom: 16 }} />
        </div>

        {/* Body — scrollable */}
        <div style={{ overflowY: "auto", padding: "0 20px 20px", flex: 1 }}>
          {loading ? (
            <p style={{ fontSize: 14, color: "#888", textAlign: "center", padding: "12px 0" }}>Loading…</p>
          ) : !started ? (
            <p style={{ fontSize: 14, color: "#888", textAlign: "center", padding: "12px 0" }}>
              No winners yet — round starts {roundDates.split("–")[0].trim()}
            </p>
          ) : winners.length === 0 ? (
            <p style={{ fontSize: 14, color: "#888", textAlign: "center", padding: "12px 0" }}>
              No winners yet this round
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {winners.map((name, i) => (
                <div key={name} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 0",
                  borderBottom: i < winners.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", flex: 1 }}>{name}</span>
                  <span style={{ fontSize: 13 }}>✅</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// IGNITION INCENTIVES (tappable chips + modal)
// ─────────────────────────────────────────────

// Test round entry for incentives — mirrors TEST_ROUND_ENTRY used in standings
const TEST_INCENTIVE_ROUND: Round = {
  label: "Test Round",
  dates: "Feb 22–28",
  prize: "Test Prize (QA only)",
  targets: { Rookie: 1, Veteran: 3, Closer: 5 },
};

function IgnitionIncentives({ comp }: { comp: Comp }) {
  const [modal, setModal] = useState<{ roundIdx: number; role: WinnerRole } | null>(null);
  const testMode = useTestMode();
  const now = testMode ? TEST_NOW_DATE : new Date();
  const rounds = useIgnitionRounds();

  if (!comp.rounds) return null;

  // In test mode, prepend the test round card so modals can be validated
  const incentiveRounds: Round[] = testMode
    ? [TEST_INCENTIVE_ROUND, ...comp.rounds]
    : comp.rounds;

  // Map incentive round index → the rounds[] entry used for date lookups
  // rounds[] = [TestRound, R1, R2, R3, R4] in test mode; [R1, R2, R3, R4] in prod
  function getRoundStart(incentiveIdx: number): string {
    const r = rounds[incentiveIdx];
    return r?.start ?? "2026-04-06";
  }

  return (
    <>
      <h3>Round Prizes</h3>
      <p>Earn every round independently — each week resets. Hit the target, win the prize.</p>
      {incentiveRounds.map((r, roundIdx) => {
        const isTestRound = r.label === "Test Round";
        const photo = isTestRound ? null : IGNITION_PRIZE_PHOTOS[r.label];
        const roundDef = rounds[roundIdx];
        const roundState = roundDef ? getRoundState(roundIdx, rounds, now) : "upcoming";
        const hasWinnersIndicator = roundState !== "upcoming";

        return (
          <div key={r.label} style={{ background: isTestRound ? "rgba(251,191,36,0.18)" : "rgba(255,255,255,0.12)", borderRadius:12, padding:14, marginBottom:10, border: isTestRound ? "1px solid rgba(251,191,36,0.4)" : "none" }}>
            {/* Round header */}
            <div style={{ marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700 }}>{r.label}</div>
                <div style={{ fontSize:12, opacity:0.7 }}>{r.dates}</div>
              </div>
              {isTestRound && (
                <span style={{ fontSize:10, fontWeight:700, background:"rgba(251,191,36,0.3)", color:"#fbbf24", padding:"2px 7px", borderRadius:20, marginLeft:"auto" }}>⚠️ TEST</span>
              )}
            </div>
            {/* Target chips — tappable */}
            {r.targets && (
              <div style={{ display:"flex", gap:8, marginBottom: isTestRound ? 0 : 12 }}>
                {(Object.entries(r.targets) as [WinnerRole, number][]).map(([role, n]) => (
                  <button
                    key={role}
                    onClick={() => setModal({ roundIdx, role })}
                    style={{
                      flex:1, textAlign:"center",
                      background:"rgba(255,255,255,0.1)",
                      border: "none",
                      borderRadius:8, padding:"8px 4px",
                      cursor:"pointer",
                      transition:"background 0.15s",
                      position: "relative",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  >
                    <div style={{ fontSize:22, fontWeight:900, color:"#fff" }}>{n}</div>
                    <div style={{ fontSize:10, opacity:0.7, marginTop:1, color:"#fff" }}>{role}</div>
                    <div style={{ fontSize:10, opacity:0.5, color:"#fff" }}>KCA</div>
                    {hasWinnersIndicator && (
                      <div style={{
                        position:"absolute", top:4, right:4,
                        fontSize:9, background:"rgba(255,255,255,0.25)",
                        borderRadius:10, padding:"1px 5px", color:"#fff",
                        fontWeight:700,
                      }}>👀</div>
                    )}
                  </button>
                ))}
              </div>
            )}
            {/* Prize photo — real rounds only */}
            {photo && (
              <div style={{ borderRadius:12, overflow:"hidden", background:"rgba(0,0,0,0.2)" }}>
                <img src={`/${photo}`} alt={r.prize} style={{ width:"100%", maxHeight:200, objectFit:"contain", display:"block" }} />
                <div style={{ textAlign:"center", padding:"10px 12px 12px", fontSize:14, fontWeight:700, color:"#fff" }}>{r.prize}</div>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal — uses same test=feb22 API endpoint as standings */}
      {modal !== null && (
        <WinnersModal
          roundLabel={incentiveRounds[modal.roundIdx].label}
          roundDates={incentiveRounds[modal.roundIdx].dates}
          roundStart={getRoundStart(modal.roundIdx)}
          role={modal.role}
          accent={comp.theme.accent}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

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
// SHARED: CONTENT RENDERERS
// ─────────────────────────────────────────────

type RepResult = { name: string; role: "Rookie" | "Veteran Setter" | "Closer"; kca: number; kw: number; qualified: boolean };

interface RoundResponse {
  round:      number;
  roundLabel: string;
  startDate:  string;
  endDate:    string;
  targets:    { Rookie: number; Veteran: number; Closer: number };
  status:     "upcoming" | "live" | "complete";
  reps?:      RepResult[];
  frozenAt?:  string;
  updatedAt?: string;
}

interface IgnitionData {
  status?: "not_started" | "ended";
  // Legacy single-round fields (still present for live round, backwards compat)
  round?: number;
  roundLabel?: string;
  updatedAt?: string;
  reps?: RepResult[];
  // New: all rounds
  rounds?: RoundResponse[];
}

// Ignition round definitions — Mon start → Sun end (Apr 6 is a Monday)
const IGNITION_ROUNDS = [
  { label: "Round 1", dates: "Apr 6–12",     start: "2026-04-06", end: "2026-04-12" },
  { label: "Round 2", dates: "Apr 13–19",    start: "2026-04-13", end: "2026-04-19" },
  { label: "Round 3", dates: "Apr 20–26",    start: "2026-04-20", end: "2026-04-26" },
  { label: "Round 4", dates: "Apr 27–May 3", start: "2026-04-27", end: "2026-05-03" },
];

// Test round — prepended to accordion in test mode only
const TEST_ROUND_ENTRY = { label: "Test Round", dates: "Feb 22–28", start: "2026-02-22", end: "2026-02-28" };

function useIgnitionRounds() {
  const testMode = useTestMode();
  return testMode ? [TEST_ROUND_ENTRY, ...IGNITION_ROUNDS] : IGNITION_ROUNDS;
}

function getDefaultOpenRound(rounds: typeof IGNITION_ROUNDS, now: Date): number {
  // Return 0-based index of the active or closest upcoming round
  for (let i = 0; i < rounds.length; i++) {
    const r = rounds[i];
    const s = parseLocal(r.start), e = parseLocal(r.end);
    if (now >= s && now <= e) return i; // currently live
  }
  // Before Ignition starts or between rounds — open first upcoming
  for (let i = 0; i < rounds.length; i++) {
    if (now < parseLocal(rounds[i].start)) return i;
  }
  return rounds.length - 1; // all done, show last
}

function getRoundState(roundIdx: number, rounds: typeof IGNITION_ROUNDS, now: Date): "upcoming" | "live" | "complete" {
  const r = rounds[roundIdx];
  const s = parseLocal(r.start), e = parseLocal(r.end);
  if (now > e) return "complete";
  if (now >= s) return "live";
  return "upcoming";
}

type StandingsRoleFilter = "Rookie" | "Veteran Setter" | "Closer";

function RoleRepList({ reps, headerBg }: { reps: IgnitionData["reps"]; headerBg?: string }) {
  const thBg = headerBg || "rgba(0,0,0,0.35)";
  if (!reps || reps.length === 0) return (
    <p style={{ textAlign: "center", padding: "18px 0", opacity: 0.5, fontSize: 13 }}>No data yet</p>
  );
  return (
    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
      <thead>
        <tr>
          <th style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(255,255,255,0.55)", textAlign: "left",  padding: "10px 0 8px", position: "sticky", top: 0, background: thBg, boxShadow: "0 1px 0 rgba(255,255,255,0.15)" }}>Rep</th>
          <th style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(255,255,255,0.55)", textAlign: "right", padding: "10px 0 8px", position: "sticky", top: 0, background: thBg, boxShadow: "0 1px 0 rgba(255,255,255,0.15)" }}>KCA</th>
          <th style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(255,255,255,0.55)", textAlign: "right", padding: "10px 0 8px", position: "sticky", top: 0, background: thBg, boxShadow: "0 1px 0 rgba(255,255,255,0.15)" }}>kW</th>
        </tr>
      </thead>
      <tbody>
        {reps.sort((a, b) => b.kca - a.kca || b.kw - a.kw).map((rep) => (
          <tr key={rep.name}>
            <td style={{ padding: "8px 0", fontSize: 13, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {rep.name}{rep.qualified && " ✅"}
            </td>
            <td style={{ padding: "8px 0", fontSize: 13, color: "#fff", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {rep.kca}
            </td>
            <td style={{ padding: "8px 0", fontSize: 13, color: "#fff", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {rep.kw.toFixed(1)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IgnitionStandingsContent({ accent }: { accent?: string }) {
  const testMode = useTestMode();
  const now = testMode ? TEST_NOW_DATE : new Date();
  const rounds = useIgnitionRounds();
  const [data, setData] = useState<IgnitionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openRound, setOpenRound] = useState<number>(() => getDefaultOpenRound(rounds, now));
  const [activeRole, setActiveRole] = useState<StandingsRoleFilter>("Closer");

  useEffect(() => {
    if (!testMode && now < new Date("2026-04-06")) {
      setData({ status: "not_started" }); setLoading(false); return;
    }
    const url = testMode ? "/api/ignition/standings?test=feb22" : "/api/ignition/standings";
    fetch(url)
      .then(r => r.json()).then((d: IgnitionData) => { setData(d); setLoading(false); })
      .catch(() => { setData({ status: "not_started" }); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testMode]);

  if (loading) return <p style={{ opacity: 0.7, fontSize: 14 }}>Loading standings…</p>;

  const ROLE_TABS: { key: StandingsRoleFilter; label: string }[] = [
    { key: "Rookie",        label: "Rookies" },
    { key: "Veteran Setter", label: "Veterans" },
    { key: "Closer",        label: "Closers" },
  ];

  return (
    <>
      <h3 style={{ marginBottom: 12 }}>Live Standings</h3>
      {data?.updatedAt && (
        <p style={{ fontSize: 11, opacity: 0.5, marginBottom: 12 }}>
          Updated {new Date(data.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          <span style={{ marginLeft: 6, display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#4ade80", verticalAlign: "middle", animation: "pulse 2s infinite" }} />
        </p>
      )}
      {rounds.map((round, idx) => {
        const isOpen = openRound === idx;
        const roundState = getRoundState(idx, rounds, now);
        const isLive = roundState === "live";
        const isTestRound = round.label === "Test Round";

        // Look up this round's data from the rounds[] array first (new API),
        // falling back to legacy top-level reps for the live round.
        const apiRoundNum = isTestRound ? 1 : (idx + (rounds[0].label === "Test Round" ? 0 : 1));
        const roundData = data?.rounds?.find(r => r.round === apiRoundNum);
        const reps: RepResult[] = roundData?.reps ?? (isLive && data?.reps ? data.reps : []);
        const isFrozen = roundData?.status === "complete";

        return (
          <div key={round.label} style={{ marginBottom: 8 }}>
            {/* Accordion header */}
            <div
              onClick={() => setOpenRound(isOpen ? -1 : idx)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: isOpen ? "12px 12px 0 0" : 12,
                background: isOpen ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
                cursor: "pointer",
                transition: "background 0.15s",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{round.label}</span>
                {isLive && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(74,222,128,0.2)", color: "#4ade80", padding: "2px 7px", borderRadius: 20 }}>LIVE</span>
                )}
                {isFrozen && !isTestRound && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(148,163,184,0.2)", color: "#94a3b8", padding: "2px 7px", borderRadius: 20 }}>FINAL</span>
                )}
                {isTestRound && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(251,191,36,0.25)", color: "#fbbf24", padding: "2px 7px", borderRadius: 20 }}>⚠️ TEST</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, opacity: 0.65 }}>{round.dates}</span>
                <span style={{ fontSize: 14, opacity: 0.5, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>⌄</span>
              </div>
            </div>

            {/* Accordion body */}
            {isOpen && (
              <div style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: "0 0 12px 12px",
                padding: "12px 14px 14px",
              }}>
                {/* Role filter buttons — always visible */}
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {ROLE_TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveRole(tab.key)}
                      style={{
                        flex: 1, border: "none", borderRadius: 8,
                        padding: "7px 4px", fontSize: 11, fontWeight: 700,
                        cursor: "pointer", transition: "all 0.15s",
                        background: activeRole === tab.key ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                        color: activeRole === tab.key ? "#1a1a1a" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {/* Rep list or upcoming placeholder */}
                <div style={{ maxHeight: 260, overflowY: "auto" }}>
                  {roundState === "upcoming" ? (
                    <p style={{ textAlign: "center", padding: "18px 0", opacity: 0.5, fontSize: 13 }}>
                      Starts {round.dates.split("–")[0].trim()}
                    </p>
                  ) : (
                    <RoleRepList reps={reps.filter(r => r.role === activeRole)} headerBg={accent} />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────
// BLOOD CLUB STANDINGS (hardcoded)
// ─────────────────────────────────────────────

const BLOOD_CLUB_MEMBERS = [
  {
    name: "Cameron Bott",
    role: "Rookie",
    entries: [
      { tier: "Blood Polo",   date: "Jan 3" },
      { tier: "Blood Hat",    date: "Feb 14" },
      { tier: "Blood ½ Zip",  date: "Feb 23" },
    ],
  },
  {
    name: "Chris Eckman",
    role: "Veteran",
    entries: [
      { tier: "Blood Polo", date: "Jan 31" },
    ],
  },
  {
    name: "Blake Pippenger",
    role: "Rookie",
    entries: [
      { tier: "Blood Polo", date: "Jan 31" },
    ],
  },
  {
    name: "Jakob Worley",
    role: "Rookie",
    entries: [
      { tier: "Blood Polo", date: "Feb 28" },
    ],
  },
  {
    name: "Lorenzo Wooley",
    role: "Rookie",
    entries: [
      { tier: "Blood Polo", date: "Mar 14" },
    ],
  },
  {
    name: "Nick Thornton",
    role: "Rookie",
    entries: [
      { tier: "Blood Polo", date: "Mar 14" },
    ],
  },
];

const TIER_ICONS: Record<string, string> = {
  "Blood Polo":  "👕",
  "Blood Hat":   "🧢",
  "Blood ½ Zip": "🥋",
};

// Winners per tier derived from BLOOD_CLUB_MEMBERS
function getBloodClubTierWinners(prize: string) {
  return BLOOD_CLUB_MEMBERS
    .filter(m => m.entries.some(e => e.tier === prize))
    .map(m => ({
      name: m.name,
      role: m.role,
      date: m.entries.find(e => e.tier === prize)!.date,
    }));
}

function BloodClubIncentives({ comp }: { comp: Comp }) {
  const [modalPrize, setModalPrize] = useState<string | null>(null);

  if (!comp.bloodTiers) return null;

  const modalWinners = modalPrize ? getBloodClubTierWinners(modalPrize) : [];

  return (
    <>
      <h3>Prize Tiers</h3>
      <p>Earn each prize in order — every new qualifying Saturday earns the next tier.</p>

      {comp.bloodTiers.map(t => (
        <div key={t.label} style={{ background:"rgba(255,255,255,0.12)", borderRadius:12, padding:14, marginBottom:10 }}>
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:14, fontWeight:700 }}>{t.label}</div>
            <div style={{ fontSize:12, opacity:0.7, marginTop:2 }}>2 same-day Saturday closes (Rookies: 1)</div>
          </div>
          {t.photo && (
            <div style={{ borderRadius:10, overflow:"hidden", background:"rgba(0,0,0,0.2)", marginBottom:8 }}>
              <img src={`/${t.photo}`} alt={t.prize} style={{ width:"100%", maxHeight:180, objectFit:"contain", display:"block" }} />
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontSize:14, fontWeight:700 }}>{t.prize}</div>
            <button
              onClick={() => setModalPrize(t.prize)}
              style={{
                background:"rgba(255,255,255,0.18)", border:"none",
                borderRadius:20, padding:"5px 12px",
                fontSize:12, fontWeight:700, color:"#fff",
                cursor:"pointer",
              }}
            >
              See Winners
            </button>
          </div>
        </div>
      ))}

      {/* Modal */}
      {modalPrize && (
        <div
          onClick={() => setModalPrize(null)}
          style={{
            position:"fixed", inset:0, zIndex:1000,
            background:"rgba(0,0,0,0.55)",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"20px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:"#fff", borderRadius:20,
              width:"100%", maxWidth:340,
              maxHeight:"70vh",
              display:"flex", flexDirection:"column",
              boxShadow:"0 20px 60px rgba(0,0,0,0.3)",
              overflow:"hidden",
            }}
          >
            {/* Header */}
            <div style={{ padding:"20px 20px 0", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
                <div style={{ fontSize:18, fontWeight:800, color:"#1a1a1a" }}>{modalPrize} Winners</div>
                <button
                  onClick={() => setModalPrize(null)}
                  style={{ background:"rgba(0,0,0,0.07)", border:"none", borderRadius:"50%", width:32, height:32, fontSize:14, cursor:"pointer", color:"#555", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}
                >✕</button>
              </div>
              <div style={{ height:2, background:"#b91c1c", borderRadius:2, marginBottom:16 }} />
            </div>
            {/* Body */}
            <div style={{ overflowY:"auto", padding:"0 20px 20px", flex:1 }}>
              {modalWinners.length === 0 ? (
                <p style={{ fontSize:14, color:"#888", textAlign:"center", padding:"12px 0" }}>No winners yet</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  {modalWinners.map((w, i) => (
                    <div key={w.name} style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"10px 0",
                      borderBottom: i < modalWinners.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                    }}>
                      <span style={{
                        width:24, height:24, borderRadius:"50%", flexShrink:0,
                        background: i===0 ? "#f5c842" : i===1 ? "#c0c0c0" : i===2 ? "#cd7f32" : "rgba(0,0,0,0.07)",
                        color: i < 3 ? "#1a1a1a" : "#555",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:11, fontWeight:800,
                      }}>{i + 1}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:15, fontWeight:600, color:"#1a1a1a" }}>{w.name}</div>
                        <div style={{ fontSize:11, color:"#aaa" }}>{w.role}</div>
                      </div>
                      <span style={{ fontSize:12, color:"#aaa" }}>{w.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BloodClubStandings() {
  return (
    <>
      <h3>Blood Club Members — 2026</h3>
      <p>These reps earned membership by closing 2 deals on the same Saturday.</p>
      {BLOOD_CLUB_MEMBERS.map((member, i) => (
        <div key={member.name} style={{ background:"rgba(255,255,255,0.12)", borderRadius:12, padding:14, marginBottom:10 }}>
          {/* Member header */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <span style={{
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              width:26, height:26, borderRadius:"50%", flexShrink:0,
              fontSize:12, fontWeight:800,
              background: i===0 ? "#f5c842" : i===1 ? "#c0c0c0" : i===2 ? "#cd7f32" : "rgba(255,255,255,0.15)",
              color: i < 3 ? "#1a1a1a" : "#fff",
            }}>{i + 1}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700 }}>{member.name}</div>
              <div style={{ fontSize:11, opacity:0.6, marginTop:1 }}>{member.role}</div>
            </div>
            {/* Trophy count */}
            <div style={{ fontSize:12, opacity:0.7 }}>
              {"🩸".repeat(member.entries.length)}
            </div>
          </div>
          {/* Tier entries */}
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {member.entries.map(entry => (
              <div key={entry.tier} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12 }}>
                <span>{TIER_ICONS[entry.tier] ?? "🩸"} {entry.tier}</span>
                <span style={{ opacity:0.55 }}>{entry.date}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p style={{ fontSize:11, opacity:0.45, marginTop:8 }}>Updated manually — contact leadership to report a qualifying Saturday.</p>
    </>
  );
}

function SectionContent({ comp, section }: { comp: Comp; section: SectionKey }) {
  // Rules
  if (section === "rules") {
    if (comp.id === "ignition") return (
      <>
        <h3>How Ignition Works</h3>
        <p>Individual threshold competition — every rep who hits their weekly KCA target earns the prize. Hit the number and get it.</p>
        <p><strong>Eligibility by role:</strong></p>
        <ul><li><strong>Rookie</strong> — first summer with KIN</li><li><strong>Veteran</strong> — returning setter</li><li><strong>Closer</strong> — closer role</li></ul>
        <p>KCAs counted from QuickBase using sale date within each round window. Round closes midnight Sunday.</p>
        <p><strong>Prize Distribution:</strong> Ships to your office at end of each round. Allow 2 weeks.</p>
        <p><strong>Eligibility:</strong> Active reps only. Cancelled/Deactivated accounts are ineligible.</p>
      </>
    );
    if (comp.id === "blood-club") return (
      <>
        <h3>KIN&apos;s Most Elite Group</h3>
        <p>To earn Blood Club status requires two same-day closes (set and closed on the same date) on a Saturday. Rookies need one same-day close.</p>
        <p>Both deals must reach KCA status. Achievement is permanent — once you&apos;re in, you&apos;re in all year.</p>
      </>
    );
    return <p style={{ opacity: 0.8 }}>Rules coming soon.</p>;
  }

  // Incentives (includes targets + prize photos)
  if (section === "incentives") {
    if (comp.id === "ignition" && comp.rounds) return <IgnitionIncentives comp={comp} />;
    if (comp.id === "blood-club" && comp.bloodTiers) return <BloodClubIncentives comp={comp} />;
    return <p style={{ opacity:0.8 }}>Incentives coming soon.</p>;
  }

  // Standings
  if (section === "standings") {
    if (comp.id === "ignition") return <IgnitionStandingsContent accent={comp.theme.accent} />;
    if (comp.id === "blood-club") return <BloodClubStandings />;
    return <p style={{ opacity:0.8 }}>Standings coming soon.</p>;
  }

  return null;
}

// ─────────────────────────────────────────────
// DESKTOP: DETAIL PANEL CONTENT
// ─────────────────────────────────────────────

function DesktopDetailPanel({ comp, now }: { comp: Comp; now: Date }) {
  const [activeSection, setActiveSection] = useState<SectionKey>("standings");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveSection("standings");
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [comp.id]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeSection]);

  const badge = statusBadge(comp, now);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Header card */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid rgba(0,0,0,0.08)", padding:"24px 28px", marginBottom:16, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
          <CompIcon comp={comp} size={56} />
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <h2 style={{ fontSize:24, fontWeight:900, color:"#1a1a1a", letterSpacing:-0.5 }}>{comp.name}</h2>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, ...badge.style }}>{badge.label}</span>
            </div>
            <div style={{ fontSize:14, color:"#666", marginTop:4 }}>{comp.subtitle}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", fontSize:12, color:"#aaa" }}>
          <span>📅 {fmtRange(comp.dates.start, comp.dates.end)}</span>
          <span style={{ background:comp.theme.accentSoft, color:comp.theme.accentText, padding:"2px 10px", borderRadius:20, fontWeight:700, fontSize:11 }}>{comp.theme.tag}</span>
        </div>
      </div>

      {/* If stub — show Coming Soon */}
      {comp.stub ? (
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid rgba(0,0,0,0.08)", padding:"48px 28px", textAlign:"center", flex:1 }}>
          {comp.theme.logo ? (
            <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
              <div style={{ background:comp.theme.accentSoft, borderRadius:16, padding:"16px 24px" }}>
                <img src={`/${comp.theme.logo}`} alt={comp.name} style={{ height:56, maxWidth:200, objectFit:"contain", display:"block", mixBlendMode:"multiply" }} />
              </div>
            </div>
          ) : (
            <div style={{ fontSize:52, marginBottom:16 }}>{comp.emoji}</div>
          )}
          <div style={{ fontSize:20, fontWeight:800, color:"#1a1a1a", marginBottom:8 }}>Coming Soon</div>
          <div style={{ fontSize:14, color:"#888", lineHeight:1.5 }}>Content for this competition will be available before it begins.</div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div style={{ display:"flex", gap:0, borderBottom:"1px solid rgba(0,0,0,0.1)", marginBottom:16, flexShrink:0 }}>
            {SECTIONS.map(sec => (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                style={{
                  background:"transparent", border:"none",
                  borderBottom: activeSection===sec.key ? `2px solid ${comp.theme.accent}` : "2px solid transparent",
                  color: activeSection===sec.key ? "#1a1a1a" : "#999",
                  fontWeight: activeSection===sec.key ? 700 : 500,
                  fontSize:14, padding:"8px 20px 10px",
                  cursor:"pointer", transition:"all 0.15s",
                  marginBottom:-1,
                }}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Content card */}
          <div
            ref={contentRef}
            style={{
              flex:1, overflowY:"auto",
              borderRadius:16,
              background: comp.theme.accent,
              padding:"22px 24px",
              color: comp.theme.btnTextColor && comp.theme.btnTextColor !== "#fff" ? comp.theme.btnTextColor : "#fff",
            }}
          >
            <style>{`
              .desktop-content h3 { font-size:17px; font-weight:800; margin-bottom:12px; color:inherit; }
              .desktop-content p  { font-size:14px; line-height:1.65; opacity:0.92; margin-bottom:10px; color:inherit; }
              .desktop-content ul { padding-left:18px; margin-bottom:10px; }
              .desktop-content li { font-size:14px; line-height:1.65; opacity:0.92; margin-bottom:5px; color:inherit; }
              .desktop-content strong { font-weight:700; }
            `}</style>
            <div className="desktop-content">
              <SectionContent comp={comp} section={activeSection} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DESKTOP LAYOUT
// ─────────────────────────────────────────────

function DesktopLayout({ now }: { now: Date }) {
  const [activeCompId, setActiveCompId] = useState<string>("ignition");
  const activeComp = COMPS.find(c => c.id === activeCompId) || COMPS[0];
  const dateString = now.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });

  return (
    <div style={{ minHeight:"100vh", background:"#e8e8e0", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <header style={{
        background:"#F5F5F0",
        borderBottom:"1px solid rgba(0,0,0,0.08)",
        padding:"0 32px",
        height:60,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexShrink:0,
        position:"sticky", top:0, zIndex:50,
      }}>
        <img src="/sl26-logo.png" alt="Street League SL26" style={{ height:40, objectFit:"contain", filter:"brightness(0)" }} />
        <div style={{ fontSize:13, fontWeight:500, color:"#aaa" }}>{dateString}</div>
      </header>

      {/* Two-column body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", maxWidth:1280, width:"100%", margin:"0 auto", padding:"24px 32px", gap:24, boxSizing:"border-box" }}>
        {/* Sidebar */}
        <div style={{ width:300, flexShrink:0, overflowY:"auto" }}>
          {GROUPS.map(g => {
            const comps = COMPS.filter(c => c.group === g.key);
            if (!comps.length) return null;
            return (
              <div key={g.key} style={{ marginBottom:24 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:"1.2px", textTransform:"uppercase", color:"#b0aea8", marginBottom:8, paddingLeft:2 }}>{g.label}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {comps.map(comp => {
                    const badge = statusBadge(comp, now);
                    const isActive = activeCompId === comp.id;
                    return (
                      <div
                        key={comp.id}
                        onClick={() => setActiveCompId(comp.id)}
                        style={{
                          background:"#fff",
                          borderRadius:16,
                          padding:"14px 16px",
                          border: isActive ? `1.5px solid ${comp.theme.accent}` : "1.5px solid transparent",
                          boxShadow: isActive ? `0 0 0 3px ${comp.theme.accentSoft}` : "0 1px 4px rgba(0,0,0,0.07)",
                          cursor:"pointer",
                          display:"flex", alignItems:"center", gap:12,
                          transition:"all 0.15s",
                        }}
                      >
                        <CompIcon comp={comp} size={40} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:700, color:"#1a1a1a" }}>{comp.name}</div>
                          <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>{fmtRange(comp.dates.start, comp.dates.end)}</div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, whiteSpace:"nowrap", ...badge.style }}>{badge.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div style={{ flex:1, minWidth:0, overflowY:"auto" }}>
          <DesktopDetailPanel key={activeComp.id} comp={activeComp} now={now} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign:"center", fontSize:12, fontWeight:700, color:"#c8c6c0", letterSpacing:0.5, padding:"12px 0 16px" }}>
        Powered by KINsight™
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MOBILE LAYOUT (v2 phone-shell, unchanged)
// ─────────────────────────────────────────────

function MobileLayout({ now }: { now: Date }) {
  const [screen, setScreen]               = useState<MobileScreen>("home");
  const [activeComp, setActiveComp]       = useState<Comp | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const contentCardRef                    = useRef<HTMLDivElement>(null);
  const dateString = now.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });

  useEffect(() => {
    if (contentCardRef.current) contentCardRef.current.scrollTop = 0;
  }, [activeSection, activeComp?.id]);

  function goHome() { setScreen("home"); setActiveComp(null); setActiveSection(null); }
  function openComp(comp: Comp) { setActiveComp(comp); setActiveSection(null); setScreen(comp.stub ? "soon" : "detail"); }
  function openSection(key: SectionKey) { setActiveSection(key); setScreen("content"); }
  function backToDetail() { setActiveSection(null); setScreen("detail"); }

  const activeSectionMeta = SECTIONS.find(s => s.key === activeSection);

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 99px; }
        .mobile-prog-row { transition: box-shadow 0.15s, transform 0.1s; }
        .mobile-prog-row:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.11) !important; }
        .mobile-prog-row:active { transform: scale(0.975); }
        .mobile-section-btn:hover { filter: brightness(1.08); }
        .mobile-section-btn:active { transform: scale(0.97); }
        .mobile-btn-nav:hover { background: rgba(0,0,0,0.13) !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      <div style={{
        width:"100%", maxWidth:390, minHeight:"100dvh",
        background:"#F5F5F0",
        display:"flex", flexDirection:"column",
        position:"relative", overflow:"hidden",
      }}>

        {/* HOME */}
        {screen === "home" && (
          <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
            <div style={{ padding:"20px 20px 12px", background:"#F5F5F0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <img src="/sl26-logo.png" alt="Street League SL26" style={{ height:36, objectFit:"contain", filter:"brightness(0)" }} />
              <div style={{ fontSize:12, fontWeight:500, color:"#aaa" }}>{dateString}</div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"4px 16px 32px" }}>
              {GROUPS.map(g => {
                const comps = COMPS.filter(c => c.group === g.key);
                if (!comps.length) return null;
                return (
                  <div key={g.key}>
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:"1.2px", textTransform:"uppercase", color:"#b0aea8", margin:"20px 0 8px 2px" }}>{g.label}</div>
                    {comps.map(comp => {
                      const badge = statusBadge(comp, now);
                      return (
                        <div key={comp.id} className="mobile-prog-row" onClick={() => openComp(comp)}
                          style={{ display:"flex", alignItems:"center", background:"#fff", borderRadius:16, padding:"14px 16px", marginBottom:8, cursor:"pointer", border:"1.5px solid transparent", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
                          <CompIcon comp={comp} size={40} />
                          <div style={{ flex:1, marginLeft:12, minWidth:0 }}>
                            <div style={{ fontSize:15, fontWeight:700, color:"#1a1a1a" }}>{comp.name}</div>
                            <div style={{ fontSize:11, fontWeight:500, color:"#aaa", marginTop:2 }}>{fmtRange(comp.dates.start, comp.dates.end)}</div>
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0, marginLeft:10 }}>
                            <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:comp.theme.accentSoft, color:comp.theme.accentText }}>{comp.theme.tag}</span>
                            <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, ...badge.style }}>{badge.label}</span>
                          </div>
                          <span style={{ color:"#ccc", fontSize:18, marginLeft:6 }}>›</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign:"center", fontSize:12, fontWeight:700, color:"#c8c6c0", letterSpacing:0.5, padding:"10px 0 18px", flexShrink:0 }}>Powered by KINsight™</div>
          </div>
        )}

        {/* DETAIL */}
        {screen === "detail" && activeComp && (
          <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 0", flexShrink:0 }}>
              <button className="mobile-btn-nav" onClick={goHome} style={{ width:34, height:34, border:"none", background:"rgba(0,0,0,0.07)", borderRadius:"50%", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#444" }}>‹</button>
              <button className="mobile-btn-nav" onClick={goHome} style={{ width:34, height:34, border:"none", background:"rgba(0,0,0,0.07)", borderRadius:"50%", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#444" }}>✕</button>
            </div>
            <div style={{ padding:"18px 24px 0", display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
              {activeComp.theme.logo ? (
                <div style={{ background:activeComp.theme.accentSoft, borderRadius:16, padding:"16px 24px", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                  <img src={`/${activeComp.theme.logo}`} alt={activeComp.theme.logoAlt||activeComp.name} style={{ maxHeight:68, maxWidth:260, objectFit:"contain", mixBlendMode:"multiply" }} />
                </div>
              ) : (
                <div style={{ fontSize:56, lineHeight:1 }}>{activeComp.emoji}</div>
              )}
            </div>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:12, padding:"20px 20px 24px" }}>
              {SECTIONS.map(sec => (
                <button key={sec.key} className="mobile-section-btn" onClick={() => openSection(sec.key)}
                  style={{ border:"none", borderRadius:16, padding:"20px 24px", fontSize:17, fontWeight:700, letterSpacing:0.2, cursor:"pointer", textAlign:"center", background:activeComp.theme.accent, color:activeComp.theme.btnTextColor||"#fff", boxShadow:"0 4px 14px rgba(0,0,0,0.14)" }}>
                  {sec.label}
                </button>
              ))}
            </div>
            <div style={{ textAlign:"center", fontSize:12, fontWeight:700, color:"#c8c6c0", letterSpacing:0.5, padding:"10px 0 18px", flexShrink:0 }}>Powered by KINsight™</div>
          </div>
        )}

        {/* CONTENT */}
        {screen === "content" && activeComp && activeSection && (
          <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden", background:activeComp.theme.accent }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 0", flexShrink:0 }}>
              <button className="mobile-btn-nav" onClick={backToDetail} style={{ width:34, height:34, border:"none", background:"rgba(255,255,255,0.22)", borderRadius:"50%", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>‹</button>
              <button className="mobile-btn-nav" onClick={goHome} style={{ width:34, height:34, border:"none", background:"rgba(255,255,255,0.22)", borderRadius:"50%", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>✕</button>
            </div>
            <div style={{ padding:"12px 20px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
              {activeComp.theme.logo ? (
                <div style={{ background:"rgba(255,255,255,0.18)", borderRadius:12, padding:"8px 18px" }}>
                  <img src={`/${activeComp.theme.logo}`} alt={activeComp.theme.logoAlt||activeComp.name} style={{ maxHeight:36, maxWidth:140, objectFit:"contain", display:"block" }} />
                </div>
              ) : (
                <div style={{ fontSize:32 }}>{activeComp.emoji}</div>
              )}
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, color:"rgba(255,255,255,0.75)" }}>{activeSectionMeta?.label}</div>
            </div>
            <div ref={contentCardRef} style={{ flex:1, overflowY:"auto", margin:0, borderRadius:0, padding:"22px 20px", background:"rgba(0,0,0,0.18)", color:activeComp.theme.btnTextColor&&activeComp.theme.btnTextColor!=="#fff"?activeComp.theme.btnTextColor:"#fff" }}>
              <style>{`
                .mobile-content h3{font-size:17px;font-weight:800;margin-bottom:12px;color:inherit;}
                .mobile-content p{font-size:14px;line-height:1.65;opacity:0.92;margin-bottom:10px;color:inherit;}
                .mobile-content ul{padding-left:18px;margin-bottom:10px;}
                .mobile-content li{font-size:14px;line-height:1.65;opacity:0.92;margin-bottom:5px;color:inherit;}
                .mobile-content strong{font-weight:700;}
              `}</style>
              <div className="mobile-content"><SectionContent comp={activeComp} section={activeSection} /></div>
            </div>
            <div style={{ textAlign:"center", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.45)", letterSpacing:0.5, padding:"10px 0 18px", flexShrink:0 }}>Powered by KINsight™</div>
          </div>
        )}

        {/* SOON */}
        {screen === "soon" && activeComp && (
          <div style={{ display:"flex", flexDirection:"column", flex:1, alignItems:"center", justifyContent:"center", position:"relative" }}>
            <div style={{ position:"absolute", top:16, right:20 }}>
              <button className="mobile-btn-nav" onClick={goHome} style={{ width:34, height:34, border:"none", background:"rgba(0,0,0,0.07)", borderRadius:"50%", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#444" }}>✕</button>
            </div>
            <div style={{ textAlign:"center", padding:"40px 28px" }}>
              {activeComp.theme.logo ? (
                <div style={{ marginBottom:16, display:"flex", justifyContent:"center" }}>
                  <div style={{ background:activeComp.theme.accentSoft, borderRadius:16, padding:"16px 24px" }}>
                    <img src={`/${activeComp.theme.logo}`} alt={activeComp.name} style={{ height:56, maxWidth:200, objectFit:"contain", display:"block", mixBlendMode:"multiply" }} />
                  </div>
                </div>
              ) : (
                <div style={{ fontSize:52, marginBottom:16 }}>{activeComp.emoji}</div>
              )}
              <div style={{ fontSize:22, fontWeight:800, color:"#1a1a1a", marginBottom:8 }}>{activeComp.name}</div>
              <div style={{ fontSize:14, color:"#888", lineHeight:1.5, marginBottom:28 }}>Content for this competition is coming soon. Check back before it begins!</div>
              <button onClick={goHome} style={{ border:"none", borderRadius:14, padding:"14px 32px", fontSize:15, fontWeight:700, color:activeComp.theme.btnTextColor||"#fff", background:activeComp.theme.accent, cursor:"pointer" }}>← Back to Programs</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// MAIN — responsive switcher
// ─────────────────────────────────────────────

export default function Page() {
  const [testMode, setTestMode] = useState(false);
  const now = testMode ? TEST_NOW_DATE : new Date();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("test") === "feb22") setTestMode(true);
  }, []);

  return (
    <TestModeContext.Provider value={testMode}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        #layout-desktop { display: none; }
        #layout-mobile  { display: flex; }
        @media (min-width: 768px) {
          #layout-desktop { display: block; }
          #layout-mobile  { display: none; }
          body { background: #e8e8e0; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 99px; }
        }
        @media (max-width: 767px) {
          body { background: #e8e8e0; min-height: 100dvh; align-items: flex-start; justify-content: center; }
          ::-webkit-scrollbar { width: 3px; }
          ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 99px; }
        }
        @media (min-width: 480px) and (max-width: 767px) {
          body { padding: 32px 16px; align-items: center; }
          #mobile-shell {
            min-height: 820px !important; max-height: 820px !important;
            border-radius: 44px !important;
            box-shadow: 0 24px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12) !important;
            overflow: hidden !important;
          }
        }
        ::-webkit-scrollbar-track { background: transparent; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {testMode && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
          background: "#fbbf24", color: "#1a1a1a",
          textAlign: "center", fontSize: 12, fontWeight: 700,
          padding: "6px 12px", letterSpacing: "0.3px",
        }}>
          ⚠️ TEST MODE — Feb 22–28 data &nbsp;·&nbsp; today = Feb 25, 2026
        </div>
      )}

      <div style={testMode ? { paddingTop: 30 } : undefined}>
        {/* Desktop — always mounted, CSS-toggled */}
        <div id="layout-desktop">
          <DesktopLayout now={now} />
        </div>
        {/* Mobile — always mounted, CSS-toggled */}
        <div id="layout-mobile" style={{ width:"100%", justifyContent:"center" }}>
          <div id="mobile-shell" style={{ width:"100%", maxWidth:390, minHeight:"100dvh", display:"flex", flexDirection:"column" }}>
            <MobileLayout now={now} />
          </div>
        </div>
      </div>
    </TestModeContext.Provider>
  );
}
