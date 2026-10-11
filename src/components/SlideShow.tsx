import { ChevronLeft, ChevronRight, ExternalLink, Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { MediaItem } from "../data/portfolio";
import { BlockReveal } from "./BlockReveal";
import { Media } from "./Media";

export interface Slide {
  /** null shows a labeled "not posted yet" frame (the pulse jet video slot before a video exists). */
  media: MediaItem | null;
  title: string;
  text?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One photo at a time with its explanation underneath. Swipe or scroll sideways, use the arrows, the arrow
 * keys or the numbered tabs. Each slide is its own scroll trigger, so its blocks sweep away again every time
 * it comes into view. Images open full size in a native modal dialog.
 */
export function SlideShow({ slides, title }: { slides: Slide[]; title: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const [viewing, setViewing] = useState<number | null>(null);
  const viewed = viewing === null ? null : slides[viewing].media;

  const goTo = (index: number) => {
    const track = trackRef.current;
    const slide = track?.children[Math.max(0, Math.min(index, slides.length - 1))] as HTMLElement | undefined;
    if (track && slide) track.scrollTo({ left: slide.offsetLeft - track.offsetLeft });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const offsets = [...track.children].map((child) => Math.abs((child as HTMLElement).offsetLeft - track.offsetLeft - track.scrollLeft));
      setActive(offsets.indexOf(Math.min(...offsets)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (viewed && !dialog.open) dialog.showModal();
    if (!viewed && dialog.open) dialog.close();
  }, [viewed]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") goTo(active + 1);
    else if (event.key === "ArrowLeft") goTo(active - 1);
    else return;
    event.preventDefault();
  };

  return (
    <section className="slideshow" aria-roledescription="carousel" aria-label={`${title} photos`}>
      <div className="slideshow-bar">
        <p className="slideshow-count" aria-live="polite">
          <span className="sr-only">Slide </span>
          {pad(active + 1)} <span aria-hidden="true">/</span>
          <span className="sr-only"> of </span> {pad(slides.length)}
        </p>
        <div className="slideshow-arrows">
          <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous slide">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => goTo(active + 1)} disabled={active === slides.length - 1} aria-label="Next slide">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <ol className="slideshow-tabs">
        {slides.map((slide, index) => (
          <li key={`${slide.title}-tab`}>
            <button
              type="button"
              onClick={() => goTo(index)}
              aria-current={index === active ? "true" : undefined}
            >
              <span className="slideshow-tab-number">{pad(index + 1)}</span>
              <span className="slideshow-tab-title">{slide.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="slideshow-track" ref={trackRef} tabIndex={0} onKeyDown={onKeyDown} aria-label="Slides. Use the arrow keys to move.">
        {slides.map((slide, index) => (
          <figure
            className="slide"
            key={`${slide.title}-${index}`}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
            data-reveal="slide"
          >
            <div className="slide-frame plot-frame">
              {slide.media === null ? (
                <div className="video-placeholder">
                  <svg className="video-placeholder-icon" viewBox="0 0 48 48" aria-hidden="true">
                    <rect x="1" y="1" width="46" height="46" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M19 15 L34 24 L19 33 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <p className="video-placeholder-title">Video not posted yet</p>
                  <p className="video-placeholder-text">A test run video will be added here.</p>
                </div>
              ) : slide.media.type === "image" ? (
                <button className="slide-zoom" type="button" onClick={() => setViewing(index)} aria-label={`Enlarge: ${slide.title}`}>
                  <Media media={slide.media} fit="contain" sizes="(min-width: 1300px) 1240px, 100vw" />
                  <span className="figure-zoom-hint" aria-hidden="true">
                    <Maximize2 size={14} /> Enlarge
                  </span>
                </button>
              ) : (
                <Media media={slide.media} fit="contain" />
              )}
              <BlockReveal />
            </div>
            <figcaption className="slide-caption">
              <span className="slide-number r-pop">{pad(index + 1)}</span>
              <div>
                <h2 className="slide-title r-fade">{slide.title}</h2>
                {slide.text && <p className="slide-text r-fade">{slide.text}</p>}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>


      <dialog
        ref={dialogRef}
        className="viewer"
        aria-labelledby="viewer-title"
        onClose={() => setViewing(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        {viewed && viewing !== null && (
          <div className="viewer-inner">
            <div className="viewer-bar">
              <p id="viewer-title">
                <span className="figure-number">{pad(viewing + 1)}</span> {slides[viewing].title}
              </p>
              <a href={viewed.src} target="_blank" rel="noopener">
                Open file <ExternalLink size={14} aria-hidden="true" />
              </a>
              <button type="button" onClick={() => dialogRef.current?.close()} autoFocus>
                <X size={18} aria-hidden="true" />
                Close
              </button>
            </div>
            <div className="viewer-stage" onClick={(event) => event.target === event.currentTarget && dialogRef.current?.close()}>
              <img src={viewed.src} alt={viewed.alt} width={viewed.width} height={viewed.height} decoding="async" />
            </div>
            {slides[viewing].text && <p className="viewer-caption">{slides[viewing].text}</p>}
          </div>
        )}
      </dialog>
    </section>
  );
}
