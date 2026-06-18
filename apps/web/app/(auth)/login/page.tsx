"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "登录失败，请稍后重试。");
      setIsSubmitting(false);
      return;
    }

    router.push("/studio");
    router.refresh();
  }

  return (
    <main className="authPage">
      <section className="authPanel" aria-labelledby="login-title">
        <p className="eyebrow">MuseGrid MVP</p>
        <h1 id="login-title">登录</h1>
        <form className="authForm" onSubmit={handleSubmit}>
          <label>
            <span>邮箱</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            <span>密码</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {error ? <p className="formError">{error}</p> : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "登录中..." : "登录"}
          </button>
        </form>
        <p className="authSwitch">
          还没有账户？<Link href="/register">创建账户</Link>
        </p>
      </section>
    </main>
  );
}
