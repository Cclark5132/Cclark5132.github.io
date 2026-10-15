import { useSyncExternalStore } from "react";

interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

let current: Toast | undefined;
let timer: number | undefined;
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

/** Shows one short message at a time, with an optional action such as Undo. */
export function showToast(message: string, action?: Toast["action"], ms = 5000) {
  current = { id: nextId++, message, action };
  window.clearTimeout(timer);
  timer = window.setTimeout(dismissToast, ms);
  emit();
}

export function dismissToast() {
  current = undefined;
  emit();
}

export function Toaster() {
  const toast = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => current,
  );
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              className="btn small"
              onClick={() => {
                toast.action!.run();
                dismissToast();
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
