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

function getEmailSummary(reservation) {
  if (reservation.emailDelivery?.status === "queued") {
    return `The gate PIN and reservation details were sent to ${reservation.emailDelivery.sentTo}.`;
  }

  return `We saved the reservation, but the PIN email to ${reservation.emailDelivery?.sentTo || reservation.email} was not sent successfully yet.`;
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
            Your gate details are now tied to the reservation and sent by email after checkout.
          </p>
        </div>
        <span className={statusClass(reservation.status)}>{reservation.status}</span>
      </div>

      <div className="confirmation-card confirmation-card--delivery">
        <p className="eyebrow">Email confirmation</p>
        <h3>
          {reservation.emailDelivery?.status === "queued"
            ? "The PIN email was queued successfully"
            : "The PIN email still needs attention"}
        </h3>
        <p className="pin-caption">{getEmailSummary(reservation)}</p>

        <div className="delivery-channel-list">
          <div className="delivery-channel">
            <span>Email destination</span>
            <strong>{reservation.emailDelivery?.sentTo || reservation.email}</strong>
          </div>
          {reservation.emailDelivery?.emailId ? (
            <div className="delivery-channel">
              <span>Provider message id</span>
              <strong>{reservation.emailDelivery.emailId}</strong>
            </div>
          ) : null}
          {reservation.emailDelivery?.provider ? (
            <div className="delivery-channel">
              <span>Email provider</span>
              <strong>{reservation.emailDelivery.provider}</strong>
            </div>
          ) : null}
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
          <p className="eyebrow">What happens next</p>
          <ol className="instruction-list">
            <li>The guest receives the confirmation code, visit window, and gate PIN by email.</li>
            <li>At the gate, they enter the emailed 6-digit PIN on the Crappie House keypad.</li>
            <li>If email sending fails, check the backend logs and the Resend dashboard for the returned provider status.</li>
          </ol>

          <div className="delivery-note">
            <strong>Email status</strong>
            <span>{reservation.emailDelivery?.message || "Waiting for backend response."}</span>
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
