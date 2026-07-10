import { PRODUCTION_STEPS, type ProductionStepType } from "@musegrid/core";
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
import { MailShareButton, ShareButton, WeiboShareButton } from "./share-button";

type WorkDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

const stepLabelMap = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  voice: "选声",
  production: "制作",
} satisfies Record<ProductionStepType, string>;

const musicalKeys = ["C Major", "A Minor", "G Major", "D Minor", "E Minor"] as const;

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

function stableNumber(seed: string, modulo: number) {
  let value = 0;
  for (const char of seed) {
    value = (value * 31 + char.charCodeAt(0)) % modulo;
  }
  return value;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  })
    .format(value)
    .replaceAll("/", "-");
}

function formatDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) {
    return "--:--";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function buildTrend(seed: string, baseline: number, spread: number) {
  return Array.from({ length: 7 }, (_, index) => {
    const jitter = stableNumber(`${seed}:${index}`, spread);
    return baseline + index * 2 + jitter;
  });
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
    listSeededAvatars("voice"),
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
  const contributionCount = work.contributions.length;
  const lyricsStep = work.steps.find((step) => step.stepType === "lyrics");
  const compositionStep = work.steps.find((step) => step.stepType === "composition");
  const arrangementStep = work.steps.find((step) => step.stepType === "arrangement");
  const voiceStep = work.steps.find((step) => step.stepType === "voice");
  const productionStep = work.steps.find((step) => step.stepType === "production");

  const compositionOutput = asRecord(compositionStep?.outputPayload);
  const arrangementOutput = asRecord(arrangementStep?.outputPayload);
  const voiceOutput = asRecord(voiceStep?.outputPayload);
  const productionOutput = asRecord(productionStep?.outputPayload);
  const lyricsOutput = asRecord(lyricsStep?.outputPayload);

  const lyricsText = productionOutput?.lyrics ?? lyricsOutput?.lyrics ?? lyricsOutput?.fullLyricDraft ?? null;
  const generatedPromptSummary = stringifyValue(productionOutput?.finalPrompt ?? productionOutput?.promptSummary);
  const promptSummary =
    latestPlayableGeneration?.prompt ??
    (generatedPromptSummary || `${work.language} / ${work.genre} / ${work.mood} / ${work.intendedUse}`);

  const tempoLabel = stringifyValue(compositionOutput?.tempo) || "92 BPM";
  const structureLabel = stringifyValue(compositionOutput?.structure) || "Intro - Verse - Chorus - Bridge - Outro";
  const voiceTypeLabel = stringifyValue(voiceOutput?.voiceType) || "清晰主唱声线";
  const vocalToneLabel = stringifyValue(productionOutput?.vocalTone) || "近距离干声";
  const soundTextureLabel = stringifyValue(arrangementOutput?.soundTexture) || `${work.mood}、可继续制作的空间氛围`;
  const keyLabel = musicalKeys[stableNumber(`${work.id}:key`, musicalKeys.length)];
  const runtimeLabel = formatDuration(latestPlayableGeneration?.audioAsset?.duration ?? null);
  const completedMetaLabel = latestPlayableGeneration ? "完成时间" : "最近更新";
  const completedAtLabel = formatDateTime(latestPlayableGeneration?.createdAt ?? work.updatedAt);
  const metricsUpdatedAtLabel = formatDateTime(work.updatedAt);
  const providerLabel = latestPlayableGeneration?.provider ?? "sample";
  const coverGlyphs = Array.from(work.title.trim().slice(0, 6) || "MuseGrid");

  const estimatedPlays = 12480 + stableNumber(`${work.id}:plays`, 1200);
  const estimatedShares = 1280 + stableNumber(`${work.id}:shares`, 240);
  const estimatedRemixes = 180 + confirmedSteps * 8 + stableNumber(`${work.id}:remixes`, 40);
  const estimatedRevenueValue = 168.75 + confirmedSteps * 3.4 + contributionCount * 0.85;

  const metrics = [
    {
      label: "播放",
      value: new Intl.NumberFormat("zh-CN").format(estimatedPlays),
      deltaLabel: `较前 7 日 +${31 + stableNumber(`${work.id}:plays-growth`, 9)}%`,
      trend: buildTrend(`${work.id}:plays`, 16, 9),
    },
    {
      label: "分享",
      value: new Intl.NumberFormat("zh-CN").format(estimatedShares),
      deltaLabel: `较前 7 日 +${24 + stableNumber(`${work.id}:shares-growth`, 8)}%`,
      trend: buildTrend(`${work.id}:shares`, 12, 7),
    },
    {
      label: "二创",
      value: new Intl.NumberFormat("zh-CN").format(estimatedRemixes),
      deltaLabel: `较前 7 日 +${58 + stableNumber(`${work.id}:remixes-growth`, 10)}%`,
      trend: buildTrend(`${work.id}:remixes`, 8, 11),
    },
  ];

  const lyricsDownloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(
    stringifyValue(lyricsText) || "当前作品尚未记录歌词正文。",
  )}`;
  const promptDownloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(promptSummary)}`;
  return (
    <AppShell user={user} title="作品结果">
      <main className="workDetailPage">
        <section className="workStageHero" aria-labelledby="work-stage-title">
          <div className="workCoverCard">
            <div className="workCoverArtwork" aria-hidden="true">
              <div className="workCoverRain" />
              <div className="workCoverTitleStack">
                {coverGlyphs.map((glyph, index) => (
                  <span key={`${glyph}-${index}`}>{glyph}</span>
                ))}
              </div>
              <div className="workCoverFootnote">
                <span>{user.name}</span>
                <strong>{work.mood}</strong>
              </div>
            </div>

            <div className="workCoverMeta">
              <small>我的作品 · {providerLabel} Demo</small>
              <strong>{work.title}</strong>
              <span>{work.genre} / {work.mood}</span>
            </div>
          </div>

          <Panel className="studioPanel workSpotlightPanel" tone="hero">
            <div className="workSpotlightTopbar">
              <div>
                <p className="eyebrow">作品舞台</p>
                <h2 id="work-stage-title">作品舞台</h2>
              </div>
              <StatusBadge label={latestPlayableGeneration ? "已完成" : "生成中"} tone={latestPlayableGeneration ? "success" : "warning"} />
            </div>

            <div className="workSpotlightHeading">
              <h3>{work.title}</h3>
              <p>{work.initialIdea}</p>
            </div>

            <div className="workSpotlightChips">
              <span>{work.language}</span>
              <span>{work.genre}</span>
              <span>{work.mood}</span>
              <span>{work.intendedUse}</span>
              <span>{tempoLabel}</span>
              <span>{keyLabel}</span>
              <span>4/4</span>
            </div>

            <div className="workSpotlightStats">
              <article>
                <small>{completedMetaLabel}</small>
                <strong>{completedAtLabel}</strong>
              </article>
              <article>
                <small>声音方向</small>
                <strong>{voiceTypeLabel}</strong>
              </article>
              <article>
                <small>时长</small>
                <strong>{runtimeLabel}</strong>
              </article>
            </div>

            <div className="workSpotlightNotes">
              <div>
                <small>段落结构</small>
                <p>{structureLabel}</p>
              </div>
              <div>
                <small>制作方向</small>
                <p>{vocalToneLabel}</p>
              </div>
              <div>
                <small>空间质感</small>
                <p>{soundTextureLabel}</p>
              </div>
            </div>

            <div className="workHeroActions">
              <StatusBadge label={providerLabel} tone="success" />
              <Button href={`/studio/projects/${work.id}`}>编辑作品</Button>
              {latestPlayableGeneration?.audioAsset?.storageUrl ? (
                <Button href={`/api/v1/projects/${work.id}/download-audio`} variant="secondary">
                  下载 MP3
                </Button>
              ) : null}
            </div>
          </Panel>
        </section>

        <section className="workDetailGrid">
          <div className="workPrimaryColumn">
            {latestPlayableGeneration?.audioAsset?.storageUrl ? (
              <WaveformPlayer
                durationSeconds={latestPlayableGeneration.audioAsset.duration ?? null}
                dockSubtitle={`${user.name} · ${providerLabel} Demo`}
                dockTitle={work.title}
                src={latestPlayableGeneration.audioAsset.storageUrl}
                title="作品主播放器"
              />
            ) : (
              <Panel className="studioPanel">
                <p className="emptyStateText">当前作品还没有可播放音频。</p>
              </Panel>
            )}

            <div className="workInsightGrid">
              <Panel className="studioPanel workSummaryPanel" aria-labelledby="prompt-summary-title">
                <div className="studioPanelHeader">
                  <div>
                    <p className="eyebrow">提示词摘要</p>
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
                    <p className="eyebrow">歌词</p>
                    <h3 id="lyrics-title">歌词</h3>
                  </div>
                  <StatusBadge label={stepLabelMap.lyrics} />
                </div>
                <pre className="lyricsBody">{stringifyValue(lyricsText) || "当前作品尚未记录歌词正文。"}</pre>
              </Panel>
            </div>
          </div>

          <aside className="workSidebarColumn">
            <SevenDayMetrics metrics={metrics} updatedAtLabel={metricsUpdatedAtLabel} />

            <ContributionChain
              avatarsById={avatarsById}
              contributions={work.contributions.map((contribution) => ({
                ...contribution,
                stepType: contribution.stepType as ProductionStepType,
                createdAt: contribution.createdAt.toISOString(),
              }))}
              hideSelectedAvatar
              progressLabel={`${work.contributions.length}/${PRODUCTION_STEPS.length} 已确认`}
            />

            <RevenueSimulation
              avatarSharePercent={25}
              creatorSharePercent={65}
              estimatedPlays={estimatedPlays}
              estimatedRemixes={estimatedRemixes}
              estimatedRevenueValue={estimatedRevenueValue}
            />

            <Panel className="studioPanel quickSharePanel" aria-labelledby="quick-share-title">
              <div className="studioPanelHeader">
                <div>
                  <p className="eyebrow">快捷分享</p>
                  <h3 id="quick-share-title">快送分享</h3>
                </div>
              </div>

              <div className="quickShareGrid">
                <ShareButton />
                <MailShareButton description={work.initialIdea} title={work.title} />
                <WeiboShareButton description={work.initialIdea} title={work.title} />
                <button type="button" className="mgButton mgButton--secondary" disabled>
                  保存封面
                </button>
              </div>
            </Panel>

            <Panel className="studioPanel downloadPanel" aria-labelledby="download-panel-title">
              <div className="studioPanelHeader">
                <div>
                  <p className="eyebrow">导出</p>
                  <h3 id="download-panel-title">导出与下载</h3>
                </div>
              </div>

              <div className="downloadGrid">
                {latestPlayableGeneration?.audioAsset?.storageUrl ? (
                  <Button href={`/api/v1/projects/${work.id}/download-audio`} variant="secondary">
                    下载音频 MP3
                  </Button>
                ) : (
                  <button type="button" className="mgButton mgButton--secondary" disabled>
                    下载音频 MP3
                  </button>
                )}
                <button type="button" className="mgButton mgButton--secondary" disabled>
                  下载无损 WAV
                </button>
                <Button download={`${work.title}-lyrics.txt`} href={lyricsDownloadHref} variant="secondary">
                  导出歌词 TXT
                </Button>
                <Button download={`${work.title}-prompt.txt`} href={promptDownloadHref} variant="secondary">
                  导出提示词
                </Button>
              </div>
            </Panel>
          </aside>
        </section>

      </main>
    </AppShell>
  );
}
