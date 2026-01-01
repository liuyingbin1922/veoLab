import type { Metadata } from "next";
import { GrammarList } from "@/components/kidsEnglish/GrammarList";
import { getSiteUrl, listGrammar } from "@/lib/kidsEnglish";

const siteUrl = getSiteUrl();
const canonical = `${siteUrl}/zh/grammar`;

export const metadata: Metadata = {
  title: "少儿英语语法",
  description: "浏览 9:16 双语语法视频计划。",
  alternates: {
    canonical,
    languages: {
      en: `${siteUrl}/en/grammar`,
      zh: canonical,
    },
  },
};

export default function Page() {
  return <GrammarList lang="zh" grammar={listGrammar()} />;
}
