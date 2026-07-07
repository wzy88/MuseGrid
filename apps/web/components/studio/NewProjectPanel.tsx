"use client";

import type { SongProjectBrief } from "@musegrid/core";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { ProjectBriefField } from "./ProjectBriefField";

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

const initialFormState: SongProjectBrief = {
  title: "",
  initialIdea: "",
  language: "中文",
  genre: "Future R&B",
  mood: "夜航感",
  intendedUse: "个人 Demo",
};

type StudioEntryMode = "professional" | "quick";

const entryModeCopy: Record<StudioEntryMode, { label: string; description: string; action: string }> = {
  quick: {
    label: "极速模式",
    description: "提交后会直接进入自动生成流程，完成后跳到作品结果页。",
    action: "极速生成",
  },
  professional: {
    label: "专业模式",
    description: "提交后进入四步创作台，你可以逐环节召唤分身、编辑草案并确认。",
    action: "开始制作",
  },
};

const briefFieldOptions = {
  language: ["中文", "英文", "中英双语", "粤语", "日文", "韩文"],
  genre: ["流行", "R&B", "Future Pop", "电子流行", "Hip-Hop", "国风", "民谣", "摇滚"],
  mood: ["夜航感", "松弛", "释怀", "孤独", "热血", "治愈", "甜感", "复古"],
  intendedUse: ["个人 Demo", "平台首发", "短视频 BGM", "商业提案", "练习作品"],
} satisfies Record<"language" | "genre" | "mood" | "intendedUse", string[]>;

export function NewProjectPanel() {
  const router = useRouter();
  const [formState, setFormState] = useState<SongProjectBrief>(initialFormState);
  const [entryMode, setEntryMode] = useState<StudioEntryMode>("professional");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof SongProjectBrief, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const payload = await parseProjectResponse(response);

      if (!response.ok || !("ok" in payload) || !payload.ok || !payload.data.project) {
        setError(getApiErrorMessage(payload, "项目创建失败，请稍后再试。"));
        setIsSubmitting(false);
        return;
      }

      const projectUrl = `/studio/projects/${payload.data.project.id}`;
      router.push(entryMode === "quick" ? `${projectUrl}?mode=quick` : projectUrl);
    } catch {
      setError("项目创建失败，请检查网络后重试。");
      setIsSubmitting(false);
    }
  }

  return (
    <Panel className="newProjectPanel" aria-labelledby="new-project-title" tone="hero">
      <div className="panelHeader">
        <p className="eyebrow">Future Music OS</p>
        <h2 id="new-project-title">把一个灵感变成可发布 Demo</h2>
      </div>
      <form className="projectForm" onSubmit={submitProject}>
        <div className="studioEntryModeShell">
          <div className="studioEntryModeHeader">
            <span>创作台模式</span>
            <strong>{entryModeCopy[entryMode].label}</strong>
          </div>
          <div className="studioEntryMode" role="radiogroup" aria-label="创作台模式">
            <button
              type="button"
              role="radio"
              aria-checked={entryMode === "quick"}
              className={entryMode === "quick" ? "studioEntryModeButton active" : "studioEntryModeButton"}
              onClick={() => setEntryMode("quick")}
            >
              <span>极速模式</span>
              {entryMode === "quick" ? <em className="modeSelectedBadge">已选择</em> : null}
              <strong>输入提示词，等待歌曲</strong>
              <small>后台自动完成作词、作曲、编曲和制作。</small>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={entryMode === "professional"}
              className={entryMode === "professional" ? "studioEntryModeButton active" : "studioEntryModeButton"}
              onClick={() => setEntryMode("professional")}
            >
              <span>专业模式</span>
              {entryMode === "professional" ? <em className="modeSelectedBadge">已选择</em> : null}
              <strong>白盒控制每个环节</strong>
              <small>逐步召唤分身、修改草案并确认贡献链路。</small>
            </button>
          </div>
          <div className="studioEntryModeStatus" role="status" aria-live="polite">
            <strong>当前模式：{entryModeCopy[entryMode].label}</strong>
            <span>{entryModeCopy[entryMode].description}</span>
          </div>
        </div>
        <label>
          项目名称
          <input
            name="title"
            value={formState.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="霓虹夜航"
            required
          />
        </label>
        <label>
          歌曲灵感
          <textarea
            name="initialIdea"
            value={formState.initialIdea}
            onChange={(event) => updateField("initialIdea", event.target.value)}
            placeholder="写下画面、故事、听感或发布场景"
            required
            rows={5}
          />
        </label>
        <div className="projectMetaGrid">
          <ProjectBriefField
            label="语言"
            name="language"
            value={formState.language}
            options={briefFieldOptions.language}
            onChange={(value) => updateField("language", value)}
          />
          <ProjectBriefField
            label="曲风"
            name="genre"
            value={formState.genre}
            options={briefFieldOptions.genre}
            onChange={(value) => updateField("genre", value)}
          />
          <ProjectBriefField
            label="情绪"
            name="mood"
            value={formState.mood}
            options={briefFieldOptions.mood}
            onChange={(value) => updateField("mood", value)}
          />
          <ProjectBriefField
            label="用途"
            name="intendedUse"
            value={formState.intendedUse}
            options={briefFieldOptions.intendedUse}
            onChange={(value) => updateField("intendedUse", value)}
          />
        </div>
        {error ? <p className="formError">{error}</p> : null}
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? (entryMode === "quick" ? "正在启动极速生成" : "正在建档") : entryModeCopy[entryMode].action}
        </Button>
      </form>
    </Panel>
  );
}

function getApiErrorMessage(payload: ApiSuccess<unknown> | ApiFailure | { error: string }, fallback: string) {
  if ("ok" in payload && payload.ok === false) {
    return payload.error.message;
  }
  if ("error" in payload) {
    return payload.error;
  }
  return fallback;
}

async function parseProjectResponse(
  response: Response,
): Promise<ApiSuccess<{ project?: { id: string; title: string; status: string } }> | ApiFailure | { error: string }> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {
      error:
        response.status === 401
          ? "登录状态已失效，请重新登录后再创建项目。"
          : "项目创建失败，服务返回了无法识别的响应。",
    };
  }

  try {
    return (await response.json()) as ApiSuccess<{ project?: { id: string; title: string; status: string } }> | ApiFailure;
  } catch {
    return { error: "项目创建失败，服务响应无法解析。" };
  }
}
