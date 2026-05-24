"use client";

import { useRef, useState } from "react";

export function BrandVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  async function handlePlay() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    try {
      await video.play();
      setIsPlaying(true);
      setHasStarted(true);
    } catch {
      setIsPlaying(false);
    }
  }

  function handleStop() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
    setHasStarted(false);
  }

  function handleMuteToggle() {
    const video = videoRef.current;
    const nextMuted = !isMuted;

    setIsMuted(nextMuted);

    if (video) {
      video.muted = nextMuted;
    }
  }

  function handleEnded() {
    const video = videoRef.current;

    if (video) {
      video.currentTime = 0;
    }

    setIsPlaying(false);
    setHasStarted(false);
  }

  return (
    <div className="brand-video-frame">
      <video
        ref={videoRef}
        className="brand-video"
        src="/videos/brand.mp4"
        poster="/videos/brand-poster.jpg"
        muted={isMuted}
        playsInline
        preload="metadata"
        aria-label="UFO Lab Tokyo brand video"
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      {!isPlaying ? (
        <button
          className="brand-video-play"
          type="button"
          aria-label="ブランド動画を再生"
          onClick={handlePlay}
        >
          <span aria-hidden="true" />
        </button>
      ) : null}
      {hasStarted ? (
        <div className="brand-video-controls" aria-label="動画コントロール">
          <button type="button" onClick={handleStop}>
            停止
          </button>
          <button
            type="button"
            aria-pressed={!isMuted}
            onClick={handleMuteToggle}
          >
            {isMuted ? "音声オン" : "ミュート"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
