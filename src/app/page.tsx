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
  group: "sl26" | "summer" | "yearlong";
  stub: boolean;
  dates: { start: string; end: string };
  subtitle: string;
  theme: CompTheme;
  rounds?: Round[];
  bloodTiers?: { label: string; prize: string }[];
}

type MobileScreen = "home" | "detail" | "content" | "soon";
type SectionKey = "rules" | "metrics" | "incentives" | "standings";

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

const GROUPS: { key: Comp["group"]; label: string }[] = [
  { key: "sl26",     label: "SL26 Programs" },
  { key: "summer",   label: "Summer Long" },
  { key: "yearlong", label: "Year Long" },
];

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "rules",      label: "Rules" },
  { key: "metrics",    label: "Metrics" },
  { key: "incentives", label: "Incentives" },
  { key: "standings",  label: "Standings" },
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

function statusBadge(comp: Comp, now: Date): { label: string; style: React.CSSProperties } {
  if (comp.stub) return { label: "SOON", style: { background: "rgba(0,0,0,0.05)", color: "#aaa" } };
  const s = getStatus(comp, now);
  if (s === "live")     return { label: "LIVE",     style: { background: "rgba(34,197,94,0.12)", color: "#16a34a" } };
  if (s === "upcoming") return { label: "UPCOMING", style: { background: "rgba(0,0,0,0.06)",    color: "#888" } };
  return { label: "DONE", style: { background: "rgba(0,0,0,0.04)", color: "#bbb" } };
}

