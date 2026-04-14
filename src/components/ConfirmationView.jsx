import { formatCurrency, formatDisplayDate } from "../utils/formatters";

function statusClass(status) {
  if (status === "active") {
    return "tag tag--success";
  }

  if (status === "expired") {
    return "tag tag--muted";
  }

  return "tag tag--warning";
}

function statusLabel(status) {
  if (status === "active") {
    return "Today";
  }

  if (status === "expired") {
    return "Past visit";
  }

  return "Reserved";
}

function getEmailSummary(reservation) {
  if (reservation.emailDelivery?.status === "queued") {
    return `Your gate PIN and reservation details were sent to ${reservation.emailDelivery.sentTo}.`;
  }

  return `Your reservation was saved, but we could not send the confirmation email to ${reservation.emailDelivery?.sentTo || reservation.email} just yet.`;
}

export default function ConfirmationView({ reservation, onBookAnother }) {
  if (!reservation) {
    return (
      <section className="panel empty-state">
        <p className="eyebrow">No recent purchase</p>
        <h2>Complete a reservation to view the email confirmation screen.</h2>
        <div className="section-actions">
          <button className="button button--primary" onClick={onBookAnother} type="button">
            Book a pass
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Payment confirmed</p>
          <h2>Your reservation is confirmed</h2>
          <p className="section-copy">
            A confirmation email with your gate PIN and visit details is on its way.
          </p>
        </div>
        <span className={statusClass(reservation.status)}>{statusLabel(reservation.status)}</span>
      </div>

      <div className="confirmation-card confirmation-card--delivery">
        <p className="eyebrow">Email confirmation</p>
        <h3>
          {reservation.emailDelivery?.status === "queued"
            ? "Your email is on the way"
            : "We still need to send your email"}
        </h3>
        <p className="pin-caption">{getEmailSummary(reservation)}</p>

        <div className="delivery-channel-list">
          <div className="delivery-channel">
            <span>Email destination</span>
            <strong>{reservation.emailDelivery?.sentTo || reservation.email}</strong>
          </div>
        </div>
      </div>

      <div className="confirmation-grid">
        <article className="info-card">
          <p className="eyebrow">Reservation details</p>
          <dl className="detail-list">
            <div>
              <dt>Guest</dt>
              <dd>{reservation.fullName}</dd>
            </div>
            <div>
              <dt>Visit date</dt>
              <dd>{formatDisplayDate(reservation.visitDate)}</dd>
            </div>
            <div>
              <dt>Window</dt>
              <dd>{reservation.timeSlotLabel}</dd>
            </div>
            <div>
              <dt>Amount paid</dt>
              <dd>{formatCurrency(reservation.amountPaid)}</dd>
            </div>
            <div>
              <dt>Confirmation code</dt>
              <dd>{reservation.confirmationCode}</dd>
            </div>
          </dl>
        </article>

        <article className="info-card">
          <p className="eyebrow">Before you arrive</p>
          <ol className="instruction-list">
            <li>Check your email for the confirmation code, visit window, and gate PIN.</li>
            <li>Bring that email with you when you head to the resort.</li>
            <li>At the Crappie House keypad, enter the 6-digit PIN from the email to get in.</li>
          </ol>

          <div className="delivery-note">
            <strong>Need help?</strong>
            <span>
              {reservation.emailDelivery?.status === "queued"
                ? "If the message does not show up soon, check your spam or promotions folder."
                : "Please try booking again or contact the resort office for assistance."}
            </span>
          </div>
        </article>
      </div>

      <div className="section-actions delivery-actions">
        <button className="button button--ghost" onClick={onBookAnother} type="button">
          Book another pass
        </button>
      </div>
    </section>
  );
}
