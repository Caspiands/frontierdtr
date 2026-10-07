export default function ShowcaseLoading() {
  return (
    <div className="dtr" aria-busy="true" aria-live="polite">
      <header className="mast">
        <div className="mast-in">
          <div className="brand">
            <span>DTR 2026–27 · Client edition</span>
          </div>
        </div>
      </header>
      <div className="wrap page">
        <div className="loading-skeleton" style={{ maxWidth: 720 }}>
          <div className="loading-bar" style={{ width: "42%", height: 28 }} />
          <div className="loading-bar" />
          <div className="loading-bar" style={{ width: "86%" }} />
          <div className="loading-bar" style={{ width: "70%" }} />
          <p className="muted">Loading the roadmap…</p>
        </div>
      </div>
    </div>
  );
}
