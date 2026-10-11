interface SectionHeadProps {
  number: string;
  title: string;
  id: string;
  aside?: string;
}

export function SectionHead({ number, title, id, aside }: SectionHeadProps) {
  return (
    <div className="section-head" data-reveal>
      <span className="section-number" aria-hidden="true">
        {number}
      </span>
      <h2 id={id}>{title}</h2>
      {aside && <p className="section-aside">{aside}</p>}
    </div>
  );
}
