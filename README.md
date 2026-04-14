# Hi-Line Resort Smart Pass

React frontend plus a lightweight Node backend for the reservation flow described in the senior design slides. The frontend still uses a mocked local reservation store, and the backend currently focuses on one production-style responsibility: emailing the guest PIN after checkout.

## What is included

- Resort landing and booking flow for day-pass visitors
- Live pricing for adult and kid passes
- Guest details form with inline validation
- Mock Square-ready payment step
- Email-based reservation confirmation screen
- Basic offline shell support through a service worker
- Express email endpoint that can send through Gmail or Resend

## Run locally

```bash
npm install
npm run dev:all
```

This starts:

- the Vite frontend on `http://localhost:5173`
- the email backend on `http://localhost:8787`

## Email backend setup

### Option 1: Gmail with app password

1. Turn on 2-Step Verification for your Google account.
2. Create a Google App Password.
3. Copy `.env.example` to `.env`.
4. Fill in:
   - `EMAIL_PROVIDER=gmail`
   - `GMAIL_USER=your-email@gmail.com`
   - `GMAIL_APP_PASSWORD=your_16_character_app_password`
5. Run `npm install`.
6. Restart the app with `npm run dev:all`.
7. Submit a reservation with a real email address.

### Option 2: Resend

1. Create a Resend account at `https://resend.com`.
2. Verify the sending domain or subdomain you want to use in the Resend dashboard.
3. Copy `.env.example` to `.env`.
4. Fill in:
   - `EMAIL_PROVIDER=resend`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `RESEND_REPLY_TO`
5. Run `npm install`.
6. Restart the app with `npm run dev:all`.
7. Submit a reservation with a real email address.

## How the email flow works

1. The booking form submits in [src/components/BookingWizard.jsx](src/components/BookingWizard.jsx).
2. The reservation is created locally through [src/services/mockReservationApi.js](src/services/mockReservationApi.js).
3. The frontend then posts the reservation payload to [src/services/emailApi.js](src/services/emailApi.js).
4. The Express server in [server/index.js](server/index.js) validates the payload and sends the email with the configured provider.
5. The confirmation screen shows whether the email was accepted by the provider.

## Backend handoff notes

- Right now the frontend still generates and stores the PIN locally for demo purposes.
- The next backend improvement should be moving PIN generation and reservation persistence fully into the server.
- The payment step is still structured so a Square Web Payments SDK mount point can replace the mock card block later.
