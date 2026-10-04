import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  siApplepay,
  siGooglepay,
  siVisa,
  siMastercard,
  siAmericanexpress,
  siJcb,
  siKlarna,
} from "simple-icons";
import {
  BookingFlow,
  createFlowDraft,
  type FlowDraft,
  type FlowEntry,
  type FlowSeason,
} from "./booking-flow";
import { installPublicTranslation } from "./locale";
import { capacityIssues, cabinStock, cabinUnitsLeft, cabinUnitsNeeded, equipmentDemand, equipmentStock, equipmentUnitsLeft, passDemand, passStock, passUnitsLeft, sessionCapacity, sessionSeatsLeft, type EquipmentKind } from "./capacity";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bike,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Globe2,
  Home,
  Info,
  LayoutDashboard,
  MapPin,
  Menu,
  Minus,
  MountainSnow,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Snowflake,
  Sun,
  TentTree,
  Trash2,
  UserRound,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import "./style.css";

type Kind = "day" | "stay" | "group";
type Status = "Bekräftad" | "Preliminär" | "Avbokad";
type Participant = {
  name: string;
  role: "teacher" | null;
  birthDate: string;
  activity: string;
  equipment: "borrow" | "own";
  shoe: string;
  height: string;
  weight: string;
};
type ContactDetails = {
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  addressLine2?: string;
  country?: string;
  contactPerson?: string;
  position?: string;
  billingEmail?: string;
  invoiceReference?: string;
  organisationNumber?: string;
  note?: string;
};
const emptyContact = (): ContactDetails => ({
  phone: "",
  street: "",
  postalCode: "",
  city: "",
  addressLine2: "",
  country: "Sverige",
  contactPerson: "",
  position: "",
  billingEmail: "",
  invoiceReference: "",
  organisationNumber: "",
  note: "",
});
const exampleContact = (): ContactDetails => ({
  phone: "070-123 45 67",
  street: "Björkvägen 12",
  postalCode: "141 41",
  city: "Huddinge",
  addressLine2: "Lgh 1202",
  country: "Sverige",
  note: "En person i sällskapet behöver lättillgänglig entré.",
});
const exampleGroupContact = (): ContactDetails => ({
  phone: "070-456 78 90",
  street: "Kommunalvägen 28",
  postalCode: "141 85",
  city: "Huddinge",
  addressLine2: "Utbildningsförvaltningen",
  country: "Sverige",
  contactPerson: "Sara Berg",
  position: "Bokningsansvarig lärare",
  billingEmail: "faktura@bjorkskolan.se",
  invoiceReference: "Friluftsdag åk 7",
  organisationNumber: "212000-0068",
});
const validContact = (contact: ContactDetails) =>
  /^[+\d][\d\s-]{6,}$/.test(contact.phone.trim()) &&
  Boolean(contact.street.trim() && contact.city.trim()) &&
  /^\d{3}\s?\d{2}$/.test(contact.postalCode.trim());
const validGroupContact = (contact: ContactDetails) =>
  validContact(contact) &&
  Boolean(contact.contactPerson?.trim()) &&
  /^\S+@\S+\.\S+$/.test(contact.billingEmail || "");
const formatAddress = (contact: ContactDetails) =>
  [
    contact.street,
    contact.addressLine2,
    `${contact.postalCode} ${contact.city}`,
    contact.country || "Sverige",
  ]
    .filter(Boolean)
    .join(", ");
type Booking = {
  id: string;
  accountEmail?: string;
  kind: Kind;
  sourceEntry?: FlowEntry;
  status: Status;
  payment: string;
  name: string;
  email: string;
  date: string;
  total: number;
  items: string[];
  details: string;
  history: string[];
  participants?: Participant[];
  nights?: number;
  childAges?: number[];
  childBirthDates?: string[];
  guestNames?: string[];
  rentalDetails?: Record<
    number,
    { activity: string; shoe: string; height: string; weight: string }
  >;
  contact?: ContactDetails;
  endDate?: string;
  lodging?: boolean;
  meal?: boolean;
  extraActivities?: ExtraActivityKey[];
  flowSnapshot?: FlowDraft;
};
const bookingTypeName = (booking: Booking) =>
  booking.sourceEntry === "rental"
    ? "Utrustningshyra"
    : booking.sourceEntry === "school"
      ? booking.items.some((item) => item.includes("Cykelskola"))
        ? "Cykelskola"
        : "Skidskola"
      : booking.sourceEntry === "activity"
        ? "Aktiviteter"
        : booking.kind === "day"
          ? "Dagsbesök"
          : booking.kind === "stay"
            ? "Boende & aktivitet"
            : "Gruppbokning";
function BookingTypeIcon({
  booking,
  size = 19,
}: {
  booking: Booking;
  size?: number;
}) {
  if (booking.sourceEntry === "rental") return <Bike size={size} />;
  if (booking.sourceEntry === "school") return <Users size={size} />;
  if (booking.sourceEntry === "activity") return <Activity size={size} />;
  if (booking.kind === "day") return <Snowflake size={size} />;
  if (booking.kind === "stay") return <Home size={size} />;
  return <Users size={size} />;
}
type Page = "overview" | FlowEntry | "admin" | "auth";
type Season = "winter" | "summer";
type CheckoutMode = "guest" | "login";
type AuthView = "choice" | "login" | "signup" | "account";
type PaymentMethod =
  "swish" | "card" | "applepay" | "googlepay" | "klarna" | "invoice";
type ExtraActivityKey = "snowshoe" | "sledding" | "canoe" | "climbing";
const EXTRA_ACTIVITIES: Record<
  ExtraActivityKey,
  { name: string; en: string; detail: string; price: number; season: Season }
> = {
  snowshoe: {
    name: "Snöskovandring",
    en: "Snowshoe walk",
    detail: "Guidad tur i skogen · från 8 år",
    price: 149,
    season: "winter",
  },
  sledding: {
    name: "Pulkäventyr",
    en: "Sledding adventure",
    detail: "Pulka och ledare ingår · alla åldrar",
    price: 89,
    season: "winter",
  },
  canoe: {
    name: "Kanottur",
    en: "Canoe outing",
    detail: "Kanot, paddel och flytväst · från 8 år",
    price: 189,
    season: "summer",
  },
  climbing: {
    name: "Äventyrsbana",
    en: "Adventure course",
    detail: "Bana och säkerhetsutrustning · från 8 år",
    price: 249,
    season: "summer",
  },
};
const activityKeys = Object.keys(EXTRA_ACTIVITIES) as ExtraActivityKey[];
const paymentName = (method: PaymentMethod) =>
  ({
    swish: "Swish",
    card: "kort",
    applepay: "Apple Pay",
    googlepay: "Google Pay",
    klarna: "Klarna",
    invoice: "faktura",
  })[method];
const paymentStatus = (method: PaymentMethod) =>
  method === "invoice" ? "Faktura väntar" : `Betald · ${paymentName(method)}`;
type DayDraft = {
  activity: "ski" | "bike";
  skiPass: "full" | "afternoon";
  date: string;
  endDate?: string;
  lodging?: boolean;
  meal?: boolean;
  extraActivities?: ExtraActivityKey[];
  slot: string;
  adults: number;
  children: number;
  childAges: (number | null)[];
  rental: boolean;
  name: string;
  email: string;
  contact?: ContactDetails;
  checkoutMode?: CheckoutMode;
  paymentMethod?: PaymentMethod;
  checkoutVersion?: 2;
  step: number;
  total: number;
};
type StayDraft = {
  lang: "sv" | "en";
  step: number;
  start: string;
  nights: number;
  meal?: boolean;
  extraActivities?: ExtraActivityKey[];
  lodge: "cabin" | "camp";
  bike: boolean;
  rental: boolean;
  adults: number;
  children: number;
  childAges: (number | null)[];
  rentalCount: number;
  name: string;
  email: string;
  contact?: ContactDetails;
  checkoutMode?: CheckoutMode;
  paymentMethod?: PaymentMethod;
  checkoutVersion?: 2;
  total: number;
};
type CartEntry =
  | { id: "day-winter" | "day-summer"; draft: DayDraft }
  | { id: "stay-summer"; draft: StayDraft }
  | { id: `flow-${FlowEntry}-${FlowSeason}`; draft: FlowDraft };

const SEK = (n: number) =>
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(n);
const dateOffset = (date: string, days: number) => {
  const base = Date.parse(`${date}T12:00:00Z`);
  return Number.isNaN(base)
    ? date
    : new Date(base + days * 86400000).toISOString().slice(0, 10);
};
const dateSpan = (start: string, end: string) => {
  const a = Date.parse(`${start}T12:00:00Z`);
  const b = Date.parse(`${end}T12:00:00Z`);
  return Number.isNaN(a) || Number.isNaN(b)
    ? 0
    : Math.round((b - a) / 86400000);
};
const EXAMPLE_FIRST_NAMES = [
  "Alma",
  "Olivia",
  "Elsa",
  "Maja",
  "Nora",
  "Freja",
  "Saga",
  "Alicia",
  "Ella",
  "Selma",
  "Leah",
  "Ida",
  "Mira",
  "Lilly",
  "Sofia",
  "Amira",
  "Elias",
  "Noah",
  "Hugo",
  "William",
  "Oscar",
  "Liam",
  "Leo",
  "Nils",
  "August",
  "Oliver",
  "Felix",
  "Adam",
  "Isak",
  "Viggo",
  "Samir",
  "Theo",
  "Emil",
  "Arvid",
  "Milo",
  "Lukas",
  "Benjamin",
  "Anton",
  "Malte",
  "Yusuf",
];
const EXAMPLE_LAST_NAMES = [
  "Andersson",
  "Johansson",
  "Karlsson",
  "Nilsson",
  "Eriksson",
  "Larsson",
  "Olsson",
  "Persson",
  "Svensson",
  "Gustafsson",
  "Lindberg",
  "Lindström",
  "Bergström",
  "Sandberg",
  "Holm",
  "Berg",
  "Håkansson",
  "Lundqvist",
  "Nyström",
  "Ek",
  "Forsberg",
  "Sjöberg",
  "Dahl",
  "Wallin",
  "Jönsson",
  "Hedlund",
  "Björk",
  "Lind",
  "Åberg",
  "Norberg",
  "Hussein",
  "Ali",
  "Khan",
  "Hassan",
  "Saleh",
  "Mohamed",
  "Lund",
  "Ström",
  "Eklund",
  "Rashid",
];
const exampleName = (index: number) =>
  `${EXAMPLE_FIRST_NAMES[index % EXAMPLE_FIRST_NAMES.length]} ${EXAMPLE_LAST_NAMES[(index * 7 + Math.floor(index / 40)) % EXAMPLE_LAST_NAMES.length]}`;
const exampleBirthDate = (index: number) =>
  `${2012 + (index % 4)}-${String(1 + ((index * 7) % 12)).padStart(2, "0")}-${String(1 + ((index * 11) % 28)).padStart(2, "0")}`;
const equipmentChoice = (participant: Participant) =>
  participant.equipment ||
  (participant.shoe || participant.height || participant.weight
    ? "borrow"
    : "own");
const participantComplete = (participant: Participant, visitDate: string) =>
  Boolean(
    participant.name.trim() &&
    (participant.role === "teacher" ||
      (/^\d{4}-\d{2}-\d{2}$/.test(participant.birthDate || "") &&
        !Number.isNaN(Date.parse(participant.birthDate)) &&
        participant.birthDate < visitDate)) &&
    participant.activity &&
    (equipmentChoice(participant) === "own" ||
      (participant.shoe && participant.height && participant.weight)),
  );
const exampleParticipants = (): Participant[] =>
  Array.from({ length: 84 }, (_, i) => ({
    name: exampleName(i),
    role: i < 80 ? null : "teacher",
    birthDate: i < 76 ? exampleBirthDate(i) : "",
    activity:
      i >= 80
        ? "Medföljande"
        : i % 3 === 0 && i % 4 === 0
          ? "Snowboard"
          : "Skidåkning",
    equipment: i >= 80 || (i < 76 && i % 4 === 0) ? "own" : "borrow",
    shoe: i < 76 && i % 4 !== 0 ? String(34 + (i % 10)) : "",
    height: i < 76 && i % 4 !== 0 ? String(145 + (i % 35)) : "",
    weight: i < 76 && i % 4 !== 0 ? String(40 + (i % 25)) : "",
  }));
