"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import cptPolicyData from "@/data/us-cpt-policies.json";

type CptPolicyStatus = "已核验" | "项目级差异" | "需重点关注" | "重大更新";
type CptPolicy = {
  key: string;
  institution: string;
  status: CptPolicyStatus;
  shortLabel: string;
  summary: string;
  eligibility: string;
  curriculum: string;
  timing: string;
  optImpact: string;
  warning?: string;
  sourceLabel: string;
  source: string;
};
type Alert = {
  severity: "重大更新" | "政策变化" | "共通红线";
  title: string;
  summary: string;
  date: string;
  sourceLabel: string;
  source: string;
};
type CptPolicyData = { verifiedAt: string; scope: string; policies: CptPolicy[]; alerts: Alert[] };

const DATA = cptPolicyData as CptPolicyData;
const FILTERS: (CptPolicyStatus | "全部")[] = ["全部", "重大更新", "需重点关注", "项目级差异", "已核验"];

function formatDate(value: string) {
  return value.replaceAll("-", ".");
}

function statusClass(status: CptPolicyStatus) {
  if (status === "重大更新") return "is-critical";
  if (status === "需重点关注") return "is-watch";
  if (status === "项目级差异") return "is-project";
  return "is-verified";
}

export default function CptDecisionDesk() {
  const [filter, setFilter] = useState<CptPolicyStatus | "全部">("全部");
  const [expanded, setExpanded] = useState<string | null>(null);
  const policies = useMemo(() => DATA.policies.filter((policy) => filter === "全部" || policy.status === filter), [filter]);

  return <div className="cpt-page">
    <header className="cpt-page-topbar"><Link href="/" className="brand" aria-label="返回 Fly Away 首页"><span className="brand-mark" aria-hidden="true">FA</span><span><strong>Fly Away</strong><small>留学项目情报库</small></span></Link><Link className="cpt-back-link" href="/">返回项目库</Link></header>
    <main>
      <section className="cpt-page-hero" aria-labelledby="cpt-page-title">
        <p className="eyebrow">U.S. F-1 WORK AUTHORIZATION</p>
        <h1 id="cpt-page-title">CPT / OPT <em>决策台</em></h1>
        <p>{DATA.scope}</p>
        <div className="cpt-page-stats"><span><b>{DATA.policies.length}</b> 所院校政策卡</span><span><b>{DATA.alerts.length}</b> 条优先提醒</span><span>本次核验 {formatDate(DATA.verifiedAt)}</span></div>
      </section>

      <section className="cpt-decision-rules" aria-labelledby="cpt-rules-title">
        <div><p className="section-kicker">START HERE</p><h2 id="cpt-rules-title">先用四个问题，排除错误判断。</h2></div>
        <ol>
          <li><b>01</b><span>你是否持有该校签发的有效 F-1 I-20，并仍在完成学位？</span></li>
          <li><b>02</b><span>实习是否与 I-20 上的主修直接相关，且能进入项目课程体系或毕业要求？</span></li>
          <li><b>03</b><span>你是否已拿到 offer、选到对应课程，并在工作前取得带日期和雇主信息的新 I-20？</span></li>
          <li><b>04</b><span>全职 CPT 是否会累计达到 12 个月，从而影响同层级毕业后 OPT？</span></li>
        </ol>
      </section>

      <section className="cpt-alert-board" aria-labelledby="cpt-alert-title">
        <div className="cpt-alert-board-head"><div><p className="section-kicker">POLICY WATCH</p><h2 id="cpt-alert-title">先看会改变选择的更新。</h2></div><p>以下是跨项目的高优先级提醒；任何学校名称都不能替代该项目的具体课程、学院批准和 DSO 书面确认。</p></div>
        <div className="cpt-alert-list">{DATA.alerts.map((alert) => <article key={alert.title} className={`cpt-alert cpt-alert-${alert.severity === "重大更新" ? "critical" : alert.severity === "政策变化" ? "watch" : "base"}`}><div><span>{alert.severity}</span><small>{formatDate(alert.date)}</small></div><h3>{alert.title}</h3><p>{alert.summary}</p><a href={alert.source} target="_blank" rel="noreferrer">{alert.sourceLabel}<b>打开官网</b></a></article>)}</div>
      </section>

      <section className="cpt-policy-directory" aria-labelledby="cpt-directory-title">
        <div className="cpt-directory-head"><div><p className="section-kicker">SCHOOL POLICY DIRECTORY</p><h2 id="cpt-directory-title">按学校横向比较，不把校规当项目承诺。</h2></div><p>每张卡都保留国际学生办公室来源。展开后先看“课程与项目要求”与“OPT 与身份风险”，再进入官网确认。</p></div>
        <div className="cpt-filter-row" aria-label="CPT 政策状态筛选">{FILTERS.map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <div className="cpt-policy-table-wrap"><table><thead><tr><th>院校</th><th>CPT 路径</th><th>课程/项目要求</th><th>OPT 红线</th><th>官方来源</th></tr></thead><tbody>{policies.map((policy) => <tr key={policy.key} className={expanded === policy.key ? "is-expanded" : ""}><td><span className={`cpt-status-dot ${statusClass(policy.status)}`}>{policy.status}</span><strong>{policy.institution}</strong><small>{policy.summary}</small></td><td>{policy.shortLabel}<button type="button" onClick={() => setExpanded((current) => current === policy.key ? null : policy.key)}>{expanded === policy.key ? "收起细则" : "展开细则"}</button></td><td>{policy.curriculum}</td><td>{policy.optImpact}</td><td><a href={policy.source} target="_blank" rel="noreferrer">{policy.sourceLabel}<b>打开官网</b></a></td></tr>)}</tbody></table></div>
        {expanded && (() => {
          const policy = DATA.policies.find((item) => item.key === expanded);
          return policy ? <article className="cpt-expanded-card"><div><span className={`cpt-status-dot ${statusClass(policy.status)}`}>{policy.status}</span><h3>{policy.institution} · 决策细则</h3></div>{policy.warning && <p className="cpt-policy-warning">{policy.warning}</p>}<dl><div><dt>资格 / 最早可用</dt><dd>{policy.eligibility}</dd></div><div><dt>提交与处理节奏</dt><dd>{policy.timing}</dd></div><div><dt>课程与项目要求</dt><dd>{policy.curriculum}</dd></div><div><dt>OPT 与身份风险</dt><dd>{policy.optImpact}</dd></div></dl><a href={policy.source} target="_blank" rel="noreferrer">{policy.sourceLabel}<b>打开本校官网</b></a></article> : null;
        })()}
      </section>

      <section className="cpt-page-disclaimer"><strong>最后一步：向项目管理员和学校 DSO 提交你的项目、课程、offer、工时和日期，取得书面确认。</strong><p>此页面只整理公开政策，不能提供法律意见、签证建议或“项目一定可以 CPT”的承诺。</p></section>
    </main>
  </div>;
}
