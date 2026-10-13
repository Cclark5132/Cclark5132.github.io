import { useLayoutEffect, useRef, useState } from "react";
import { isInitialMount, isInViewport, motionAllowed } from "../lib/motion";

const NUMBER_PATTERN = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/;
const DURATION_MS = 950;

function parse(value: string) {
  const match = NUMBER_PATTERN.exec(value);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replaceAll(",", ""));
  if (!Number.isFinite(target) || target === 0) return null;
  const decimals = digits.split(".")[1]?.length ?? 0;
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: digits.includes(","),
  });
  return { target, format: (n: number) => `${prefix}${formatter.format(n)}${suffix}` };
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Renders the final value on the server and for screen readers. In the browser a number that is not yet on
 * screen counts up from zero the first time it scrolls into view. A number already on screen at first load
 * stays final. The final value stays in the layout as an invisible copy, so the box never
 * changes size while the digits run.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useLayoutEffect(() => {
    const element = ref.current;
    const parsed = parse(value);
    setDisplay(value);
    if (!element || !parsed || !motionAllowed()) return;

    if (isInitialMount() && isInViewport(element)) return;
    setDisplay(parsed.format(0));
    let frame = 0;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / DURATION_MS, 1);
        setDisplay(progress === 1 ? value : parsed.format(parsed.target * easeOutCubic(progress)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.6 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span className="count" ref={ref}>
      <span className="sr-only">{value}</span>
      <span className="count-stack" aria-hidden="true">
        <span className="count-ghost">{value}</span>
        <span className="count-live">{display}</span>
      </span>
    </span>
  );
}