const seed: Booking[] = [
  {
    id: "FL-2418",
    kind: "day",
    status: "Bekräftad",
    payment: "Betald",
    name: "Anna Lind",
    email: "anna@example.com",
    contact: exampleContact(),
    date: "2027-02-10",
    total: 1840,
    items: ["Skidpass familj", "Skidhyra 2 barn"],
    details: "2 vuxna, 2 barn · Skostorlekar 34 och 37",
    childAges: [10, 12],
    guestNames: ["Anna Lind", "Erik Lind", "Maja Lind", "Leo Lind"],
    childBirthDates: ["2016-05-14", "2014-08-22"],
    history: ["Bokning bekräftad 2026-09-26"],
  },
  {
    id: "FL-2392",
    kind: "stay",
    status: "Bekräftad",
    payment: "Betald",
    name: "The Miller family",
    email: "miller@example.com",
    contact: {
      phone: "070-234 56 78",
      street: "Sjövägen 8",
      postalCode: "141 44",
      city: "Huddinge",
    },
    date: "2027-07-12",
    total: 9265,
    items: ["Familjestugan · 3 nätter", "Cykelpass · 4 dagar", "Cykelhyra · 2 personer"],
    details: "2 adults, 2 children · English confirmation",
    guestNames: ["Emma Miller", "James Miller", "Olivia Miller", "Noah Miller"],
    childBirthDates: ["2015-04-19", "2013-09-11"],
    history: ["Booking confirmed 2026-09-20"],
    nights: 3,
  },
  {
    id: "GR-0812",
    kind: "group",
    status: "Preliminär",
    payment: "Faktura väntar",
    name: "Björkskolan",
    email: "bokning@bjorkskolan.se",
    contact: exampleGroupContact(),
    date: "2027-02-18",
    total: 28200,
    items: [
      "Vinterfriluftsdag",
      "84 personer",
      "80 elever",
      "4 lärare",
      "61 lånar skidutrustning",
    ],
    details: "80 av 84 deltagare kompletta",
    history: ["Gruppförfrågan skapad 2026-09-29"],
    participants: exampleParticipants(),
  },
];
const draftForBooking = (booking: Booking, edit: boolean): FlowDraft => {
  const season: FlowSeason = booking.flowSnapshot?.season ??
    (Number(booking.date.slice(5, 7)) >= 5 && Number(booking.date.slice(5, 7)) <= 9 ? "summer" : "winter");
  const entry: FlowEntry = booking.flowSnapshot?.entry ?? booking.sourceEntry ??
    (booking.kind === "stay" ? "stay" : booking.kind === "group" ? "group" : "day");
  const draft = booking.flowSnapshot
    ? structuredClone(booking.flowSnapshot)
    : createFlowDraft(entry, season);
  if (draft.pass === "none") {
    if (booking.items.some((item) => /skipass|skidpass/i.test(item))) draft.pass = "full";
    else if (booking.items.some((item) => /cykelpass|cykling/i.test(item))) draft.pass = "bike";
  }
  if (draft.cabin === "none" && booking.kind === "stay") draft.cabin = "family";
  if (!booking.flowSnapshot) {
    draft.start = booking.date;
    const inferredNights = booking.nights ?? Number(booking.items.join(" ").match(/(\d+) nätter?/)?.[1] ?? 0);
    draft.end = booking.endDate ?? (inferredNights ? dateOffset(booking.date, inferredNights) : booking.date);
    draft.org = booking.kind === "group" ? booking.name : "";
    draft.participants = booking.participants ?? [];
    draft.groupCount = booking.participants?.length ?? draft.groupCount;
    if (booking.kind === "stay") draft.cabin = "family";
    draft.pass = booking.items.some((item) => /skidpass|skidåkning/i.test(item))
      ? "full" : booking.items.some((item) => /cykl/i.test(item)) ? "bike" : "none";
    if (booking.kind !== "group") {
      draft.adults = Number(booking.details.match(/(\d+) (?:vux|adults?)/i)?.[1] ?? 2);
      draft.children = booking.childBirthDates?.length ?? booking.childAges?.length ?? Number(booking.details.match(/(\d+) (?:barn|children)/i)?.[1] ?? 0);
      draft.guests = booking.guestNames ?? Array.from({ length: draft.adults + draft.children }, (_, index) =>
        index === 0 ? booking.name : index < draft.adults ? `Vuxen ${index + 1}` : `Barn ${index - draft.adults + 1}`,
      );
      draft.childBirthDates = booking.childBirthDates ?? (booking.childAges ?? []).map((age, index) =>
        `${Number(booking.date.slice(0, 4)) - age}-01-${String(index + 10).padStart(2, "0")}`,
      );
      draft.childAges = draft.childBirthDates.map((date) => Number(booking.date.slice(0, 4)) - Number(date.slice(0, 4)));
      if (booking.id === "FL-2418") {
        draft.borrowGuests = [2, 3];
        draft.rentalDetails = {
          2: { activity: "Skidåkning", shoe: "34", height: "145", weight: "40" },
          3: { activity: "Skidåkning", shoe: "37", height: "155", weight: "48" },
        };
      } else if (booking.id === "FL-2392") {
        draft.borrowGuests = [0, 1];
        draft.rentalDetails = {
          0: { activity: "Cykling", shoe: "", height: "170", weight: "" },
          1: { activity: "Cykling", shoe: "", height: "180", weight: "" },
        };
      }
    }
  }
  return {
    ...draft,
    flowVersion: 5,
    step: 0,
    draftBookingId: edit && booking.status === "Preliminär" ? booking.id : undefined,
    editBookingId: edit && booking.status !== "Preliminär" ? booking.id : undefined,
    editOriginalTotal: edit && booking.status !== "Preliminär" ? booking.total : undefined,
    name: booking.kind === "group" ? (booking.contact?.contactPerson || booking.name) : booking.name,
    email: booking.email,
    contact: { ...emptyContact(), ...booking.contact },
    checkoutMode: "login",
    rebookQuick: false,
    payment: null,
    terms: false,
  };
};
const downloadInvoiceCsv = (booking: Booking) => {
  const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [
    ["Fakturaunderlag", booking.id],
    ["Organisation", booking.name],
    ["Kontaktperson", booking.contact?.contactPerson || booking.name],
    ["Faktura e-post", booking.contact?.billingEmail || booking.email],
    ["Organisationsnummer", booking.contact?.organisationNumber || ""],
    ["Referens", booking.contact?.invoiceReference || ""],
    ["Adress", formatAddress(booking.contact ?? emptyContact())],
    ["Period", `${booking.date}–${booking.endDate || booking.date}`],
    ...booking.items.map((item) => ["Bokad tjänst", item]),
    ["Totalt SEK", booking.total],
    ["Betalstatus", booking.payment],
  ];
  const csv = rows.map((row) => row.map(quote).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `fakturaunderlag-${booking.id}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const STORAGE_KEY = "flottsbro-bookings-v1";
const CART_KEY = "flottsbro-cart-v1";
const normalizeBooking = (booking: Booking): Booking => {
  const original = seed.find((item) => item.id === booking.id);
  const participants =
    booking.id === "GR-0812" && !booking.participants?.length
      ? original?.participants
      : booking.participants;
  const normalized: Booking = {
    ...booking,
    accountEmail: booking.accountEmail ?? original?.email ??
      (booking.flowSnapshot?.checkoutMode === "login" ? booking.email : undefined),
    contact: booking.contact ?? original?.contact,
    items: booking.id === "FL-2392" && booking.items.some((item) => item.includes("Stuga B"))
      ? original?.items ?? booking.items : booking.items,
    guestNames: booking.guestNames ?? original?.guestNames,
    childBirthDates: booking.childBirthDates ?? original?.childBirthDates,
    childAges: booking.childAges ?? original?.childAges,
    endDate: booking.endDate ?? original?.endDate,
    nights: booking.nights ?? original?.nights,
    date:
      booking.id === "FL-2418" && booking.date === "2026-10-10"
        ? "2027-02-10"
        : booking.date,
    total:
      booking.id === "FL-2418" && [1495, 1740].includes(booking.total)
        ? 1840
        : booking.id === "FL-2392" && [6890, 5890, 4105].includes(booking.total)
          ? 9265
          : booking.id === "GR-0812" && booking.total === 20800
            ? 28200
            : booking.total,
    payment: booking.payment.replace(/\s*\(demo\)/gi, ""),
    history: booking.history.map((entry) =>
      entry
        .replace(/\s*\(demo\)/gi, "")
        .replace("Betalning simulerad", "Betalning registrerad")
        .replace(" simulerad ", " registrerad "),
    ),
    participants: participants?.map((participant, index) => ({
      ...participant,
      role: participant.role === "teacher" ? "teacher" : null,
      name: /^Elev\s+\d+$/i.test(participant.name)
        ? exampleName(index)
        : participant.name,
      birthDate:
        participant.birthDate === undefined
          ? booking.id === "GR-0812"
            ? exampleBirthDate(index)
            : ""
          : participant.birthDate,
      equipment: participant.equipment || equipmentChoice(participant),
    })),
  };
  return {
    ...normalized,
    flowSnapshot: normalized.flowSnapshot ?? draftForBooking(normalized, false),
  };
};
const load = (): Booking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: Booking[] = raw ? JSON.parse(raw) : seed;
    return Array.isArray(parsed) ? parsed.map(normalizeBooking) : seed.map(normalizeBooking);
  } catch {
    return seed.map(normalizeBooking);
  }
};
const loadCart = (): CartEntry[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            item &&
            (["day-winter", "day-summer", "stay-summer"].includes(item.id) ||
              /^flow-(day|stay|group|rental|school|activity)-(winter|summer)$/.test(
                item.id,
              )) &&
            item.draft &&
            typeof item.draft.total === "number",
        )
      : [];
  } catch {
    return [];
  }
};
const idFor = (kind: Kind) =>
  `${kind === "group" ? "GR" : "FL"}-${Math.floor(1000 + Math.random() * 8999)}`;
const today = () => new Date().toISOString().slice(0, 10);

function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button {...props} className={`button button-${variant} ${className}`}>
      {children}
    </button>
  );
}
function AutoFillButton({
  onClick,
  en = false,
}: {
  onClick: () => void;
  en?: boolean;
}) {
  const label = en
    ? "Fill this step with example details"
    : "Fyll i detta steg med exempeluppgifter";
  return (
    <button
      type="button"
      className="auto-fill-button"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <WandSparkles size={19} strokeWidth={1.8} />
    </button>
  );
}
function PeriodPicker({
  start,
  end,
  onChange,
  overnight = false,
  en = false,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  overnight?: boolean;
  en?: boolean;
}) {
  const [month, setMonth] = useState(start.slice(0, 7));
  const [choosingEnd, setChoosingEnd] = useState(false);
  useEffect(() => {
    if (start) setMonth(start.slice(0, 7));
  }, [start]);
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const numberOfDays = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const cells = Array.from(
    { length: Math.ceil((offset + numberOfDays) / 7) * 7 },
    (_, i) => {
      const day = i - offset + 1;
      return day >= 1 && day <= numberOfDays
        ? `${month}-${String(day).padStart(2, "0")}`
        : "";
    },
  );
  const format = (value: string) =>
    value
      ? new Date(`${value}T12:00:00Z`).toLocaleDateString(
          en ? "en-GB" : "sv-SE",
          { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
        )
      : "—";
  const changeMonth = (step: number) => {
    const next = new Date(Date.UTC(year, monthIndex - 1 + step, 1));
    setMonth(
      `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`,
    );
  };
  const choose = (value: string) => {
    if (!choosingEnd || value < start) {
      onChange(value, overnight ? dateOffset(value, 1) : value);
      setChoosingEnd(true);
    } else if (!overnight || value > start) {
      onChange(start, value);
      setChoosingEnd(false);
    }
  };
  const amount = dateSpan(start, end) + (overnight ? 0 : 1);
  return (
    <div className="period-picker">
      <div className="period-heading">
        <CalendarDays size={18} />
        <div>
          <strong>{en ? "Choose your dates" : "Välj datumperiod"}</strong>
          <small>
            {en
              ? "Select the first date, then the last date in the calendar."
              : "Välj först startdatum och sedan slutdatum i kalendern."}
          </small>
        </div>
      </div>
      <div className="period-values">
        <button
          type="button"
          className={!choosingEnd ? "active" : ""}
          onClick={() => setChoosingEnd(false)}
        >
          <span>
            {overnight
              ? en
                ? "Arrival"
                : "Ankomst"
              : en
                ? "From"
                : "Från och med"}
          </span>
          <strong>{format(start)}</strong>
        </button>
        <ArrowRight size={17} aria-hidden="true" />
        <button
          type="button"
          className={choosingEnd ? "active" : ""}
          onClick={() => setChoosingEnd(true)}
        >
          <span>
            {overnight
              ? en
                ? "Departure"
                : "Avresa"
              : en
                ? "To"
                : "Till och med"}
          </span>
          <strong>{format(end)}</strong>
        </button>
      </div>
      <div className="period-calendar">
        <div className="period-calendar-head">
          <button
            type="button"
            aria-label={en ? "Previous month" : "Föregående månad"}
            onClick={() => changeMonth(-1)}
          >
            <ArrowLeft size={16} />
          </button>
          <strong>
            {first.toLocaleDateString(en ? "en-GB" : "sv-SE", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </strong>
          <button
            type="button"
            aria-label={en ? "Next month" : "Nästa månad"}
            onClick={() => changeMonth(1)}
          >
            <ArrowRight size={16} />
          </button>
        </div>
        <div
          className="period-calendar-grid"
          role="grid"
          aria-label={en ? "Choose dates" : "Välj datum"}
        >
          {(en
            ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
            : ["Må", "Ti", "On", "To", "Fr", "Lö", "Sö"]
          ).map((day) => (
            <span className="period-weekday" key={day}>
              {day}
            </span>
          ))}
          {cells.map((value, i) =>
            value ? (
              <button
                type="button"
                key={value}
                aria-label={format(value)}
                aria-pressed={value === start || value === end}
                disabled={value < today()}
                className={`${value >= start && value <= end ? "in-range" : ""} ${value === start || value === end ? "endpoint" : ""}`}
                onClick={() => choose(value)}
              >
                {Number(value.slice(-2))}
              </button>
            ) : (
              <span key={`empty-${i}`} />
            ),
          )}
        </div>
      </div>
      <div className="period-feedback" aria-live="polite">
        {choosingEnd
          ? en
            ? "Now choose the last date"
            : "Välj nu slutdatum"
          : `${amount} ${overnight ? (en ? (amount === 1 ? "night" : "nights") : amount === 1 ? "natt" : "nätter") : en ? (amount === 1 ? "day" : "days") : amount === 1 ? "dag" : "dagar"} ${en ? "selected" : "valda"}`}
      </div>
    </div>
  );
}
function ActivityChoices({
  season,
  selected,
  onChange,
  perDay = false,
  en = false,
}: {
  season: Season;
  selected: ExtraActivityKey[];
  onChange: (next: ExtraActivityKey[]) => void;
  perDay?: boolean;
  en?: boolean;
}) {
  return (
    <div className="extra-activities">
      <div className="extra-activities-heading">
        <strong>{en ? "More activities" : "Fler aktiviteter"}</strong>
        <small>
          {en
            ? perDay
              ? "Price per person and day"
              : "Price per person, once during your stay"
            : perDay
              ? "Pris per person och dag, under hela perioden"
              : "Pris per person, en gång under vistelsen"}
        </small>
      </div>
      {activityKeys
        .filter((key) => EXTRA_ACTIVITIES[key].season === season)
        .map((key) => {
          const item = EXTRA_ACTIVITIES[key];
          return (
            <label className="checkbox-row" key={key}>
              <input
                type="checkbox"
                checked={selected.includes(key)}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selected, key]
                      : selected.filter((current) => current !== key),
                  )
                }
              />
              <span>
                <strong>{en ? item.en : item.name}</strong>
                <small>{item.detail}</small>
              </span>
              <b>{SEK(item.price)}</b>
            </label>
          );
        })}
    </div>
  );
}
function FormGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="form-group">
      <div className="form-group-heading">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      <div className="form-grid">{children}</div>
    </section>
  );
}
function AddressFields({
  contact,
  onChange,
  en = false,
  billing = false,
}: {
  contact: ContactDetails;
  onChange: (contact: ContactDetails) => void;
  en?: boolean;
  billing?: boolean;
}) {
  const update = (key: keyof ContactDetails, value: string) =>
    onChange({ ...contact, [key]: value });
  return (
    <>
      <Field
        label={billing ? "Fakturaadress" : en ? "Street address" : "Gatuadress"}
      >
        <input
          autoComplete="street-address"
          value={contact.street}
          onChange={(e) => update("street", e.target.value)}
          placeholder="Björkvägen 12"
        />
      </Field>
      <Field
        label={
          en
            ? "Address line 2 (optional)"
            : "c/o, lägenhet eller avdelning (valfritt)"
        }
      >
        <input
          autoComplete="address-line2"
          value={contact.addressLine2 || ""}
          onChange={(e) => update("addressLine2", e.target.value)}
          placeholder={
            billing ? "Ekonomiavdelningen" : "c/o eller lägenhetsnummer"
          }
        />
      </Field>
      <Field label={en ? "Postal code" : "Postnummer"}>
        <input
          autoComplete="postal-code"
          inputMode="numeric"
          value={contact.postalCode}
          onChange={(e) => update("postalCode", e.target.value)}
          placeholder="141 41"
        />
      </Field>
      <Field label={en ? "City" : "Postort"}>
        <input
          autoComplete="address-level2"
          value={contact.city}
          onChange={(e) => update("city", e.target.value)}
          placeholder="Huddinge"
        />
      </Field>
      <Field label={en ? "Country" : "Land"}>
        <select
          autoComplete="country-name"
          value={contact.country || "Sverige"}
          onChange={(e) => update("country", e.target.value)}
        >
          <option>Sverige</option>
        </select>
      </Field>
    </>
  );
}
function AccountStep({
  mode,
  onModeChange,
  loginEmail,
  onEmailChange,
  password,
  onPasswordChange,
  en = false,
}: {
  mode: CheckoutMode | null;
  onModeChange: (mode: CheckoutMode) => void;
  loginEmail: string;
  onEmailChange: (email: string) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  en?: boolean;
}) {
  return (
    <div className="card padded checkout-card">
      <div className="card-title">
        <Users size={21} />
        <div>
          <h2>
            {en ? "How would you like to continue?" : "Hur vill du fortsätta?"}
          </h2>
          <p>
            {en
              ? "Choose an account or continue without signing in."
              : "Välj konto eller fortsätt utan att logga in."}
          </p>
        </div>
      </div>
      <div
        className="checkout-options"
        role="radiogroup"
        aria-label={en ? "Account choice" : "Välj konto eller gäst"}
      >
        <button
          type="button"
          className={`checkout-option ${mode === "guest" ? "selected" : ""}`}
          role="radio"
          aria-checked={mode === "guest"}
          onClick={() => onModeChange("guest")}
        >
          <Users size={22} />
          <span>
            <strong>{en ? "Continue as guest" : "Fortsätt som gäst"}</strong>
            <small>
              {en
                ? "Enter your contact details in the next step."
                : "Fyll i dina kontaktuppgifter i nästa steg."}
            </small>
          </span>
          <span className="checkout-radio" />
        </button>
        <button
          type="button"
          className={`checkout-option ${mode === "login" ? "selected" : ""}`}
          role="radio"
          aria-checked={mode === "login"}
          onClick={() => onModeChange("login")}
        >
          <ShieldCheck size={22} />
          <span>
            <strong>{en ? "Sign in" : "Logga in"}</strong>
            <small>
              {en
                ? "Use an email address and password."
                : "Använd e-postadress och lösenord."}
            </small>
          </span>
          <span className="checkout-radio" />
        </button>
      </div>
      {mode === "login" && (
        <div className="checkout-login">
          <div className="form-grid">
            <Field label={en ? "Email" : "E-postadress"}>
              <input
                type="email"
                autoComplete="username"
                value={loginEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="namn@exempel.se"
              />
            </Field>
            <Field label={en ? "Password" : "Lösenord"}>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Minst 4 tecken"
              />
            </Field>
          </div>
          <p className="checkout-note">
            {en
              ? "Sign-in is simulated locally. Your password is not saved."
              : "Inloggningen simuleras lokalt. Lösenordet sparas inte."}
          </p>
        </div>
      )}
    </div>
  );
}
function BrandLogo({
  icon,
  color,
  size = 36,
}: {
  icon: { path: string; title: string };
  color: string;
  size?: number;
}) {
  return (
    <svg
      className="payment-brand"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={icon.title}
      style={{ color }}
    >
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
}
function PaymentStep({
  method,
  onChange,
  total,
  en = false,
  allowInvoice = true,
}: {
  method: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  total: number;
  en?: boolean;
  allowInvoice?: boolean;
}) {
  const options: PaymentMethod[] = [
    "card",
    "klarna",
    "swish",
    "applepay",
    "googlepay",
    ...(allowInvoice ? (["invoice"] as PaymentMethod[]) : []),
  ];
  return (
    <div className="card padded checkout-card">
      <div className="card-title">
        <CreditCard size={21} />
        <div>
          <h2>{en ? "Choose payment method" : "Välj betalningssätt"}</h2>
          <p>
            {en
              ? "Review the total before confirming."
              : "Se totalsumman innan du bekräftar."}
          </p>
        </div>
      </div>
      <fieldset
        className="flow-payment-list"
        aria-label={en ? "Payment method" : "Betalningssätt"}
      >
        {options.map((option) => (
          <label
            key={option}
            className={`flow-payment-choice ${method === option ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="legacy-payment-method"
              value={option}
              checked={method === option}
              onChange={() => onChange(option)}
            />
            <span className="flow-payment-label">
              {
                {
                  card: en ? "Credit card" : "Betalkort",
                  klarna: "Klarna",
                  swish: "Swish",
                  applepay: "Apple Pay",
                  googlepay: "Google Pay",
                  invoice: en ? "Invoice" : "Faktura",
                }[option]
              }
            </span>
            <span className="flow-payment-brands" aria-hidden="true">
              {option === "card" && (
                <>
                  <span className="flow-payment-brand">
                    <BrandLogo icon={siVisa} color="#1434CB" size={29} />
                  </span>
                  <span className="flow-payment-brand">
                    <BrandLogo icon={siMastercard} color="#EB001B" size={27} />
                  </span>
                  <span className="flow-payment-brand">
                    <BrandLogo
                      icon={siAmericanexpress}
                      color="#006FCF"
                      size={25}
                    />
                  </span>
                  <span className="flow-payment-brand">
                    <BrandLogo icon={siJcb} color="#1D5A97" size={26} />
                  </span>
                </>
              )}
              {option === "klarna" && (
                <span className="flow-payment-brand klarna">
                  <BrandLogo icon={siKlarna} color="#111" size={31} />
                </span>
              )}
              {option === "swish" && (
                <span className="flow-payment-wordmark swish">swish</span>
              )}
              {option === "applepay" && (
                <span className="flow-payment-brand wallet">
                  <BrandLogo icon={siApplepay} color="#111" size={38} />
                </span>
              )}
              {option === "googlepay" && (
                <span className="flow-payment-brand wallet">
                  <BrandLogo icon={siGooglepay} color="#4285F4" size={38} />
                </span>
              )}
              {option === "invoice" && (
                <span className="flow-payment-wordmark invoice">
                  {en ? "Invoice" : "Fakturaunderlag"}
                </span>
              )}
            </span>
          </label>
        ))}
      </fieldset>
      <div className="payment-total">
        <span>{en ? "To pay" : "Att betala"}</span>
        <strong>{SEK(total)}</strong>
      </div>
      <p className="checkout-note">
        {en
          ? "This is a simulated payment. No money is charged."
          : "Betalningen simuleras. Inga pengar dras."}
      </p>
    </div>
  );
}
function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "amber" | "blue" | "red";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
function SectionHead({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
function Stepper({ current, labels }: { current: number; labels: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    const active = container?.children[current] as HTMLElement | undefined;
    if (!container || !active) return;
    const offset =
      active.getBoundingClientRect().left -
      container.getBoundingClientRect().left +
      container.scrollLeft;
    container.scrollTo({
      left: offset - (container.clientWidth - active.clientWidth) / 2,
      behavior: "smooth",
    });
  }, [current]);
  return (
    <div className="stepper" ref={ref}>
      {labels.map((label, i) => (
        <div className={`step ${i <= current ? "active" : ""}`} key={label}>
          <span>{i < current ? <Check size={13} /> : i + 1}</span>
          {label}
        </div>
      ))}
    </div>
  );
}
function SummaryLine({ label, price }: { label: string; price: number }) {
  return (
    <div className="summary-line">
      <span>{label}</span>
      <strong>{SEK(price)}</strong>
    </div>
  );
}
function GuestPicker({
  adults,
  children,
  onAdultsChange,
  onChildrenChange,
  maxTotal,
  en = false,
  childAges,
  onChildAgeChange,
  minChildAge = 5,
}: {
  adults: number;
  children: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  maxTotal: number;
  en?: boolean;
  childAges: (number | null)[];
  onChildAgeChange: (index: number, age: number | null) => void;
  minChildAge?: number;
}) {
  const full = adults + children >= maxTotal;
  return (
    <section className="guest-picker" aria-label={en ? "Guests" : "Gäster"}>
      <div className="guest-picker-head">
        <Users size={19} />
        <div>
          <h3>{en ? "Who's coming?" : "Vilka kommer?"}</h3>
          <p>
            {en
              ? `Add adults and children. Maximum ${maxTotal} guests.`
              : `Lägg till vuxna och barn. Högst ${maxTotal} personer.`}
          </p>
        </div>
      </div>
      <div className="counter-row">
        <div>
          <strong>{en ? "Adults" : "Vuxna"}</strong>
          <span>{en ? "16 years and older" : "Från 16 år"}</span>
        </div>
        <div className="counter">
          <button
            type="button"
            aria-label={en ? "Remove adult" : "Ta bort vuxen"}
            disabled={adults <= 1}
            onClick={() => onAdultsChange(adults - 1)}
          >
            <Minus size={15} />
          </button>
          <strong aria-live="polite">{adults}</strong>
          <button
            type="button"
            aria-label={en ? "Add adult" : "Lägg till vuxen"}
            disabled={full}
            onClick={() => onAdultsChange(adults + 1)}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
      <div className="counter-row">
        <div>
          <strong>{en ? "Children" : "Barn"}</strong>
          <span>{en ? `${minChildAge}–15 years` : `${minChildAge}–15 år`}</span>
        </div>
        <div className="counter">
          <button
            type="button"
            aria-label={en ? "Remove child" : "Ta bort barn"}
            disabled={children <= 0}
            onClick={() => onChildrenChange(children - 1)}
          >
            <Minus size={15} />
          </button>
          <strong aria-live="polite">{children}</strong>
          <button
            type="button"
            aria-label={en ? "Add child" : "Lägg till barn"}
            disabled={full}
            onClick={() => onChildrenChange(children + 1)}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
      {childAges.map((age, index) => (
        <label className="child-age" key={index}>
          <span>
            {en ? `Age of child ${index + 1}` : `Ålder på barn ${index + 1}`}
          </span>
          <select
            value={age ?? ""}
            onChange={(event) =>
              onChildAgeChange(
                index,
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
            aria-label={
              en ? `Age of child ${index + 1}` : `Ålder på barn ${index + 1}`
            }
          >
            <option value="">{en ? "Select age" : "Välj ålder"}</option>
            {Array.from(
              { length: 16 - minChildAge },
              (_, offset) => minChildAge + offset,
            ).map((value) => (
              <option key={value} value={value}>
                {value} {en ? "years" : "år"}
              </option>
            ))}
          </select>
        </label>
      ))}
    </section>
  );
}
function Confirmation({
  title,
  id,
  text,
  onBack,
  en = false,
  paymentLabel,
}: {
  title: string;
  id: string;
  text: string;
  onBack: () => void;
  en?: boolean;
  paymentLabel?: string;
}) {
  return (
    <div className="confirmation card">
      <div className="success-icon">
        <Check size={30} />
      </div>
      <div className="eyebrow">
        {en ? "BOOKING" : "BOKNING"} {id}
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="confirm-row">
        <Badge tone="green">
          <CheckCircle2 size={13} />{" "}
          {en ? "Confirmation created" : "Bekräftelse skapad"}
        </Badge>
        <Badge tone="blue">
          <CreditCard size={13} />{" "}
          {paymentLabel ||
            (en ? "Payment registered" : "Betalning registrerad")}
        </Badge>
      </div>
      <Button onClick={onBack}>
        {en ? "Back to overview" : "Tillbaka till översikten"}{" "}
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}

function PracticalInfo({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="practical-card card">
      <h2>{title}</h2>
      <div className="practical-grid">
        {rows.map((row) => (
          <div key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <div
        className="dialog card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        <div className="dialog-actions">
          <Button variant="secondary" onClick={onClose} autoFocus>
            Avbryt
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

type FinderEntry = Exclude<FlowEntry, "group">;
type FinderSelection = {
  entry: FinderEntry;
  start: string;
  end: string;
  adults: number;
  children: number;
  childAges: number[];
};

function ProductFinder({
  season,
  onSearch,
}: {
  season: Season;
  onSearch: (selection: FinderSelection) => void;
}) {
  const [entry, setEntry] = useState<FinderEntry>("stay");
  const [start, setStart] = useState(
    season === "winter" ? "2027-02-10" : "2027-07-12",
  );
  const [end, setEnd] = useState(
    season === "winter" ? "2027-02-13" : "2027-07-15",
  );
  const [adults, setAdults] = useState(2);
  const [childrenInput, setChildrenInput] = useState("0");
  const children = Number(childrenInput) || 0;
  const [childAges, setChildAges] = useState<(number | null)[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const next = season === "winter" ? "2027-02-10" : "2027-07-12";
    setStart(next);
    setEnd(dateOffset(next, 3));
    setError("");
  }, [season]);
  const choices: {
    id: FinderEntry | "package";
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: "stay", label: "Boende", icon: <Home size={18} /> },
    { id: "package", label: "Paket", icon: <ShoppingBag size={18} /> },
    {
      id: "day",
      label: season === "winter" ? "SkiPass" : "Cykelpass",
      icon: <MountainSnow size={18} />,
    },
    { id: "rental", label: "Hyra", icon: <Bike size={18} /> },
    {
      id: "school",
      label: season === "winter" ? "Skidskola" : "Cykelskola",
      icon: <Users size={18} />,
    },
    { id: "activity", label: "Aktiviteter", icon: <Activity size={18} /> },
  ];
  const submit = () => {
    if (!start || !end || end < start || (entry === "stay" && end === start)) {
      setError(
        entry === "stay"
          ? "Välj minst en natt för boende."
          : "Välj en giltig period.",
      );
      return;
    }
    if (childAges.some((age) => age === null || age < 0 || age > 17)) {
      setError("Ange ålder för varje barn.");
      return;
    }
    if (adults + children < 1) {
      setError("Välj minst en vuxen eller ett barn som ska delta.");
      return;
    }
    setError("");
    onSearch({
      entry,
      start,
      end,
      adults,
      children,
      childAges: childAges as number[],
    });
  };
  return (
    <section className="product-finder" aria-label="Hitta din upplevelse">
      <div className="product-finder-head">
        <div>
          <span className="eyebrow">BOKA FLOTTSBRO</span>
          <h2>Vad vill du göra?</h2>
        </div>
        <span>En plats. Alla möjligheter.</span>
      </div>
      <div
        className="product-finder-tabs"
        role="tablist"
        aria-label="Välj vad du vill boka"
      >
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            role="tab"
            aria-selected={entry === choice.id}
            disabled={choice.id === "package"}
            title={choice.id === "package" ? "Paket kommer senare" : undefined}
            className={entry === choice.id ? "selected" : ""}
            onClick={() => choice.id !== "package" && setEntry(choice.id)}
          >
            {choice.icon}
            <span>{choice.label}</span>
            {choice.id === "package" && <small>Kommer senare</small>}
          </button>
        ))}
      </div>
      <div className={`product-finder-form${children > 0 ? " has-children" : ""}`}>
        <div className="product-finder-field product-finder-period">
          <span className="product-finder-label">
            <CalendarDays size={17} /> Period
          </span>
          <div className="product-finder-dates">
            <label>
              Från
              <input
                type="date"
                value={start}
                onChange={(event) => {
                  const value = event.target.value;
                  setStart(value);
                  if (end < value) setEnd(value);
                  setError("");
                }}
              />
            </label>
            <label>
              Till
              <input
                type="date"
                min={
                  entry === "stay"
                    ? dateOffset(start || "2027-01-01", 1)
                    : start
                }
                value={end}
                onChange={(event) => {
                  setEnd(event.target.value);
                  setError("");
                }}
              />
            </label>
          </div>
        </div>
        <div className="product-finder-field product-finder-party">
          <span className="product-finder-label">
            <Users size={17} /> Sällskap
          </span>
          <div className="product-finder-counts">
            <label>
              Vuxna
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={adults}
                onChange={(event) =>
                  setAdults(
                    Math.max(0, Math.min(30, Number(event.target.value) || 0)),
                  )
                }
              />
            </label>
            <label>
              Barn
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={childrenInput}
                onFocus={() => {
                  if (children === 0) setChildrenInput("");
                }}
                onBlur={() => {
                  if (childrenInput === "") setChildrenInput("0");
                }}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "");
                  const count = Math.min(30, Number(digits) || 0);
                  setChildrenInput(digits === "" ? "" : String(count));
                  setChildAges((current) =>
                    Array.from({ length: count }, (_, i) => current[i] ?? null),
                  );
                }}
              />
            </label>
          </div>
        </div>
        {children > 0 && (
          <div className="product-finder-ages">
            {childAges.map((age, index) => (
              <label key={index}>
                Barn {index + 1}, ålder vid resan
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  value={age ?? ""}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "");
                    const age = digits === "" ? null : Math.min(17, Number(digits));
                    setChildAges((current) =>
                      current.map((item, i) => (i === index ? age : item)),
                    );
                  }}
                />
              </label>
            ))}
          </div>
        )}
        <button
          className="product-finder-submit"
          type="button"
          onClick={submit}
        >
          Fortsätt till{" "}
          {choices.find((choice) => choice.id === entry)?.label.toLowerCase()}{" "}
          <ArrowRight size={19} />
        </button>
      </div>
      {error && (
        <p className="product-finder-error" role="alert">
          {error}
        </p>
      )}
      <p className="product-finder-footnote">
        Datum och sällskap följer med genom bokningen. Du kan ändra dem senare.
      </p>
    </section>
  );
}

function Overview({
  go,
  season,
  onSearch,
}: {
  go: (p: Page) => void;
  season: Season;
  onSearch: (selection: FinderSelection) => void;
}) {
  const winter = season === "winter";
  return (
    <>
      <ProductFinder season={season} onSearch={onSearch} />
      <div className={`hero store-hero ${season}`}>
        <div className="hero-copy">
          <span className="store-kicker">
            {winter ? "VINTER PÅ FLOTTSBRO" : "SOMMAR PÅ FLOTTSBRO"}
          </span>
          <h1>
            {winter ? "Gör plats för" : "Upptäck sommaren"}
            <br />
            <em>{winter ? "vinterglädjen." : "på Flottsbro."}</em>
          </h1>
          <p>
            {winter
              ? "Bo nära backen, välj SkiPass, hyr utrustning, boka skidskola och upptäck fler aktiviteter. Allt samlat för din vistelse."
              : "Välj boende, cykelpass, hyr cykel eller boka en aktivitet. Planera din sommarvistelse på samma plats."}
          </p>
          <div className="store-hero-actions">
            <Button onClick={() => go("day")}>
              {winter ? "Boka skidpass" : "Boka cykling"}{" "}
              <ArrowRight size={17} />
            </Button>
            <button
              className="store-text-link"
              onClick={() => go(winter ? "group" : "stay")}
            >
              {winter ? "Planera gruppbesök" : "Hitta boende"}{" "}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div className="hero-art">
          <div className="sun" />
          <div className="mountain mountain-back" />
          <div className="mountain mountain-front" />
          <div className="hero-floating">
            <CalendarDays size={19} />
            <span>
              <strong>Din nästa upplevelse</strong>
              <small>börjar här</small>
            </span>
            <CheckCircle2 size={18} className="green" />
          </div>
        </div>
      </div>
      <div className="section-head small-gap store-section-head">
        <div>
          <div className="eyebrow">
            {winter ? "VINTER" : "SOMMAR"} · HITTA DIN UPPLEVELSE
          </div>
          <h2>
            {winter ? "Välj en vinterupplevelse" : "Välj en sommarupplevelse"}
          </h2>
          <p>Välj ett upplägg och anpassa period, antal gäster och tillval.</p>
        </div>
      </div>
      <div className="store-product-grid two">
        <button className="store-product" onClick={() => go("day")}>
          <span
            className={`store-product-image ${winter ? "ski" : "summer-bike"}`}
          >
            {winter ? <Snowflake size={38} /> : <Bike size={38} />}
            <span>{winter ? "En dag i backen" : "Ut på stigarna"}</span>
          </span>
          <span className="store-product-body">
            <span className="store-product-type">
              {winter ? "SKIPASS" : "CYKELPASS"}
            </span>
            <strong>{winter ? "Skidpass" : "Cykling"}</strong>
            <span>
              {winter
                ? "Välj heldag eller tre timmar, antal åkare och eventuell utrustning."
                : "Boka ett dagsbesök med ledpass för vuxna och barn. Cyklar kan läggas till."}
            </span>
            <span className="store-product-bottom">
              <b>Från {winter ? "190 kr/barn" : "220 kr/person"}</b>
              <span>
                {winter ? "Boka skidpass" : "Boka cykling"}{" "}
                <ArrowRight size={17} />
              </span>
            </span>
          </span>
        </button>
        {!winter && (
          <button className="store-product" onClick={() => go("stay")}>
            <span className="store-product-image stay">
              <TentTree size={38} />
              <span>Stanna lite längre</span>
            </span>
            <span className="store-product-body">
              <span className="store-product-type">BOENDE</span>
              <strong>Boende & aktivitet</strong>
              <span>
                Ta en paus från vardagen med boende, cykling och utrustning i
                samma bokning.
              </span>
              <span className="store-product-bottom">
                <b>Se pris för dina datum</b>
                <span>
                  Hitta boende <ArrowRight size={17} />
                </span>
              </span>
            </span>
          </button>
        )}
        {winter && (
          <button className="store-product" onClick={() => go("group")}>
            <span className="store-product-image group">
              <Users size={38} />
              <span>Bättre tillsammans</span>
            </span>
            <span className="store-product-body">
              <span className="store-product-type">GRUPPER</span>
              <strong>Gruppbokning</strong>
              <span>
                Planera flera dagar för klassen, föreningen eller företaget med
                aktiviteter för alla.
              </span>
              <span className="store-product-bottom">
                <b>Pris efter upplägg</b>
                <span>
                  Planera gruppbesök <ArrowRight size={17} />
                </span>
              </span>
            </span>
          </button>
        )}
        {winter && (
          <button className="store-product" onClick={() => go("stay")}>
            <span className="store-product-image stay">
              <TentTree size={38} />
              <span>Stanna längre</span>
            </span>
            <span className="store-product-body">
              <span className="store-product-type">BOENDE</span>
              <strong>Bo på Flottsbro</strong>
              <span>
                Jämför stugor efter antal bäddar och pris för hela perioden.
              </span>
              <span className="store-product-bottom">
                <b>Från 795 kr/natt</b>
                <span>
                  Hitta boende <ArrowRight size={17} />
                </span>
              </span>
            </span>
          </button>
        )}
        <button className="store-product" onClick={() => go("rental")}>
          <span className="store-product-image rental">
            <Bike size={38} />
            <span>Utrustning som passar</span>
          </span>
          <span className="store-product-body">
            <span className="store-product-type">HYRA</span>
            <strong>
              {winter ? "Hyr skidor eller snowboard" : "Hyr cykel"}
            </strong>
            <span>
              Välj vem som behöver låna och ange mått för rätt utrustning.
            </span>
            <span className="store-product-bottom">
              <b>Från {winter ? "230" : "220"} kr/person och dag</b>
              <span>
                Se hyrutrustning <ArrowRight size={17} />
              </span>
            </span>
          </span>
        </button>
        <button className="store-product" onClick={() => go("school")}>
          <span className="store-product-image school">
            <Users size={38} />
            <span>Lär tillsammans</span>
          </span>
          <span className="store-product-body">
            <span className="store-product-type">
              {winter ? "SKIDSKOLA" : "CYKELSKOLA"}
            </span>
            <strong>{winter ? "Boka skidskola" : "Boka cykelskola"}</strong>
            <span>Välj grupp- eller privatlektion, nivå och tid.</span>
            <span className="store-product-bottom">
              <b>Från 495 kr/person</b>
              <span>
                Se lektioner <ArrowRight size={17} />
              </span>
            </span>
          </span>
        </button>
        <button className="store-product" onClick={() => go("activity")}>
          <span className="store-product-image activity">
            <Activity size={38} />
            <span>Mer att uppleva</span>
          </span>
          <span className="store-product-body">
            <span className="store-product-type">AKTIVITETER</span>
            <strong>
              {winter ? "Aktiviteter i snön" : "Sommaraktiviteter"}
            </strong>
            <span>
              {winter
                ? "Snöskovandring, pulka, vinteräventyr och snölek."
                : "Kanot, äventyrsbana, orientering och naturvandring."}
            </span>
            <span className="store-product-bottom">
              <b>Från {winter ? "89" : "119"} kr/person</b>
              <span>
                Utforska aktiviteter <ArrowRight size={17} />
              </span>
            </span>
          </span>
        </button>
      </div>
      <div className="store-reassurance">
        <span>
          <CalendarDays size={18} /> Välj datum som passar
        </span>
        <span>
          <ShieldCheck size={18} /> Se hela bokningen före köp
        </span>
        <span>
          <CheckCircle2 size={18} /> Samla allt på ett ställe
        </span>
      </div>
    </>
  );
}

