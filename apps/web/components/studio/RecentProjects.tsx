import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

type RecentProject = {
  id: string;
  title: string;
  status: string;
  genre: string;
  mood: string;
  updatedAt: Date;
};

type RecentProjectsProps = {
  projects: RecentProject[];
};

const statusLabel: Record<string, string> = {
  draft: "草稿",
  ready: "就绪",
  generating: "生成中",
  completed: "已完成",
  failed: "需处理",
};

const statusTone: Record<string, "accent" | "success" | "warning" | "danger" | "muted"> = {
  draft: "muted",
  ready: "accent",
  generating: "warning",
  completed: "success",
  failed: "danger",
};

export function RecentProjects({ projects }: RecentProjectsProps) {
  return (
    <Panel className="recentProjects" aria-labelledby="recent-projects-title">
      <div className="panelHeader">
        <p className="eyebrow">Recent Projects</p>
        <h2 id="recent-projects-title">最近项目</h2>
      </div>
      {projects.length === 0 ? (
        <div className="emptyProjects">
          <strong>还没有项目</strong>
          <span>先让一个灵感进入 MuseGrid，后续 Demo、发布和分身成长会从这里接上。</span>
        </div>
      ) : (
        <div className="projectList">
          {projects.map((project) => (
            <a className="projectRow" href={`/studio/projects/${project.id}`} key={project.id}>
              <span>
                <strong>{project.title}</strong>
                <small>
                  {project.genre} / {project.mood}
                </small>
              </span>
              <StatusBadge
                className="projectStatus"
                label={statusLabel[project.status] ?? project.status}
                tone={statusTone[project.status] ?? "muted"}
              />
            </a>
          ))}
        </div>
      )}
    </Panel>
  );
}
