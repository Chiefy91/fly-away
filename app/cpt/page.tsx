import type { Metadata } from "next";
import CptDecisionDesk from "./CptDecisionDesk";

export const metadata: Metadata = {
  title: "CPT / OPT 决策台｜Fly Away",
  description: "按学校横向比较美国 F-1 CPT 条件、课程路径、处理节奏和 OPT 风险，并链接学校国际学生办公室官方来源。",
  openGraph: {
    title: "CPT / OPT 决策台｜Fly Away",
    description: "美国 F-1 CPT 与 OPT 的学校政策比较：先看课程路径、项目差异与官方来源。",
    images: [],
  },
  twitter: {
    title: "CPT / OPT 决策台｜Fly Away",
    description: "美国 F-1 CPT 与 OPT 的学校政策比较：先看课程路径、项目差异与官方来源。",
    images: [],
  },
};

export default function CptPage() {
  return <CptDecisionDesk />;
}
