"use client";

import { useMemo, useState } from "react";
import type { StoryboardResult } from "@/lib/schema";

const defaultPayload = {
  topic: "3 个让你效率翻倍的 AI 小技巧",
  platform: "douyin" as const,
  duration: 30 as const,
  template: "pain_point_hook" as const,
  persona: "natural" as const,
  must_include: "",
  avoid: "",
};

type FormState = typeof defaultPayload;

type ApiResponse = {
  ok: boolean;
  data?: StoryboardResult;
  error?: string;
  meta?: { cached?: boolean; latency_ms?: number };
};

export default function Page() {
  const [form, setForm] = useState<FormState>(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoryboardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceoverDraft, setVoiceoverDraft] = useState<string>("");

  const handleChange = (key: keyof FormState) => (value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value } as FormState));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const json = (await response.json()) as ApiResponse;
      if (!response.ok || !json.ok) {
        throw new Error(json.error || "生成失败，请稍后重试");
      }
      setResult(json.data!);
      setVoiceoverDraft(json.data!.voiceover);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  const markdown = useMemo(() => (result ? toMarkdown({ ...result, voiceover: voiceoverDraft }) : ""), [result, voiceoverDraft]);
  const csv = useMemo(() => (result ? toCsv(result.shots) : ""), [result]);

  return (
    <main className="grid gap-6 lg:grid-cols-[1.1fr,1.3fr]">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">输入参数</h2>
          <span className="text-xs text-slate-400">Claude ➜ Gemini 串联</span>
        </div>
        <div className="mt-6 space-y-4 text-sm">
          <TextField label="选题" value={form.topic} onChange={handleChange("topic")} placeholder="例如：3 个让你效率翻倍的 AI 小技巧" required />
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="平台"
              value={form.platform}
              onChange={handleChange("platform")}
              options={[
                { value: "douyin", label: "抖音" },
                { value: "shipinhao", label: "视频号" },
                { value: "xiaohongshu", label: "小红书" },
              ]}
            />
            <SelectField
              label="时长"
              value={String(form.duration)}
              onChange={(value) => handleChange("duration")(Number(value))}
              options={[
                { value: "15", label: "15 秒" },
                { value: "30", label: "30 秒" },
                { value: "60", label: "60 秒" },
              ]}
            />
          </div>
          <SelectField
            label="模板"
            value={form.template}
            onChange={handleChange("template")}
            options={[
              { value: "pain_point_hook", label: "痛点开场" },
              { value: "product_reco", label: "产品推荐" },
              { value: "story_emotion", label: "故事情感" },
            ]}
          />
          <SelectField
            label="人设"
            value={form.persona ?? "natural"}
            onChange={handleChange("persona")}
            options={[
              { value: "natural", label: "自然" },
              { value: "professional", label: "专业" },
              { value: "funny", label: "搞笑" },
              { value: "warm", label: "温暖" },
            ]}
          />
          <TextField label="必须出现" value={form.must_include} onChange={handleChange("must_include")} placeholder="可留空" />
          <TextField label="禁忌" value={form.avoid} onChange={handleChange("avoid")} placeholder="可留空" />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-indigo-500 px-4 py-3 text-center text-base font-semibold text-white shadow-lg transition hover:bg-indigo-400"
          >
            {loading ? "生成中..." : "生成分镜"}
          </button>
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">结果</h2>
            <div className="flex gap-2 text-xs text-slate-400">
              <Badge>Markdown</Badge>
              <Badge>CSV</Badge>
            </div>
          </div>
          {!result && <p className="mt-6 text-sm text-slate-400">提交参数后将在这里看到标题、旁白、分镜表和 Veo prompts。</p>}
          {result && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">爆款标题 (10)</h3>
                <button
                  className="text-sm text-indigo-300 hover:text-indigo-200"
                  onClick={() => copy(result.titles.join("\n"))}
                >
                  复制全部
                </button>
              </div>
              <ul className="grid gap-2 md:grid-cols-2">
                {result.titles.map((title, idx) => (
                  <li key={idx} className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100">
                    {idx + 1}. {title}
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">旁白脚本</h3>
                  <div className="flex gap-2 text-sm">
                    <button className="text-indigo-300 hover:text-indigo-200" onClick={() => copy(voiceoverDraft)}>
                      复制
                    </button>
                  </div>
                </div>
                <textarea
                  className="h-32 w-full rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-100"
                  value={voiceoverDraft}
                  onChange={(e) => setVoiceoverDraft(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">分镜表</h3>
                  <button className="text-sm text-indigo-300 hover:text-indigo-200" onClick={() => copy(csv)}>
                    复制 CSV
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead className="bg-slate-900 uppercase text-xs text-slate-400">
                      <tr>
                        {[
                          "镜头",
                          "秒数",
                          "画面",
                          "镜头语言",
                          "字幕",
                          "BGM/SFX",
                          "Veo prompt",
                          "Negative",
                        ].map((header) => (
                          <th key={header} className="px-3 py-2">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.shots.map((shot) => (
                        <tr key={shot.shot} className="border-b border-slate-800 bg-slate-950/40">
                          <td className="px-3 py-2">{shot.shot}</td>
                          <td className="px-3 py-2">{shot.sec}s</td>
                          <td className="px-3 py-2 max-w-xs whitespace-pre-line">{shot.visual}</td>
                          <td className="px-3 py-2 max-w-xs whitespace-pre-line">{shot.camera}</td>
                          <td className="px-3 py-2 max-w-xs whitespace-pre-line">{shot.subtitle}</td>
                          <td className="px-3 py-2 max-w-xs whitespace-pre-line">{shot.bgm_sfx}</td>
                          <td className="px-3 py-2 max-w-xs whitespace-pre-line">{shot.veo_prompt}</td>
                          <td className="px-3 py-2 max-w-xs whitespace-pre-line">{shot.negative_prompt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Veo Prompts</h3>
                  <button className="text-sm text-indigo-300 hover:text-indigo-200" onClick={() => copy(markdown)}>
                    复制 Markdown
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {result.shots.map((shot) => (
                    <div key={shot.shot} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 shadow">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>镜头 {shot.shot}</span>
                        <button className="text-indigo-300 hover:text-indigo-200" onClick={() => copy(shot.veo_prompt)}>
                          复制
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-slate-100 whitespace-pre-line">{shot.veo_prompt}</p>
                      <p className="mt-2 text-xs text-rose-300">Negative: {shot.negative_prompt}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <button
                  onClick={() => downloadFile("storyboard.md", markdown)}
                  className="rounded-lg border border-indigo-500/60 bg-indigo-500/10 px-3 py-2 text-indigo-100 hover:bg-indigo-500/20"
                >
                  导出 Markdown
                </button>
                <button
                  onClick={() => downloadFile("storyboard.csv", csv)}
                  className="rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-emerald-100 hover:bg-emerald-500/20"
                >
                  导出 CSV
                </button>
                {result && result.shots?.length > 0 && (
                  <span className="rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-400">
                    时长 {result.duration_sec}s · {result.shots.length} 镜头 {result.shots.reduce((acc, s) => acc + s.sec, 0)}s
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function TextField({ label, value, onChange, placeholder, required }: { label: string; value: string; placeholder?: string; required?: boolean; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-2 text-sm text-slate-200">
      <span className="flex items-center gap-2">
        {label}
        {required && <span className="text-rose-300">*</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2 text-sm text-slate-200">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300">{children}</span>;
}

function toMarkdown(result: StoryboardResult): string {
  const header = `# 分镜视频工厂输出\n\n- 平台：${result.platform}\n- 时长：${result.duration_sec}s\n- 模板：${result.template}\n`;
  const titles = `\n## 爆款标题\n${result.titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;
  const voiceover = `\n## 旁白\n\n${result.voiceover}`;
  const tableHeader = "| 镜头 | 秒数 | 画面 | 镜头语言 | 字幕 | BGM/SFX | Veo Prompt | Negative |\n| --- | --- | --- | --- | --- | --- | --- | --- |";
  const tableBody = result.shots
    .map(
      (shot) =>
        `| ${shot.shot} | ${shot.sec}s | ${escapePipe(shot.visual)} | ${escapePipe(shot.camera)} | ${escapePipe(
          shot.subtitle
        )} | ${escapePipe(shot.bgm_sfx)} | ${escapePipe(shot.veo_prompt)} | ${escapePipe(shot.negative_prompt)} |`
    )
    .join("\n");
  const veoPrompts = result.shots
    .map((shot) => `### 镜头 ${shot.shot}\n\n**Veo Prompt**: ${shot.veo_prompt}\n\n**Negative**: ${shot.negative_prompt}`)
    .join("\n\n");
  return `${header}${titles}${voiceover}\n\n## 分镜表\n${tableHeader}\n${tableBody}\n\n## Veo Prompts\n${veoPrompts}`;
}

function toCsv(shots: StoryboardResult["shots"]): string {
  const header = ["shot", "sec", "visual", "camera", "subtitle", "bgm_sfx", "veo_prompt", "negative_prompt"].join(",");
  const rows = shots
    .map((shot) =>
      [shot.shot, shot.sec, shot.visual, shot.camera, shot.subtitle, shot.bgm_sfx, shot.veo_prompt, shot.negative_prompt]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  return `${header}\n${rows}`;
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: filename.endsWith(".csv") ? "text/csv" : "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapePipe(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "<br />");
}
