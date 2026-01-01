import type { Metadata } from "next";
import { WordList } from "@/components/kidsEnglish/WordList";
import { getSiteUrl, listWords } from "@/lib/kidsEnglish";

const siteUrl = getSiteUrl();
const canonical = `${siteUrl}/zh/words`;

export const metadata: Metadata = {
  title: "少儿英语词库",
  description: "查看 9:16 双语词汇短视频。",
  alternates: {
    canonical,
    languages: {
      en: `${siteUrl}/en/words`,
      zh: canonical,
    },
  },
};

export default function Page() {
  return <WordList lang="zh" words={listWords()} />;
}
