import seedData from "@/packages/core/src/kidsEnglish/seed.json" assert { type: "json" };
import { generateKidsEnglishPlan, KidsEnglishPlan, KidsEnglishPlanInput } from "@/packages/core/src/kidsEnglish/generatePlan";

export type WordSeed = (typeof seedData.words)[number];
export type GrammarSeed = (typeof seedData.grammar)[number];

export const kidsEnglishSeeds = seedData;

export function listWords(): WordSeed[] {
  return seedData.words;
}

export function listGrammar(): GrammarSeed[] {
  return seedData.grammar;
}

export function findWord(key: string | undefined): WordSeed | undefined {
  if (!key) return undefined;
  return seedData.words.find((entry) => entry.key.toLowerCase() === key.toLowerCase());
}

export function findGrammar(key: string | undefined): GrammarSeed | undefined {
  if (!key) return undefined;
  return seedData.grammar.find((entry) => entry.key.toLowerCase() === key.toLowerCase());
}

export function generatePlan(input: KidsEnglishPlanInput): KidsEnglishPlan {
  return generateKidsEnglishPlan(input);
}

export function getSiteUrl() {
  return (seedData.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://veolab.ai").replace(/\/$/, "");
}
