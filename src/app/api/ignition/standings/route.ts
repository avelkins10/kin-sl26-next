import { NextResponse } from "next/server";

const QB_TOKEN = process.env.QUICKBASE_TOKEN!;
const QB_REALM = process.env.QB_REALM || "kin.quickbase.com";
const QB_TABLE = process.env.QB_TABLE || "br9kwm8na";
const RC_KEY   = process.env.REPCARD_API_KEY!;

const QB_HEADERS = {
  "QB-Realm-Hostname": QB_REALM,
  Authorization: `QB-USER-TOKEN ${QB_TOKEN}`,
  "Content-Type": "application/json",
};

// ─── FIDs ────────────────────────────────────
const FID = {
  status:      255,
  saleDate:    522,
  closerRcId:  2277,
  setterRcId:  2279,
  setterName:  337,
  closerName:  517,
  systemKw:    13,
};

// ─── Round windows ────────────────────────────
interface RoundDef {
  round: number;
  label: string;
  start: string;
  end: string;
  targets: { Rookie: number; Veteran: number; Closer: number };
}

const ROUNDS: RoundDef[] = [
  { round: 1, label: "Round 1", start: "2026-04-06", end: "2026-04-12", targets: { Rookie: 1, Veteran: 3, Closer: 5 } },
  { round: 2, label: "Round 2", start: "2026-04-13", end: "2026-04-19", targets: { Rookie: 1, Veteran: 3, Closer: 5 } },
  { round: 3, label: "Round 3", start: "2026-04-20", end: "2026-04-26", targets: { Rookie: 2, Veteran: 4, Closer: 6 } },
  { round: 4, label: "Round 4", start: "2026-04-27", end: "2026-05-03", targets: { Rookie: 2, Veteran: 4, Closer: 6 } },
];

const IGNITION_START = new Date("2026-04-06");
const IGNITION_END   = new Date("2026-05-03T23:59:59");

function getCurrentRound(now: Date): RoundDef | null {
  for (const r of ROUNDS) {
    const start = new Date(r.start);
    const end   = new Date(r.end + "T23:59:59");
    if (now >= start && now <= end) return r;
  }
  return null;
}

// ─── QB helper ───────────────────────────────

interface QBRecord {
  [fieldId: string]: { value: unknown };
}

function val(r: QBRecord, fid: number): unknown {
  return r[String(fid)]?.value ?? null;
}

async function qbQuery(where: string, select: number[]): Promise<QBRecord[]> {
  const body = {
    from: QB_TABLE,
    select,
    where,
    options: { top: 1000 },
  };
  const resp = await fetch("https://api.quickbase.com/v1/records/query", {
    method: "POST",
    headers: QB_HEADERS,
    body: JSON.stringify(body),
    next: { revalidate: 900 },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`QB query failed ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  return (data.data || []) as QBRecord[];
}

// ─── RepCard helper ───────────────────────────

interface RCUser {
  id: number;
  firstName?: string;
  status?: string;
}

async function fetchRookieIds(): Promise<Set<string>> {
  const resp = await fetch("https://app.repcard.com/api/users?limit=500", {
    headers: { "X-API-Key": RC_KEY },
    next: { revalidate: 900 },
  });
  if (!resp.ok) throw new Error(`RepCard failed ${resp.status}`);
  const data = await resp.json();
  const users: RCUser[] = Array.isArray(data) ? data : (data?.result?.data ?? data?.result ?? data?.data ?? []);

  const rookieIds = new Set<string>();
  for (const u of users) {
    if (u.status === "ACTIVE" && u.firstName?.startsWith("R - ")) {
      rookieIds.add(String(u.id));
    }
  }
  return rookieIds;
}

// ─── Route handler ────────────────────────────

export async function GET() {
  const now = new Date();

  if (now < IGNITION_START) {
    return NextResponse.json({ status: "not_started" });
  }
  if (now > IGNITION_END) {
    return NextResponse.json({ status: "ended" });
  }

  const currentRound = getCurrentRound(now);
  if (!currentRound) {
    // Between rounds shouldn't happen given windows, but safety fallback
    return NextResponse.json({ status: "not_started" });
  }

  try {
    // Parallel fetch QB + RepCard
    const [rookieIds, records] = await Promise.all([
      fetchRookieIds(),
      qbQuery(
        `({${FID.status}.EX.KCA}OR{${FID.status}.EX.Active})AND{${FID.saleDate}.OAF.${currentRound.start}}AND{${FID.saleDate}.OBF.${currentRound.end}}`,
        [FID.status, FID.saleDate, FID.closerRcId, FID.setterRcId, FID.setterName, FID.closerName, FID.systemKw]
      ),
    ]);

    // Aggregate per rep
    type Role = "Rookie" | "Veteran Setter" | "Closer";
    const repMap = new Map<string, { name: string; role: Role; kca: number; kw: number }>();

    for (const r of records) {
      const closerRcId  = val(r, FID.closerRcId)  ? String(val(r, FID.closerRcId))  : null;
      const setterRcId  = val(r, FID.setterRcId)  ? String(val(r, FID.setterRcId))  : null;
      const closerName  = val(r, FID.closerName)  ? String(val(r, FID.closerName))  : null;
      const setterName  = val(r, FID.setterName)  ? String(val(r, FID.setterName))  : null;
      const kw          = Number(val(r, FID.systemKw) ?? 0);

      let name: string;
      let role: Role;
      let key: string;

      if (closerRcId) {
        // Closer (or both populated — closer wins)
        name = closerName || closerRcId;
        role = "Closer";
        key  = `closer:${closerRcId}`;
      } else if (setterRcId) {
        name = setterName || setterRcId;
        role = rookieIds.has(setterRcId) ? "Rookie" : "Veteran Setter";
        key  = `setter:${setterRcId}`;
      } else {
        continue; // no RC ID — skip
      }

      const existing = repMap.get(key);
      if (existing) {
        existing.kca += 1;
        existing.kw  += kw;
      } else {
        repMap.set(key, { name, role, kca: 1, kw });
      }
    }

    const reps = Array.from(repMap.values()).map((rep) => {
      const targetKey = rep.role === "Veteran Setter" ? "Veteran" : rep.role;
      const target = currentRound.targets[targetKey as keyof typeof currentRound.targets];
      return {
        name: rep.name,
        role: rep.role,
        kca:  rep.kca,
        kw:   Math.round(rep.kw * 100) / 100,
        qualified: rep.kca >= target,
      };
    });

    return NextResponse.json({
      round:      currentRound.round,
      roundLabel: currentRound.label,
      startDate:  currentRound.start,
      endDate:    currentRound.end,
      targets:    currentRound.targets,
      updatedAt:  now.toISOString(),
      reps,
    });
  } catch (err) {
    console.error("[ignition/standings]", err);
    return NextResponse.json(
      { error: "Failed to fetch standings", detail: String(err) },
      { status: 500 }
    );
  }
}
