"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ProjectFormState = {
  title: string;
  initialIdea: string;
  language: string;
  genre: string;
  mood: string;
  intendedUse: string;
};

const initialFormState: ProjectFormState = {
  title: "",
  initialIdea: "",
  language: "中文",
  genre: "Future R&B",
  mood: "夜航感",
  intendedUse: "个人 Demo",
};

export function NewProjectPanel() {
  const router = useRouter();
  const [formState, setFormState] = useState<ProjectFormState>(initialFormState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof ProjectFormState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/v1/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formState),
    });
    const payload = (await response.json()) as {
      error?: string;
      project?: { id: string; title: string; status: string };
    };

    if (!response.ok || !payload.project) {
      setError(payload.error ?? "项目创建失败，请稍后再试。");
      setIsSubmitting(false);
      return;
    }

    router.push(`/studio/projects/${payload.project.id}`);
  }

  return (
    <section className="newProjectPanel" aria-labelledby="new-project-title">
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
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "正在建档" : "开始制作"}
        </button>
      </form>
    </section>
  );
}
