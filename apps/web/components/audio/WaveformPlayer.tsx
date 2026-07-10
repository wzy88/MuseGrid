"use client";

import { useMemo, useRef, useState } from "react";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

type WaveformPlayerProps = {
  src: string;
  title?: string;
  durationSeconds?: number | null;
  dockTitle?: string;
  dockSubtitle?: string;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return "00:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function WaveformPlayer({
  src,
  title = "作品播放器",
  durationSeconds,
  dockTitle,
  dockSubtitle,
}: WaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [measuredDuration, setMeasuredDuration] = useState(durationSeconds ?? 0);

  const bars = useMemo(
    () => Array.from({ length: 32 }, (_, index) => 24 + ((index * 17) % 52)),
    [],
  );
  const dockBars = useMemo(() => Array.from({ length: 18 }, (_, index) => 10 + ((index * 11) % 26)), []);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }

  function handleScrub(nextValue: string) {
    const audio = audioRef.current;
    const parsed = Number(nextValue);
    if (!audio || Number.isNaN(parsed)) {
      return;
    }

    audio.currentTime = parsed;
    setCurrentTime(parsed);
  }

  const duration = measuredDuration > 0 ? measuredDuration : durationSeconds ?? 0;
  const safeDuration = duration > 0 ? duration : Math.max(currentTime, durationSeconds ?? 0, 1);
  const progress = Math.min(currentTime / safeDuration, 1);

  return (
    <>
      <Panel className="studioPanel waveformPlayerPanel" aria-label="作品播放器">
        <div className="studioPanelHeader">
          <div>
            <p className="eyebrow">可播放结果</p>
            <h3>{title}</h3>
          </div>
          <StatusBadge label={formatTime(duration)} tone="muted" />
        </div>

        <audio
          ref={audioRef}
          aria-label="作品播放"
          controls
          className="waveformNativeAudio"
          src={src}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={(event) => setMeasuredDuration(event.currentTarget.duration || durationSeconds || 0)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        />

        <div className="waveformPlayerChrome">
          <button
            type="button"
            className="waveformToggleButton"
            onClick={() => {
              void togglePlayback();
            }}
            aria-label={isPlaying ? "暂停播放" : "开始播放"}
          >
            {isPlaying ? "暂停" : "播放"}
          </button>

          <div className="waveformBars" aria-hidden="true">
            {bars.map((height, index) => {
              const threshold = (index + 1) / bars.length;
              const isActive = progress >= threshold;
              return <span className={isActive ? "waveformBar active" : "waveformBar"} key={`${height}-${index}`} style={{ height }} />;
            })}
          </div>
        </div>

        <div className="waveformTimeline">
          <span>{formatTime(currentTime)}</span>
          <input
            aria-label="播放进度"
            className="waveformSlider"
            max={safeDuration}
            min={0}
            onChange={(event) => handleScrub(event.currentTarget.value)}
            step={0.1}
            type="range"
            value={Math.min(currentTime, safeDuration)}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </Panel>

      {dockTitle && dockSubtitle ? (
        <section className="workPlaybackDock" aria-label="底部播放控制条">
          <div className="workPlaybackDockMeta">
            <div className="workPlaybackDockArtwork" aria-hidden="true">
              <span>{dockTitle.slice(0, 1) || "M"}</span>
            </div>
            <div className="workPlaybackDockText">
              <strong>{dockTitle}</strong>
              <span>{dockSubtitle}</span>
            </div>
          </div>

          <div className="workPlaybackDockCenter">
            <div className="workPlaybackDockButtons">
              <button type="button" className="workPlaybackDockControl" aria-label="上一首" disabled>
                {"<"}
              </button>
              <button
                type="button"
                className="workPlaybackDockPlay"
                onClick={() => {
                  void togglePlayback();
                }}
                aria-label={isPlaying ? "暂停底部播放" : "开始底部播放"}
              >
                {isPlaying ? "暂停" : "播放"}
              </button>
              <button type="button" className="workPlaybackDockControl" aria-label="下一首" disabled>
                {">"}
              </button>
            </div>

            <div className="workPlaybackDockTimeline">
              <span>{formatTime(currentTime)}</span>
              <input
                aria-label="底部播放进度"
                className="workPlaybackDockSlider"
                max={safeDuration}
                min={0}
                onChange={(event) => handleScrub(event.currentTarget.value)}
                step={0.1}
                type="range"
                value={Math.min(currentTime, safeDuration)}
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="workPlaybackDockStatus" aria-hidden="true">
            <div className="workPlaybackDockBars">
              {dockBars.map((height, index) => {
                const threshold = (index + 1) / dockBars.length;
                const active = progress >= threshold;
                return <span className={active ? "active" : undefined} key={`${height}-${index}`} style={{ height }} />;
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
