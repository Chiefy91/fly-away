import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { programs } from "@/db/schema";

function parseJson<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export async function GET() {
  try {
    const rows = await getDb().select().from(programs).orderBy(asc(programs.region), asc(programs.university), asc(programs.program));
    return Response.json({
      programs: rows.map((row) => ({
        ...row,
        requirements: parseJson(row.requirementsJson, []),
        documents: parseJson(row.documentsJson, []),
        notes: parseJson(row.notesJson, []),
        sources: parseJson(row.sourcesJson, []),
        sourcePayload: parseJson(row.sourcePayloadJson, {}),
        requirementsJson: undefined,
        documentsJson: undefined,
        notesJson: undefined,
        sourcesJson: undefined,
        sourcePayloadJson: undefined,
      })),
    });
  } catch {
    return Response.json({ error: "项目数据库暂不可用" }, { status: 503 });
  }
}
