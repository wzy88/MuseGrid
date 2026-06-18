import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredAudioAsset = {
  storageUrl: string;
  format: string;
};

const generatedAudioDir = path.join(process.cwd(), "public/generated-audio");

export function getSampleAudioAsset(): StoredAudioAsset {
  return {
    storageUrl: "/samples/midnight-drive-sample.mp3",
    format: "mp3",
  };
}

export async function persistHexAudioAsMp3(projectId: string, hex: string): Promise<StoredAudioAsset> {
  const normalizedHex = hex.trim();
  if (!normalizedHex) {
    throw new Error("MiniMax hex audio payload was empty.");
  }

  const bytes = Buffer.from(normalizedHex, "hex");
  await mkdir(generatedAudioDir, { recursive: true });

  const fileName = `${projectId}-${Date.now()}.mp3`;
  await writeFile(path.join(generatedAudioDir, fileName), bytes);

  return {
    storageUrl: `/generated-audio/${fileName}`,
    format: "mp3",
  };
}
