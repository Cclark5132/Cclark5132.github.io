import { Component, type ReactNode } from "react";

/**
 * Catches a page that fails to render so the rest of the site keeps working. Shows the error so it
 * can be reported, and resets when the route changes.
 */
export class ErrorBoundary extends Component<{ resetKey: string; children: ReactNode }, { error: Error | null; key: string }> {
  state = { error: null as Error | null, key: this.props.resetKey };

  static getDerivedStateFromProps(props: { resetKey: string }, state: { error: Error | null; key: string }) {
    return props.resetKey === state.key ? null : { error: null, key: props.resetKey };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="content narrow">
        <header className="page-head">
          <span className="eyebrow">Something broke</span>
          <h1>This page hit an error</h1>
          <p className="lede">Your progress is safe. Try another page, or reload. If it keeps happening, send Claude the message below.</p>
        </header>
        <pre className="error-box">{`${error.name}: ${error.message}\n${navigator.userAgent}`}</pre>
        <div className="row" style={{ marginTop: 14 }}>
          <a className="btn primary" href="#/">
            Back to the dashboard
          </a>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}
