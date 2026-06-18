import { AppShell } from "../../../../components/app-shell/AppShell";
import { requireUser } from "../../../../lib/auth/session";
import { getProject } from "../../../../lib/repositories/projects";

type ProjectPlaceholderPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPlaceholderPage({ params }: ProjectPlaceholderPageProps) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await getProject(projectId, user.id);

  return (
    <AppShell user={user}>
      <main className="projectPlaceholder">
        <p className="eyebrow">Project</p>
        <h2>{project?.title ?? "项目不存在"}</h2>
      </main>
    </AppShell>
  );
}
