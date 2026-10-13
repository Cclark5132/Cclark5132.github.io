interface SectionHeadProps {
  number: string;
  title: string;
  id: string;
  aside?: string;
  className?: string;
}

/** Numbered section heading. On scroll-in the rule draws across and the title fades up. */
export function SectionHead({ number, title, id, aside, className = "" }: SectionHeadProps) {
  return (
    <div className={`section-head ${className}`} data-reveal="head">
      <span className="section-rule r-draw" aria-hidden="true" />
      {number && (
        <span className="section-number r-fade" aria-hidden="true">
          {number}
        </span>
      )}
      <h2 id={id} className="r-fade">
        {title}
      </h2>
      {aside && <p className="section-aside r-fade">{aside}</p>}
    </div>
  );
}
