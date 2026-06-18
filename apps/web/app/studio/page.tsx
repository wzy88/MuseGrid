import { AppShell } from "../../components/app-shell/AppShell";
import { IndustryLoop } from "../../components/studio/IndustryLoop";
import { NewProjectPanel } from "../../components/studio/NewProjectPanel";
import { RecentProjects } from "../../components/studio/RecentProjects";
import { requireUser } from "../../lib/auth/session";
import { listProjects } from "../../lib/repositories/projects";

export default async function StudioPage() {
  const user = await requireUser();
  const projects = await listProjects(user.id);

  return (
    <AppShell user={user}>
      <main className="studioHome">
        <div className="studioGrid">
          <NewProjectPanel />
          <IndustryLoop />
        </div>
        <RecentProjects projects={projects} />
      </main>
    </AppShell>
  );
}
