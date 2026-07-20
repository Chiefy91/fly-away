"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import staticPrograms from "@/data/programs-fallback.json";
import guideData from "@/data/guides.json";

type Region = "香港" | "新加坡" | "美国" | "欧洲";
type Category = "计算机与数据" | "金融与量化" | "数学与统计" | "商科与管理" | "工程与技术" | "社会科学" | "自然科学" | "人文与艺术" | "法律与公共事务" | "医学与生命科学" | "教育" | "综合项目目录";
type Background = "跨专业友好" | "量化背景" | "强先修要求" | "待核验";
type Verification = "全部" | "深度核验" | "官网核验" | "目录级收录";

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
const CYCLES: (Program["cycle"] | "全部")[] = ["全部", "2027 入学", "2026/27 入学", "最近可用"];
const STATIC_PROGRAMS = (staticPrograms as Program[]).length ? staticPrograms as Program[] : PROGRAMS;
const GUIDES = guideData as GuideData;

function formatDate(date: string) {
  return date.replaceAll("-", ".");
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

function recordTypeOf(program: Program) {
  return payloadValue(program, "recordType") === "目录入口" ? "目录入口" : "项目";
}

function qsRankOf(program: Program) {
  const value = payloadValue(program, "qsRank");
  return typeof value === "string" ? value : "";
}

function numericRank(program: Program) {
  return Number.parseInt(qsRankOf(program).replace(/\D/g, ""), 10) || 999;
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
  const [sort, setSort] = useState("最新核验");
  const [pageState, setPageState] = useState({ key: "", count: 60 });
  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toolkitTab, setToolkitTab] = useState<"overview" | "materials" | "timeline" | "sources" | "appendix">("materials");
  const [toast, setToast] = useState("");

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
      const haystack = [program.university, program.school, program.program, originalProgramNameOf(program), program.region, program.city, program.category, program.direction, program.prerequisites, program.applicationRequirements].join(" ").toLowerCase();
      return (!normalized || haystack.includes(normalized))
        && (region === "全部" || program.region === region)
        && (category === "全部" || program.category === category)
        && (background === "全部" || program.background === background)
        && (cycle === "全部" || program.cycle === cycle)
        && (verification === "全部" || verificationOf(program) === verification);
    });
    return [...items].sort((a, b) => {
      if (sort === "QS 排名") return numericRank(a) - numericRank(b) || a.university.localeCompare(b.university, "zh-CN");
      if (sort === "院校名称") return a.university.localeCompare(b.university, "zh-CN");
      if (sort === "地区顺序") return REGIONS.indexOf(a.region) - REGIONS.indexOf(b.region);
      return b.updated.localeCompare(a.updated) || a.university.localeCompare(b.university, "zh-CN");
    });
  }, [programs, query, region, category, background, cycle, verification, sort]);

  const selectedPrograms = selected.map((id) => programs.find((program) => program.id === id)).filter(Boolean) as Program[];
  const detail = detailId ? programs.find((program) => program.id === detailId) ?? null : null;
  const filterKey = [query, region, category, background, cycle, verification, sort].join("|");
  const visibleCount = pageState.key === filterKey ? pageState.count : 60;
  const displayed = filtered.slice(0, visibleCount);
  const qsSchoolCount = new Set(programs.filter((program) => qsRankOf(program)).map((program) => program.university)).size;
  const deepVerifiedCount = programs.filter((program) => verificationOf(program) === "深度核验").length;
  const officialVerifiedCount = programs.filter((program) => verificationOf(program) === "官网核验").length;

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

  const resetFilters = () => {
    setQuery("");
    setRegion("全部");
    setCategory("全部");
    setBackground("全部");
    setCycle("全部");
    setVerification("全部");
    setSort("最新核验");
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
          <a href="#disciplines">学科地图</a>
          <button type="button" onClick={() => selected.length ? setCompareOpen(true) : announce("请先加入想对比的项目")}>项目对比</button>
          <a href="#toolkit">申请工具箱</a>
        </nav>
        <div className="top-actions">
          <span className="fresh-label">资料更新至 2026.07</span>
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
            <div className="search-hints"><span><b>{programs.length}</b> 条项目与目录记录</span><span><b>{qsSchoolCount}</b> 所 QS 前50院校</span><span><b>{officialVerifiedCount}</b> 条官网核验</span><span><b>{deepVerifiedCount}</b> 条深度核验</span></div>
          </div>
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

        <section className="explore" id="programs">
          <aside className="filter-panel" aria-label="项目筛选">
            <div className="filter-title"><h2>缩小范围</h2><button type="button" onClick={resetFilters}>清除全部</button></div>
            <FilterGroup title="核验层级" values={VERIFICATIONS} active={verification} onChange={(value) => setVerification(value as Verification)} />
            <FilterGroup title="学科方向" values={CATEGORIES} active={category} onChange={(value) => setCategory(value as Category | "全部")} />
            <FilterGroup title="背景匹配" values={BACKGROUNDS} active={background} onChange={(value) => setBackground(value as Background | "全部")} />
            <FilterGroup title="信息年份" values={CYCLES} active={cycle} onChange={(value) => setCycle(value as Program["cycle"] | "全部")} />
            <div className="year-note"><b>数据口径</b><p>院校官网与项目页面优先。当年信息未发布时，显示最近可用年份，并提示复核风险。</p></div>
          </aside>

          <div className="results">
            <div className="results-head">
              <div><p className="section-kicker">PROGRAMME FINDER</p><h2>{filtered.length ? "与你匹配的项目" : "暂未找到项目"}</h2></div>
              <div className="results-controls"><span>共 {filtered.length} 项</span><label>排序<select value={sort} onChange={(event) => setSort(event.target.value)}><option>最新核验</option><option>QS 排名</option><option>地区顺序</option><option>院校名称</option></select></label></div>
            </div>

            {filtered.length ? displayed.map((program, index) => {
              const active = selected.includes(program.id);
              const verification = verificationOf(program);
              const recordType = recordTypeOf(program);
              const qsRank = qsRankOf(program);
              const originalProgramName = originalProgramNameOf(program);
              return (
                <article className="program-row" key={program.id}>
                  <div className="program-id">
                    <span className="rank">{String(index + 1).padStart(2, "0")}</span>
                    <div className="school"><small>{program.region} · {program.school}</small><h3>{program.university}<br />{program.program}</h3>{originalProgramName && <p className="original-program">官方原名：{originalProgramName}</p>}<p>{program.duration} · {program.intake}</p><div className="program-tags"><span className={`cycle-tag ${program.cycle === "最近可用" ? "is-legacy" : ""}`}>{program.cycle}</span>{qsRank && <span className="qs-tag">QS {qsRank}</span>}<span className={`verification-tag ${verification === "深度核验" ? "is-deep" : verification === "官网核验" ? "is-official" : ""}`}>{verification}</span>{recordType === "目录入口" && <span className="directory-tag">完整目录入口</span>}</div></div>
                  </div>
                  <div className="requirements" aria-label={`${program.program}申请要求概览`}>
                    {program.requirements.map((requirement) => (
                      <div className="requirement" key={requirement.label}><span>{requirement.label}</span><div className={`bar ${requirement.level === 0 ? "is-empty" : ""}`}><i style={{ "--value": `${requirement.level}%` } as CSSProperties} /></div><b>{requirement.value}</b></div>
                    ))}
                  </div>
                  <div className="row-action"><p>关键日期<strong>{program.deadline.split("；")[0]}</strong></p><button className="detail-button" type="button" onClick={() => setDetailId(program.id)}>查看详情</button><button className={`add-compare ${active ? "is-active" : ""}`} type="button" aria-pressed={active} onClick={() => toggleCompare(program.id)}>{active ? "已加入对比" : "加入对比"}</button></div>
                </article>
              );
            }) : (
              <div className="empty-state"><strong>没有符合全部条件的项目</strong><p>尝试减少筛选条件，或换一个学校、专业关键词。</p><button type="button" onClick={resetFilters}>显示全部项目</button></div>
            )}
            {visibleCount < filtered.length && <button className="load-more" type="button" onClick={() => setPageState({ key: filterKey, count: visibleCount + 60 })}>继续加载 <b>{Math.min(60, filtered.length - visibleCount)}</b> 条</button>}
          </div>
        </section>

        <section className="toolkit" id="toolkit" aria-labelledby="toolkit-title">
          <div className="toolkit-head"><div><p className="section-kicker">APPLICATION TOOLKIT</p><h2 id="toolkit-title">表格里的信息，一项也不丢。</h2></div><p>材料清单、申请时间线、项目池结论、24 条官网索引，以及原表 8 个重点项目的录取画像与 Web 核验汇总都已纳入。</p></div>
          <div className="toolkit-tabs" role="tablist" aria-label="申请工具箱内容">
            {([['materials','材料清单'],['timeline','申请时间线'],['overview','项目池结论'],['sources','官网索引'],['appendix','原表附录']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={toolkitTab === value} onClick={() => setToolkitTab(value)}>{label}</button>)}
          </div>
          <ToolkitContent tab={toolkitTab} guides={guides} />
        </section>

        <section className="method" id="method">
          <p className="section-kicker">DATA METHOD</p>
          <div><h2>用数据库保存事实，用来源标注边界。</h2><p>“深度核验”逐项整理项目要求；“官网核验”确认项目直接来源并补齐校级学历、语言、材料与标化规则；“目录级收录”只确认官方目录中的项目名称。三者不会混为一谈。</p></div>
          <div className="method-points"><span><b>01</b> 33 所 QS 前50院校</span><span><b>02</b> 官网与年份可追溯</span><span><b>03</b> 三级核验不混淆</span></div>
        </section>
      </main>

      <footer><span>Fly Away · 留学项目情报库</span><span>首批功能版 · 数据核验于 2026 年 7 月</span></footer>

      {detail && <DetailDrawer program={detail} selected={selected.includes(detail.id)} onClose={() => setDetailId(null)} onCompare={() => toggleCompare(detail.id)} />}
      {compareOpen && <CompareDialog programs={selectedPrograms} onClose={() => setCompareOpen(false)} onRemove={toggleCompare} />}
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}

function FilterGroup({ title, values, active, onChange }: { title: string; values: readonly string[]; active: string; onChange: (value: string) => void }) {
  return <div className="filter-group"><h3>{title}</h3><div className="chip-row">{values.map((value) => <button className="chip" type="button" aria-pressed={active === value} key={value} onClick={() => onChange(value)}>{value}</button>)}</div></div>;
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

function DetailDrawer({ program, selected, onClose, onCompare }: { program: Program; selected: boolean; onClose: () => void; onCompare: () => void }) {
  const sources = program.sources?.length ? program.sources : [{ label: "项目官网", url: program.source, kind: "项目官网", year: program.cycle }];
  const verification = verificationOf(program);
  const qsRank = qsRankOf(program);
  const originalProgramName = originalProgramNameOf(program);
  return <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="detail-drawer" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="drawer-head"><div><p>{program.region} · {program.school}</p><h2 id="detail-title">{program.university}<br />{program.program}</h2>{originalProgramName && <p className="original-program drawer-original">官方原名：{originalProgramName}</p>}</div><button type="button" onClick={onClose}>关闭</button></div>
      <div className="drawer-meta"><span>{program.category}</span><span>{program.direction || program.category}</span><span>{program.cycle}</span><span>{program.duration}</span>{qsRank && <span>QS 2027 · {qsRank}</span>}<span>{verification} · {formatDate(program.updated)}</span></div>
      {verification === "目录级收录" && <div className="catalog-notice"><strong>当前为目录级收录</strong><p>已确认项目名称及官方来源，但学术要求、语言、标化、截止日期和费用尚未逐项核验。页面中的“待核验”不是项目要求。</p></div>}
      {verification === "官网核验" && <div className="catalog-notice is-official"><strong>当前为官网核验</strong><p>项目直接官网与校级通用规则已核验；项目独有的截止日期、费用、先修课和附加材料仍须打开项目页确认，页面不会把校级规则伪装成项目专属要求。</p></div>}
      <div className="detail-grid"><DetailBlock title="学术要求" text={program.academic} /><DetailBlock title="语言要求" text={program.language} /><DetailBlock title="标化考试" text={program.tests} /><DetailBlock title="先修与能力" text={program.prerequisites} /><DetailBlock title="面试" text={program.interview || "以当年申请系统为准"} /><DetailBlock title="学费 / 费用" text={program.tuition || "以官网最新费用页为准"} /><DetailBlock title="周边租房预算" text={program.rentBudget || "暂未收录"} /><DetailBlock title="申请定位" text={program.positioning || "待结合个人背景判断"} /><DetailBlock title="申请要求 / 材料" text={program.applicationRequirements || program.academic} /></div>
      <div className="deadline-box"><small>申请时间 / 关键日期</small><strong>{program.deadline}</strong><p>{program.deadlineNote}</p></div>
      <div className="detail-section"><h3>申请材料</h3><ul>{program.documents.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div className="detail-section"><h3>备注与录取画像</h3><ul>{program.notes.length ? program.notes.map((item) => <li key={item}>{item}</li>) : <li>暂无补充备注</li>}</ul></div>
      <div className="detail-section source-links"><h3>项目网站与最近可用公告</h3>{sources.map((source) => <a key={`${source.url}-${source.label}`} href={source.url} target="_blank" rel="noreferrer"><span><b>{source.label}</b><small>{source.kind} · {source.year}</small></span><strong>打开来源</strong></a>)}</div>
      <div className="drawer-actions"><a href={program.source} target="_blank" rel="noreferrer">打开首要官方来源</a><button type="button" onClick={onCompare}>{selected ? "移出对比" : "加入对比"}</button></div>
    </section>
  </div>;
}

function DetailBlock({ title, text }: { title: string; text: string }) {
  return <div><small>{title}</small><p>{text}</p></div>;
}

function CompareDialog({ programs, onClose, onRemove }: { programs: Program[]; onClose: () => void; onRemove: (id: string) => void }) {
  return <div className="overlay compare-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="compare-dialog" role="dialog" aria-modal="true" aria-labelledby="compare-title"><div className="compare-head"><div><p>PROGRAMME COMPARE</p><h2 id="compare-title">把项目放到同一张表里。</h2></div><button type="button" onClick={onClose}>关闭</button></div><div className="compare-table-wrap"><table><thead><tr><th>对比项目</th>{programs.map((program) => <th key={program.id}>{program.university}<strong>{program.program}</strong><button type="button" onClick={() => onRemove(program.id)}>移出</button></th>)}</tr></thead><tbody><CompareRow label="地区 / 入学" programs={programs} render={(program) => `${program.region} · ${program.intake}`} /><CompareRow label="学科方向" programs={programs} render={(program) => program.direction || program.category} /><CompareRow label="学术要求" programs={programs} render={(program) => program.academic} /><CompareRow label="先修与能力" programs={programs} render={(program) => program.prerequisites} /><CompareRow label="语言要求" programs={programs} render={(program) => program.language} /><CompareRow label="标化考试" programs={programs} render={(program) => program.tests} /><CompareRow label="面试" programs={programs} render={(program) => program.interview || "以当年申请系统为准"} /><CompareRow label="学费 / 费用" programs={programs} render={(program) => program.tuition || "以官网最新费用页为准"} /><CompareRow label="租房预算" programs={programs} render={(program) => program.rentBudget || "暂未收录"} /><CompareRow label="申请定位" programs={programs} render={(program) => program.positioning || "待结合个人背景判断"} /><CompareRow label="关键日期" programs={programs} render={(program) => program.deadline} /><CompareRow label="信息年份" programs={programs} render={(program) => program.cycle} /></tbody></table></div><p className="compare-note">对比表区分官方硬性要求与表格中的经验信息，不代表录取概率。申请提交前请进入来源页面再次核对。</p></section></div>;
}

function CompareRow({ label, programs, render }: { label: string; programs: Program[]; render: (program: Program) => string }) {
  return <tr><th>{label}</th>{programs.map((program) => <td key={program.id}>{render(program)}</td>)}</tr>;
}
