import type { KidsEnglishPlan } from "@/packages/core/src/kidsEnglish/generatePlan";

type Props = {
  plan: KidsEnglishPlan;
  lang: "en" | "zh";
};

export function KidsEnglishJsonLd({ plan, lang }: Props) {
  const seo = plan.meta.seo;
  const faq = seo.faq.map((item) => ({
    "@type": "Question",
    name: lang === "en" ? item.question_en : item.question_zh,
    acceptedAnswer: {
      "@type": "Answer",
      text: lang === "en" ? item.answer_en : item.answer_zh,
    },
  }));

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq,
  };

  const videoLd = seo.video?.src
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: lang === "en" ? seo.title_en : seo.title_zh,
        description: lang === "en" ? seo.description_en : seo.description_zh,
        contentUrl: seo.video.src,
        thumbnailUrl: seo.video.poster ? [seo.video.poster] : undefined,
        uploadDate: "2024-01-01T00:00:00.000Z",
      }
    : null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} type="application/ld+json" />
      {videoLd && <script dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }} type="application/ld+json" />}
    </>
  );
}
