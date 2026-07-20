import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);

  return {
    metadataBase: base,
    title: "Fly Away｜留学项目情报库",
    description: "港新美欧全学科留学项目数据库，集中查看申请要求、费用、面试、先修、租房预算、官网与最近可用招生公告。",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "Fly Away｜信息无落差，选择更潇洒",
      description: "港新美欧全学科项目要求、费用、面试与官方来源，一处筛选、查看与对比。",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Fly Away｜留学项目情报库",
      description: "港新美欧全学科项目数据库，一处筛选、查看与对比。",
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
