import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("ships the Fly Away application timeline rather than the starter skeleton", async () => {
  const [page, css, layout] = await Promise.all([
    source("app/page.tsx"),
    source("app/globals.css"),
    source("app/layout.tsx"),
  ]);

  assert.match(layout, /Fly Away｜留学项目情报库/);
  assert.match(page, /MY APPLICATION TIMELINE/);
  assert.match(page, /申请材料与缺口/);
  assert.match(page, /巡检官方来源/);
  assert.match(page, /自动巡检只在检测到明确“申请开放”措辞时更新绿色状态/);
  assert.match(css, /\.application-timeline/);
  assert.match(css, /\.timeline-card/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview|starter loading skeleton/i);
});

test("keeps durable plans, source snapshots, and the CPT decision page in the product", async () => {
  const [schema, planRoute, monitorRoute, migration, cptPage, cptDesk] = await Promise.all([
    source("db/schema.ts"),
    source("app/api/application-plan/route.ts"),
    source("app/api/monitor/route.ts"),
    source("drizzle/0006_bent_sheva_callister.sql"),
    source("app/cpt/page.tsx"),
    source("app/cpt/CptDecisionDesk.tsx"),
  ]);

  assert.match(schema, /applicationPlans/);
  assert.match(schema, /sourceMonitors/);
  assert.match(schema, /sourceSnapshots/);
  assert.match(planRoute, /oai-authenticated-user-id/);
  assert.match(planRoute, /onConflictDoUpdate/);
  assert.match(monitorRoute, /OPEN_PATTERNS/);
  assert.match(monitorRoute, /applicationStatus: "已开始申请"/);
  assert.match(migration, /CREATE TABLE `application_plans`/);
  assert.match(migration, /CREATE TABLE `source_snapshots`/);
  assert.match(cptPage, /CPT \/ OPT 决策台/);
  assert.match(cptDesk, /学校横向比较/);
});
