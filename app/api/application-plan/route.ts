import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/db";
import { applicationPlans } from "@/db/schema";

const STAGES = new Set(["研究中", "准备材料", "已提交"]);
const DOCUMENT_STATES = new Set(["待准备", "已准备", "已提交", "不适用"]);

type IncomingPlan = {
  id?: unknown;
  stage?: unknown;
  documents?: unknown;
  reminder?: unknown;
};

async function currentUserId() {
  const requestHeaders = await headers();
  return requestHeaders.get("oai-authenticated-user-id");
}

function jsonRecord(value: unknown, allowedValues: Set<string>) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([key, item]) => key.length <= 180 && typeof item === "string" && allowedValues.has(item)),
  );
}

function normalizePlan(value: IncomingPlan) {
  const id = typeof value.id === "string" ? value.id.trim().slice(0, 180) : "";
  if (!id) return null;
  const stage = typeof value.stage === "string" && STAGES.has(value.stage) ? value.stage : "研究中";
  const reminder = value.reminder && typeof value.reminder === "object" && !Array.isArray(value.reminder)
    ? { enabled: Boolean((value.reminder as Record<string, unknown>).enabled) }
    : { enabled: false };
  return {
    id,
    stage,
    documents: jsonRecord(value.documents, DOCUMENT_STATES),
    reminder,
  };
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "需要登录后才能同步申请计划" }, { status: 401 });

  try {
    const rows = await getDb()
      .select()
      .from(applicationPlans)
      .where(eq(applicationPlans.userId, userId))
      .orderBy(desc(applicationPlans.updatedAt));
    return Response.json({
      plans: rows.map((row) => ({
        id: row.programId,
        stage: row.stage,
        documents: parseJson(row.documentsJson, {}),
        reminder: parseJson(row.reminderJson, { enabled: false }),
        updatedAt: row.updatedAt,
      })),
    });
  } catch {
    return Response.json({ error: "申请计划数据库暂不可用" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "需要登录后才能同步申请计划" }, { status: 401 });

  let payload: { plans?: IncomingPlan[] };
  try {
    payload = await request.json() as { plans?: IncomingPlan[] };
  } catch {
    return Response.json({ error: "申请计划格式无效" }, { status: 400 });
  }

  if (!Array.isArray(payload.plans) || payload.plans.length > 80) {
    return Response.json({ error: "申请计划数量或格式无效" }, { status: 400 });
  }

  const plans = payload.plans.map(normalizePlan).filter((plan): plan is NonNullable<typeof plan> => Boolean(plan));
  const deduped = [...new Map(plans.map((plan) => [plan.id, plan])).values()];
  const now = new Date().toISOString();

  try {
    const db = getDb();
    const existing = await db.select({ id: applicationPlans.id, programId: applicationPlans.programId })
      .from(applicationPlans)
      .where(eq(applicationPlans.userId, userId));

    await Promise.all(deduped.map((plan) => db.insert(applicationPlans).values({
      id: `${userId}:${plan.id}`,
      userId,
      programId: plan.id,
      stage: plan.stage,
      documentsJson: JSON.stringify(plan.documents),
      reminderJson: JSON.stringify(plan.reminder),
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: applicationPlans.id,
      set: {
        stage: plan.stage,
        documentsJson: JSON.stringify(plan.documents),
        reminderJson: JSON.stringify(plan.reminder),
        updatedAt: now,
      },
    })));

    const keep = new Set(deduped.map((plan) => plan.id));
    await Promise.all(existing.filter((row) => !keep.has(row.programId)).map((row) => db.delete(applicationPlans)
      .where(and(eq(applicationPlans.userId, userId), eq(applicationPlans.id, row.id)))));

    return Response.json({ plans: deduped, syncedAt: now });
  } catch {
    return Response.json({ error: "申请计划数据库暂不可用" }, { status: 503 });
  }
}

function parseJson<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; } catch { return fallback; }
}
