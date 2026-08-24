"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import staticPrograms from "@/data/programs-fallback.json";
import guideData from "@/data/guides.json";
import cptPolicyData from "@/data/us-cpt-policies.json";
import writingGuideData from "@/data/writing-guides.json";
import signatureTagData from "@/data/signature-tags.json";

type Region = "香港" | "新加坡" | "美国" | "欧洲";
type Category = "计算机与数据" | "金融与量化" | "数学与统计" | "商科与管理" | "工程与技术" | "社会科学" | "自然科学" | "人文与艺术" | "法律与公共事务" | "医学与生命科学" | "教育" | "综合项目目录";
type Background = "跨专业友好" | "量化背景" | "强先修要求" | "待核验";
type Verification = "全部" | "深度核验" | "官网核验" | "目录级收录";
type ApplicationStatus = "全部" | "已开始申请" | "往期要求";
type DegreeLevel = "硕士" | "博士";
type SignatureTagTone = "stats" | "quant" | "cs";
type SignatureTag = {
  id: string;
  label: string;
  tone: SignatureTagTone;
  programIds: string[];
  basis: string;
  evidence: string;
  sourceLabel: string;
  source: string;
};
type SignatureTagData = {
  checkedAt: string;
  policy: string;
  tags: SignatureTag[];
};

type EnglishPreparation = "未填写" | "IELTS 6.0" | "IELTS 6.5" | "IELTS 7.0+" | "TOEFL 90" | "TOEFL 100+";
type PlanStage = "研究中" | "准备材料" | "已提交";
type DocumentState = "待准备" | "已准备" | "已提交" | "不适用";
type ApplicantProfile = {
  discipline: Category | "未填写";
  english: EnglishPreparation;
  targetRegions: Region[];
};
type PlannedProgram = {
  id: string;
  stage: PlanStage;
  documents?: Record<string, DocumentState>;
  reminder?: { enabled: boolean };
  updatedAt?: string;
};
type SourceSnapshot = {
  id: string;
  programId: string;
  checkedAt: string;
  httpStatus: number | null;
  status: string;
  pageTitle: string;
  openSignal: number;
  note: string;
};
type Readiness = {
  label: "先补充背景" | "可优先研究" | "需要补条件" | "需进一步核验";
  rank: number;
  gaps: string[];
  positives: string[];
};

type Requirement = {
  label: string;
  value: string;
  level: number;
};

type Program = {
  id: string;
  region: Region;
  city: string;
  university: string;
  school: string;
  program: string;
  category: Category;
  background: Background;
  cycle: "2027 入学" | "2026/27 入学" | "最近可用";
  intake: string;
  duration: string;
  updated: string;
  academic: string;
  language: string;
  tests: string;
  prerequisites: string;
  deadline: string;
  deadlineNote: string;
  requirements: Requirement[];
  documents: string[];
  notes: string[];
  source: string;
  direction?: string;
  tuition?: string;
  applicationRequirements?: string;
  interview?: string;
  rentBudget?: string;
  positioning?: string;
  sources?: Array<{ label: string; url: string; kind: string; year: string }>;
  sourceLabel?: string;
  sourcePayload?: Record<string, unknown>;
};

