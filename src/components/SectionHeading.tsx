interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeading({ index, eyebrow, title, description }: SectionHeadingProps) {
  return (
    <header className="mb-10 grid gap-5 border-t border-line pt-5 md:mb-14 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)]">
      <div>
        <p className="technical-label mb-5 text-cyan">{index} / {eyebrow}</p>
        <h2 className="max-w-4xl text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl md:text-6xl">
          {title}
        </h2>
      </div>
      {description && <p className="self-end text-pretty text-base leading-7 text-steel md:text-lg">{description}</p>}
    </header>
  );
}
