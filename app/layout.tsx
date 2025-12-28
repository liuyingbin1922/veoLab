import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "分镜视频工厂",
  description: "ToC 运营分镜生成工具",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-indigo-300">Veo Lab</p>
              <h1 className="text-2xl font-semibold text-white">分镜视频工厂</h1>
              <p className="text-sm text-slate-400">Claude Sonnet + Gemini 串联，产出爆款分镜与 Veo prompts</p>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
