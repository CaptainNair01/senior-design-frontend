import { useState } from "react";
import { PASS_TYPES, TIME_SLOTS } from "../data/resortContent";
import { sendReservationEmail } from "../services/emailApi";
import { createReservation } from "../services/mockReservationApi";
import {
  formatCurrency,
  formatDisplayDate,
  formatGuestCount,
  getInputDate,
  isValidEmail,
} from "../utils/formatters";
import PassCounter from "./PassCounter";

function buildDefaultForm() {
  return {
    adults: 1,
    kids: 0,
    fullName: "",
    email: "",
    phone: "",
    visitDate: getInputDate(1),
    timeSlot: TIME_SLOTS[2].id,
    cardholderName: "",
    billingZip: "",
  };
}

function validateGuestStep(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Enter the guest name.";
  }

  if (!isValidEmail(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (form.adults + form.kids < 1) {
    errors.guests = "Select at least one pass.";
  }

  if (!form.visitDate) {
    errors.visitDate = "Choose a visit date.";
  }

  return errors;
}

function validatePaymentStep(form) {
  const errors = {};

  if (!form.cardholderName.trim()) {
    errors.cardholderName = "Enter the cardholder name.";
  }

  if (form.billingZip.trim().length < 5) {
    errors.billingZip = "Enter a valid ZIP code.";
  }

  return errors;
}

export default function BookingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(buildDefaultForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedStep, setHasAttemptedStep] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const total = form.adults * 15 + form.kids * 5;
  const selectedTimeSlot =
    TIME_SLOTS.find((slot) => slot.id === form.timeSlot) ?? TIME_SLOTS[2];

  function refreshErrors(nextForm, nextStep = step) {
    if (!hasAttemptedStep) {
      return;
    }

    const nextErrors =
      nextStep === 1
        ? validateGuestStep(nextForm)
        : {
            ...validateGuestStep(nextForm),
            ...validatePaymentStep(nextForm),
          };

    setErrors(nextErrors);
  }

  function updateField(field, value) {
    let nextForm;

    setForm((current) => {
      nextForm = {
        ...current,
        [field]: value,
      };

      return nextForm;
    });

    refreshErrors(nextForm);
  }

  function updateCount(field, direction) {
    let nextForm;

    setForm((current) => {
      const nextValue = Math.max(0, current[field] + direction);
      nextForm = {
        ...current,
        [field]: nextValue,
      };

      return nextForm;
    });

    refreshErrors(nextForm);
  }

  function handleContinue() {
    setHasAttemptedStep(true);
    const nextErrors = validateGuestStep(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setHasAttemptedStep(false);
    setStep(2);
  }

  async function handleReserve(event) {
    event.preventDefault();

    const guestErrors = validateGuestStep(form);
    const paymentErrors = validatePaymentStep(form);
    const nextErrors = {
      ...guestErrors,
      ...paymentErrors,
    };

    if (Object.keys(nextErrors).length > 0) {
      setHasAttemptedStep(true);
      setErrors(nextErrors);
      if (Object.keys(guestErrors).length > 0) {
        setStep(1);
      }
      return;
    }

    setErrors({});
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const reservation = await createReservation(form);
      let emailDelivery = {
        status: "failed",
        sentTo: reservation.email,
        message: "The reservation was saved, but the email could not be sent.",
      };

      try {
        const response = await sendReservationEmail(reservation);
        emailDelivery = {
          status: response.status,
          provider: response.provider,
          sentTo: response.sentTo,
          emailId: response.emailId,
          message: "The PIN email has been queued successfully.",
        };
      } catch (error) {
        emailDelivery = {
          status: "failed",
          sentTo: reservation.email,
          message: "We could not send the confirmation email just yet.",
        };
      }

      setForm(buildDefaultForm());
      setStep(1);
      setHasAttemptedStep(false);
      onComplete({
        ...reservation,
        emailDelivery,
      });
    } catch (error) {
      setSubmitError("Something went wrong while saving the reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel booking-panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Reserve your visit</p>
          <h2>Book your Crappie House day pass</h2>
        </div>
        <div className="stepper" aria-label="Checkout progress">
          <span className={`step-pill ${step === 1 ? "is-active" : ""}`}>1. Visit details</span>
          <span className={`step-pill ${step === 2 ? "is-active" : ""}`}>2. Payment</span>
          <span className="step-pill">3. Confirmation</span>
        </div>
      </div>

      <form className="booking-form" onSubmit={handleReserve}>
        {step === 1 ? (
          <>
            <div className="field-grid field-grid--passes">
              {PASS_TYPES.map((passType) => (
                <PassCounter
                  key={passType.id}
                  description={passType.description}
                  disabled={passType.comingSoon}
                  label={passType.label}
                  onDecrease={() => updateCount(passType.id === "adult" ? "adults" : "kids", -1)}
                  onIncrease={() => updateCount(passType.id === "adult" ? "adults" : "kids", 1)}
                  price={passType.price}
                  quantity={passType.id === "adult" ? form.adults : form.kids}
                />
              ))}
            </div>

            {errors.guests ? <p className="field-error">{errors.guests}</p> : null}

            <div className="field-grid">
              <label className="field">
                <span>Full name</span>
                <input
                  autoComplete="name"
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Sarah Hernandez"
                  type="text"
                  value={form.fullName}
                />
                {errors.fullName ? <small className="field-error">{errors.fullName}</small> : null}
              </label>

              <label className="field">
                <span>Visit date</span>
                <input
                  min={getInputDate(0)}
                  onChange={(event) => updateField("visitDate", event.target.value)}
                  type="date"
                  value={form.visitDate}
                />
                {errors.visitDate ? <small className="field-error">{errors.visitDate}</small> : null}
              </label>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Email address</span>
                <input
                  autoComplete="email"
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="sarah@example.com"
                  type="email"
                  value={form.email}
                />
                {errors.email ? <small className="field-error">{errors.email}</small> : null}
                {!errors.email ? (
                  <small className="field-hint">We&apos;ll send your gate PIN and visit details here.</small>
                ) : null}
              </label>

              <label className="field">
                <span>Phone number</span>
                <input
                  autoComplete="tel"
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="(512) 555-0182"
                  type="tel"
                  value={form.phone}
                />
                <small className="field-hint">Optional contact number for your reservation.</small>
              </label>
            </div>

            <fieldset className="field fieldset">
              <legend>Arrival window</legend>
              <div className="slot-grid">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    className={`slot-card ${form.timeSlot === slot.id ? "is-selected" : ""}`}
                    onClick={() => updateField("timeSlot", slot.id)}
                    type="button"
                  >
                    <strong>{slot.label}</strong>
                    <span>{slot.window}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <aside className="summary-card">
              <div>
                <p className="eyebrow">Reservation summary</p>
                <strong>{formatGuestCount(form.adults, form.kids)}</strong>
                <span>
                  {selectedTimeSlot.label} on {formatDisplayDate(form.visitDate)}
                </span>
              </div>
              <strong className="summary-total">{formatCurrency(total)}</strong>
            </aside>

            <div className="section-actions">
              <button className="button button--primary" onClick={handleContinue} type="button">
                Continue to payment
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="payment-shell">
              <div className="payment-card">
                <p className="eyebrow">Payment</p>
                <h3>Complete your reservation</h3>
                <p className="payment-copy">
                  Finish checkout to lock in your visit and have your gate PIN emailed right away.
                </p>

                <div className="mock-card">
                  <span>Secure checkout</span>
                  <strong>Your reservation details will be confirmed after payment.</strong>
                  <small>Use the name and billing ZIP tied to the card you plan to use.</small>
                </div>

                <div className="field-grid">
                  <label className="field">
                    <span>Cardholder name</span>
                    <input
                      onChange={(event) => updateField("cardholderName", event.target.value)}
                      placeholder="Sarah Hernandez"
                      type="text"
                      value={form.cardholderName}
                    />
                    {errors.cardholderName ? (
                      <small className="field-error">{errors.cardholderName}</small>
                    ) : null}
                  </label>

                  <label className="field">
                    <span>Billing ZIP</span>
                    <input
                      inputMode="numeric"
                      maxLength={5}
                      onChange={(event) => updateField("billingZip", event.target.value)}
                      placeholder="78611"
                      type="text"
                      value={form.billingZip}
                    />
                    {errors.billingZip ? (
                      <small className="field-error">{errors.billingZip}</small>
                    ) : null}
                  </label>
                </div>
              </div>

              <aside className="review-card">
                <p className="eyebrow">Booking details</p>
                <ul className="review-list">
                  <li>
                    <span>Guest</span>
                    <strong>{form.fullName || "Guest name"}</strong>
                  </li>
                  <li>
                    <span>Passes</span>
                    <strong>{formatGuestCount(form.adults, form.kids)}</strong>
                  </li>
                  <li>
                    <span>Visit</span>
                    <strong>{formatDisplayDate(form.visitDate)}</strong>
                  </li>
                  <li>
                    <span>Window</span>
                    <strong>{selectedTimeSlot.window}</strong>
                  </li>
                  <li>
                    <span>Email delivery</span>
                    <strong>{form.email || "Email required"}</strong>
                  </li>
                </ul>
                <div className="review-total">
                  <span>Total</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
              </aside>
            </div>

            {submitError ? <p className="field-error">{submitError}</p> : null}

            <div className="section-actions">
              <button
                className="button button--ghost"
                onClick={() => {
                  setStep(1);
                  setHasAttemptedStep(false);
                  setErrors({});
                }}
                type="button"
              >
                Back
              </button>
              <button className="button button--primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Processing reservation..." : "Complete reservation"}
              </button>
            </div>
          </>
        )}
      </form>
    </section>
  );
}
