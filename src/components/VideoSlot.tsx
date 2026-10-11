import type { MediaItem } from "../data/portfolio";
import { Media } from "./Media";

interface VideoSlotProps {
  label: string;
  media: MediaItem | null;
  figureNumber: number;
}

/**
 * Reserved 16:9 slot for a test video. With no media in portfolio.ts it shows a labeled placeholder;
 * once a file, YouTube id or Vimeo id is added there, the player appears in the same frame.
 */
export function VideoSlot({ label, media, figureNumber }: VideoSlotProps) {
  return (
    <section className="video-slot" aria-labelledby="video-slot-title">
      <div className="video-slot-bar">
        <h2 id="video-slot-title">{label}</h2>
        <span>{media ? `Fig. ${figureNumber}` : "Pending"}</span>
      </div>
      <div className="video-slot-frame">
        {media ? (
          <Media media={media} fit="contain" />
        ) : (
          <div className="video-placeholder">
            <svg className="video-placeholder-icon" viewBox="0 0 48 48" aria-hidden="true">
              <rect x="1" y="1" width="46" height="46" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M19 15 L34 24 L19 33 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <p className="video-placeholder-title">Video not posted yet</p>
            <p className="video-placeholder-text">A test run video will be added here.</p>
          </div>
        )}
      </div>
      {media?.caption && <p className="video-slot-caption">{media.caption}</p>}
    </section>
  );
}