function Day({
  bookings,
  onBook,
  onUpdate,
  go,
  initialMode = "new",
  initialActivity = "ski",
  initialDraft,
  onCartChange,
}: {
  bookings: Booking[];
  onBook: (b: Booking) => void;
  onUpdate: (id: string, fn: (b: Booking) => Booking) => void;
  go: (p: Page) => void;
  initialMode?: "new" | "return";
  initialActivity?: "ski" | "bike";
  initialDraft?: DayDraft;
  onCartChange: (draft: DayDraft) => void;
}) {
  const [mode, setMode] = useState<"new" | "return">(initialMode);
  const [step, setStep] = useState(
    initialDraft?.checkoutVersion === 2
      ? initialDraft.step
      : (initialDraft?.step ?? 0) >= 2
        ? 2
        : (initialDraft?.step ?? 0),
  );
  const [activity, setActivity] = useState<"ski" | "bike">(
    initialDraft?.activity ?? initialActivity,
  );
  const [skiPass, setSkiPass] = useState<"full" | "afternoon">(
    initialDraft?.skiPass ?? "full",
  );
  const [date, setDate] = useState(
    initialDraft?.date ??
      (initialActivity === "ski" ? "2027-02-10" : "2027-07-10"),
  );
  const [endDate, setEndDate] = useState(
    initialDraft?.endDate ??
      initialDraft?.date ??
      (initialActivity === "ski" ? "2027-02-10" : "2027-07-10"),
  );
  const [lodging, setLodging] = useState(initialDraft?.lodging ?? false);
  const [extraActivities, setExtraActivities] = useState<ExtraActivityKey[]>(
    initialDraft?.extraActivities ?? [],
  );
  const [slot, setSlot] = useState(initialDraft?.slot ?? "10:00");
  const [adults, setAdults] = useState(initialDraft?.adults ?? 1);
  const [children, setChildren] = useState(initialDraft?.children ?? 0);
  const [childAges, setChildAges] = useState<(number | null)[]>(
    initialDraft?.childAges ?? [],
  );
  const [rental, setRental] = useState(initialDraft?.rental ?? false);
  const [name, setName] = useState(initialDraft?.name ?? "");
  const [email, setEmail] = useState(initialDraft?.email ?? "");
  const [contact, setContact] = useState<ContactDetails>(
    initialDraft?.contact ?? emptyContact(),
  );
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode | null>(
    initialDraft?.checkoutMode ?? null,
  );
  const [loginEmail, setLoginEmail] = useState(initialDraft?.email ?? "");
  const [loginPassword, setLoginPassword] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    initialDraft?.paymentMethod ?? null,
  );
  const [cartActive, setCartActive] = useState(Boolean(initialDraft));
  const [signed, setSigned] = useState(false);
  const [confirmed, setConfirmed] = useState("");
  const [editDates, setEditDates] = useState<Record<string, string>>({});
  const [cancelId, setCancelId] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);
  const adultPassPrice = skiPass === "full" ? 370 : 240;
  const childPassPrice = skiPass === "full" ? 320 : 190;
  const childrenPassPerDay = childAges.reduce<number>(
    (sum, age) =>
      sum +
      (age !== null && age < 8
        ? skiPass === "full"
          ? 170
          : 100
        : childPassPrice),
    0,
  );
  const visitDays = Math.max(1, dateSpan(date, endDate) + 1);
  const lodgingNights = Math.max(1, dateSpan(date, endDate));
  const lodgingPrice = lodging
    ? Math.ceil((adults + children) / 4) * 895 * lodgingNights
    : 0;
  const extraPrice = extraActivities.reduce(
    (sum, key) =>
      sum + EXTRA_ACTIVITIES[key].price * (adults + children) * visitDays,
    0,
  );
  const participantsText = `${adults} ${adults === 1 ? "vuxen" : "vuxna"}${children ? `, ${children} barn` : ""}`;
  const visitTime =
    activity === "ski" ? (skiPass === "full" ? "09:00" : "13:00") : slot;
  const price =
    visitDays *
      ((activity === "ski"
        ? adults * adultPassPrice + childrenPassPerDay
        : adults * 320 + children * 220) +
        (rental
          ? activity === "ski"
            ? children * 230
            : (adults + children) * 180
          : 0)) +
    lodgingPrice +
    extraPrice;
  useEffect(() => {
    if (cartActive && !confirmed && mode === "new")
      onCartChange({
        activity,
        skiPass,
        date,
        endDate,
        lodging,
        extraActivities,
        slot,
        adults,
        children,
        childAges,
        rental,
        name,
        email,
        contact,
        checkoutMode: checkoutMode ?? undefined,
        paymentMethod: paymentMethod ?? undefined,
        checkoutVersion: 2,
        step,
        total: price,
      });
  }, [
    cartActive,
    confirmed,
    mode,
    activity,
    skiPass,
    date,
    endDate,
    lodging,
    extraActivities,
    slot,
    adults,
    children,
    childAges,
    rental,
    name,
    email,
    contact,
    checkoutMode,
    paymentMethod,
    step,
    price,
  ]);
  const mine = bookings.filter(
    (b) => b.email.toLowerCase() === email.toLowerCase(),
  );
  const autoFill = () => {
    setError("");
    if (mode === "return") {
      setEmail("anna@example.com");
      setSigned(false);
    } else if (step === 0) {
      setAdults(2);
      setChildren(2);
      setChildAges([activity === "ski" ? 10 : 11, 13]);
    } else if (step === 1) {
      setDate(activity === "ski" ? "2027-02-10" : "2027-07-10");
      setEndDate(activity === "ski" ? "2027-02-12" : "2027-07-12");
      setLodging(true);
      setExtraActivities([activity === "ski" ? "snowshoe" : "canoe"]);
      if (activity === "bike") setSlot("10:00");
      setRental(activity === "bike" || children > 0);
    } else if (step === 2) {
      setCheckoutMode("guest");
    } else if (step === 3) {
      setName("Anna Lind");
      setEmail("anna@example.com");
      setContact(exampleContact());
    } else if (step === 5) {
      setPaymentMethod("swish");
    }
  };
  const submit = () => {
    if (!endDate || dateSpan(date, endDate) < 0) {
      setStep(1);
      setError("Välj ett slutdatum som inte är före startdatumet.");
      return;
    }
    if (!checkoutMode) {
      setStep(2);
      setError("Välj om du vill logga in eller fortsätta som gäst.");
      return;
    }
    if (childAges.some((age) => age === null)) {
      setStep(0);
      setError("Ange ålder för alla barn.");
      return;
    }
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Ange namn och en giltig e-postadress.");
      return;
    }
    if (!validContact(contact)) {
      setError("Ange telefonnummer och en fullständig svensk adress.");
      setStep(3);
      return;
    }
    if (!paymentMethod) {
      setError("Välj ett betalningssätt.");
      setStep(5);
      return;
    }
    const id = idFor("day");
    setCartActive(false);
    onBook({
      id,
      kind: "day",
      status: "Bekräftad",
      payment: paymentStatus(paymentMethod),
      name,
      email,
      contact,
      date,
      endDate,
      lodging,
      extraActivities,
      total: price,
      items: [
        activity === "ski"
          ? `Skidpass ${skiPass === "full" ? "heldag" : "3 timmar"} · ${visitDays} dagar`
          : `Cykling · ${visitDays} dagar`,
        rental
          ? activity === "ski"
            ? "Skidhyra"
            : "Cykelhyra"
          : "Egen utrustning",
        ...(lodging
          ? [
              `Boende · ${lodgingNights} nätter · pris från ${SEK(lodgingPrice)}`,
            ]
          : []),
        ...extraActivities.map(
          (key) =>
            `${EXTRA_ACTIVITIES[key].name} · ${visitDays} dagar · ${SEK(EXTRA_ACTIVITIES[key].price * (adults + children) * visitDays)}`,
        ),
      ],
      details: `${participantsText} · ${date}–${endDate} · kl. ${visitTime}`,
      childAges: childAges as number[],
      history: [
        `Bokning skapad ${today()}`,
        paymentMethod === "invoice"
          ? "Faktura vald"
          : `Betalning med ${paymentName(paymentMethod)} registrerad`,
      ],
    });
    setConfirmed(id);
  };
  if (confirmed)
    return (
      <>
        <SectionHead eyebrow="AKTIVITETER" title="Dagsbesök" />
        <Confirmation
          title="Vi ses på Flottsbro!"
          id={confirmed}
          text={`Bokningen är registrerad med ${email}. Spara bokningsnumret för ändringar inför besöket.`}
          paymentLabel={
            paymentMethod === "invoice"
              ? "Faktura vald"
              : `Betalning via ${paymentMethod ? paymentName(paymentMethod) : "kort"} registrerad`
          }
          onBack={() => go("overview")}
        />
        <PracticalInfo
          title="Inför ditt besök"
          rows={[
            { label: "När", value: `${date}–${endDate} kl. ${visitTime}` },
            { label: "Var", value: "Flottsbro · samling vid uthyrningen" },
            {
              label: "Ta med",
              value: rental
                ? "Kläder efter väder. Utrustning hämtas på plats."
                : "Egen utrustning och kläder efter väder.",
            },
            { label: "Totalt", value: SEK(price) },
            { label: "Kontaktadress", value: formatAddress(contact) },
          ]}
        />
      </>
    );
  return (
    <>
      {(mode === "return" || step !== 4) && (
        <AutoFillButton onClick={autoFill} />
      )}
      <SectionHead
        eyebrow={mode === "return" ? "MINA BOKNINGAR" : "AKTIVITETER"}
        title={
          mode === "return"
            ? "Dina bokningar"
            : "Planera ert besök på Flottsbro"
        }
        description={
          mode === "return"
            ? "Hitta ditt tidigare besök, gör en ändring eller boka igen."
            : "Välj aktivitet, se vad som ingår och boka på några minuter."
        }
        action={
          mode === "return" ? (
            <Button
              variant="secondary"
              onClick={() => {
                setMode("new");
                setStep(0);
              }}
            >
              Boka nytt besök <ArrowRight size={16} />
            </Button>
          ) : undefined
        }
      />
      {mode === "return" ? (
        <div className="content-grid">
          <div className="card padded">
            <div className="card-title">
              <div className="icon-box">
                <Users size={20} />
              </div>
              <div>
                <h2>Välkommen tillbaka</h2>
                <p>Hitta dina tidigare bokningar med e-postadress.</p>
              </div>
            </div>
            <Field label="E-postadress">
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSigned(false);
                }}
                placeholder="anna@example.com"
                type="email"
              />
            </Field>
            <Button
              onClick={() => setSigned(true)}
              disabled={!/^\S+@\S+\.\S+$/.test(email)}
            >
              Visa mina bokningar <ArrowRight size={16} />
            </Button>
            <p className="micro">
              Tips: prova <strong>anna@example.com</strong> för exempelhistorik.
            </p>
          </div>
          <div className="side-note card">
            <Clock3 size={21} />
            <h3>Snabbare andra gången</h3>
            <p>
              Se dina tidigare bokningar och hantera dina dagsbesök på ett
              ställe.
            </p>
          </div>
          {signed && (
            <div className="full-span">
              <h2 className="subheading">Mina bokningar</h2>
              {mine.length ? (
                mine.map((b) => (
                  <div className="booking-row card" key={b.id}>
                    <div className="booking-icon">
                      {b.sourceEntry === "rental" ? (
                        <Bike size={21} />
                      ) : b.sourceEntry === "school" ? (
                        <Users size={21} />
                      ) : b.sourceEntry === "activity" ? (
                        <Activity size={21} />
                      ) : b.kind === "stay" ? (
                        <TentTree size={21} />
                      ) : b.kind === "group" ? (
                        <Users size={21} />
                      ) : (
                        <Snowflake size={21} />
                      )}
                    </div>
                    <div className="booking-main">
                      <strong>{b.items.join(" + ")}</strong>
                      <span>
                        {b.id} · {b.date} · {b.details}
                      </span>
                      <div className="row-badges">
                        <Badge tone={b.status === "Avbokad" ? "red" : "green"}>
                          {b.status}
                        </Badge>
                        <Badge>{b.payment}</Badge>
                      </div>
                    </div>
                    <div className="booking-actions">
                      {b.kind === "day" &&
                        (!b.sourceEntry || b.sourceEntry === "day") && (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setName(b.name);
                                setActivity(
                                  b.items.some((i) => i.includes("Cyk"))
                                    ? "bike"
                                    : "ski",
                                );
                                setSkiPass(
                                  b.items.some((i) => i.includes("eftermiddag"))
                                    ? "afternoon"
                                    : "full",
                                );
                                setAdults(
                                  Number(
                                    b.details.match(
                                      /(\d+) vux(?:en|na)/,
                                    )?.[1] ?? 1,
                                  ),
                                );
                                setChildren(
                                  Number(
                                    b.details.match(/(\d+) barn/)?.[1] ?? 0,
                                  ),
                                );
                                setChildAges(
                                  b.childAges ??
                                    Array(
                                      Number(
                                        b.details.match(/(\d+) barn/)?.[1] ?? 0,
                                      ),
                                    ).fill(null),
                                );
                                setDate(b.date);
                                setRental(!b.items.includes("Egen utrustning"));
                                setMode("new");
                                setCartActive(true);
                                setStep(1);
                              }}
                            >
                              Boka igen
                            </Button>
                            {b.status !== "Avbokad" && (
                              <>
                                <input
                                  aria-label="Nytt datum"
                                  type="date"
                                  min={today()}
                                  value={editDates[b.id] ?? b.date}
                                  onChange={(e) =>
                                    setEditDates((dates) => ({
                                      ...dates,
                                      [b.id]: e.target.value,
                                    }))
                                  }
                                />
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    onUpdate(b.id, (old) => ({
                                      ...old,
                                      date: editDates[b.id] ?? b.date,
                                      history: [
                                        ...old.history,
                                        `Ombokad till ${editDates[b.id] ?? b.date} ${today()}`,
                                      ],
                                    }))
                                  }
                                >
                                  Ändra datum
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => setCancelId(b.id)}
                                >
                                  Avboka
                                </Button>
                              </>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty card">
                  Inga bokningar hittades för adressen.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <Stepper
            current={step}
            labels={[
              "Aktivitet",
              "Period & tillval",
              "Konto eller gäst",
              "Dina uppgifter",
              "Granska",
              "Betala",
            ]}
          />
          <div className="booking-layout">
            <div className="main-column">
              {step === 0 && (
                <>
                  <div className="section-mini">
                    <h2>
                      {initialActivity === "ski"
                        ? "Skidpass för ert besök"
                        : "Cykling för er dag"}
                    </h2>
                    <p>
                      {initialActivity === "ski"
                        ? "Välj antal åkare och fortsätt till pass och datum."
                        : "Välj antal cyklister och fortsätt till datum och utrustning."}
                    </p>
                  </div>
                  <div className="activity-grid single">
                    {initialActivity === "ski" && (
                      <button
                        className={`activity-card ${activity === "ski" ? "chosen" : ""}`}
                        onClick={() => {
                          setActivity("ski");
                          setExtraActivities([]);
                          setDate("2027-02-10");
                          setEndDate("2027-02-10");
                          setRental(false);
                        }}
                      >
                        <span className="illustration ski">
                          <MountainSnow size={44} />
                        </span>
                        <span className="activity-text">
                          <strong>Skidpass</strong>
                          <small>Passar nybörjare · från 5 år</small>
                          <span>
                            Välj heldag eller tre timmar. Skidor, pjäxor och
                            hjälm kan läggas till.
                          </span>
                          <b>Från 190 kr / barn</b>
                        </span>
                        {activity === "ski" && (
                          <span className="check-circle">
                            <Check size={14} />
                          </span>
                        )}
                      </button>
                    )}
                    {initialActivity === "bike" && (
                      <button
                        className={`activity-card ${activity === "bike" ? "chosen" : ""}`}
                        onClick={() => {
                          setActivity("bike");
                          setExtraActivities([]);
                          setDate("2027-07-10");
                          setEndDate("2027-07-10");
                          setChildAges((ages) =>
                            ages.map((age) =>
                              age !== null && age < 8 ? null : age,
                            ),
                          );
                        }}
                      >
                        <span className="illustration bike">
                          <Bike size={45} />
                        </span>
                        <span className="activity-text">
                          <strong>Cykling på Flottsbro</strong>
                          <small>Från 8 år · lätt till medel</small>
                          <span>
                            Ledpass ingår. Cykel och hjälm kan hyras på plats.
                          </span>
                          <b>Från 220 kr / barn</b>
                        </span>
                        {activity === "bike" && (
                          <span className="check-circle">
                            <Check size={14} />
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="card padded guest-card">
                    <GuestPicker
                      adults={adults}
                      children={children}
                      onAdultsChange={setAdults}
                      onChildrenChange={(value) => {
                        setChildren(value);
                        setChildAges((ages) =>
                          Array.from(
                            { length: value },
                            (_, index) => ages[index] ?? null,
                          ),
                        );
                        if (activity === "ski" && value === 0) setRental(false);
                      }}
                      maxTotal={18}
                      childAges={childAges}
                      minChildAge={activity === "ski" ? 5 : 8}
                      onChildAgeChange={(index, age) =>
                        setChildAges((ages) =>
                          ages.map((current, position) =>
                            position === index ? age : current,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="tip">
                    <Info size={17} />
                    <span>
                      Du ser hela priset innan du bekräftar bokningen.
                    </span>
                  </div>
                </>
              )}
              {step === 1 && (
                <div className="card padded">
                  <div className="card-title">
                    <CalendarDays size={21} />
                    <div>
                      <h2>
                        {activity === "ski"
                          ? "Välj skidpass och utrustning"
                          : "Välj dag och utrustning"}
                      </h2>
                      <p>Välj period och det som passar ert besök.</p>
                    </div>
                  </div>
                  <div className="form-grid">
                    <PeriodPicker
                      start={date}
                      end={endDate}
                      onChange={(from, to) => {
                        setDate(from);
                        setEndDate(to);
                      }}
                    />
                    {activity === "bike" && (
                      <Field label="Starttid">
                        <select
                          value={slot}
                          onChange={(e) => setSlot(e.target.value)}
                        >
                          <option>09:00</option>
                          <option>10:00</option>
                          <option>13:00</option>
                          <option>14:00</option>
                        </select>
                      </Field>
                    )}
                  </div>
                  {activity === "ski" && (
                    <div className="pass-section">
                      <div className="pass-section-title">
                        <strong>Välj skidpass</strong>
                        <span>Pris per person, inklusive liftkort</span>
                      </div>
                      <div
                        className="pass-options"
                        role="radiogroup"
                        aria-label="Skidpass"
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={skiPass === "full"}
                          className={`pass-option ${skiPass === "full" ? "selected" : ""}`}
                          onClick={() => setSkiPass("full")}
                        >
                          <span className="pass-radio" />
                          <span className="pass-option-copy">
                            <strong>Heldag</strong>
                            <small>09:00–16:00</small>
                          </span>
                          <span className="pass-option-price">
                            <strong>370 kr</strong>
                            <small>barn 8–15 år 320 kr · knatte 170 kr</small>
                          </span>
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={skiPass === "afternoon"}
                          className={`pass-option ${skiPass === "afternoon" ? "selected" : ""}`}
                          onClick={() => setSkiPass("afternoon")}
                        >
                          <span className="pass-radio" />
                          <span className="pass-option-copy">
                            <strong>3 timmar</strong>
                            <small>Start 13:00</small>
                          </span>
                          <span className="pass-option-price">
                            <strong>240 kr</strong>
                            <small>barn 8–15 år 190 kr · knatte 100 kr</small>
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="availability">
                    <span className="live-dot" /> 18 platser tillgängliga{" "}
                    {activity === "ski"
                      ? `för ${skiPass === "full" ? "heldag" : "tre timmar"}`
                      : `kl. ${slot}`}
                  </div>
                  {(activity === "bike" || children > 0) && (
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={rental}
                        onChange={(e) => setRental(e.target.checked)}
                      />
                      <span>
                        <strong>
                          Lägg till{" "}
                          {activity === "ski"
                            ? "skidhyra för barn"
                            : "cykelhyra för alla"}
                        </strong>
                        <small>Välj storlek vid utlämning. Hjälm ingår.</small>
                      </span>
                      <b>
                        {SEK(
                          activity === "ski"
                            ? children * 230
                            : (adults + children) * 180,
                        )}
                      </b>
                    </label>
                  )}
                  <div className="booking-extras">
                    <ActivityChoices
                      season={activity === "ski" ? "winter" : "summer"}
                      selected={extraActivities}
                      onChange={setExtraActivities}
                      perDay
                    />
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={lodging}
                        onChange={(e) => {
                          setLodging(e.target.checked);
                          if (e.target.checked && dateSpan(date, endDate) === 0)
                            setEndDate(dateOffset(date, 1));
                        }}
                      />
                      <span>
                        <strong>Behöver ni boende?</strong>
                        <small>
                          Stuga B, 4 bäddar. Från 895 kr per stuga och natt.
                          Tillgänglighet bekräftas separat.
                        </small>
                      </span>
                    </label>
                  </div>
                </div>
              )}
              {step === 2 && (
                <AccountStep
                  mode={checkoutMode}
                  onModeChange={setCheckoutMode}
                  loginEmail={loginEmail}
                  onEmailChange={setLoginEmail}
                  password={loginPassword}
                  onPasswordChange={setLoginPassword}
                />
              )}
              {step === 3 && (
                <div className="card padded">
                  <div className="card-title">
                    <Users size={21} />
                    <div>
                      <h2>Vem bokar?</h2>
                      <p>Bekräftelsen kopplas till din e-postadress.</p>
                    </div>
                  </div>
                  <FormGroup
                    title="Kontaktperson"
                    description="Vi använder uppgifterna för bekräftelse och information om besöket."
                  >
                    <Field label="För- och efternamn">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Anna Lind"
                        autoComplete="name"
                      />
                    </Field>
                    <Field label="E-postadress">
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="namn@exempel.se"
                        type="email"
                        autoComplete="email"
                      />
                    </Field>
                    <Field label="Mobilnummer">
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={contact.phone}
                        onChange={(e) =>
                          setContact({ ...contact, phone: e.target.value })
                        }
                        placeholder="070-123 45 67"
                      />
                    </Field>
                  </FormGroup>
                  <FormGroup
                    title="Adress"
                    description="Adress för bokningskvitto och eventuell kontakt inför besöket."
                  >
                    <AddressFields contact={contact} onChange={setContact} />
                  </FormGroup>
                  <FormGroup
                    title="Inför besöket"
                    description="Har någon i sällskapet särskilda behov eller något vi bör känna till?"
                  >
                    <Field label="Meddelande till Flottsbro (valfritt)">
                      <textarea
                        value={contact.note || ""}
                        onChange={(e) =>
                          setContact({ ...contact, note: e.target.value })
                        }
                        placeholder="Till exempel tillgänglighetsbehov"
                        rows={3}
                      />
                    </Field>
                  </FormGroup>
                  <div className="tip">
                    <ShieldCheck size={17} />
                    <span>
                      Du kan ändra eller avboka under Mina bokningar.
                      Avbokningsvillkor: kostnadsfritt fram till 48 timmar före
                      start.
                    </span>
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="card padded">
                  <div className="card-title">
                    <CreditCard size={21} />
                    <div>
                      <h2>Granska bokningen</h2>
                      <p>Kontrollera uppgifterna innan du bekräftar.</p>
                    </div>
                  </div>
                  <div className="review-list">
                    <div>
                      <span>Aktivitet</span>
                      <strong>
                        {activity === "ski"
                          ? `Skidpass ${skiPass === "full" ? "heldag" : "tre timmar"}`
                          : "Cykling"}
                      </strong>
                    </div>
                    <div>
                      <span>Datum & tid</span>
                      <strong>
                        {date}–{endDate} · {visitTime}
                      </strong>
                    </div>
                    <div>
                      <span>Deltagare</span>
                      <strong>{participantsText}</strong>
                    </div>
                    {children > 0 && (
                      <div>
                        <span>Barnens åldrar</span>
                        <strong>
                          {childAges
                            .map((age) => (age === null ? "–" : `${age} år`))
                            .join(", ")}
                        </strong>
                      </div>
                    )}
                    <div>
                      <span>Utrustning</span>
                      <strong>
                        {rental ? "Hyra ingår" : "Egen utrustning"}
                      </strong>
                    </div>
                    <div>
                      <span>Boende</span>
                      <strong>
                        {lodging
                          ? `${lodgingNights} nätter · från ${SEK(lodgingPrice)}`
                          : "Nej"}
                      </strong>
                    </div>
                    <div>
                      <span>Bokare</span>
                      <strong>
                        {name} · {email}
                      </strong>
                    </div>
                    <div>
                      <span>Bokningssätt</span>
                      <strong>
                        {checkoutMode === "login" ? "Med konto" : "Som gäst"}
                      </strong>
                    </div>
                    <div>
                      <span>Kontakt & adress</span>
                      <strong>
                        {contact.phone} · {formatAddress(contact)}
                      </strong>
                    </div>
                    {contact.note && (
                      <div>
                        <span>Meddelande</span>
                        <strong>{contact.note}</strong>
                      </div>
                    )}
                  </div>
                  <div className="terms">
                    Avbokning är kostnadsfri fram till 48 timmar före start.
                  </div>
                </div>
              )}
              {step === 5 && (
                <PaymentStep
                  method={paymentMethod}
                  onChange={setPaymentMethod}
                  total={price}
                />
              )}
              {error && <div className="error">{error}</div>}
              <div className="step-actions">
                {step > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setStep(step - 1);
                      setError("");
                    }}
                  >
                    <ArrowLeft size={16} /> Tillbaka
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (step === 0 && childAges.some((age) => age === null)) {
                      setError("Ange ålder för alla barn.");
                      return;
                    }
                    if (
                      step === 1 &&
                      (!endDate || dateSpan(date, endDate) < 0)
                    ) {
                      setError(
                        "Välj ett slutdatum som inte är före startdatumet.",
                      );
                      return;
                    }
                    if (
                      step === 2 &&
                      (!checkoutMode ||
                        (checkoutMode === "login" &&
                          (!/^\S+@\S+\.\S+$/.test(loginEmail) ||
                            loginPassword.length < 4)))
                    ) {
                      setError(
                        checkoutMode === "login"
                          ? "Ange giltig e-postadress och minst fyra tecken i lösenordet."
                          : "Välj om du vill logga in eller fortsätta som gäst.",
                      );
                      return;
                    }
                    if (step === 2 && checkoutMode === "login")
                      setEmail(loginEmail);
                    if (
                      step === 3 &&
                      (!name.trim() ||
                        !/^\S+@\S+\.\S+$/.test(email) ||
                        !validContact(contact))
                    ) {
                      setError(
                        "Ange namn, giltig e-postadress, telefonnummer och adress.",
                      );
                      return;
                    }
                    setError("");
                    if (step === 0) setCartActive(true);
                    if (step === 5) submit();
                    else setStep(step + 1);
                  }}
                >
                  {step === 5
                    ? "Bekräfta bokning"
                    : step === 0
                      ? "Lägg i varukorgen"
                      : "Fortsätt"}{" "}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
            <aside className="summary card">
              <div className="summary-top">
                <ShoppingBag size={18} />
                <strong>Din bokning</strong>
              </div>
              <p>
                {activity === "ski"
                  ? `Skidpass ${skiPass === "full" ? "heldag" : "3 timmar"}`
                  : "Cykling på Flottsbro"}
              </p>
              <span className="summary-date">
                <CalendarDays size={15} />
                {date}–{endDate} · {visitDays}{" "}
                {visitDays === 1 ? "dag" : "dagar"}
              </span>
              <div className="summary-lines">
                <SummaryLine
                  label={`${adults} ${adults === 1 ? "vuxen" : "vuxna"} · ${visitDays} d`}
                  price={
                    visitDays *
                    adults *
                    (activity === "ski" ? adultPassPrice : 320)
                  }
                />
                {children > 0 && (
                  <SummaryLine
                    label={`${children} barn · ${visitDays} d`}
                    price={
                      visitDays *
                      (activity === "ski" ? childrenPassPerDay : children * 220)
                    }
                  />
                )}
                {rental && (
                  <SummaryLine
                    label="Utrustningshyra"
                    price={
                      visitDays *
                      (activity === "ski"
                        ? children * 230
                        : (adults + children) * 180)
                    }
                  />
                )}
                {lodging && (
                  <SummaryLine
                    label={`Boende · ${lodgingNights} nätter · från`}
                    price={lodgingPrice}
                  />
                )}
                {extraActivities.map((key) => (
                  <SummaryLine
                    key={key}
                    label={`${EXTRA_ACTIVITIES[key].name} · ${visitDays} d`}
                    price={
                      EXTRA_ACTIVITIES[key].price *
                      (adults + children) *
                      visitDays
                    }
                  />
                ))}
              </div>
              <div className="total">
                <span>Totalt</span>
                <strong>{SEK(price)}</strong>
              </div>
              <small>
                Beräknat frånpris inklusive moms.{" "}
                {lodging
                  ? "Boende bekräftas mot tillgänglighet."
                  : "Slutpris bekräftas före betalning."}
              </small>
            </aside>
          </div>
        </>
      )}
      {cancelId && (
        <ConfirmDialog
          title="Avboka besöket?"
          description="Bokningen markeras som avbokad och betalstatusen uppdateras."
          confirmLabel="Avboka besöket"
          onClose={() => setCancelId("")}
          onConfirm={() => {
            onUpdate(cancelId, (old) => ({
              ...old,
              status: "Avbokad",
              payment: old.payment.startsWith("Faktura")
                ? "Faktura makulerad"
                : "Återbetalning väntar",
              history: [...old.history, `Avbokad ${today()}`],
            }));
            setCancelId("");
          }}
        />
      )}
    </>
  );
}

function Stay({
  onBook,
  onUpdate,
  go,
  initialDraft,
  onCartChange,
}: {
  onBook: (b: Booking) => void;
  onUpdate: (id: string, fn: (b: Booking) => Booking) => void;
  go: (p: Page) => void;
  initialDraft?: StayDraft;
  onCartChange: (draft: StayDraft) => void;
}) {
  const [lang, setLang] = useState<"sv" | "en">(initialDraft?.lang ?? "sv");
  const [step, setStep] = useState(
    initialDraft?.checkoutVersion === 2
      ? initialDraft.step
      : (initialDraft?.step ?? 0) >= 3
        ? 3
        : (initialDraft?.step ?? 0),
  );
  const [start, setStart] = useState(initialDraft?.start ?? "2027-07-12");
  const [nights, setNights] = useState(initialDraft?.nights ?? 3);
  const [meal, setMeal] = useState(initialDraft?.meal ?? false);
  const [extraActivities, setExtraActivities] = useState<ExtraActivityKey[]>(
    initialDraft?.extraActivities ?? [],
  );
  const [lodge, setLodge] = useState<"cabin" | "camp">(
    initialDraft?.lodge ?? "cabin",
  );
  const [bike, setBike] = useState(initialDraft?.bike ?? true);
  const [rental, setRental] = useState(initialDraft?.rental ?? true);
  const [adults, setAdults] = useState(initialDraft?.adults ?? 2);
  const [children, setChildren] = useState(initialDraft?.children ?? 0);
  const [childAges, setChildAges] = useState<(number | null)[]>(
    initialDraft?.childAges ?? [],
  );
  const [rentalCount, setRentalCount] = useState(
    initialDraft?.rentalCount ?? 2,
  );
  const [name, setName] = useState(initialDraft?.name ?? "");
  const [email, setEmail] = useState(initialDraft?.email ?? "");
  const [contact, setContact] = useState<ContactDetails>(
    initialDraft?.contact ?? emptyContact(),
  );
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode | null>(
    initialDraft?.checkoutMode ?? null,
  );
  const [loginEmail, setLoginEmail] = useState(initialDraft?.email ?? "");
  const [loginPassword, setLoginPassword] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    initialDraft?.paymentMethod ?? null,
  );
  const [cartActive, setCartActive] = useState(Boolean(initialDraft));
  const [confirmed, setConfirmed] = useState("");
  const [extended, setExtended] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);
  const en = lang === "en";
  const lodgePrice = lodge === "cabin" ? 895 : 725;
  const bikePrice = adults * 300 + children * 190;
  const bikeAvailable = childAges.every((age) => age === null || age >= 8);
  const bikes = Math.min(rentalCount, adults + children);
  const rentalPrice = bikes * 220;
  const mealPrice = meal ? (adults * 159 + children * 99) * nights : 0;
  const extraPrice = extraActivities.reduce(
    (sum, key) => sum + EXTRA_ACTIVITIES[key].price * (adults + children),
    0,
  );
  const guestsText = en
    ? `${adults} ${adults === 1 ? "adult" : "adults"}${children ? `, ${children} ${children === 1 ? "child" : "children"}` : ""}`
    : `${adults} ${adults === 1 ? "vuxen" : "vuxna"}${children ? `, ${children} barn` : ""}`;
  const price =
    nights * lodgePrice +
    (bike ? bikePrice : 0) +
    (rental ? rentalPrice : 0) +
    mealPrice +
    extraPrice;
  const autoFill = () => {
    setError("");
    if (step === 0) {
      setStart("2027-07-12");
      setNights(3);
      setMeal(true);
      setAdults(2);
      setChildren(2);
      setChildAges([10, 12]);
    } else if (step === 1) {
      setLodge("cabin");
    } else if (step === 2) {
      setBike(bikeAvailable);
      setRental(true);
      setRentalCount(adults + children);
      setExtraActivities(["canoe"]);
    } else if (step === 3) {
      setCheckoutMode("guest");
    } else if (step === 4) {
      setName(en ? "Alex Miller" : "Anna Lind");
      setEmail(en ? "alex@example.com" : "anna@example.com");
      setContact(exampleContact());
    } else if (step === 5) {
      setPaymentMethod("swish");
    }
  };
  useEffect(() => {
    if (cartActive && !confirmed)
      onCartChange({
        lang,
        step,
        start,
        nights,
        meal,
        extraActivities,
        lodge,
        bike,
        rental,
        adults,
        children,
        childAges,
        rentalCount,
        name,
        email,
        contact,
        checkoutMode: checkoutMode ?? undefined,
        paymentMethod: paymentMethod ?? undefined,
        checkoutVersion: 2,
        total: price,
      });
  }, [
    cartActive,
    confirmed,
    lang,
    step,
    start,
    nights,
    meal,
    extraActivities,
    lodge,
    bike,
    rental,
    adults,
    children,
    childAges,
    rentalCount,
    name,
    email,
    contact,
    checkoutMode,
    paymentMethod,
    price,
  ]);
  const submit = () => {
    if (nights < 1) {
      setStep(0);
      setError(
        en ? "Choose a departure after arrival." : "Välj avresa efter ankomst.",
      );
      return;
    }
    if (!checkoutMode) {
      setStep(3);
      setError(
        en
          ? "Choose sign-in or guest checkout."
          : "Välj om du vill logga in eller fortsätta som gäst.",
      );
      return;
    }
    if (childAges.some((age) => age === null)) {
      setStep(0);
      setError(
        en ? "Enter the age of each child." : "Ange ålder för alla barn.",
      );
      return;
    }
    if (bike && childAges.some((age) => age !== null && age < 8)) {
      setStep(2);
      setError(
        en
          ? "Cycling is available from age 8. Remove trail access to continue."
          : "Cykling passar barn från 8 år. Ta bort ledpasset för att fortsätta.",
      );
      return;
    }
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError(
        en
          ? "Enter your name and a valid email."
          : "Ange namn och en giltig e-postadress.",
      );
      return;
    }
    if (!validContact(contact)) {
      setError(
        en
          ? "Enter a phone number and a complete Swedish address."
          : "Ange telefonnummer och en fullständig svensk adress.",
      );
      setStep(4);
      return;
    }
    if (!paymentMethod) {
      setError(en ? "Choose a payment method." : "Välj ett betalningssätt.");
      setStep(5);
      return;
    }
    const id = idFor("stay");
    setCartActive(false);
    onBook({
      id,
      kind: "stay",
      status: "Bekräftad",
      payment: paymentStatus(paymentMethod),
      name,
      email,
      contact,
      date: start,
      endDate: dateOffset(start, nights),
      lodging: true,
      meal,
      extraActivities,
      total: price,
      items: [
        `${lodge === "cabin" ? "Stuga B" : "Stuga C"} · ${nights} nätter · från ${SEK(nights * lodgePrice)}`,
        ...(bike ? [`Cykling ${guestsText}`] : []),
        ...(rental ? [`Cykelhyra ${bikes} st`] : []),
        ...(meal
          ? [`Middag på värdshuset · ${nights} kvällar · ${SEK(mealPrice)}`]
          : []),
        ...extraActivities.map(
          (key) =>
            `${EXTRA_ACTIVITIES[key].name} · ${SEK(EXTRA_ACTIVITIES[key].price * (adults + children))}`,
        ),
      ],
      details: `${guestsText} · ${en ? "English" : "Svenska"} bekräftelse`,
      childAges: childAges as number[],
      history: [
        `Bokning skapad ${today()}`,
        paymentMethod === "invoice"
          ? "Faktura vald"
          : `Betalning med ${paymentName(paymentMethod)} registrerad`,
      ],
      nights,
    });
    setConfirmed(id);
  };
  const extend = () => {
    onUpdate(confirmed, (b) => ({
      ...b,
      total: b.total + lodgePrice + 220,
      nights: (b.nights || 3) + 1,
      payment: b.payment.startsWith("Faktura")
        ? "Faktura väntar · inkl. tillägg"
        : "Betald inkl. tillägg",
      items: [
        `${lodge === "cabin" ? "Stuga B" : "Stuga C"} · ${(b.nights || 3) + 1} nätter`,
        ...b.items.filter((i) => !i.includes("nätter")),
        "Extra cykelhyra 1 st",
      ],
      history: [
        ...b.history,
        `Extra natt och cykel tillagd ${today()}`,
        b.payment.startsWith("Faktura")
          ? `Tillägg ${SEK(lodgePrice + 220)} lagt på faktura ${today()}`
          : `Tilläggsbetalning ${SEK(lodgePrice + 220)} registrerad ${today()}`,
        `Uppdaterad bekräftelse skapad ${today()}`,
      ],
    }));
    setExtended(true);
  };
  if (confirmed)
    return (
      <>
        <SectionHead
          eyebrow={en ? "STAY & ACTIVITY" : "BOENDE & AKTIVITET"}
          title={en ? "Your trip is booked" : "Din resa är bokad"}
          action={
            <button
              className="language"
              onClick={() => setLang(en ? "sv" : "en")}
            >
              {en ? "EN" : "SV"} <ChevronDown size={14} />
            </button>
          }
        />
        <Confirmation
          en={en}
          title={en ? "See you this summer!" : "Vi ses i sommar!"}
          id={confirmed}
          paymentLabel={
            paymentMethod === "invoice"
              ? en
                ? "Invoice selected"
                : "Faktura vald"
              : en
                ? "Payment registered"
                : "Betalning registrerad"
          }
          text={
            en
              ? `Your accommodation, activity and equipment are gathered under one booking number, linked to ${email}.`
              : `Boende, aktivitet och utrustning samlas under ett bokningsnummer kopplat till ${email}.`
          }
          onBack={() => go("overview")}
        />
        <PracticalInfo
          title={en ? "Your stay at a glance" : "Din vistelse i korthet"}
          rows={[
            { label: en ? "Arrival" : "Ankomst", value: start },
            {
              label: en ? "Length" : "Längd",
              value: `${nights + (extended ? 1 : 0)} ${en ? "nights" : "nätter"}`,
            },
            { label: en ? "Guests" : "Gäster", value: guestsText },
            {
              label: en ? "Accommodation" : "Boende",
              value:
                lodge === "cabin"
                  ? en
                    ? "Lakeside cabin"
                    : "Stuga B"
                  : en
                    ? "Camping cabin"
                    : "Stuga C",
            },
            {
              label: en ? "Total" : "Totalt",
              value: SEK(price + (extended ? lodgePrice + 220 : 0)),
            },
            {
              label: en ? "Contact address" : "Kontaktadress",
              value: formatAddress(contact),
            },
          ]}
        />
        <div className="card padded amend">
          <div>
            <div className="eyebrow">
              {en ? "CHANGE YOUR TRIP" : "FÖRÄNDRA RESAN"}
            </div>
            <h2>
              {extended
                ? en
                  ? "Your trip has been updated"
                  : "Resan har uppdaterats"
                : en
                  ? "Stay one more night?"
                  : "Vill ni stanna en natt till?"}
            </h2>
            <p>
              {extended
                ? en
                  ? `New total: ${SEK(price + lodgePrice + 220)}. The change is visible to staff and a new confirmation is created.`
                  : `Ny total: ${SEK(price + lodgePrice + 220)}. Ändringen syns i administrationsvyn och en uppdaterad bekräftelse skapas.`
                : en
                  ? `Add one night and an extra bike rental. Additional cost: ${SEK(lodgePrice + 220)}.`
                  : `Lägg till en natt och extra cykelhyra för en person. Tillägg: ${SEK(lodgePrice + 220)}.`}
            </p>
          </div>
          {!extended && (
            <Button onClick={extend}>
              {en ? "Extend stay" : "Förläng vistelsen"} <Plus size={16} />
            </Button>
          )}
        </div>
      </>
    );
  return (
    <>
      <AutoFillButton onClick={autoFill} en={en} />
      <SectionHead
        eyebrow="BOENDE & AKTIVITET"
        title={en ? "Plan your summer stay" : "Planera sommarvistelsen"}
        description={
          en
            ? "Book accommodation, cycling and equipment in one journey — even during the winter season."
            : "Boka boende, cykling och utrustning i ett flöde — även under vintersäsongen."
        }
        action={
          <button
            className="language"
            onClick={() => setLang(en ? "sv" : "en")}
          >
            {en ? "EN" : "SV"} <ChevronDown size={14} />
          </button>
        }
      />
      <div className="season-banner">
        <div className="season-icon">
          <Bike size={22} />
        </div>
        <div>
          <strong>
            {en
              ? "Choose the dates that suit you"
              : "Välj den period som passar er"}
          </strong>
          <span>
            {en
              ? "Choose your dates now and plan the whole trip in one place."
              : "Välj datum redan nu och planera hela resan på ett ställe."}
          </span>
        </div>
        <Badge tone="green">{en ? "Date selection" : "Periodval"}</Badge>
      </div>
      <Stepper
        current={step}
        labels={
          en
            ? [
                "Dates",
                "Accommodation",
                "Activities",
                "Account",
                "Your details",
                "Payment",
              ]
            : [
                "Datum",
                "Boende",
                "Aktiviteter",
                "Konto eller gäst",
                "Dina uppgifter",
                "Betala",
              ]
        }
      />
      <div className="booking-layout">
        <div className="main-column">
          {step === 0 && (
            <div className="card padded">
              <div className="card-title">
                <CalendarDays size={21} />
                <div>
                  <h2>
                    {en
                      ? "When would you like to visit?"
                      : "När vill ni komma?"}
                  </h2>
                  <p>
                    {en
                      ? "Choose dates for the summer season."
                      : "Välj ankomst och avresa i kalendern."}
                  </p>
                </div>
              </div>
              <div className="form-grid">
                <PeriodPicker
                  start={start}
                  end={dateOffset(start, nights)}
                  overnight
                  en={en}
                  onChange={(from, to) => {
                    setStart(from);
                    setNights(dateSpan(from, to));
                  }}
                />
              </div>
              <p className="micro">
                {nights} {en ? "nights" : "nätter"}
              </p>
              <GuestPicker
                adults={adults}
                children={children}
                onAdultsChange={setAdults}
                onChildrenChange={(value) => {
                  setChildren(value);
                  setChildAges((ages) =>
                    Array.from(
                      { length: value },
                      (_, index) => ages[index] ?? null,
                    ),
                  );
                }}
                maxTotal={4}
                en={en}
                childAges={childAges}
                minChildAge={0}
                onChildAgeChange={(index, age) => {
                  setChildAges((ages) =>
                    ages.map((current, position) =>
                      position === index ? age : current,
                    ),
                  );
                  if (age !== null && age < 8) setBike(false);
                }}
              />
            </div>
          )}
          {step === 1 && (
            <>
              <div className="section-mini">
                <h2>{en ? "Choose your accommodation" : "Välj boende"}</h2>
                <p>
                  {en
                    ? "Two options with space for the whole family."
                    : "Två alternativ med plats för hela familjen."}
                </p>
              </div>
              <div className="activity-grid">
                <button
                  className={`activity-card ${lodge === "cabin" ? "chosen" : ""}`}
                  onClick={() => setLodge("cabin")}
                >
                  <span className="illustration lodge">
                    <Home size={43} />
                  </span>
                  <span className="activity-text">
                    <strong>{en ? "Cabin B" : "Stuga B"}</strong>
                    <small>
                      {en
                        ? "4 beds · self catering"
                        : "4 bäddar · självhushåll"}
                    </small>
                    <span>
                      {en
                        ? "A comfortable base close to activities."
                        : "En bekväm bas nära aktiviteterna."}
                    </span>
                    <b>
                      {en ? "From " : "Från "}
                      {SEK(895)} / {en ? "night" : "natt"}
                    </b>
                  </span>
                  {lodge === "cabin" && (
                    <span className="check-circle">
                      <Check size={14} />
                    </span>
                  )}
                </button>
                <button
                  className={`activity-card ${lodge === "camp" ? "chosen" : ""}`}
                  onClick={() => setLodge("camp")}
                >
                  <span className="illustration camp">
                    <TentTree size={43} />
                  </span>
                  <span className="activity-text">
                    <strong>{en ? "Cabin C" : "Stuga C"}</strong>
                    <small>
                      {en
                        ? "4 beds · self catering"
                        : "4 bäddar · självhushåll"}
                    </small>
                    <span>
                      {en
                        ? "Simple and close to nature."
                        : "Enkelt och nära naturen."}
                    </span>
                    <b>
                      {en ? "From " : "Från "}
                      {SEK(725)} / {en ? "night" : "natt"}
                    </b>
                  </span>
                  {lodge === "camp" && (
                    <span className="check-circle">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <div className="card padded">
              <div className="card-title">
                <Activity size={21} />
                <div>
                  <h2>
                    {en ? "Make more of your stay" : "Få ut mer av vistelsen"}
                  </h2>
                  <p>
                    {en
                      ? "Add activities and equipment to this booking."
                      : "Lägg till aktiviteter och utrustning i samma bokning."}
                  </p>
                </div>
              </div>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={bike}
                  disabled={!bikeAvailable}
                  onChange={(e) => setBike(e.target.checked)}
                />
                <span>
                  <strong>{en ? "Trail access" : "Ledpass för cykling"}</strong>
                  <small>{guestsText}</small>
                </span>
                <b>{SEK(bikePrice)}</b>
              </label>
              {!bikeAvailable && (
                <div className="guest-warning">
                  {en
                    ? "Trail access can be added when all children are at least 8 years old."
                    : "Ledpass kan läggas till när alla barn är minst 8 år."}
                </div>
              )}
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={rental}
                  onChange={(e) => setRental(e.target.checked)}
                />
                <span>
                  <strong>
                    {en
                      ? `Rent ${bikes} ${bikes === 1 ? "bike" : "bikes"}`
                      : `Hyr ${bikes} ${bikes === 1 ? "cykel" : "cyklar"}`}
                  </strong>
                  <small>
                    {en
                      ? "Helmets included, sizes chosen on site."
                      : "Hjälmar ingår, storlekar väljs på plats."}
                  </small>
                </span>
                <b>{SEK(rentalPrice)}</b>
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={meal}
                  onChange={(e) => setMeal(e.target.checked)}
                />
                <span>
                  <strong>
                    {en ? "Dinner at the restaurant" : "Middag på värdshuset"}
                  </strong>
                  <small>
                    {en
                      ? "SEK 159 per adult, SEK 99 per child and evening."
                      : "159 kr per vuxen, 99 kr per barn och kväll."}
                  </small>
                </span>
                <b>{SEK((adults * 159 + children * 99) * nights)}</b>
              </label>
              <ActivityChoices
                season="summer"
                selected={extraActivities}
                onChange={setExtraActivities}
                en={en}
              />
              {rental && (
                <div className="counter-row bike-count-row">
                  <div>
                    <strong>{en ? "Number of bikes" : "Antal cyklar"}</strong>
                    <span>
                      {en
                        ? "One bike per guest at most"
                        : "Högst en cykel per gäst"}
                    </span>
                  </div>
                  <div className="counter">
                    <button
                      type="button"
                      aria-label={en ? "Remove bike" : "Ta bort cykel"}
                      disabled={bikes <= 1}
                      onClick={() => setRentalCount(bikes - 1)}
                    >
                      <Minus size={15} />
                    </button>
                    <strong>{bikes}</strong>
                    <button
                      type="button"
                      aria-label={en ? "Add bike" : "Lägg till cykel"}
                      disabled={bikes >= adults + children}
                      onClick={() => setRentalCount(bikes + 1)}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              )}
              <div className="tip">
                <Info size={17} />
                {en
                  ? "Activities and equipment are added to this accommodation booking. The total updates as you choose."
                  : "Aktiviteter och utrustning läggs till i boendebokningen. Totalsumman uppdateras när du väljer."}
              </div>
            </div>
          )}
          {step === 3 && (
            <AccountStep
              mode={checkoutMode}
              onModeChange={setCheckoutMode}
              loginEmail={loginEmail}
              onEmailChange={setLoginEmail}
              password={loginPassword}
              onPasswordChange={setLoginPassword}
              en={en}
            />
          )}
          {step === 4 && (
            <div className="card padded">
              <div className="card-title">
                <CreditCard size={21} />
                <div>
                  <h2>{en ? "Who is booking?" : "Vem bokar resan?"}</h2>
                  <p>
                    {en
                      ? "We will send the confirmation to your email address."
                      : "Vi skickar bekräftelsen till din e-postadress."}
                  </p>
                </div>
              </div>
              <FormGroup
                title={en ? "Contact person" : "Kontaktperson"}
                description={
                  en
                    ? "We use these details for your confirmation and arrival information."
                    : "Vi använder uppgifterna för bekräftelse och ankomstinformation."
                }
              >
                <Field label={en ? "Full name" : "För- och efternamn"}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Miller"
                    autoComplete="name"
                  />
                </Field>
                <Field label={en ? "Email" : "E-postadress"}>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    type="email"
                    autoComplete="email"
                  />
                </Field>
                <Field label={en ? "Mobile number" : "Mobilnummer"}>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={contact.phone}
                    onChange={(e) =>
                      setContact({ ...contact, phone: e.target.value })
                    }
                    placeholder="070-123 45 67"
                  />
                </Field>
              </FormGroup>
              <FormGroup
                title={en ? "Address" : "Adress"}
                description={
                  en
                    ? "Used for the booking receipt and any information about your stay."
                    : "Används för bokningskvitto och information om vistelsen."
                }
              >
                <AddressFields
                  contact={contact}
                  onChange={setContact}
                  en={en}
                />
              </FormGroup>
              <FormGroup
                title={en ? "Before arrival" : "Inför ankomst"}
                description={
                  en
                    ? "Tell us if you have accessibility needs or other requests."
                    : "Berätta om tillgänglighetsbehov eller andra önskemål."
                }
              >
                <Field
                  label={
                    en
                      ? "Message to Flottsbro (optional)"
                      : "Meddelande till Flottsbro (valfritt)"
                  }
                >
                  <textarea
                    value={contact.note || ""}
                    onChange={(e) =>
                      setContact({ ...contact, note: e.target.value })
                    }
                    placeholder={
                      en
                        ? "For example, accessibility needs"
                        : "Till exempel tillgänglighetsbehov"
                    }
                    rows={3}
                  />
                </Field>
              </FormGroup>
              <div className="terms">
                {en
                  ? "Free cancellation up to 14 days before arrival."
                  : "Fri avbokning fram till 14 dagar före ankomst."}
              </div>
            </div>
          )}
          {step === 5 && (
            <PaymentStep
              method={paymentMethod}
              onChange={setPaymentMethod}
              total={price}
              en={en}
            />
          )}
          {error && <div className="error">{error}</div>}
          <div className="step-actions">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} />
                {en ? "Back" : "Tillbaka"}
              </Button>
            )}
            <Button
              onClick={() => {
                if (step === 0 && childAges.some((age) => age === null)) {
                  setError(
                    en
                      ? "Enter the age of each child."
                      : "Ange ålder för alla barn.",
                  );
                  return;
                }
                if (
                  step === 2 &&
                  bike &&
                  childAges.some((age) => age !== null && age < 8)
                ) {
                  setError(
                    en
                      ? "Cycling is available from age 8. Remove trail access to continue."
                      : "Cykling passar barn från 8 år. Ta bort ledpasset för att fortsätta.",
                  );
                  return;
                }
                if (
                  step === 3 &&
                  (!checkoutMode ||
                    (checkoutMode === "login" &&
                      (!/^\S+@\S+\.\S+$/.test(loginEmail) ||
                        loginPassword.length < 4)))
                ) {
                  setError(
                    checkoutMode === "login"
                      ? en
                        ? "Enter a valid email and a password of at least four characters."
                        : "Ange giltig e-postadress och minst fyra tecken i lösenordet."
                      : en
                        ? "Choose sign-in or guest checkout."
                        : "Välj om du vill logga in eller fortsätta som gäst.",
                  );
                  return;
                }
                if (step === 3 && checkoutMode === "login")
                  setEmail(loginEmail);
                if (
                  step === 4 &&
                  (!name.trim() ||
                    !/^\S+@\S+\.\S+$/.test(email) ||
                    !validContact(contact))
                ) {
                  setError(
                    en
                      ? "Enter your name, email, phone number and address."
                      : "Ange namn, e-postadress, telefonnummer och adress.",
                  );
                  return;
                }
                setError("");
                if (step === 0) setCartActive(true);
                if (step === 5) submit();
                else setStep(step + 1);
              }}
            >
              {step === 5
                ? en
                  ? "Confirm booking"
                  : "Bekräfta bokning"
                : step === 0
                  ? en
                    ? "Add to cart"
                    : "Lägg i varukorgen"
                  : en
                    ? "Continue"
                    : "Fortsätt"}{" "}
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
        <aside className="summary card">
          <div className="summary-top">
            <ShoppingBag size={18} />
            <strong>{en ? "Your trip" : "Din resa"}</strong>
          </div>
          <p>
            {lodge === "cabin"
              ? en
                ? "Lakeside cabin"
                : "Stuga B"
              : en
                ? "Camping cabin"
                : "Stuga C"}
          </p>
          <span className="summary-date">
            <CalendarDays size={15} />
            {start}–{dateOffset(start, nights)} · {nights}{" "}
            {en ? "nights" : "nätter"}
          </span>
          <span className="summary-date">
            <Users size={15} /> {guestsText}
          </span>
          <div className="summary-lines">
            <SummaryLine
              label={`${nights} ${en ? "nights" : "nätter"}`}
              price={nights * lodgePrice}
            />
            {bike && (
              <SummaryLine
                label={en ? "Trail access" : "Ledpass för cykling"}
                price={bikePrice}
              />
            )}
            {rental && (
              <SummaryLine
                label={en ? "Bike rental" : "Cykelhyra"}
                price={rentalPrice}
              />
            )}
            {meal && (
              <SummaryLine
                label={
                  en
                    ? `Dinner · ${nights} evenings`
                    : `Middag · ${nights} kvällar`
                }
                price={mealPrice}
              />
            )}
            {extraActivities.map((key) => (
              <SummaryLine
                key={key}
                label={
                  en ? EXTRA_ACTIVITIES[key].en : EXTRA_ACTIVITIES[key].name
                }
                price={EXTRA_ACTIVITIES[key].price * (adults + children)}
              />
            ))}
          </div>
          <div className="total">
            <span>{en ? "Total" : "Totalt"}</span>
            <strong>{SEK(price)}</strong>
          </div>
          <small>
            {en
              ? "Estimated starting price incl. VAT. Cabin availability is confirmed separately."
              : "Beräknat frånpris inkl. moms. Stugtillgänglighet bekräftas separat."}
          </small>
        </aside>
      </div>
    </>
  );
}

function Group({
  bookings,
  onBook,
  onUpdate,
  go,
}: {
  bookings: Booking[];
  onBook: (b: Booking) => void;
  onUpdate: (id: string, fn: (b: Booking) => Booking) => void;
  go: (p: Page) => void;
}) {
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState<ContactDetails>(emptyContact());
  const [date, setDate] = useState("2027-02-18");
  const [endDate, setEndDate] = useState("2027-02-18");
  const [lodging, setLodging] = useState(false);
  const [meal, setMeal] = useState(false);
  const [extraActivities, setExtraActivities] = useState<ExtraActivityKey[]>(
    [],
  );
  const [count, setCount] = useState(80);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [draftId, setDraftId] = useState("");
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);
  const resumable = bookings.find(
    (b) => b.kind === "group" && b.status === "Preliminär",
  );
  const resume = () => {
    if (!resumable) return;
    setOrg(resumable.name);
    setEmail(resumable.email);
    setContact(resumable.contact ?? emptyContact());
    setDate(resumable.date);
    setEndDate(resumable.endDate ?? resumable.date);
    setLodging(resumable.lodging ?? false);
    setMeal(resumable.meal ?? false);
    setExtraActivities(resumable.extraActivities ?? []);
    const itemCount = (word: string) =>
      Number(
        resumable.items
          .find((item) => item.includes(word))
          ?.match(/\d+/)?.[0] || 0,
      );
    setCount(
      itemCount("personer") ||
        itemCount("elever") + itemCount("lärare") ||
        resumable.participants?.length ||
        80,
    );
    setParticipants(resumable.participants || []);
    setDraftId(resumable.id);
    setStep(1);
    setError("");
  };
  const listedMissing = participants.filter(
    (p) => !participantComplete(p, date),
  ).length;
  const missing = listedMissing + Math.max(0, count - participants.length);
  const borrowing = participants.filter(
    (p) => equipmentChoice(p) === "borrow",
  ).length;
  const bringingOwn = participants.filter(
    (p) => equipmentChoice(p) === "own",
  ).length;
  const teacherCount = participants.filter((p) => p.role === "teacher").length;
  const registeredStudents = participants.length - teacherCount;
  const unregistered = Math.max(0, count - participants.length);
  const studentCount = registeredStudents + unregistered;
  const visibleParticipants = participants
    .map((p, i) => ({ p, i }))
    .filter(
      ({ p }) =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (!missingOnly || !participantComplete(p, date)),
    );
  const visitDays = Math.max(1, dateSpan(date, endDate) + 1);
  const lodgingNights = Math.max(1, dateSpan(date, endDate));
  const schoolRate = studentCount >= 20;
  const passUnit = schoolRate ? 200 : 320;
  const rentalUnit = schoolRate ? 200 : 230;
  const studentRentalCount = participants.filter(
    (p) => p.role !== "teacher" && equipmentChoice(p) === "borrow",
  ).length;
  const passTotal = studentCount * passUnit * visitDays;
  const rentalTotal = studentRentalCount * rentalUnit * visitDays;
  const lodgingTotal = lodging ? Math.ceil(count / 4) * 895 * lodgingNights : 0;
  const mealTotal = meal ? count * 115 * visitDays : 0;
  const extraTotal = extraActivities.reduce(
    (sum, key) => sum + EXTRA_ACTIVITIES[key].price * studentCount * visitDays,
    0,
  );
  const total = passTotal + rentalTotal + lodgingTotal + mealTotal + extraTotal;
  const save = (final = false) => {
    if (!endDate || dateSpan(date, endDate) < 0) {
      setError("Välj ett slutdatum som inte är före startdatumet.");
      return false;
    }
    if (!org.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Ange organisation och giltig e-postadress.");
      return false;
    }
    if (!validGroupContact(contact)) {
      setError(
        "Ange kontaktperson, telefonnummer, fakturaadress och giltig faktura-e-post.",
      );
      return false;
    }
    if (count > 120 || participants.length > 120) {
      setError("Gruppen överskrider kapaciteten på 120 platser.");
      return false;
    }
    if (participants.length > count) {
      setError("Antalet deltagare i listan är större än gruppens antal.");
      return false;
    }
    if (final && missing) {
      setError(
        `${missing} deltagare saknar uppgifter. Komplettera innan bokningen slutförs.`,
      );
      return false;
    }
    if (
      final &&
      participants.some(
        (p) =>
          p.role !== "teacher" &&
          p.activity === "Snowboard" &&
          equipmentChoice(p) === "borrow",
      )
    ) {
      setError(
        "Flottsbro hyr inte ut snowboard för friluftsdagar. Ändra till skidåkning eller egen utrustning.",
      );
      setStep(1);
      return false;
    }
    setError("");
    if (!draftId) {
      const id = idFor("group");
      onBook({
        id,
        kind: "group",
        status: final ? "Bekräftad" : "Preliminär",
        payment: final ? "Fakturaunderlag skapat" : "Faktura väntar",
        name: org,
        email,
        contact,
        date,
        endDate,
        lodging,
        meal,
        extraActivities,
        total,
        items: [
          "Vinterfriluftsdag",
          `${count} personer${final ? "" : " preliminärt"}`,
          `${registeredStudents} elever registrerade`,
          `${teacherCount} lärare registrerade · gratis`,
          `${visitDays} dagar`,
          ...(lodging
            ? [`Boende · ${lodgingNights} nätter · från ${SEK(lodgingTotal)}`]
            : []),
          ...(meal
            ? [`Lunch på värdshuset · ${visitDays} dagar · ${SEK(mealTotal)}`]
            : []),
          ...extraActivities.map(
            (key) =>
              `${EXTRA_ACTIVITIES[key].name} · ${visitDays} dagar · ${SEK(EXTRA_ACTIVITIES[key].price * studentCount * visitDays)}`,
          ),
        ],
        details: `${count - missing} av ${count} deltagare kompletta`,
        participants,
        history: [
          `Gruppbokning skapad ${today()}`,
          ...(final ? ["Fakturaunderlag skapat"] : []),
        ],
      });
      setDraftId(id);
    } else {
      onUpdate(draftId, (b) => ({
        ...b,
        status: final ? "Bekräftad" : b.status,
        payment: final ? "Fakturaunderlag skapat" : b.payment,
        name: org,
        email,
        contact,
        date,
        endDate,
        lodging,
        meal,
        extraActivities,
        total,
        items: [
          "Vinterfriluftsdag",
          `${count} personer${final ? "" : " preliminärt"}`,
          `${registeredStudents} elever registrerade`,
          `${teacherCount} lärare registrerade · gratis`,
          `${visitDays} dagar`,
          ...(lodging
            ? [`Boende · ${lodgingNights} nätter · från ${SEK(lodgingTotal)}`]
            : []),
          ...(meal
            ? [`Lunch på värdshuset · ${visitDays} dagar · ${SEK(mealTotal)}`]
            : []),
          ...extraActivities.map(
            (key) =>
              `${EXTRA_ACTIVITIES[key].name} · ${visitDays} dagar · ${SEK(EXTRA_ACTIVITIES[key].price * studentCount * visitDays)}`,
          ),
        ],
        details: `${count - missing} av ${count} deltagare kompletta`,
        participants,
        history: [
          ...b.history,
          final
            ? `Gruppbokning slutförd ${today()}`
            : `${step === 0 ? "Gruppuppgifter uppdaterade" : "Deltagarlista uppdaterad"} ${today()}`,
          ...(final ? ["Fakturaunderlag skapat"] : []),
        ],
      }));
    }
    if (final) setDone(true);
    return true;
  };
  useEffect(() => {
    if (!draftId || done) return;
    onUpdate(draftId, (booking) => ({
      ...booking,
      name: org,
      email,
      contact,
      date,
      endDate,
      lodging,
      meal,
      extraActivities,
      total,
      items: [
        "Vinterfriluftsdag",
        `${count} personer preliminärt`,
        `${registeredStudents} elever registrerade`,
        `${teacherCount} lärare registrerade · gratis`,
        `${visitDays} dagar`,
        ...(lodging
          ? [`Boende · ${lodgingNights} nätter · från ${SEK(lodgingTotal)}`]
          : []),
        ...(meal
          ? [`Lunch på värdshuset · ${visitDays} dagar · ${SEK(mealTotal)}`]
          : []),
        ...extraActivities.map(
          (key) =>
            `${EXTRA_ACTIVITIES[key].name} · ${visitDays} dagar · ${SEK(EXTRA_ACTIVITIES[key].price * studentCount * visitDays)}`,
        ),
      ],
      details: `${count - missing} av ${count} deltagare kompletta`,
      participants,
    }));
  }, [
    draftId,
    done,
    org,
    email,
    contact,
    date,
    endDate,
    lodging,
    meal,
    extraActivities,
    count,
    participants,
  ]);
  const importCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result)
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const hasHeader = lines[0]?.toLowerCase().includes("namn");
      const headers = hasHeader
        ? lines[0].split(/[;,]/).map((value) => value.trim().toLowerCase())
        : [];
      const read = (cells: string[], name: string, fallback: number) =>
        cells[headers.indexOf(name) >= 0 ? headers.indexOf(name) : fallback] ||
        "";
      const rows = lines
        .slice(hasHeader ? 1 : 0)
        .map((line) => {
          const cells = line.split(/[;,]/).map((v) => v?.trim() || "");
          const withRole = headers.includes("roll") || cells.length >= 8;
          const extended =
            headers.includes("födelsedatum") || cells.length >= 7;
          const name = read(cells, "namn", 0);
          const roleText = withRole ? read(cells, "roll", 1).toLowerCase() : "";
          const role: Participant["role"] = /^(lärare|teacher)$/i.test(roleText)
            ? "teacher"
            : null;
          const birthDate = extended
            ? read(cells, "födelsedatum", withRole ? 2 : 1)
            : "";
          const activity = read(
            cells,
            "aktivitet",
            withRole ? 3 : extended ? 2 : 1,
          );
          const equipmentText = extended
            ? (headers.includes("lånar utrustning")
                ? read(cells, "lånar utrustning", withRole ? 4 : 3)
                : read(cells, "utrustning", withRole ? 4 : 3)
              ).toLowerCase()
            : "";
          const shoe = read(
            cells,
            "skostorlek",
            withRole ? 5 : extended ? 4 : 2,
          );
          const height = read(cells, "längd", withRole ? 6 : extended ? 5 : 3);
          const weight = read(cells, "vikt", withRole ? 7 : extended ? 6 : 4);
          const equipment = /^(ja|yes|låna|hyra|borrow|rent)$/i.test(
            equipmentText,
          )
            ? "borrow"
            : /^(nej|no|egen|own)$/i.test(equipmentText)
              ? "own"
              : shoe || height || weight
                ? "borrow"
                : "own";
          return {
            name,
            role,
            birthDate,
            activity,
            equipment: equipment as Participant["equipment"],
            shoe,
            height,
            weight,
          };
        })
        .filter((p) => p.name);
      setParticipants(rows);
      setCount(Math.max(count, rows.length));
    };
    reader.readAsText(file);
  };
  const example = () => {
    setCount(84);
    setParticipants(exampleParticipants());
  };
  const autoFill = () => {
    setError("");
    if (step === 0) {
      setOrg("Björkskolan");
      setEmail("bokning@bjorkskolan.se");
      setContact(exampleGroupContact());
      setDate("2027-02-18");
      setEndDate("2027-02-20");
      setLodging(true);
      setMeal(true);
      setExtraActivities(["snowshoe"]);
      return;
    }
    if (step !== 1) return;
    const teacherSlots =
      count >= 20 ? Math.min(4, Math.ceil(count / 20)) : count > 1 ? 1 : 0;
    setParticipants((current) =>
      Array.from({ length: count }, (_, index) => {
        const existing = current[index];
        const role: Participant["role"] =
          existing?.role === "teacher"
            ? "teacher"
            : existing
              ? null
              : index >= count - teacherSlots
                ? "teacher"
                : null;
        const equipment =
          existing?.equipment ??
          (role === "teacher" || index % 4 === 0 ? "own" : "borrow");
        const activity =
          role === "teacher"
            ? "Medföljande"
            : index % 3 === 0 && equipment === "own"
              ? "Snowboard"
              : "Skidåkning";
        const borrowing = equipment === "borrow";
        return {
          name: existing?.name.trim() || exampleName(index),
          role,
          birthDate:
            role === "teacher"
              ? ""
              : existing?.birthDate || exampleBirthDate(index),
          activity:
            existing?.activity &&
            (role === "teacher" || existing.activity !== "Medföljande")
              ? existing.activity
              : activity,
          equipment,
          shoe: borrowing ? existing?.shoe || String(34 + (index % 10)) : "",
          height: borrowing
            ? existing?.height || String(145 + (index % 35))
            : "",
          weight: borrowing
            ? existing?.weight || String(40 + (index % 25))
            : "",
        };
      }),
    );
    setSearch("");
    setMissingOnly(false);
  };
  const updateParticipant = (
    index: number,
    key: keyof Participant,
    value: string,
  ) =>
    setParticipants((ps) =>
      ps.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    );
  const downloadInvoice = () => {
    const quote = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`;
    const rows = [
      ["Fakturaunderlag", `FU-${draftId}`],
      ["Bokningsnummer", draftId],
      ["Organisation", org],
      ["E-post", email],
      ["Kontaktperson", contact.contactPerson || ""],
      ["Kontaktpersonens e-post", email],
      ["Telefon", contact.phone],
      ["Faktura-e-post", contact.billingEmail || ""],
      ["Organisationsnummer", contact.organisationNumber || ""],
      ["Fakturareferens", contact.invoiceReference || ""],
      ["Fakturaadress", formatAddress(contact)],
      ["Period", `${date}–${endDate}`],
      ["Skapat", today()],
      ["Rad", "Antal", "Pris per person", "Summa"],
      [
        "SkiPass elever",
        `${studentCount} × ${visitDays} dagar`,
        passUnit,
        passTotal,
      ],
      [
        "Skidutrustning",
        `${studentRentalCount} × ${visitDays} dagar`,
        rentalUnit,
        rentalTotal,
      ],
      ["Lärare", teacherCount, 0, 0],
      ...(lodging
        ? [
            [
              "Boende, preliminärt frånpris",
              `${Math.ceil(count / 4)} stugor × ${lodgingNights} nätter`,
              895,
              lodgingTotal,
            ],
          ]
        : []),
      ...(meal
        ? [
            [
              "Lunch på värdshuset",
              `${count} × ${visitDays} dagar`,
              115,
              mealTotal,
            ],
          ]
        : []),
      ...extraActivities.map((key) => [
        EXTRA_ACTIVITIES[key].name,
        `${studentCount} × ${visitDays} dagar`,
        EXTRA_ACTIVITIES[key].price,
        EXTRA_ACTIVITIES[key].price * studentCount * visitDays,
      ]),
      ["Totalt", "", "", total],
      ["Lånar utrustning", studentRentalCount],
    ];
    const csv = rows.map((row) => row.map(quote).join(";")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `fakturaunderlag-${draftId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const invoiceSheet = (issued: boolean) => (
    <div className="invoice-document card">
      <div className="invoice-header">
        <div>
          <div className="eyebrow">FLOTTSBRO · FAKTURAUNDERLAG</div>
          <h2>{issued ? "Fakturaunderlag" : "Granska fakturaunderlaget"}</h2>
          <span>Underlag FU-{draftId}</span>
        </div>
        <Badge tone={issued ? "green" : "amber"}>
          {issued ? "Skapat" : "Förhandsgranskning"}
        </Badge>
      </div>
      <div className="invoice-meta">
        <div>
          <span>Fakturamottagare</span>
          <strong>{org}</strong>
          {contact.organisationNumber && (
            <small>Org.nr {contact.organisationNumber}</small>
          )}
          <small>{formatAddress(contact)}</small>
          <small>Faktura-e-post: {contact.billingEmail || email}</small>
          {contact.invoiceReference && (
            <small>Referens: {contact.invoiceReference}</small>
          )}
        </div>
        <div>
          <span>Kontaktperson</span>
          <strong>{contact.contactPerson || org}</strong>
          {contact.position && <small>{contact.position}</small>}
          <small>{email}</small>
          <small>{contact.phone}</small>
        </div>
        <div>
          <span>Bokning</span>
          <strong>{draftId}</strong>
          <small>
            Besök {date}–{endDate}
          </small>
        </div>
        <div>
          <span>Underlag skapat</span>
          <strong>{today()}</strong>
          <small>Betalning via faktura</small>
        </div>
      </div>
      <div className="invoice-rows">
        <div className="invoice-row invoice-row-head">
          <span>Beskrivning</span>
          <span>Antal</span>
          <span>À-pris</span>
          <strong>Summa</strong>
        </div>
        <div className="invoice-row">
          <span>SkiPass · elever · {visitDays} dagar</span>
          <span>
            {studentCount} × {visitDays}
          </span>
          <span>{SEK(passUnit)}</span>
          <strong>{SEK(passTotal)}</strong>
        </div>
        <div className="invoice-row">
          <span>Skidutrustning · elever</span>
          <span>
            {studentRentalCount} × {visitDays}
          </span>
          <span>{SEK(rentalUnit)}</span>
          <strong>{SEK(rentalTotal)}</strong>
        </div>
        <div className="invoice-row">
          <span>Medföljande lärare</span>
          <span>{teacherCount}</span>
          <span>{SEK(0)}</span>
          <strong>{SEK(0)}</strong>
        </div>
        {lodging && (
          <div className="invoice-row">
            <span>Boende · preliminärt frånpris · {lodgingNights} nätter</span>
            <span>{Math.ceil(count / 4)} stugor</span>
            <span>{SEK(895)}/natt</span>
            <strong>{SEK(lodgingTotal)}</strong>
          </div>
        )}
        {meal && (
          <div className="invoice-row">
            <span>Lunch på värdshuset · {visitDays} dagar</span>
            <span>
              {count} × {visitDays}
            </span>
            <span>{SEK(115)}</span>
            <strong>{SEK(mealTotal)}</strong>
          </div>
        )}
        {extraActivities.map((key) => (
          <div className="invoice-row" key={key}>
            <span>
              {EXTRA_ACTIVITIES[key].name} · {visitDays} dagar
            </span>
            <span>
              {studentCount} × {visitDays}
            </span>
            <span>{SEK(EXTRA_ACTIVITIES[key].price)}</span>
            <strong>
              {SEK(EXTRA_ACTIVITIES[key].price * studentCount * visitDays)}
            </strong>
          </div>
        ))}
      </div>
      <div className="invoice-total">
        <span>Preliminärt belopp</span>
        <strong>{SEK(total)}</strong>
      </div>
      <p className="invoice-footnote">
        {studentRentalCount} elever lånar skidutrustning. Lärare är gratis för
        SkiPass och utrustning. Matpriset är ett antagande i prototypen. Boende
        är ett frånpris och bekräftas mot tillgänglighet.
      </p>
    </div>
  );
  if (done)
    return (
      <>
        <SectionHead eyebrow="GRUPPBOKNING" title="Gruppbokningen är klar" />
        <Confirmation
          title="Redo för friluftsdagen"
          id={draftId}
          text={`En gruppbekräftelse och ett fakturaunderlag har skapats för ${org}. Administrationsvyn innehåller deltagare och utrustningsbehov.`}
          paymentLabel="Fakturaunderlag skapat"
          onBack={() => go("overview")}
        />
        <div className="invoice-actions">
          <Button variant="secondary" onClick={() => window.print()}>
            <FileText size={16} /> Skriv ut underlag
          </Button>
          <Button onClick={downloadInvoice}>
            <Download size={16} /> Ladda ned CSV
          </Button>
        </div>
        {invoiceSheet(true)}
      </>
    );
  return (
    <>
      {step < 2 && <AutoFillButton onClick={autoFill} />}
      <SectionHead
        eyebrow="GRUPPBOKNING"
        title="Planera en friluftsdag tillsammans"
        description="Boka på gruppnivå först, komplettera deltagarna senare och följ vad som saknas."
        action={
          <Badge tone="blue">
            <Users size={14} /> Gruppbokare
          </Badge>
        }
      />
      <Stepper
        current={step}
        labels={["Gruppens uppgifter", "Deltagare", "Fakturaunderlag"]}
      />
      {step === 0 ? (
        <>
          {resumable && !draftId && (
            <div className="resume-banner">
              <div>
                <strong>Fortsätt en preliminär bokning</strong>
                <span>
                  {resumable.name} · {resumable.id} · uppgifter kan kompletteras
                  när som helst.
                </span>
              </div>
              <Button variant="secondary" onClick={resume}>
                Fortsätt bokningen <ArrowRight size={15} />
              </Button>
            </div>
          )}
          <div className="group-top">
            <div className="card padded">
              <div className="card-title">
                <div className="icon-box">
                  <MountainSnow size={20} />
                </div>
                <div>
                  <h2>Gruppens uppgifter</h2>
                  <p>En samlad bokning för skola eller företag.</p>
                </div>
              </div>
              <FormGroup
                title="Period och deltagare"
                description="Välj när gruppen kommer. Alla datum i perioden räknas som aktivitetsdagar."
              >
                <PeriodPicker
                  start={date}
                  end={endDate}
                  onChange={(from, to) => {
                    setDate(from);
                    setEndDate(to);
                  }}
                />
                <Field label="Preliminärt antal deltagare">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={count}
                    onChange={(e) =>
                      setCount(
                        Math.max(
                          participants.length,
                          1,
                          Math.min(120, Number(e.target.value)),
                        ),
                      )
                    }
                  />
                </Field>
              </FormGroup>
              <FormGroup
                title="Boende och mat"
                description="Välj tillägg för hela gruppen och perioden."
              >
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={lodging}
                    onChange={(e) => {
                      setLodging(e.target.checked);
                      if (e.target.checked && dateSpan(date, endDate) === 0)
                        setEndDate(dateOffset(date, 1));
                    }}
                  />
                  <span>
                    <strong>Vi behöver boende</strong>
                    <small>
                      Stuga B, 4 bäddar. Från 895 kr per stuga och natt.
                    </small>
                  </span>
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={meal}
                    onChange={(e) => setMeal(e.target.checked)}
                  />
                  <span>
                    <strong>Lunch på värdshuset</strong>
                    <small>
                      115 kr per person och dag, även för medföljande lärare.
                    </small>
                  </span>
                  <b>{SEK(count * 115 * visitDays)}</b>
                </label>
              </FormGroup>
              <FormGroup
                title="Fler aktiviteter"
                description="Välj aktiviteter för eleverna under hela perioden. Medföljande lärare deltar utan kostnad."
              >
                <ActivityChoices
                  season="winter"
                  selected={extraActivities}
                  onChange={setExtraActivities}
                  perDay
                />
              </FormGroup>
              <FormGroup
                title="Organisation"
                description="Den här organisationen står som bokare och fakturamottagare."
              >
                <Field label="Skola eller organisation">
                  <input
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="Exempel: Björkskolan"
                  />
                </Field>
                <Field label="Organisationsnummer (valfritt)">
                  <input
                    value={contact.organisationNumber || ""}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        organisationNumber: e.target.value,
                      })
                    }
                    placeholder="212000-0068"
                    inputMode="numeric"
                  />
                </Field>
              </FormGroup>
              <FormGroup
                title="Kontaktperson"
                description="Den person vi kontaktar om deltagare, utrustning eller ändringar."
              >
                <Field label="Kontaktpersonens namn">
                  <input
                    value={contact.contactPerson || ""}
                    onChange={(e) =>
                      setContact({ ...contact, contactPerson: e.target.value })
                    }
                    placeholder="Sara Berg"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Roll eller befattning (valfritt)">
                  <input
                    value={contact.position || ""}
                    onChange={(e) =>
                      setContact({ ...contact, position: e.target.value })
                    }
                    placeholder="Administratör"
                  />
                </Field>
                <Field label="Kontaktpersonens e-postadress">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sara.berg@bjorkskolan.se"
                    autoComplete="email"
                  />
                </Field>
                <Field label="Mobilnummer">
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={contact.phone}
                    onChange={(e) =>
                      setContact({ ...contact, phone: e.target.value })
                    }
                    placeholder="070-123 45 67"
                  />
                </Field>
              </FormGroup>
              <FormGroup
                title="Fakturauppgifter"
                description="Fakturan skickas till adressen och e-postadressen nedan."
              >
                <Field label="Faktura-e-post">
                  <input
                    type="email"
                    value={contact.billingEmail || ""}
                    onChange={(e) =>
                      setContact({ ...contact, billingEmail: e.target.value })
                    }
                    placeholder="faktura@bjorkskolan.se"
                  />
                </Field>
                <Field label="Fakturareferens (valfritt)">
                  <input
                    value={contact.invoiceReference || ""}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        invoiceReference: e.target.value,
                      })
                    }
                    placeholder="Friluftsdag åk 7"
                  />
                </Field>
                <AddressFields
                  contact={contact}
                  onChange={setContact}
                  billing
                />
              </FormGroup>
              <div className="group-foot">
                <span>
                  <CheckCircle2 size={16} /> Kapacitet:{" "}
                  {Math.max(0, 120 - count)} av 120 platser kvar
                </span>
                <Button
                  onClick={() => {
                    if (save(false)) setStep(1);
                  }}
                >
                  {draftId
                    ? "Fortsätt till deltagare"
                    : "Skapa preliminär bokning"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
            <div className="group-summary card">
              <div className="eyebrow">BOKNINGSÖVERSIKT</div>
              <div className="big-number">{count}</div>
              <span>preliminärt antal deltagare</span>
              <p className="group-next-note">
                Elever, lärare och utrustning lägger du till i nästa steg.
                Priset justeras när du registrerar lärare.
              </p>
              <div className="group-price">
                <span>Beräknat frånpris</span>
                <strong>{SEK(total)}</strong>
                <small>
                  {visitDays} {visitDays === 1 ? "dag" : "dagar"} · SkiPass{" "}
                  {passUnit} kr/elev/dag · lånad utrustning {rentalUnit}{" "}
                  kr/elev/dag · lärare gratis för aktivitet.{" "}
                  {meal ? `Lunch ${SEK(mealTotal)} ingår.` : ""}
                </small>
              </div>
            </div>
          </div>
          {error && <div className="error">{error}</div>}
        </>
      ) : step === 1 ? (
        <>
          <div className="group-step-intro card">
            <div>
              <div className="eyebrow">PRELIMINÄR BOKNING {draftId}</div>
              <strong>{org}</strong>
              <span>
                {date}–{endDate} · preliminärt {count} deltagare
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setError("");
                setStep(0);
              }}
            >
              <ArrowLeft size={15} /> Ändra gruppens uppgifter
            </Button>
          </div>
          <div className="group-step-progress card">
            <div className="progress-label">
              <span>{count - missing} kompletta</span>
              <strong>{missing} saknas</strong>
            </div>
            <div className="progress">
              <span
                style={{
                  width: `${Math.min(100, ((count - missing) / count) * 100)}%`,
                }}
              />
            </div>
            <div className="equipment-summary">
              <span>{registeredStudents} elever registrerade</span>
              <span>{teacherCount} lärare · gratis</span>
              <span>{unregistered} ej registrerade</span>
              <span>{borrowing} lånar utrustning</span>
              <span>{bringingOwn} har egen utrustning</span>
            </div>
            <div className="group-step-price">
              Beräknat frånpris: <strong>{SEK(total)}</strong> · SkiPass{" "}
              {passUnit} kr/elev/dag, lånad utrustning {rentalUnit} kr/elev/dag,
              lärare gratis för aktivitet.{" "}
              {meal ? `Lunch ${SEK(mealTotal)} ingår. ` : ""}Ej registrerade
              räknas som elever tills de lagts till i listan.
            </div>
          </div>
          <div className="section-head participants-head">
            <div>
              <div className="eyebrow">DELTAGARLISTA</div>
              <h2>Samla in deltagaruppgifter</h2>
              <p>
                Alla räknas som elever om de inte markeras som lärare. Lärare är
                gratis. Födelsedatum krävs för elever. Ange aktivitet och kryssa
                i Låna utrustning vid behov; mått behövs bara vid lån.
              </p>
            </div>
          </div>
          <div className="card participant-card">
            <div className="participant-actions">
              <div className="toolbar">
                {!participants.length && (
                  <Button variant="secondary" onClick={example}>
                    Ladda exempelgrupp (80 elever + 4 lärare)
                  </Button>
                )}
                <label className="button button-secondary upload">
                  <FileText size={16} /> Importera CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) =>
                      e.target.files?.[0] && importCsv(e.target.files[0])
                    }
                  />
                </label>
                <Button
                  onClick={() => {
                    setParticipants((ps) => [
                      ...ps,
                      {
                        name: "",
                        role: null,
                        birthDate: "",
                        activity: "",
                        equipment: "own",
                        shoe: "",
                        height: "",
                        weight: "",
                      },
                    ]);
                    setCount(Math.max(count, participants.length + 1));
                  }}
                >
                  <Plus size={16} /> Lägg till
                </Button>
              </div>
            </div>
            {participants.length ? (
              <>
                <div className="participant-tools">
                  <div className="search">
                    <Search size={17} />
                    <input
                      placeholder="Sök deltagare"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button
                    className={`missing-filter ${missingOnly ? "active" : ""}`}
                    onClick={() => setMissingOnly(!missingOnly)}
                    aria-pressed={missingOnly}
                    disabled={listedMissing === 0 && !missingOnly}
                  >
                    {missingOnly
                      ? "Visa alla"
                      : `Visa ofullständiga (${listedMissing})`}
                  </button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Deltagare</th>
                        <th>Lärare · gratis</th>
                        <th>Födelsedatum</th>
                        <th>Aktivitet</th>
                        <th>Låna utrustning</th>
                        <th>Skostorlek</th>
                        <th>Längd (cm)</th>
                        <th>Vikt (kg)</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {visibleParticipants.map(({ p, i }) => (
                        <tr
                          key={i}
                          className={
                            participantComplete(p, date) ? "" : "incomplete"
                          }
                        >
                          <td>
                            <input
                              aria-label={`Namn ${i + 1}`}
                              required
                              value={p.name}
                              onChange={(e) =>
                                updateParticipant(i, "name", e.target.value)
                              }
                              placeholder="Namn"
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              className="teacher-checkbox"
                              aria-label={`Lärare (gratis) för ${p.name || `deltagare ${i + 1}`}`}
                              checked={p.role === "teacher"}
                              onChange={(e) => {
                                const teacher = e.target.checked;
                                setParticipants((ps) =>
                                  ps.map((item, index) =>
                                    index === i
                                      ? {
                                          ...item,
                                          role: teacher ? "teacher" : null,
                                          birthDate: teacher
                                            ? ""
                                            : item.birthDate,
                                          activity: teacher
                                            ? item.activity || "Medföljande"
                                            : item.activity === "Medföljande"
                                              ? ""
                                              : item.activity,
                                        }
                                      : item,
                                  ),
                                );
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              aria-label={`Födelsedatum ${i + 1}`}
                              required={p.role !== "teacher"}
                              disabled={p.role === "teacher"}
                              value={p.birthDate || ""}
                              max={date}
                              onChange={(e) =>
                                updateParticipant(
                                  i,
                                  "birthDate",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td>
                            <select
                              aria-label={`Aktivitet ${i + 1}`}
                              required
                              value={p.activity}
                              onChange={(e) =>
                                updateParticipant(i, "activity", e.target.value)
                              }
                            >
                              <option value="">Välj</option>
                              <option>Skidåkning</option>
                              <option>Snowboard</option>
                              {p.role === "teacher" && (
                                <option>Medföljande</option>
                              )}
                            </select>
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              className="borrow-checkbox"
                              aria-label={`Låna utrustning för ${p.name || `deltagare ${i + 1}`}`}
                              checked={equipmentChoice(p) === "borrow"}
                              onChange={(e) => {
                                const equipment = e.target.checked
                                  ? "borrow"
                                  : "own";
                                setParticipants((ps) =>
                                  ps.map((item, index) =>
                                    index === i
                                      ? {
                                          ...item,
                                          equipment,
                                          ...(equipment === "own"
                                            ? {
                                                shoe: "",
                                                height: "",
                                                weight: "",
                                              }
                                            : {}),
                                        }
                                      : item,
                                  ),
                                );
                              }}
                            />
                          </td>
                          <td>
                            <input
                              aria-label={`Skostorlek ${i + 1}`}
                              required={equipmentChoice(p) === "borrow"}
                              value={p.shoe}
                              disabled={equipmentChoice(p) !== "borrow"}
                              onChange={(e) =>
                                updateParticipant(i, "shoe", e.target.value)
                              }
                              placeholder="—"
                            />
                          </td>
                          <td>
                            <input
                              aria-label={`Längd ${i + 1}`}
                              required={equipmentChoice(p) === "borrow"}
                              value={p.height}
                              disabled={equipmentChoice(p) !== "borrow"}
                              onChange={(e) =>
                                updateParticipant(i, "height", e.target.value)
                              }
                              placeholder="—"
                            />
                          </td>
                          <td>
                            <input
                              aria-label={`Vikt ${i + 1}`}
                              required={equipmentChoice(p) === "borrow"}
                              value={p.weight}
                              disabled={equipmentChoice(p) !== "borrow"}
                              onChange={(e) =>
                                updateParticipant(i, "weight", e.target.value)
                              }
                              placeholder="—"
                            />
                          </td>
                          <td>
                            <Badge
                              tone={
                                participantComplete(p, date) ? "green" : "amber"
                              }
                            >
                              {participantComplete(p, date) ? "Klar" : "Saknas"}
                            </Badge>
                          </td>
                          <td>
                            <button
                              className="icon-button"
                              title="Ta bort deltagare"
                              onClick={() =>
                                setParticipants((ps) =>
                                  ps.filter((_, x) => x !== i),
                                )
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!visibleParticipants.length && (
                        <tr>
                          <td colSpan={10} className="empty-row">
                            {missingOnly
                              ? "Inga ofullständiga deltagare i listan."
                              : "Inga deltagare matchar sökningen."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="empty-table">
                <Users size={26} />
                <h3>Inga deltagare ännu</h3>
                <p>
                  Importera en CSV, ladda exempeldata eller lägg till en person
                  manuellt.
                </p>
              </div>
            )}
          </div>
          {error && <div className="error">{error}</div>}
          <div className="group-final">
            <div>
              <strong>
                {draftId
                  ? `Preliminär bokning ${draftId}`
                  : "Börja med en gruppbokning"}
              </strong>
              <span>
                {missing
                  ? `${missing} deltagare behöver kompletteras. Du kan granska underlaget redan nu.`
                  : "Alla uppgifter finns på plats. Granska underlaget innan det skapas."}
              </span>
            </div>
            <div className="group-final-actions">
              <span className="auto-save-note">
                <CheckCircle2 size={15} /> Ändringar sparas automatiskt
              </span>
              <Button
                onClick={() => {
                  if (save(false)) setStep(2);
                }}
              >
                Slutför & skapa fakturaunderlag <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {missing ? (
            <div className="invoice-alert">
              <Info size={20} />
              <div>
                <strong>{missing} deltagare behöver kompletteras</strong>
                <p>
                  {unregistered > 0 &&
                    `${unregistered} saknas i deltagarlistan. `}
                  {listedMissing > 0 &&
                    `${listedMissing} har ofullständiga uppgifter. `}
                  Priset är preliminärt tills deltagarna och lärarmarkeringarna
                  är klara.
                </p>
              </div>
            </div>
          ) : (
            <div className="invoice-ready">
              <CheckCircle2 size={19} />
              Alla deltagare är klara. Underlaget kan skapas.
            </div>
          )}
          {invoiceSheet(false)}
          {error && <div className="error">{error}</div>}
          <div className="invoice-actions">
            <Button variant="secondary" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Ändra deltagare
            </Button>
            <Button onClick={() => save(true)} disabled={!!missing}>
              Bekräfta & skapa fakturaunderlag <ArrowRight size={16} />
            </Button>
          </div>
        </>
      )}
    </>
  );
}

function displayBookingText(value: string, language: "sv" | "en") {
  return language === "sv" ? value : value
    .replaceAll("Boende & aktivitet", "Stay & activity")
    .replaceAll("Familjestugan", "Family cabin")
    .replaceAll("Skogsstugan", "Forest cabin")
    .replaceAll("Utsiktsstugan", "View cabin")
    .replaceAll("Snöskovandring", "Snowshoe hike")
    .replaceAll("SkiPass heldag", "Full-day SkiPass")
    .replaceAll("SkiPass 3 timmar", "Three-hour SkiPass")
    .replaceAll("Skidpass familj", "Family SkiPass")
    .replaceAll("Cykelpass", "Bike pass")
    .replaceAll("Cykelhyra", "Bike rental")
    .replaceAll("Skidhyra", "Ski rental")
    .replaceAll("Utrustningshyra", "Equipment rental")
    .replaceAll("Simulerad betalning", "Simulated payment")
    .replaceAll("Fakturaunderlag skapat", "Invoice details created")
    .replaceAll("Faktura väntar", "Invoice pending")
    .replaceAll("Återbetalning väntar", "Refund pending")
    .replaceAll("Bokning skapad", "Booking created")
    .replaceAll("Avbokad", "Cancelled")
    .replaceAll("Lärare", "Teacher")
    .replaceAll("Sverige", "Sweden")
    .replaceAll("Skidåkning", "Skiing")
    .replaceAll("Medföljande", "Accompanying")
    .replaceAll(" kl ", " at ")
    .replaceAll("kort", "card")
    .replaceAll("stugor", "cabins")
    .replaceAll("stuga", "cabin")
    .replaceAll("nätter", "nights")
    .replaceAll("natt", "night")
    .replaceAll("dagar", "days")
    .replaceAll("personer", "people")
    .replaceAll("barn", "children")
    .replace(/(\d[\d\s\u00a0]*)\s*kr\b/g, (_all, amount: string) => `${amount.trim()} SEK`);
}

function BookingsPage({
  bookings,
  accountEmail,
  language,
  onEdit,
  onRebook,
  onCancel,
}: {
  bookings: Booking[];
  accountEmail: string | null;
  language: "sv" | "en";
  onEdit: (booking: Booking) => void;
  onRebook: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}) {
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const mine = accountEmail ? bookings.filter((booking) =>
    booking.accountEmail?.toLowerCase() === accountEmail.toLowerCase(),
  ) : [];
  const bookingText = (value: string) => displayBookingText(value, language);
  const statusText = (status: Status) => language === "sv" ? status :
    ({ Bekräftad: "Confirmed", Preliminär: "Provisional", Avbokad: "Cancelled" }[status]);
  return (
    <div className="customer-bookings">
      <SectionHead
        eyebrow="MINA BOKNINGAR"
        title="Dina bokningar"
        description="Se bekräftelser, boka igen eller ändra en befintlig vistelse."
      />
      {!mine.length && <div className="card padded">Du har inga bokningar kopplade till ditt konto än.</div>}
      {mine.map((booking) => (
        <article className="card padded customer-booking" key={booking.id}>
          <div className="customer-booking-head">
            <div>
              <span className="eyebrow">{booking.id}</span>
              <h2>{bookingText(bookingTypeName(booking))}</h2>
              <p>{booking.date}{booking.endDate && booking.endDate !== booking.date ? ` – ${booking.endDate}` : ""}</p>
            </div>
            <Badge tone={booking.status === "Avbokad" ? "red" : booking.status === "Preliminär" ? "amber" : "green"}>
              {statusText(booking.status)}
            </Badge>
          </div>
          <div className="customer-booking-items">
            {booking.items.map((item, index) => <span key={index}>{bookingText(item)}</span>)}
          </div>
          <div className="customer-booking-meta">
            <span><strong>Totalt:</strong> {SEK(booking.total)}</span>
            <span><strong>Betalning:</strong> {language === "en" && booking.payment === "Betald" ? "Paid" : bookingText(booking.payment)}</span>
          </div>
          {booking.history.length > 0 && <p className="customer-booking-history">
            <strong>{language === "en" ? "Latest update:" : "Senaste händelse:"}</strong> {bookingText(booking.history.at(-1) ?? "")}
          </p>}
          <details className="customer-booking-practical">
            <summary>Bekräftelse och praktisk information</summary>
            <p><strong>Bokningsnummer:</strong> {booking.id}. {language === "en" ? "Show it on arrival at Flottsbro, Häggstavägen 20 in Huddinge." : "Visa det vid ankomst till Flottsbro, Häggstavägen 20 i Huddinge."}</p>
            <p><strong>Period:</strong> {booking.date}{booking.endDate && booking.endDate !== booking.date ? ` – ${booking.endDate}` : ""}. {language === "en" ? "Check the booked times for each activity above." : "Kontrollera bokade tider per aktivitet ovan."}</p>
            <p><strong>Inför besöket:</strong> Klä dig efter väder. Hyrd utrustning hämtas vid uthyrningen. Ta med egen utrustning om du valt det.</p>
            <p><strong>Kontakt:</strong> {booking.email}{booking.contact?.phone ? ` · ${booking.contact.phone}` : ""}.</p>
            <small>Bekräftelsen visas i demosystemet; inget e-postmeddelande skickas.</small>
          </details>
          <div className="customer-booking-actions">
            <Button variant="secondary" onClick={() => onRebook(booking)}>Boka igen</Button>
            {booking.status !== "Avbokad" && (
              <>
                <Button variant="secondary" onClick={() => onEdit(booking)}>
                  {booking.status === "Preliminär" ? "Komplettera bokningen" : "Ändra bokningen"}
                </Button>
                <Button variant="ghost" onClick={() => setCancelBooking(booking)}>Avboka</Button>
              </>
            )}
            {booking.kind === "group" && booking.payment === "Fakturaunderlag skapat" && booking.status === "Bekräftad" && (
              <Button variant="secondary" onClick={() => downloadInvoiceCsv(booking)}>
                <Download size={16} /> Fakturaunderlag
              </Button>
            )}
          </div>
        </article>
      ))}
      {cancelBooking && <ConfirmDialog
        title="Avboka bokningen?"
        description={`Bokning ${cancelBooking.id} markeras som avbokad. Betalstatus och historik uppdateras.`}
        confirmLabel="Avboka bokningen"
        onClose={() => setCancelBooking(null)}
        onConfirm={() => { onCancel(cancelBooking); setCancelBooking(null); }}
      />}
    </div>
  );
}

function Admin({ bookings, language, onEdit, onCancel }: {
  bookings: Booking[];
  language: "sv" | "en";
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const [selected, setSelected] = useState(bookings[0]?.id || "");
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const filtered = bookings.filter(
    (b) =>
      (filter === "all" || b.kind === filter) &&
      `${b.id} ${b.name} ${b.email} ${b.contact?.contactPerson || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const booking = filtered.find((b) => b.id === selected) || filtered[0];
  const exportCsv = () => {
    const quote = (s: string | number) =>
      `"${String(s).replaceAll('"', '""')}"`;
    const csv = [
      "Bokningsnummer,Typ,Status,Betalning,Kund,Kontaktperson,E-post,Telefon,Faktura-e-post,Fakturareferens,Organisationsnummer,Adress,Adressrad 2,Postnummer,Postort,Land,Datum,Total",
      ...bookings.map((b) =>
        [
          b.id,
          b.kind,
          b.status,
          b.payment,
          b.name,
          b.contact?.contactPerson || b.name,
          b.email,
          b.contact?.phone || "",
          b.contact?.billingEmail || "",
          b.contact?.invoiceReference || "",
          b.contact?.organisationNumber || "",
          b.contact?.street || "",
          b.contact?.addressLine2 || "",
          b.contact?.postalCode || "",
          b.contact?.city || "",
          b.contact?.country || "Sverige",
          b.date,
          b.total,
        ]
          .map(quote)
          .join(","),
      ),
    ].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flottsbro-bokningar.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportPrep = (b: Booking) => {
    const q = (v: string) => '"' + v.replaceAll('"', '""') + '"';
    const people = Array.from(
      { length: Math.max(b.flowSnapshot?.groupCount ?? 0, b.participants?.length ?? 0) },
      (_, index) => b.participants?.[index] ?? {
        name: "", role: null, birthDate: "", activity: "", equipment: "own" as const,
        shoe: "", height: "", weight: "",
      },
    );
    const rows = [
      "Namn,Roll,Födelsedatum,Aktivitet,Lånar utrustning,Skostorlek,Längd (cm),Vikt (kg)",
      ...people.map((p) =>
        [
          p.name,
          p.role === "teacher" ? "Lärare" : "",
          p.birthDate || "",
          p.activity,
          equipmentChoice(p) === "borrow" ? "Ja" : "Nej",
          equipmentChoice(p) === "borrow" ? p.shoe : "",
          equipmentChoice(p) === "borrow" ? p.height : "",
          equipmentChoice(p) === "borrow" ? p.weight : "",
        ]
          .map(q)
          .join(","),
      ),
    ];
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + rows.join("\r\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `arbetsunderlag-${b.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const active = bookings.filter((b) => b.status !== "Avbokad");
  const revenue = active
    .filter((b) => b.payment.startsWith("Betald") || b.payment.startsWith("Simulerad betalning"))
    .reduce((s, b) => s + b.total, 0);
  const invoiced = active
    .filter((b) => b.payment === "Fakturaunderlag skapat")
    .reduce((s, b) => s + b.total, 0);
  const selectedDraft = booking ? draftForBooking(booking, false) : null;
  const selectedCapacityIssues = booking && selectedDraft
    ? capacityIssues(selectedDraft, bookings, { forest: 2, family: 4, view: 6 }, booking.id)
    : [];
  const groupPeople = booking?.kind === "group"
    ? Array.from(
        { length: Math.max(booking.flowSnapshot?.groupCount ?? 0, booking.participants?.length ?? 0) },
        (_, index): Participant => booking.participants?.[index] ?? {
          name: "",
          role: null,
          birthDate: "",
          activity: "",
          equipment: "own",
          shoe: "",
          height: "",
          weight: "",
        },
      )
    : [];
  const guestPeople = booking?.kind !== "group" && selectedDraft
    ? Array.from(
        { length: selectedDraft.adults + selectedDraft.children },
        (_, index) => ({
          name: selectedDraft.guests?.[index] || booking?.guestNames?.[index] ||
            (index < selectedDraft.adults ? `Vuxen ${index + 1}` : `Barn ${index - selectedDraft.adults + 1}`),
          birthDate: index < selectedDraft.adults ? "" : selectedDraft.childBirthDates?.[index - selectedDraft.adults] || "",
          borrows: selectedDraft.borrowGuests?.includes(index) ?? false,
          details: selectedDraft.rentalDetails?.[index] || booking?.rentalDetails?.[index],
        }),
      )
    : [];
  const guestBorrowCount = guestPeople.filter((person) => person.borrows).length;
  const bookingText = (value: string) => displayBookingText(value, language);
  const statusText = (status: Status) => language === "sv" ? status :
    ({ Bekräftad: "Confirmed", Preliminär: "Provisional", Avbokad: "Cancelled" }[status]);
  return (
    <>
      <SectionHead
        eyebrow="FLOTTSBRO · PERSONALVY"
        title="Bokningsöversikt"
        description="Se gäster, grupper, betalstatus och ändringar från ett gränssnitt."
        action={
          <Button variant="secondary" onClick={exportCsv}>
            <Download size={16} /> Exportera CSV
          </Button>
        }
      />
      <details className="admin-demo-guide card">
        <summary>Vad visas i demon?</summary>
        <p><strong>Kundanpassad prototyp:</strong> Gästflöde, gruppbokning, deltagarlista, personalvy, ändringar, prisberäkning och CSV export visas i samma gränssnitt.</p>
        <p><strong>Simulerat:</strong> Inloggning, betalning, signering, tillgänglighet och lager använder exempeldata i webbläsaren. Inga pengar dras och ingen e-post skickas.</p>
        <p><strong>Inför en verklig lösning:</strong> Konton, betalväxel, bokningslager, fakturering, kundmeddelanden och behörigheter behöver kopplas till riktiga tjänster. Priser, villkor och kapaciteter behöver fastställas av Flottsbro.</p>
        <p><strong>Systembyte i den här demon:</strong> Gäst och personal använder två vyer i samma app. Data lagras lokalt i den aktuella webbläsaren.</p>
      </details>
      <div className="stats">
        <div className="stat card">
          <span>Aktiva bokningar</span>
          <strong>{active.length}</strong>
          <small>
            <CalendarDays size={14} /> Samtliga flöden
          </small>
        </div>
        <div className="stat card">
          <span>Registrerat betalt</span>
          <strong>{SEK(revenue)}</strong>
          <small>
            <CreditCard size={14} /> Inklusive simulerade betalningar
          </small>
        </div>
        <div className="stat card">
          <span>Gruppbokningar</span>
          <strong>{active.filter((b) => b.kind === "group").length}</strong>
          <small>
            <Users size={14} /> Faktura som betalmetod
          </small>
        </div>
        <div className="stat card">
          <span>Fakturaunderlag</span>
          <strong>{SEK(invoiced)}</strong>
          <small><FileText size={14} /> Slutförda grupper</small>
        </div>
        <div className="stat card">
          <span>Max per gruppbokning</span>
          <strong>120</strong>
          <small>
            <Activity size={14} /> Gräns för deltagarlistan
          </small>
        </div>
      </div>
      <div className="admin-grid">
        <div className="card admin-list">
          <div className="admin-filters">
            <div className="search">
              <Search size={17} />
              <input
                placeholder="Sök namn eller bokningsnr"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="filter">
              <SlidersHorizontal size={16} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | Kind)}
              >
                <option value="all">Alla typer</option>
                <option value="day">Dagsbesök</option>
                <option value="stay">Boende</option>
                <option value="group">Grupper</option>
              </select>
            </div>
          </div>
          <div className="admin-list-head">
            <span>Senaste bokningar</span>
            <span>{filtered.length} resultat</span>
          </div>
          {filtered.map((b) => (
            <button
              key={b.id}
              className={`admin-item ${booking?.id === b.id ? "selected" : ""}`}
              onClick={() => setSelected(b.id)}
            >
              <span className={`admin-kind ${b.kind}`}>
                <BookingTypeIcon booking={b} />
              </span>
              <span className="admin-item-info">
                <strong>{b.name}</strong>
                <small>
                  {b.id} · {b.date}
                </small>
              </span>
              <span className="admin-item-end">
                <b>{SEK(b.total)}</b>
                <Badge
                  tone={
                    b.status === "Avbokad"
                      ? "red"
                      : b.status === "Preliminär"
                        ? "amber"
                        : "green"
                  }
                >
                  {statusText(b.status)}
                </Badge>
              </span>
            </button>
          ))}
          {!filtered.length && (
            <div className="empty">Inga bokningar matchar sökningen.</div>
          )}
        </div>
        <div className="card admin-detail">
          {booking ? (
            <>
              <div className="detail-head">
                <div>
                  <div className="eyebrow">BOKNING {booking.id}</div>
                  <h2>{booking.name}</h2>
                  <span>{booking.email}</span>
                </div>
                <Badge
                  tone={
                    booking.status === "Avbokad"
                      ? "red"
                      : booking.status === "Preliminär"
                        ? "amber"
                        : "green"
                  }
                >
                  {statusText(booking.status)}
                </Badge>
              </div>
              <div className="admin-booking-actions">
                {booking.status !== "Avbokad" && (
                  <>
                    <Button variant="secondary" onClick={() => onEdit(booking)}>
                      {booking.status === "Preliminär" ? "Komplettera" : "Ändra bokning"}
                    </Button>
                    <Button variant="ghost" onClick={() => setCancelBooking(booking)}>Avboka</Button>
                  </>
                )}
                {booking.kind === "group" && booking.payment === "Fakturaunderlag skapat" && booking.status === "Bekräftad" && (
                  <Button variant="secondary" onClick={() => downloadInvoiceCsv(booking)}>
                    <Download size={15} /> Fakturaunderlag
                  </Button>
                )}
              </div>
              <div className="detail-type">
                <span className={`admin-kind ${booking.kind}`}>
                  <BookingTypeIcon booking={booking} />
                </span>
                <div>
                  <strong>{bookingText(bookingTypeName(booking))}</strong>
                  <span>{booking.date}</span>
                </div>
              </div>
              <div className="detail-section">
                <h3>Innehåll</h3>
                {booking.items.map((item, i) => (
                  <div className="detail-line" key={i}>
                    <Check size={15} />
                    {bookingText(item)}
                  </div>
                ))}
                <p>{bookingText(booking.details)}</p>
              </div>
              {booking.contact && (
                <div className="detail-section">
                  <h3>Kontakt & adress</h3>
                  <p>
                    <strong>
                      {booking.contact.contactPerson || booking.name}
                    </strong>
                    {booking.contact.position
                      ? ` · ${bookingText(booking.contact.position)}`
                      : ""}
                  </p>
                  <p>
                    {booking.email} · {booking.contact.phone}
                  </p>
                  <p>{bookingText(formatAddress(booking.contact))}</p>
                  {booking.kind === "group" && (
                    <p>
                      Faktura: {booking.contact.billingEmail || booking.email}
                      {booking.contact.invoiceReference
                        ? ` · Ref: ${booking.contact.invoiceReference}`
                        : ""}
                      {booking.contact.organisationNumber
                        ? ` · Org.nr ${booking.contact.organisationNumber}`
                        : ""}
                    </p>
                  )}
                  {booking.contact.note && (
                    <p>Meddelande: {booking.contact.note}</p>
                  )}
                </div>
              )}
              {booking.kind !== "group" && guestPeople.length > 0 && (
                <div className="detail-section">
                  <h3>Deltagare & utrustning</h3>
                  <p>{guestBorrowCount
                    ? `${guestBorrowCount} av ${guestPeople.length} deltagare lånar utrustning. Utrustning hämtas vid uthyrningen.`
                    : "Ingen i sällskapet lånar utrustning."}</p>
                  <div className="admin-guest-list">
                    {guestPeople.map((person, index) => (
                      <div className="admin-guest-card" key={index}>
                        <div className="admin-guest-card-head">
                          <div>
                            <strong>{person.name}</strong>
                            {person.birthDate && <small>Födelsedatum: {person.birthDate}</small>}
                          </div>
                          <span className={person.borrows ? "borrowed" : ""}>{person.borrows ? "Lånar" : "Egen"}</span>
                        </div>
                        {person.borrows && (
                          <dl className="admin-guest-measurements">
                            <div><dt>Utrustning</dt><dd>{bookingText(person.details?.activity === "Skidåkning" ? "Skidor" : person.details?.activity === "Cykling" ? "Cykel" : person.details?.activity || "Saknas")}</dd></div>
                            <div><dt>Skostorlek</dt><dd>{person.details?.shoe || "—"}</dd></div>
                            <div><dt>Längd (cm)</dt><dd>{person.details?.height || "—"}</dd></div>
                            <div><dt>Vikt (kg)</dt><dd>{person.details?.weight || "—"}</dd></div>
                          </dl>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="detail-section">
                <h3>Ekonomi</h3>
                <div className="review-list">
                  <div>
                    <span>Totalt</span>
                    <strong>{SEK(booking.total)}</strong>
                  </div>
                  <div>
                    <span>Betalstatus</span>
                    <Badge
                      tone={
                        booking.payment.includes("väntar") ? "amber" : "green"
                      }
                    >
                      {bookingText(booking.payment)}
                    </Badge>
                  </div>
                </div>
                {booking.kind === "group" &&
                  booking.status === "Preliminär" && (
                    <p>
                      Fakturaunderlag skapas när deltagaruppgifterna är klara
                      och gruppen slutförs.
                    </p>
                  )}
              </div>
              {booking.kind === "group" && (
                <div className="detail-section">
                  <h3>Förberedelser</h3>
                  <p>
                    {groupPeople.filter((person) => !participantComplete(person, booking.date)).length} deltagare har uppgifter kvar att komplettera.
                  </p>
                  <p>
                    {groupPeople.filter((p) => p.role !== "teacher")
                      .length}{" "}
                    elever och{" "}
                    {groupPeople.filter((p) => p.role === "teacher")
                      .length}{" "}
                    lärare registrerade. Lärare är gratis.
                  </p>
                  <p>
                    Skidåkning:{" "}
                    {groupPeople.filter(
                      (p) => p.activity === "Skidåkning",
                    ).length}
                    . Snowboard:{" "}
                    {groupPeople.filter(
                      (p) => p.activity === "Snowboard",
                    ).length}
                    . Medföljande:{" "}
                    {groupPeople.filter(
                      (p) => p.activity === "Medföljande",
                    ).length}
                    .
                  </p>
                  <p>
                    {groupPeople.filter(
                      (p) => equipmentChoice(p) === "borrow",
                    ).length}{" "}
                    lånar utrustning.{" "}
                    {groupPeople.filter(
                      (p) => equipmentChoice(p) === "own",
                    ).length}{" "}
                    tar med egen. Arbetsunderlaget visar födelsedatum och mått
                    för dem som lånar.
                  </p>
                  {groupPeople.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => exportPrep(booking)}
                    >
                      <Download size={15} /> Exportera arbetsunderlag
                    </Button>
                  )}
                  {groupPeople.some((person) => !participantComplete(person, booking.date)) && (
                    <p className="admin-capacity-warning">
                      Saknade uppgifter: {groupPeople.map((person, index) => !participantComplete(person, booking.date) ? person.name || `Deltagare ${index + 1}` : null).filter(Boolean).slice(0, 8).join(", ")}
                      {groupPeople.filter((person) => !participantComplete(person, booking.date)).length > 8 ? " …" : ""}.
                    </p>
                  )}
                  {groupPeople.length > 0 && (
                    <details className="admin-participants">
                      <summary>Deltagarlista ({groupPeople.length})</summary>
                      <div className="admin-participants-scroll">
                        <table>
                          <thead>
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col">Namn</th>
                              <th scope="col">Roll</th>
                              <th scope="col">Födelsedatum</th>
                              <th scope="col">Aktivitet</th>
                              <th scope="col">Utrustning</th>
                              <th scope="col">Skostorlek</th>
                              <th scope="col">Längd</th>
                              <th scope="col">Vikt</th>
                              <th scope="col">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupPeople.map((person, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{person.name || "—"}</td>
                                <td>{person.role === "teacher" ? "Lärare" : "Elev"}</td>
                                <td>{person.birthDate || "—"}</td>
                                <td>{bookingText(person.activity) || "—"}</td>
                                <td>{equipmentChoice(person) === "borrow" ? "Lånar" : "Egen"}</td>
                                <td>{person.shoe || "—"}</td>
                                <td>{person.height || "—"}</td>
                                <td>{person.weight || "—"}</td>
                                <td>{participantComplete(person, booking.date) ? "Klar" : "Saknas"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  )}
                </div>
              )}
              {selectedDraft && booking.status !== "Avbokad" && (
                <div className="detail-section">
                  <h3>Kapacitet för bokningen</h3>
                  {selectedDraft.cabin !== "none" && (
                    <p>
                      {cabinUnitsNeeded(selectedDraft, { forest: 2, family: 4, view: 6 }[selectedDraft.cabin])} stugor valda · {cabinUnitsLeft(bookings, selectedDraft.cabin, { forest: 2, family: 4, view: 6 }[selectedDraft.cabin], selectedDraft.start, selectedDraft.end, booking.id)} av {cabinStock[selectedDraft.cabin]} lediga för perioden utöver bokningen.
                    </p>
                  )}
                  {selectedDraft.pass !== "none" && <p>
                    {selectedDraft.season === "winter" ? "SkiPass" : "Cykelpass"}: {passDemand(selectedDraft)} bokade · {passUnitsLeft(bookings, selectedDraft.season, selectedDraft.start, booking.id)} av {passStock[selectedDraft.season]} lediga på startdagen utöver bokningen.
                  </p>}
                  {(Object.keys(equipmentStock) as EquipmentKind[]).map((kind) => {
                    const count = equipmentDemand(selectedDraft, kind);
                    return count ? <p key={kind}>
                      {kind === "ski" ? "Skidor" : kind === "snowboard" ? "Snowboard" : "Cyklar"}: {count} bokade · {equipmentUnitsLeft(bookings, kind, selectedDraft.start, booking.id)} av {equipmentStock[kind]} lediga på startdagen utöver bokningen.
                    </p> : null;
                  })}
                  {Object.entries(selectedDraft.sessionAssignments ?? {}).flatMap(([key, assignments]) => {
                    const date = key.slice(-10);
                    const offering = key.slice(0, -11);
                    return [...new Set(Object.values(assignments))].filter(Boolean).map((time) => <p key={`${key}-${time}`}>
                      {offering === "school" ? "Skola" : offering} {date} kl {time}: {Object.values(assignments).filter((value) => value === time).length} bokade · {sessionSeatsLeft(bookings, offering, date, time, selectedDraft.schoolLesson, booking.id)} av {sessionCapacity(offering, selectedDraft.schoolLesson)} lediga utöver bokningen.
                    </p>);
                  })}
                  {selectedCapacityIssues.length
                    ? selectedCapacityIssues.map((issue) => <p className="admin-capacity-warning" key={issue}>{issue}</p>)
                    : <p>Inga kapacitetskonflikter med övriga bokningar.</p>}
                </div>
              )}
              <div className="detail-section">
                <h3>Ändringshistorik</h3>
                {booking.history.map((h, i) => (
                  <div className="history" key={i}>
                    <span className="history-dot" />
                    {bookingText(h)}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty">Välj en bokning.</div>
          )}
        </div>
      </div>
      {cancelBooking && <ConfirmDialog
        title="Avboka bokningen?"
        description={`Bokning ${cancelBooking.id} markeras som avbokad. Betalstatus och historik uppdateras.`}
        confirmLabel="Avboka bokningen"
        onClose={() => setCancelBooking(null)}
        onConfirm={() => { onCancel(cancelBooking); setCancelBooking(null); }}
      />}
    </>
  );
}

function CartDrawer({
  items,
  onClose,
  onContinue,
  onRemove,
  onBrowse,
}: {
  items: CartEntry[];
  onClose: () => void;
  onContinue: (entry: CartEntry) => void;
  onRemove: (id: CartEntry["id"]) => void;
  onBrowse: () => void;
}) {
  const hasOldMealPrice = (entry: CartEntry) =>
    entry.id.startsWith("flow-")
      ? Boolean(
          (entry.draft as FlowDraft & { mealDays?: string[] }).mealDays?.length,
        )
      : Boolean((entry.draft as DayDraft | StayDraft).meal);
  const needsPriceRefresh = items.some(hasOldMealPrice);
  return (
    <div className="cart-overlay" onMouseDown={onClose}>
      <aside
        className="cart-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.key === "Escape" && onClose()}
      >
        <div className="cart-head">
          <div>
            <span className="eyebrow">DIN BESTÄLLNING</span>
            <h2 id="cart-title">
              Varukorg <span>({items.length})</span>
            </h2>
          </div>
          <button
            className="cart-close"
            onClick={onClose}
            aria-label="Stäng varukorg"
            autoFocus
          >
            <X size={21} />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={38} />
            <h3>Din varukorg är tom</h3>
            <p>Välj en upplevelse för att börja boka.</p>
            <Button onClick={onBrowse}>
              Utforska upplevelser <ArrowRight size={16} />
            </Button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {items.map((entry) => {
                if (entry.id.startsWith("flow-")) {
                  const draft = entry.draft as FlowDraft;
                  const title =
                    draft.entry === "group"
                      ? "Gruppbokning"
                      : draft.entry === "stay"
                        ? "Boende på Flottsbro"
                        : draft.entry === "rental"
                          ? "Hyra utrustning"
                          : draft.entry === "school"
                            ? draft.season === "winter"
                              ? "Skidskola"
                              : "Cykelskola"
                            : draft.entry === "activity"
                              ? "Aktiviteter"
                              : draft.season === "winter"
                                ? "SkiPass och vistelse"
                                : "Cykling och vistelse";
                  return (
                    <div className="cart-item" key={entry.id}>
                      <div className="cart-item-icon winter">
                        <ShoppingBag size={20} />
                      </div>
                      <div className="cart-item-main">
                        <span className="cart-item-type">
                          {draft.season === "winter" ? "VINTER" : "SOMMAR"} ·
                          PÅGÅENDE BOKNING
                        </span>
                        <strong>{title}</strong>
                        <span>
                          {draft.start} – {draft.end} ·{" "}
                          {draft.entry === "group"
                            ? draft.groupCount
                            : draft.adults + draft.children}{" "}
                          {(draft.entry === "group" ? draft.groupCount : draft.adults + draft.children) === 1 ? "person" : "personer"}
                        </span>
                        <b>
                          {hasOldMealPrice(entry)
                            ? "Pris uppdateras när du fortsätter"
                            : SEK(draft.total)}
                        </b>
                        <div className="cart-item-actions">
                          <button onClick={() => onContinue(entry)}>
                            Fortsätt boka <ArrowRight size={15} />
                          </button>
                          <button
                            onClick={() => onRemove(entry.id)}
                            aria-label={`Ta bort ${title}`}
                          >
                            <Trash2 size={15} /> Ta bort
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
                const day = entry.id !== "stay-summer";
                const draft = entry.draft;
                const title =
                  entry.id === "day-winter"
                    ? `Skidpass ${(draft as DayDraft).skiPass === "full" ? "heldag" : "tre timmar"}`
                    : entry.id === "day-summer"
                      ? "Cykling på Flottsbro"
                      : (draft as StayDraft).lodge === "cabin"
                        ? "Stuga B"
                        : "Stuga C";
                const date = day
                  ? (draft as DayDraft).date
                  : (draft as StayDraft).start;
                const guests = `${draft.adults + draft.children} ${draft.adults + draft.children === 1 ? "person" : "personer"}`;
                return (
                  <div className="cart-item" key={entry.id}>
                    <div
                      className={`cart-item-icon ${entry.id === "day-winter" ? "winter" : "summer"}`}
                    >
                      {entry.id === "day-winter" ? (
                        <Snowflake size={20} />
                      ) : entry.id === "day-summer" ? (
                        <Bike size={20} />
                      ) : (
                        <TentTree size={20} />
                      )}
                    </div>
                    <div className="cart-item-main">
                      <span className="cart-item-type">
                        {entry.id === "day-winter" ? "VINTER" : "SOMMAR"} ·{" "}
                        {day ? "DAGSBESÖK" : "BOENDE"}
                      </span>
                      <strong>{title}</strong>
                      <span>
                        {date} · {guests}
                        {!day ? ` · ${(draft as StayDraft).nights} nätter` : ""}
                      </span>
                      <b>
                        {hasOldMealPrice(entry)
                          ? "Pris uppdateras när du fortsätter"
                          : SEK(draft.total)}
                      </b>
                      <div className="cart-item-actions">
                        <button onClick={() => onContinue(entry)}>
                          Fortsätt boka <ArrowRight size={15} />
                        </button>
                        <button
                          onClick={() => onRemove(entry.id)}
                          aria-label={`Ta bort ${title}`}
                        >
                          <Trash2 size={15} /> Ta bort
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="cart-bottom">
              <div>
                <span>Summa pågående bokningar</span>
                <strong>
                  {needsPriceRefresh
                    ? "Uppdateras när du fortsätter"
                    : SEK(items.reduce((sum, item) => sum + item.draft.total, 0))}
                </strong>
              </div>
              <p>
                Slutför varje bokning för att bekräfta den. Inga verkliga
                betalningar görs i prototypen.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

// Kept available while older saved bookings are still supported.
void Stay;
void Group;
void Day;
function AuthPage({
  view,
  bookingEntry,
  bookingSeason,
  signedInEmail,
  signedInName,
  onBack,
  onGuest,
  onShowLogin,
  onShowSignup,
  onLogin,
  onBookings,
  onSignOut,
}: {
  view: AuthView;
  bookingEntry: FlowEntry | null;
  bookingSeason: Season;
  signedInEmail: string | null;
  signedInName: string | null;
  onBack: () => void;
  onGuest: () => void;
  onShowLogin: () => void;
  onShowSignup: () => void;
  onLogin: (email: string, name?: string) => void;
  onBookings: () => void;
  onSignOut: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const fillExampleAccount = () => {
    setEmail("anna.lind@example.com");
    setPassword("demo1234");
    if (view === "signup") {
      setName("Anna Lind");
      setConfirmPassword("demo1234");
    }
    setError("");
  };
  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, [view]);
  const entryName = bookingEntry
    ? ({
        stay: "boende",
        day: bookingSeason === "winter" ? "SkiPass" : "cykelpass",
        rental: "hyra",
        school: bookingSeason === "winter" ? "skidskola" : "cykelskola",
        activity: "aktiviteter",
        group: "gruppbokning",
      } as Record<FlowEntry, string>)[bookingEntry]
    : null;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 4) {
      setError("Ange en giltig e-postadress och minst fyra tecken i lösenordet.");
      return;
    }
    setError("");
    setPassword("");
    onLogin(email.trim());
  };
  const submitSignup = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 4) {
      setError("Ange namn, en giltig e-postadress och ett lösenord med minst fyra tecken.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Lösenorden stämmer inte överens.");
      return;
    }
    setError("");
    setPassword("");
    setConfirmPassword("");
    onLogin(email.trim(), name.trim());
  };
  return (
    <div className="auth-page">
      {(view === "login" || view === "signup") && (
        <AutoFillButton onClick={fillExampleAccount} />
      )}
      <button type="button" className="auth-back" onClick={onBack}>
        <ArrowLeft size={17} /> Tillbaka
      </button>
      <div className="auth-card">
        <span className="eyebrow">FLOTTSBRO</span>
        {entryName && <p className="auth-context">Din bokning · {entryName}</p>}
        {view === "choice" && (
          <>
            <h1>Hur vill du fortsätta?</h1>
            <p className="auth-intro">
              Välj hur du vill påbörja bokningen. Kontaktuppgifter fyller du i senare.
            </p>
            <div className="auth-options">
              <button type="button" onClick={onShowLogin}>
                <span className="auth-option-icon"><UserRound size={22} /></span>
                <strong>Logga in</strong>
                <small>Simulerad inloggning</small>
                <ArrowRight size={18} />
              </button>
              <button type="button" onClick={onGuest}>
                <span className="auth-option-icon"><Users size={22} /></span>
                <strong>Fortsätt som gäst</strong>
                <small>Du kan boka utan konto</small>
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
        {view === "login" && (
          <>
            <h1>Logga in</h1>
            <p className="auth-intro">
              Ange din e-postadress för att fortsätta.
            </p>
            <form className="auth-form" onSubmit={submit}>
              <label>
                E-postadress
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="namn@exempel.se"
                  required
                />
              </label>
              <label>
                Lösenord
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minst fyra tecken"
                  minLength={4}
                  required
                />
              </label>
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button type="submit" className="auth-primary">
                {bookingEntry ? "Logga in och fortsätt" : "Logga in"}
                <ArrowRight size={18} />
              </button>
            </form>
            <button type="button" className="auth-text-button" onClick={onShowSignup}>
              Ny här? Skapa konto
            </button>
            <p className="auth-note">
              Inloggningen är simulerad. Inga riktiga konton används och lösenordet sparas inte.
            </p>
          </>
        )}
        {view === "signup" && (
          <>
            <h1>Skapa konto</h1>
            <p className="auth-intro">
              Fyll i dina uppgifter för att fortsätta med ett simulerat konto.
            </p>
            <form className="auth-form" onSubmit={submitSignup}>
              <label>
                För- och efternamn
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ditt namn"
                  required
                />
              </label>
              <label>
                E-postadress
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="namn@exempel.se"
                  required
                />
              </label>
              <label>
                Lösenord
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minst fyra tecken"
                  minLength={4}
                  required
                />
              </label>
              <label>
                Bekräfta lösenord
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Skriv lösenordet igen"
                  minLength={4}
                  required
                />
              </label>
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button type="submit" className="auth-primary">
                {bookingEntry ? "Skapa konto och fortsätt" : "Skapa konto"}
                <ArrowRight size={18} />
              </button>
            </form>
            <button type="button" className="auth-text-button" onClick={onShowLogin}>
              Har du redan ett konto? Logga in
            </button>
            <p className="auth-note">
              Kontot skapas bara för den här visningen. Inga riktiga konton eller lösenord sparas.
            </p>
          </>
        )}
        {view === "account" && (
          <>
            <h1>Mitt konto</h1>
            <p className="auth-intro">
              Du är inloggad som <strong>{signedInName || signedInEmail}</strong>
              {signedInName && <> · {signedInEmail}</>}.
            </p>
            <div className="auth-account-actions">
              <button type="button" className="auth-primary" onClick={onBookings}>
                Mina bokningar <ArrowRight size={18} />
              </button>
              <button type="button" className="auth-text-button" onClick={onSignOut}>
                Logga ut
              </button>
            </div>
            <p className="auth-note">Kontot är simulerat i den här prototypen.</p>
          </>
        )}
      </div>
    </div>
  );
}
function App() {
  const [language, setLanguage] = useState<"sv" | "en">(() =>
    localStorage.getItem("flottsbro-language") === "en" ? "en" : "sv",
  );
  const [page, setPage] = useState<Page>("overview");
  const [dayMode, setDayMode] = useState<"new" | "return">("new");
  const [season, setSeason] = useState<Season>("winter");
  const [cartItems, setCartItems] = useState<CartEntry[]>(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [dayEpoch, setDayEpoch] = useState(0);
  const [stayEpoch, setStayEpoch] = useState(0);
  const [searchEpoch, setSearchEpoch] = useState(0);
  const [searchDraft, setSearchDraft] = useState<FlowDraft | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(load);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("choice");
  const [pendingDraft, setPendingDraft] = useState<FlowDraft | null>(null);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [signedInName, setSignedInName] = useState<string | null>(null);
  const [returnToBookingsAfterLogin, setReturnToBookingsAfterLogin] = useState(false);
  const [shouldPersist, setShouldPersist] = useState(false);
  useEffect(() => {
    if (language === "sv") localStorage.removeItem("flottsbro-language");
    else localStorage.setItem("flottsbro-language", language);
    document.documentElement.lang = language;
    document.title = language === "en" ? "Flottsbro · Experiences & stays" : "Flottsbro · Upplevelser & boende";
  }, [language]);
  useEffect(() => installPublicTranslation(language), [language, page]);
  useEffect(() => {
    if (shouldPersist)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings, shouldPersist]);
  useEffect(() => {
    if (cartItems.length)
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    else localStorage.removeItem(CART_KEY);
  }, [cartItems]);
  const onBook = (b: Booking) => {
    setShouldPersist(true);
    setBookings((bs) => [{
      ...b,
      accountEmail: signedInEmail && b.flowSnapshot?.checkoutMode === "login"
        ? signedInEmail : undefined,
    }, ...bs]);
    if (b.kind === "day")
      setCartItems((items) =>
        items.filter(
          (item) =>
            item.id !==
            (b.items.some((name) => name.includes("Skidpass"))
              ? "day-winter"
              : "day-summer"),
        ),
      );
    if (b.kind === "stay")
      setCartItems((items) =>
        items.filter((item) => item.id !== "stay-summer"),
      );
  };
  const onUpdate = (id: string, fn: (b: Booking) => Booking) => {
    setShouldPersist(true);
    setBookings((bs) => bs.map((b) => b.id === id
      ? { ...fn(b), accountEmail: b.accountEmail }
      : b));
  };
  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem("flottsbro-language");
    setLanguage("sv");
    setShouldPersist(false);
    setBookings(seed.map(normalizeBooking));
    setResetOpen(false);
    setPage("overview");
    setMobileOpen(false);
    setCartItems([]);
    setCartOpen(false);
    setSeason("winter");
    setSearchDraft(null);
    setPendingDraft(null);
    setSignedInEmail(null);
    setSignedInName(null);
    setReturnToBookingsAfterLogin(false);
  };
  const launchFlow = (draft: FlowDraft) => {
    setSeason(draft.season);
    setDayMode("new");
    setSearchDraft(draft);
    setSearchEpoch((value) => value + 1);
    setPendingDraft(null);
    setPage(draft.entry);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const editBooking = (booking: Booking) => launchFlow(draftForBooking(booking, true));
  const rebookBooking = (booking: Booking) => {
    const draft = draftForBooking(booking, false);
    const nextStart = dateOffset(draft.start, 7) < dateOffset(today(), 1)
      ? dateOffset(today(), 7)
      : dateOffset(draft.start, 7);
    const dayShift = dateSpan(draft.start, nextStart);
    draft.start = nextStart;
    draft.end = dateOffset(draft.end, dayShift);
    draft.sessionAssignments = Object.fromEntries(
      Object.entries(draft.sessionAssignments ?? {}).map(([key, people]) => [
        `${key.slice(0, -10)}${dateOffset(key.slice(-10), dayShift)}`,
        people,
      ]),
    );
    draft.childAges = draft.childBirthDates.map((date, index) =>
      date
        ? Number(nextStart.slice(0, 4)) - Number(date.slice(0, 4)) -
          (nextStart.slice(5) < date.slice(5) ? 1 : 0)
        : draft.childAges[index] ?? null,
    );
    draft.step = booking.kind === "group" ? 0 : 8;
    draft.rebookOf = booking.id;
    draft.rebookQuick = booking.kind !== "group";
    launchFlow(draft);
  };
  const cancelBooking = (booking: Booking) => onUpdate(booking.id, (current) => ({
    ...current,
    status: "Avbokad",
    payment: current.payment.includes("Faktura") || current.payment.includes("faktura")
      ? "Faktura makulerad" : "Återbetalning väntar · simulerad",
    history: [...current.history, `Avbokad ${today()} · bekräftelsen uppdaterad`],
  }));
  const beginFlow = (draft: FlowDraft) => {
    setReturnToBookingsAfterLogin(false);
    if (signedInEmail) {
      launchFlow({
        ...draft,
        checkoutMode: "login",
        email: draft.email || signedInEmail,
        name: draft.name || signedInName || "",
      });
    } else if (draft.checkoutMode) {
      launchFlow(draft);
    } else {
      setPendingDraft(draft);
      setAuthView("choice");
      setPage("auth");
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const go = (p: Page) => {
    if (["day", "stay", "group", "rental", "school", "activity"].includes(p)) {
      const entry = p as FlowEntry;
      if (entry === "day") setDayMode("new");
      const saved = cartItems.find((item) => item.id === `flow-${entry}-${season}`)
        ?.draft as FlowDraft | undefined;
      beginFlow(saved ?? createFlowDraft(entry, season));
      return;
    }
    setSearchDraft(null);
    setPendingDraft(null);
    setPage(p);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const startFromFinder = (selection: FinderSelection) => {
    const draft = createFlowDraft(selection.entry, season);
    draft.start = selection.start;
    draft.end = selection.end;
    draft.adults = selection.adults;
    draft.children = selection.children;
    draft.childAges = selection.childAges;
    draft.step = 1;
    beginFlow(draft);
  };
  const switchSeason = (next: Season) => {
    setSeason(next);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const onFlowDraftChange = (draft: FlowDraft) => {
    const id = `flow-${draft.entry}-${draft.season}` as const;
    setCartItems((items) => [
      ...items.filter((item) => item.id !== id),
      { id, draft },
    ]);
  };
  const removeCartItem = (id: CartEntry["id"]) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
    if (page === "day" && id === `day-${season}`)
      setDayEpoch((value) => value + 1);
    if (page === "stay" && id === "stay-summer")
      setStayEpoch((value) => value + 1);
  };
  const continueCartItem = (entry: CartEntry) => {
    setCartOpen(false);
    setMobileOpen(false);
    setDayMode("new");
    if (entry.id.startsWith("flow-")) {
      const draft = entry.draft as FlowDraft;
      beginFlow(draft);
      return;
    }
    setSeason(entry.id === "day-winter" ? "winter" : "summer");
    setPage(entry.id === "stay-summer" ? "stay" : "day");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const showBookings = () => {
    setDayMode("return");
    setPage("day");
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openBookings = () => {
    if (!signedInEmail) {
      setPendingDraft(null);
      setReturnToBookingsAfterLogin(true);
      setAuthView("login");
      setPage("auth");
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    showBookings();
  };
  const openAccount = () => {
    setReturnToBookingsAfterLogin(false);
    const activeFlow =
      ["day", "stay", "group", "rental", "school", "activity"].includes(page) &&
      !(page === "day" && dayMode === "return")
        ? (cartItems.find((item) => item.id === `flow-${page}-${season}`)
            ?.draft as FlowDraft | undefined)
        : undefined;
    setPendingDraft(activeFlow ?? null);
    setAuthView(signedInEmail ? "account" : "login");
    setPage("auth");
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const continueAsGuest = () => {
    setReturnToBookingsAfterLogin(false);
    if (pendingDraft) {
      setSignedInEmail(null);
      setSignedInName(null);
      launchFlow({ ...pendingDraft, checkoutMode: "guest" });
    }
  };
  const completeLogin = (email: string, name?: string) => {
    setSignedInEmail(email);
    setSignedInName(name ?? null);
    if (pendingDraft)
      launchFlow({
        ...pendingDraft,
        checkoutMode: "login",
        email: pendingDraft.email || email,
        name: pendingDraft.name || name || "",
      });
    else if (returnToBookingsAfterLogin) {
      setReturnToBookingsAfterLogin(false);
      showBookings();
    } else setAuthView("account");
  };
  const backFromAuth = () => {
    if (authView === "signup") {
      setAuthView("login");
      return;
    }
    if (pendingDraft && authView === "login") {
      setAuthView("choice");
      return;
    }
    if (pendingDraft?.checkoutMode) {
      launchFlow(pendingDraft);
      return;
    }
    setReturnToBookingsAfterLogin(false);
    go("overview");
  };
  const brand = (
    <span className="brand-inner">
      <span className="brand-mark">
        <MountainSnow size={23} />
      </span>
      <span>
        <strong>FLOTTSBRO</strong>
        <small>UPPLEVELSER & BOENDE</small>
      </span>
    </span>
  );
  const guestContent = (
    <>
      {page === "auth" && (
        <AuthPage
          view={authView}
          bookingEntry={pendingDraft?.entry ?? null}
          bookingSeason={pendingDraft?.season ?? season}
          signedInEmail={signedInEmail}
          signedInName={signedInName}
          onBack={backFromAuth}
          onGuest={continueAsGuest}
          onShowLogin={() => setAuthView("login")}
          onShowSignup={() => setAuthView("signup")}
          onLogin={completeLogin}
          onBookings={openBookings}
          onSignOut={() => {
            setSignedInEmail(null);
            setSignedInName(null);
            setAuthView("login");
          }}
        />
      )}
      {page === "overview" && (
        <Overview go={go} season={season} onSearch={startFromFinder} />
      )}
      {page === "day" && dayMode === "return" && (
        <BookingsPage
          bookings={bookings}
          accountEmail={signedInEmail}
          language={language}
          onEdit={editBooking}
          onRebook={rebookBooking}
          onCancel={cancelBooking}
        />
      )}
      {(page === "stay" ||
        page === "group" ||
        page === "rental" ||
        page === "school" ||
        page === "activity" ||
        (page === "day" && dayMode === "new")) &&
        (() => {
          const entry = page as FlowEntry;
          const id = `flow-${entry}-${season}` as const;
          const initial =
            searchDraft?.entry === entry && searchDraft.season === season
              ? searchDraft
              : (cartItems.find((item) => item.id === id)?.draft as
                  FlowDraft | undefined);
          return (
            <BookingFlow
              key={`${entry}-${season}-${dayEpoch}-${stayEpoch}-${searchEpoch}`}
              entry={entry}
              season={season}
              language={language}
              bookings={bookings}
              initial={initial}
              onDraft={onFlowDraftChange}
              onComplete={onBook}
              onUpdate={(bookingId, booking) =>
                onUpdate(bookingId, (current) => ({
                  ...booking,
                  history:
                    booking.status === "Preliminär"
                      ? current.history
                      : [...current.history, ...booking.history],
                }))
              }
              onFinish={() => {
                setSearchDraft(null);
                setCartItems((items) => items.filter((item) => item.id !== id));
              }}
              onHome={() => go("overview")}
              onBookings={openBookings}
              onInvoice={downloadInvoiceCsv}
              onChangeAccount={(draft) => {
                setPendingDraft(draft);
                setAuthView("choice");
                setPage("auth");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          );
        })()}
    </>
  );
  return (
    <div
      className={
        page === "admin" ? "app-shell" : `store-shell season-${season}`
      }
    >
      {page === "admin" ? (
        <>
          <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
            <button className="brand" onClick={() => go("overview")}>
              {brand}
            </button>
            <div className="sidebar-label">PERSONALVY</div>
            <nav>
              <button className="active" onClick={() => go("admin")}>
                <LayoutDashboard size={18} />
                <span>Bokningar</span>
                <span className="nav-indicator" />
              </button>
              <button onClick={() => go("overview")}>
                <ShoppingBag size={18} />
                <span>Till butiken</span>
              </button>
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-disclosure">
                Exempeldata. Inga verkliga betalningar eller e-postmeddelanden
                skickas.
              </div>
              <div className="sidebar-location">
                <MapPin size={15} /> Huddinge, Stockholm
              </div>
            </div>
          </aside>
          {mobileOpen && (
            <button
              className="overlay"
              onClick={() => setMobileOpen(false)}
              aria-label="Stäng meny"
            />
          )}
          <div className="workspace">
            <header className="topbar">
              <button
                className="menu-button"
                onClick={() => setMobileOpen(true)}
                aria-label="Öppna meny"
              >
                <Menu size={22} />
              </button>
              <div className="breadcrumb">
                Flottsbro <span>/</span> <strong>Administration</strong>
              </div>
              <div className="topbar-right">
                <label className="store-language admin-language" data-no-translate>
                  <Globe2 size={17} aria-hidden="true" />
                  <span className="admin-language-label">{language === "en" ? "Language" : "Språk"}</span>
                  <span className="store-language-current">{language === "en" ? "English" : "Svenska"}</span>
                  <select
                    aria-label="Språk / Language"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value as "sv" | "en")}
                  >
                    <option value="sv">Svenska</option>
                    <option value="en">English</option>
                  </select>
                  <ChevronDown size={14} aria-hidden="true" />
                </label>
                <span className="avatar">FB</span>
              </div>
            </header>
            <main className="page-content">
              <Admin bookings={bookings} language={language} onEdit={editBooking} onCancel={cancelBooking} />
            </main>
            <footer>
              <span>© 2026 Flottsbro · Bokningssystem</span>
              <span>Exempeldata · inga verkliga betalningar</span>
            </footer>
          </div>
        </>
      ) : (
        <>
          <div className="store-announcement">
            <span>Upplevelser nära Stockholm · Boka enkelt online</span>
            <label className="store-language store-language-compact" data-no-translate>
              <Globe2 size={15} aria-hidden="true" />
              <span>{language === "sv" ? "SV / EN" : "EN / SV"}</span>
              <select
                aria-label="Språk / Language"
                value={language}
                onChange={(event) => setLanguage(event.target.value as "sv" | "en")}
              >
                <option value="sv">SV</option>
                <option value="en">English</option>
              </select>
              <ChevronDown size={12} aria-hidden="true" />
            </label>
          </div>
          <header className="store-header">
            <button className="store-brand" onClick={() => go("overview")}>
              {brand}
            </button>
            <nav
              className={`store-nav ${mobileOpen ? "open" : ""}`}
              aria-label="Huvudnavigation"
            >
              <button
                className={
                  page === "overview" ||
                  ["stay", "rental", "school", "activity"].includes(page) ||
                  (page === "day" && dayMode === "new")
                    ? "active"
                    : ""
                }
                onClick={() => go("overview")}
              >
                Boka
              </button>
              <button
                className={page === "group" ? "active" : ""}
                onClick={() => go("group")}
              >
                Grupper
              </button>
              <button
                className={
                  page === "day" && dayMode === "return" ? "active" : ""
                }
                onClick={openBookings}
              >
                Mina bokningar
              </button>
              <button className="store-staff-link" onClick={() => go("admin")}>
                För personal <ArrowRight size={14} />
              </button>
              <label className="store-language store-language-menu" data-no-translate>
                <Globe2 size={17} aria-hidden="true" />
                <span>Språk / Language</span>
                <select
                  aria-label={language === "en" ? "Language in menu" : "Språk / Language i menyn"}
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as "sv" | "en")}
                >
                  <option value="sv">Svenska</option>
                  <option value="en">English</option>
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </label>
            </nav>
            <label className="store-language" data-no-translate>
              <Globe2 size={17} aria-hidden="true" />
              <span>{language === "en" ? "Language" : "Språk"}</span>
              <span className="store-language-current">
                {language === "en" ? "English" : "Svenska"}
              </span>
              <select
                aria-label="Språk / Language"
                value={language}
                onChange={(event) => setLanguage(event.target.value as "sv" | "en")}
              >
                <option value="sv">Svenska</option>
                <option value="en">English</option>
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </label>
            <button
              type="button"
              className={`store-account-button${page === "auth" ? " active" : ""}`}
              onClick={openAccount}
              aria-label={signedInEmail ? "Mitt konto" : "Logga in"}
            >
              <UserRound size={19} />
              <span>{signedInEmail ? "Mitt konto" : "Logga in"}</span>
            </button>
            <button
              className="store-cart-button"
              onClick={() => setCartOpen(true)}
              aria-label={`Varukorg, ${cartItems.length} ${cartItems.length === 1 ? "pågående bokning" : "pågående bokningar"}`}
            >
              <ShoppingCart size={22} />
              {cartItems.length > 0 && (
                <span className="store-cart-count">{cartItems.length}</span>
              )}
            </button>
            <button
              className="store-menu"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? "Stäng meny" : "Öppna meny"}
              aria-expanded={mobileOpen}
            >
              <Menu size={23} />
            </button>
          </header>
          {page !== "auth" && <div className="season-bar">
            <div
              className="season-switch"
              role="tablist"
              aria-label="Välj säsong"
            >
              <button
                role="tab"
                aria-selected={season === "winter"}
                className={season === "winter" ? "selected" : ""}
                onClick={() => switchSeason("winter")}
              >
                <Snowflake size={16} /> Vinter
              </button>
              <button
                role="tab"
                aria-selected={season === "summer"}
                className={season === "summer" ? "selected" : ""}
                onClick={() => switchSeason("summer")}
              >
                <Sun size={16} /> Sommar
              </button>
            </div>
            <span>
              {season === "winter"
                ? "Boende, skidåkning & upplevelser"
                : "Boende, cykling & upplevelser"}
            </span>
          </div>}
          <main className="page-content store-content">{guestContent}</main>
          <footer className="store-footer">
            <span>© 2026 Flottsbro · Huddinge, Stockholm</span>
            <span>Aktiviteter · Boende · Grupper</span>
          </footer>
        </>
      )}
      <button
        type="button"
        className="reset-floating-button"
        onClick={() => setResetOpen(true)}
        aria-label="Rensa sparad data"
        title="Rensa sparad data"
      >
        <RotateCcw size={19} strokeWidth={1.8} />
      </button>
      {page !== "admin" && cartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onContinue={continueCartItem}
          onRemove={removeCartItem}
          onBrowse={() => {
            setCartOpen(false);
            go("overview");
          }}
        />
      )}
      {resetOpen && (
        <ConfirmDialog
          title="Rensa sparad data?"
          description="Bokningar och ändringar som sparats i den här webbläsaren tas bort. Ursprungliga exempelbokningar visas igen."
          confirmLabel="Rensa data"
          onClose={() => setResetOpen(false)}
          onConfirm={clearSavedData}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
