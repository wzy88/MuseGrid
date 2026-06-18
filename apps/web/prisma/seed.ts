import { PrismaClient, type Prisma } from "@prisma/client";
import { pathToFileURL } from "node:url";

const prisma = new PrismaClient();
type SeedPrismaClient = PrismaClient | Prisma.TransactionClient;

const seededAvatars = [
  {
    avatarName: "夜航作词人",
    capabilityDirection: "lyrics",
    level: 2,
    styleTags: ["R&B", "中文", "情绪叙事"],
    intro: "擅长克制、画面感强的中文流行歌词。",
    sampleOutputs: [
      {
        title: "深夜开车",
        excerpt: "红灯把想念拉长，后视镜里只剩月光。",
      },
    ],
    maintenanceScore: 82,
    simulatedCallCount: 18,
  },
  {
    avatarName: "旋律织造师",
    capabilityDirection: "composition",
    level: 2,
    styleTags: ["旋律", "R&B", "Hook"],
    intro: "擅长把口语化动机发展成好记的主歌与副歌旋律。",
    sampleOutputs: [
      {
        title: "克制副歌动机",
        excerpt: "以小六度上行制造想念感，再用级进下行回到克制情绪。",
      },
    ],
    maintenanceScore: 79,
    simulatedCallCount: 14,
  },
  {
    avatarName: "氛围编曲师",
    capabilityDirection: "arrangement",
    level: 2,
    styleTags: ["编曲", "氛围", "Synth Pad"],
    intro: "擅长用低频、Pad 与稀疏鼓组搭建现代中文 R&B 氛围。",
    sampleOutputs: [
      {
        title: "午夜 R&B 编曲",
        excerpt: "Verse 留白，Pre-Chorus 引入柔和合成器，Chorus 加入切分鼓组。",
      },
    ],
    maintenanceScore: 76,
    simulatedCallCount: 11,
  },
  {
    avatarName: "Demo 制作人",
    capabilityDirection: "production",
    level: 2,
    styleTags: ["制作", "人声", "Demo"],
    intro: "擅长把粗糙 Demo 整理成可分享、方向清晰的制作版本。",
    sampleOutputs: [
      {
        title: "人声制作建议",
        excerpt: "主唱保持近距离干声，副歌叠两轨气声和轻微 Plate Reverb。",
      },
    ],
    maintenanceScore: 81,
    simulatedCallCount: 16,
  },
];

export async function seedCreatorAvatars(client: SeedPrismaClient = prisma) {
  for (const avatar of seededAvatars) {
    await client.creatorAvatar.upsert({
      where: {
        avatarName_capabilityDirection: {
          avatarName: avatar.avatarName,
          capabilityDirection: avatar.capabilityDirection,
        },
      },
      update: avatar,
      create: avatar,
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedCreatorAvatars()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
