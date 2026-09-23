import { useReducedMotion } from "framer-motion";
import { Box, FileText, Image, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "../data/portfolio";

interface ProjectMediaProps {
  media: MediaItem;
  className?: string;
  eager?: boolean;
  /** Shows a pause/play button on looping videos. Omit inside links, where a nested button is invalid. */
  motionControl?: boolean;
}

const icons = {
  image: Image,
  video: Play,
  youtube: Play,
  vimeo: Play,
  cad: Box,
  pdf: FileText,
};

function MediaFallback({ media }: { media: MediaItem }) {
  const Icon = icons[media.type];
  return (
    <div className="media-fallback" role="img" aria-label={media.alt}>
      <div>
        <Icon aria-hidden="true" size={21} />
        <p>{media.label}</p>
        <span>{media.caption ?? "Project media pending"}</span>
      </div>
    </div>
  );
}

export function ProjectMedia({ media, className = "", eager = false, motionControl = false }: ProjectMediaProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? Boolean(reduceMotion);
  const aspect = media.aspect ?? "landscape";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || media.type !== "video" || media.playback !== "loop") return;

    if (paused) {
      video.pause();
      return;
    }

    const playVideo = () => {
      void video.play().catch(() => undefined);
    };

    if (!("IntersectionObserver" in window)) {
      playVideo();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) playVideo();
        else video.pause();
      },
      { threshold: 0.1 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [media.playback, media.src, media.type, paused]);

  if (media.type === "pdf") {
    return (
      <a className={`media-shell media-${aspect} group ${className}`} href={media.src} target="_blank" rel="noreferrer">
        <MediaFallback media={media} />
      </a>
    );
  }

  if ((media.type === "youtube" || media.type === "vimeo") && media.src.startsWith("https://")) {
    return (
      <div className={`media-shell media-${aspect} ${className}`}>
        <iframe
          className="absolute inset-0 size-full"
          src={media.src}
          title={media.alt}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (media.type === "video") {
    const isLoopingCover = media.playback === "loop";

    return (
      <figure className={`media-shell media-${aspect} ${isLoopingCover ? "media-looping-cover" : ""} ${media.fit === "contain" ? "media-uncropped" : ""} ${className}`}>
        {!loaded && <MediaFallback media={media} />}
        {!failed && (
          <video
            ref={videoRef}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{
              objectFit: media.fit ?? "cover",
              objectPosition: media.objectPosition ?? "50% 50%",
            }}
            autoPlay={isLoopingCover && !paused}
            controls={!isLoopingCover}
            disablePictureInPicture={isLoopingCover}
            disableRemotePlayback={isLoopingCover}
            loop={isLoopingCover}
            muted
            playsInline
            tabIndex={isLoopingCover ? -1 : undefined}
            preload={isLoopingCover ? "auto" : "metadata"}
            poster={media.poster}
            onCanPlay={(event) => {
              setLoaded(true);
              if (isLoopingCover && !paused) void event.currentTarget.play().catch(() => undefined);
            }}
            onError={() => setFailed(true)}
            aria-label={media.alt}
          >
            <source src={media.src} />
            Your browser does not support embedded video. <a href={media.src}>Download the video</a>.
          </video>
        )}
        {loaded && isLoopingCover && media.caption && media.captionPlacement !== "below" && (
          <figcaption className="absolute inset-x-3 bottom-3 rounded-md bg-ink/80 px-3 py-2 text-xs text-white/75 backdrop-blur">
            {media.caption}
          </figcaption>
        )}
        {isLoopingCover && motionControl && (
          <button
            className="media-motion-toggle"
            type="button"
            onClick={() => setUserPaused(!paused)}
            aria-label={paused ? "Play animation" : "Pause animation"}
          >
            {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
          </button>
        )}
      </figure>
    );
  }

  return (
    <figure className={`media-shell media-${aspect} ${media.fit === "contain" ? "media-uncropped" : ""} ${className}`}>
      {!loaded && <MediaFallback media={media} />}
      {!failed && (
        <>
          {media.fit === "contain" && (
            <img
              className="media-contain-backdrop"
              src={media.src}
              alt=""
              aria-hidden="true"
              loading={eager ? "eager" : "lazy"}
            />
          )}
          <img
            className={`absolute inset-0 size-full object-cover transition duration-700 ${loaded ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"}`}
            style={{
              objectFit: media.fit ?? "cover",
              objectPosition: media.objectPosition ?? "50% 50%",
            }}
            src={media.src}
            alt={media.alt}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </>
      )}
      {loaded && media.caption && media.captionPlacement !== "below" && <figcaption className="absolute inset-x-3 bottom-3 rounded-md bg-ink/80 px-3 py-2 text-xs text-white/75 backdrop-blur">{media.caption}</figcaption>}
    </figure>
  );
}
