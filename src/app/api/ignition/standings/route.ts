import { NextRequest, NextResponse } from "next/server";

const QB_TOKEN = process.env.QUICKBASE_TOKEN!;
const QB_REALM = process.env.QB_REALM || "kin.quickbase.com";
const QB_TABLE = process.env.QB_TABLE || "br9kwm8na";
const RC_KEY   = process.env.REPCARD_API_KEY!;

const SUPABASE_URL = "https://yijofudhciynjzsmpsqp.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const QB_HEADERS = {
  "QB-Realm-Hostname": QB_REALM,
  Authorization: `QB-USER-TOKEN ${QB_TOKEN}`,
  "Content-Type": "application/json",
};

// ─── FIDs ────────────────────────────────────
const FID = {
  status:      255,
  saleDate:    522,
  kcaDate:     461,  // Intake Completed Date = date deal reached KCA status
  closerRcId:  2277,
  setterRcId:  2279,
  setterName:  337,
  closerName:  517,
  systemKw:    13,
};

// ─── Round definitions ────────────────────────
interface RoundDef {
  round:   number;
  label:   string;
  start:   string;  // YYYY-MM-DD
  end:     string;  // YYYY-MM-DD (Sunday — locks at 23:59:59 PT)
  targets: { Rookie: number; Veteran: number; Closer: number };
}

const ROUNDS: RoundDef[] = [
  { round: 1, label: "Round 1", start: "2026-04-06", end: "2026-04-12", targets: { Rookie: 1, Veteran: 3, Closer: 5 } },
  { round: 2, label: "Round 2", start: "2026-04-13", end: "2026-04-19", targets: { Rookie: 1, Veteran: 3, Closer: 5 } },
  { round: 3, label: "Round 3", start: "2026-04-20", end: "2026-04-26", targets: { Rookie: 2, Veteran: 4, Closer: 6 } },
  { round: 4, label: "Round 4", start: "2026-04-27", end: "2026-05-03", targets: { Rookie: 2, Veteran: 4, Closer: 6 } },
];

const COMPETITION = "ignition";
const IGNITION_START = new Date("2026-04-06T00:00:00-07:00"); // PT
const IGNITION_END   = new Date("2026-05-04T00:00:00-07:00"); // PT (after R4 locks)

// ─── Test mode ────────────────────────────────
const TEST_ROUND: RoundDef = {
  round: 1, label: "Round 1",
  start: "2026-02-22", end: "2026-02-28",
  targets: { Rookie: 1, Veteran: 3, Closer: 5 },
};
const TEST_NOW = new Date("2026-02-25T12:00:00");

// ─── Pacific-time round lock logic ───────────────────────────────────────────
// A round is "complete" when the Sunday end date has passed 23:59:59 PT.
function isRoundComplete(round: RoundDef, now: Date): boolean {
  // Build lock time: end date + 23:59:59 in Pacific Time
  // PT is UTC-8 (PST) or UTC-7 (PDT). Apr–May is PDT (UTC-7).
  // We use -07:00 for the Ignition season (April–May).
  const lockTime = new Date(`${round.end}T23:59:59-07:00`);
  return now >= lockTime;
}

function getCurrentRound(now: Date): RoundDef | null {
  for (const r of ROUNDS) {
    const start   = new Date(`${r.start}T00:00:00-07:00`);
    const lockEnd = new Date(`${r.end}T23:59:59-07:00`);
    if (now >= start && now < lockEnd) return r;
  }
  return null;
}

// ─── QB helpers ───────────────────────────────
interface QBRecord { [fid: string]: { value: unknown } }
function val(r: QBRecord, fid: number): unknown { return r[String(fid)]?.value ?? null; }

async function qbQuery(where: string, select: number[]): Promise<QBRecord[]> {
  const resp = await fetch("https://api.quickbase.com/v1/records/query", {
    method: "POST",
    headers: QB_HEADERS,
    body: JSON.stringify({ from: QB_TABLE, select, where, options: { top: 1000 } }),
    next: { revalidate: 0 },
  });
  if (!resp.ok) throw new Error(`QB ${resp.status}: ${await resp.text()}`);
  return ((await resp.json()).data ?? []) as QBRecord[];
}

// ─── RepCard helper ───────────────────────────
interface RCUser { id: number; firstName?: string; status?: string }

