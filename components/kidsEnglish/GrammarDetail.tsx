import Link from "next/link";
import type { GrammarSeed } from "@/lib/kidsEnglish";
import type { KidsEnglishPlan } from "@/packages/core/src/kidsEnglish/generatePlan";

type Props = {
  lang: "en" | "zh";
  seed: GrammarSeed;
  plan: Extract<KidsEnglishPlan, { meta: { type: "grammar" } }>;
};

export function GrammarDetail({ lang, seed, plan }: Props) {
  const video = plan.meta.seo.video;
  const heading = lang === "en" ? seed.english.title : seed.chinese.title;
  const summary = lang === "en" ? seed.english.summary : seed.chinese.summary;
  const description = lang === "en" ? seed.english.description : seed.chinese.description;

  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Kids Grammar</p>
        <h1 className="text-4xl font-semibold text-white">{heading}</h1>
        <p className="text-lg text-slate-300">{summary}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </header>

      {video?.src && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4">
          <p className="mb-3 text-sm text-slate-300">Preview video</p>
          <video className="aspect-[9/16] w-full rounded-2xl border border-slate-800 object-cover" controls poster={video.poster} src={video.src} />
        </section>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6">
        <h2 className="text-2xl font-semibold text-white">Rule</h2>
        <p className="mt-2 text-slate-300">{plan.rule.overview}</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-200">
          {plan.rule.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6">
        <h2 className="text-2xl font-semibold text-white">Examples</h2>
        <ul className="mt-4 space-y-4 text-sm text-slate-200">
          {plan.rule.examples.map((example) => (
            <li key={example.pattern} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="font-semibold text-white">{example.en}</p>
              <p className="text-slate-400">{example.zh}</p>
            </li>
          ))}
        </ul>
      </section>

      {seed.quiz && (
        <section className="rounded-3xl border border-emerald-500/40 bg-slate-950/40 p-6">
          <h2 className="text-2xl font-semibold text-white">Practice</h2>
          <p className="mt-2 text-slate-300">{seed.quiz.question}</p>
          <p className="mt-2 text-sm text-slate-400">Answer: {seed.quiz.answer}</p>
          <p className="mt-1 text-xs text-slate-500">{seed.quiz.explanation}</p>
        </section>
      )}

      <section className="rounded-3xl border border-indigo-500/40 bg-slate-950/40 p-6">
        <h2 className="text-2xl font-semibold text-white">Generate your own video</h2>
        <p className="mt-2 text-sm text-slate-300">Send this grammar storyboard to the factory to customize visuals.</p>
        <Link
          className="mt-4 inline-flex items-center justify-center rounded-full border border-indigo-400/60 px-5 py-2 text-sm font-semibold text-indigo-100 transition hover:border-indigo-300 hover:text-white"
          href={`/create?mode=kids-english&type=grammar&key=${seed.key}`}
        >
          Generate your own video
        </Link>
      </section>
    </main>
  );
}
