import { AppShell } from "../../components/app-shell/AppShell";
import { AvatarEvolutionCore } from "../../components/avatars/AvatarEvolutionCore";
import { CapabilityLevelGrid } from "../../components/avatars/CapabilityLevelGrid";
import { CreatorImpactMetrics } from "../../components/avatars/CreatorImpactMetrics";
import { MaintenanceQueue } from "../../components/avatars/MaintenanceQueue";
import { requireUser } from "../../lib/auth/session";
import { prisma } from "../../lib/db/prisma";

const directionLabelMap: Record<string, string> = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  production: "制作",
};

const statusLabelMap: Record<string, string> = {
  pending_review: "待审核",
  seeded: "已就绪",
};

const applicationStatusLabelMap: Record<string, string> = {
  submitted: "申请已提交",
};

const dashboardDirectionOrder = ["lyrics", "composition", "arrangement", "production"] as const;

export default async function AvatarDashboardPage() {
  const user = await requireUser();
  const [avatars, latestApplication] = await Promise.all([
    prisma.creatorAvatar.findMany({
      where: { ownerUserId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.creatorApplication.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const primaryAvatar = avatars[0] ?? null;
  const primaryDirection = primaryAvatar?.capabilityDirection ?? latestApplication?.capabilityDirection ?? null;
  const primaryDirectionLabel = primaryDirection ? directionLabelMap[primaryDirection] ?? primaryDirection : "未开启";
  const primaryStatusLabel = primaryAvatar
    ? statusLabelMap[primaryAvatar.status] ?? primaryAvatar.status
    : latestApplication
      ? applicationStatusLabelMap[latestApplication.status] ?? latestApplication.status
      : "未开启";

  const capabilityDirections = dashboardDirectionOrder.map((directionKey) => {
    const avatar = avatars.find((item) => item.capabilityDirection === directionKey);
    const label = directionLabelMap[directionKey];
    const isActive = primaryDirection === directionKey;

    if (avatar) {
      return {
        key: directionKey,
        label,
        level: avatar.level,
        stateLabel: avatar.level === 1 ? "Level 1" : `Level ${avatar.level}`,
        summary:
          avatar.level === 1
            ? "已完成初始建档，接下来要靠真实调用与创作人维护逐步升级。"
            : "正在根据真实调用与维护记录持续演进。",
        isActive,
      };
    }

    return {
      key: directionKey,
      label,
      level: null,
      stateLabel: "未开启",
      summary: isActive
        ? "当前能力线仍在建档中，等待系统完成首个分身初始化。"
        : "尚未开启该能力线，后续可在完成新方向建档后解锁。",
      isActive,
    };
  });

  const maintenanceTasks = [
    {
      title: "补充作品案例",
      detail: "再补 2-3 条代表性案例，让分身更稳地学会你的判断标准。",
      status: "待处理",
    },
    {
      title: "回答校准问卷",
      detail: "持续明确风格边界、禁区和优先级，帮助 Level 1 分身收紧偏差。",
      status: "待处理",
    },
    {
      title: "纠偏分身输出",
      detail: "在真实协作后标记不够像你的部分，把修正反馈回灌给分身。",
      status: "待处理",
    },
  ];

  const maintenanceCompletion = primaryAvatar ? Math.min(100, primaryAvatar.maintenanceScore) : 0;
  const simulatedCalls = primaryAvatar?.simulatedCallCount ?? 0;
  const simulatedIncomeValue = new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(120 + simulatedCalls * 18 + maintenanceCompletion * 6);

  return (
    <AppShell user={user} title="创作人分身后台">
      <main className="avatarDashboardPage">
        <section className="worksLibraryHero">
          <div>
            <p className="eyebrow">Avatar Dashboard</p>
            <h2>创作人分身后台</h2>
            <p>
              这里展示创作人分身的实时演化状态。每位创作人都从 Level 1 起步，后续升级来自真实调用数据，以及创作人本人持续补充样本、回答校准问题并纠偏输出。
            </p>
          </div>
          <div className="worksHeroStats" aria-label="avatar dashboard summary">
            <span>{primaryDirectionLabel}</span>
            <span>{primaryAvatar ? `Level ${primaryAvatar.level}` : "待建档"}</span>
            <span>{primaryStatusLabel}</span>
          </div>
        </section>

        {primaryAvatar ? (
          <div className="avatarDashboardGrid">
            <div className="avatarDashboardMain">
              <div className="avatarCoreAndMatrix">
                <AvatarEvolutionCore
                  avatarName={primaryAvatar.avatarName}
                  directionLabel={primaryDirectionLabel}
                  level={primaryAvatar.level}
                  statusLabel={primaryStatusLabel}
                  simulatedCallCount={simulatedCalls}
                  maintenanceScore={maintenanceCompletion}
                />
                <CapabilityLevelGrid directions={capabilityDirections} />
              </div>

              <CreatorImpactMetrics
                growthSteps={[
                  {
                    label: "建档完成",
                    detail: "已完成首轮资料录入，并生成当前能力线的 Level 1 创作人分身。",
                    active: true,
                  },
                  {
                    label: "真实调用积累",
                    detail: "等待更多创作协作与调用记录，帮助系统判断是否具备升级条件。",
                    active: simulatedCalls > 0,
                  },
                  {
                    label: "维护驱动升级",
                    detail: "创作人持续补样本、答问卷和纠偏输出后，系统才会开放更高等级。",
                    active: maintenanceCompletion >= 50,
                  },
                ]}
                simulatedIncome={simulatedIncomeValue}
                simulatedCalls={simulatedCalls}
                maintenanceCompletion={maintenanceCompletion}
              />
            </div>

            <div className="avatarDashboardRail">
              <MaintenanceQueue tasks={maintenanceTasks} />

              <section className="studioPanel avatarOwnedList" aria-labelledby="avatar-dashboard-title">
                <div className="studioPanelHeader">
                  <div>
                    <p className="eyebrow">Owned Avatars</p>
                    <h3 id="avatar-dashboard-title">我的创作人分身</h3>
                  </div>
                </div>

                <div className="worksTable" role="list">
                  {avatars.map((avatar) => (
                    <article className="worksRow" key={avatar.id} role="listitem">
                      <div className="worksRowTitle">
                        <strong>{avatar.avatarName}</strong>
                        <small>{directionLabelMap[avatar.capabilityDirection] ?? avatar.capabilityDirection}</small>
                      </div>
                      <div className="worksRowMeta">
                        <span>{statusLabelMap[avatar.status] ?? avatar.status}</span>
                        <span>Level {avatar.level}</span>
                      </div>
                      <div className="avatarDashboardHint">继续补充样本与校准记录</div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <section className="studioPanel worksTablePanel" aria-labelledby="avatar-dashboard-title">
            <div className="studioPanelHeader">
              <div>
                <p className="eyebrow">Owned Avatars</p>
                <h3 id="avatar-dashboard-title">我的创作人分身</h3>
              </div>
            </div>
            <p className="emptyStateText">你还没有创作人分身，先完成成为创作人的申请流程。</p>
          </section>
        )}
      </main>
    </AppShell>
  );
}
