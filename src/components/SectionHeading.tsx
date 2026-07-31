interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeading({ index, eyebrow, title, description }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <div className="section-heading-index">{index}</div>
      <div className="section-heading-title">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {description && <p className="section-heading-description">{description}</p>}
    </header>
  );
}
