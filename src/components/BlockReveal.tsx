const COLUMNS = 14;
const ROWS = 9;
const TILES = Array.from({ length: COLUMNS * ROWS }, (_, index) => index);

/**
 * A grid of blocks laid over an image. While the image waits below the fold the blocks cover it; when it
 * scrolls in, an orange scan line sweeps across and the blocks behind it flash maroon and shrink away, so the
 * image is uncovered block by block as the line passes. Column and row of each block (for timing) are set in
 * styles.css with nth-child (keep COLUMNS and ROWS in step with it), which keeps the markup small. Hidden when motion is reduced.
 */
export function BlockReveal() {
  return (
    <span className="plot" aria-hidden="true">
      <span className="tiles">
        {TILES.map((tile) => (
          <span className="tile" key={tile} />
        ))}
      </span>
      <span className="scan" />
    </span>
  );
}
