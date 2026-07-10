"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/Button";

type ShareActionProps = {
  title: string;
  description: string;
};

function getCurrentUrl() {
  return window.location.href;
}

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

export function MailShareButton({ title, description }: ShareActionProps) {
  function handleShare() {
    const url = getCurrentUrl();
    const mailto = `mailto:?subject=${encodeURIComponent(`MuseGrid 作品分享｜${title}`)}&body=${encodeURIComponent(
      `${title}\n\n${description}\n\n作品链接：${url}`,
    )}`;

    window.location.href = mailto;
  }

  return (
    <Button type="button" variant="secondary" onClick={handleShare}>
      邮件分享
    </Button>
  );
}

export function WeiboShareButton({ title, description }: ShareActionProps) {
  function handleShare() {
    const url = getCurrentUrl();
    const shareUrl = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(
      `${title}｜${description}`,
    )}&url=${encodeURIComponent(url)}`;

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Button type="button" variant="secondary" onClick={handleShare}>
      微博分享
    </Button>
  );
}
