import { AppShell } from "../../components/app-shell/AppShell";
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

export default async function AvatarDashboardPage() {
  const user = await requireUser();
  const avatars = await prisma.creatorAvatar.findMany({
    where: { ownerUserId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell user={user} title="创作人分身后台">
      <main className="avatarDashboardPage">
        <section className="worksLibraryHero">
          <div>
            <p className="eyebrow">Avatar Dashboard</p>
            <h2>创作人分身后台</h2>
            <p>这里会显示你当前的分身状态。Level 1 只是起点，后续仍需不断补充样本、回答校准问题并纠正输出。</p>
          </div>
        </section>

        <section className="studioPanel worksTablePanel" aria-labelledby="avatar-dashboard-title">
          <div className="studioPanelHeader">
            <div>
              <p className="eyebrow">Owned Avatars</p>
              <h3 id="avatar-dashboard-title">我的创作人分身</h3>
            </div>
          </div>

          {avatars.length === 0 ? (
            <p className="emptyStateText">你还没有创作人分身，先完成成为创作人的申请流程。</p>
          ) : (
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
          )}
        </section>
      </main>
    </AppShell>
  );
}
