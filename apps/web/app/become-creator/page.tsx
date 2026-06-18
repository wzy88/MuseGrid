import { AppShell } from "../../components/app-shell/AppShell";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { CreatorOnboardingFlow } from "../../components/creator-onboarding/CreatorOnboardingFlow";
import { requireUser } from "../../lib/auth/session";

export default async function BecomeCreatorPage() {
  const user = await requireUser();

  return (
    <AppShell user={user} title="成为创作人">
      <main className="creatorEntryPage">
        <section className="worksLibraryHero">
          <div>
            <p className="eyebrow">Creator Intake</p>
            <h2>成为创作人</h2>
            <p>先完成首轮建档，再把你的风格边界、样本与校准反馈交给系统，生成可持续升级的创作人分身。</p>
          </div>
          <div className="worksHeroStats" aria-label="creator onboarding summary">
            <StatusBadge label="4 步建档" tone="accent" />
            <StatusBadge label="待审核 Level 1" tone="warning" />
            <Button href="#creator-onboarding-title" variant="secondary">
              继续填写
            </Button>
          </div>
        </section>

        <CreatorOnboardingFlow />
      </main>
    </AppShell>
  );
}
