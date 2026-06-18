import { AppShell } from "../../components/app-shell/AppShell";
import { CreatorOnboardingFlow } from "../../components/creator-onboarding/CreatorOnboardingFlow";
import { requireUser } from "../../lib/auth/session";

export default async function BecomeCreatorPage() {
  const user = await requireUser();

  return (
    <AppShell user={user} title="成为创作人">
      <CreatorOnboardingFlow />
    </AppShell>
  );
}
