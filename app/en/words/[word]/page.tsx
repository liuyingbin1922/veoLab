import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KidsEnglishJsonLd } from "@/components/kidsEnglish/JsonLd";
import { WordDetail } from "@/components/kidsEnglish/WordDetail";
import { findWord, generatePlan, listWords } from "@/lib/kidsEnglish";
import type { KidsEnglishPlan } from "@/packages/core/src/kidsEnglish/generatePlan";

type Params = { word: string };

export function generateStaticParams(): Params[] {
  return listWords().map((word) => ({ word: word.key }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { word } = await params;
  const seed = findWord(word);
  if (!seed) {
    return { title: "Word lesson" };
  }
  const plan = generatePlan({ type: "word", key: seed.key, grade: seed.grade });
  const seo = plan.meta.seo;
  return {
    title: seo.title_en,
    description: seo.description_en,
    alternates: {
      canonical: seo.canonical_en,
      languages: {
        en: seo.canonical_en,
        zh: seo.canonical_zh,
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { word } = await params;
  const seed = findWord(word);
  if (!seed) {
    notFound();
  }
  const plan = generatePlan({ type: "word", key: seed.key, grade: seed.grade }) as Extract<KidsEnglishPlan, { meta: { type: "word" } }>;
  return (
    <>
      <WordDetail lang="en" plan={plan} seed={seed} />
      <KidsEnglishJsonLd lang="en" plan={plan} />
    </>
  );
}
