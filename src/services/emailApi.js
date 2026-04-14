const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://127.0.0.1:8787" : "");

export async function sendReservationEmail(reservation) {
  const response = await fetch(`${API_BASE_URL}/api/send-access-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reservation,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Email send failed.");
  }

  return payload;
}
