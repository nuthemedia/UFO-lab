"use client";

import { useEffect, useRef } from "react";

type ClarkAmbientVideoProps = {
  src: string;
  srcMp4?: string;
  mobileSrc?: string;
  mobileSrcMp4?: string;
  poster?: string;
  className?: string;
  autoPauseOnHidden?: boolean;
  mode?: "ambient" | "full";
  onPlayStateChange?: (isPlaying: boolean) => void;
};

export function ClarkAmbientVideo({
  src,
  srcMp4,
  mobileSrc,
  mobileSrcMp4,
  poster,
  className,
  autoPauseOnHidden = false,
  mode = "ambient",
  onPlayStateChange,
}: ClarkAmbientVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !autoPauseOnHidden || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video) {
          return;
        }

        if (entry.isIntersecting) {
          void video.play().catch(() => {});
          return;
        }

        video.pause();
      },
      { threshold: 0.12 },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [autoPauseOnHidden]);

  return (
    <video
      ref={videoRef}
      autoPlay={mode === "ambient"}
      controls={mode === "full"}
      loop={mode === "ambient"}
      muted={mode === "ambient"}
      onPause={() => onPlayStateChange?.(false)}
      onPlay={() => onPlayStateChange?.(true)}
      playsInline
      poster={poster}
      preload="metadata"
      className={className}
    >
      {mobileSrcMp4 ? <source media="(max-width: 720px)" src={mobileSrcMp4} type="video/mp4" /> : null}
      {srcMp4 ? <source src={srcMp4} type="video/mp4" /> : null}
      {mobileSrc ? <source media="(max-width: 720px)" src={mobileSrc} type="video/quicktime" /> : null}
      <source src={src} type="video/quicktime" />
    </video>
  );
}
