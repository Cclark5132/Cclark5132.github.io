import { FileText, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "../data/portfolio";
import { useReducedMotion } from "../lib/motion";

interface MediaProps {
  media: MediaItem;
  /** Loads immediately with high priority. Use only for the first large image on a page. */
  priority?: boolean;
  sizes?: string;
  /** Overrides `media.fit`. "cover" fills the frame; "contain" shows the whole image. */
  fit?: "cover" | "contain";
  className?: string;
}

export function Media({ media, priority = false, sizes, fit: fitProp, className = "" }: MediaProps) {
  const fit = fitProp ?? media.fit ?? "cover";
  if (media.type === "video") {
    return media.playback === "loop" ? (
      <LoopingVideo media={media} fit={fit} className={className} />
    ) : (
      <video
        className={`media-el media-${fit} ${className}`}
        controls
        playsInline
        preload="metadata"
        poster={media.poster}
        width={media.width}
        height={media.height}
        aria-label={media.alt}
      >
        <source src={media.src} />
        <a href={media.src}>Download the video</a>
      </video>
    );
  }

  if (media.type === "youtube" || media.type === "vimeo") {
    return <EmbeddedVideo media={media} className={className} />;
  }

  if (media.type === "pdf") {
    return (
      <a className={`media-pdf ${className}`} href={media.src} target="_blank" rel="noopener">
        <FileText aria-hidden="true" size={22} />
        <span>{media.label} (PDF)</span>
      </a>
    );
  }

  return (
    <img
      className={`media-el media-${fit} ${className}`}
      src={media.src}
      srcSet={media.srcSet}
      sizes={media.srcSet ? sizes : undefined}
      width={media.width}
      height={media.height}
      alt={media.alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      style={media.objectPosition || media.matte ? { objectPosition: media.objectPosition, backgroundColor: media.matte } : undefined}
    />
  );
}

/**
 * A short muted animation that plays only while on screen. It never autoplays under reduced motion, and the
 * pause button satisfies WCAG 2.2.2 for content that loops longer than five seconds.
 */
function LoopingVideo({ media, fit, className }: { media: MediaItem; fit: "cover" | "contain"; className: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const [choice, setChoice] = useState<"play" | "pause" | null>(null);
  const playing = (choice ?? (reduceMotion ? "pause" : "play")) === "play";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!playing) {
      video.pause();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [playing]);

  return (
    <div className={`media-loop ${className}`}>
      <video
        ref={videoRef}
        className={`media-el media-${fit}`}
        muted
        loop
        playsInline
        preload="none"
        poster={media.poster}
        width={media.width}
        height={media.height}
        aria-label={media.alt}
        disablePictureInPicture
      >
        <source src={media.src} type="video/mp4" />
      </video>
      <button
        className="media-toggle"
        type="button"
        onClick={() => setChoice(playing ? "pause" : "play")}
        aria-label={playing ? `Pause animation: ${media.label}` : `Play animation: ${media.label}`}
      >
        {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        <span aria-hidden="true">{playing ? "Pause" : "Play"}</span>
      </button>
    </div>
  );
}

const YOUTUBE_ID = /^[\w-]{11}$/;

/** Accepts a bare id or any common YouTube/Vimeo URL form. */
export function resolveEmbed(media: MediaItem) {
  const raw = media.src.trim();
  if (media.type === "youtube") {
    const id = YOUTUBE_ID.test(raw)
      ? raw
      : (/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/.exec(raw)?.[1] ?? null);
    if (!id) return null;
    return {
      player: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      thumbnail: media.poster ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  const id = /^\d+$/.test(raw) ? raw : (/vimeo\.com\/(?:video\/)?(\d+)/.exec(raw)?.[1] ?? null);
  if (!id) return null;
  return { player: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`, thumbnail: media.poster };
}

/** Shows a still and a play button, and loads the third-party player only after a click. */
function EmbeddedVideo({ media, className }: { media: MediaItem; className: string }) {
  const [active, setActive] = useState(false);
  const embed = resolveEmbed(media);

  if (!embed) {
    return <p className={`media-error ${className}`}>Video link could not be read: {media.src}</p>;
  }

  if (active) {
    return (
      <iframe
        className={`media-el media-embed ${className}`}
        src={embed.player}
        title={media.label}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button className={`media-facade ${className}`} type="button" onClick={() => setActive(true)} aria-label={`Play video: ${media.label}`}>
      {embed.thumbnail && <img className="media-el media-cover" src={embed.thumbnail} alt="" loading="lazy" decoding="async" />}
      <span className="media-facade-badge">
        <Play size={18} aria-hidden="true" /> Play video
      </span>
    </button>
  );
}
