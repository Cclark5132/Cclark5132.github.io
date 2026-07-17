interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeading({ index, eyebrow, title, description }: SectionHeadingProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-t-2 border-cyan pt-5 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="technical-label mb-3 text-orange">{index} / {eyebrow}</p>
        <h2 className="max-w-4xl text-balance text-3xl font-semibold tracking-[-0.045em] text-charcoal sm:text-4xl md:text-5xl">{title}</h2>
      </div>
      {description && <p className="max-w-md text-pretty text-base leading-7 text-steel">{description}</p>}
    </header>
  );
}
