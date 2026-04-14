import { useState } from "react";
import { LOOKUP_HINTS } from "../data/resortContent";
import { searchReservations } from "../services/mockReservationApi";
import { formatCurrency, formatDisplayDate } from "../utils/formatters";

export default function LookupView({ onReserve, onSelectReservation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");

  async function handleSearch(event) {
    event.preventDefault();
    setStatus("loading");
    const nextResults = await searchReservations(query);
    setResults(nextResults);
    setStatus(nextResults.length > 0 ? "done" : "empty");
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Reservation lookup</p>
          <h2>Find a pass by email, phone, PIN, or confirmation code</h2>
          <p className="section-copy">
            Useful for the guest self-service view or an iPad at the gate.
          </p>
        </div>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <label className="field">
          <span>Search reservations</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="sarah@example.com"
            type="text"
            value={query}
          />
        </label>
        <div className="section-actions">
          <button className="button button--primary" type="submit">
            {status === "loading" ? "Searching..." : "Search"}
          </button>
          <button className="button button--ghost" onClick={onReserve} type="button">
            Back to booking
          </button>
        </div>
      </form>

      <ul className="hint-list">
        {LOOKUP_HINTS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="result-grid">
        {results.map((reservation) => (
          <article className="result-card" key={reservation.id}>
            <div className="result-card__header">
              <div>
                <h3>{reservation.fullName}</h3>
                <p>
                  {formatDisplayDate(reservation.visitDate)} · {reservation.timeSlotLabel}
                </p>
              </div>
              <span className="tag tag--soft">{reservation.confirmationCode}</span>
            </div>

            <div className="result-meta">
              <span>{reservation.email}</span>
              <span>{reservation.phone}</span>
              <span>{formatCurrency(reservation.amountPaid)}</span>
            </div>

            <div className="result-pin">
              <span>PIN</span>
              <strong>{reservation.pin}</strong>
            </div>

            <button
              className="button button--secondary button--full"
              onClick={() => onSelectReservation(reservation)}
              type="button"
            >
              Open confirmation view
            </button>
          </article>
        ))}

        {status === "empty" ? (
          <article className="empty-card">
            <h3>No reservations matched that search.</h3>
            <p>Try a guest email, the last four digits of a phone number, or a confirmation code.</p>
          </article>
        ) : null}
      </div>
    </section>
  );
}
