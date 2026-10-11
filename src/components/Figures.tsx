import { ExternalLink, Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "../data/portfolio";
import { Media } from "./Media";

interface FiguresProps {
  figures: MediaItem[];
  /** Number of the first figure, so a video above the list can be Fig. 1. */
  start: number;
}

/** Numbered figures with captions. Images open full size in a native modal dialog. */
export function Figures({ figures, start }: FiguresProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = openIndex === null ? null : figures[openIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <ol className="figure-list">
        {figures.map((figure, index) => {
          const number = start + index;
          const portrait = (figure.height ?? 0) > (figure.width ?? 0);
          return (
            <li key={figure.src} data-reveal>
              <figure className={`figure ${portrait ? "figure-portrait" : ""}`}>
                <div className="figure-frame">
                  {figure.type === "image" ? (
                    <button
                      className="figure-zoom"
                      type="button"
                      onClick={() => setOpenIndex(index)}
                      aria-label={`Enlarge figure ${number}: ${figure.label}`}
                    >
                      <Media media={figure} fit="contain" sizes="(min-width: 1100px) 760px, 100vw" />
                      <span className="figure-zoom-hint" aria-hidden="true">
                        <Maximize2 size={14} /> Enlarge
                      </span>
                    </button>
                  ) : (
                    <Media media={figure} fit="contain" />
                  )}
                </div>
                <figcaption>
                  <span className="figure-number">Fig. {number}</span>
                  <span>{figure.caption ?? figure.label}</span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ol>

      <dialog
        ref={dialogRef}
        className="viewer"
        aria-labelledby="viewer-title"
        onClose={() => setOpenIndex(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        {open && openIndex !== null && (
          <div className="viewer-inner">
            <div className="viewer-bar">
              <p id="viewer-title">
                <span className="figure-number">Fig. {start + openIndex}</span> {open.label}
              </p>
              <a href={open.src} target="_blank" rel="noopener">
                Open file <ExternalLink size={14} aria-hidden="true" />
              </a>
              <button type="button" onClick={() => dialogRef.current?.close()} autoFocus>
                <X size={18} aria-hidden="true" />
                Close
              </button>
            </div>
            <div className="viewer-stage" onClick={(event) => event.target === event.currentTarget && dialogRef.current?.close()}>
              <img src={open.src} alt={open.alt} width={open.width} height={open.height} decoding="async" />
            </div>
            {open.caption && <p className="viewer-caption">{open.caption}</p>}
          </div>
        )}
      </dialog>
    </>
  );
}
