import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { guides } from "@/db/schema";

export async function GET() {
  try {
    const rows = await getDb().select().from(guides).orderBy(asc(guides.sortOrder));
    const payload = Object.fromEntries(rows.map((row) => {
      try { return [row.section, JSON.parse(row.payloadJson)]; }
      catch { return [row.section, []]; }
    }));
    return Response.json({ guides: payload });
  } catch {
    return Response.json({ error: "申请工具数据库暂不可用" }, { status: 503 });
  }
}
