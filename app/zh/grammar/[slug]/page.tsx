import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrammarDetail } from "@/components/kidsEnglish/GrammarDetail";
import { KidsEnglishJsonLd } from "@/components/kidsEnglish/JsonLd";
import { findGrammar, generatePlan, listGrammar } from "@/lib/kidsEnglish";
import type { KidsEnglishPlan } from "@/packages/core/src/kidsEnglish/generatePlan";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return listGrammar().map((topic) => ({ slug: topic.key }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const seed = findGrammar(slug);
  if (!seed) {
    return { title: "语法课程" };
  }
  const plan = generatePlan({ type: "grammar", key: seed.key, grade: seed.grade });
  const seo = plan.meta.seo;
  return {
    title: seo.title_zh,
    description: seo.description_zh,
    alternates: {
      canonical: seo.canonical_zh,
      languages: {
        en: seo.canonical_en,
        zh: seo.canonical_zh,
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const seed = findGrammar(slug);
  if (!seed) {
    notFound();
  }
  const plan = generatePlan({ type: "grammar", key: seed.key, grade: seed.grade }) as Extract<KidsEnglishPlan, { meta: { type: "grammar" } }>;
  return (
    <>
      <GrammarDetail lang="zh" plan={plan} seed={seed} />
      <KidsEnglishJsonLd lang="zh" plan={plan} />
    </>
  );
}
