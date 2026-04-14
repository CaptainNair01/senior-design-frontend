export const BRAND = {
  name: "Hi-Line Resort",
  location: "Lake Buchanan, Texas",
  product: "Crappie House Smart Pass",
  description:
    "Reserve your day pass, choose your arrival window, and receive your gate PIN by email right after checkout.",
};

export const PASS_TYPES = [
  {
    id: "adult",
    label: "Adult Pass",
    description: "Ages 13+, full property access for one guest.",
    price: 15,
  },
  {
    id: "kid",
    label: "Kid Pass",
    description: "Ages 5-12, must be booked with an adult.",
    price: 5,
  },
  {
    id: "overnight",
    label: "Overnight Guest",
    description: "Cabin and RV guest access will be available soon.",
    price: 0,
    comingSoon: true,
  },
];

export const TIME_SLOTS = [
  {
    id: "morning-launch",
    label: "Morning Launch",
    window: "7:00 AM - 12:00 PM",
    startHour: 7,
    endHour: 12,
  },
  {
    id: "afternoon-dock",
    label: "Afternoon Dock",
    window: "12:00 PM - 5:00 PM",
    startHour: 12,
    endHour: 17,
  },
  {
    id: "full-day",
    label: "Full Day Access",
    window: "7:00 AM - 9:00 PM",
    startHour: 7,
    endHour: 21,
  },
];

export const HERO_METRICS = [
  { label: "PIN delivery", value: "Sent by email" },
  { label: "Day-pass pricing", value: "$15 adult / $5 kid" },
  { label: "Reservation time", value: "A few quick steps" },
];

export const AMENITIES = [
  "Boat ramp and dock access",
  "Beach, picnic, and swim areas",
  "Fire pit gathering space",
  "Cabin and RV expansion path",
];

export const RESORT_CONTACT = [
  "1106 Hi-Line, Tow, Texas 78672",
  "Office hours: 9am - 5pm",
  "Tel: (325) 379-1065",
];

export const ADMIN_CHECKLIST = [
  "Square webhook status: ready for backend hookup",
  "PIN lifecycle view: mocked from stored reservations",
  "Search tools: filter by guest, email, or confirmation code",
];

export const LOOKUP_HINTS = [
  "Try `sarah@example.com` to load a seeded reservation.",
  "Search also works with phone fragments or codes like `HLR-`.",
];
