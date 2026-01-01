import Link from "next/link";
import type { WordSeed } from "@/lib/kidsEnglish";
import type { KidsEnglishPlan } from "@/packages/core/src/kidsEnglish/generatePlan";

type Props = {
  lang: "en" | "zh";
  seed: WordSeed;
  plan: Extract<KidsEnglishPlan, { meta: { type: "word" } }>;
};

export function WordDetail({ lang, seed, plan }: Props) {
  const video = plan.meta.seo.video;
  const lesson = plan.lesson;
  const quiz = seed.english.quiz;
  const quizOptions = quiz?.options ?? [];
  const heading = lang === "en" ? seed.english.title : seed.chinese.title;
  const summary = lang === "en" ? seed.english.summary : seed.chinese.summary;
  const description = lang === "en" ? seed.english.description : seed.chinese.description;

  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Kids English Word</p>
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
        <h2 className="text-2xl font-semibold text-white">Examples</h2>
        <ul className="mt-4 space-y-4 text-sm text-slate-200">
          {lesson.examples.map((example) => (
            <li key={example.en} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="font-semibold text-white">{example.en}</p>
              <p className="text-slate-400">{example.zh}</p>
            </li>
          ))}
        </ul>
      </section>

      {quiz && (
        <section className="rounded-3xl border border-emerald-500/40 bg-slate-950/40 p-6">
          <h2 className="text-2xl font-semibold text-white">Quiz</h2>
          <p className="mt-2 text-slate-300">{quiz.question}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {quizOptions.map((option, idx) => (
              <div key={option.en} className={`rounded-2xl border p-4 ${idx === quiz.answer_index ? "border-emerald-400 bg-emerald-500/10" : "border-slate-800 bg-slate-950/40"}`}>
                <p className="font-semibold text-white">{option.en}</p>
                <p className="text-sm text-slate-400">{option.zh}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-emerald-300">Answer: {quizOptions[quiz.answer_index]?.en}</p>
        </section>
      )}

      <section className="rounded-3xl border border-indigo-500/40 bg-slate-950/40 p-6">
        <h2 className="text-2xl font-semibold text-white">Generate your own video</h2>
        <p className="mt-2 text-sm text-slate-300">Use the storyboard factory to remix this word with your class style.</p>
        <Link
          className="mt-4 inline-flex items-center justify-center rounded-full border border-indigo-400/60 px-5 py-2 text-sm font-semibold text-indigo-100 transition hover:border-indigo-300 hover:text-white"
          href={`/create?mode=kids-english&type=word&key=${seed.key}`}
        >
          Generate your own video
        </Link>
      </section>
    </main>
  );
}
