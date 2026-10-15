import { useState } from "react";
import { Icon } from "../components/Icon";
import { ProgressIO } from "../components/ProgressIO";
import { daysSince, lastExport, readBackups } from "../lib/backup";
import { useStorageState } from "../lib/persist";
import { restoreBackup, useProgress } from "../lib/store";
import { readSettings, saveSettings, useSyncStatus, type SyncSettings } from "../lib/sync";
import { runSync, signOutOfSync } from "../lib/syncController";

const when = (iso?: string) => (iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "never");

export function StorageLine() {
  const state = useStorageState();
  return (
    <p className="hint" data-testid="storage-line">
      Storage: <strong className={state === "protected" ? "pos-text" : undefined}>{state}</strong>
      {state === "not protected" && " (the browser may clear it if the site goes unused; keep exports or turn on sync)"}
      {state === "unsupported" && " (this browser can't promise to keep it; keep exports or turn on sync)"}
    </p>
  );
}

function RestoreBackup() {
  useProgress(); // re-read the list after changes
  const backups = readBackups();
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  if (!backups.length) return <p className="hint">No daily backups yet. One is saved the first time you change something each day; the last 7 days are kept.</p>;
  const chosen = date || backups[backups.length - 1].date;
  return (
    <div className="stack" style={{ gap: 6 }}>
      <div className="row">
        <label className="field" style={{ minWidth: 220 }}>
          <span>Restore from backup</span>
          <select className="input" value={chosen} onChange={(event) => setDate(event.target.value)}>
            {[...backups].reverse().map((b) => (
              <option key={b.date} value={b.date}>
                Start of {new Date(`${b.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn small"
          style={{ alignSelf: "end" }}
          onClick={() => {
            if (!window.confirm("Restore this backup? Everything you changed after it will be replaced.")) return;
            try {
              restoreBackup(chosen);
              setMessage("Backup restored.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Couldn't restore.");
            }
          }}
        >
          Restore
        </button>
      </div>
      <p role="status" className="eyebrow" style={{ textTransform: "none", letterSpacing: 0, minHeight: "1.2em" }}>
        {message}
      </p>
    </div>
  );
}

function SyncCard() {
  const status = useSyncStatus();
  const [settings, setSettings] = useState<SyncSettings>(() => readSettings() ?? { token: "", mode: "site" });
  const [saved, setSaved] = useState(() => Boolean(readSettings()?.token));
  const save = () => {
    const next = { ...readSettings(), ...settings, token: settings.token.trim() };
    saveSettings(next);
    setSaved(true);
    void runSync();
  };
  return (
    <section className="card" aria-labelledby="sync-h">
      <div className="card-title">
        <h2 id="sync-h">Sync between devices (optional)</h2>
        <span className="eyebrow">private GitHub Gist</span>
      </div>
      <p style={{ color: "var(--ink-soft)", marginBottom: 10 }}>
        Progress is encrypted on this device before it goes to a private Gist, so GitHub only ever stores ciphertext. The token stays in this browser. Set it up once on each device with the same token.
      </p>
      <div className="stack" style={{ gap: 10 }}>
        <label className="field">
          <span>Fine-grained GitHub token (Gists: read and write only)</span>
          <input className="input" type="password" autoComplete="off" spellCheck={false} value={settings.token} onChange={(event) => setSettings({ ...settings, token: event.target.value })} placeholder="github_pat_…" />
        </label>
        <fieldset className="field" style={{ border: 0, padding: 0 }}>
          <span>Encryption key</span>
          <label className="row" style={{ gap: 8 }}>
            <input type="radio" name="sync-mode" checked={settings.mode === "site"} onChange={() => setSettings({ ...settings, mode: "site" })} /> Site password (needs “Remember on this device” at unlock)
          </label>
          <label className="row" style={{ gap: 8 }}>
            <input type="radio" name="sync-mode" checked={settings.mode === "passphrase"} onChange={() => setSettings({ ...settings, mode: "passphrase" })} /> A separate sync passphrase
          </label>
        </fieldset>
        {settings.mode === "passphrase" && (
          <label className="field">
            <span>Sync passphrase (same on every device; stored in this browser only)</span>
            <input className="input" type="password" autoComplete="off" value={settings.passphrase ?? ""} onChange={(event) => setSettings({ ...settings, passphrase: event.target.value })} />
          </label>
        )}
        <div className="row">
          <button type="button" className="btn small" disabled={!settings.token.trim()} onClick={save}>
            <Icon name="sync" /> {saved ? "Save and sync now" : "Turn on sync"}
          </button>
          {saved && (
            <button
              type="button"
              className="btn small ghost"
              onClick={() => {
                signOutOfSync();
                setSettings({ token: "", mode: "site" });
                setSaved(false);
              }}
            >
              Sign out of sync
            </button>
          )}
        </div>
        <p role="status" className="hint">
          {saved ? (
            <>
              {status.busy ? "Syncing… " : ""}Last sync: {when(status.lastSync)}.{status.error && <span className="neg-text"> {status.error}</span>}
            </>
          ) : (
            "Sync is off on this device."
          )}
        </p>
      </div>
    </section>
  );
}

export function Backup() {
  const exported = daysSince(lastExport());
  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Backup and sync</span>
        <h1>Never lose progress</h1>
        <p className="lede">Check-offs, notes, flashcards, practice and capstone entries live in this browser. Keep a second copy: export a file, keep daily backups, or sync through a private Gist.</p>
      </header>
      <div className="stack-lg">
        <section className="card" aria-labelledby="backup-h">
          <div className="card-title">
            <h2 id="backup-h">Backups</h2>
            <span className="eyebrow">last export: {exported === undefined ? "never" : exported === 0 ? "today" : `${exported} ${exported === 1 ? "day" : "days"} ago`}</span>
          </div>
          <StorageLine />
          <div style={{ marginTop: 10 }}>
            <ProgressIO />
          </div>
          <p className="hint" style={{ marginBottom: 12 }}>
            Import merges item by item: the newer change wins, so importing an old file never undoes newer work. Old v1 files still import.
          </p>
          <RestoreBackup />
        </section>
        <SyncCard />
      </div>
    </div>
  );
}