async function fetchRookieIds(): Promise<Set<string>> {
  const rookieIds = new Set<string>();
  let page = 1, totalPages = 1;
  while (page <= totalPages) {
    const resp = await fetch(`https://app.repcard.com/api/users?limit=100&page=${page}`, {
      headers: { "X-API-Key": RC_KEY },
      next: { revalidate: 900 },
    });
    if (!resp.ok) throw new Error(`RepCard ${resp.status}`);
    const data = await resp.json();
    const result = data?.result ?? data;
    const users: RCUser[] = Array.isArray(result) ? result : (result?.data ?? []);
    totalPages = result?.totalPages ?? 1;
    for (const u of users) {
      if (u.status === "ACTIVE" && u.firstName?.startsWith("R - ")) {
        rookieIds.add(String(u.id));
      }
    }
    page++;
  }
  return rookieIds;
}

// ─── Supabase helpers ─────────────────────────
export type RepResult = { name: string; role: string; kca: number; kw: number; qualified: boolean };

interface DBSnapshot {
  competition: string;
  round: number;
  round_label: string;
  start_date: string;
  end_date: string;
  targets: Record<string, number>;
  reps: RepResult[];
  frozen_at: string;
}

async function readSnapshot(competition: string, round: number): Promise<DBSnapshot | null> {
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/competition_round_snapshots?competition=eq.${competition}&round=eq.${round}&limit=1`,
    { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
  );
  if (!resp.ok) return null;
  const rows: DBSnapshot[] = await resp.json();
  return rows[0] ?? null;
}

async function writeSnapshot(snap: DBSnapshot): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/competition_round_snapshots`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates",  // UNIQUE(competition, round) — skip if exists
    },
    body: JSON.stringify(snap),
  });
}

// ─── Live standings builder ───────────────────
async function buildLiveReps(round: RoundDef, rookieIds: Set<string>): Promise<RepResult[]> {
  // Use Sale Date (FID 522) to match Looker Studio — any deal with a sale date in the
  // window counts regardless of status (Active, On Hold, Rejected, Cancelled, etc.)
  const records = await qbQuery(
    `{${FID.saleDate}.OAF.${round.start}}AND{${FID.saleDate}.OBF.${round.end}}`,
    [FID.status, FID.saleDate, FID.closerRcId, FID.setterRcId, FID.setterName, FID.closerName, FID.systemKw]
  );

  type Role = "Rookie" | "Veteran Setter" | "Closer";
  const repMap = new Map<string, { name: string; role: Role; kca: number; kw: number }>();

  for (const r of records) {
    const closerRcId = val(r, FID.closerRcId) ? String(val(r, FID.closerRcId)) : null;
    const setterRcId = val(r, FID.setterRcId) ? String(val(r, FID.setterRcId)) : null;
    const closerName = val(r, FID.closerName) ? String(val(r, FID.closerName)) : null;
    const setterName = val(r, FID.setterName) ? String(val(r, FID.setterName)) : null;
    const kw         = Number(val(r, FID.systemKw) ?? 0);

    // Credit BOTH closer and setter — each earns their own KCA
    const credits: Array<{ key: string; name: string; role: Role }> = [];
    if (closerRcId) credits.push({ key: `closer:${closerRcId}`, name: closerName || closerRcId, role: "Closer" });
    if (setterRcId) credits.push({ key: `setter:${setterRcId}`, name: setterName || setterRcId, role: rookieIds.has(setterRcId) ? "Rookie" : "Veteran Setter" });
    if (!credits.length) continue;

    for (const { key, name, role } of credits) {
      const existing = repMap.get(key);
      if (existing) { existing.kca += 1; existing.kw += kw; }
      else repMap.set(key, { name, role, kca: 1, kw });
    }
  }

  return Array.from(repMap.values()).map(rep => {
    const targetKey = rep.role === "Veteran Setter" ? "Veteran" : rep.role;
    const target = round.targets[targetKey as keyof typeof round.targets];
    return { name: rep.name, role: rep.role, kca: rep.kca, kw: Math.round(rep.kw * 100) / 100, qualified: rep.kca >= target };
  });
}

// ─── Response types ───────────────────────────
export type RoundStatus = "upcoming" | "live" | "complete";

export interface RoundResponse {
  round:      number;
  roundLabel: string;
  startDate:  string;
  endDate:    string;
  targets:    Record<string, number>;
  status:     RoundStatus;
  reps?:      RepResult[];
  frozenAt?:  string;
  updatedAt?: string;
}

