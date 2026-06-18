"use client";

import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button type="button" className="secondaryWorkspaceButton shareLinkButton" onClick={() => void handleCopy()}>
      {copied ? "链接已复制" : "复制分享链接"}
    </button>
  );
}
