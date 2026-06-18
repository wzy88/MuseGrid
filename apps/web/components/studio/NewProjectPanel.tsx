"use client";

import type { SongProjectBrief } from "@musegrid/core";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";

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

export function NewProjectPanel() {
  const router = useRouter();
  const [formState, setFormState] = useState<SongProjectBrief>(initialFormState);
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

      router.push(`/studio/projects/${payload.data.project.id}`);
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
          <label>
            语言
            <input
              name="language"
              value={formState.language}
              onChange={(event) => updateField("language", event.target.value)}
              required
            />
          </label>
          <label>
            曲风
            <input
              name="genre"
              value={formState.genre}
              onChange={(event) => updateField("genre", event.target.value)}
              required
            />
          </label>
          <label>
            情绪
            <input
              name="mood"
              value={formState.mood}
              onChange={(event) => updateField("mood", event.target.value)}
              required
            />
          </label>
          <label>
            用途
            <input
              name="intendedUse"
              value={formState.intendedUse}
              onChange={(event) => updateField("intendedUse", event.target.value)}
              required
            />
          </label>
        </div>
        {error ? <p className="formError">{error}</p> : null}
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? "正在建档" : "开始制作"}
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
