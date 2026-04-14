import { PASS_TYPES, TIME_SLOTS } from "../data/resortContent";
import {
  combineDateAndHour,
  formatGuestCount,
  formatPhone,
  getInputDate,
} from "../utils/formatters";

const STORAGE_KEY = "hiline-smart-pass-reservations";

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function readReservations() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeReservations(reservations) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

function getTimeSlot(timeSlotId) {
  return TIME_SLOTS.find((slot) => slot.id === timeSlotId) ?? TIME_SLOTS[0];
}

function getTotal(adults, kids) {
  const adultPrice = PASS_TYPES.find((item) => item.id === "adult")?.price ?? 15;
  const kidPrice = PASS_TYPES.find((item) => item.id === "kid")?.price ?? 5;
  return adults * adultPrice + kids * kidPrice;
}

function getStatus(startAt, endAt) {
  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (now > end) {
    return "expired";
  }

  if (now >= start && now <= end) {
    return "active";
  }

  return "upcoming";
}

function withDerivedFields(reservation) {
  return {
    ...reservation,
    status: getStatus(reservation.startAt, reservation.endAt),
    guestSummary: formatGuestCount(reservation.adults, reservation.kids),
  };
}

function generateConfirmationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = "HLR-";

  for (let index = 0; index < 5; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return value;
}

function generatePin(existingReservations, visitDate) {
  const takenPins = new Set(
    existingReservations
      .filter((reservation) => reservation.visitDate === visitDate)
      .map((reservation) => reservation.pin),
  );

  let pin = "";
  while (!pin || takenPins.has(pin)) {
    pin = `${Math.floor(100000 + Math.random() * 900000)}`;
  }

  return pin;
}

function buildSeedReservation({
  id,
  fullName,
  email,
  phone,
  visitDate,
  timeSlot,
  adults,
  kids,
  pin,
  checkedIn,
}) {
  const slot = getTimeSlot(timeSlot);
  const amountPaid = getTotal(adults, kids);

  return {
    id,
    fullName,
    email,
    phone,
    visitDate,
    timeSlot,
    timeSlotLabel: slot.label,
    startAt: combineDateAndHour(visitDate, slot.startHour),
    endAt: combineDateAndHour(visitDate, slot.endHour),
    adults,
    kids,
    pin,
    checkedIn,
    amountPaid,
    paymentProvider: "Square Sandbox",
    paymentStatus: "paid",
    confirmationCode: generateConfirmationCode(),
    cardholderName: fullName,
    billingZip: "78611",
    createdAt: new Date().toISOString(),
    notifications: {
      email: true,
      sms: false,
    },
  };
}

function buildSeedData() {
  return [
    buildSeedReservation({
      id: "seed-1",
      fullName: "Sarah Hernandez",
      email: "sarah@example.com",
      phone: "(512) 555-0182",
      visitDate: getInputDate(0),
      timeSlot: "full-day",
      adults: 1,
      kids: 0,
      pin: "482917",
      checkedIn: true,
    }),
    buildSeedReservation({
      id: "seed-2",
      fullName: "The Patel Family",
      email: "patel.family@example.com",
      phone: "(737) 555-0109",
      visitDate: getInputDate(1),
      timeSlot: "morning-launch",
      adults: 2,
      kids: 2,
      pin: "560144",
      checkedIn: false,
    }),
    buildSeedReservation({
      id: "seed-3",
      fullName: "Marcus Lee",
      email: "marcus.lee@example.com",
      phone: "(830) 555-0177",
      visitDate: getInputDate(2),
      timeSlot: "afternoon-dock",
      adults: 2,
      kids: 0,
      pin: "907221",
      checkedIn: false,
    }),
  ];
}

export function initializeMockReservations() {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.localStorage.getItem(STORAGE_KEY)) {
    writeReservations(buildSeedData());
  }
}

export function getReservations() {
  return readReservations()
    .map(withDerivedFields)
    .sort((first, second) => new Date(first.startAt) - new Date(second.startAt));
}

export function getReservationById(reservationId) {
  return getReservations().find((reservation) => reservation.id === reservationId) ?? null;
}

export async function createReservation(formData) {
  await sleep(900);

  const existingReservations = readReservations();
  const slot = getTimeSlot(formData.timeSlot);
  const amountPaid = getTotal(formData.adults, formData.kids);
  const email = formData.email.trim().toLowerCase();
  const phone = formatPhone(formData.phone.trim());
  const reservation = {
    id: crypto.randomUUID(),
    fullName: formData.fullName.trim(),
    email,
    phone,
    visitDate: formData.visitDate,
    timeSlot: formData.timeSlot,
    timeSlotLabel: slot.label,
    startAt: combineDateAndHour(formData.visitDate, slot.startHour),
    endAt: combineDateAndHour(formData.visitDate, slot.endHour),
    adults: formData.adults,
    kids: formData.kids,
    pin: generatePin(existingReservations, formData.visitDate),
    checkedIn: false,
    amountPaid,
    paymentProvider: "Square Sandbox",
    paymentStatus: "paid",
    confirmationCode: generateConfirmationCode(),
    cardholderName: formData.cardholderName.trim(),
    billingZip: formData.billingZip.trim(),
    createdAt: new Date().toISOString(),
    notifications: {
      email: Boolean(email),
      sms: false,
    },
  };

  writeReservations([reservation, ...existingReservations]);
  return withDerivedFields(reservation);
}

export async function searchReservations(query) {
  await sleep(250);

  const value = query.trim().toLowerCase();
  if (!value) {
    return [];
  }

  return getReservations().filter((reservation) => {
    return (
      reservation.fullName.toLowerCase().includes(value) ||
      reservation.email.toLowerCase().includes(value) ||
      reservation.phone.toLowerCase().includes(value) ||
      reservation.confirmationCode.toLowerCase().includes(value) ||
      reservation.pin.includes(value)
    );
  });
}

export async function toggleCheckIn(reservationId) {
  await sleep(120);

  const reservations = readReservations();
  const nextReservations = reservations.map((reservation) => {
    if (reservation.id !== reservationId) {
      return reservation;
    }

    return {
      ...reservation,
      checkedIn: !reservation.checkedIn,
    };
  });

  writeReservations(nextReservations);
  return getReservationById(reservationId);
}

export function getAdminSnapshot(query = "") {
  const reservations = getReservations();
  const normalizedQuery = query.trim().toLowerCase();
  const filteredReservations = normalizedQuery
    ? reservations.filter((reservation) => {
        return (
          reservation.fullName.toLowerCase().includes(normalizedQuery) ||
          reservation.email.toLowerCase().includes(normalizedQuery) ||
          reservation.confirmationCode.toLowerCase().includes(normalizedQuery)
        );
      })
    : reservations;

  const today = getInputDate(0);
  const todayReservations = reservations.filter((reservation) => reservation.visitDate === today);
  const activeReservations = reservations.filter((reservation) => reservation.status === "active");
  const upcomingReservations = reservations.filter(
    (reservation) => reservation.status === "upcoming",
  );
  const checkedInReservations = reservations.filter((reservation) => reservation.checkedIn);

  return {
    reservations: filteredReservations,
    stats: {
      todayRevenue: todayReservations.reduce(
        (total, reservation) => total + reservation.amountPaid,
        0,
      ),
      activePasses: activeReservations.length,
      arrivalsPending: upcomingReservations.length,
      checkedInGuests: checkedInReservations.length,
    },
  };
}
