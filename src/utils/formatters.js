export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatDisplayDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

export function formatDateTime(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function formatPhone(phone) {
  const digits = phone.replace(/\D/g, "").slice(0, 10);

  if (digits.length < 10) {
    return phone;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getInputDate(daysFromToday = 0) {
  const value = new Date();
  value.setDate(value.getDate() + daysFromToday);
  return value.toISOString().slice(0, 10);
}

export function combineDateAndHour(dateString, hour) {
  const value = new Date(`${dateString}T00:00:00`);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
}

export function formatGuestCount(adults, kids) {
  const labels = [];

  if (adults) {
    labels.push(`${adults} adult${adults === 1 ? "" : "s"}`);
  }

  if (kids) {
    labels.push(`${kids} kid${kids === 1 ? "" : "s"}`);
  }

  return labels.join(" + ");
}
