import { AppShell } from "../../components/app-shell/AppShell";
import { requireUser } from "../../lib/auth/session";

export default async function StudioPage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <main className="studioHome">
        <section className="studioIntro">
          <p>从一个创作想法开始，后续任务会在这里接入项目创建流程。</p>
        </section>
      </main>
    </AppShell>
  );
}
