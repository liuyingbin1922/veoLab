import Link from "next/link";
import type { WordSeed } from "@/lib/kidsEnglish";

type Props = {
  lang: "en" | "zh";
  words: WordSeed[];
};

const copy = {
  en: {
    heading: "Kids English Word Lab",
    intro: "Choose a bilingual word lesson. Each card opens a detail page with lesson notes and video.",
    cta: (key: string) => `/en/words/${key}`,
    label: "View lesson",
  },
  zh: {
    heading: "少儿英语词库",
    intro: "挑选一个单词进入详情，查看课程说明与短视频。",
    cta: (key: string) => `/zh/words/${key}`,
    label: "查看课程",
  },
};

export function WordList({ lang, words }: Props) {
  const text = copy[lang];
  return (
    <main className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Kids English</p>
        <h1 className="text-3xl font-semibold text-white">{text.heading}</h1>
        <p className="text-slate-300">{text.intro}</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {words.map((word) => (
          <Link key={word.key} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-indigo-400/60 hover:bg-slate-900/80" href={{ pathname: text.cta(word.key) }}>
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-500">
              <span>{lang === "en" ? word.english.title : word.chinese.title}</span>
              <span>{word.grade.toUpperCase()}</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">{lang === "en" ? word.english.title : word.chinese.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{lang === "en" ? word.english.summary : word.chinese.summary}</p>
            <div className="mt-4 flex items-center justify-between text-sm text-indigo-300">
              <p>{word.partOfSpeech.toUpperCase()}</p>
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
