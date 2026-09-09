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
  const [page, css, signatureDataSource, aiProgramSource] = await Promise.all([
    source("app/page.tsx"),
    source("app/globals.css"),
    source("data/signature-tags.json"),
    source("data/ai-programs.json"),
  ]);
  const signatureData = JSON.parse(signatureDataSource);
  const aiPrograms = JSON.parse(aiProgramSource);

  assert.equal(signatureData.checkedAt, "2026-08-26");
  assert.ok(signatureData.tags.length >= 26);
  assert.ok(signatureData.tags.every((tag) => tag.programIds.length > 0 && tag.basis && tag.source));
  assert.equal(aiPrograms.length, 2);
  assert.ok(aiPrograms.every((program) => /人工智能|机器学习/.test(program.program) && program.source));
  assert.match(signatureDataSource, /统计强校/);
  assert.match(signatureDataSource, /金工强校/);
  assert.match(signatureDataSource, /计算机强校/);
  assert.match(signatureDataSource, /AI强校/);
  assert.match(page, /signatureTagsOf/);
  assert.match(page, /为什么有这个标签/);
  assert.match(page, /查看榜单依据/);
  assert.match(page, /"University of Chicago": "芝加哥大学 芝大 UChicago"/);
  assert.match(css, /\.signature-evidence/);
  assert.match(css, /\.signature-tag\.signature-quant/);
  assert.match(css, /\.signature-tag\.signature-ai/);
});

test("labels current and previous-cycle language requirements with sources", async () => {
  const [page, css, languageDataSource] = await Promise.all([
    source("app/page.tsx"),
    source("app/globals.css"),
    source("data/language-requirements.json"),
  ]);
  const languageData = JSON.parse(languageDataSource);

  assert.equal(languageData.checkedAt, "2026-08-24");
  assert.match(languageData.scaleNote, /1–6 分制/);
  assert.ok(languageData.records.length >= 15);
  assert.ok(languageData.records.every((record) => record.cycle && record.text && record.source));
  assert.match(page, /英语要求 · 往期/);
  assert.match(page, /往期语言要求/);
  assert.match(page, /打开语言要求来源/);
  assert.match(page, /TOEFL 新制提示/);
  assert.match(css, /\.language-requirement-panel/);
  assert.match(css, /\.language-cycle-tag\.is-previous/);
});

test("applies the latest official application-status refresh as an overlay", async () => {
  const [page, updateSource] = await Promise.all([
    source("app/page.tsx"),
    source("data/status-updates.json"),
  ]);
  const updates = JSON.parse(updateSource);

  assert.ok(updates.length >= 10);
  assert.ok(updates.every((update) => update.sourcePayload?.applicationStatusCheckedAt === "2026-09-07"));
  assert.equal(updates.find((update) => update.id === "qs2027-ntu-0554941b1b")?.sourcePayload?.applicationStatus, "已开始申请");
  assert.equal(updates.find((update) => update.id === "hku-msai")?.sourcePayload?.applicationStatus, "往期要求");
  assert.match(page, /applyProgramUpdates/);
  assert.match(page, /latestStatusCheck/);
});

test("shows project-level scholarship research without treating missing data as no funding", async () => {
  const [page, css, fundingSource] = await Promise.all([
    source("app/page.tsx"),
    source("app/globals.css"),
    source("data/funding-opportunities.json"),
  ]);
  const funding = JSON.parse(fundingSource);

  assert.equal(funding.checkedAt, "2026-09-09");
  assert.ok(funding.records.length >= 12);
  assert.ok(funding.records.every((record) => record.programIds.length && record.status && record.coverage && record.application && record.source));
  assert.match(funding.policy, /未查到不等于没有/);
  assert.match(page, /FundingOpportunityPanel/);
  assert.match(page, /项目级待核验/);
  assert.match(page, /打开奖学金官网/);
  assert.match(css, /\.funding-panel/);
  assert.match(css, /\.funding-tag\.funding-full/);
});
