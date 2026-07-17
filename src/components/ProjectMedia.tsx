import { Box, FileText, Image, Play, ScanLine } from "lucide-react";
import { useState } from "react";
import type { MediaItem } from "../data/portfolio";

interface ProjectMediaProps {
  media: MediaItem;
  className?: string;
  eager?: boolean;
}

const icons = {
  image: Image,
  video: Play,
  youtube: Play,
  vimeo: Play,
  cad: Box,
  pdf: FileText,
};

function Placeholder({ media }: { media: MediaItem }) {
  const Icon = icons[media.type];
  return (
    <div className="media-placeholder" role="img" aria-label={media.alt}>
      <div className="media-orbit" aria-hidden="true"><span /><span /></div>
      <div className="relative z-10 flex max-w-sm flex-col items-center text-center">
        <span className="mb-4 grid size-11 place-items-center rounded-full border border-cyan/35 bg-cyan/10 text-cyan">
          <Icon aria-hidden="true" size={19} />
        </span>
        <p className="text-sm font-semibold text-white">{media.label}</p>
        <p className="mt-2 text-xs leading-5 text-white/55">{media.caption ?? "Project media coming soon"}</p>
      </div>
      <ScanLine className="absolute bottom-4 right-4 text-cyan/35" size={18} aria-hidden="true" />
    </div>
  );
}

export function ProjectMedia({ media, className = "", eager = false }: ProjectMediaProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const aspect = media.aspect ?? "landscape";

  if (media.type === "pdf") {
    return (
      <a className={`media-shell media-${aspect} group ${className}`} href={media.src} target="_blank" rel="noreferrer">
        <Placeholder media={media} />
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
    return (
      <div className={`media-shell media-${aspect} ${className}`}>
        {!loaded && <Placeholder media={media} />}
        {!failed && (
          <video
            className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
            controls
            muted
            playsInline
            preload="metadata"
            poster={media.poster}
            onCanPlay={() => setLoaded(true)}
            onError={() => setFailed(true)}
            aria-label={media.alt}
          >
            <source src={media.src} />
            Your browser does not support embedded video. Add a transcript link in the project data.
          </video>
        )}
      </div>
    );
  }

  return (
    <figure className={`media-shell media-${aspect} ${className}`}>
      {!loaded && <Placeholder media={media} />}
      {!failed && (
        <img
          className={`absolute inset-0 size-full object-cover transition duration-700 ${loaded ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"}`}
          src={media.src}
          alt={media.alt}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {loaded && media.caption && <figcaption className="absolute inset-x-3 bottom-3 rounded-md bg-ink/80 px-3 py-2 text-xs text-white/75 backdrop-blur">{media.caption}</figcaption>}
    </figure>
  );
}
