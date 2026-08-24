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
  assert.match(page, /cardRequirementFactsOf/);
  assert.match(page, /待官网核验/);
  assert.doesNotMatch(page, /className=\{`bar/);
  assert.match(css, /\.application-timeline/);
  assert.match(css, /\.timeline-card/);
  assert.doesNotMatch(css, /\.bar\s*\{/);
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

test("shows evidence-backed signature labels only on explicitly matched programs", async () => {
  const [page, css, signatureDataSource] = await Promise.all([
    source("app/page.tsx"),
    source("app/globals.css"),
    source("data/signature-tags.json"),
  ]);
  const signatureData = JSON.parse(signatureDataSource);

  assert.equal(signatureData.checkedAt, "2026-08-24");
  assert.ok(signatureData.tags.length >= 18);
  assert.ok(signatureData.tags.every((tag) => tag.programIds.length > 0 && tag.basis && tag.source));
  assert.match(signatureDataSource, /统计强校/);
  assert.match(signatureDataSource, /金工强校/);
  assert.match(signatureDataSource, /计算机强校/);
  assert.match(page, /signatureTagsOf/);
  assert.match(page, /为什么有这个标签/);
  assert.match(page, /查看榜单依据/);
  assert.match(css, /\.signature-evidence/);
  assert.match(css, /\.signature-tag\.signature-quant/);
});