// ─── Route handler ────────────────────────────
export async function GET(req: NextRequest) {
  const testMode = req.nextUrl.searchParams.get("test") === "feb22";
  const now = testMode ? TEST_NOW : new Date();

  // Test mode: return single round response (backwards-compat)
  if (testMode) {
    const rookieIds = await fetchRookieIds();
    const reps = await buildLiveReps(TEST_ROUND, rookieIds);
    const roundResp: RoundResponse = {
      round: TEST_ROUND.round, roundLabel: TEST_ROUND.label,
      startDate: TEST_ROUND.start, endDate: TEST_ROUND.end,
      targets: TEST_ROUND.targets, status: "complete",
      reps, updatedAt: now.toISOString(),
    };
    return NextResponse.json({
      // Legacy fields for any existing consumers
      round: TEST_ROUND.round, roundLabel: TEST_ROUND.label,
      startDate: TEST_ROUND.start, endDate: TEST_ROUND.end,
      targets: TEST_ROUND.targets, updatedAt: now.toISOString(),
      testMode: true, reps,
      // New: all rounds array
      rounds: [roundResp],
    });
  }

  // Pre-launch
  if (now < IGNITION_START) {
    const rounds: RoundResponse[] = ROUNDS.map(r => ({
      round: r.round, roundLabel: r.label, startDate: r.start, endDate: r.end,
      targets: r.targets, status: "upcoming",
    }));
    return NextResponse.json({ status: "not_started", rounds });
  }

  // Post-event
  if (now >= IGNITION_END) {
    // All rounds complete — read all from Supabase
    const roundResponses: RoundResponse[] = await Promise.all(
      ROUNDS.map(async r => {
        const snap = await readSnapshot(COMPETITION, r.round);
        return {
          round: r.round, roundLabel: r.label, startDate: r.start, endDate: r.end,
          targets: r.targets, status: "complete" as RoundStatus,
          reps: snap?.reps ?? [], frozenAt: snap?.frozen_at,
        };
      })
    );
    return NextResponse.json({ status: "ended", rounds: roundResponses });
  }

  // Active competition — build all rounds
  try {
    const rookieIds = await fetchRookieIds();
    const currentRound = getCurrentRound(now);

    const roundResponses: RoundResponse[] = await Promise.all(
      ROUNDS.map(async (r): Promise<RoundResponse> => {
        const complete = isRoundComplete(r, now);
        const isLive   = currentRound?.round === r.round;
        const upcoming = !complete && !isLive;

        if (complete) {
          // Try Supabase first
          let snap = await readSnapshot(COMPETITION, r.round);
          if (!snap) {
            // First request after lock — build and freeze
            const reps = await buildLiveReps(r, rookieIds);
            const frozen_at = now.toISOString();
            snap = {
              competition: COMPETITION, round: r.round, round_label: r.label,
              start_date: r.start, end_date: r.end, targets: r.targets,
              reps, frozen_at,
            };
            await writeSnapshot(snap);  // fire-and-forget safe — ignore-duplicates
          }
          return {
            round: r.round, roundLabel: r.label, startDate: r.start, endDate: r.end,
            targets: r.targets, status: "complete",
            reps: snap.reps, frozenAt: snap.frozen_at,
          };
        }

        if (isLive) {
          const reps = await buildLiveReps(r, rookieIds);
          return {
            round: r.round, roundLabel: r.label, startDate: r.start, endDate: r.end,
            targets: r.targets, status: "live",
            reps, updatedAt: now.toISOString(),
          };
        }

        // Upcoming
        return {
          round: r.round, roundLabel: r.label, startDate: r.start, endDate: r.end,
          targets: r.targets, status: "upcoming",
        };
      })
    );

    // Legacy top-level fields for the live round (backwards compat)
    const liveRound = roundResponses.find(r => r.status === "live");

    return NextResponse.json({
      // Legacy fields
      round:      liveRound?.round,
      roundLabel: liveRound?.roundLabel,
      startDate:  liveRound?.startDate,
      endDate:    liveRound?.endDate,
      targets:    liveRound?.targets,
      updatedAt:  liveRound?.updatedAt,
      reps:       liveRound?.reps ?? [],
      // New
      rounds: roundResponses,
    });

  } catch (err) {
    console.error("[ignition/standings]", err);
    return NextResponse.json({ error: "Failed to fetch standings", detail: String(err) }, { status: 500 });
  }
}
