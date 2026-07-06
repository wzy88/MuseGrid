"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    if (!response.ok) {
      const body = await parseAuthFailure(response);
      setError(body.error?.message ?? "注册失败，请稍后重试。");
      setIsSubmitting(false);
      return;
    }

    router.push("/studio");
    router.refresh();
  }

  return (
    <main className="authPage">
      <section className="authPanel" aria-labelledby="register-title">
        <p className="eyebrow">MuseGrid MVP</p>
        <h1 id="register-title">创建账户</h1>
        <form className="authForm" onSubmit={handleSubmit}>
          <label>
            <span>名称</span>
            <input name="name" autoComplete="name" required />
          </label>
          <label>
            <span>邮箱</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            <span>密码</span>
            <input name="password" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          {error ? <p className="formError">{error}</p> : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "创建中..." : "创建账户"}
          </button>
        </form>
        <p className="authSwitch">
          已有账户？<Link href="/login">登录</Link>
        </p>
      </section>
    </main>
  );
}

async function parseAuthFailure(response: Response): Promise<ApiFailure> {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as ApiFailure;
    }
  } catch {
    // Fall through to a stable user-facing error.
  }

  return {
    ok: false,
    error: {
      code: "UNKNOWN",
      message: "注册失败，请稍后重试。",
    },
  };
}
