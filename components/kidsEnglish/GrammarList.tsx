import Link from "next/link";
import type { GrammarSeed } from "@/lib/kidsEnglish";

type Props = {
  lang: "en" | "zh";
  grammar: GrammarSeed[];
};

const copy = {
  en: {
    heading: "Kids English Grammar",
    intro: "Bite-sized grammar explainers with bilingual tips.",
    path: (key: string) => `/en/grammar/${key}`,
    label: "Explore rule",
  },
  zh: {
    heading: "少儿语法讲解",
    intro: "中英双语拆解基础语法。",
    path: (key: string) => `/zh/grammar/${key}`,
    label: "查看规则",
  },
};

export function GrammarList({ lang, grammar }: Props) {
  const text = copy[lang];
  return (
    <main className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Grammar</p>
        <h1 className="text-3xl font-semibold text-white">{text.heading}</h1>
        <p className="text-slate-300">{text.intro}</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {grammar.map((topic) => (
          <Link key={topic.key} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-emerald-400/60 hover:bg-slate-900/80" href={{ pathname: text.path(topic.key) }}>
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-500">
              <span>{lang === "en" ? topic.english.title : topic.chinese.title}</span>
              <span>{topic.grade.toUpperCase()}</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">{lang === "en" ? topic.english.title : topic.chinese.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{lang === "en" ? topic.english.summary : topic.chinese.summary}</p>
            <div className="mt-4 flex items-center justify-between text-sm text-emerald-300">
              <p>{lang === "en" ? topic.english.description : topic.chinese.description}</p>
              <span className="flex items-center gap-2 text-xs uppercase">
                {text.label}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                  <path d="M7 4l6 6-6 6" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
