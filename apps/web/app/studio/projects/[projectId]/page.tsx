import type { ProductionStepType } from "@musegrid/core";
import { AppShell } from "../../../../components/app-shell/AppShell";
import { StudioProjectShell } from "../../../../components/studio/StudioProjectShell";
import { requireUser } from "../../../../lib/auth/session";
import { listSeededAvatars } from "../../../../lib/repositories/avatars";
import { getProject, listProjectGenerations } from "../../../../lib/repositories/projects";

type ProjectPlaceholderPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPlaceholderPage({ params }: ProjectPlaceholderPageProps) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await getProject(projectId, user.id);

  const generations = await listProjectGenerations(projectId, user.id);

  if (!project) {
    return (
      <AppShell user={user}>
        <main className="projectPlaceholder">
          <p className="eyebrow">Project</p>
          <h2>项目不存在</h2>
        </main>
      </AppShell>
    );
  }

  const [lyricsAvatars, compositionAvatars, arrangementAvatars, productionAvatars] = await Promise.all([
    listSeededAvatars("lyrics"),
    listSeededAvatars("composition"),
    listSeededAvatars("arrangement"),
    listSeededAvatars("production"),
  ]);

  const avatarsByStep = {
    lyrics: lyricsAvatars,
    composition: compositionAvatars,
    arrangement: arrangementAvatars,
    production: productionAvatars,
  } satisfies Record<ProductionStepType, typeof lyricsAvatars>;

  return (
    <AppShell user={user}>
      <StudioProjectShell
        project={{
          id: project.id,
          title: project.title,
          initialIdea: project.initialIdea,
          language: project.language,
          genre: project.genre,
          mood: project.mood,
          intendedUse: project.intendedUse,
        }}
        initialSteps={project.steps.map((step) => ({
          ...step,
          stepType: step.stepType as ProductionStepType,
        }))}
        initialContributions={project.contributions.map((contribution) => ({
          ...contribution,
          stepType: contribution.stepType as ProductionStepType,
          createdAt: contribution.createdAt.toISOString(),
        }))}
        initialGenerations={generations.map((generation) => ({
          id: generation.id,
          status: generation.status,
          provider: generation.provider,
          model: generation.model,
          createdAt: generation.createdAt.toISOString(),
          audioUrl: generation.audioAsset?.storageUrl ?? null,
          duration: generation.audioAsset?.duration ?? null,
        }))}
        avatarsByStep={{
          lyrics: avatarsByStep.lyrics.map((avatar) => ({
            ...avatar,
            capabilityDirection: avatar.capabilityDirection as ProductionStepType,
            styleTags: Array.isArray(avatar.styleTags) ? avatar.styleTags.filter((item): item is string => typeof item === "string") : [],
            sampleOutputs: Array.isArray(avatar.sampleOutputs)
              ? avatar.sampleOutputs.map((sample) => (typeof sample === "object" && sample ? sample as { title?: string; excerpt?: string } : {}))
              : [],
          })),
          composition: avatarsByStep.composition.map((avatar) => ({
            ...avatar,
            capabilityDirection: avatar.capabilityDirection as ProductionStepType,
            styleTags: Array.isArray(avatar.styleTags) ? avatar.styleTags.filter((item): item is string => typeof item === "string") : [],
            sampleOutputs: Array.isArray(avatar.sampleOutputs)
              ? avatar.sampleOutputs.map((sample) => (typeof sample === "object" && sample ? sample as { title?: string; excerpt?: string } : {}))
              : [],
          })),
          arrangement: avatarsByStep.arrangement.map((avatar) => ({
            ...avatar,
            capabilityDirection: avatar.capabilityDirection as ProductionStepType,
            styleTags: Array.isArray(avatar.styleTags) ? avatar.styleTags.filter((item): item is string => typeof item === "string") : [],
            sampleOutputs: Array.isArray(avatar.sampleOutputs)
              ? avatar.sampleOutputs.map((sample) => (typeof sample === "object" && sample ? sample as { title?: string; excerpt?: string } : {}))
              : [],
          })),
          production: avatarsByStep.production.map((avatar) => ({
            ...avatar,
            capabilityDirection: avatar.capabilityDirection as ProductionStepType,
            styleTags: Array.isArray(avatar.styleTags) ? avatar.styleTags.filter((item): item is string => typeof item === "string") : [],
            sampleOutputs: Array.isArray(avatar.sampleOutputs)
              ? avatar.sampleOutputs.map((sample) => (typeof sample === "object" && sample ? sample as { title?: string; excerpt?: string } : {}))
              : [],
          })),
        }}
      />
    </AppShell>
  );
}
