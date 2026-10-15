import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "katex/dist/katex.min.css";
import App from "./App";
import { guardDomAgainstExtensions } from "./lib/domGuard";
import "./styles.css";

guardDomAgainstExtensions();

const root = document.getElementById("root")!;

/** If the app crashes outright, say so on screen instead of leaving a blank page. */
function showCrash(error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}\n${(error.stack ?? "").slice(0, 600)}` : String(error);
  const box = document.createElement("div");
  box.style.cssText = "max-width:720px;margin:48px auto;padding:24px;font:15px/1.6 system-ui,sans-serif;color:#e7ecf3";
  const title = document.createElement("h1");
  title.textContent = "Booster Prep hit an error";
  title.style.cssText = "font-size:1.4rem;margin:0 0 12px";
  const help = document.createElement("p");
  help.textContent = "Your progress is safe. Reload to try again. If it keeps happening, send Claude this message:";
  const pre = document.createElement("pre");
  pre.style.cssText = "white-space:pre-wrap;word-break:break-word;padding:12px;border:1px solid #3a4c74;border-radius:8px";
  pre.textContent = `${message}\n${location.hash}\n${navigator.userAgent}`;
  const reload = document.createElement("button");
  reload.textContent = "Reload";
  reload.style.cssText = "margin-top:12px;padding:10px 16px;border:0;border-radius:8px;background:#ff8a33;color:#1a0e03;font-weight:600;cursor:pointer";
  reload.onclick = () => location.reload();
  box.append(title, help, pre, reload);
  root.replaceChildren(box);
}

createRoot(root, { onUncaughtError: showCrash }).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
