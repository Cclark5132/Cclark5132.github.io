import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import type { MediaItem } from "../data/portfolio";
import { ProjectMedia } from "./ProjectMedia";

interface CaseStudyGalleryProps {
  media: MediaItem[];
  title: string;
}

export function CaseStudyGallery({ media, title }: CaseStudyGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
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

  return (
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
  );
}
