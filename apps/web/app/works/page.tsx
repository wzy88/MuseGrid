import { AppShell } from "../../components/app-shell/AppShell";
import { Button } from "../../components/ui/Button";
import { Panel } from "../../components/ui/Panel";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { requireUser } from "../../lib/auth/session";
import { listWorks } from "../../lib/repositories/projects";

const projectStatusLabels: Record<string, string> = {
  draft: "草稿",
  ready: "就绪",
  generating: "生成中",
  completed: "已完成",
  failed: "需处理",
};

const generationStatusLabels: Record<string, string> = {
  draft: "待生成",
  generating: "生成中",
  completed: "可播放",
  failed: "生成失败",
};

const statusTone: Record<string, "accent" | "success" | "warning" | "danger" | "muted"> = {
  draft: "muted",
  ready: "accent",
  generating: "warning",
  completed: "success",
  failed: "danger",
};

export default async function WorksPage() {
  const user = await requireUser();
  const works = await listWorks(user.id);

  return (
    <AppShell user={user} title="我的作品">
      <main className="worksLibraryPage">
        <section className="worksLibraryHero">
          <div>
            <p className="eyebrow">作品库</p>
            <h2>我的作品</h2>
            <p>所有已生成 Demo 的项目会沉到这里，方便回放、复查贡献链路和继续分发。</p>
          </div>
          <div className="worksHeroStats">
            <span>{works.length} 个可回放项目</span>
          </div>
        </section>

        <Panel className="studioPanel worksTablePanel" aria-labelledby="works-table-title">
          <div className="studioPanelHeader">
            <div>
              <p className="eyebrow">Playable Projects</p>
              <h3 id="works-table-title">作品列表</h3>
            </div>
            <StatusBadge label="按最近更新排序" tone="muted" />
          </div>

          {works.length === 0 ? (
            <p className="emptyStateText">还没有可播放作品。先在创作台完成作词、作曲、编曲、选声和制作，再生成 Demo。</p>
          ) : (
            <div className="worksTable" role="list">
              {works.map((work) => {
                const latestGeneration = work.generations[0] ?? null;
                return (
                  <article className="worksRow" key={work.id} role="listitem">
                    <div className="worksRowTitle">
                      <strong>{work.title}</strong>
                      <small>
                        {work.genre} / {work.mood}
                      </small>
                    </div>
                    <div className="worksRowMeta">
                      <StatusBadge
                        label={projectStatusLabels[work.status] ?? work.status}
                        tone={statusTone[work.status] ?? "muted"}
                      />
                      <StatusBadge
                        label={generationStatusLabels[latestGeneration?.status ?? "draft"] ?? latestGeneration?.status ?? "待生成"}
                        tone={statusTone[latestGeneration?.status ?? "draft"] ?? "muted"}
                      />
                    </div>
                    <div className="worksRowActions">
                      <Button className="worksRowLink" href={`/works/${work.id}`} variant="secondary">
                        查看详情
                      </Button>
                      <Button className="worksRowLink" href={`/studio/projects/${work.id}`}>
                        编辑作品
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Panel>
      </main>
    </AppShell>
  );
}
