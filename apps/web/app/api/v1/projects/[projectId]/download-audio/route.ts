import { readFile } from "node:fs/promises";
import path from "node:path";
import { apiError } from "../../../../../../lib/api/response";
import { getApiUser } from "../../../../../../lib/auth/session";
import { prisma } from "../../../../../../lib/db/prisma";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

const chineseSyllables: Record<string, string> = {
  玻: "bo",
  璃: "li",
  海: "hai",
  面: "mian",
  午: "wu",
  夜: "ye",
  高: "gao",
  架: "jia",
  失: "shi",
  重: "zhong",
  轨: "gui",
  道: "dao",
};

function toDownloadBaseName(title: string) {
  const expanded = Array.from(title)
    .map((character) => chineseSyllables[character] ?? character)
    .join("-");

  const slug = expanded
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "musegrid-demo";
}

function downloadHeaders(fileName: string) {
  return {
    "Content-Type": "audio/mpeg",
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Cache-Control": "private, max-age=0, must-revalidate",
  };
}

async function readLocalAudio(storageUrl: string) {
  const publicDir = path.resolve(process.cwd(), "public");
  const decodedPath = decodeURIComponent(storageUrl.split("?")[0] ?? "");
  const relativePath = decodedPath.replace(/^\/+/, "");
  const absolutePath = path.resolve(publicDir, relativePath);

  if (!absolutePath.startsWith(`${publicDir}${path.sep}`)) {
    throw new Error("Audio path is outside the public directory.");
  }

  return readFile(absolutePath);
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) {
    return apiError(401, "UNAUTHORIZED", "请先登录后再下载作品。");
  }

  const { projectId } = await context.params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
    select: { id: true, title: true },
  });

  if (!project) {
    return apiError(404, "NOT_FOUND", "作品不存在或无权访问。");
  }

  const generations = await prisma.generationJob.findMany({
    where: {
      projectId,
      userId: user.id,
      status: "completed",
    },
    orderBy: { createdAt: "desc" },
    include: { audioAsset: true },
  });
  const audioUrl = generations.find((generation) => generation.audioAsset?.storageUrl)?.audioAsset?.storageUrl;

  if (!audioUrl) {
    return apiError(404, "NOT_FOUND", "当前作品还没有可下载的 MP3。");
  }

  const fileName = `${toDownloadBaseName(project.title)}.mp3`;
  const headers = downloadHeaders(fileName);

  if (/^https?:\/\//i.test(audioUrl)) {
    const upstream = await fetch(audioUrl);
    if (!upstream.ok || !upstream.body) {
      return apiError(502, "INTERNAL_ERROR", "音频文件暂时无法下载，请稍后重试。");
    }

    return new Response(upstream.body, { headers });
  }

  try {
    const file = await readLocalAudio(audioUrl);
    return new Response(file, { headers });
  } catch {
    return apiError(404, "NOT_FOUND", "音频文件不存在或已被移除。");
  }
}
