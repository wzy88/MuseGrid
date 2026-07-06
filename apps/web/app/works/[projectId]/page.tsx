import type { ProductionStepType } from "@musegrid/core";
import { AppShell } from "../../../components/app-shell/AppShell";
import { WaveformPlayer } from "../../../components/audio/WaveformPlayer";
import { ContributionChain } from "../../../components/contribution/ContributionChain";
import { RevenueSimulation } from "../../../components/contribution/RevenueSimulation";
import { SevenDayMetrics } from "../../../components/contribution/SevenDayMetrics";
import { Button } from "../../../components/ui/Button";
import { Panel } from "../../../components/ui/Panel";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { requireUser } from "../../../lib/auth/session";
import { listSeededAvatars } from "../../../lib/repositories/avatars";
import { getWorkDetail } from "../../../lib/repositories/projects";
import { ShareButton } from "./share-button";

type WorkDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

const stepLabelMap = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  production: "制作",
} satisfies Record<ProductionStepType, string>;

function stringifyValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string").join(" / ");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  return "";
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const user = await requireUser();
  const { projectId } = await params;
  const work = await getWorkDetail(projectId, user.id);

  if (!work) {
    return (
      <AppShell user={user} title="作品结果">
        <main className="projectPlaceholder">
          <p className="eyebrow">Work Detail</p>
          <h2>作品不存在</h2>
        </main>
      </AppShell>
    );
  }

  const latestPlayableGeneration = [...work.generations]
    .reverse()
    .find((generation) => generation.status === "completed" && generation.audioAsset?.storageUrl);

  const allAvatars = await Promise.all([
    listSeededAvatars("lyrics"),
    listSeededAvatars("composition"),
    listSeededAvatars("arrangement"),
    listSeededAvatars("production"),
  ]);

  const avatarsById = allAvatars.flat().reduce<
    Record<
      string,
      {
        id: string;
        avatarName: string;
        capabilityDirection: ProductionStepType;
        level: number;
        styleTags: string[];
        intro: string;
        sampleOutputs: Array<{ title?: string; excerpt?: string }>;
        simulatedCallCount: number;
        status: string;
      }
    >
  >((accumulator, avatar) => {
    accumulator[avatar.id] = {
      id: avatar.id,
      avatarName: avatar.avatarName,
      capabilityDirection: avatar.capabilityDirection as ProductionStepType,
      level: avatar.level,
      styleTags: Array.isArray(avatar.styleTags) ? avatar.styleTags.filter((item): item is string => typeof item === "string") : [],
      intro: avatar.intro,
      sampleOutputs: Array.isArray(avatar.sampleOutputs)
        ? avatar.sampleOutputs.map((sample) => (typeof sample === "object" && sample ? (sample as { title?: string; excerpt?: string }) : {}))
        : [],
      simulatedCallCount: avatar.simulatedCallCount,
      status: avatar.status,
    };
    return accumulator;
  }, {});

  const confirmedSteps = work.steps.filter((step) => step.status === "completed").length;
  const lyricsStep = work.steps.find((step) => step.stepType === "lyrics");
  const productionStep = work.steps.find((step) => step.stepType === "production");
  const productionOutput =
    productionStep?.outputPayload && typeof productionStep.outputPayload === "object" && !Array.isArray(productionStep.outputPayload)
      ? (productionStep.outputPayload as Record<string, unknown>)
      : null;
  const lyricsText =
    productionOutput?.lyrics ??
    (lyricsStep?.outputPayload && typeof lyricsStep.outputPayload === "object" && !Array.isArray(lyricsStep.outputPayload)
      ? (lyricsStep.outputPayload as Record<string, unknown>).lyrics
      : null);

  const generatedPromptSummary = stringifyValue(productionOutput?.finalPrompt ?? productionOutput?.promptSummary);
  const promptSummary =
    latestPlayableGeneration?.prompt ??
    (generatedPromptSummary || `${work.language} / ${work.genre} / ${work.mood} / ${work.intendedUse}`);

  return (
    <AppShell user={user} title="作品结果">
      <main className="workDetailPage">
        <section className="workDetailHero">
          <div>
            <p className="eyebrow">Playable Result</p>
            <h2>{work.title}</h2>
            <p>{work.initialIdea}</p>
          </div>
          <div className="workHeroActions">
            <StatusBadge label={latestPlayableGeneration?.provider ?? "sample"} tone="success" />
            {latestPlayableGeneration?.audioAsset?.storageUrl ? (
              <Button href={`/api/v1/projects/${work.id}/download-audio`} variant="secondary">
                下载 MP3
              </Button>
            ) : null}
            <ShareButton />
          </div>
        </section>

        <section className="workDetailGrid">
          <div className="workPrimaryColumn">
            {latestPlayableGeneration?.audioAsset?.storageUrl ? (
              <WaveformPlayer
                durationSeconds={latestPlayableGeneration.audioAsset.duration ?? null}
                src={latestPlayableGeneration.audioAsset.storageUrl}
                title="作品主播放器"
              />
            ) : (
              <Panel className="studioPanel">
                <p className="emptyStateText">当前作品还没有可播放音频。</p>
              </Panel>
            )}

            <Panel className="studioPanel workSummaryPanel" aria-labelledby="prompt-summary-title">
              <div className="studioPanelHeader">
                <div>
                  <p className="eyebrow">Prompt Summary</p>
                  <h3 id="prompt-summary-title">最终提示词摘要</h3>
                </div>
                <StatusBadge label={stepLabelMap.production} />
              </div>
              <p className="workSummaryText">{promptSummary}</p>
              <div className="workSummaryTags">
                <span>{work.language}</span>
                <span>{work.genre}</span>
                <span>{work.mood}</span>
                <span>{work.intendedUse}</span>
              </div>
            </Panel>

            <Panel className="studioPanel workLyricsPanel" aria-labelledby="lyrics-title">
              <div className="studioPanelHeader">
                <div>
                  <p className="eyebrow">Lyrics</p>
                  <h3 id="lyrics-title">歌词</h3>
                </div>
                <StatusBadge label={stepLabelMap.lyrics} />
              </div>
              <pre className="lyricsBody">{stringifyValue(lyricsText) || "当前作品尚未记录歌词正文。"}</pre>
            </Panel>
          </div>

          <div className="workSidebarColumn">
            <SevenDayMetrics
              confirmedSteps={confirmedSteps}
              contributionCount={work.contributions.length}
              latestGenerationState={latestPlayableGeneration?.status ?? "draft"}
            />
            <ContributionChain
              avatarsById={avatarsById}
              contributions={work.contributions.map((contribution) => ({
                ...contribution,
                stepType: contribution.stepType as ProductionStepType,
                createdAt: contribution.createdAt.toISOString(),
              }))}
              hideSelectedAvatar
              progressLabel={`${work.contributions.length}/4 已确认`}
            />
            <RevenueSimulation
              avatarSharePercent={28}
              creatorSharePercent={52}
              estimatedPlays={4800 + work.contributions.length * 320}
              estimatedRemixes={32 + confirmedSteps * 4}
            />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
