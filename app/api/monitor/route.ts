import { desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/db";
import { programs, sourceMonitors, sourceSnapshots } from "@/db/schema";

const MAX_PROGRAMS_PER_RUN = 8;
const OPEN_PATTERNS = [
  /applications?\s+(?:are|is)\s+(?:now\s+)?open/i,
  /now\s+accepting\s+applications?/i,
  /application\s+period\s+(?:is\s+)?open/i,
  /(?:现已|正在)?开放申请/,
  /(?:现已|正在)接受申请/,
];

type ProgramPayload = {
  applicationStatus?: string;
  applicationStatusNote?: string;
  applicationStatusCheckedAt?: string;
  applicationStatusSource?: string;
  [key: string]: unknown;
};

async function signedInUser() {
  const requestHeaders = await headers();
  return requestHeaders.get("oai-authenticated-user-id");
}

export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get("programIds")?.split(",").map((value) => value.trim()).filter(Boolean).slice(0, 30) ?? [];
  if (!ids.length) return Response.json({ snapshots: [] });

  try {
    const rows = await getDb().select().from(sourceSnapshots)
      .where(inArray(sourceSnapshots.programId, ids))
      .orderBy(desc(sourceSnapshots.checkedAt))
      .limit(60);
    return Response.json({ snapshots: rows });
  } catch {
    return Response.json({ error: "巡检数据库暂不可用" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!await signedInUser()) return Response.json({ error: "需要登录后才能运行巡检" }, { status: 401 });

  let payload: { programIds?: unknown };
  try {
    payload = await request.json() as { programIds?: unknown };
  } catch {
    return Response.json({ error: "巡检项目格式无效" }, { status: 400 });
  }
  if (!Array.isArray(payload.programIds)) return Response.json({ error: "请提供需要巡检的项目" }, { status: 400 });
  const ids = [...new Set(payload.programIds.filter((id): id is string => typeof id === "string" && id.length <= 180))].slice(0, MAX_PROGRAMS_PER_RUN);
  if (!ids.length) return Response.json({ error: "没有可巡检的项目" }, { status: 400 });

  try {
    const db = getDb();
    const targetPrograms = await db.select().from(programs).where(inArray(programs.id, ids));
    const checks = [];
    for (const program of targetPrograms) {
      checks.push(await checkProgram(program, db));
    }
    return Response.json({ checks, checkedAt: new Date().toISOString() });
  } catch {
    return Response.json({ error: "巡检暂不可用，请稍后重试" }, { status: 503 });
  }
}

async function checkProgram(program: typeof programs.$inferSelect, db: ReturnType<typeof getDb>) {
  const checkedAt = new Date().toISOString();
  const monitorId = program.id;
  let httpStatus: number | null = null;
  let pageTitle = "";
  let contentHash = "";
  let openSignal = false;
  let note = "";
  let status = "已核验";

  try {
    const response = await fetch(program.source, { redirect: "follow", headers: { "accept": "text/html,application/xhtml+xml" } });
    httpStatus = response.status;
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok) {
      status = "链接异常";
      note = `官方来源返回 HTTP ${response.status}`;
    } else if (!/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
      status = "需人工复核";
      note = `来源不是可安全解析的网页（${contentType || "未知类型"}）`;
    } else {
      const raw = (await response.text()).slice(0, 700_000);
      const text = raw.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      pageTitle = matchTitle(raw);
      contentHash = await digest(text);
      openSignal = OPEN_PATTERNS.some((pattern) => pattern.test(text));
      note = openSignal
        ? "页面出现明确的申请开放措辞，已更新为“已开始申请”；仍请在提交前核对轮次和时区。"
        : "未检测到足以自动确认开放的强信号；保留现有申请状态。";
    }
  } catch {
    status = "链接异常";
    note = "无法读取官方来源；可能是临时网络问题、访问限制或页面已变更。";
  }

  const previous = await db.select().from(sourceMonitors).where(eq(sourceMonitors.id, monitorId)).limit(1);
  const changed = Boolean(contentHash && previous[0]?.lastContentHash && previous[0].lastContentHash !== contentHash);
  if (status === "已核验" && changed) status = "页面变更";
  if (status === "已核验" && !contentHash) status = "需人工复核";

  await db.insert(sourceMonitors).values({
    id: monitorId,
    programId: program.id,
    sourceUrl: program.source,
    sourceLabel: program.sourceLabel || "项目官网",
    lastCheckedAt: checkedAt,
    lastStatus: status,
    lastHttpStatus: httpStatus,
    lastContentHash: contentHash,
    lastChangedAt: changed ? checkedAt : previous[0]?.lastChangedAt ?? "",
    openSignal: openSignal ? 1 : 0,
    note,
  }).onConflictDoUpdate({
    target: sourceMonitors.id,
    set: {
      sourceUrl: program.source,
      sourceLabel: program.sourceLabel || "项目官网",
      lastCheckedAt: checkedAt,
      lastStatus: status,
      lastHttpStatus: httpStatus,
      lastContentHash: contentHash,
      lastChangedAt: changed ? checkedAt : previous[0]?.lastChangedAt ?? "",
      openSignal: openSignal ? 1 : 0,
      note,
    },
  });

  await db.insert(sourceSnapshots).values({
    id: crypto.randomUUID(),
    monitorId,
    programId: program.id,
    sourceUrl: program.source,
    checkedAt,
    httpStatus,
    status,
    contentHash,
    pageTitle,
    openSignal: openSignal ? 1 : 0,
    note,
  });

  let updatedStatus = false;
  if (openSignal) {
    const sourcePayload = parsePayload(program.sourcePayloadJson);
    if (sourcePayload.applicationStatus !== "已开始申请") {
      updatedStatus = true;
      await db.update(programs).set({
        sourcePayloadJson: JSON.stringify({
          ...sourcePayload,
          applicationStatus: "已开始申请",
          applicationStatusCheckedAt: checkedAt.slice(0, 10),
          applicationStatusNote: `自动巡检于 ${checkedAt.slice(0, 10)} 在官方页面检测到明确的申请开放措辞；请在提交前再核对轮次、截止日期和时区。`,
          applicationStatusSource: program.source,
        }),
        updated: checkedAt.slice(0, 10),
      }).where(eq(programs.id, program.id));
    }
  }

  return { programId: program.id, status, httpStatus, pageTitle, openSignal, changed, updatedStatus, note, checkedAt };
}

function parsePayload(value: string): ProgramPayload {
  try { return JSON.parse(value) as ProgramPayload; } catch { return {}; }
}

function matchTitle(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  return title.replace(/\s+/g, " ").trim().slice(0, 220);
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((value) => value.toString(16).padStart(2, "0")).join("");
}
