import resortMap from "../assets/resort-map.jpeg";
import { AMENITIES, RESORT_CONTACT } from "../data/resortContent";

export default function ExperienceSidebar() {
  return (
    <section className="panel overview-panel">
      <div className="overview-grid">
        <div className="overview-copy">
          <p className="eyebrow">Resort overview</p>
          <h2>Everything guests need before they arrive</h2>
          <p className="section-copy">
            Book the visit here, then head out to Lake Buchanan knowing the gate PIN and
            reservation details will arrive in the guest email inbox right after checkout.
          </p>

          <ul className="pill-list">
            {AMENITIES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="overview-contact">
            {RESORT_CONTACT.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="map-panel">
          <img
            alt="Illustrated Hi-Line Resort property map"
            className="resort-map"
            src={resortMap}
          />
        </div>
      </div>
    </section>
  );
}
