import type { Metadata } from "next";
import { GrammarList } from "@/components/kidsEnglish/GrammarList";
import { getSiteUrl, listGrammar } from "@/lib/kidsEnglish";

const siteUrl = getSiteUrl();
const canonical = `${siteUrl}/en/grammar`;

export const metadata: Metadata = {
  title: "Kids English Grammar",
  description: "Plan bilingual grammar shorts with ready-made prompts.",
  alternates: {
    canonical,
    languages: {
      en: canonical,
      zh: `${siteUrl}/zh/grammar`,
    },
  },
};

export default function Page() {
  return <GrammarList lang="en" grammar={listGrammar()} />;
}
