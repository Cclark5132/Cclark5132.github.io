import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { noteItems, search } from "../lib/search";
import { useProgress } from "../lib/store";

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const progress = useProgress();
  const results = useMemo(() => search(query, 30, noteItems(progress.notes)), [query, progress.notes]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Search">
        <input
          ref={inputRef}
          className="input"
          type="search"
          placeholder="Search lessons, glossary, flashcards, weeks…"
          value={query}
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `sr-${active}` : undefined}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
            else if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((i) => Math.min(i + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (event.key === "Enter" && results[active]) go(results[active].item.to);
          }}
        />
        <ul className="dialog-results" id="search-results" role="listbox">
          {query && results.length === 0 && <li style={{ padding: 14, color: "var(--muted)" }}>No matches.</li>}
          {!query && <li style={{ padding: 14, color: "var(--muted)" }}>Try "knockdown", "von Mises", "Week 7" or "datum".</li>}
          {results.map(({ item, snippet }, i) => (
            <li key={item.to + item.title} role="option" aria-selected={i === active} id={`sr-${i}`}>
              <a
                href={`#${item.to}`}
                aria-selected={i === active}
                onClick={(event) => {
                  event.preventDefault();
                  go(item.to);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span>{item.title}</span>
                <small>
                  {item.section} · {snippet}
                </small>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
