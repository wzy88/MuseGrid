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
    avatarName: "副歌钩子手",
    capabilityDirection: "lyrics",
    level: 3,
    styleTags: ["Hook", "流行", "短视频"],
    intro: "擅长快速提炼一句能被记住的副歌核心句。",
    sampleOutputs: [
      {
        title: "三秒记忆点",
        excerpt: "把城市的灯关小一点，让我的心跳被你听见。",
      },
    ],
    maintenanceScore: 88,
    simulatedCallCount: 47,
  },
  {
    avatarName: "叙事修辞师",
    capabilityDirection: "lyrics",
    level: 1,
    styleTags: ["叙事", "意象", "中文"],
    intro: "擅长把普通故事改写成有画面、有转折的歌词段落。",
    sampleOutputs: [
      {
        title: "旧照片",
        excerpt: "你把夏天夹进书页，我把名字留在雨里。",
      },
    ],
    maintenanceScore: 71,
    simulatedCallCount: 9,
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
    avatarName: "Hook 旋律师",
    capabilityDirection: "composition",
    level: 3,
    styleTags: ["Hook", "Pop", "上口"],
    intro: "擅长把一句歌词做成高辨识度、易跟唱的副歌旋律。",
    sampleOutputs: [
      {
        title: "上行副歌",
        excerpt: "主句用三度级进铺垫，末尾跳进五度制造抬头感。",
      },
    ],
    maintenanceScore: 86,
    simulatedCallCount: 39,
  },
  {
    avatarName: "段落结构师",
    capabilityDirection: "composition",
    level: 1,
    styleTags: ["结构", "段落", "动机"],
    intro: "擅长规划 Verse、Pre、Chorus 的旋律功能和情绪递进。",
    sampleOutputs: [
      {
        title: "双副歌结构",
        excerpt: "第一段副歌保留，第二段副歌提高音区并加一句回应。",
      },
    ],
    maintenanceScore: 69,
    simulatedCallCount: 8,
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
    avatarName: "低频建筑师",
    capabilityDirection: "arrangement",
    level: 3,
    styleTags: ["低频", "鼓组", "电子"],
    intro: "擅长用低频和鼓组把 Demo 推到更有身体感的状态。",
    sampleOutputs: [
      {
        title: "夜跑节奏",
        excerpt: "Kick 保持四拍稳定，副歌加入 16 分切分贝斯制造推进。",
      },
    ],
    maintenanceScore: 84,
    simulatedCallCount: 31,
  },
  {
    avatarName: "乐器分层师",
    capabilityDirection: "arrangement",
    level: 1,
    styleTags: ["配器", "层次", "空间"],
    intro: "擅长给旋律安排钢琴、吉他、Pad 和点缀音色的进入顺序。",
    sampleOutputs: [
      {
        title: "透明副歌",
        excerpt: "主歌只留 Rhodes，副歌加宽 Pad 与高八度钟琴点缀。",
      },
    ],
    maintenanceScore: 73,
    simulatedCallCount: 12,
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
  {
    avatarName: "人声质感师",
    capabilityDirection: "production",
    level: 3,
    styleTags: ["人声", "混音", "质感"],
    intro: "擅长把人声位置、空间和叠轨策略整理成制作提示词。",
    sampleOutputs: [
      {
        title: "近场人声",
        excerpt: "主歌干声贴近，副歌加入双轨和短延迟增加宽度。",
      },
    ],
    maintenanceScore: 90,
    simulatedCallCount: 42,
  },
  {
    avatarName: "母带方向师",
    capabilityDirection: "production",
    level: 1,
    styleTags: ["母带", "响度", "发布"],
    intro: "擅长定义试听版 Demo 的响度、动态和平台发布目标。",
    sampleOutputs: [
      {
        title: "平台试听",
        excerpt: "保持低频清晰，副歌响度略抬但不压扁动态。",
      },
    ],
    maintenanceScore: 68,
    simulatedCallCount: 7,
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
