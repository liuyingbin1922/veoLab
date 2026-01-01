import seedData from "./seed.json" assert { type: "json" };
import { getPrompt } from "@/packages/prompts";

const SEGMENT_SECONDS = 6;
const ASPECT_RATIO = "9:16";
const LANG_PAIR = "zh+en";
const WORD_PROMPT_ID = "kids-english-word.v1";
const GRAMMAR_PROMPT_ID = "kids-english-grammar.is-am-are.v1";
const NEGATIVE_PROMPT = "watermark, logo, glitch, distorted hands, text errors, nsfw, extra limbs";

const siteUrl = (seedData.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://veolab.ai").replace(/\/$/, "");

type SeedData = typeof seedData;
type WordSeed = SeedData["words"][number];
type GrammarSeed = SeedData["grammar"][number];

export type KidsEnglishPlanInput = {
  type: "word" | "grammar";
  key: string;
  grade: string;
  style?: string;
};

type BaseMeta = {
  id: string;
  type: "word" | "grammar";
  key: string;
  grade: string;
  style: string;
  lang_pair: string;
  aspect_ratio: string;
  segment_seconds: number;
  seo: {
    title_en: string;
    title_zh: string;
    description_en: string;
    description_zh: string;
    faq: Array<{
      question_en: string;
      answer_en: string;
      question_zh: string;
      answer_zh: string;
    }>;
    canonical_en?: string;
    canonical_zh?: string;
    video?: {
      jobId?: string;
      src?: string;
      poster?: string;
    };
  };
};

type StoryboardBeat = {
  id: string;
  sec: number;
  title: string;
  english_line: string;
  chinese_line: string;
  visual_prompt: string;
  veo_prompt: string;
  camera: string;
  shot_type: string;
  bgm: string;
  note: string;
};

type VeoSegment = {
  id: string;
  sec: number;
  veo_prompt: string;
  negative_prompt: string;
  voiceover_en: string;
  subtitle_zh: string;
};

type WordPlan = {
  meta: BaseMeta & { type: "word" };
  lesson: {
    word: string;
    translation: string;
    phonics: string;
    part_of_speech: string;
    definition_en: string;
    definition_zh: string;
    examples: Array<{ en: string; zh: string }>;
  };
  storyboard: StoryboardBeat[];
  veo_segments: VeoSegment[];
};

type GrammarPlan = {
  meta: BaseMeta & { type: "grammar" };
  rule: GrammarSeed["rule"];
  storyboard: StoryboardBeat[];
  veo_segments: VeoSegment[];
};

export type KidsEnglishPlan = WordPlan | GrammarPlan;

export function generateKidsEnglishPlan(input: KidsEnglishPlanInput): KidsEnglishPlan {
  if (input.type === "word") {
    const plan = buildWordPlan(input as KidsEnglishPlanInput & { type: "word" });
    return getPrompt(WORD_PROMPT_ID).validateOutput(plan);
  }
  const plan = buildGrammarPlan(input as KidsEnglishPlanInput & { type: "grammar" });
  return getPrompt(GRAMMAR_PROMPT_ID).validateOutput(plan);
}

function buildWordPlan(input: KidsEnglishPlanInput & { type: "word" }): WordPlan {
  const seed = findWordSeed(input.key) ?? buildFallbackWordSeed(input.key, input.grade);
  const meta = buildMeta("word", seed.key, input.grade, seed, undefined, input.style) as BaseMeta & { type: "word" };
  const lessonExamples = seed.english.examples?.length ? seed.english.examples : [{ en: `This is ${seed.english.title.toLowerCase()}.`, zh: `这是${seed.chinese.title}。` }];

  const storyboard: StoryboardBeat[] = [
    {
      id: `${seed.key}-beat-1`,
      sec: SEGMENT_SECONDS,
      title: "See & Say",
      english_line: `Look at this shiny ${seed.english.title.toLowerCase()}! Say it with me: ${seed.english.title.toUpperCase()}.`,
      chinese_line: `看看这颗闪亮的${seed.chinese.title}！跟我一起说：${seed.chinese.title}。`,
      visual_prompt: `${seed.imageCue} surrounded by crayons and handwriting overlays`,
      veo_prompt: `9:16 vertical macro shot of ${seed.imageCue}, natural classroom daylight, shallow depth of field, playful watercolor textures, UHD, gentle motion graphics spelling ${seed.english.title}`,
      camera: "Macro push-in",
      shot_type: "Hook",
      bgm: "Playful glockenspiel + hand claps",
      note: "Display English word and phonics ribbon",
    },
    {
      id: `${seed.key}-beat-2`,
      sec: SEGMENT_SECONDS,
      title: "Sound & Meaning",
      english_line: `${seed.english.title} sounds like ${seed.ipa}. It means a ${seed.english.description.toLowerCase()}.`,
      chinese_line: `${seed.english.title} 的发音是 ${seed.ipa}，意思是${seed.chinese.description}。`,
      visual_prompt: `teacher tapping flashcard letters for ${seed.english.title} with doodle overlays`,
      veo_prompt: `9:16 vertical medium shot of a bilingual teacher pointing at a chalkboard spelling ${seed.english.title}, soft key lighting, colorful chalk particles, cinematic handheld, UHD`,
      camera: "Medium handheld",
      shot_type: "Teaching",
      bgm: "Warm marimba + soft pads",
      note: "Animate phonics bubbles and translation",
    },
    {
      id: `${seed.key}-beat-3`,
      sec: SEGMENT_SECONDS,
      title: "Use It",
      english_line: lessonExamples[0].en,
      chinese_line: lessonExamples[0].zh,
      visual_prompt: `kid demonstrating ${seed.english.title.toLowerCase()} in action, ${seed.imageCue}`,
      veo_prompt: `9:16 vertical over-shoulder shot of a child using ${seed.english.title.toLowerCase()}, bright rim light, subtle depth haze, stylized pastel classroom, UHD`,
      camera: "Over-shoulder",
      shot_type: "Example",
      bgm: "Acoustic strums with snaps",
      note: "Subtitle both EN + ZH sentences",
    },
    {
      id: `${seed.key}-beat-4`,
      sec: SEGMENT_SECONDS,
      title: "Quiz & CTA",
      english_line: `Which one shows ${seed.english.title.toLowerCase()}? Point and say it loud!`,
      chinese_line: `哪一个是${seed.chinese.title}？指给我看并大声说出来！`,
      visual_prompt: `split-screen of two options from quiz, bright stickers and checkmarks`,
      veo_prompt: `9:16 vertical split-screen graphic showing two illustrated options from the quiz, bold color blocking, animated stickers, UHD`,
      camera: "Graphic layout",
      shot_type: "Quiz",
      bgm: "Rhythmic claps + riser",
      note: `Show quiz options with ${seed.english.quiz?.options?.length || 2} icons and CTA button`,
    },
  ];

  const veo_segments = storyboard.map<VeoSegment>((beat) => ({
    id: beat.id,
    sec: SEGMENT_SECONDS,
    veo_prompt: beat.veo_prompt,
    negative_prompt: NEGATIVE_PROMPT,
    voiceover_en: beat.english_line,
    subtitle_zh: beat.chinese_line,
  }));

  return {
    meta,
    lesson: {
      word: seed.english.title,
      translation: seed.chinese.title,
      phonics: seed.ipa,
      part_of_speech: seed.partOfSpeech,
      definition_en: seed.english.description,
      definition_zh: seed.chinese.description,
      examples: lessonExamples,
    },
    storyboard,
    veo_segments,
  };
}

function buildGrammarPlan(input: KidsEnglishPlanInput & { type: "grammar" }): GrammarPlan {
  const seed = findGrammarSeed(input.key) ?? buildFallbackGrammarSeed(input.key, input.grade);
  const meta = buildMeta("grammar", seed.key, input.grade, undefined, seed, input.style) as BaseMeta & { type: "grammar" };

  const storyboard: StoryboardBeat[] = [
    {
      id: `${seed.key}-beat-1`,
      sec: SEGMENT_SECONDS,
      title: "Hook",
      english_line: `Meet our crew: I, you, we, and they! Each wears a tag so we remember the helper words.`,
      chinese_line: `认识一下我们的队伍：I、you、we、they！每个人都戴上标签提醒要用哪个助动词。`,
      visual_prompt: "kids on a colorful rug wearing pronoun badges, teacher in center",
      veo_prompt: "9:16 vertical medium-wide of cheerful classroom circle time, children with pronoun badges, soft key lighting, dolly-in move, UHD",
      camera: "Dolly-in",
      shot_type: "Hook",
      bgm: "Playful bass + snaps",
      note: "Overlay pronoun icons",
    },
    {
      id: `${seed.key}-beat-2`,
      sec: SEGMENT_SECONDS,
      title: "Rule Breakdown",
      english_line: `${seed.rule.steps[0]} ${seed.rule.steps[1]} And ${seed.rule.steps[2]}`,
      chinese_line: `${seed.rule.steps[0]} ${seed.rule.steps[1]} 还有 ${seed.rule.steps[2]}`,
      visual_prompt: "teacher rearranging magnetic tiles is/am/are on whiteboard",
      veo_prompt: "9:16 vertical close-up of magnetic word tiles is/am/are being placed next to pronouns, cinematic lighting, UHD",
      camera: "Top-down slider",
      shot_type: "Teaching",
      bgm: "Malimba arpeggios",
      note: "Highlight matching arrows",
    },
    {
      id: `${seed.key}-beat-3`,
      sec: SEGMENT_SECONDS,
      title: "Examples",
      english_line: `${seed.rule.examples[0].en} Then try: ${seed.rule.examples[1]?.en || seed.rule.examples[0].en}.`,
      chinese_line: `${seed.rule.examples[0].zh} 再来：${seed.rule.examples[1]?.zh || seed.rule.examples[0].zh}`,
      visual_prompt: "split screen sentences with doodle arrows to subjects",
      veo_prompt: "9:16 vertical split-screen chalk animation showing example sentences lighting up word by word, UHD",
      camera: "2D motion",
      shot_type: "Example",
      bgm: "Dreamy pads",
      note: "Animate word highlight",
    },
    {
      id: `${seed.key}-beat-4`,
      sec: SEGMENT_SECONDS,
      title: "Practice",
      english_line: `${seed.quiz.question} Say the answer out loud: ${seed.quiz.answer}.`,
      chinese_line: `${seed.quiz.question} 大声说出答案：${seed.quiz.answer}。`,
      visual_prompt: "student pointing to correct magnetic word tile, confetti stickers",
      veo_prompt: "9:16 vertical POV shot pointing at flashcards with is/am/are, celebratory confetti particles, UHD",
      camera: "POV handheld",
      shot_type: "Practice",
      bgm: "Clap rhythm + riser",
      note: "Reveal correct choice with sparkle",
    },
  ];

  const veo_segments = storyboard.map<VeoSegment>((beat) => ({
    id: beat.id,
    sec: SEGMENT_SECONDS,
    veo_prompt: beat.veo_prompt,
    negative_prompt: NEGATIVE_PROMPT,
    voiceover_en: beat.english_line,
    subtitle_zh: beat.chinese_line,
  }));

  return {
    meta,
    rule: seed.rule,
    storyboard,
    veo_segments,
  };
}

function buildMeta(
  type: "word" | "grammar",
  key: string,
  grade: string,
  wordSeed?: WordSeed,
  grammarSeed?: GrammarSeed,
  style?: string
): BaseMeta {
  if (!wordSeed && !grammarSeed) {
    throw new Error("Meta requires at least one seed");
  }
  const wordEnglish = wordSeed?.english;
  const grammarEnglish = grammarSeed?.english;
  const english = wordEnglish || grammarEnglish;
  const chinese = wordSeed?.chinese || grammarSeed?.chinese;
  const faq = wordEnglish?.seo?.faq || grammarEnglish?.faq || [
    {
      question_en: "How do I use this lesson?",
      answer_en: "Play the short video, pause for student answers, then let them record their own line.",
      question_zh: "如何使用该课程？",
      answer_zh: "播放短视频，暂停让学生回答，再让他们录自己的台词。",
    },
  ];
  const description_en = wordEnglish?.seo?.description || english?.description || `${capitalize(key)} bilingual mini-lesson.`;
  const description_zh = chinese?.description || chinese?.summary || `${key} 的双语课程。`;
  const title_en = english?.title ? `${english.title} | Kids English Lesson` : `${capitalize(key)} Lesson`;
  const title_zh = chinese?.title ? `${chinese.title} 少儿英语课` : `${key} 少儿英语`; 
  const canonical_en = `${siteUrl}/en/${type === "word" ? "words" : "grammar"}/${key}`;
  const canonical_zh = `${siteUrl}/zh/${type === "word" ? "words" : "grammar"}/${key}`;

  return {
    id: `kids-english-${type}-${key}`,
    type,
    key,
    grade,
    style: style ?? "playful-handheld",
    lang_pair: LANG_PAIR,
    aspect_ratio: ASPECT_RATIO,
    segment_seconds: SEGMENT_SECONDS,
    seo: {
      title_en,
      title_zh,
      description_en,
      description_zh,
      faq,
      canonical_en,
      canonical_zh,
      video: wordSeed?.video || grammarSeed?.video,
    },
  };
}

function findWordSeed(key: string): WordSeed | undefined {
  return seedData.words.find((entry) => entry.key.toLowerCase() === key.toLowerCase());
}

function findGrammarSeed(key: string): GrammarSeed | undefined {
  return seedData.grammar.find((entry) => entry.key.toLowerCase() === key.toLowerCase());
}

function buildFallbackWordSeed(key: string, grade: string): WordSeed {
  return {
    key,
    grade,
    ipa: "/ˈwɜːd/",
    partOfSpeech: "noun",
    imageCue: `${key} illustrated card on a desk`,
    english: {
      title: capitalize(key),
      summary: `${capitalize(key)} quick lesson`,
      description: `Simple explanation for ${key}.`,
      examples: [
        { en: `I can say ${key}.`, zh: `我会说${key}。` },
      ],
      quiz: {
        question: `Which one shows ${key}?`,
        options: [
          { en: `${key} icon`, zh: `${key} 图案` },
          { en: "Other item", zh: "其他物品" },
        ],
        answer_index: 0,
      },
      seo: {
        description: `${capitalize(key)} bilingual short.`,
        faq: [
          {
            question_en: `Why learn ${key}?`,
            answer_en: `It appears in early reader books.`,
            question_zh: `为什么学 ${key}？`,
            answer_zh: `因为它常出现在启蒙读物。`,
          },
        ],
      },
    },
    chinese: {
      title: key,
      summary: `${key} 小知识`,
      description: `${key} 的简单解释。`,
    },
  } as WordSeed;
}

function buildFallbackGrammarSeed(key: string, grade: string): GrammarSeed {
  return {
    key,
    grade,
    english: {
      title: capitalize(key),
      summary: `${capitalize(key)} grammar rule`,
      description: `Teach the basic rule for ${key}.`,
      faq: [
        {
          question_en: `How do I explain ${key}?`,
          answer_en: `Use gestures and bilingual captions.`,
          question_zh: `如何讲解 ${key}？`,
          answer_zh: `结合手势和中英文字幕。`,
        },
      ],
    },
    chinese: {
      title: key,
      summary: `${key} 语法`,
      description: `${key} 的语法说明。`,
    },
    rule: {
      title: capitalize(key),
      zh_title: `${key} 语法`,
      overview: `${capitalize(key)} overview`,
      steps: ["Introduce the rule", "Give two examples", "Ask students to respond", "Praise attempts"],
      examples: [
        { pattern: `${key} example 1`, en: `${capitalize(key)} sample sentence.`, zh: `${key} 示例句。` },
      ],
    },
    quiz: {
      question: `Say ${key} correctly`,
      answer: key,
      explanation: `${key} is the right choice`,
    },
  } as GrammarSeed;
}

function capitalize(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
