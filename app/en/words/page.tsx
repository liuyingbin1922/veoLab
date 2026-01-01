import type { Metadata } from "next";
import { WordList } from "@/components/kidsEnglish/WordList";
import { getSiteUrl, listWords } from "@/lib/kidsEnglish";

const siteUrl = getSiteUrl();
const canonical = `${siteUrl}/en/words`;

export const metadata: Metadata = {
  title: "Kids English Words",
  description: "Browse bilingual vocabulary storyboards and short videos.",
  alternates: {
    canonical,
    languages: {
      en: canonical,
      zh: `${siteUrl}/zh/words`,
    },
  },
};

export default function Page() {
  return <WordList lang="en" words={listWords()} />;
}