function fmt(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─────────────────────────────────────────────
// SHARED: ICON TILE
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

interface IgnitionData {
  status?: "not_started" | "ended";
  round?: number;
  roundLabel?: string;
  startDate?: string;
  endDate?: string;
  targets?: { Rookie: number; Veteran: number; Closer: number };
  updatedAt?: string;
  reps?: { name: string; role: "Rookie" | "Veteran Setter" | "Closer"; kca: number; kw: number; qualified: boolean }[];
}

function IgnitionStandingsContent() {
  const [data, setData] = useState<IgnitionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (new Date() < new Date("2026-04-06")) {
      setData({ status: "not_started" }); setLoading(false); return;
    }
    fetch("/api/ignition/standings")
      .then(r => r.json()).then((d: IgnitionData) => { setData(d); setLoading(false); })
      .catch(() => { setData({ status: "not_started" }); setLoading(false); });
  }, []);

  const rankStyles: Record<number, React.CSSProperties> = {
    1: { background: "#f5c842", color: "#1a1a1a" },
    2: { background: "#c0c0c0", color: "#1a1a1a" },
    3: { background: "#cd7f32", color: "#fff" },
  };

  if (loading) return <p style={{ opacity: 0.7, fontSize: 14 }}>Loading standings…</p>;

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
              <thead><tr>{["#","Rep","KCA"].map((h,i) => <th key={h} style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(255,255,255,0.55)", textAlign: i===2?"right":"left", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>{h}</th>)}</tr></thead>
              <tbody><tr><td colSpan={3} style={{ textAlign: "center", padding: "16px 0", opacity: 0.5, fontSize: 13 }}>Starts {r.dates.split("–")[0].trim()}</td></tr></tbody>
            </table>
          </div>
        ))}
      </>
    );
  }

  if (data.status === "ended") return <><h3>Ignition Complete</h3><p>Season ended May 3.</p></>;

  const roles: Array<"Rookie"|"Veteran Setter"|"Closer"> = ["Rookie","Veteran Setter","Closer"];
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ marginBottom: 0 }}>{data.roundLabel} · {fmt(data.startDate!)}–{fmt(data.endDate!)}</h3>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
      </div>
      {roles.map(role => {
        const reps = (data.reps||[]).filter(r=>r.role===role).sort((a,b)=>b.kca-a.kca);
        const target = data.targets?.[role==="Veteran Setter"?"Veteran":role]??1;
        return (
          <div key={role} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, marginBottom: 8 }}>{role}</div>
            {reps.length===0 ? <div style={{ fontSize: 13, opacity: 0.5, fontStyle: "italic" }}>No data yet</div> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["#","Rep","KCA"].map((h,i)=><th key={h} style={{ fontSize: 10, textTransform:"uppercase", letterSpacing:"0.8px", color:"rgba(255,255,255,0.55)", textAlign:i===2?"right":"left", paddingBottom:8, borderBottom:"1px solid rgba(255,255,255,0.15)" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {reps.map((rep,i)=>(
                    <tr key={rep.name}>
                      <td style={{ padding:"9px 0", fontSize:13, borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                        <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:22, height:22, borderRadius:"50%", fontSize:11, fontWeight:800, ...(rankStyles[i+1]||{background:"rgba(255,255,255,0.15)",color:"#fff"}) }}>{i+1}</span>
                      </td>
                      <td style={{ padding:"9px 0", fontSize:13, color:"#fff", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>{rep.name}{rep.qualified&&" ✅"}</td>
                      <td style={{ padding:"9px 0", fontSize:13, color:"#fff", textAlign:"right", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>{rep.kca}/{target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
      {data.updatedAt && <p style={{ fontSize:11, opacity:0.5, marginTop:4 }}>Updated {new Date(data.updatedAt).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</p>}
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
        <h3>How Blood Club Works</h3>
        <p>The ultimate closer challenge — running all year. Close <strong>2 deals on the same Saturday</strong> to earn membership.</p>
        <ul><li>Both closes must share the same sale date in QuickBase</li><li>That date must fall on a Saturday</li><li>Both deals must reach KCA status</li><li>Achievement is permanent — once you&apos;re in, you&apos;re in</li></ul>
        <p>Rookies only need 1 same-day Saturday close to qualify.</p>
      </>
    );
    return <p style={{ opacity: 0.8 }}>Rules coming soon.</p>;
  }

  // Metrics
  if (section === "metrics") {
    if (comp.id === "ignition" && comp.rounds) return (
      <>
        <h3>KCA Targets by Round</h3>
        <p>Hit your role&apos;s weekly target to win. Every qualifying rep wins — no cap.</p>
        {comp.rounds.map(r => (
          <div key={r.label} style={{ background:"rgba(255,255,255,0.12)", borderRadius:12, padding:14, marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div><div style={{ fontSize:14, fontWeight:700 }}>{r.label}</div><div style={{ fontSize:12, opacity:0.7 }}>{r.dates}</div></div>
              <div style={{ fontSize:11, fontWeight:700, background:"rgba(255,255,255,0.2)", padding:"3px 10px", borderRadius:20 }}>{r.prize}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {Object.entries(r.targets!).map(([role,n])=>(
                <div key={role} style={{ flex:1, textAlign:"center", background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 4px" }}>
                  <div style={{ fontSize:22, fontWeight:900 }}>{n}</div>
                  <div style={{ fontSize:10, opacity:0.7, marginTop:1 }}>{role}</div>
                  <div style={{ fontSize:10, opacity:0.5 }}>KCA</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    );
    if (comp.id === "blood-club") return (
      <>
        <h3>The Qualifying Standard</h3>
        <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:12, padding:14, marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div><div style={{ fontSize:14, fontWeight:700 }}>2 Closes</div><div style={{ fontSize:12, opacity:0.7 }}>Same Saturday</div></div>
            <div style={{ fontSize:11, fontWeight:700, background:"rgba(255,255,255,0.2)", padding:"3px 10px", borderRadius:20 }}>Blood Club Entry</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[{n:"2",role:"Closes",unit:"same day"},{n:"1",role:"Saturday",unit:"any week"},{n:"KCA",role:"Status",unit:"required"}].map(c=>(
              <div key={c.role} style={{ flex:1, textAlign:"center", background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 4px" }}>
                <div style={{ fontSize:22, fontWeight:900 }}>{c.n}</div>
                <div style={{ fontSize:10, opacity:0.7, marginTop:1 }}>{c.role}</div>
                <div style={{ fontSize:10, opacity:0.5 }}>{c.unit}</div>
              </div>
            ))}
          </div>
        </div>
        <p>Both deals must reach KCA status. Saturdays only.</p>
      </>
    );
    return <p style={{ opacity:0.8 }}>Metrics coming soon.</p>;
  }

  // Incentives
  if (section === "incentives") {
    if (comp.id === "ignition" && comp.rounds) return (
      <>
        <h3>Round Prizes</h3>
        <p>Earn every round independently — each week resets. Hit the target, win the prize.</p>
        {comp.rounds.map(r => {
          const photo = IGNITION_PRIZE_PHOTOS[r.label];
          return (
            <div key={r.label} style={{ background:"rgba(255,255,255,0.12)", borderRadius:12, padding:14, marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: photo?8:0 }}>
                <div><div style={{ fontSize:14, fontWeight:700 }}>{r.label}</div><div style={{ fontSize:12, opacity:0.7 }}>{r.dates}</div></div>
              </div>
              {photo && (
                <div style={{ borderRadius:12, overflow:"hidden", background:"rgba(0,0,0,0.2)", marginTop:4 }}>
                  <img src={`/${photo}`} alt={r.prize} style={{ width:"100%", maxHeight:200, objectFit:"contain", display:"block" }} />
                  <div style={{ textAlign:"center", padding:"10px 12px 12px", fontSize:14, fontWeight:700 }}>{r.prize}</div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
    if (comp.id === "blood-club" && comp.bloodTiers) return (
      <>
        <h3>Blood Club Rewards</h3>
        <p>Permanent status + exclusive member-only incentives all year.</p>
        {comp.bloodTiers.map(t=>(
          <div key={t.label} style={{ background:"rgba(255,255,255,0.12)", borderRadius:12, padding:14, marginBottom:10 }}>
            <div style={{ fontSize:11, opacity:0.7, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>{t.label}</div>
            <div style={{ fontSize:16, fontWeight:800 }}>{t.prize}</div>
          </div>
        ))}
      </>
    );
    return <p style={{ opacity:0.8 }}>Incentives coming soon.</p>;
  }

  // Standings
  if (section === "standings") {
    if (comp.id === "ignition") return <IgnitionStandingsContent />;
    if (comp.id === "blood-club") return (
      <>
        <h3>Blood Club Members — 2026</h3>
        <p>Closers who earned membership by closing 2 deals on a Saturday.</p>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["#","Closer","Date","Entries"].map((h,i)=><th key={h} style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.8px", color:"rgba(255,255,255,0.55)", textAlign:i===3?"right":"left", paddingBottom:8, borderBottom:"1px solid rgba(255,255,255,0.15)" }}>{h}</th>)}</tr></thead>
          <tbody><tr><td colSpan={4} style={{ textAlign:"center", padding:"24px 0", opacity:0.5, fontSize:13 }}>No members yet — be the first 🩸</td></tr></tbody>
        </table>
      </>
    );
    return <p style={{ opacity:0.8 }}>Standings coming soon.</p>;
  }

  return null;
}

// ─────────────────────────────────────────────
// DESKTOP: DETAIL PANEL CONTENT
// ─────────────────────────────────────────────

function DesktopDetailPanel({ comp, now }: { comp: Comp; now: Date }) {
  const [activeSection, setActiveSection] = useState<SectionKey>("rules");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveSection("rules");
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
        <img src="/sl26-logo.png" alt="Street League SL26" style={{ height:40, objectFit:"contain" }} />
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
        kinsight<sup style={{ fontSize:8, verticalAlign:"super" }}>™</sup>
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
              <img src="/sl26-logo.png" alt="Street League SL26" style={{ height:36, objectFit:"contain" }} />
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
            <div style={{ textAlign:"center", fontSize:12, fontWeight:700, color:"#c8c6c0", letterSpacing:0.5, padding:"10px 0 18px", flexShrink:0 }}>kinsight<sup style={{ fontSize:8, verticalAlign:"super" }}>™</sup></div>
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
            <div style={{ textAlign:"center", fontSize:12, fontWeight:700, color:"#c8c6c0", letterSpacing:0.5, padding:"10px 0 18px", flexShrink:0 }}>kinsight<sup style={{ fontSize:8, verticalAlign:"super" }}>™</sup></div>
          </div>
        )}

        {/* CONTENT */}
        {screen === "content" && activeComp && activeSection && (
          <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 0", flexShrink:0 }}>
              <button className="mobile-btn-nav" onClick={backToDetail} style={{ width:34, height:34, border:"none", background:"rgba(0,0,0,0.07)", borderRadius:"50%", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#444" }}>‹</button>
              <button className="mobile-btn-nav" onClick={goHome} style={{ width:34, height:34, border:"none", background:"rgba(0,0,0,0.07)", borderRadius:"50%", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#444" }}>✕</button>
            </div>
            <div style={{ padding:"12px 20px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
              {activeComp.theme.logo ? (
                <div style={{ background:activeComp.theme.accentSoft, borderRadius:12, padding:"8px 18px" }}>
                  <img src={`/${activeComp.theme.logo}`} alt={activeComp.theme.logoAlt||activeComp.name} style={{ maxHeight:36, maxWidth:140, objectFit:"contain", display:"block", mixBlendMode:"multiply" }} />
                </div>
              ) : (
                <div style={{ fontSize:32 }}>{activeComp.emoji}</div>
              )}
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, color:activeComp.theme.accent }}>{activeSectionMeta?.label}</div>
            </div>
            <div ref={contentCardRef} style={{ flex:1, overflowY:"auto", margin:"12px 16px 0", borderRadius:20, padding:"22px 20px", background:activeComp.theme.accent, color:activeComp.theme.btnTextColor&&activeComp.theme.btnTextColor!=="#fff"?activeComp.theme.btnTextColor:"#fff" }}>
              <style>{`
                .mobile-content h3{font-size:17px;font-weight:800;margin-bottom:12px;color:inherit;}
                .mobile-content p{font-size:14px;line-height:1.65;opacity:0.92;margin-bottom:10px;color:inherit;}
                .mobile-content ul{padding-left:18px;margin-bottom:10px;}
                .mobile-content li{font-size:14px;line-height:1.65;opacity:0.92;margin-bottom:5px;color:inherit;}
                .mobile-content strong{font-weight:700;}
              `}</style>
              <div className="mobile-content"><SectionContent comp={activeComp} section={activeSection} /></div>
            </div>
            <div style={{ textAlign:"center", fontSize:12, fontWeight:700, color:"#c8c6c0", letterSpacing:0.5, padding:"10px 0 18px", flexShrink:0 }}>kinsight<sup style={{ fontSize:8, verticalAlign:"super" }}>™</sup></div>
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
  const [now] = useState(() => new Date());
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    setMounted(true);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Avoid layout flash on SSR
  if (!mounted) {
    return (
      <div style={{ minHeight:"100vh", background:"#e8e8e0", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:14, color:"#aaa" }}>Loading…</div>
      </div>
    );
  }

  return isDesktop ? (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 99px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
      <DesktopLayout now={now} />
    </>
  ) : (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #e8e8e0; min-height: 100dvh; display: flex; align-items: flex-start; justify-content: center; }
        @media (min-width: 480px) {
          body { padding: 32px 16px; align-items: center; }
          #mobile-shell { min-height: 820px !important; max-height: 820px !important; border-radius: 44px !important; box-shadow: 0 24px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12) !important; overflow: hidden !important; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
      <div id="mobile-shell">
        <MobileLayout now={now} />
      </div>
    </>
  );
}
