

export default function LandingPage({ onEnter }) {
  return (
    <div className="landing">
      <div className="landing-bg" />
      <div className="landing-content">
        <h1 className="landing-title">Eden Plant Tool</h1>
        <p className="landing-sub">
          Discover native plants matched to your growing conditions,
          pollinators, and habitat goals.
        </p>
          <p className="landing-zone">The data is based on USDA climate Zone 7a &mdash; St. Louis, MO</p>
        <button className="landing-btn" onClick={onEnter}>
          Explore Plants
        </button>
      </div>
    </div>
  );
}
