import { BRAND, HERO_METRICS } from "../data/resortContent";

const USER_STATUS = [
  { label: "Delivery", value: "PIN emailed after payment" },
  { label: "Reservation", value: "Quick and simple checkout" },
  { label: "Arrival", value: "Gate details included" },
];

export default function HeroBanner({ activeView, onChangeView }) {
  return (
    <header className="hero-panel panel">
      <div className="hero-topbar">
        <div>
          <p className="eyebrow">{BRAND.name}</p>
          <p className="hero-location">{BRAND.location}</p>
        </div>
        <span className="hero-pill">
          {activeView === "confirmation" ? "Reservation confirmed" : "Guest day-pass booking"}
        </span>
      </div>

      <div className="hero-content">
        <div className="hero-copy">
          <p className="eyebrow">Lake day-pass reservations</p>
          <h1>{BRAND.product}</h1>
          <p className="hero-description">{BRAND.description}</p>

          <div className="hero-actions">
            <button
              className="button button--primary"
              onClick={onChangeView}
              type="button"
            >
              {activeView === "confirmation" ? "Book another pass" : "Start a day pass"}
            </button>
          </div>
        </div>

        <div className="hero-side">
          <div className="metric-grid">
            {HERO_METRICS.map((metric) => (
              <article className="metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>

          <div className="hero-status">
            {USER_STATUS.map((item) => (
              <div key={item.label}>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
