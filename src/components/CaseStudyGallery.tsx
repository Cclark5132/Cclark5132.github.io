import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MediaItem } from "../data/portfolio";
import { ProjectMedia } from "./ProjectMedia";

interface CaseStudyGalleryProps {
  media: MediaItem[];
  title: string;
}

export function CaseStudyGallery({ media, title }: CaseStudyGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const slides = media.slice(0, 5);

  const goToSlide = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    const track = trackRef.current;
    const slide = track?.children.item(nextIndex) as HTMLElement | null;
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActiveIndex(nextIndex);
  };

  const updateActiveSlide = () => {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.clientWidth;
    if (!slideWidth) return;
    setActiveIndex(Math.max(0, Math.min(Math.round(track.scrollLeft / slideWidth), slides.length - 1)));
  };

  const openLightbox = (index: number, trigger: HTMLButtonElement) => {
    lastFocusedRef.current = trigger;
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    window.requestAnimationFrame(() => lastFocusedRef.current?.focus());
  };

  const moveLightbox = (direction: -1 | 1) => {
    setLightboxIndex((currentIndex) => {
      if (currentIndex === null) return null;
      return (currentIndex + direction + slides.length) % slides.length;
    });
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") moveLightbox(-1);
      if (event.key === "ArrowRight") moveLightbox(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex]);

  const lightboxMedia = lightboxIndex === null ? null : slides[lightboxIndex];

  return (
    <>
      <section className="case-study-gallery" aria-label={`${title} project gallery`}>
        <div className="gallery-heading">
          <div>
            <p className="technical-label text-orange">Project gallery</p>
            <h2>Scroll through the build.</h2>
          </div>
          <p>{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</p>
        </div>

        <div className="gallery-shell">
          <button
            className="gallery-arrow gallery-arrow-left"
            type="button"
            onClick={() => goToSlide(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous project image"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="case-study-gallery-track"
            ref={trackRef}
            onScroll={updateActiveSlide}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                goToSlide(activeIndex - 1);
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                goToSlide(activeIndex + 1);
              }
            }}
            tabIndex={0}
            aria-label="Project images. Scroll horizontally or use the arrow keys."
          >
            {slides.map((item, index) => (
              <div className="case-study-slide" key={`${item.src}-${index}`}>
                <ProjectMedia media={item} eager={index === 0} className="case-study-gallery-media" />
                <button
                  className="gallery-expand-trigger"
                  type="button"
                  onClick={(event) => openLightbox(index, event.currentTarget)}
                  aria-label={`Open ${item.label} full screen`}
                >
                  <span><Maximize2 size={17} /> Full screen</span>
                </button>
              </div>
            ))}
          </div>

          <button
            className="gallery-arrow gallery-arrow-right"
            type="button"
            onClick={() => goToSlide(activeIndex + 1)}
            disabled={activeIndex === slides.length - 1}
            aria-label="Next project image"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="gallery-dots" aria-label="Choose project image">
          {slides.map((item, index) => (
            <button
              className={activeIndex === index ? "gallery-dot gallery-dot-active" : "gallery-dot"}
              type="button"
              key={`${item.src}-dot-${index}`}
              onClick={() => goToSlide(index)}
              aria-label={`View image ${index + 1} of ${slides.length}`}
              aria-current={activeIndex === index ? "true" : undefined}
            />
          ))}
        </div>
      </section>

      {lightboxIndex !== null && lightboxMedia && createPortal(
        <div
          className="case-study-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-lightbox-title"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeLightbox();
          }}
        >
          <div className="lightbox-header">
            <div>
              <p className="technical-label text-orange">Full-screen gallery</p>
              <h2 id="case-study-lightbox-title">{title}</h2>
            </div>
            <div className="lightbox-header-actions">
              <span>{String(lightboxIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
              <button ref={closeButtonRef} type="button" onClick={closeLightbox} aria-label="Close full-screen gallery">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="lightbox-stage">
            {slides.length > 1 && (
              <button className="lightbox-arrow lightbox-arrow-left" type="button" onClick={() => moveLightbox(-1)} aria-label="Previous full-screen image">
                <ChevronLeft size={30} />
              </button>
            )}
            <ProjectMedia
              key={`${lightboxMedia.src}-${lightboxIndex}`}
              media={lightboxMedia}
              eager
              className="case-study-lightbox-media"
            />
            {slides.length > 1 && (
              <button className="lightbox-arrow lightbox-arrow-right" type="button" onClick={() => moveLightbox(1)} aria-label="Next full-screen image">
                <ChevronRight size={30} />
              </button>
            )}
          </div>

          <div className="lightbox-footer">
            <div>
              <strong>{lightboxMedia.label}</strong>
              {lightboxMedia.caption && <p>{lightboxMedia.caption}</p>}
            </div>
            <div className="lightbox-dots" aria-label="Choose full-screen image">
              {slides.map((item, index) => (
                <button
                  className={lightboxIndex === index ? "lightbox-dot lightbox-dot-active" : "lightbox-dot"}
                  type="button"
                  key={`${item.src}-lightbox-dot`}
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`View full-screen image ${index + 1} of ${slides.length}`}
                  aria-current={lightboxIndex === index ? "true" : undefined}
                />
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
