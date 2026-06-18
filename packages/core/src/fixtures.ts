import type { ProductionStepType, SongProjectBrief } from "./domain";

export type StepOutputFixture = {
  stepType: ProductionStepType;
  output: Record<string, string | string[]>;
};

export const demoProject: SongProjectBrief = {
  title: "深夜开车",
  initialIdea: "想写一首深夜开车听的中文 R&B，关于想念但不回头。",
  language: "中文",
  genre: "R&B",
  mood: "克制想念",
  intendedUse: "个人 Demo",
};

export const demoStepOutputs: StepOutputFixture[] = [
  {
    stepType: "lyrics",
    output: {
      theme: "深夜城市里克制的想念",
      hookOptions: ["尾灯像没说出口的再见", "我把想念调成静音"],
      fullLyricDraft:
        "[Verse]\n路灯把雨切成慢镜头\n我握着方向盘不再回头\n\n[Chorus]\n我把想念调成静音\n让霓虹替我说晚安",
    },
  },
  {
    stepType: "composition",
    output: {
      tempo: "82 BPM",
      structure: "Verse - Pre - Chorus - Verse - Chorus - Bridge - Chorus",
      hookMood: "低声、贴近、带一点夜色里的释然",
      melodyDescription: "主歌用短句下行，副歌打开到五声音阶上方延展。",
    },
  },
  {
    stepType: "arrangement",
    output: {
      instruments: ["soft electric piano", "sub bass", "brushed snare", "late-night guitar"],
      rhythm: "laid-back R&B groove with restrained swing",
      sectionDevelopment: "副歌加入和声铺底，Bridge 留出半拍呼吸。",
      soundTexture: "温暖、近距离、城市夜雨颗粒感。",
    },
  },
  {
    stepType: "production",
    output: {
      vocalTone: "近距离耳语感，保留轻微气声",
      mixDirection: "人声靠前，低频圆润，鼓组保持克制冲击。",
      finalPrompt: "Chinese late-night R&B demo, intimate vocal, warm keys, restrained groove.",
    },
  },
];
