import { useRef, useState } from "react";
import { exportProgress, importProgress } from "../lib/store";
import { Icon } from "./Icon";

/** Export / Import progress as JSON, so localStorage is never the only copy. */
export function ProgressIO({ compact = false }: { compact?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  const doExport = () => {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booster-prep-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Progress exported.");
  };

  const doImport = async (file: File) => {
    try {
      importProgress(await file.text());
      setMessage("Progress imported.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Couldn't read that file.");
    }
  };

  return (
    <div className="stack" style={{ gap: 6 }}>
      <div className="row">
        <button type="button" className="btn small" onClick={doExport}>
          <Icon name="download" /> Export{compact ? "" : " progress"}
        </button>
        <button type="button" className="btn small" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" /> Import{compact ? "" : " progress"}
        </button>
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
