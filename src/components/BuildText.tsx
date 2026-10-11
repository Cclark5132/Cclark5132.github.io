import { Fragment, type CSSProperties } from "react";

/**
 * Splits a heading into letters that rise into place one after another. Each word clips its letters at its
 * own bottom edge, so wrapped headings build line by line. The letters are hidden from assistive technology;
 * the heading that uses this sets `aria-label` to the full text.
 */
export function BuildText({ text }: { text: string }) {
  let letter = 0;
  return (
    <span className="build-text" aria-hidden="true">
      {text.split(" ").map((word, wordIndex) => (
        <Fragment key={wordIndex}>
          {wordIndex > 0 && " "}
          <span className="build-word">
            {[...word].map((character, characterIndex) => (
              <span className="build-char" style={{ "--c": letter++ } as CSSProperties} key={characterIndex}>
                {character}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