type CptPolicyStatus = "已核验" | "项目级差异" | "需重点关注" | "重大更新";
type CptPolicy = {
  key: string;
  universities: string[];
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
type CptAlert = {
  severity: "重大更新" | "政策变化" | "共通红线";
  title: string;
  summary: string;
  date: string;
  sourceLabel: string;
  source: string;
};
type CptPolicyData = {
  verifiedAt: string;
  scope: string;
  alerts: CptAlert[];
  policies: CptPolicy[];
};

type GuideRow = Record<string, string | null>;
type GuideData = {
  overview: GuideRow[];
  materials: GuideRow[];
  timeline: GuideRow[];
  sources: GuideRow[];
  originalIndex: GuideRow[];
  webSummary: GuideRow[];
  sourceDate: string;
};

type WritingMaterial = {
  name: string;
  requirement: string;
  focus: string;
  expression: string;
  avoid: string;
};
type WritingGuide = {
  programId: string;
  verification: string;
  checkedAt: string;
  sourceLabel: string;
  source: string;
  summary: string;
  materials: WritingMaterial[];
};

const PROGRAMS: Program[] = [
  {
    id: "hku-mscs",
    region: "香港",
    city: "中国香港",
    university: "香港大学",
    school: "计算与数据科学学院",
    program: "计算机科学理学硕士",
    category: "计算机与数据",
    background: "强先修要求",
    cycle: "2026/27 入学",
    intake: "2026 年 9 月",
    duration: "全日制 1 年",
    updated: "2026-07-15",
    academic: "认可院校学士学位或同等资格；可能要求资格考试",
    language: "非英语授课背景需满足港大研究生英语要求",
    tests: "GRE / GMAT 未列为必需",
    prerequisites: "不同方向对计算机基础的侧重不同",
    deadline: "主轮 2025-12-01；清算轮 2026-04-30",
    deadlineNote: "2026/27 申请已截止",
    requirements: [
      { label: "学术背景", value: "相关学位优先", level: 78 },
      { label: "英语要求", value: "校级标准", level: 61 },
      { label: "标化考试", value: "非必需", level: 18 },
    ],
    documents: ["成绩单", "学位证明", "个人简历", "英语成绩（如适用）"],
    notes: ["个人陈述为可选材料", "推荐信在申请阶段通常无需提交", "设有多个专业方向"],
    source: "https://master.cds.hku.hk/msccs/admission/application-details/",
  },
  {
    id: "hku-msai",
    region: "香港",
    city: "中国香港",
    university: "香港大学",
    school: "数学系",
    program: "人工智能理学硕士",
    category: "计算机与数据",
    background: "强先修要求",
    cycle: "2026/27 入学",
    intake: "2026 年 9 月",
    duration: "全日制 1 年",
    updated: "2026-07-15",
    academic: "学士学位或同等资格",
    language: "需满足港大研究生英语要求",
    tests: "GRE / GMAT 未列为必需",
    prerequisites: "线性代数、微积分、概率、统计与编程知识",
    deadline: "主轮 2025-12-01；第二轮 2026-02-09",
    deadlineNote: "2026/27 申请已截止",
    requirements: [
      { label: "学术背景", value: "量化先修明确", level: 90 },
      { label: "英语要求", value: "校级标准", level: 61 },
      { label: "标化考试", value: "非必需", level: 18 },
    ],
    documents: ["成绩单", "学位证明", "英语成绩（如适用）", "个人材料"],
    notes: ["官方明确列出五类先修知识", "申请按轮次审核", "满足最低要求不代表录取"],
    source: "https://www.mscai.hku.hk/admissions/",
  },
  {
    id: "hkust-bdt",
    region: "香港",
    city: "中国香港",
    university: "香港科技大学",
    school: "工学院计算机科学与工程系 / 理学院数学系",
    program: "大数据科技理学硕士",
    category: "计算机与数据",
    background: "量化背景",
    cycle: "2026/27 入学",
    intake: "2026 年 9 月",
    duration: "全日制 1 年",
    updated: "2026-07-15",
    academic: "计算机工程、计算机科学、数学或相关领域学士学位；其他专业需相关工作经验",
    language: "IELTS 6.5（各项 5.5）；TOEFL 按考试日期适用新旧分制",
    tests: "GRE / GMAT 未列为必需",
    prerequisites: "计算机、数学或相关 IT / 数学工作经验",
    deadline: "第一轮 2025-12-01；第二轮 2026-03-01",
    deadlineNote: "2026/27 申请已截止",
    requirements: [
      { label: "学术背景", value: "相关学位 / 经历", level: 84 },
      { label: "英语要求", value: "IELTS 6.5", level: 66 },
      { label: "标化考试", value: "非必需", level: 18 },
    ],
    documents: ["成绩单", "学位证明", "英语成绩（如适用）", "工作经历证明（跨专业时）"],
    notes: ["滚动审核，官方建议尽早申请", "由计算机系与数学系联合开设", "2026/27 项目信息已发布"],
    source: "https://prog-crs.hkust.edu.hk/pgprog/2026-27/msc-bdt/",
  },
  {
    id: "cuhk-mscba",
    region: "香港",
    city: "中国香港",
    university: "香港中文大学",
    school: "商学院",
    program: "商业分析理学硕士",
    category: "商科与管理",
    background: "跨专业友好",
    cycle: "2026/27 入学",
    intake: "2026 年 9 月",
    duration: "全日制 1 年",
    updated: "2026-07-15",
    academic: "认可大学学士学位，通常二等荣誉或平均成绩 B 及以上",
    language: "TOEFL iBT 79 / IELTS 6.5，或符合英语授课等豁免条件",
    tests: "GMAT / GRE 非必需，但良好成绩可增强申请",
    prerequisites: "不限本科专业；量化能力有助于课程学习",
    deadline: "早轮 2025-08-01；最终 2026-03-31",
    deadlineNote: "滚动录取，2026/27 已截止",
    requirements: [
      { label: "学术背景", value: "二等荣誉 / B", level: 72 },
      { label: "英语要求", value: "IELTS 6.5", level: 66 },
      { label: "标化考试", value: "可选加分", level: 42 },
    ],
    documents: ["成绩单", "学位证明", "英语成绩（如适用）", "两位推荐人"],
    notes: ["GMAT / GRE 与工作经验均非强制", "可能受邀参加面试", "项目采用滚动审核"],
    source: "https://masters.bschool.cuhk.edu.hk/programmes/mscba/admissions-2/",
  },
  {
    id: "nus-mcomp",
    region: "新加坡",
    city: "新加坡",
    university: "新加坡国立大学",
    school: "计算机学院",
    program: "计算机硕士（通用方向）",
    category: "计算机与数据",
    background: "跨专业友好",
    cycle: "2026/27 入学",
    intake: "2026 年 8 月",
    duration: "全日制约 1.5 年",
    updated: "2026-07-15",
    academic: "任何学科的良好荣誉学位；有 IT 工作经验者优先",
    language: "非英语授课背景：TOEFL iBT 90 或 IELTS 6.0",
    tests: "GRE 320 + 写作 3.5，或 GMAT 650；印度院校毕业生可用 GATE",
    prerequisites: "为非计算机背景申请人设计，课程含衔接内容",
    deadline: "2025-10-01 开放；2026-01-31 截止",
    deadlineNote: "2026/27 申请已截止",
    requirements: [
      { label: "学术背景", value: "任何专业荣誉学位", level: 64 },
      { label: "英语要求", value: "IELTS 6.0", level: 56 },
      { label: "标化考试", value: "GRE / GMAT", level: 82 },
    ],
    documents: ["个人陈述", "个人简历", "成绩单与学位证明", "至少一封推荐信", "标化与英语成绩"],
    notes: ["每年仅 8 月一次入学", "申请材料不完整将不予处理", "项目信息以计算机学院页面为准"],
    source: "https://www.comp.nus.edu.sg/programmes/pg/mcomp-gen/admissions/",
  },
  {
    id: "ntu-msai",
    region: "新加坡",
    city: "新加坡",
    university: "南洋理工大学",
    school: "计算与数据科学学院",
    program: "人工智能理学硕士",
    category: "计算机与数据",
    background: "强先修要求",
    cycle: "2026/27 入学",
    intake: "2026 年",
    duration: "全日制 1 年 / 非全日制 2 年",
    updated: "2026-07-15",
    academic: "良好学士学位；录取采用综合竞争性评估",
    language: "TOEFL iBT 100 / IELTS 6.5，或英语授课证明",
    tests: "GRE 与推荐信为可选材料",
    prerequisites: "适合希望深入 AI 理论、方法与应用的申请人",
    deadline: "以 NTU 当期研究生申请系统为准",
    deadlineNote: "2026 要求已发布",
    requirements: [
      { label: "学术背景", value: "良好学士学位", level: 72 },
      { label: "英语要求", value: "IELTS 6.5", level: 66 },
      { label: "标化考试", value: "GRE 可选", level: 34 },
    ],
    documents: ["个人简历", "学位证明", "成绩单", "英语成绩或授课语言证明"],
    notes: ["GRE 与推荐信可选", "所有材料须在线上传", "最低标准不保证录取"],
    source: "https://www.ntu.edu.sg/education/graduate-programme/master-of-science-in-artificial-intelligence",
  },
  {
    id: "ntu-analytics",
    region: "新加坡",
    city: "新加坡",
    university: "南洋理工大学",
    school: "数理科学学院",
    program: "分析学理学硕士",
    category: "计算机与数据",
    background: "量化背景",
    cycle: "2026/27 入学",
    intake: "2026 年 8 月",
    duration: "全日制 1 年 / 非全日制 2 年",
    updated: "2026-07-15",
    academic: "偏好数学、统计、工程、计算机等量化学科的良好学士学位",
    language: "非英语授课背景：IELTS 6.0；TOEFL 按 NTU 新旧分制要求",
    tests: "GMAT / GRE 与相关工作经验优先但非必需",
    prerequisites: "量化背景；开学前提供线性代数、微积分与 R 预备课程",
    deadline: "2025-11-01 至 2026-04-01",
    deadlineNote: "2026/27 申请已截止",
    requirements: [
      { label: "学术背景", value: "量化学科优先", level: 82 },
      { label: "英语要求", value: "IELTS 6.0", level: 56 },
      { label: "标化考试", value: "可选加分", level: 42 },
    ],
    documents: ["成绩单", "学位证明", "英语成绩（如适用）", "GMAT / GRE（可选）"],
    notes: ["申请材料全部在线提交", "2026 年 8 月 3 日开课", "工作经验为加分项而非硬性要求"],
    source: "https://www.ntu.edu.sg/spms/about-us/mathematics/grad/msc-in-analytics",
  },
  {
    id: "ntu-msds",
    region: "新加坡",
    city: "新加坡",
    university: "南洋理工大学",
    school: "计算与数据科学学院",
    program: "数据科学理学硕士",
    category: "计算机与数据",
    background: "量化背景",
    cycle: "2026/27 入学",
    intake: "2026 年",
    duration: "全日制课程型硕士",
    updated: "2026-07-15",
    academic: "良好学士学位，录取按竞争性综合评估",
    language: "TOEFL iBT 100 / IELTS 6.5，或英语授课证明",
    tests: "以当期项目页面要求为准",
    prerequisites: "数据、计算与量化基础有助于申请",
    deadline: "以 NTU 当期申请系统为准",
    deadlineNote: "2026 要求已发布",
    requirements: [
      { label: "学术背景", value: "量化背景优先", level: 80 },
      { label: "英语要求", value: "IELTS 6.5", level: 66 },
      { label: "标化考试", value: "按项目要求", level: 30 },
    ],
    documents: ["学位证明", "成绩单", "英语成绩或授课语言证明", "个人材料"],
    notes: ["课程总计 30 学分单位", "英语成绩须在有效期内", "官方页面为提交前最终依据"],
    source: "https://www.ntu.edu.sg/education/graduate-programme/master-of-science-in-data-science-%28msds%29",
  },
  {
    id: "ntu-materials-analytics",
    region: "新加坡",
    city: "新加坡",
    university: "南洋理工大学",
    school: "材料科学与工程学院",
    program: "应用材料分析理学硕士",
    category: "工程与技术",
    background: "量化背景",
    cycle: "2026/27 入学",
    intake: "1 月 / 8 月",
    duration: "全日制 1 年",
    updated: "2026-07-15",
    academic: "工程学或相关学科的良好学士学位；具备长期相关经验的专科学历申请人也可能获考虑",
    language: "非英语母语申请人：TOEFL iBT 85 或 IELTS 6.0",
    tests: "课程型硕士不要求 GRE",
    prerequisites: "工程、材料或相关分析背景",
    deadline: "不同入学季申请窗口不同，以 NTU 当期系统为准",
    deadlineNote: "2026/27 要求已发布",
    requirements: [
      { label: "学术背景", value: "工程相关学位", level: 82 },
      { label: "英语要求", value: "IELTS 6.0", level: 56 },
      { label: "标化考试", value: "GRE 不要求", level: 8 },
    ],
    documents: ["成绩单", "学位证明", "英语成绩", "相关工作证明（如适用）"],
    notes: ["每年设 1 月与 8 月两个入学季", "无英语成绩者仍可能被要求参加面试或测试", "最低标准不保证录取"],
    source: "https://www.ntu.edu.sg/spms/admissions/grad/detail/master-of-science-in-applied-materials-analytics",
  },
  {
    id: "hkust-mass",
    region: "香港",
    city: "中国香港",
    university: "香港科技大学",
    school: "人文社会科学学院",
    program: "社会科学文学硕士",
    category: "社会科学",
    background: "跨专业友好",
    cycle: "2026/27 入学",
    intake: "2026 年秋季",
    duration: "授课型硕士",
    updated: "2026-07-15",
    academic: "认可大学的学士学位，或经校方认可的同等资格",
    language: "课程主要以英语授课，需满足港科大校级英语要求",
    tests: "GRE / GMAT 未列为必需",
    prerequisites: "未列出特定本科专业限制",
    deadline: "2026-03-28",
    deadlineNote: "2026/27 申请已截止",
    requirements: [
      { label: "学术背景", value: "认可学士学位", level: 62 },
      { label: "英语要求", value: "校级标准", level: 61 },
      { label: "标化考试", value: "非必需", level: 18 },
    ],
    documents: ["成绩单", "学位证明", "英语成绩（如适用）", "申请系统要求材料"],
    notes: ["申请采用持续审核", "课程主要使用英语", "信息以学院与研究生院页面为准"],
    source: "https://shss.hkust.edu.hk/tpg/mass/application",
  },
  {
    id: "stanford-mscs",
    region: "美国",
    city: "美国 · 加利福尼亚",
    university: "斯坦福大学",
    school: "计算机科学系",
    program: "计算机科学理学硕士",
    category: "计算机与数据",
    background: "强先修要求",
    cycle: "2027 入学",
    intake: "2027 年秋季",
    duration: "至少 45 学分",
    updated: "2026-07-15",
    academic: "学士学位；申请材料需证明完成研究生计算机学习的准备度",
    language: "非英语母语申请人需 TOEFL / IELTS，符合官方豁免条件者除外",
    tests: "GRE 不要求且不纳入 MS 申请评估",
    prerequisites: "计算机科学核心基础与对应专业方向准备",
    deadline: "2026-12-08",
    deadlineNote: "2027 秋季申请将于 2026 年 9 月中旬开放",
    requirements: [
      { label: "学术背景", value: "计算机基础", level: 88 },
      { label: "英语要求", value: "TOEFL / IELTS", level: 72 },
      { label: "标化考试", value: "GRE 不采纳", level: 8 },
    ],
    documents: ["成绩单", "目的陈述", "三封推荐信", "个人简历", "英语成绩（如适用）"],
    notes: ["仅秋季入学", "同一学年不得重复申请 MS", "GRE 成绩不会被考虑"],
    source: "https://www.cs.stanford.edu/admissions/masters-admissions-frequently-asked-questions",
  },
  {
    id: "cmu-mscs",
    region: "美国",
    city: "美国 · 匹兹堡",
    university: "卡内基梅隆大学",
    school: "计算机科学系",
    program: "计算机科学理学硕士",
    category: "计算机与数据",
    background: "强先修要求",
    cycle: "2027 入学",
    intake: "2027 年秋季",
    duration: "通常 3–4 学期",
    updated: "2026-07-15",
    academic: "学士学位；需具备数学、编程与逻辑推理能力，计算机本科并非硬性要求",
    language: "TOEFL 通常至少旧制 100 / 新制 5；IELTS 7 可视为对应标准",
    tests: "按 SCS 当期测试政策提交；项目页未将 GRE 列为核心材料",
    prerequisites: "科学、工程或数学背景是重要的成功预测因素",
    deadline: "早申 2026-11-18；最终 2026-12-09",
    deadlineNote: "2027 秋季周期已公布",
    requirements: [
      { label: "学术背景", value: "数理与编程能力", level: 90 },
      { label: "英语要求", value: "TOEFL 100 / IELTS 7", level: 78 },
      { label: "标化考试", value: "按当期政策", level: 30 },
    ],
    documents: ["成绩单", "个人简历", "目的陈述", "三封推荐信", "英语成绩"],
    notes: ["至少两封推荐信应来自教师或近期雇主", "仅秋季入学", "项目不提供奖学金或助学金"],
    source: "https://csd.cs.cmu.edu/academics/masters/admissions",
  },
  {
    id: "columbia-msds",
    region: "美国",
    city: "美国 · 纽约",
    university: "哥伦比亚大学",
    school: "数据科学研究所",
    program: "数据科学理学硕士",
    category: "计算机与数据",
    background: "量化背景",
    cycle: "2026/27 入学",
    intake: "秋季",
    duration: "全日制项目",
    updated: "2026-07-15",
    academic: "本科学位；需修过微积分、线性代数等量化课程",
    language: "TOEFL / IELTS / PTE（如适用）",
    tests: "GRE 在 2026 申请中为可选",
    prerequisites: "具备 Python、SQL、R 等入门编程技能",
    deadline: "优先轮 01-15；最终轮 02-15",
    deadlineNote: "页面按秋季周期公布；提交前核对年份",
    requirements: [
      { label: "学术背景", value: "量化课程", level: 84 },
      { label: "英语要求", value: "如适用", level: 64 },
      { label: "标化考试", value: "GRE 可选", level: 34 },
    ],
    documents: ["个人陈述", "所有高等教育成绩单", "三封推荐信", "个人简历", "英语成绩（如适用）"],
    notes: ["要求入门编程能力", "GRE 为可选项", "优先轮与最终轮分开审核"],
    source: "https://datascience.columbia.edu/education/programs/m-s-in-data-science/admissions/",
  },
  {
    id: "princeton-mse",
    region: "美国",
    city: "美国 · 新泽西",
    university: "普林斯顿大学",
    school: "计算机科学系",
    program: "计算机科学工程硕士",
    category: "计算机与数据",
    background: "强先修要求",
    cycle: "最近可用",
    intake: "2026 年秋季",
    duration: "2 年",
    updated: "2026-07-15",
    academic: "学士学位；按研究生院与计算机系标准综合评估",
    language: "英语要求按普林斯顿研究生院规定执行",
    tests: "GRE General 不接受",
    prerequisites: "计算机科学系统、AI 与理论方向的核心准备",
    deadline: "2025-12-15（2026 秋季）",
    deadlineNote: "2027 周期尚未在该页面发布",
    requirements: [
      { label: "学术背景", value: "核心 CS 基础", level: 90 },
      { label: "英语要求", value: "校级标准", level: 70 },
      { label: "标化考试", value: "GRE 不接受", level: 8 },
    ],
    documents: ["申请表", "成绩单", "推荐信", "个人陈述", "英语成绩（如适用）"],
    notes: ["每年仅秋季入学", "GRE General 不接受", "此处使用最近已发布的 2026 入学周期"],
    source: "https://gradschool.princeton.edu/academics/degrees-requirements/fields-study/computer-science",
  },
  {
    id: "oxford-acs",
    region: "欧洲",
    city: "英国 · 牛津",
    university: "牛津大学",
    school: "计算机科学系",
    program: "高级计算机科学理学硕士",
    category: "计算机与数据",
    background: "强先修要求",
    cycle: "2026/27 入学",
    intake: "2026 年 10 月",
    duration: "全日制 12 个月",
    updated: "2026-07-15",
    academic: "计算机科学或数学一等荣誉学位或同等资格；美国本科通常要求 GPA 3.7/4.0",
    language: "IELTS 7.5（各项 7.0）；TOEFL iBT 110（分项另有要求，且注意 2026 新制政策）",
    tests: "GRE 未列为必需",
    prerequisites: "扎实的数学与计算机科学基础",
    deadline: "2026/27 已关闭；2027/28 待发布",
    deadlineNote: "可登记接收下一周期开放通知",
    requirements: [
      { label: "学术背景", value: "一等荣誉", level: 96 },
      { label: "英语要求", value: "IELTS 7.5", level: 90 },
      { label: "标化考试", value: "未列为必需", level: 18 },
    ],
    documents: ["官方成绩单", "个人陈述", "推荐信", "英语成绩", "申请系统要求的其他材料"],
    notes: ["2026/27 约 70 个名额", "课程曾名为 MSc Computer Science", "英语采用 Higher level"],
    source: "https://www.ox.ac.uk/admissions/graduate/courses/msc-advanced-computer-science",
  },
  {
    id: "imperial-aiml",
    region: "欧洲",
    city: "英国 · 伦敦",
    university: "帝国理工学院",
    school: "计算机系",
    program: "计算（人工智能与机器学习）理学硕士",
    category: "计算机与数据",
    background: "强先修要求",
    cycle: "2026/27 入学",
    intake: "2026 年 9 月",
    duration: "全日制 1 年",
    updated: "2026-07-15",
    academic: "含大量计算机课程的一等荣誉学位或同等资格",
    language: "需达到帝国理工 Higher 英语标准",
    tests: "GRE / GMAT 未列为必需",
    prerequisites: "通常需具备约两年计算机本科课程的等量基础",
    deadline: "滚动审核，额满可能提前关闭",
    deadlineNote: "2026 入学信息已发布",
    requirements: [
      { label: "学术背景", value: "一等荣誉 + CS", level: 96 },
      { label: "英语要求", value: "Higher 标准", level: 78 },
      { label: "标化考试", value: "非必需", level: 18 },
    ],
    documents: ["成绩单", "个人陈述", "推荐材料", "英语成绩（如适用）"],
    notes: ["面向已有扎实计算机背景的申请人", "课程包含个人项目", "ATAS 证书不要求"],
    source: "https://www.imperial.ac.uk/study/courses/postgraduate-taught/computing-artificial-intelligence-msc/",
  },
  {
    id: "ucl-ds",
    region: "欧洲",
    city: "英国 · 伦敦",
    university: "伦敦大学学院",
    school: "统计科学系",
    program: "数据科学理学硕士",
    category: "计算机与数据",
    background: "量化背景",
    cycle: "2026/27 入学",
    intake: "2026 年 9 月",
    duration: "全日制 1 个日历年",
    updated: "2026-07-15",
    academic: "量化学科二等一荣誉学位或同等资格",
    language: "UCL English Level 1",
    tests: "GRE / GMAT 未列为必需",
    prerequisites: "大学层级数学方法与线性代数；概率、统计和高级编程语言基础",
    deadline: "需签证：2026-03-27；无需签证：2026-08-28",
    deadlineNote: "需签证申请已关闭",
    requirements: [
      { label: "学术背景", value: "2:1 量化学科", level: 82 },
      { label: "英语要求", value: "UCL Level 1", level: 62 },
      { label: "标化考试", value: "非必需", level: 18 },
    ],
    documents: ["成绩单", "个人陈述", "一封推荐信", "英语成绩（如适用）"],
    notes: ["高阶语言编程经验为硬性要求", "上一周期每个名额收到超过 20 份申请", "最多可提交两个 UCL 研究生课程申请"],
    source: "https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/data-science-msc",
  },
  {
    id: "eth-mscs",
    region: "欧洲",
    city: "瑞士 · 苏黎世",
    university: "苏黎世联邦理工学院",
    school: "计算机科学系",
    program: "计算机科学理学硕士",
    category: "计算机与数据",
    background: "强先修要求",
    cycle: "2026/27 入学",
    intake: "2026 年秋季",
    duration: "2 年 · 120 ECTS",
    updated: "2026-07-15",
    academic: "国际认可大学的计算机科学或相关学科学士学位，且成绩优秀",
    language: "英语 C1；证书必须在申请截止前提交，符合完整英语授课豁免者除外",
    tests: "是否要求 GRE 取决于项目文件与本科所在国家/地区",
    prerequisites: "需与 ETH 计算机科学学士的要求档案相匹配",
    deadline: "国际本科学位：2025-11-01 至 2025-11-30",
    deadlineNote: "2026 秋季国际申请已截止",
    requirements: [
      { label: "学术背景", value: "相关学位 + 优秀成绩", level: 92 },
      { label: "英语要求", value: "C1", level: 84 },
      { label: "标化考试", value: "按申请身份", level: 50 },
    ],
    documents: ["成绩单", "学位证明或在读证明", "语言证明", "项目指定附加材料"],
    notes: ["仅秋季入学", "国际本科学位必须参加 11 月申请窗口", "可选择五个专业方向"],
    source: "https://ethz.ch/en/studies/master/degree-programmes/engineering-sciences/computer-science.html/1000",
  },
];

const REGIONS: Region[] = ["香港", "新加坡", "美国", "欧洲"];
const DISCIPLINES: Category[] = ["计算机与数据", "金融与量化", "数学与统计", "商科与管理", "工程与技术", "社会科学", "自然科学", "人文与艺术", "法律与公共事务", "医学与生命科学", "教育", "综合项目目录"];
const CATEGORIES: (Category | "全部")[] = ["全部", ...DISCIPLINES];
const BACKGROUNDS: (Background | "全部")[] = ["全部", "跨专业友好", "量化背景", "强先修要求", "待核验"];
const VERIFICATIONS: Verification[] = ["全部", "深度核验", "官网核验", "目录级收录"];
const APPLICATION_STATUSES: ApplicationStatus[] = ["全部", "已开始申请", "往期要求"];
const DEGREE_LEVELS: (DegreeLevel | "全部")[] = ["全部", "硕士", "博士"];
const CYCLES: (Program["cycle"] | "全部")[] = ["全部", "2027 入学", "2026/27 入学", "最近可用"];
const STATIC_PROGRAMS = (staticPrograms as Program[]).length ? staticPrograms as Program[] : PROGRAMS;
const GUIDES = guideData as GuideData;
const US_CPT_DATA = cptPolicyData as CptPolicyData;
const WRITING_GUIDES = writingGuideData as WritingGuide[];
const SIGNATURE_TAG_DATA = signatureTagData as SignatureTagData;
const DEFAULT_PROFILE: ApplicantProfile = { discipline: "未填写", english: "未填写", targetRegions: [] };
const PROFILE_STORAGE_KEY = "fly-away-applicant-profile";
const PLAN_STORAGE_KEY = "fly-away-application-plan";

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

function officialDocumentsOf(program: Program) {
  return [...new Set(program.documents.map((document) => document.trim()).filter(Boolean))];
}

function deadlineDateOf(program: Program) {
  const candidates = [...new Set(program.deadline.match(/20\d{2}-\d{2}-\d{2}/g) ?? [])]
    .map((value) => new Date(`${value}T23:59:59`))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  if (!candidates.length) return null;
  const now = new Date();
  return candidates.find((date) => date.getTime() >= now.getTime()) ?? candidates.at(-1) ?? null;
}

function deadlineWindowOf(program: Program) {
  const deadline = deadlineDateOf(program);
  if (!deadline) return { label: "待官网确认", days: null as number | null, className: "is-unknown" };
  const now = new Date();
  const days = Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return { label: "该轮已过期", days, className: "is-expired" };
  if (days <= 7) return { label: `${days} 天内截止`, days, className: "is-urgent" };
  if (days <= 30) return { label: `${days} 天后截止`, days, className: "is-soon" };
  return { label: `${days} 天后截止`, days, className: "is-planned" };
}

function documentStateOf(plan: PlannedProgram, document: string): DocumentState {
  return plan.documents?.[document] ?? "待准备";
}

function payloadValue(program: Program, key: string) {
  return program.sourcePayload?.[key];
}

function originalProgramNameOf(program: Program) {
  const value = payloadValue(program, "originalProgramName");
  return typeof value === "string" && value !== program.program ? value : "";
}

function verificationOf(program: Program) {
  const level = payloadValue(program, "verificationLevel");
  if (level === "目录级收录" || level === "官网核验") return level;
  return "深度核验";
}

function cardRequirementFactsOf(program: Program) {
  const verification = verificationOf(program);
  const facts = [
    { label: "学术背景", value: program.academic, unavailable: "官网未公开具体学历或成绩门槛" },
    { label: "英语要求", value: program.language, unavailable: "官网未公开具体语言分数" },
    { label: "标化考试", value: program.tests, unavailable: "官网未明确 GRE / GMAT 政策" },
  ];
  return facts.map((fact) => {
    const value = fact.value.trim();
    const vaguePlaceholder = /^(量化基础|按项目要求|按当年政策|校级标准|项目政策|待核验|未提供|暂无|以.+为准)$/i.test(value);
    if (verification === "目录级收录") return { label: fact.label, value: "待官网核验", verified: false };
    if (!value || vaguePlaceholder) return { label: fact.label, value: fact.unavailable, verified: false };
    return { label: fact.label, value, verified: true };
  });
}

function recordTypeOf(program: Program) {
  return payloadValue(program, "recordType") === "目录入口" ? "目录入口" : "项目";
}

function qsRankOf(program: Program) {
  const value = payloadValue(program, "qsRank");
  return typeof value === "string" ? value : "";
}

function signatureTagsOf(program: Program) {
  return SIGNATURE_TAG_DATA.tags.filter((tag) => tag.programIds.includes(program.id));
}

function numericRank(program: Program) {
  return Number.parseInt(qsRankOf(program).replace(/\D/g, ""), 10) || 999;
}

function applicationStatusOf(program: Program): Exclude<ApplicationStatus, "全部"> {
  return payloadValue(program, "applicationStatus") === "已开始申请" ? "已开始申请" : "往期要求";
}

function applicationStatusNoteOf(program: Program) {
  const value = payloadValue(program, "applicationStatusNote");
  return typeof value === "string" ? value : "当前申请季尚未在项目官网确认开放；页面保留最近可用官方要求。";
}

function applicationStatusCheckedAtOf(program: Program) {
  const value = payloadValue(program, "applicationStatusCheckedAt");
  return typeof value === "string" ? value : program.updated;
}

function applicationStatusSourceOf(program: Program) {
  const value = payloadValue(program, "applicationStatusSource");
  return typeof value === "string" ? value : program.source;
}

function degreeLevelOf(program: Program): DegreeLevel | "" {
  const value = payloadValue(program, "degreeLevel");
  return value === "硕士" || value === "博士" ? value : "";
}

function genericWritingGuide(program: Program): WritingGuide {
  const materials: WritingMaterial[] = [];
  const documentText = program.documents.join(" ").toLowerCase();
  const fieldFocus = program.prerequisites || program.academic;
  if (/(sop|statement|个人陈述|目的陈述|动机信|申请原因|文书|essay)/i.test(documentText)) {
    materials.push({ name: "SOP / 个人陈述", requirement: "请以当年申请系统为准", focus: `围绕你的准备度与项目匹配展开；本项目公开的先修/能力线索是：${fieldFocus}`, expression: "用“具体问题—你的行动—方法或能力—结果—下一步学习目标”组织，每个主张都配经历证据。", avoid: "不要把简历逐条改写成散文，也不要把通用模板中的学校名替换后直接提交。" });
  }
  if (/(cv|简历|resume)/i.test(documentText)) {
    materials.push({ name: "CV / 简历", requirement: "请以当年申请系统为准", focus: "优先呈现与目标方向直接相关的课程、研究、实习、工作、作品或发表，并明确个人贡献。", expression: "项目条目写清任务、方法/工具、你的角色和可核验结果；按相关度排序。", avoid: "不要只堆叠工具、证书或团队名称，也不要把团队成果全部写成个人完成。" });
  }
  if (/(推荐|referee|recommendation)/i.test(documentText)) {
    materials.push({ name: "推荐信", requirement: "请以当年申请系统为准", focus: "选择真正见过你处理课程、研究或专业任务的人，让材料能补充成绩单与简历看不到的学习能力和判断力。", expression: "提前提供 CV、文书要点和一两个可举例的项目，让推荐人能写出具体观察。", avoid: "不要只按职级选择不了解你的人，也不要让推荐信与文书中的角色描述冲突。" });
  }
  if (!materials.length) {
    materials.push({ name: "材料清单核对", requirement: "项目具体材料待官网核验", focus: "先以本页“申请材料”列表和当年申请系统为准，确认是否有文书、推荐信、CV 或补充表格。", expression: "若系统出现短答，写清申请动机、准备度和下一步学习目标，并用具体课程或项目支撑。", avoid: "不要把非必需材料当成必需项，也不要向未开放的上传入口递交额外文件。" });
  }
  return { programId: program.id, verification: "通用写作建议 · 未主张为项目偏好", checkedAt: program.updated, sourceLabel: "本页已收录的项目材料与先修要求", source: program.source, summary: "该项目暂未收录项目级文书题目或招生偏好。以下内容只帮助你把已有材料写得可核验，不能替代当年项目官网的具体要求。", materials };
}

function writingGuideOf(program: Program) {
  return WRITING_GUIDES.find((guide) => guide.programId === program.id) ?? genericWritingGuide(program);
}

function cptPolicyOf(program: Program): CptPolicy | null {
  if (program.region !== "美国") return null;
  return US_CPT_DATA.policies.find((policy) => policy.universities.includes(program.university)) ?? null;
}

function cptStatusClass(status: CptPolicyStatus) {
  if (status === "重大更新") return "is-critical";
  if (status === "需重点关注") return "is-watch";
  if (status === "项目级差异") return "is-project";
  return "is-verified";
}

function englishScore(value: EnglishPreparation) {
  if (value.startsWith("IELTS")) return { type: "IELTS", score: Number.parseFloat(value.replace(/[^\d.]/g, "")) };
  if (value.startsWith("TOEFL")) return { type: "TOEFL", score: Number.parseFloat(value.replace(/[^\d.]/g, "")) };
  return null;
}

function expectedEnglishScore(text: string) {
  const ielts = text.match(/IELTS\s*(?:iBT\s*)?(\d(?:\.\d)?)/i);
  const toefl = text.match(/TOEFL(?:\s+iBT)?\s*(\d{2,3})/i);
  if (ielts) return { type: "IELTS", score: Number.parseFloat(ielts[1]), label: `IELTS ${ielts[1]}` };
  if (toefl) return { type: "TOEFL", score: Number.parseFloat(toefl[1]), label: `TOEFL ${toefl[1]}` };
  return null;
}

function readinessOf(program: Program, profile: ApplicantProfile): Readiness {
  const gaps: string[] = [];
  const positives: string[] = [];
  const profileStarted = profile.discipline !== "未填写" || profile.english !== "未填写" || profile.targetRegions.length > 0;
  if (!profileStarted) return { label: "先补充背景", rank: 1, gaps: [], positives: [] };

  if (profile.targetRegions.length && !profile.targetRegions.includes(program.region)) gaps.push("不在你的目标地区");
  if (profile.discipline !== "未填写") {
    if (profile.discipline === program.category) positives.push("学科方向一致");
    else if (program.background === "跨专业友好") positives.push("项目标注为跨专业友好");
    else gaps.push(program.background === "强先修要求" ? "需核对本专业与先修课程" : "学科方向需进一步核对");
  }
  const expectedEnglish = expectedEnglishScore(program.language);
  const currentEnglish = englishScore(profile.english);
  if (expectedEnglish && currentEnglish) {
    if (expectedEnglish.type === currentEnglish.type && currentEnglish.score < expectedEnglish.score) gaps.push(`当前英语成绩低于公开门槛（${expectedEnglish.label}）`);
    else if (expectedEnglish.type === currentEnglish.type) positives.push("英语成绩达到公开门槛");
  } else if (expectedEnglish && profile.english === "未填写") {
    gaps.push(`待补充英语成绩（公开门槛：${expectedEnglish.label}）`);
  }

  if (/GRE|GMAT/i.test(program.tests) && /(必需|要求|required)/i.test(program.tests) && !/(非必需|可选|optional|not required)/i.test(program.tests)) gaps.push("需确认标化考试安排");
  if (verificationOf(program) === "目录级收录") gaps.push("该项目仍为目录级收录，关键要求须打开官网核对");

  if (gaps.some((gap) => /低于|补强|标化|目标地区/.test(gap))) return { label: "需要补条件", rank: 2, gaps, positives };
  if (verificationOf(program) === "目录级收录" || gaps.some((gap) => /需核对|待补充|进一步核对/.test(gap))) return { label: "需进一步核验", rank: 3, gaps, positives };
  return { label: "可优先研究", rank: 4, gaps, positives };
}

export default function Home() {
  const [programs, setPrograms] = useState<Program[]>(STATIC_PROGRAMS);
  const [guides, setGuides] = useState<GuideData>(GUIDES);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "全部">("全部");
  const [category, setCategory] = useState<Category | "全部">("全部");
  const [background, setBackground] = useState<Background | "全部">("全部");
  const [cycle, setCycle] = useState<Program["cycle"] | "全部">("全部");
  const [verification, setVerification] = useState<Verification>("全部");
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>("全部");
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel | "全部">("全部");
  const [sort, setSort] = useState("最新核验");
  const [pageState, setPageState] = useState({ key: "", count: 60 });
  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toolkitTab, setToolkitTab] = useState<"overview" | "materials" | "timeline" | "sources" | "appendix">("materials");
  const [toast, setToast] = useState("");
  const [profile, setProfile] = useState<ApplicantProfile>(DEFAULT_PROFILE);
  const [planned, setPlanned] = useState<PlannedProgram[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [planSyncMode, setPlanSyncMode] = useState<"loading" | "synced" | "local">("loading");
  const [monitorSnapshots, setMonitorSnapshots] = useState<SourceSnapshot[]>([]);
  const [monitoring, setMonitoring] = useState(false);
  const [onlyProfileMatches, setOnlyProfileMatches] = useState(false);

  const announce = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/programs")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("database unavailable")))
      .then((payload: { programs?: Program[] }) => {
        if (active && payload.programs?.length) setPrograms(payload.programs);
      })
      .catch(() => undefined);
    fetch("/api/guides")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("guide database unavailable")))
      .then((payload: { guides?: Partial<GuideData> }) => {
        if (active && payload.guides) setGuides((current) => ({ ...current, ...payload.guides }));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/application-plan")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("plan sync unavailable")))
      .then((payload: { plans?: PlannedProgram[] }) => {
        if (active && Array.isArray(payload.plans)) {
          setPlanned((current) => payload.plans?.length ? payload.plans : current);
          setPlanSyncMode("synced");
        }
      })
      .catch(() => { if (active) setPlanSyncMode("local"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const restoreSavedState = window.setTimeout(() => {
      try {
        const savedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        const savedPlan = window.localStorage.getItem(PLAN_STORAGE_KEY);
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile) as Partial<ApplicantProfile>;
          setProfile({
            discipline: parsedProfile.discipline ?? DEFAULT_PROFILE.discipline,
            english: parsedProfile.english ?? DEFAULT_PROFILE.english,
            targetRegions: Array.isArray(parsedProfile.targetRegions) ? parsedProfile.targetRegions : DEFAULT_PROFILE.targetRegions,
          });
        }
        if (savedPlan) setPlanned(JSON.parse(savedPlan) as PlannedProgram[]);
      } catch {
        window.localStorage.removeItem(PROFILE_STORAGE_KEY);
        window.localStorage.removeItem(PLAN_STORAGE_KEY);
      } finally {
        setStorageReady(true);
      }
    }, 0);
    return () => window.clearTimeout(restoreSavedState);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(planned));
  }, [profile, planned, storageReady]);

  useEffect(() => {
    if (!storageReady || planSyncMode !== "synced") return;
    const timer = window.setTimeout(() => {
      fetch("/api/application-plan", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plans: planned }),
      }).then((response) => {
        if (!response.ok) setPlanSyncMode("local");
      }).catch(() => setPlanSyncMode("local"));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [planned, storageReady, planSyncMode]);

  useEffect(() => {
    const ids = planned.map((item) => item.id).join(",");
    if (!ids) return;
    let active = true;
    fetch(`/api/monitor?programIds=${encodeURIComponent(ids)}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("monitor unavailable")))
      .then((payload: { snapshots?: SourceSnapshot[] }) => { if (active && Array.isArray(payload.snapshots)) setMonitorSnapshots(payload.snapshots); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [planned]);

  useEffect(() => {
    if (!storageReady || !("Notification" in window) || Notification.permission !== "granted") return;
    const remind = () => {
      const upcoming = planned.map((plan) => ({ plan, program: programs.find((program) => program.id === plan.id) }))
        .filter((item): item is { plan: PlannedProgram; program: Program } => Boolean(item.program))
        .filter(({ plan, program }) => Boolean(plan.reminder?.enabled) && (deadlineWindowOf(program).days ?? 999) >= 0 && (deadlineWindowOf(program).days ?? 999) <= 7);
      const key = `fly-away-deadline-notice-${new Date().toISOString().slice(0, 10)}`;
      if (!upcoming.length || window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "sent");
      const first = upcoming[0];
      new Notification("Fly Away · 截止日期提醒", { body: `${first.program.university} · ${first.program.program} ${deadlineWindowOf(first.program).label}。请打开官网确认。` });
    };
    remind();
    const interval = window.setInterval(remind, 6 * 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [planned, programs, storageReady]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetailId(null);
        setCompareOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const items = programs.filter((program) => {
      const cptPolicy = cptPolicyOf(program);
      const writingGuide = writingGuideOf(program);
      const writingText = [writingGuide.summary, ...writingGuide.materials.flatMap((material) => [material.name, material.focus, material.expression])];
      const haystack = [program.university, program.school, program.program, originalProgramNameOf(program), program.region, program.city, program.category, program.direction, program.prerequisites, program.applicationRequirements, cptPolicy?.summary, cptPolicy?.shortLabel, cptPolicy ? "cpt 美国实习 F-1" : "", ...writingText].join(" ").toLowerCase();
      return (!normalized || haystack.includes(normalized))
        && (region === "全部" || program.region === region)
        && (category === "全部" || program.category === category)
        && (background === "全部" || program.background === background)
        && (cycle === "全部" || program.cycle === cycle)
        && (verification === "全部" || verificationOf(program) === verification)
        && (applicationStatus === "全部" || applicationStatusOf(program) === applicationStatus)
        && (degreeLevel === "全部" || degreeLevelOf(program) === degreeLevel)
        && (!onlyProfileMatches || readinessOf(program, profile).rank >= 3);
    });
    return [...items].sort((a, b) => {
      if (sort === "QS 排名") return numericRank(a) - numericRank(b) || a.university.localeCompare(b.university, "zh-CN");
      if (sort === "院校名称") return a.university.localeCompare(b.university, "zh-CN");
      if (sort === "地区顺序") return REGIONS.indexOf(a.region) - REGIONS.indexOf(b.region);
      if (sort === "按我的准备度") return readinessOf(b, profile).rank - readinessOf(a, profile).rank || b.updated.localeCompare(a.updated);
      return b.updated.localeCompare(a.updated) || a.university.localeCompare(b.university, "zh-CN");
    });
  }, [programs, query, region, category, background, cycle, verification, applicationStatus, degreeLevel, sort, profile, onlyProfileMatches]);

  const selectedPrograms = selected.map((id) => programs.find((program) => program.id === id)).filter(Boolean) as Program[];
  const plannedPrograms = planned.map((item) => ({ ...item, program: programs.find((program) => program.id === item.id) })).filter((item): item is PlannedProgram & { program: Program } => Boolean(item.program));
  const detail = detailId ? programs.find((program) => program.id === detailId) ?? null : null;
  const filterKey = [query, region, category, background, cycle, verification, applicationStatus, degreeLevel, sort, onlyProfileMatches].join("|");
  const visibleCount = pageState.key === filterKey ? pageState.count : 60;
  const displayed = filtered.slice(0, visibleCount);
  const qsSchoolCount = new Set(programs.filter((program) => qsRankOf(program)).map((program) => program.university)).size;
  const deepVerifiedCount = programs.filter((program) => verificationOf(program) === "深度核验").length;
  const officialVerifiedCount = programs.filter((program) => verificationOf(program) === "官网核验").length;
  const openApplicationCount = programs.filter((program) => applicationStatusOf(program) === "已开始申请").length;
  const usCptCoverageCount = programs.filter((program) => cptPolicyOf(program)).length;
  const readinessSummary = programs.reduce<Record<Readiness["label"], number>>((summary, program) => {
    const label = readinessOf(program, profile).label;
    summary[label] += 1;
    return summary;
  }, { "先补充背景": 0, "可优先研究": 0, "需要补条件": 0, "需进一步核验": 0 });

  const toggleCompare = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) {
        announce("已移出对比清单");
        return current.filter((item) => item !== id);
      }
      if (current.length >= 3) {
        announce("一次最多对比 3 个项目");
        return current;
      }
      announce("已加入对比清单");
      return [...current, id];
    });
  };

  const togglePlan = (id: string) => {
    setPlanned((current) => {
      if (current.some((item) => item.id === id)) {
        announce("已从申请计划移除");
        return current.filter((item) => item.id !== id);
      }
      const program = programs.find((item) => item.id === id);
      announce("已加入申请计划");
      return [...current, {
        id,
        stage: "研究中",
        documents: Object.fromEntries((program ? officialDocumentsOf(program) : []).map((document) => [document, "待准备"] as const)),
        reminder: { enabled: false },
      }];
    });
  };

  const updatePlanStage = (id: string, stage: PlanStage) => setPlanned((current) => current.map((item) => item.id === id ? { ...item, stage } : item));

  const updateDocumentState = (id: string, document: string, state: DocumentState) => setPlanned((current) => current.map((item) => item.id === id ? {
    ...item,
    documents: { ...item.documents, [document]: state },
  } : item));

  const toggleDeadlineReminder = (id: string) => setPlanned((current) => current.map((item) => item.id === id ? {
    ...item,
    reminder: { enabled: !item.reminder?.enabled },
  } : item));

  const requestBrowserNotifications = async () => {
    if (!("Notification" in window)) {
      announce("当前浏览器不支持系统提醒，可继续使用页面内提醒");
      return;
    }
    const permission = await Notification.requestPermission();
    announce(permission === "granted" ? "系统提醒已启用；仅对你勾选的项目生效" : "未启用系统提醒，页面内提醒仍会显示");
  };

  const runMonitor = async () => {
    const ids = planned.map((item) => item.id).slice(0, 8);
    if (!ids.length) {
      announce("先把项目加入申请计划，再运行官方来源巡检");
      return;
    }
    setMonitoring(true);
    try {
      const response = await fetch("/api/monitor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ programIds: ids }),
      });
      const payload = await response.json() as { checks?: SourceSnapshot[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "巡检不可用");
      if (payload.checks) setMonitorSnapshots((current) => [...payload.checks, ...current].slice(0, 60));
      const statusResponse = await fetch("/api/programs");
      if (statusResponse.ok) {
        const data = await statusResponse.json() as { programs?: Program[] };
        if (data.programs?.length) setPrograms(data.programs);
      }
      const promoted = payload.checks?.filter((check) => Boolean((check as SourceSnapshot & { updatedStatus?: boolean }).updatedStatus)).length ?? 0;
      announce(promoted ? `巡检完成，${promoted} 个项目已检测到强开放信号并更新状态` : "巡检完成；未检测到可安全自动标绿的新状态");
    } catch (error) {
      announce(error instanceof Error ? error.message : "巡检暂不可用，请稍后重试");
    } finally {
      setMonitoring(false);
    }
  };

  const toggleTargetRegion = (target: Region) => setProfile((current) => ({
    ...current,
    targetRegions: current.targetRegions.includes(target) ? current.targetRegions.filter((region) => region !== target) : [...current.targetRegions, target],
  }));

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    setOnlyProfileMatches(false);
    announce("你的背景档案已清除");
  };

  const resetFilters = () => {
    setQuery("");
    setRegion("全部");
    setCategory("全部");
    setBackground("全部");
    setCycle("全部");
    setVerification("全部");
    setApplicationStatus("全部");
    setDegreeLevel("全部");
    setSort("最新核验");
    setOnlyProfileMatches(false);
    announce("筛选条件已清除");
  };

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Fly Away 首页">
          <span className="brand-mark" aria-hidden="true">FA</span>
          <span><strong>Fly Away</strong><small>留学项目情报库</small></span>
        </a>
        <nav className="nav" aria-label="主导航">
          <a className="active" href="#programs">查项目</a>
          <a href="#assistant">申请助手</a>
          <a href="#disciplines">学科地图</a>
          <a href="/cpt">CPT / OPT</a>
          <button type="button" onClick={() => selected.length ? setCompareOpen(true) : announce("请先加入想对比的项目")}>项目对比</button>
          <a href="#toolkit">申请工具箱</a>
        </nav>
        <div className="top-actions">
          <span className="fresh-label">资料更新至 2026.08</span>
          <button className="compare-pill" type="button" disabled={!selected.length} onClick={() => setCompareOpen(true)}>
            对比清单 <b>{selected.length}</b>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-title">
            <p className="eyebrow">Global Program Intelligence</p>
            <h1 id="page-title">信息无落差，<br />选择更<em>潇洒</em>。</h1>
          </div>
          <div className="hero-tools">
            <p>目前收录 QS 2027 前 50 中位于香港、新加坡、美国与欧洲的 33 所院校。</p>
            <form className="search-shell" role="search" onSubmit={(event) => { event.preventDefault(); document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" }); announce(query ? `已定位与“${query}”相关的项目` : "请输入学校、学院或项目名称"); }}>
              <label className="sr-only" htmlFor="global-search">搜索学校、学院或项目</label>
              <input id="global-search" value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="搜索学校、学院或项目，例如：港大 人工智能" />
              <button type="submit">开始定位</button>
            </form>
            <div className="search-hints"><span><b>{programs.length}</b> 条项目与目录记录</span><span><b>{qsSchoolCount}</b> 所 QS 前50院校</span><span><b>{openApplicationCount}</b> 项已开始申请</span><span><b>{officialVerifiedCount}</b> 条官网核验</span><span><b>{deepVerifiedCount}</b> 条深度核验</span></div>
          </div>
        </section>

        <section className="application-studio" id="assistant" aria-labelledby="assistant-title">
          <div className="studio-intro"><p className="section-kicker">APPLICATION READINESS</p><h2 id="assistant-title">先看公开门槛，再安排下一步。</h2><p>填写你愿意提供的背景信息，Fly Away 会标注项目的公开条件、待补项和核验边界；这不是录取概率预测。</p><button type="button" onClick={resetProfile}>清除我的背景</button></div>
          <div className="studio-main">
            <div className="profile-form" aria-label="我的申请背景">
              <label><span>本科 / 主要方向</span><select value={profile.discipline} onChange={(event) => setProfile((current) => ({ ...current, discipline: event.target.value as ApplicantProfile["discipline"] }))}><option>未填写</option>{DISCIPLINES.filter((item) => item !== "综合项目目录").map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span>当前英语成绩</span><select value={profile.english} onChange={(event) => setProfile((current) => ({ ...current, english: event.target.value as EnglishPreparation }))}>{(["未填写", "IELTS 6.0", "IELTS 6.5", "IELTS 7.0+", "TOEFL 90", "TOEFL 100+"] as EnglishPreparation[]).map((item) => <option key={item}>{item}</option>)}</select></label>
              <fieldset><legend>目标地区（可多选）</legend><div className="region-toggle-row">{REGIONS.map((item) => <button key={item} type="button" className={profile.targetRegions.includes(item) ? "is-selected" : ""} aria-pressed={profile.targetRegions.includes(item)} onClick={() => toggleTargetRegion(item)}>{item}</button>)}</div></fieldset>
            </div>
            <div className="readiness-panel"><div><small>公开门槛匹配</small><strong>{profile.discipline === "未填写" && profile.english === "未填写" && !profile.targetRegions.length ? "填写背景后开始" : `${readinessSummary["可优先研究"]} 个可优先研究`}</strong><p>{readinessSummary["需要补条件"]} 个项目提示需补条件；{readinessSummary["需进一步核验"]} 个项目仍需逐项打开官网确认。</p></div><button type="button" onClick={() => { const next = !onlyProfileMatches; setOnlyProfileMatches(next); setSort("按我的准备度"); document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" }); announce(next ? "已优先显示准备度较高的项目" : "已显示全部项目"); }}>{onlyProfileMatches ? "显示全部项目" : "优先看准备度较高"}</button><small className="privacy-note">仅保存在当前浏览器，不上传个人背景。</small></div>
          </div>
          <ApplicationTimeline plannedPrograms={plannedPrograms} syncMode={planSyncMode} snapshots={monitorSnapshots} monitoring={monitoring} onStageChange={updatePlanStage} onDocumentChange={updateDocumentState} onToggleReminder={toggleDeadlineReminder} onRequestNotifications={requestBrowserNotifications} onRunMonitor={runMonitor} onRemove={togglePlan} />
        </section>

        <section className="route-band" id="regions" aria-label="地区快速筛选">
          <div className="route-label"><small>Destination Index</small><strong>四大申请坐标</strong></div>
          {REGIONS.map((item) => {
            const count = programs.filter((program) => program.region === item).length;
            const active = region === item;
            return (
              <button key={item} className={`route-stop ${active ? "is-active" : ""}`} type="button" aria-pressed={active} onClick={() => { setRegion(active ? "全部" : item); announce(active ? "已显示全部地区" : `已切换至${item}项目`); }}>
                <strong>{item}</strong><span>{count} 个已结构化项目</span>
              </button>
            );
          })}
          <div className="data-fresh"><b>100%</b><small>附官方来源</small></div>
        </section>

        <section className="discipline-map" id="disciplines" aria-labelledby="discipline-title">
          <div className="discipline-intro"><p className="section-kicker">DISCIPLINE MAP</p><h2 id="discipline-title">从热门赛道，扩展到留学全学科。</h2><p>项目以中文名称为主，同时保留官方原名，方便直观理解、官网检索与交叉核对。学校完整目录与具体项目分开显示，便于继续补录而不遗漏。</p></div>
          <div className="discipline-grid">
            {DISCIPLINES.map((item) => {
              const count = programs.filter((program) => program.category === item).length;
              return <button type="button" key={item} className={count ? "has-data" : "is-pending"} onClick={() => { setCategory(item); document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" }); }}><span>{item}</span><b>{count ? `${count} 项` : "待扩展"}</b></button>;
            })}
          </div>
        </section>

        <section className="cpt-watchlist" id="cpt" aria-labelledby="cpt-title">
          <div className="cpt-watchlist-intro"><p className="section-kicker">U.S. F-1 WORK AUTHORIZATION</p><h2 id="cpt-title">美国 CPT / OPT 政策雷达</h2><p>{US_CPT_DATA.scope}</p><small>本次核验：{formatDate(US_CPT_DATA.verifiedAt)} · 已挂载至当前载入的 {usCptCoverageCount} 条美国项目记录</small><a className="cpt-cta" href="/cpt">打开 CPT / OPT 决策页</a></div>
          <div className="cpt-alert-list">{US_CPT_DATA.alerts.map((alert) => <article key={alert.title} className={`cpt-alert cpt-alert-${alert.severity === "重大更新" ? "critical" : alert.severity === "政策变化" ? "watch" : "base"}`}><div><span>{alert.severity}</span><small>{formatDate(alert.date)}</small></div><h3>{alert.title}</h3><p>{alert.summary}</p><a href={alert.source} target="_blank" rel="noreferrer">{alert.sourceLabel} <b>打开官网</b></a></article>)}</div>
        </section>

        <section className="explore" id="programs">
          <aside className="filter-panel" aria-label="项目筛选">
            <div className="filter-title"><h2>缩小范围</h2><button type="button" onClick={resetFilters}>清除全部</button></div>
            <FilterGroup title="核验层级" values={VERIFICATIONS} active={verification} onChange={(value) => setVerification(value as Verification)} />
            <FilterGroup title="学科方向" values={CATEGORIES} active={category} onChange={(value) => setCategory(value as Category | "全部")} />
            <FilterGroup title="背景匹配" values={BACKGROUNDS} active={background} onChange={(value) => setBackground(value as Background | "全部")} />
            <FilterGroup title="信息年份" values={CYCLES} active={cycle} onChange={(value) => setCycle(value as Program["cycle"] | "全部")} />
            <FilterGroup title="申请状态" values={APPLICATION_STATUSES} active={applicationStatus} onChange={(value) => setApplicationStatus(value as ApplicationStatus)} />
            <FilterGroup title="学位层次" values={DEGREE_LEVELS} active={degreeLevel} onChange={(value) => setDegreeLevel(value as DegreeLevel | "全部")} />
            <div className="year-note"><b>数据口径</b><p>绿标仅代表项目官网明确已开放当前申请季；其余记录显示最近可用官方要求，并以黄标提示复核。状态最近核验：2026.08.11。</p></div>
          </aside>

          <div className="results">
            <div className="results-head">
              <div><p className="section-kicker">PROGRAMME FINDER</p><h2>{filtered.length ? "与你匹配的项目" : "暂未找到项目"}</h2></div>
              <div className="results-controls"><span>共 {filtered.length} 项 · 计划 {plannedPrograms.length} 项</span><label>排序<select value={sort} onChange={(event) => setSort(event.target.value)}><option>最新核验</option><option>按我的准备度</option><option>QS 排名</option><option>地区顺序</option><option>院校名称</option></select></label></div>
            </div>

            {filtered.length ? displayed.map((program, index) => {
              const active = selected.includes(program.id);
              const verification = verificationOf(program);
              const recordType = recordTypeOf(program);
              const qsRank = qsRankOf(program);
              const originalProgramName = originalProgramNameOf(program);
              const readiness = readinessOf(program, profile);
              const inPlan = planned.some((item) => item.id === program.id);
              const status = applicationStatusOf(program);
              const degree = degreeLevelOf(program);
              const cptPolicy = cptPolicyOf(program);
              const signatureTags = signatureTagsOf(program);
              return (
                <article className="program-row program-row-enter" style={{ "--enter-delay": `${Math.min(index, 12) * 28}ms` } as CSSProperties} key={program.id}>
                  <div className="program-id">
                    <span className="rank">{String(index + 1).padStart(2, "0")}</span>
                    <div className="school"><small>{program.region} · {program.school}</small><h3>{program.university}<br />{program.program}</h3>{originalProgramName && <p className="original-program">官方原名：{originalProgramName}</p>}<p>{program.duration} · {program.intake}</p><div className="program-tags"><span className={`application-tag ${status === "已开始申请" ? "is-open" : "is-historical"}`}>{status}</span>{degree && <span className={`degree-tag degree-${degree}`}>{degree}</span>}{signatureTags.map((tag) => <span className={`signature-tag signature-${tag.tone}`} title={tag.basis} key={tag.id}>{tag.label}</span>)}{cptPolicy && <span className={`cpt-tag ${cptStatusClass(cptPolicy.status)}`}>CPT · {cptPolicy.status}</span>}<span className={`cycle-tag ${program.cycle === "最近可用" ? "is-legacy" : ""}`}>{program.cycle}</span>{qsRank && <span className="qs-tag">QS {qsRank}</span>}<span className={`verification-tag ${verification === "深度核验" ? "is-deep" : verification === "官网核验" ? "is-official" : ""}`}>{verification}</span><span className={`readiness-tag readiness-${readiness.rank}`}>{readiness.label}</span>{recordType === "目录入口" && <span className="directory-tag">完整目录入口</span>}</div><small className="verification-date">申请状态核验：{formatDate(applicationStatusCheckedAtOf(program))} · {program.sources?.length || 1} 个官方来源</small></div>
                  </div>
                  <div className="requirements" aria-label={`${program.program}申请要求概览`}>
                    {cardRequirementFactsOf(program).map((requirement) => (
                      <div className={`requirement ${requirement.verified ? "" : "is-unverified"}`} key={requirement.label}><span>{requirement.label}</span><b>{requirement.value}</b></div>
                    ))}
                  </div>
                  <div className="row-action"><p>关键日期<strong>{program.deadline.split("；")[0]}</strong></p><button className="detail-button" type="button" onClick={() => setDetailId(program.id)}>查看详情</button><button className={`add-plan ${inPlan ? "is-active" : ""}`} type="button" aria-pressed={inPlan} onClick={() => togglePlan(program.id)}>{inPlan ? "已在计划" : "加入计划"}</button><button className={`add-compare ${active ? "is-active" : ""}`} type="button" aria-pressed={active} onClick={() => toggleCompare(program.id)}>{active ? "已加入对比" : "加入对比"}</button></div>
                </article>
              );
            }) : (
              <div className="empty-state"><strong>没有符合全部条件的项目</strong><p>尝试减少筛选条件，或换一个学校、专业关键词。</p><button type="button" onClick={resetFilters}>显示全部项目</button></div>
            )}
            {visibleCount < filtered.length && <button className="load-more" type="button" onClick={() => setPageState({ key: filterKey, count: visibleCount + 60 })}>继续加载 <b>{Math.min(60, filtered.length - visibleCount)}</b> 条</button>}
          </div>
        </section>

        <section className="toolkit" id="toolkit" aria-labelledby="toolkit-title">
          <div className="toolkit-head"><div><p className="section-kicker">APPLICATION TOOLKIT</p><h2 id="toolkit-title">表格里的信息，一项也不丢。</h2></div><p>材料清单、申请时间线、项目池结论、官网索引与原表重点项目画像均已纳入；项目详情还提供可追溯的文书重点与通用写作边界。</p></div>
          <div className="toolkit-tabs" role="tablist" aria-label="申请工具箱内容">
            {([['materials','材料清单'],['timeline','申请时间线'],['overview','项目池结论'],['sources','官网索引'],['appendix','原表附录']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={toolkitTab === value} onClick={() => setToolkitTab(value)}>{label}</button>)}
          </div>
          <ToolkitContent tab={toolkitTab} guides={guides} />
        </section>

        <section className="method" id="method">
          <p className="section-kicker">DATA METHOD</p>
          <div><h2>用数据库保存事实，用来源标注边界。</h2><p>“深度核验”逐项整理项目要求；“官网核验”确认项目直接来源并补齐校级学历、语言、材料与标化规则；“目录级收录”只确认官方目录中的项目名称。文书建议同样区分项目级公开要求与通用写作方法，三者不会混为一谈。</p></div>
          <div className="method-points"><span><b>01</b> 33 所 QS 前50院校</span><span><b>02</b> 官网与年份可追溯</span><span><b>03</b> 三级核验不混淆</span></div>
        </section>
      </main>

      <footer><span>Fly Away · 留学项目情报库</span><span>首批功能版 · 申请状态核验于 2026 年 8 月</span></footer>

      {detail && <DetailDrawer program={detail} selected={selected.includes(detail.id)} planned={planned.some((item) => item.id === detail.id)} profile={profile} onClose={() => setDetailId(null)} onCompare={() => toggleCompare(detail.id)} onPlan={() => togglePlan(detail.id)} />}
      {compareOpen && <CompareDialog programs={selectedPrograms} onClose={() => setCompareOpen(false)} onRemove={toggleCompare} />}
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}

function FilterGroup({ title, values, active, onChange }: { title: string; values: readonly string[]; active: string; onChange: (value: string) => void }) {
  return <div className="filter-group"><h3>{title}</h3><div className="chip-row">{values.map((value) => <button className="chip" type="button" aria-pressed={active === value} key={value} onClick={() => onChange(value)}>{value}</button>)}</div></div>;
}

function ApplicationTimeline({ plannedPrograms, syncMode, snapshots, monitoring, onStageChange, onDocumentChange, onToggleReminder, onRequestNotifications, onRunMonitor, onRemove }: {
  plannedPrograms: Array<PlannedProgram & { program: Program }>;
  syncMode: "loading" | "synced" | "local";
  snapshots: SourceSnapshot[];
  monitoring: boolean;
  onStageChange: (id: string, stage: PlanStage) => void;
  onDocumentChange: (id: string, document: string, state: DocumentState) => void;
  onToggleReminder: (id: string) => void;
  onRequestNotifications: () => void;
  onRunMonitor: () => void;
  onRemove: (id: string) => void;
}) {
  const sorted = [...plannedPrograms].sort((a, b) => {
    const first = deadlineWindowOf(a.program).days ?? Number.MAX_SAFE_INTEGER;
    const second = deadlineWindowOf(b.program).days ?? Number.MAX_SAFE_INTEGER;
    return first - second;
  });
  const missingDocuments = plannedPrograms.reduce((total, item) => total + officialDocumentsOf(item.program).filter((document) => documentStateOf(item, document) === "待准备").length, 0);
  const urgent = plannedPrograms.filter(({ program }) => {
    const days = deadlineWindowOf(program).days;
    return typeof days === "number" && days >= 0 && days <= 30;
  }).length;
  const syncText = syncMode === "synced" ? "已同步到你的账户" : syncMode === "loading" ? "正在连接计划库" : "当前仅保存在此浏览器";

  return <section className="application-timeline" aria-labelledby="timeline-title">
    <div className="timeline-head"><div><p className="section-kicker">MY APPLICATION TIMELINE</p><h3 id="timeline-title">把收藏项目变成可执行的申请计划。</h3><p>截止日、材料缺口、推荐信/语言成绩和官网巡检集中在一处。提醒只在你启用的项目上生效。</p></div><div className="timeline-actions"><span className={`sync-badge is-${syncMode}`}>{syncText}</span><button type="button" onClick={onRequestNotifications}>启用系统提醒</button><button type="button" className="monitor-button" disabled={monitoring} onClick={onRunMonitor}>{monitoring ? "正在巡检…" : "巡检官方来源"}</button></div></div>
    <div className="timeline-summary"><span><b>{plannedPrograms.length}</b> 个计划项目</span><span><b>{urgent}</b> 个项目 30 天内截止</span><span><b>{missingDocuments}</b> 项材料待准备</span></div>
    {sorted.length ? <div className="timeline-list">{sorted.map((item) => {
      const { program } = item;
      const documents = officialDocumentsOf(program);
      const documentDone = documents.filter((document) => ["已准备", "已提交", "不适用"].includes(documentStateOf(item, document))).length;
      const missing = documents.filter((document) => documentStateOf(item, document) === "待准备");
      const deadline = deadlineWindowOf(program);
      const latestSnapshot = snapshots.find((snapshot) => snapshot.programId === item.id);
      return <article key={item.id} className={`timeline-card ${deadline.className}`}>
        <div className="timeline-card-head"><div><span className={`deadline-badge ${deadline.className}`}>{deadline.label}</span><h4>{program.university} · {program.program}</h4><p>官方关键日期：{program.deadline} · 申请状态：{applicationStatusOf(program)}</p></div><button type="button" onClick={() => onRemove(item.id)}>移除</button></div>
        <div className="timeline-card-grid">
          <label><span>申请进度</span><select value={item.stage} onChange={(event) => onStageChange(item.id, event.target.value as PlanStage)}>{(["研究中", "准备材料", "已提交"] as PlanStage[]).map((stage) => <option key={stage}>{stage}</option>)}</select></label>
          <div className="reminder-control"><span>截止提醒</span><button type="button" className={item.reminder?.enabled ? "is-enabled" : ""} aria-pressed={Boolean(item.reminder?.enabled)} onClick={() => onToggleReminder(item.id)}>{item.reminder?.enabled ? "已启用" : "未启用"}</button><small>仅在本页打开时检查；启用系统提醒后，7 天内截止会弹出通知。</small></div>
          <div className="timeline-monitor"><span>最近官网巡检</span>{latestSnapshot ? <><strong>{latestSnapshot.status}{latestSnapshot.httpStatus ? ` · HTTP ${latestSnapshot.httpStatus}` : ""}</strong><small>{formatDate(latestSnapshot.checkedAt.slice(0, 10))} · {latestSnapshot.note}</small></> : <><strong>尚未运行</strong><small>加入计划后可巡检项目首要官方来源并记录页面变化。</small></>}</div>
        </div>
        <details className="document-checklist"><summary><span><strong>申请材料与缺口</strong><small>{documents.length ? `已处理 ${documentDone} / ${documents.length} · 待准备：${missing.length ? missing.join("、") : "无"}` : "项目材料待官网确认"}</small></span><b>展开清单</b></summary><div>{documents.length ? documents.map((document) => <label key={document}><span>{document}</span><select value={documentStateOf(item, document)} onChange={(event) => onDocumentChange(item.id, document, event.target.value as DocumentState)}>{(["待准备", "已准备", "已提交", "不适用"] as DocumentState[]).map((state) => <option key={state}>{state}</option>)}</select></label>) : <p>该项目尚未收录结构化材料。请打开项目官网或申请系统确认后再加入待办。</p>}<a href={program.source} target="_blank" rel="noreferrer">打开项目官方来源 <b>核对材料</b></a></div></details>
      </article>;
    })}</div> : <div className="timeline-empty"><strong>从项目卡片开始，建立你的申请时间线。</strong><p>加入计划后，系统会从该项目的公开材料中生成待办、标出可识别的截止日期，并保留巡检记录。</p></div>}
    <p className="timeline-disclaimer">截止日期从已收录文本中识别；出现多个轮次、滚动录取或未公布日期时，必须以项目申请系统和官网为准。自动巡检只在检测到明确“申请开放”措辞时更新绿色状态，其余变化会保留为待复核记录。</p>
  </section>;
}

function ToolkitContent({ tab, guides }: { tab: "overview" | "materials" | "timeline" | "sources" | "appendix"; guides: GuideData }) {
  if (tab === "overview") return <div className="overview-grid">{guides.overview.map((row, index) => <article key={`${row["项目"]}-${index}`}><small>{row["项目"]}</small><p>{row["结论"]}</p></article>)}</div>;
  if (tab === "materials") return <GuideTable rows={guides.materials} />;
  if (tab === "timeline") return <GuideTable rows={guides.timeline} />;
  if (tab === "sources") return <div className="source-index">{guides.sources.map((row, index) => <a key={`${row["URL"]}-${index}`} href={String(row["URL"])} target="_blank" rel="noreferrer"><span>{row["来源"]}</span><b>打开官网</b></a>)}</div>;
  return <div className="appendix-wrap"><AppendixGroup title="原表主表索引 · 录取画像与案例" rows={guides.originalIndex} primaryKey="学校名称" secondaryKey="项目名称" /><AppendixGroup title="原表 Web 汇总 · 最近可用官方信息" rows={guides.webSummary} primaryKey="学校" secondaryKey="项目" /></div>;
}

function GuideTable({ rows }: { rows: GuideRow[] }) {
  const columns = rows[0] ? Object.keys(rows[0]) : [];
  return <div className="guide-table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{columns.map((column) => <td key={column}>{row[column]}</td>)}</tr>)}</tbody></table></div>;
}

function AppendixGroup({ title, rows, primaryKey, secondaryKey }: { title: string; rows: GuideRow[]; primaryKey: string; secondaryKey: string }) {
  return <section className="appendix-group"><h3>{title}</h3>{rows.map((row, index) => <details key={`${row[primaryKey]}-${row[secondaryKey]}-${index}`}><summary><span><strong>{row[primaryKey]}</strong><small>{row[secondaryKey]}</small></span><b>展开全部字段</b></summary><dl>{Object.entries(row).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "未提供"}</dd></div>)}</dl></details>)}</section>;
}

function DetailDrawer({ program, selected, planned, profile, onClose, onCompare, onPlan }: { program: Program; selected: boolean; planned: boolean; profile: ApplicantProfile; onClose: () => void; onCompare: () => void; onPlan: () => void }) {
  const initialSources = program.sources?.length ? program.sources : [{ label: "项目官网", url: program.source, kind: "项目官网", year: program.cycle }];
  const verification = verificationOf(program);
  const qsRank = qsRankOf(program);
  const originalProgramName = originalProgramNameOf(program);
  const readiness = readinessOf(program, profile);
  const policyScope = payloadValue(program, "policyScope");
  const status = applicationStatusOf(program);
  const degree = degreeLevelOf(program);
  const statusNote = applicationStatusNoteOf(program);
  const statusCheckedAt = applicationStatusCheckedAtOf(program);
  const statusSource = applicationStatusSourceOf(program);
  const cptPolicy = cptPolicyOf(program);
  const signatureTags = signatureTagsOf(program);
  const sources = initialSources.some((source) => source.url === statusSource) ? initialSources : [{ label: "本次申请状态核验", url: statusSource, kind: "官方申请状态", year: formatDate(statusCheckedAt) }, ...initialSources];
  return <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="detail-drawer" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="drawer-head"><div><p>{program.region} · {program.school}</p><h2 id="detail-title">{program.university}<br />{program.program}</h2>{originalProgramName && <p className="original-program drawer-original">官方原名：{originalProgramName}</p>}</div><button type="button" onClick={onClose}>关闭</button></div>
      <div className="drawer-meta"><span className={`application-tag ${status === "已开始申请" ? "is-open" : "is-historical"}`}>{status}</span>{degree && <span className={`degree-tag degree-${degree}`}>{degree}</span>}{signatureTags.map((tag) => <span className={`signature-tag signature-${tag.tone}`} key={tag.id}>{tag.label}</span>)}<span>{program.category}</span><span>{program.direction || program.category}</span><span>{program.cycle}</span><span>{program.duration}</span>{qsRank && <span>QS 2027 · {qsRank}</span>}<span>{verification} · {formatDate(program.updated)}</span><span>{readiness.label}</span></div>
      {signatureTags.length > 0 && <SignatureEvidencePanel tags={signatureTags} />}
      <div className={`application-status-notice ${status === "已开始申请" ? "is-open" : "is-historical"}`}><strong>{status}</strong><p>{statusNote}</p><small>状态核验：{formatDate(statusCheckedAt)} · 请在提交前再次打开项目官网确认。</small></div>
      {verification === "目录级收录" && <div className="catalog-notice"><strong>当前为目录级收录</strong><p>已确认项目名称及官方来源，但学术要求、语言、标化、截止日期和费用尚未逐项核验。页面中的“待核验”不是项目要求。</p></div>}
      {verification === "官网核验" && <div className="catalog-notice is-official"><strong>当前为官网核验</strong><p>项目直接官网与校级通用规则已核验；项目独有的截止日期、费用、先修课和附加材料仍须打开项目页确认，页面不会把校级规则伪装成项目专属要求。</p></div>}
      {cptPolicy && <CptPolicyPanel policy={cptPolicy} />}
      <div className="readiness-detail"><small>基于你填写的背景</small><strong>{readiness.label}</strong>{readiness.positives.length > 0 && <p>已具备：{readiness.positives.join("；")}</p>}{readiness.gaps.length > 0 && <ul>{readiness.gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul>}{!readiness.gaps.length && !readiness.positives.length && <p>填写你的背景后，这里会显示公开门槛与待准备事项。</p>}<em>结果仅用于整理公开申请条件，不代表录取概率。</em></div>
      <div className="detail-grid"><DetailBlock title="学术要求" text={program.academic} /><DetailBlock title="语言要求" text={program.language} /><DetailBlock title="标化考试" text={program.tests} /><DetailBlock title="先修与能力" text={program.prerequisites} /><DetailBlock title="面试" text={program.interview || "以当年申请系统为准"} /><DetailBlock title="学费 / 费用" text={program.tuition || "以官网最新费用页为准"} /><DetailBlock title="周边租房预算" text={program.rentBudget || "暂未收录"} /><DetailBlock title="申请定位" text={program.positioning || "待结合个人背景判断"} /><DetailBlock title="申请要求 / 材料" text={program.applicationRequirements || program.academic} /><DetailBlock title="核验范围" text={typeof policyScope === "string" ? policyScope : "项目官网与最近可用官方公告"} /></div>
      <div className="deadline-box"><small>申请时间 / 关键日期</small><strong>{program.deadline}</strong><p>{program.deadlineNote}</p></div>
      <ProjectDocumentRequirements program={program} />
      <div className="detail-section"><h3>申请材料</h3><ul>{program.documents.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <WritingGuideSection program={program} />
      <div className="detail-section"><h3>备注与录取画像</h3><ul>{program.notes.length ? program.notes.map((item) => <li key={item}>{item}</li>) : <li>暂无补充备注</li>}</ul></div>
      <div className="detail-section source-links"><h3>项目网站与状态来源</h3>{sources.map((source) => <a key={`${source.url}-${source.label}`} href={source.url} target="_blank" rel="noreferrer"><span><b>{source.label}</b><small>{source.kind} · {source.year}</small></span><strong>打开来源</strong></a>)}</div>
      <div className="drawer-actions"><a href={program.source} target="_blank" rel="noreferrer">打开首要官方来源</a><button type="button" onClick={onPlan}>{planned ? "移出申请计划" : "加入申请计划"}</button><button type="button" onClick={onCompare}>{selected ? "移出对比" : "加入对比"}</button></div>
    </section>
  </div>;
}

function SignatureEvidencePanel({ tags }: { tags: SignatureTag[] }) {
  return <section className="signature-evidence" aria-label="招牌项目标签依据">
    <div className="signature-evidence-head"><div><p>SIGNATURE STRENGTH · EVIDENCE</p><h3>为什么有这个标签</h3></div><span>{formatDate(SIGNATURE_TAG_DATA.checkedAt)} 核验</span></div>
    <div className="signature-evidence-list">{tags.map((tag) => <article key={tag.id}><div><span className={`signature-tag signature-${tag.tone}`}>{tag.label}</span><strong>{tag.basis}</strong></div><p>{tag.evidence}</p><a href={tag.source} target="_blank" rel="noreferrer"><span>{tag.sourceLabel}</span><b>查看榜单依据</b></a></article>)}</div>
    <small>{SIGNATURE_TAG_DATA.policy}</small>
  </section>;
}

function DetailBlock({ title, text }: { title: string; text: string }) {
  return <div><small>{title}</small><p>{text}</p></div>;
}

function ProjectDocumentRequirements({ program }: { program: Program }) {
  const guide = writingGuideOf(program);
  const materials = officialDocumentsOf(program);
  const matchingGuide = (document: string) => guide.materials.find((material) => material.name.toLowerCase().includes(document.toLowerCase()) || document.toLowerCase().includes(material.name.toLowerCase()) || (/推荐/.test(document) && /推荐/.test(material.name)) || (/(陈述|SOP|statement|动机信)/i.test(document) && /(陈述|SOP|statement|动机信)/i.test(material.name)) || (/(CV|简历|resume)/i.test(document) && /(CV|简历|resume)/i.test(material.name)));
  return <section className="detail-section project-document-requirements" aria-label={`${program.program}项目级材料要求`}>
    <div className="project-document-head"><div><p>PROJECT DOCUMENT REQUIREMENTS</p><h3>项目级材料要求</h3></div><span>{formatDate(guide.checkedAt)} 核验</span></div>
    <p>以下清单来自该项目已收录的公开材料与来源；“必交 / 可选 / 如适用”按原始表述或项目级文书来源显示，最终以当年申请系统为准。</p>
    <div className="project-document-list">{materials.length ? materials.map((document) => {
      const match = matchingGuide(document);
      const requirement = match?.requirement ?? (/(可选|optional|如适用|if applicable)/i.test(document) ? "可选 / 如适用" : "申请系统 / 项目公开材料列示");
      return <article key={document}><strong>{document}</strong><span>{requirement}</span>{match ? <small>{match.focus}</small> : <small>原始要求：{program.applicationRequirements || "请打开项目官方来源确认上传字段。"}</small>}</article>;
    }) : <p>项目材料尚未结构化；请打开官方来源与申请系统确认。</p>}</div>
    <a href={guide.source} target="_blank" rel="noreferrer"><span><small>适用周期：{program.cycle} · 来源</small><b>{guide.sourceLabel}</b></span><strong>打开官网</strong></a>
  </section>;
}

function WritingGuideSection({ program }: { program: Program }) {
  const guide = writingGuideOf(program);
  return <section className="detail-section writing-guide" aria-label={`${program.program}文书写作建议`}>
    <div className="writing-guide-head"><div><p>WRITING BRIEF</p><h3>文书怎么写</h3></div><span>{guide.verification}</span></div>
    <p className="writing-guide-summary">{guide.summary}</p>
    <div className="writing-material-list">
      {guide.materials.map((material) => <article key={material.name}><div><strong>{material.name}</strong><small>{material.requirement}</small></div><dl><div><dt>重点</dt><dd>{material.focus}</dd></div><div><dt>建议表述</dt><dd>{material.expression}</dd></div><div><dt>避免</dt><dd>{material.avoid}</dd></div></dl></article>)}
    </div>
    <a className="writing-guide-source" href={guide.source} target="_blank" rel="noreferrer"><span><small>核验来源 · {formatDate(guide.checkedAt)}</small><b>{guide.sourceLabel}</b></span><strong>打开来源</strong></a>
    <em className="writing-guide-note">项目级建议仅依据公开页面；“通用写作建议”不等同于招生委员会偏好，也不代表录取承诺。</em>
  </section>;
}

function CptPolicyPanel({ policy }: { policy: CptPolicy }) {
  return <section className={`cpt-policy-panel ${cptStatusClass(policy.status)}`} aria-label={`${policy.institution} CPT 政策`}>
    <div className="cpt-policy-head"><div><p>U.S. CPT POLICY · F-1 ONLY</p><h3>{policy.institution} · CPT 实习授权</h3></div><span>{policy.status}</span></div>
    <p className="cpt-policy-summary">{policy.summary}</p>
    {policy.warning && <p className="cpt-policy-warning">{policy.warning}</p>}
    <div className="cpt-policy-grid"><DetailBlock title="资格 / 最早可用" text={policy.eligibility} /><DetailBlock title="课程与项目要求" text={policy.curriculum} /><DetailBlock title="提交与处理节奏" text={policy.timing} /><DetailBlock title="OPT 与身份风险" text={policy.optImpact} /></div>
    <a className="cpt-policy-source" href={policy.source} target="_blank" rel="noreferrer">{policy.sourceLabel}<b>打开本校 CPT 官网</b></a>
  </section>;
}

function CompareDialog({ programs, onClose, onRemove }: { programs: Program[]; onClose: () => void; onRemove: (id: string) => void }) {
  return <div className="overlay compare-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="compare-dialog" role="dialog" aria-modal="true" aria-labelledby="compare-title"><div className="compare-head"><div><p>PROGRAMME COMPARE</p><h2 id="compare-title">把项目放到同一张表里。</h2></div><button type="button" onClick={onClose}>关闭</button></div><div className="compare-table-wrap"><table><thead><tr><th>对比项目</th>{programs.map((program) => <th key={program.id}>{program.university}<strong>{program.program}</strong><button type="button" onClick={() => onRemove(program.id)}>移出</button></th>)}</tr></thead><tbody><CompareRow label="申请状态" programs={programs} render={(program) => applicationStatusOf(program)} /><CompareRow label="地区 / 入学" programs={programs} render={(program) => `${program.region} · ${program.intake}`} /><CompareRow label="学科方向" programs={programs} render={(program) => program.direction || program.category} /><CompareRow label="学术要求" programs={programs} render={(program) => program.academic} /><CompareRow label="先修与能力" programs={programs} render={(program) => program.prerequisites} /><CompareRow label="语言要求" programs={programs} render={(program) => program.language} /><CompareRow label="标化考试" programs={programs} render={(program) => program.tests} /><CompareRow label="面试" programs={programs} render={(program) => program.interview || "以当年申请系统为准"} /><CompareRow label="学费 / 费用" programs={programs} render={(program) => program.tuition || "以官网最新费用页为准"} /><CompareRow label="租房预算" programs={programs} render={(program) => program.rentBudget || "暂未收录"} /><CompareRow label="申请定位" programs={programs} render={(program) => program.positioning || "待结合个人背景判断"} /><CompareRow label="关键日期" programs={programs} render={(program) => program.deadline} /><CompareRow label="信息年份" programs={programs} render={(program) => program.cycle} /></tbody></table></div><p className="compare-note">绿标仅表示官方已明确开放当前申请季；其他项目须在提交前进入来源页面再次核对。</p></section></div>;
}

function CompareRow({ label, programs, render }: { label: string; programs: Program[]; render: (program: Program) => string }) {
  return <tr><th>{label}</th>{programs.map((program) => <td key={program.id}>{render(program)}</td>)}</tr>;
}
