import { startTransition, useEffect, useState } from "react";
import BookingWizard from "./components/BookingWizard";
import ConfirmationView from "./components/ConfirmationView";
import ExperienceSidebar from "./components/ExperienceSidebar";
import HeroBanner from "./components/HeroBanner";

import { initializeMockReservations } from "./services/mockReservationApi";

export default function App() {
  const [activeView, setActiveView] = useState("reserve");
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    initializeMockReservations();
  }, []);

  function handleComplete(reservation) {
    setConfirmation(reservation);
    startTransition(() => {
      setActiveView("confirmation");
    });
  }

  function handleReturnToBooking() {
    startTransition(() => {
      setActiveView("reserve");
    });
  }

  return (
    <div className="app-shell">
      <div className="backdrop backdrop--one" />
      <div className="backdrop backdrop--two" />

      <main className="page-shell">
        <HeroBanner
          activeView={activeView}
          onChangeView={handleReturnToBooking}
        />

        {activeView === "reserve" ? (
          <div className="reserve-stack">
            <BookingWizard onComplete={handleComplete} />
            <ExperienceSidebar />
          </div>
        ) : null}

        {activeView === "confirmation" ? (
          <ConfirmationView
            onBookAnother={handleReturnToBooking}
            reservation={confirmation}
          />
        ) : null}
      </main>
    </div>
  );
}
