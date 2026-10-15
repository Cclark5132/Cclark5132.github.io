import { useRef, useState } from "react";
import { exportProgress, importProgress } from "../lib/store";
import { Icon } from "./Icon";

/** Downloads the progress file. Returns the message to show. */
export function downloadProgress() {
  const blob = new Blob([exportProgress()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `booster-prep-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return "Progress exported.";
}

/** Export / Import progress as JSON. Import merges item by item (newest wins); "Replace everything" asks first. */
export function ProgressIO({ compact = false }: { compact?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const modeRef = useRef<"merge" | "replace">("merge");
  const [message, setMessage] = useState("");

  const doImport = async (file: File) => {
    try {
      const text = await file.text();
      if (modeRef.current === "replace") {
        importProgress(text, "replace");
        setMessage("Replaced all progress with the file.");
      } else {
        const { newer, older } = importProgress(text, "merge");
        setMessage(`Imported: ${newer} newer, ${older} older skipped.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Couldn't read that file.");
    }
  };

  const pick = (mode: "merge" | "replace") => {
    if (mode === "replace" && !window.confirm("Replace everything? Your progress on this device will be overwritten by the file. Items that aren't in the file will be cleared.")) return;
    modeRef.current = mode;
    fileRef.current?.click();
  };

  return (
    <div className="stack" style={{ gap: 6 }}>
      <div className="row">
        <button type="button" className="btn small" onClick={() => setMessage(downloadProgress())}>
          <Icon name="download" /> Export{compact ? "" : " progress"}
        </button>
        <button type="button" className="btn small" onClick={() => pick("merge")}>
          <Icon name="upload" /> Import{compact ? "" : " and merge"}
        </button>
        {!compact && (
          <button type="button" className="btn small ghost" onClick={() => pick("replace")}>
            Replace everything…
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void doImport(file);
            event.target.value = "";
          }}
        />
      </div>
      <p role="status" className="eyebrow" style={{ minHeight: "1.2em", textTransform: "none", letterSpacing: 0 }}>
        {message}
      </p>
    </div>
  );
}
