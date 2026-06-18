"use client";

import { useMemo, useRef, useState } from "react";

type WaveformPlayerProps = {
  src: string;
  title?: string;
  durationSeconds?: number | null;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return "00:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function WaveformPlayer({ src, title = "Waveform Player", durationSeconds }: WaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [measuredDuration, setMeasuredDuration] = useState(durationSeconds ?? 0);

  const bars = useMemo(
    () => Array.from({ length: 32 }, (_, index) => 24 + ((index * 17) % 52)),
    [],
  );

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
    <section className="studioPanel waveformPlayerPanel" aria-label="Waveform Player">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">Playable Result</p>
          <h3>{title}</h3>
        </div>
        <span className="studioPill">{formatTime(duration)}</span>
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
    </section>
  );
}
