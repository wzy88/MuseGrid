"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/Button";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Button type="button" className="secondaryWorkspaceButton shareLinkButton" variant="secondary" onClick={() => void handleCopy()}>
      {copied ? "链接已复制" : "复制分享链接"}
    </Button>
  );
}
