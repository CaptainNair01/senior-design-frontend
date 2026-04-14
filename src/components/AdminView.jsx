import { useDeferredValue, useEffect, useState } from "react";
import { ADMIN_CHECKLIST } from "../data/resortContent";
import { getAdminSnapshot, toggleCheckIn } from "../services/mockReservationApi";
import { formatCurrency, formatDisplayDate } from "../utils/formatters";

function badgeClass(status) {
  if (status === "active") {
    return "tag tag--success";
  }

  if (status === "expired") {
    return "tag tag--muted";
  }

  return "tag tag--warning";
}

export default function AdminView({ refreshKey, onViewReservation }) {
  const [search, setSearch] = useState("");
  const [snapshot, setSnapshot] = useState(() => getAdminSnapshot());
  const [updatingId, setUpdatingId] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    setSnapshot(getAdminSnapshot(deferredSearch));
  }, [deferredSearch, refreshKey]);

  async function handleToggleCheckIn(reservationId) {
    setUpdatingId(reservationId);

    try {
      await toggleCheckIn(reservationId);
      setSnapshot(getAdminSnapshot(deferredSearch));
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Demo admin console</p>
          <h2>Staff visibility into reservations and gate readiness</h2>
          <p className="section-copy">
            This view is intentionally frontend-only for now, but it maps cleanly to the admin
            flows described in the slideshow.
          </p>
        </div>
      </div>

      <div className="metric-grid metric-grid--admin">
        <article className="metric-card">
          <span>Today&apos;s revenue</span>
          <strong>{formatCurrency(snapshot.stats.todayRevenue)}</strong>
        </article>
        <article className="metric-card">
          <span>Active passes</span>
          <strong>{snapshot.stats.activePasses}</strong>
        </article>
        <article className="metric-card">
          <span>Upcoming arrivals</span>
          <strong>{snapshot.stats.arrivalsPending}</strong>
        </article>
        <article className="metric-card">
          <span>Checked in</span>
          <strong>{snapshot.stats.checkedInGuests}</strong>
        </article>
      </div>

      <div className="admin-toolbar">
        <label className="field">
          <span>Filter reservations</span>
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Guest, email, or code"
            type="text"
            value={search}
          />
        </label>
        <ul className="pill-list pill-list--compact">
          {ADMIN_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="table-card">
        <div className="table-row table-row--header">
          <span>Guest</span>
          <span>Visit</span>
          <span>Access</span>
          <span>Payment</span>
          <span>Actions</span>
        </div>

        {snapshot.reservations.map((reservation) => (
          <div className="table-row" key={reservation.id}>
            <div>
              <strong>{reservation.fullName}</strong>
              <small>{reservation.email}</small>
            </div>
            <div>
              <strong>{formatDisplayDate(reservation.visitDate)}</strong>
              <small>{reservation.timeSlotLabel}</small>
            </div>
            <div>
              <span className={badgeClass(reservation.status)}>{reservation.status}</span>
              <small>PIN {reservation.pin}</small>
            </div>
            <div>
              <strong>{formatCurrency(reservation.amountPaid)}</strong>
              <small>{reservation.paymentProvider}</small>
            </div>
            <div className="table-actions">
              <button
                className="button button--ghost button--small"
                onClick={() => onViewReservation(reservation)}
                type="button"
              >
                View
              </button>
              <button
                className="button button--secondary button--small"
                disabled={updatingId === reservation.id}
                onClick={() => handleToggleCheckIn(reservation.id)}
                type="button"
              >
                {reservation.checkedIn ? "Undo check-in" : "Mark checked in"}
              </button>
            </div>
          </div>
        ))}

        {snapshot.reservations.length === 0 ? (
          <div className="empty-card empty-card--table">
            <h3>No reservations match the current filter.</h3>
            <p>Clear the search box to see the full demo dataset.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
