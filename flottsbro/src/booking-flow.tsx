import { type CSSProperties, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  GraduationCap,
  Home,
  MountainSnow,
  Plus,
  Search,
  Ticket,
  Trash2,
  WandSparkles,
} from "lucide-react";
import {
  siApplepay,
  siGooglepay,
  siVisa,
  siMastercard,
  siAmericanexpress,
  siJcb,
  siKlarna,
} from "simple-icons";
import forestImage from "./assets/lodging-forest.jpg";
import forestImage2 from "./assets/lodging-forest-2.jpg";
import familyImage from "./assets/lodging-family.jpg";
import familyImage2 from "./assets/lodging-family-2.jpg";
import viewImage from "./assets/lodging-view.jpg";
import viewImage2 from "./assets/lodging-view-2.jpg";
import { CountrySelect } from "./country-select";
import { countryLabel } from "./countries";
import {
  cabinUnitsLeft,
  cabinUnitsNeeded,
  capacityIssues,
  equipmentDemand,
  equipmentUnitsLeft,
  passUnitsLeft,
  sessionCapacity,
  sessionSeatsLeft,
  type CapacityRecord,
  type EquipmentKind,
} from "./capacity";

export type FlowEntry =
  "day" | "stay" | "group" | "rental" | "school" | "activity";
export type FlowSeason = "winter" | "summer";
type CabinId = "none" | "forest" | "family" | "view";
type PassId = "none" | "full" | "three" | "bike";
type ActivityId =
  | "snowshoe"
  | "sledding"
  | "canoe"
  | "climbing"
  | "winterNature"
  | "winterGames"
  | "orienteering"
  | "natureWalk";
type PaymentId =
  "swish" | "card" | "applepay" | "googlepay" | "klarna" | "invoice";
type SchoolLesson = "none" | "group" | "private";
export type FlowParticipant = {
  name: string;
  role: "teacher" | null;
  birthDate: string;
  activity: string;
  equipment: "borrow" | "own";
  shoe: string;
  height: string;
  weight: string;
};
type RentalDetails = {
  activity: "" | "Skidåkning" | "Snowboard" | "Cykling";
  shoe: string;
  height: string;
  weight: string;
};
export type FlowContact = {
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
export type FlowDraft = {
  flowVersion?: 3 | 4 | 5 | 6;
  entry: FlowEntry;
  season: FlowSeason;
  step: number;
  start: string;
  end: string;
  adults: number;
  children: number;
  childAges: (number | null)[];
  groupCount: number;
  org: string;
  cabin: CabinId;
  pass: PassId;
  passStartTime?: "09:00" | "13:00";
  activities: ActivityId[];
  schoolLesson?: SchoolLesson;
  schoolLevel?: "beginner" | "continuing";
  schoolTime?: "10:00" | "13:00";
  sessionAssignments?: Record<string, Record<number, string>>;
  borrowCount: number;
  guests: string[];
  childBirthDates: string[];
  borrowGuests: number[];
  rentalDetails: Record<number, RentalDetails>;
  participants: FlowParticipant[];
  name: string;
  email: string;
  contact: FlowContact;
  checkoutMode: "guest" | "login" | null;
  payment: PaymentId | null;
  terms: boolean;
  draftBookingId?: string;
  editBookingId?: string;
  editOriginalTotal?: number;
  rebookOf?: string;
  rebookQuick?: boolean;
  total: number;
};
type FlowBooking = {
  id: string;
  kind: "day" | "stay" | "group";
  sourceEntry?: FlowEntry;
  status: "Preliminär" | "Bekräftad";
  payment: string;
  name: string;
  email: string;
  date: string;
  endDate: string;
  total: number;
  items: string[];
  details: string;
  history: string[];
  participants?: FlowParticipant[];
  nights?: number;
  childAges?: number[];
  childBirthDates?: string[];
  guestNames?: string[];
  rentalDetails?: Record<number, RentalDetails>;
  contact?: FlowContact;
  lodging?: boolean;
  meal?: boolean;
  flowSnapshot?: FlowDraft;
};
const cabins: Record<
  Exclude<CabinId, "none">,
  {
    name: string;
    beds: number;
    price: number;
    detail: string;
    images: { src: string; alt: string }[];
  }
> = {
  forest: {
    name: "Skogsstugan",
    beds: 2,
    price: 795,
    detail: "Liten stuga nära skogen · pentry",
    images: [
      { src: forestImage, alt: "Snötäckt stuga vid skogen" },
      { src: forestImage2, alt: "Liten trästuga bland tallar" },
    ],
  },
  family: {
    name: "Familjestugan",
    beds: 4,
    price: 1195,
    detail: "Rymlig stuga för familjen · kök",
    images: [
      { src: familyImage, alt: "Ljust vardagsrum med kök" },
      { src: familyImage2, alt: "Vardagsrum med sittgrupp" },
    ],
  },
  view: {
    name: "Utsiktsstugan",
    beds: 6,
    price: 1795,
    detail: "Stor stuga med utsikt · kök och altan",
    images: [
      { src: viewImage, alt: "Ljust sovrum" },
      { src: viewImage2, alt: "Vardagsrum med stora fönster" },
    ],
  },
};
const activities: Record<
  ActivityId,
  { name: string; season: FlowSeason; price: number; detail: string; minAge?: number }
> = {
  snowshoe: {
    name: "Snöskovandring",
    season: "winter",
    price: 149,
    detail: "Guidad tur · från 8 år",
    minAge: 8,
  },
  sledding: {
    name: "Pulkäventyr",
    season: "winter",
    price: 89,
    detail: "Pulka och ledare ingår",
  },
  canoe: {
    name: "Kanottur",
    season: "summer",
    price: 189,
    detail: "Kanot och flytväst · från 8 år",
    minAge: 8,
  },
  climbing: {
    name: "Äventyrsbana",
    season: "summer",
    price: 249,
    detail: "Bana och säkerhetsutrustning",
  },
  winterNature: {
    name: "Vinteräventyr i skogen",
    season: "winter",
    price: 129,
    detail: "Naturguide och varm dryck · från 6 år",
    minAge: 6,
  },
  winterGames: {
    name: "Snölek med ledare",
    season: "winter",
    price: 99,
    detail: "Lekar och rörelse utomhus · alla åldrar",
  },
  orienteering: {
    name: "Skogsorientering",
    season: "summer",
    price: 119,
    detail: "Karta och banor för olika nivåer",
  },
  natureWalk: {
    name: "Guidad naturvandring",
    season: "summer",
    price: 139,
    detail: "Upptäck Flottsbros stigar med guide",
  },
};
type FactText = { sv: string; en: string };
type ProductFactsData = {
  audience: FactText;
  prerequisites: FactText;
  included: FactText;
  equipment: FactText;
};
const activityGuidance: Record<ActivityId, ProductFactsData> = {
  snowshoe: {
    audience: { sv: "Från 8 år", en: "Ages 8 and up" },
    prerequisites: { sv: "Ingen tidigare erfarenhet behövs", en: "No previous experience needed" },
    included: { sv: "Guide och snöskor", en: "Guide and snowshoes" },
    equipment: { sv: "Varma kläder och vinterskor", en: "Warm clothes and winter boots" },
  },
  sledding: {
    audience: { sv: "Barn och vuxna", en: "Children and adults" },
    prerequisites: { sv: "Inga förkunskaper", en: "No previous experience needed" },
    included: { sv: "Pulka och ledare", en: "Sled and activity leader" },
    equipment: { sv: "Varma kläder och vinterskor", en: "Warm clothes and winter boots" },
  },
  canoe: {
    audience: { sv: "Från 8 år", en: "Ages 8 and up" },
    prerequisites: { sv: "Genomgång ges på plats", en: "Instructions are given on site" },
    included: { sv: "Kanot och flytväst", en: "Canoe and life jacket" },
    equipment: { sv: "Kläder som tål vatten", en: "Clothes suitable for the water" },
  },
  climbing: {
    audience: { sv: "Barn och vuxna", en: "Children and adults" },
    prerequisites: { sv: "Säkerhetsgenomgång ges på plats", en: "Safety briefing is given on site" },
    included: { sv: "Bana och säkerhetsutrustning", en: "Course and safety equipment" },
    equipment: { sv: "Bekväma kläder och stadiga skor", en: "Comfortable clothes and sturdy shoes" },
  },
  winterNature: {
    audience: { sv: "Från 6 år", en: "Ages 6 and up" },
    prerequisites: { sv: "Inga förkunskaper", en: "No previous experience needed" },
    included: { sv: "Naturguide och varm dryck", en: "Nature guide and warm drink" },
    equipment: { sv: "Varma kläder och vinterskor", en: "Warm clothes and winter boots" },
  },
  winterGames: {
    audience: { sv: "Alla åldrar", en: "All ages" },
    prerequisites: { sv: "Inga förkunskaper", en: "No previous experience needed" },
    included: { sv: "Ledda lekar utomhus", en: "Guided outdoor games" },
    equipment: { sv: "Varma kläder och vinterskor", en: "Warm clothes and winter boots" },
  },
  orienteering: {
    audience: { sv: "Barn och vuxna", en: "Children and adults" },
    prerequisites: { sv: "Banor finns för olika nivåer", en: "Courses are available for different levels" },
    included: { sv: "Karta och markerade banor", en: "Map and marked courses" },
    equipment: { sv: "Bekväma kläder och stadiga skor", en: "Comfortable clothes and sturdy shoes" },
  },
  natureWalk: {
    audience: { sv: "Barn och vuxna", en: "Children and adults" },
    prerequisites: { sv: "Inga förkunskaper", en: "No previous experience needed" },
    included: { sv: "Guidad vandring", en: "Guided walk" },
    equipment: { sv: "Kläder efter väder och stadiga skor", en: "Weather-appropriate clothes and sturdy shoes" },
  },
};
const passGuidance: Record<"full" | "three" | "bike", ProductFactsData> = {
  full: {
    audience: { sv: "Vuxna och barn som vill åka skidor eller snowboard", en: "Adults and children who want to ski or snowboard" },
    prerequisites: { sv: "Välj backe efter din nivå; nybörjare kan boka skidskola", en: "Choose a slope for your level; beginners can book ski school" },
    included: { sv: "Lift och backar under hela dagen", en: "Lifts and slopes for the full day" },
    equipment: { sv: "Skidor eller snowboard, pjäxor och hjälm behövs; hyra väljs separat", en: "Skis or snowboard, boots and helmet are needed; rental is chosen separately" },
  },
  three: {
    audience: { sv: "Vuxna och barn som vill åka en kortare stund", en: "Adults and children planning a shorter visit" },
    prerequisites: { sv: "Välj backe efter din nivå; nybörjare kan boka skidskola", en: "Choose a slope for your level; beginners can book ski school" },
    included: { sv: "Lift och backar i tre timmar", en: "Lifts and slopes for three hours" },
    equipment: { sv: "Skidor eller snowboard, pjäxor och hjälm behövs; hyra väljs separat", en: "Skis or snowboard, boots and helmet are needed; rental is chosen separately" },
  },
  bike: {
    audience: { sv: "Vuxna och barn som vill cykla på lederna", en: "Adults and children who want to ride the trails" },
    prerequisites: { sv: "Du behöver kunna cykla på led", en: "You need to be able to ride on a trail" },
    included: { sv: "Lift och cykelleder under dagen", en: "Lift and bike trails for the day" },
    equipment: { sv: "Cykel och hjälm behövs; hyra väljs separat", en: "Bike and helmet are needed; rental is chosen separately" },
  },
};
const schoolGuidance = (season: FlowSeason, lesson: "group" | "private"): ProductFactsData => ({
  audience: season === "winter"
    ? { sv: "Nybörjare och de som vill utveckla sin skidåkning", en: "Beginners and skiers who want to improve" }
    : { sv: "Nybörjare och de som vill utveckla sin cykling", en: "Beginners and riders who want to improve" },
  prerequisites: { sv: "Ingen erfarenhet krävs för nybörjarnivån", en: "No experience needed for the beginner level" },
  included: lesson === "group"
    ? { sv: "90 minuter med instruktör i liten grupp", en: "90 minutes with an instructor in a small group" }
    : { sv: "60 minuter med egen instruktör", en: "60 minutes with a private instructor" },
  equipment: season === "winter"
    ? { sv: "Skidor eller snowboard, pjäxor och hjälm behövs; hyra väljs separat", en: "Skis or snowboard, boots and helmet are needed; rental is chosen separately" }
    : { sv: "Cykel och hjälm behövs; hyra väljs separat", en: "Bike and helmet are needed; rental is chosen separately" },
});
function ProductFacts({ info, language }: { info: ProductFactsData; language: "sv" | "en" }) {
  const labels = language === "en"
    ? { audience: "Who it's for", prerequisites: "Experience", included: "Included", equipment: "Equipment" }
    : { audience: "För vem", prerequisites: "Förkunskaper", included: "Ingår", equipment: "Utrustning" };
  return (
    <span className="flow-product-facts">
      {(["audience", "prerequisites", "included", "equipment"] as const).map((key) => (
        <span key={key}><b>{labels[key]}</b>{info[key][language]}</span>
      ))}
    </span>
  );
}
const activityIds = Object.keys(activities) as ActivityId[];
const money = (value: number) =>
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value);
const offsetDate = (date: string, amount: number) =>
  new Date(Date.parse(`${date}T12:00:00Z`) + amount * 86400000)
    .toISOString()
    .slice(0, 10);
const dateDiff = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) /
      86400000,
  );
const ageOnDate = (birth: string, trip: string) => {
  const age = Number(trip.slice(0, 4)) - Number(birth.slice(0, 4));
  return age - (trip.slice(5) < birth.slice(5) ? 1 : 0);
};
const allDates = (from: string, to: string) =>
  Array.from({ length: Math.max(1, dateDiff(from, to) + 1) }, (_, i) =>
    offsetDate(from, i),
  );
const sessionKey = (offering: string, date: string) => `${offering}:${date}`;
const sessionTimes = (offering: string, lesson?: SchoolLesson) =>
  offering === "school"
    ? lesson === "private"
      ? ["10:00", "13:00", "15:00"]
      : ["09:00", "11:00", "14:00"]
    : ["10:00", "14:00"];
const dateText = (date: string, language: "sv" | "en") =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString(language === "en" ? "en-GB" : "sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
const emptyContact = (): FlowContact => ({
  phone: "",
  street: "",
  postalCode: "",
  city: "",
  country: "Sverige",
  billingEmail: "",
});
const validPostalCode = (contact: FlowContact) => {
  const country = (contact.country ?? "").trim().toLocaleLowerCase("sv-SE");
  const postalCode = contact.postalCode.trim();
  if (!country || !postalCode) return false;
  return ["sverige", "sweden", "se"].includes(country)
    ? /^\d{3}\s?\d{2}$/.test(postalCode)
    : postalCode.length >= 3;
};
export const createFlowDraft = (
  entry: FlowEntry,
  season: FlowSeason,
): FlowDraft => {
  const start = season === "winter" ? "2027-02-10" : "2027-07-12";
  return {
    flowVersion: 6,
    entry,
    season,
    step: 0,
    start,
    end: entry === "stay" ? offsetDate(start, 3) : start,
    adults:
      entry === "group" || entry === "school" ? 0 : entry === "stay" ? 2 : 1,
    children: entry === "school" ? 1 : 0,
    childAges: entry === "school" ? [null] : [],
    groupCount: 24,
    org: "",
    cabin: entry === "stay" ? "family" : "none",
    pass:
      entry === "day" || entry === "group"
        ? season === "winter"
          ? "full"
          : "bike"
        : "none",
    activities: [],
    schoolLesson: "none",
    schoolLevel: "beginner",
    schoolTime: "10:00",
    sessionAssignments: {},
    borrowCount: 0,
    guests: [],
    childBirthDates: [],
    borrowGuests: [],
    rentalDetails: {},
    participants: [],
    name: "",
    email: "",
    contact: emptyContact(),
    checkoutMode: null,
    payment: null,
    terms: false,
    total: 0,
  };
};
function Brand({
  icon,
  color,
  size = 37,
}: {
  icon: { path: string; title: string };
  color: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={icon.title}
      style={{ color, flex: "none" }}
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}
function DatePicker({
  start,
  end,
  onChange,
  language,
}: {
  start: string;
  end: string;
  onChange: (from: string, to: string) => void;
  language: "sv" | "en";
}) {
  const [month, setMonth] = useState(start.slice(0, 7));
  const [ending, setEnding] = useState(false);
  useEffect(() => {
    setMonth(start.slice(0, 7));
  }, [start]);
  const [year, number] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, number - 1, 1));
  const before = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const cells = Array.from(
    { length: Math.ceil((before + days) / 7) * 7 },
    (_, i) => i - before + 1,
  );
  const dateLabel = (value: string) =>
    new Date(`${value}T12:00:00Z`).toLocaleDateString(language === "en" ? "en-GB" : "sv-SE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  const shift = (by: number) => {
    const next = new Date(Date.UTC(year, number - 1 + by, 1));
    setMonth(
      `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`,
    );
  };
  const choose = (date: string) => {
    if (!ending || date < start) {
      onChange(date, date);
      setEnding(true);
    } else {
      onChange(start, date);
      setEnding(false);
    }
  };
  return (
    <div className="flow-calendar">
      <div className="flow-range">
        <button
          type="button"
          className={!ending ? "active" : ""}
          onClick={() => setEnding(false)}
        >
          <small>Från och med</small>
          <strong>{dateLabel(start)}</strong>
        </button>
        <ArrowRight size={17} />
        <button
          type="button"
          className={ending ? "active" : ""}
          onClick={() => setEnding(true)}
        >
          <small>Till och med</small>
          <strong>{dateLabel(end)}</strong>
        </button>
      </div>
      <div className="flow-month">
        <button
          type="button"
          aria-label="Föregående månad"
          onClick={() => shift(-1)}
        >
          <ArrowLeft size={16} />
        </button>
        <strong>
          {first.toLocaleDateString(language === "en" ? "en-GB" : "sv-SE", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </strong>
        <button type="button" aria-label="Nästa månad" onClick={() => shift(1)}>
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="flow-days">
        {(language === "en"
          ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
          : ["Må", "Ti", "On", "To", "Fr", "Lö", "Sö"]).map((day) => (
          <span key={day}>{day}</span>
        ))}
        {cells.map((day, i) =>
          day > 0 && day <= days ? (
            <button
              type="button"
              key={day}
              aria-label={dateLabel(`${month}-${String(day).padStart(2, "0")}`)}
              aria-pressed={
                `${month}-${String(day).padStart(2, "0")}` === start ||
                `${month}-${String(day).padStart(2, "0")}` === end
              }
              className={
                `${month}-${String(day).padStart(2, "0")}` >= start &&
                `${month}-${String(day).padStart(2, "0")}` <= end
                  ? "selected"
                  : ""
              }
              disabled={
                `${month}-${String(day).padStart(2, "0")}` <
                new Date().toISOString().slice(0, 10)
              }
              onClick={() => choose(`${month}-${String(day).padStart(2, "0")}`)}
            >
              {day}
            </button>
          ) : (
            <span key={`empty-${i}`} />
          ),
        )}
      </div>
      <small className="flow-calendar-help">
        {ending
          ? "Välj slutdatum"
          : `${Math.max(1, dateDiff(start, end) + 1)} dagar valda`}
      </small>
    </div>
  );
}

export function BookingFlow({
  entry,
  season,
  language,
  accountName,
  bookings,
  initial,
  onDraft,
  onComplete,
  onUpdate,
  onFinish,
  onHome,
  onBookings,
  onInvoice,
  onChangeAccount,
}: {
  entry: FlowEntry;
  season: FlowSeason;
  language: "sv" | "en";
  accountName?: string | null;
  bookings: CapacityRecord[];
  initial?: FlowDraft;
  onDraft: (draft: FlowDraft) => void;
  onComplete: (booking: FlowBooking) => void;
  onUpdate: (id: string, booking: FlowBooking) => void;
  onFinish: () => void;
  onHome: () => void;
  onBookings: () => void;
  onInvoice: (booking: FlowBooking) => void;
  onChangeAccount: (draft: FlowDraft) => void;
}) {
  const withAccountGuest = (flowDraft: FlowDraft): FlowDraft =>
    accountName?.trim() && flowDraft.entry !== "group" && flowDraft.adults > 0 && !flowDraft.guests[0]?.trim()
      ? { ...flowDraft, guests: [accountName.trim(), ...flowDraft.guests.slice(1)] }
      : flowDraft;
  const [draft, setDraft] = useState<FlowDraft>(() => {
    if (!initial) return withAccountGuest(createFlowDraft(entry, season));
    const savedDraft: FlowDraft & { meal?: unknown; mealDays?: unknown } = {
      ...initial,
    };
    delete savedDraft.meal;
    delete savedDraft.mealDays;
    const previousStep =
      initial.flowVersion === 6 || initial.flowVersion === 5 || initial.flowVersion === 4
        ? initial.step
        : initial.flowVersion === 3
          ? ([0, 2, 3, 4, 1, 5, 6, 7, 8][initial.step] ?? 0)
          : ([0, 2, 3, 1, 5, 6, 7, 8][initial.step] ?? 0);
    const migratedStep =
      initial.flowVersion === 6 || initial.flowVersion === 5
        ? previousStep
        : previousStep >= 5
          ? previousStep + 1
          : previousStep;
    const activeStep = migratedStep === 6
      ? 7
      : [4, 5, 10].includes(migratedStep) || (initial.entry === "rental" && migratedStep === 2)
        ? 3 : migratedStep;
    return withAccountGuest({
      ...savedDraft,
      flowVersion: 6,
      step: activeStep,
    });
  });
  const [active, setActive] = useState(Boolean(initial));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState(false);
  const [doneBooking, setDoneBooking] = useState<FlowBooking | null>(null);
  // Test card fields stay in component state and are never saved with the draft.
  const [testCard, setTestCard] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvc: "",
  });
  const [mockApproval, setMockApproval] = useState(false);
  const [visibleParticipants, setVisibleParticipants] = useState(12);
  const [participantSearch, setParticipantSearch] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [newPersonIndex, setNewPersonIndex] = useState<number | null>(null);
  const [openAddon, setOpenAddon] = useState<"lodging" | "pass" | "activities" | "school" | "equipment" | null>(null);
  const [cabinImageIndex, setCabinImageIndex] = useState<
    Record<Exclude<CabinId, "none">, number>
  >({ forest: 0, family: 0, view: 0 });
  const cabinImageRefs = useRef<
    Partial<Record<Exclude<CabinId, "none">, HTMLDivElement>>
  >({});
  const stepsRef = useRef<HTMLElement>(null);
  const update = (change: Partial<FlowDraft>) => {
    setDraft((current) => ({ ...current, ...change }));
    setError("");
  };
  const group = draft.entry === "group";
  const quickRebook = Boolean(draft.rebookQuick && !group);
  const guests = group ? draft.groupCount : draft.adults + draft.children;
  const teachers = draft.participants
    .slice(0, draft.groupCount)
    .filter((person) => person.role === "teacher").length;
  const students = group ? Math.max(0, guests - teachers) : 0;
  const days = Math.max(1, dateDiff(draft.start, draft.end) + 1);
  const dates = allDates(draft.start, draft.end);
  const scheduledSlots = [
    ...(draft.schoolLesson && draft.schoolLesson !== "none" ? ["school"] : []),
    ...draft.activities,
  ].flatMap((offering) =>
    dates.flatMap((date) =>
      Object.entries(
        draft.sessionAssignments?.[sessionKey(offering, date)] ?? {},
      )
        .filter(
          ([index, time]) =>
            Number(index) >= 0 &&
            Number(index) < guests &&
            sessionTimes(offering, draft.schoolLesson).includes(time),
        )
        .map(([index, time]) => ({
          offering,
          date,
          time,
          index: Number(index),
        })),
    ),
  );
  const paidSeat = (index: number) =>
    !group || draft.participants[index]?.role !== "teacher";
  const participantLabel = (index: number) =>
    (group ? draft.participants[index]?.name : draft.guests[index])?.trim() ||
    (group
      ? `Deltagare ${index + 1}`
      : index < draft.adults
        ? `Vuxen ${index + 1}`
        : `Barn ${index - draft.adults + 1}`);
  const participantAge = (index: number, date: string) => {
    if (group) {
      const person = draft.participants[index];
      if (person?.role === "teacher") return 18;
      return person?.birthDate ? ageOnDate(person.birthDate, date) : null;
    }
    if (index < draft.adults) return 18;
    const child = index - draft.adults;
    const birthDate = draft.childBirthDates[child];
    return birthDate
      ? ageOnDate(birthDate, date)
      : draft.childAges[child] ?? null;
  };
  const underageSlots = scheduledSlots.filter((slot) => {
    const minimum = slot.offering === "school"
      ? undefined
      : activities[slot.offering as ActivityId].minAge;
    const age = participantAge(slot.index, slot.date);
    return minimum !== undefined && age !== null && age < minimum;
  });
  const nights = Math.max(0, dateDiff(draft.start, draft.end));
  const selectedCabin = draft.cabin === "none" ? null : cabins[draft.cabin];
  const numberOfCabins = selectedCabin
    ? Math.ceil(guests / selectedCabin.beds)
    : 0;
  const cabinTotal = selectedCabin
    ? selectedCabin.price * numberOfCabins * Math.max(1, nights)
    : 0;
  const childPass = draft.childAges.reduce<number>(
    (sum, age) =>
      sum +
      (age !== null && age < 8
        ? draft.pass === "three"
          ? 100
          : 170
        : draft.pass === "three"
          ? 190
          : 320),
    0,
  );
  const passTotal =
    draft.pass === "none"
      ? 0
      : group
        ? students *
          (draft.pass === "bike" ? 240 : draft.pass === "three" ? 160 : 200) *
          days
        : draft.pass === "bike"
          ? (draft.adults * 300 + draft.children * 190) * days
          : (draft.adults * (draft.pass === "three" ? 240 : 370) + childPass) *
            days;
  const passHours = draft.pass === "three"
    ? draft.passStartTime === "13:00" ? "13:00–16:00" : "09:00–12:00"
    : draft.pass === "bike" ? "09:00–17:00" : "09:00–16:00";
  const activityTotal = scheduledSlots.reduce(
    (sum, slot) =>
      sum +
      (slot.offering !== "school" && paidSeat(slot.index)
        ? activities[slot.offering as ActivityId].price
        : 0),
    0,
  );
  const schoolUnit = draft.schoolLesson === "private" ? 895 : 495;
  const schoolTotal =
    scheduledSlots.filter(
      (slot) => slot.offering === "school" && paidSeat(slot.index),
    ).length * schoolUnit;
  const borrowCount = group
    ? draft.participants.length
      ? draft.participants
          .slice(0, draft.groupCount)
          .filter(
            (person) =>
              person.role !== "teacher" && person.equipment === "borrow",
          ).length
      : Math.min(draft.borrowCount, students)
    : (draft.borrowGuests ?? []).filter((index) => index < guests).length;
  const equipmentUnit = group ? 200 : draft.season === "winter" ? 230 : 220;
  const equipmentTotal = borrowCount * equipmentUnit * days;
  const total =
    cabinTotal +
    passTotal +
    activityTotal +
    schoolTotal +
    equipmentTotal;
  const sessionRows = Array.from(
    new Set(
      scheduledSlots.map(
        (slot) => `${slot.offering}|${slot.date}|${slot.time}`,
      ),
    ),
  ).map((key) => {
    const [offering, date, time] = key.split("|");
    const seats = scheduledSlots.filter(
      (slot) =>
        slot.offering === offering && slot.date === date && slot.time === time,
    );
    const unit =
      offering === "school"
        ? schoolUnit
        : activities[offering as ActivityId].price;
    return {
      key,
      label:
        offering === "school"
          ? `${draft.season === "winter" ? "Skidskola" : "Cykelskola"} · ${draft.schoolLesson === "private" ? "privatlektion" : "grupplektion"}`
          : activities[offering as ActivityId].name,
      date,
      time,
      people: seats.map((seat) => participantLabel(seat.index)),
      price: seats.filter((seat) => paidSeat(seat.index)).length * unit,
    };
  });
  const mainIsCabin = draft.entry === "stay";
  const stageLabels: Record<number, string> = {
    0: "Period & sällskap",
    1: "Deltagare",
    2: draft.entry === "rental"
      ? "Hyra utrustning"
      : mainIsCabin
      ? "Boende"
      : draft.entry === "school"
        ? draft.season === "winter" ? "Skidskola" : "Cykelskola"
        : draft.entry === "activity"
          ? "Aktiviteter"
          : draft.season === "winter" ? "SkiPass" : "Cykelpass",
    3: "Tillägg",
    7: "Uppgifter",
    8: "Granska",
    9: "Betala",
    11: "Bekräfta",
  };
  // Keep saved step IDs stable while collecting all optional products in step 3.
  const standardSteps = [0, 1, 2, 3, 7, 8, 9, 11];
  const visibleSteps = quickRebook ? [8, 9, 11] : standardSteps;
  const stepPosition = visibleSteps.indexOf(draft.step);
  const followingStep = visibleSteps[stepPosition + 1] ?? draft.step;
  const previousStep = visibleSteps[stepPosition - 1] ?? 0;
  const changeParty = (nextAdults: number, nextChildren: number) => {
    const remap = (index: number) => {
      if (index < draft.adults) return index < nextAdults ? index : null;
      const child = index - draft.adults;
      return child < nextChildren ? nextAdults + child : null;
    };
    update({
      adults: nextAdults,
      children: nextChildren,
      childAges: Array.from(
        { length: nextChildren },
        (_, index) => draft.childAges[index] ?? null,
      ),
      childBirthDates: Array.from(
        { length: nextChildren },
        (_, index) => draft.childBirthDates[index] ?? "",
      ),
      guests: [
        ...Array.from(
          { length: nextAdults },
          (_, index) => index < draft.adults
            ? draft.guests[index] ?? ""
            : index === 0 ? accountName?.trim() ?? "" : "",
        ),
        ...Array.from(
          { length: nextChildren },
          (_, index) => draft.guests[draft.adults + index] ?? "",
        ),
      ],
      borrowGuests: (draft.borrowGuests ?? [])
        .map(remap)
        .filter((index): index is number => index !== null),
      rentalDetails: Object.fromEntries(
        Object.entries(draft.rentalDetails ?? {}).flatMap(([old, details]) => {
          const index = remap(Number(old));
          return index === null ? [] : [[index, details]];
        }),
      ),
      sessionAssignments: Object.fromEntries(
        Object.entries(draft.sessionAssignments ?? {}).map(([key, values]) => [
          key,
          Object.fromEntries(
            Object.entries(values).flatMap(([old, time]) => {
              const index = remap(Number(old));
              return index === null ? [] : [[index, time]];
            }),
          ),
        ]),
      ),
    });
  };
  const setPeriod = (start: string, end: string) =>
    update({
      start,
      end,
      sessionAssignments: Object.fromEntries(
        Object.entries(draft.sessionAssignments ?? {}).filter(([key]) => {
          const date = key.slice(-10);
          return date >= start && date <= end;
        }),
      ),
      childAges: draft.childBirthDates.length
        ? draft.childBirthDates.map((date, i) =>
            date ? ageOnDate(date, start) : (draft.childAges[i] ?? null),
          )
        : draft.childAges,
    });
  const shiftRebookStart = (start: string) => {
    const dayShift = dateDiff(draft.start, start);
    const end = offsetDate(draft.end, dayShift);
    update({
      start,
      end,
      sessionAssignments: Object.fromEntries(
        Object.entries(draft.sessionAssignments ?? {}).map(([key, people]) => [
          `${key.slice(0, -10)}${offsetDate(key.slice(-10), dayShift)}`,
          people,
        ]),
      ),
      childAges: draft.childBirthDates.map((date, index) =>
        date ? ageOnDate(date, start) : draft.childAges[index] ?? null,
      ),
    });
  };
  const previousBookingDraft = draft.editBookingId
    ? bookings.find((item) => item.id === draft.editBookingId)?.flowSnapshot
    : undefined;
  const changedParts = previousBookingDraft ? [
    (previousBookingDraft.start !== draft.start || previousBookingDraft.end !== draft.end) && "period",
    (previousBookingDraft.adults !== draft.adults || previousBookingDraft.children !== draft.children || previousBookingDraft.groupCount !== draft.groupCount || JSON.stringify(previousBookingDraft.guests) !== JSON.stringify(draft.guests) || JSON.stringify(previousBookingDraft.participants) !== JSON.stringify(draft.participants)) && "deltagare",
    previousBookingDraft.cabin !== draft.cabin && "boende",
    (previousBookingDraft.pass !== draft.pass || previousBookingDraft.passStartTime !== draft.passStartTime) && "pass och tid",
    (JSON.stringify(previousBookingDraft.activities) !== JSON.stringify(draft.activities) || JSON.stringify(previousBookingDraft.sessionAssignments) !== JSON.stringify(draft.sessionAssignments)) && "aktiviteter och tider",
    previousBookingDraft.schoolLesson !== draft.schoolLesson && "skola",
    (JSON.stringify(previousBookingDraft.borrowGuests) !== JSON.stringify(draft.borrowGuests) || JSON.stringify(previousBookingDraft.rentalDetails) !== JSON.stringify(draft.rentalDetails)) && "utrustning",
  ].filter(Boolean).join(", ") : "uppgifter";
  const setCabin = (cabin: CabinId) =>
    update({
      cabin,
      end:
        cabin !== "none" && nights === 0
          ? offsetDate(draft.start, 1)
          : draft.end,
    });
  const setPass = (pass: PassId) => update({ pass, passStartTime: pass === "three" ? draft.passStartTime ?? "09:00" : undefined });
  const toggleActivity = (id: ActivityId) => {
    const removing = draft.activities.includes(id);
    update({
      activities: removing
        ? draft.activities.filter((current) => current !== id)
        : [...draft.activities, id],
      sessionAssignments: removing
        ? Object.fromEntries(
            Object.entries(draft.sessionAssignments ?? {}).filter(
              ([key]) => !key.startsWith(`${id}:`),
            ),
          )
        : draft.sessionAssignments,
    });
  };
  const booking = (
    status: "Preliminär" | "Bekräftad",
    id?: string,
  ): FlowBooking => ({
    id:
      id ?? draft.editBookingId ?? `${group ? "GR" : "FL"}-${Math.floor(1000 + Math.random() * 8999)}`,
    kind: group ? "group" : selectedCabin ? "stay" : "day",
    sourceEntry: draft.entry,
    status,
    payment:
      status === "Preliminär"
        ? "Faktura väntar"
        : draft.payment === "invoice"
          ? "Fakturaunderlag skapat"
          : `Simulerad betalning · ${{ swish: "Swish", card: "kort", applepay: "Apple Pay", googlepay: "Google Pay", klarna: "Klarna", invoice: "faktura" }[draft.payment ?? "card"]}`,
    name: group ? draft.org : draft.name,
    email: draft.email,
    contact: draft.contact,
    flowSnapshot: { ...draft, step: 0, editBookingId: undefined, editOriginalTotal: undefined, rebookOf: undefined, rebookQuick: undefined },
    date: draft.start,
    endDate: draft.end,
    total,
    lodging: Boolean(selectedCabin),
    nights: selectedCabin ? Math.max(1, nights) : undefined,
    childAges: draft.childAges.filter((age): age is number => age !== null),
    childBirthDates: draft.childBirthDates,
    guestNames: draft.guests,
    rentalDetails: draft.rentalDetails,
    participants: group ? draft.participants : undefined,
    items: [
      ...(draft.pass !== "none"
        ? [
            `${draft.pass === "bike" ? "Cykelpass" : draft.pass === "three" ? "SkiPass 3 timmar" : "SkiPass heldag"} · ${passHours} · ${days} dagar · ${money(passTotal)}`,
          ]
        : []),
      ...(selectedCabin
        ? [
            `${selectedCabin.name} · ${numberOfCabins} ${numberOfCabins === 1 ? "stuga" : "stugor"} · ${Math.max(1, nights)} ${Math.max(1, nights) === 1 ? "natt" : "nätter"} · ${money(cabinTotal)}`,
          ]
        : []),
      ...sessionRows.map(
        (row) =>
          `${row.label} · ${row.date} kl ${row.time} · ${row.people.join(", ")} · ${money(row.price)}`,
      ),
      ...(borrowCount
        ? [
            `${draft.season === "summer" ? "Downhillcykel inkl. hjälm och skydd" : "Utrustningshyra"} · ${borrowCount} ${borrowCount === 1 ? "person" : "personer"} · ${money(equipmentTotal)}`,
          ]
        : []),
      ...(group ? [`${students} elever · ${teachers} lärare`] : []),
    ],
    details: `${draft.start}–${draft.end} · ${guests} ${guests === 1 ? "person" : "personer"}`,
    history: [
      draft.editBookingId
        ? `Bokning ändrad ${new Date().toISOString().slice(0, 10)} · ändrat: ${changedParts || "kontaktuppgifter"} · tidigare ${money(draft.editOriginalTotal ?? 0)}, nytt totalpris ${money(total)} · betalning/faktura uppdaterad`
        : draft.rebookOf
          ? `Bokning skapad ${new Date().toISOString().slice(0, 10)} utifrån ${draft.rebookOf}`
        : `${status === "Preliminär" ? "Preliminär bokning" : "Bokning"} skapad ${new Date().toISOString().slice(0, 10)}`,
    ],
  });
  useEffect(() => {
    if (active && !done) onDraft({ ...draft, total });
  }, [active, done, draft, total]);
  useEffect(() => {
    if (group && draft.draftBookingId && !draft.editBookingId && !done)
      onUpdate(
        draft.draftBookingId,
        booking("Preliminär", draft.draftBookingId),
      );
  }, [draft, total, done]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.matchMedia("(max-width: 900px)").matches)
      stepsRef.current?.querySelector(".current")?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
  }, [draft.step]);
  useEffect(() => {
    if (newPersonIndex === null) return;
    const input = document.querySelector<HTMLInputElement>(
      `[data-person-index="${newPersonIndex}"] .flow-people-name input`,
    );
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      input.focus({ preventScroll: true });
      setNewPersonIndex(null);
    }
  }, [newPersonIndex, draft.participants]);
  const preparedParticipants = () =>
    Array.from(
      { length: draft.groupCount },
      (_, i): FlowParticipant =>
        draft.participants[i] ?? {
          name: "",
          role: null,
          birthDate: "",
          activity: draft.pass === "bike" ? "Cykling" : "Skidåkning",
          equipment: i < draft.borrowCount ? "borrow" : "own",
          shoe: "",
          height: "",
          weight: "",
        },
    );
  const unscheduledOfferings = [
    ...(draft.schoolLesson && draft.schoolLesson !== "none" ? ["school"] : []),
    ...draft.activities,
  ].filter(
    (offering) => !scheduledSlots.some((slot) => slot.offering === offering),
  );
  const next = () => {
    const availabilityProblems = capacityIssues(
      draft,
      bookings,
      Object.fromEntries(Object.entries(cabins).map(([key, cabin]) => [key, cabin.beds])),
      draft.editBookingId ?? draft.draftBookingId,
    );
    if (
      draft.step === 0 &&
      (dateDiff(draft.start, draft.end) < (mainIsCabin ? 1 : 0) ||
        guests < 1 ||
        draft.childAges.some((age) => age === null || age < 0 || age > 17) ||
        (group && !draft.org.trim()))
    ) {
      setError(
        group
          ? "Välj period, antal och ange organisationens namn."
          : mainIsCabin
            ? "Välj minst en natt, minst en deltagare och ange ålder för alla barn."
            : "Välj period, minst en deltagare och ange ålder för alla barn.",
      );
      return;
    }
    if (
      draft.step === 1 &&
      !group &&
      (draft.guests.length !== guests ||
        draft.guests.some((name) => !name?.trim()) ||
        draft.childBirthDates.length !== draft.children ||
        draft.childBirthDates.some(
          (date) =>
            !date || date >= draft.start || ageOnDate(date, draft.start) > 17,
        ))
    ) {
      setError(
        "Ange namn för alla deltagare och giltiga födelsedatum för barnen.",
      );
      return;
    }
    if (
      quickRebook && draft.step === 8 &&
      (guests < 1 || draft.childAges.some((age) => age === null || age < 0 || age > 17))
    ) {
      setError("Sällskapet behöver uppdateras för det nya datumet.");
      return;
    }
    if (draft.step === 2 && draft.entry === "rental" && borrowCount === 0) {
      setError("Markera minst en person som ska hyra utrustning.");
      return;
    }
    if ((draft.step === 2 && draft.entry === "rental") || [3, 8, 9, 11].includes(draft.step)) {
      const incompleteEquipment = group
        ? preparedParticipants().some((person) => person.equipment === "borrow" &&
          (!person.activity || !person.height || (draft.season === "winter" && (!person.shoe || !person.weight))))
        : (draft.borrowGuests ?? []).some((index) => index < guests &&
          (!draft.rentalDetails?.[index]?.activity || !draft.rentalDetails[index].height ||
            (draft.season === "winter" && (!draft.rentalDetails[index].shoe || !draft.rentalDetails[index].weight))));
      if (incompleteEquipment) {
        if (draft.step === 3) setOpenAddon("equipment");
        setError("Fyll i utrustningsuppgifterna för alla som hyr.");
        return;
      }
    }
    if (draft.step === 2 && mainIsCabin && draft.cabin === "none") {
      setError("Välj ett boende för att fortsätta.");
      return;
    }
    if (draft.step === 3 && draft.cabin !== "none" && dateDiff(draft.start, draft.end) < 1) {
      setError("Boende kräver minst en natt. Ändra slutdatum under Period & sällskap.");
      return;
    }
    if (draft.step === 2 && mainIsCabin && selectedCabin &&
      cabinUnitsLeft(bookings, draft.cabin as Exclude<CabinId, "none">, selectedCabin.beds, draft.start, draft.end, draft.editBookingId ?? draft.draftBookingId) < numberOfCabins) {
      setError("Det valda boendet är inte längre tillgängligt för perioden. Välj ett annat boende.");
      return;
    }
    if ([3, 8, 11].includes(draft.step) && availabilityProblems.length) {
      setError(availabilityProblems[0]);
      return;
    }
    if (
      draft.step === 2 &&
      draft.entry === "school" &&
      (!draft.schoolLesson || draft.schoolLesson === "none")
    ) {
      setError("Välj en lektion för att fortsätta.");
      return;
    }
    if (
      draft.step === 2 &&
      draft.entry === "activity" &&
      draft.activities.length === 0
    ) {
      setError("Välj minst en aktivitet för att fortsätta.");
      return;
    }
    const missingMainSchedule = draft.entry === "school"
      ? unscheduledOfferings.includes("school")
      : draft.entry === "activity"
        ? unscheduledOfferings.some((offering) => draft.activities.includes(offering as ActivityId))
        : false;
    if (((draft.step === 2 && missingMainSchedule) || [3, 8, 9].includes(draft.step)) &&
      unscheduledOfferings.length > 0) {
      if (draft.step === 3)
        setOpenAddon(unscheduledOfferings[0] === "school" ? "school" : "activities");
      setError(
        "Välj minst en deltagare, dag och ledig tid för varje vald lektion eller aktivitet.",
      );
      return;
    }
    if (((draft.step === 2 && draft.entry === "activity") || [3, 8, 11].includes(draft.step)) && underageSlots.length > 0) {
      if (draft.step === 3) setOpenAddon("activities");
      const slot = underageSlots[0];
      const activity = activities[slot.offering as ActivityId];
      setError(`${participantLabel(slot.index)} är för ung för ${activity.name}. Åldersgränsen är ${activity.minAge} år.`);
      return;
    }
    if (draft.step === 7) {
      if (
        !draft.name.trim() ||
        !/^\S+@\S+\.\S+$/.test(draft.email) ||
        !validPostalCode(draft.contact) ||
        !draft.contact.street.trim() ||
        !draft.contact.city.trim() ||
        !draft.contact.phone.trim() ||
        !draft.checkoutMode
      ) {
        setError(
          "Fyll i kontaktperson, e-post, telefon och adress.",
        );
        return;
      }
    }
    if (draft.step === 8 && group && incompleteCount > 0) {
      setError(
        `Komplettera ${incompleteCount} deltagare innan du går vidare till betalning.`,
      );
      return;
    }
    if (draft.step === 8 && total <= 0) {
      setError(
        "Välj minst en upplevelse eller ett boende innan du går vidare.",
      );
      return;
    }
    if (draft.step === 8 && !draft.terms) {
      setError("Godkänn exempelvillkoren för att fortsätta.");
      return;
    }
    if (draft.step === 9) {
      if (!draft.payment) {
        setError("Välj ett betalningssätt.");
        return;
      }
      if (
        group &&
        draft.payment === "invoice" &&
        (!/^\S+@\S+\.\S+$/.test(draft.contact.billingEmail ?? "") ||
          !draft.contact.organisationNumber?.trim())
      ) {
        setError(
          "Ange fakturaadress för e-post och organisationsnummer under Uppgifter.",
        );
        return;
      }
    }
    if (draft.step === 11) {
      if (!draft.payment) {
        setError("Välj ett betalningssätt innan du slutför bokningen.");
        return;
      }
      if (draft.payment === "card") {
        if (
          !testCard.holder.trim() ||
          testCard.number.replace(/\D/g, "") !== "4242424242424242" ||
          testCard.expiry.trim() !== "12/29" ||
          testCard.cvc.trim() !== "123"
        ) {
          setError("Använd testkortet 4242 4242 4242 4242, 12/29 och 123.");
          return;
        }
      } else if (!mockApproval) {
        setError("Bekräfta den simulerade signeringen för att slutföra.");
        return;
      }
      const existingId = draft.editBookingId ?? draft.draftBookingId;
      const final = booking("Bekräftad", existingId);
      if (existingId) onUpdate(existingId, final);
      else onComplete(final);
      onFinish();
      setDoneBooking(final);
      setDone(true);
      return;
    }
    if (draft.step === 0 && group && !draft.draftBookingId && !draft.editBookingId) {
      const preliminary = booking("Preliminär");
      onComplete(preliminary);
      update({ draftBookingId: preliminary.id, step: 1 });
    } else if (draft.step === 1 && group)
      update({ participants: preparedParticipants(), step: 2 });
    else update({ step: followingStep });
    setActive(true);
    setError("");
  };
  const participantChange = (index: number, change: Partial<FlowParticipant>) =>
    update({
      participants: preparedParticipants().map((person, i) =>
        i === index ? { ...person, ...change } : person,
      ),
    });
  const participantComplete = (person: FlowParticipant) =>
    Boolean(person.name.trim()) &&
    (person.role === "teacher" ||
      Boolean(person.birthDate && person.birthDate < draft.start));
  const participantRows = preparedParticipants().map((person, index) => ({
    person,
    index,
  }));
  const incompleteCount = participantRows.filter(
    ({ person }) => !participantComplete(person),
  ).length;
  const filteredParticipants = participantRows.filter(
    ({ person }) =>
      (!missingOnly || !participantComplete(person)) &&
      (!participantSearch.trim() ||
        person.name
          .toLocaleLowerCase("sv-SE")
          .includes(participantSearch.trim().toLocaleLowerCase("sv-SE"))),
  );
  const bulkLines = bulkText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bulkDataLines = /^namn(?:[;\t]|$)/i.test(bulkLines[0] ?? "")
    ? bulkLines.slice(1)
    : bulkLines;
  const bulkLineCount = bulkDataLines.length;
  const addMany = () => {
    const lines = bulkDataLines;
    if (!lines.length) {
      setError("Klistra in minst ett namn.");
      return;
    }
    const rows: FlowParticipant[] = lines
      .map((line): FlowParticipant => {
        const cells = line.split(/[;\t]/).map((cell) => cell.trim());
        const birthDate =
          cells.find((cell) => /^\d{4}-\d{2}-\d{2}$/.test(cell)) ?? "";
        const role = cells.some((cell) => /^(lärare|teacher)$/i.test(cell))
          ? "teacher"
          : null;
        const equipment = cells
          .slice(1)
          .some((cell) => /^(ja|låna|borrow)$/i.test(cell))
          ? "borrow"
          : "own";
        return {
          name: cells[0] ?? "",
          role,
          birthDate,
          activity: draft.season === "winter" && equipment === "borrow" ? "" : draft.season === "winter" ? "Skidåkning" : "Cykling",
          equipment,
          shoe: "",
          height: "",
          weight: "",
        };
      })
      .filter((person) => person.name);
    if (!rows.length) {
      setError("Inga namn hittades i den inklistrade listan.");
      return;
    }
    const filled = preparedParticipants().filter(
      (person) =>
        person.name.trim() ||
        person.birthDate ||
        person.role === "teacher" ||
        person.equipment === "borrow",
    );
    if (filled.length + rows.length > 120) {
      setError("Högst 120 deltagare kan läggas till i en grupp.");
      return;
    }
    const participants = [...filled, ...rows];
    const nextCount = Math.max(draft.groupCount, participants.length);
    const pending = nextCount - participants.filter(participantComplete).length;
    update({
      participants,
      groupCount: nextCount,
    });
    setVisibleParticipants(12);
    setParticipantSearch("");
    setMissingOnly(false);
    setBulkText("");
    setBulkOpen(false);
    setNotice(
      `${rows.length} deltagare lades till. ${pending ? `${pending} behöver kompletteras.` : "Alla uppgifter är kompletta."}`,
    );
    setError("");
  };
  const removeParticipant = (index: number) => {
    if (draft.groupCount <= 1) return;
    update({
      participants: preparedParticipants().filter((_, i) => i !== index),
      groupCount: draft.groupCount - 1,
    });
    setNotice("Deltagaren togs bort och antalet uppdaterades.");
  };
  const importCsv = async (file: File) => {
    const content = (await file.text()).replace(/^\uFEFF/, "");
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) {
      setNotice("");
      setError("CSV-filen är tom.");
      return;
    }
    const header = lines[0].toLowerCase().includes("namn")
      ? lines[0].split(/[;,]/).map((cell) => cell.trim().toLowerCase())
      : [];
    const read = (cells: string[], names: string[], fallback: number) => {
      const index = header.findIndex((value) => names.includes(value));
      return cells[index >= 0 ? index : fallback] ?? "";
    };
    const rows = lines
      .slice(header.length ? 1 : 0)
      .map((line): FlowParticipant => {
        const cells = line
          .split(/[;,]/)
          .map((cell) => cell.trim().replace(/^"|"$/g, ""));
        const withRole = header.includes("roll") || cells.length >= 8;
        const extended = header.includes("födelsedatum") || cells.length >= 7;
        const role =
          withRole && /^(lärare|teacher)$/i.test(read(cells, ["roll"], 1))
            ? "teacher"
            : null;
        const birthDate = extended
          ? read(cells, ["födelsedatum"], withRole ? 2 : 1)
          : "";
        const activity = read(
          cells,
          ["aktivitet"],
          withRole ? 3 : extended ? 2 : 1,
        );
        const equipmentText = extended
          ? read(cells, ["lånar utrustning", "utrustning"], withRole ? 4 : 3)
          : "";
        const shoe = read(
          cells,
          ["skostorlek"],
          withRole ? 5 : extended ? 4 : 2,
        );
        const height = read(
          cells,
          ["längd", "längd (cm)"],
          withRole ? 6 : extended ? 5 : 3,
        );
        const weight = read(
          cells,
          ["vikt", "vikt (kg)"],
          withRole ? 7 : extended ? 6 : 4,
        );
        return {
          name: read(cells, ["namn"], 0),
          role,
          birthDate,
          activity: activity || (draft.season === "winter" ? "" : "Cykling"),
          equipment:
            /^(ja|yes|låna|hyra|borrow|rent)$/i.test(equipmentText) ||
            (!equipmentText && Boolean(shoe || height || weight))
              ? "borrow"
              : "own",
          shoe,
          height,
          weight,
        };
      })
      .filter((person) => person.name);
    if (!rows.length) {
      setNotice("");
      setError("CSV-filen innehåller inga deltagare med namn.");
      return;
    }
    if (rows.length > 120) {
      setNotice("");
      setError(
        "CSV-filen innehåller fler än 120 deltagare. Dela upp gruppen innan du importerar.",
      );
      return;
    }
    update({
      participants: rows,
      groupCount: rows.length,
      borrowCount: rows.filter((person) => person.equipment === "borrow")
        .length,
    });
    setNotice(
      `${rows.length} deltagare importerade. Kontrollera födelsedatum och utrustningsuppgifter innan du fortsätter.`,
    );
    setError("");
  };
  const addParticipant = () => {
    if (draft.groupCount >= 120) {
      setError("Högst 120 deltagare kan läggas till.");
      return;
    }
    update({
      groupCount: draft.groupCount + 1,
      participants: [
        ...preparedParticipants(),
        {
          name: "",
          role: null,
          birthDate: "",
          activity: draft.season === "winter" ? "Skidåkning" : "Cykling",
          equipment: "own",
          shoe: "",
          height: "",
          weight: "",
        },
      ],
    });
    setVisibleParticipants(draft.groupCount + 1);
    setParticipantSearch("");
    setMissingOnly(false);
    setNewPersonIndex(draft.groupCount);
    setNotice("En deltagare lades till.");
    setError("");
  };
  const fillExampleParticipants = () => {
    const names = [
      "Alma Andersson",
      "Nora Lind",
      "Oliver Berg",
      "Maja Eriksson",
      "Elias Holm",
      "Elsa Nyström",
      "William Larsson",
      "Saga Karlsson",
      "Leo Sandberg",
      "Freja Lund",
      "Astrid Ek",
      "Noah Sjöberg",
      "Vera Jansson",
      "Hugo Dahl",
      "Signe Bergström",
      "Arvid Nyberg",
      "Ida Svensson",
      "Theodor Wallin",
      "Mira Fors",
      "Liam Öberg",
      "Agnes Viklund",
      "August Persson",
      "Tilde Jonsson",
      "Elton Åkesson",
      "Ebba Blom",
      "Oskar Wik",
      "Lilly Strand",
      "Felix Bergman",
      "Julia Åström",
      "Alexander Norén",
    ];
    const exampleBorrowGuests =
      draft.entry === "rental" ? [0] : (draft.borrowGuests ?? []);
    const exampleGroupParticipants = group
      ? Array.from({ length: draft.groupCount }, (_, i) => {
          const teacher = i === 0;
          const borrowing = !teacher && i % 5 !== 0;
          const height = 138 + ((i * 7) % 37);
          return {
            name: names[i % names.length],
            role: teacher ? ("teacher" as const) : null,
            birthDate: teacher
              ? ""
              : `${Number(draft.start.slice(0, 4)) - (12 + (i % 6))}-${String(1 + ((i * 3) % 12)).padStart(2, "0")}-${String(4 + ((i * 7) % 24)).padStart(2, "0")}`,
            activity: draft.season === "summer"
              ? "Cykling"
              : borrowing && i % 6 === 0 ? "Snowboard" : "Skidåkning",
            equipment: borrowing ? ("borrow" as const) : ("own" as const),
            shoe: borrowing ? String(Math.round(33 + (height - 138) / 4) + (i % 2)) : "",
            height: borrowing ? String(height) : "",
            weight: borrowing ? String(Math.round((height - 100) * 0.82) + (i % 5) * 2) : "",
          };
        })
      : draft.participants;
    update({
      childAges: Array.from({ length: draft.children }, (_, i) => 8 + i),
      guests: Array.from({ length: guests }, (_, i) => names[i % names.length]),
      childBirthDates: Array.from(
        { length: draft.children },
        (_, i) => `${Number(draft.start.slice(0, 4)) - (8 + i) - 1}-12-01`,
      ),
      borrowGuests: exampleBorrowGuests,
      rentalDetails: Object.fromEntries(
        exampleBorrowGuests.map((i) => [
          i,
          {
            activity: draft.season === "winter" ? "Skidåkning" : "Cykling",
            shoe: "38",
            height: "155",
            weight: "48",
          },
        ]),
      ),
      participants: exampleGroupParticipants,
      borrowCount: group
        ? exampleGroupParticipants.filter((person) => person.equipment === "borrow").length
        : draft.borrowCount,
    });
  };
  const fillExampleContact = () =>
    update({
      org: group ? "Björkängsskolan" : draft.org,
      name: "Sara Lind",
      email: "sara.lind@example.se",
      checkoutMode: "guest",
      contact: {
        ...draft.contact,
        phone: "070-123 45 67",
        street: "Björkvägen 12",
        postalCode: "141 45",
        city: "Huddinge",
        contactPerson: "Sara Lind",
        position: "Lärare",
        billingEmail: "faktura@example.se",
        organisationNumber: "212000-1234",
        invoiceReference: "Skidresa 2027",
      },
    });
  const exampleSessionAssignments = (
    offerings: string[],
    lesson: SchoolLesson = draft.schoolLesson ?? "group",
  ) =>
    Object.fromEntries(
      offerings.flatMap((offering) =>
        dates.map((date) => {
          const times = sessionTimes(offering, lesson);
          const capacity = sessionCapacity(offering, lesson);
          return [
            sessionKey(offering, date),
            Object.fromEntries(
              Array.from({ length: guests }, (_, index) => index)
                .filter((index) => {
                  const minimum = offering === "school"
                    ? undefined
                    : activities[offering as ActivityId].minAge;
                  const age = participantAge(index, date);
                  return minimum === undefined || age === null || age >= minimum;
                })
                .slice(0, times.length * capacity)
                .map((index, position) => [index, times[Math.floor(position / capacity)]]),
            ),
          ];
        }),
      ),
    );
  const autoFillStep = () => {
    const fillRental = () => {
      if (group) update({ participants: preparedParticipants().map((person, index) => {
        const borrows = person.role !== "teacher" && index % 4 !== 0;
        return { ...person, equipment: borrows ? "borrow" as const : "own" as const,
          activity: draft.season === "summer" ? "Cykling" : index % 3 === 0 ? "Snowboard" : "Skidåkning",
          height: borrows ? String(145 + index % 35) : "",
          shoe: borrows ? String(35 + index % 9) : "",
          weight: borrows ? String(42 + index % 26) : "" };
      }) });
      else {
        const indices = Array.from({ length: guests }, (_, index) => index).filter((index) => index % 3 !== 2);
        update({ borrowGuests: indices, rentalDetails: Object.fromEntries(indices.map((index) => [index, {
          activity: draft.season === "summer" ? "Cykling" : index % 2 ? "Snowboard" : "Skidåkning",
          height: String(150 + index * 8), shoe: String(36 + index * 2), weight: String(49 + index * 8),
        }])) });
      }
    };
    if (draft.step === 0) {
      if (group) update({ org: "Björkängsskolan", groupCount: 24 });
      else if (draft.entry === "school")
        update({ adults: 0, children: 2, childAges: [8, 10] });
      else update({ adults: 2, children: 1, childAges: [8] });
    } else if (draft.step === 1) {
      fillExampleParticipants();
    } else if (draft.step === 2) {
      if (draft.entry === "rental") fillRental();
      else if (mainIsCabin) setCabin("family");
      else if (draft.entry === "school")
        update({
          schoolLesson: "group",
          schoolLevel: "beginner",
          sessionAssignments: {
            ...draft.sessionAssignments,
            ...exampleSessionAssignments(["school"], "group"),
          },
        });
      else if (draft.entry === "activity") {
        const id: ActivityId = draft.season === "winter" ? "snowshoe" : "canoe";
        update({
          activities: [id],
          sessionAssignments: {
            ...draft.sessionAssignments,
            ...exampleSessionAssignments([id]),
          },
        });
      } else setPass(draft.season === "winter" ? "full" : "bike");
    } else if (draft.step === 3) {
      if (openAddon === "equipment") fillRental();
      else if (openAddon === "pass") setPass(draft.season === "winter" ? "full" : "bike");
      else if (openAddon === "lodging") setCabin("family");
      else if (openAddon === "activities") {
        const id: ActivityId = draft.season === "winter" ? "snowshoe" : "canoe";
        update({ activities: [...new Set([...draft.activities, id])], sessionAssignments: {
          ...draft.sessionAssignments, ...exampleSessionAssignments([id]),
        } });
      } else if (openAddon === "school") update({ schoolLesson: "group", schoolLevel: "beginner", sessionAssignments: {
        ...draft.sessionAssignments, ...exampleSessionAssignments(["school"], "group"),
      } });
      else {
      const id: ActivityId = draft.season === "winter" ? "snowshoe" : "canoe";
      const selected = [...new Set([...draft.activities, id])];
      const lesson = draft.schoolLesson === "none" ? "group" : draft.schoolLesson ?? "group";
      const nextEnd = nights === 0 ? offsetDate(draft.start, 1) : draft.end;
      const sampleCabin = draft.cabin !== "none" ? draft.cabin
        : (["view", "family", "forest"] as const).find((cabin) =>
          cabinUnitsLeft(bookings, cabin, cabins[cabin].beds, draft.start, nextEnd, draft.editBookingId ?? draft.draftBookingId)
            >= Math.ceil(guests / cabins[cabin].beds),
        ) ?? "none";
      update({
        cabin: sampleCabin,
        end: sampleCabin !== "none" ? nextEnd : draft.end,
        pass: draft.pass === "none" ? (draft.season === "winter" ? "full" : "bike") : draft.pass,
        activities: selected,
        schoolLesson: lesson,
        schoolLevel: "beginner",
        sessionAssignments: {
          ...draft.sessionAssignments,
          ...exampleSessionAssignments([...selected, "school"], lesson),
        },
      });
      }
    } else if (draft.step === 7) fillExampleContact();
    else if (draft.step === 8) update({ terms: true });
    else if (draft.step === 9) update({ payment: group ? "invoice" : "card" });
    else if (draft.step === 11) {
      if (draft.payment === "card")
        setTestCard({
          holder: draft.name || "Anna Lind",
          number: "4242 4242 4242 4242",
          expiry: "12/29",
          cvc: "123",
        });
      else setMockApproval(true);
    }
    setError("");
  };
  const showCabinImage = (id: Exclude<CabinId, "none">, index: number) => {
    const gallery = cabinImageRefs.current[id];
    if (!gallery) return;
    const next = (index + cabins[id].images.length) % cabins[id].images.length;
    gallery.scrollTo({
      left: next * gallery.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };
  const syncCabinImage = (id: Exclude<CabinId, "none">, gallery: HTMLDivElement) => {
    const index = Math.min(
      cabins[id].images.length - 1,
      Math.max(0, Math.round(gallery.scrollLeft / gallery.clientWidth)),
    );
    setCabinImageIndex((current) =>
      current[id] === index ? current : { ...current, [id]: index },
    );
  };
  const cabinCards = (optional: boolean) => (
    <div className="flow-options flow-lodging-list">
      {optional && (
        <button
          type="button"
          className={`flow-option ${draft.cabin === "none" ? "selected" : ""}`}
          onClick={() => setCabin("none")}
        >
          <span className="flow-option-icon">
            <Home size={22} />
          </span>
          <span>
            <strong>Inget boende</strong>
            <small>Jag ordnar boende själv eller kommer över dagen.</small>
          </span>
          <Check size={19} className="flow-option-check" aria-hidden="true" />
        </button>
      )}
      {(
        Object.entries(cabins) as [
          Exclude<CabinId, "none">,
          typeof cabins.forest,
        ][]
      ).map(([id, cabin]) => {
          const unitsNeeded = cabinUnitsNeeded(draft, cabin.beds);
          const stayEnd = draft.end > draft.start ? draft.end : offsetDate(draft.start, 1);
          const unitsLeft = cabinUnitsLeft(
            bookings, id, cabin.beds, draft.start, stayEnd,
            draft.editBookingId ?? draft.draftBookingId,
          );
          const available = unitsLeft >= unitsNeeded;
          return (
        <div
          key={id}
          className={`flow-option flow-lodging-card ${draft.cabin === id ? "selected" : ""}`}
        >
          <div className="flow-lodging-gallery">
            <div
              className="flow-lodging-image"
              ref={(node) => {
                if (node) cabinImageRefs.current[id] = node;
                else delete cabinImageRefs.current[id];
              }}
              onScroll={(event) => syncCabinImage(id, event.currentTarget)}
              aria-label={`Bilder av ${cabin.name}`}
            >
              {cabin.images.map((image, index) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={`Illustrationsbild ${index + 1}: ${image.alt}`}
                  loading="lazy"
                />
              ))}
            </div>
            <button
              type="button"
              className="flow-lodging-arrow previous"
              aria-label={`Föregående bild av ${cabin.name}`}
              onClick={() => showCabinImage(id, cabinImageIndex[id] - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="flow-lodging-arrow next"
              aria-label={`Nästa bild av ${cabin.name}`}
              onClick={() => showCabinImage(id, cabinImageIndex[id] + 1)}
            >
              <ChevronRight size={18} />
            </button>
            <span className="flow-lodging-dots" aria-label={`Bild ${cabinImageIndex[id] + 1} av ${cabin.images.length}`}>
              {cabin.images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  className={index === cabinImageIndex[id] ? "active" : ""}
                  aria-label={`Visa bild ${index + 1} av ${cabin.name}`}
                  aria-current={index === cabinImageIndex[id] ? "true" : undefined}
                  onClick={() => showCabinImage(id, index)}
                />
              ))}
            </span>
            <span className="flow-lodging-image-label">Illustrationsbild</span>
          </div>
          <button
            type="button"
            className="flow-lodging-choice"
            aria-pressed={draft.cabin === id}
            disabled={!available}
            onClick={() => setCabin(id)}
          >
            <span className="flow-lodging-info">
              <strong>{cabin.name}</strong>
              <small>{cabin.detail}</small>
              <span className="flow-lodging-meta">
                <span>{cabin.beds} bäddar</span>
                <span>{available ? `${unitsLeft} lediga stugor för perioden` : "Fullbokat för perioden"}</span>
                <span>
                  {numberOfCabins && draft.cabin === id
                    ? numberOfCabins
                    : Math.ceil(guests / cabin.beds)}{" "}
                  {Math.ceil(guests / cabin.beds) === 1 ? "stuga" : "stugor"}
                </span>
              </span>
            </span>
            <span className="flow-lodging-price">
              <small>Totalt för perioden</small>
              <strong>
                {money(
                  cabin.price *
                    Math.ceil(guests / cabin.beds) *
                    Math.max(1, nights),
                )}
              </strong>
              <small>
                {money(cabin.price)}/natt
                {optional && nights === 0 ? " · minst 1 natt" : ""}
              </small>
              {draft.cabin === id && (
                <span className="flow-lodging-selected">
                  <Check size={15} /> Valt boende
                </span>
              )}
            </span>
          </button>
        </div>
          );
      })}
    </div>
  );
  const passCards = (optional: boolean) => (
    <div className="flow-options">
      {optional && (
        <button
          type="button"
          className={`flow-option ${draft.pass === "none" ? "selected" : ""}`}
          onClick={() => setPass("none")}
        >
          <span>
            <strong>Inget pass</strong>
            <small>Jag vill bara boka boende eller andra aktiviteter.</small>
          </span>
          <Check size={19} className="flow-option-check" aria-hidden="true" />
        </button>
      )}
      {(draft.season === "winter"
        ? (["full", "three"] as PassId[])
        : (["bike"] as PassId[])
      ).map((pass) => (
        <button
          type="button"
          key={pass}
          className={`flow-option ${draft.pass === pass ? "selected" : ""}`}
          disabled={dates.some((date) => passUnitsLeft(bookings, draft.season, date, draft.editBookingId ?? draft.draftBookingId) < guests)}
          onClick={() => setPass(pass)}
        >
          <span>
            <strong>
              {pass === "full"
                ? "SkiPass heldag"
                : pass === "three"
                  ? "SkiPass 3 timmar"
                  : "Cykelpass"}
            </strong>
            <small>
              {pass === "bike"
                ? "Lift och cykelleder"
                : "Lift och skidåkning på Flottsbro"}{" "}
              · {days} {days === 1 ? "dag" : "dagar"}
            </small>
            <ProductFacts info={passGuidance[pass as "full" | "three" | "bike"]} language={language} />
          </span>
          <span className="flow-option-price">
            <strong>
              {money(pass === "bike" ? 300 : pass === "three" ? 240 : 370)}
            </strong>
            <small>från / vuxen / dag</small>
            <small>{Math.min(...dates.map((date) => passUnitsLeft(bookings, draft.season, date, draft.editBookingId ?? draft.draftBookingId)))} platser kvar per dag som minst</small>
          </span>
          <Check size={19} className="flow-option-check" aria-hidden="true" />
        </button>
      ))}
      {draft.pass !== "none" && (
        <div className="flow-pass-hours">
          {draft.pass === "three" ? (
            <label>
              Välj tid för 3-timmarspasset
              <select
                value={draft.passStartTime ?? "09:00"}
                onChange={(event) => update({ passStartTime: event.target.value as FlowDraft["passStartTime"] })}
              >
                <option value="09:00">09:00–12:00</option>
                <option value="13:00">13:00–16:00</option>
              </select>
            </label>
          ) : (
            <p>{draft.pass === "bike" ? "Tillgänglig tid för cykelpass" : "Tillgänglig tid för heldagspass"}: <strong>{passHours}</strong></p>
          )}
          <small>Tiderna gäller varje vald dag och är exempel i denna bokning.</small>
        </div>
      )}
    </div>
  );
  const setSessionTime = (
    offering: string,
    date: string,
    index: number,
    time: string,
  ) => {
    const key = sessionKey(offering, date);
    const assignments = { ...(draft.sessionAssignments?.[key] ?? {}) };
    if (time) assignments[index] = time;
    else delete assignments[index];
    update({
      sessionAssignments: {
        ...draft.sessionAssignments,
        [key]: assignments,
      },
    });
  };
  const sessionPlanner = (offering: string, title: string) => {
    const times = sessionTimes(offering, draft.schoolLesson);
    const booked = scheduledSlots.filter(
      (slot) => slot.offering === offering,
    ).length;
    return (
      <section className="flow-session-plan" aria-label={`${title}: välj pass`}>
        <div className="flow-session-head">
          <div>
            <h4>{title}: välj dag, tid och deltagare</h4>
            <p>
              {booked} bokade platser. Välj ett pass för varje person och dag
              som ska ingå.
            </p>
          </div>
          <small>Lediga tider och platser är exempel</small>
        </div>
        {dates.map((date, dayIndex) => {
          const key = sessionKey(offering, date);
          const assignments = draft.sessionAssignments?.[key] ?? {};
          const used = (time: string) =>
            Object.entries(assignments).filter(
              ([index, value]) => Number(index) < guests && value === time,
            ).length;
          const externalLeft = (time: string) => sessionSeatsLeft(
            bookings, offering, date, time, draft.schoolLesson,
            draft.editBookingId ?? draft.draftBookingId,
          );
          const assignedCount = Object.keys(assignments).filter(
            (index) =>
              Number(index) < guests &&
              times.includes(assignments[Number(index)]),
          ).length;
          return (
            <details
              className="flow-session-day"
              key={key}
              open={dayIndex === 0}
            >
              <summary>
                <strong>{dateText(date, language)}</strong>
                <span className="flow-session-summary-right">
                  <span className="flow-session-count-full">
                    {assignedCount} av {guests} deltagare bokade
                  </span>
                  <span className="flow-session-count-compact">
                    {assignedCount} av {guests} bokade
                  </span>
                  <ChevronDown className="flow-session-chevron" size={18} aria-hidden="true" />
                </span>
              </summary>
              <div className="flow-session-content">
                <div className="flow-session-slots">
                  {times.map((time) => (
                    <span key={time}>
                      <strong>kl {time}</strong> ·{" "}
                      {Math.max(0, externalLeft(time) - used(time))} platser kvar
                    </span>
                  ))}
                </div>
                <div className="flow-session-actions">
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...assignments };
                      for (let index = 0; index < guests; index++) {
                        const minimum = offering === "school"
                          ? undefined
                          : activities[offering as ActivityId].minAge;
                        const age = participantAge(index, date);
                        if (minimum !== undefined && age !== null && age < minimum) continue;
                        if (times.includes(next[index])) continue;
                        const available = times.find(
                          (time) =>
                            Object.entries(next).filter(
                              ([person, value]) =>
                                Number(person) < guests && value === time,
                            ).length < externalLeft(time),
                        );
                        if (available) next[index] = available;
                      }
                      update({
                        sessionAssignments: {
                          ...draft.sessionAssignments,
                          [key]: next,
                        },
                      });
                    }}
                  >
                    Fördela alla på lediga tider
                  </button>
                  {assignedCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          sessionAssignments: {
                            ...draft.sessionAssignments,
                            [key]: {},
                          },
                        })
                      }
                    >
                      Rensa dagen
                    </button>
                  )}
                </div>
                <div className="flow-session-people">
                  {Array.from({ length: guests }, (_, index) => {
                    const minimum = offering === "school"
                      ? undefined
                      : activities[offering as ActivityId].minAge;
                    const age = participantAge(index, date);
                    const tooYoung = minimum !== undefined && age !== null && age < minimum;
                    return <label key={index}>
                      <span>
                        <strong>{participantLabel(index)}</strong>
                        {group &&
                          draft.participants[index]?.role === "teacher" && (
                            <small>Lärare · gratis</small>
                          )}
                        {tooYoung && <small className="flow-session-age-note">{language === "en" ? `Minimum age: ${minimum}` : `Åldersgräns: ${minimum} år`}</small>}
                      </span>
                      <select
                         aria-label={`${participantLabel(index)}, ${dateText(date, language)}`}
                        value={
                          times.includes(assignments[index])
                            ? assignments[index]
                            : ""
                        }
                        onChange={(event) =>
                          setSessionTime(
                            offering,
                            date,
                            index,
                            event.target.value,
                          )
                        }
                      >
                        <option value="">Deltar inte</option>
                        {times.map((time) => {
                          const remaining = Math.max(0, externalLeft(time) - used(time));
                          return (
                            <option
                              key={time}
                              value={time}
                              disabled={
                                tooYoung || (remaining === 0 && assignments[index] !== time)
                              }
                            >
                              kl {time} · {remaining} kvar
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  })}
                </div>
              </div>
            </details>
          );
        })}
      </section>
    );
  };
  const schoolCards = (optional: boolean) => (
    <>
      <div className="flow-options">
        {optional && (
          <button
            type="button"
            className={`flow-option ${!draft.schoolLesson || draft.schoolLesson === "none" ? "selected" : ""}`}
            onClick={() =>
              update({
                schoolLesson: "none",
                sessionAssignments: Object.fromEntries(
                  Object.entries(draft.sessionAssignments ?? {}).filter(
                    ([key]) => !key.startsWith("school:"),
                  ),
                ),
              })
            }
          >
            <span>
              <strong>
                Ingen {draft.season === "winter" ? "skidskola" : "cykelskola"}
              </strong>
              <small>Fortsätt utan lektion.</small>
            </span>
            <Check size={19} className="flow-option-check" aria-hidden="true" />
          </button>
        )}
        {(["group", "private"] as ("group" | "private")[]).map((lesson) => (
          <button
            type="button"
            key={lesson}
            className={`flow-option ${draft.schoolLesson === lesson ? "selected" : ""}`}
            onClick={() =>
              update({
                schoolLesson: lesson,
                sessionAssignments:
                  draft.schoolLesson === lesson
                    ? draft.sessionAssignments
                    : Object.fromEntries(
                        Object.entries(draft.sessionAssignments ?? {}).filter(
                          ([key]) => !key.startsWith("school:"),
                        ),
                      ),
              })
            }
          >
            <span>
              <strong>
                {lesson === "group"
                  ? "Grupplektion · 90 minuter"
                  : "Privatlektion · 60 minuter"}
              </strong>
              <small>
                {lesson === "group"
                  ? "Lär tillsammans med instruktör i liten grupp"
                  : "Personlig undervisning med instruktör"}
              </small>
              <ProductFacts info={schoolGuidance(draft.season, lesson)} language={language} />
            </span>
            <span className="flow-option-price">
              <strong>{money(lesson === "group" ? 495 : 895)}</strong>
              <small>per person / pass</small>
            </span>
            <Check size={19} className="flow-option-check" aria-hidden="true" />
          </button>
        ))}
      </div>
      {draft.schoolLesson && draft.schoolLesson !== "none" && (
        <div className="flow-fields">
          <label>
            Nivå
            <select
              value={draft.schoolLevel ?? "beginner"}
              onChange={(event) =>
                update({
                  schoolLevel: event.target.value as FlowDraft["schoolLevel"],
                })
              }
            >
              <option value="beginner">Nybörjare</option>
              <option value="continuing">Har åkt tidigare</option>
            </select>
          </label>
        </div>
      )}
      {draft.schoolLesson &&
        draft.schoolLesson !== "none" &&
        sessionPlanner(
          "school",
          draft.season === "winter" ? "Skidskola" : "Cykelskola",
        )}
    </>
  );
  const activityCards = () => (
    <>
      <div className="flow-options">
        {activityIds
          .filter((id) => activities[id].season === draft.season)
          .map((id) => (
            <button
              type="button"
              key={id}
              className={`flow-option ${draft.activities.includes(id) ? "selected" : ""}`}
              onClick={() => toggleActivity(id)}
            >
              <span>
                <strong>{activities[id].name}</strong>
                <small>{activities[id].detail}</small>
                <ProductFacts info={activityGuidance[id]} language={language} />
              </span>
              <span className="flow-option-price">
                <strong>{money(activities[id].price)}</strong>
                <small>per person / pass</small>
              </span>
              <Check size={19} className="flow-option-check" aria-hidden="true" />
            </button>
          ))}
      </div>
      {draft.activities.map((id) => sessionPlanner(id, activities[id].name))}
    </>
  );
  const addonPrice = (value: number) => language === "en"
    ? `${new Intl.NumberFormat("en-GB").format(value)} SEK`
    : money(value);
  const notAdded = language === "en" ? "Not added" : "Inte tillagt";
  const activityCountLabel = language === "en"
    ? "selected"
    : draft.activities.length === 1 ? "vald" : "valda";
  const schoolLessonLabel = draft.schoolLesson === "private"
    ? language === "en" ? "Private lesson" : "Privatlektion"
    : language === "en" ? "Group lesson" : "Grupplektion";
  const equipmentCards = () => {
    const choices = draft.season === "winter"
      ? [{ value: "own", title: language === "en" ? "Own equipment" : "Egen utrustning", kind: null },
        { value: "Skidåkning", title: language === "en" ? "Skis" : "Skidor", kind: "ski" as EquipmentKind },
        { value: "Snowboard", title: "Snowboard", kind: "snowboard" as EquipmentKind }]
      : [{ value: "own", title: language === "en" ? "Own equipment" : "Egen utrustning", kind: null },
        { value: "Cykling", title: language === "en" ? "Downhill bike incl. helmet and protection" : "Downhillcykel inkl. hjälm och skydd", kind: "bike" as EquipmentKind }];
    return <div className="flow-equipment-page">
      <p className="flow-muted">{language === "en"
        ? "Choose rental equipment for each guest. You can mix skis and snowboards. Sizes are needed only for guests renting equipment."
        : "Välj utrustning för varje deltagare. Skidor och snowboard kan kombineras. Mått behövs bara för den som hyr."}</p>
      <div className="flow-capacity-summary">
        <strong>{language === "en" ? "Available on your first day" : "Ledigt på startdagen"}</strong>
        {choices.filter((choice) => choice.kind).map((choice) => <span key={choice.value}>
          {choice.title}: {equipmentDemand(draft, choice.kind!)} {language === "en" ? "selected" : "valda"} · {equipmentUnitsLeft(bookings, choice.kind!, draft.start, draft.editBookingId ?? draft.draftBookingId)} {language === "en" ? "available" : "lediga"}
        </span>)}
      </div>
      <div className="flow-equipment-people">
        {Array.from({ length: guests }, (_, index) => {
          const person = group ? preparedParticipants()[index] : null;
          const details = draft.rentalDetails?.[index] ?? { activity: "" as const, shoe: "", height: "", weight: "" };
          const borrows = group ? person?.equipment === "borrow" : (draft.borrowGuests ?? []).includes(index);
          const activity = group ? person?.activity : details.activity;
          const name = group
            ? person?.name || `${language === "en" ? "Participant" : "Deltagare"} ${index + 1}`
            : draft.guests[index] || `${index < draft.adults ? language === "en" ? "Adult" : "Vuxen" : language === "en" ? "Child" : "Barn"} ${index < draft.adults ? index + 1 : index - draft.adults + 1}`;
          const selectChoice = (choice: string) => {
            if (group) participantChange(index, {
              equipment: choice === "own" ? "own" : "borrow",
              activity: choice === "own" ? person?.activity ?? "" : choice,
            });
            else update({
              borrowGuests: choice === "own"
                ? (draft.borrowGuests ?? []).filter((guest) => guest !== index)
                : [...new Set([...(draft.borrowGuests ?? []), index])],
              rentalDetails: { ...draft.rentalDetails, [index]: { ...details,
                activity: choice === "own" ? details.activity : choice as RentalDetails["activity"] } },
            });
          };
          const changeMeasurement = (field: "shoe" | "height" | "weight", value: string) => {
            if (group) participantChange(index, { [field]: value });
            else update({ rentalDetails: { ...draft.rentalDetails, [index]: { ...details, [field]: value } } });
          };
          return <section className="flow-equipment-person" key={index}>
            <div className="flow-equipment-person-head"><strong>{name}</strong><span>{borrows ? `${money(equipmentUnit)} / ${language === "en" ? "day" : "dag"}` : language === "en" ? "No rental" : "Ingen hyra"}</span></div>
            <div className="flow-equipment-choices" role="group" aria-label={`${language === "en" ? "Equipment for" : "Utrustning för"} ${name}`}>
              {choices.map((choice) => <button type="button" key={choice.value}
                className={`flow-equipment-choice ${choice.value === (borrows ? activity : "own") ? "selected" : ""}`}
                aria-pressed={choice.value === (borrows ? activity : "own")}
                onClick={() => selectChoice(choice.value)}>
                <strong>{choice.title}</strong>
                <small>{choice.kind ? `${money(equipmentUnit)} / ${language === "en" ? "day" : "dag"}` : language === "en" ? "No extra charge" : "Utan tillägg"}</small>
                <Check size={17} aria-hidden="true" />
              </button>)}
            </div>
            {borrows && <div className="flow-fields flow-equipment-measures">
              <label>{language === "en" ? "Height (cm)" : "Längd (cm)"}<input inputMode="numeric" value={group ? person?.height ?? "" : details.height} onChange={(event) => changeMeasurement("height", event.target.value)} /></label>
              {draft.season === "winter" && <>
                <label>{language === "en" ? "Shoe size" : "Skostorlek"}<input inputMode="numeric" value={group ? person?.shoe ?? "" : details.shoe} onChange={(event) => changeMeasurement("shoe", event.target.value)} /></label>
                <label>{language === "en" ? "Weight (kg)" : "Vikt (kg)"}<input inputMode="numeric" value={group ? person?.weight ?? "" : details.weight} onChange={(event) => changeMeasurement("weight", event.target.value)} /></label>
              </>}
            </div>}
          </section>;
        })}
      </div>
    </div>;
  };
  const optionalAddons = [
    {
      id: "lodging" as const,
      show: !mainIsCabin,
      icon: <Home size={21} />,
      title: "Boende",
      description: language === "en" ? "Choose a cabin for your dates" : "Välj stuga för perioden",
      summary: selectedCabin
        ? `${language === "en" ? ({ none: "", forest: "Forest Cabin", family: "Family Cabin", view: "View Cabin" } as Record<CabinId, string>)[draft.cabin] : selectedCabin.name} · ${addonPrice(cabinTotal)}`
        : notAdded,
      selected: Boolean(selectedCabin),
      content: () => cabinCards(true),
    },
    {
      id: "pass" as const,
      show: draft.entry !== "day" && draft.entry !== "group",
      icon: <Ticket size={21} />,
      title: draft.season === "winter" ? "SkiPass" : "Cykelpass",
      description: language === "en" ? "Lift access during your visit" : "Lift och åkning under vistelsen",
      summary: draft.pass !== "none"
        ? `${days} ${language === "en" ? days === 1 ? "day" : "days" : days === 1 ? "dag" : "dagar"} · ${addonPrice(passTotal)}`
        : notAdded,
      selected: draft.pass !== "none",
      content: () => passCards(true),
    },
    {
      id: "activities" as const,
      show: draft.entry !== "activity",
      icon: <Compass size={21} />,
      title: "Aktiviteter",
      description: language === "en" ? "Choose an activity, day, time and guests" : "Välj aktivitet, dag, tid och deltagare",
      summary: draft.activities.length
        ? `${draft.activities.length} ${activityCountLabel} · ${activityTotal > 0 ? addonPrice(activityTotal) : language === "en" ? "choose times" : "välj tider"}`
        : notAdded,
      selected: draft.activities.length > 0,
      content: activityCards,
    },
    {
      id: "school" as const,
      show: draft.entry !== "school",
      icon: <GraduationCap size={21} />,
      title: draft.season === "winter" ? "Skidskola" : "Cykelskola",
      description: language === "en" ? "Lessons with available times" : "Lektioner med lediga tider",
      summary: draft.schoolLesson && draft.schoolLesson !== "none"
        ? `${schoolLessonLabel} · ${schoolTotal > 0 ? addonPrice(schoolTotal) : language === "en" ? "choose times" : "välj tider"}`
        : notAdded,
      selected: Boolean(draft.schoolLesson && draft.schoolLesson !== "none"),
      content: () => schoolCards(true),
    },
    {
      id: "equipment" as const,
      show: draft.entry !== "rental",
      icon: draft.season === "winter" ? <MountainSnow size={21} /> : <Bike size={21} />,
      title: "Hyra utrustning",
      description: language === "en" ? "Choose equipment per guest" : "Välj utrustning per deltagare",
      summary: borrowCount
        ? `${borrowCount} ${language === "en" ? borrowCount === 1 ? "guest" : "guests" : borrowCount === 1 ? "person" : "personer"} · ${addonPrice(equipmentTotal)}`
        : language === "en" ? "No rental selected" : "Ingen hyra vald",
      selected: borrowCount > 0,
      content: equipmentCards,
    },
  ].filter((addon) => addon.show);
  const finishAddon = () => {
    if (openAddon === "equipment") {
      const incomplete = group
        ? preparedParticipants().some((person) => person.equipment === "borrow" &&
          (!person.activity || !person.height || (draft.season === "winter" && (!person.shoe || !person.weight))))
        : (draft.borrowGuests ?? []).some((index) => index < guests &&
          (!draft.rentalDetails?.[index]?.activity || !draft.rentalDetails[index].height ||
            (draft.season === "winter" && (!draft.rentalDetails[index].shoe || !draft.rentalDetails[index].weight))));
      if (incomplete) { setError("Fyll i utrustningsuppgifterna för alla som hyr."); return; }
    }
    if ((openAddon === "activities" || openAddon === "school") &&
      unscheduledOfferings.some((offering) => openAddon === "school" ? offering === "school" : offering !== "school")) {
      setError("Välj minst en deltagare, dag och ledig tid för varje vald lektion eller aktivitet.");
      return;
    }
    if (openAddon === "activities") {
      const slot = underageSlots[0];
      if (slot) {
        const activity = activities[slot.offering as ActivityId];
        setError(`${participantLabel(slot.index)} är för ung för ${activity.name}. Åldersgränsen är ${activity.minAge} år.`);
        return;
      }
    }
    if (openAddon === "lodging" && selectedCabin &&
      cabinUnitsLeft(bookings, draft.cabin as Exclude<CabinId, "none">, selectedCabin.beds, draft.start, draft.end,
        draft.editBookingId ?? draft.draftBookingId) < numberOfCabins) {
      setError("Det valda boendet är inte längre tillgängligt för perioden. Välj ett annat boende.");
      return;
    }
    setOpenAddon(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const itemized = [
    draft.pass !== "none" && {
      label: `${draft.pass === "bike" ? "Cykelpass" : "SkiPass"} · ${passHours}`,
      value: passTotal,
    },
    selectedCabin && {
      label: `${selectedCabin.name} · ${numberOfCabins} st.`,
      value: cabinTotal,
    },
    ...draft.activities.map((id) => ({
      label: activities[id].name,
      value:
        scheduledSlots.filter(
          (slot) => slot.offering === id && paidSeat(slot.index),
        ).length * activities[id].price,
    })),
    schoolTotal > 0 && {
      label: `${draft.season === "winter" ? "Skidskola" : "Cykelskola"} · ${draft.schoolLesson === "private" ? "privat" : "grupp"}`,
      value: schoolTotal,
    },
    borrowCount > 0 && {
      label: `${draft.season === "summer" ? "Downhillcykel inkl. hjälm och skydd" : "Utrustning"} · ${borrowCount} ${borrowCount === 1 ? "person" : "personer"}`,
      value: equipmentTotal,
    },
  ].filter((item): item is { label: string; value: number } =>
    Boolean(item && item.value > 0),
  );
  if (done)
    return (
      <main className="flow-shell">
        <div className="flow-success">
          <span className="flow-success-icon">
            <Check size={30} />
          </span>
          <h1>
            {group && draft.payment === "invoice"
              ? "Fakturaunderlag skapat"
              : draft.editBookingId ? "Bokningen är uppdaterad" : "Bokningen är klar"}
          </h1>
          <p>
            {language === "en"
              ? `Booking ${doneBooking?.id} is saved. The confirmation is available under My bookings. No email is sent in this demo.`
              : `Bokning ${doneBooking?.id} är sparad. Bekräftelsen finns under Mina bokningar. Inget e-postmeddelande skickas i demosystemet.`}
          </p>
          <div className="flow-success-details">
            <h2>Inför besöket</h2>
            <p><strong>Period:</strong> {draft.start} – {draft.end}</p>
            {draft.pass !== "none" && <p><strong>{draft.pass === "bike" ? "Cykelpass" : "SkiPass"}:</strong> {passHours} · {days} {language === "en" ? days === 1 ? "day" : "days" : days === 1 ? "dag" : "dagar"}</p>}
            <p><strong>Plats:</strong> {language === "en" ? `Flottsbro, Häggstavägen 20, Huddinge. Show booking number ${doneBooking?.id} on arrival.` : `Flottsbro, Häggstavägen 20, Huddinge. Visa bokningsnummer ${doneBooking?.id} vid ankomst.`}</p>
            {sessionRows.length > 0 && <div>
              <strong>Bokade tider</strong>
              {sessionRows.map((row) => <p key={row.key}>{row.label} · {dateText(row.date, language)} {language === "en" ? "at" : "kl"} {row.time} · {row.people.join(", ")}</p>)}
            </div>}
            <p><strong>Utrustning:</strong> {language === "en"
              ? `${borrowCount ? `${borrowCount} people collect rented equipment at the rental desk.` : "Bring your own equipment if the activity requires it."} Dress for the weather.`
              : `${borrowCount ? `${borrowCount} personer hämtar hyrd utrustning vid uthyrningen.` : "Ta med egen utrustning om aktiviteten kräver det."} Klä dig efter väder.`}</p>
            <p><strong>Totalt:</strong> {money(total)} · {doneBooking?.payment}</p>
            {draft.editBookingId && <p><strong>Ändring:</strong> Tidigare {money(draft.editOriginalTotal ?? 0)} · skillnad {money(total - (draft.editOriginalTotal ?? 0))}.</p>}
          </div>
          <div className="flow-success-actions">
            {draft.checkoutMode === "login" && (
              <button className="flow-primary" onClick={onBookings}>Visa mina bokningar <ArrowRight size={17} /></button>
            )}
            {group && draft.payment === "invoice" && doneBooking && <button type="button" className="flow-back" onClick={() => onInvoice(doneBooking)}>Ladda ned fakturaunderlag</button>}
            <button className="flow-back" onClick={onHome}>Till startsidan</button>
          </div>
        </div>
      </main>
    );
  return (
    <main className="flow-shell">
      <div className="flow-intro">
        <h1>
          {group
            ? "Boka för din grupp"
            : mainIsCabin
              ? "Boka din vistelse"
              : draft.entry === "rental"
                ? "Hyr utrustning"
                : draft.entry === "school"
                  ? draft.season === "winter"
                    ? "Boka skidskola"
                    : "Boka cykelskola"
                  : draft.entry === "activity"
                    ? "Boka aktiviteter"
                    : draft.season === "winter"
                      ? "Boka skidåkning"
                      : "Boka sommaräventyr"}
        </h1>
        <p>Välj din period och bygg en vistelse som passar ditt sällskap.</p>
        {draft.rebookOf && <p className="flow-hint">Uppgifter från bokning {draft.rebookOf} är ifyllda. Granska dem och ändra vid behov.</p>}
        {draft.editBookingId && <p className="flow-hint">Du ändrar bokning {draft.editBookingId}. Det nya priset visas innan du godkänner.</p>}
      </div>
      <nav
        ref={stepsRef}
        className="flow-steps"
        aria-label="Bokningssteg"
        style={{ "--flow-step-count": visibleSteps.length } as CSSProperties}
      >
        {visibleSteps.map((step, position) => (
          <button
            key={step}
            type="button"
            className={
              step === draft.step
                ? "current"
                : position < stepPosition
                  ? "completed"
                  : ""
            }
            onClick={() => {
              if (position < stepPosition) {
                setOpenAddon(null);
                update({ step });
              }
            }}
          >
            <span>
              {position < stepPosition ? <Check size={13} /> : position + 1}
            </span>
            <small>{stageLabels[step]}</small>
          </button>
        ))}
      </nav>
      <div
        className={`flow-layout ${group && draft.step === 1 ? "flow-layout-wide" : ""}`}
      >
        <div className="flow-main">
          <section className="flow-panel">
            <div className="flow-panel-head">
              <h2>{draft.step === 3 && openAddon
                ? optionalAddons.find((addon) => addon.id === openAddon)?.title ?? stageLabels[draft.step]
                : stageLabels[draft.step]}</h2>
            </div>
            {draft.step === 0 && (
              <>
                <p className="flow-muted">
                  Välj hela perioden först. Priser och tillgänglighet visas för
                  de datum du väljer.
                </p>
                <DatePicker
                  start={draft.start}
                  end={draft.end}
                  onChange={setPeriod}
                  language={language}
                />
                {group ? (
                  <div className="flow-fields">
                    <label>
                      Skola eller organisation
                      <input
                        value={draft.org}
                        onChange={(e) => update({ org: e.target.value })}
                        placeholder="Björkängsskolan"
                      />
                    </label>
                    <label>
                      Preliminärt antal deltagare
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={draft.groupCount}
                        onChange={(e) =>
                          update({
                            groupCount: Math.max(
                              1,
                              Math.min(120, Number(e.target.value) || 1),
                            ),
                          })
                        }
                      />
                    </label>
                    <p className="flow-hint">
                      Lärare markeras senare och är kostnadsfria för
                      aktiviteterna. Deltagarlistan kan kompletteras senare.
                    </p>
                  </div>
                ) : (
                  <div className="flow-party">
                    <div>
                      <strong>Vuxna</strong>
                      <small>18 år och äldre</small>
                      <span>
                        <button
                          type="button"
                          onClick={() =>
                            changeParty(
                              Math.max(0, draft.adults - 1),
                              draft.children,
                            )
                          }
                        >
                          −
                        </button>
                        <output className="flow-party-count">{draft.adults}</output>
                        <button
                          type="button"
                          onClick={() =>
                            changeParty(draft.adults + 1, draft.children)
                          }
                        >
                          +
                        </button>
                      </span>
                    </div>
                    <div>
                      <strong>Barn</strong>
                      <small>0–17 år</small>
                      <span>
                        <button
                          type="button"
                          onClick={() =>
                            changeParty(
                              draft.adults,
                              Math.max(0, draft.children - 1),
                            )
                          }
                        >
                          −
                        </button>
                        <output className="flow-party-count">{draft.children}</output>
                        <button
                          type="button"
                          onClick={() =>
                            changeParty(draft.adults, draft.children + 1)
                          }
                        >
                          +
                        </button>
                      </span>
                    </div>
                    {draft.childAges.map((age, i) => (
                      <label key={i}>
                        Barn {i + 1}, ålder vid resan
                        <input
                          type="number"
                          min={0}
                          max={17}
                          value={age ?? ""}
                          onChange={(e) =>
                            update({
                              childAges: draft.childAges.map((v, j) =>
                                j === i
                                  ? e.target.value === ""
                                    ? null
                                    : Number(e.target.value)
                                  : v,
                              ),
                            })
                          }
                          placeholder="Ålder"
                        />
                      </label>
                    ))}
                  </div>
                )}
                {!group && (
                  <p className="flow-hint">
                    Du kan boka enbart barn. Välj 0 vuxna här; en vuxen
                    kontaktperson anges senare och behöver inte delta.
                  </p>
                )}
              </>
            )}
            {draft.step === 1 && (
              <>
                {group ? (
                  <>
                    <div className="flow-subhead" id="group-participants">
                      <h3>Deltagarlista</h3>
                      <span>{draft.groupCount} deltagare</span>
                    </div>
                    <p className="flow-muted">
                      Markera lärare där det behövs. Elever behöver
                      födelsedatum. Utrustning väljer du senare under Tillägg.
                      Du kan fortsätta med en ofullständig lista och
                      komplettera den före betalning.
                    </p>
                    <div className="flow-list-actions">
                      <label className="flow-text-button">
                        <FileText size={16} /> Importera CSV
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void importCsv(file);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="flow-text-button"
                        onClick={addParticipant}
                      >
                        <Plus size={16} /> Lägg till deltagare
                      </button>
                      <button
                        type="button"
                        className="flow-text-button"
                        onClick={() => setBulkOpen((open) => !open)}
                        aria-expanded={bulkOpen}
                      >
                        Klistra in flera
                      </button>
                    </div>
                    {bulkOpen && (
                      <div className="flow-bulk-box">
                        <label>
                          Klistra in en person per rad. Namn räcker för att
                          börja; lägg gärna till födelsedatum, roll och lån med
                          semikolon eller tabbar.
                          <textarea
                            value={bulkText}
                            onChange={(event) =>
                              setBulkText(event.target.value)
                            }
                            placeholder={
                              "Alma Andersson;2012-04-14\nNora Lind;2012-08-20\nSara Berg;1985-05-03;Lärare"
                            }
                            rows={6}
                          />
                        </label>
                        <div className="flow-bulk-actions">
                          <button
                            type="button"
                            className="flow-primary"
                            onClick={addMany}
                            disabled={bulkLineCount === 0}
                          >
                            {`Lägg till ${bulkLineCount} personer`}
                          </button>
                          <button
                            type="button"
                            className="flow-back"
                            onClick={() => setBulkOpen(false)}
                          >
                            Avbryt
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="flow-import-help">
                      CSV: namn; roll; födelsedatum; aktivitet; lånar
                      utrustning; skostorlek; längd; vikt. Semikolon eller komma
                      fungerar.
                    </p>
                    {notice && (
                      <p className="flow-hint" role="status">
                        {notice}
                      </p>
                    )}
                    <div className="flow-participant-tools">
                      <label className="flow-participant-search">
                        <Search size={16} />
                        <input
                          value={participantSearch}
                          onChange={(event) => {
                            setParticipantSearch(event.target.value);
                            setVisibleParticipants(12);
                          }}
                          placeholder="Sök deltagare"
                          aria-label="Sök deltagare"
                        />
                      </label>
                      <button
                        type="button"
                        className={missingOnly ? "active" : ""}
                        disabled={incompleteCount === 0 && !missingOnly}
                        aria-pressed={missingOnly}
                        onClick={() => {
                          setMissingOnly((value) => !value);
                          setVisibleParticipants(12);
                        }}
                      >
                        {missingOnly
                          ? "Visa alla"
                          : `Visa ofullständiga (${incompleteCount})`}
                      </button>
                      <span>
                        {draft.groupCount - incompleteCount} av{" "}
                        {draft.groupCount} klara
                      </span>
                    </div>
                    <p className="flow-table-scroll-hint">
                      Svep sidled för att se alla kolumner.
                    </p>
                    <div
                      className="flow-people-list"
                      role="region"
                      aria-label="Deltagare"
                      tabIndex={0}
                    >
                      <table className="flow-people-table">
                        <thead>
                          <tr>
                            <th scope="col">#</th>
                            <th scope="col">Namn</th>
                            <th scope="col">Roll</th>
                            <th scope="col">Födelsedatum</th>
                            <th scope="col">Status</th>
                            <th scope="col">
                              <span className="sr-only">Ta bort</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredParticipants
                            .slice(0, visibleParticipants)
                            .map(({ person, index }) => (
                              <tr key={index} data-person-index={index}>
                                <th scope="row" className="flow-people-number">
                                  {index + 1}
                                </th>
                                <td className="flow-people-name">
                                  <input
                                    value={person.name}
                                    onChange={(event) =>
                                      participantChange(index, {
                                        name: event.target.value,
                                      })
                                    }
                                    placeholder="För- och efternamn"
                                    aria-label={`Namn för deltagare ${index + 1}`}
                                  />
                                </td>
                                <td>
                                  <select
                                    value={person.role ?? "student"}
                                    onChange={(event) =>
                                      participantChange(index, {
                                        role:
                                          event.target.value === "teacher"
                                            ? "teacher"
                                            : null,
                                      })
                                    }
                                    aria-label={`Roll för deltagare ${index + 1}`}
                                  >
                                    <option value="student">Elev</option>
                                    <option value="teacher">Lärare</option>
                                  </select>
                                </td>
                                <td>
                                  <input
                                    type="date"
                                    value={
                                      person.role === "teacher"
                                        ? ""
                                        : person.birthDate
                                    }
                                    disabled={person.role === "teacher"}
                                    max={draft.start}
                                    onChange={(event) =>
                                      participantChange(index, {
                                        birthDate: event.target.value,
                                      })
                                    }
                                    aria-label={`Födelsedatum för deltagare ${index + 1}`}
                                  />
                                </td>
                                <td>
                                  <span
                                    className={`flow-people-status ${participantComplete(person) ? "complete" : "missing"}`}
                                  >
                                    {participantComplete(person)
                                      ? "Klar"
                                      : "Saknas"}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="flow-people-remove"
                                    onClick={() => removeParticipant(index)}
                                    aria-label={`Ta bort ${person.name || `deltagare ${index + 1}`}`}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {!filteredParticipants.length && (
                            <tr>
                              <td colSpan={6} className="flow-people-empty">
                                Inga deltagare matchar sökningen.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {filteredParticipants.length > visibleParticipants && (
                      <button
                        type="button"
                        className="flow-text-button flow-show-more-participants"
                        onClick={() =>
                          setVisibleParticipants(filteredParticipants.length)
                        }
                      >
                        Visa fler deltagare (
                        {filteredParticipants.length - visibleParticipants})
                      </button>
                    )}
                    <p className="flow-hint">
                      {draft.editBookingId
                        ? "Ändringarna autosparas som utkast. Slutför flödet för att uppdatera bokningen."
                        : "Din preliminära bokning sparas automatiskt. Du kan fortsätta med deltagarlistan senare."}
                    </p>
                    <button
                      type="button"
                      className="flow-text-button"
                      onClick={onHome}
                    >
                      Fortsätt senare
                    </button>
                  </>
                ) : (
                  <>
                    <p className="flow-muted">
                      Ange namn för varje person. Barn behöver också
                      födelsedatum. Utrustning väljer du senare.
                    </p>
                    {Array.from({ length: guests }, (_, i) => {
                      const isChild = i >= draft.adults;
                      const childIndex = i - draft.adults;
                      return (
                        <div className="flow-person flow-guest-person" key={i}>
                          <h3>
                            {isChild
                              ? `Barn ${childIndex + 1}`
                              : `Vuxen ${i + 1}`}
                          </h3>
                          <div className="flow-fields">
                            <label>
                              För- och efternamn
                              <input
                                value={draft.guests?.[i] ?? ""}
                                onChange={(event) =>
                                  update({
                                    guests: Array.from(
                                      { length: guests },
                                      (_, j) =>
                                        j === i
                                          ? event.target.value
                                          : (draft.guests[j] ?? ""),
                                    ),
                                  })
                                }
                                placeholder="För- och efternamn"
                              />
                            </label>
                            {isChild && (
                              <label>
                                Födelsedatum
                                <input
                                  type="date"
                                  max={draft.start}
                                  value={
                                    draft.childBirthDates?.[childIndex] ?? ""
                                  }
                                  onChange={(event) => {
                                    const childBirthDates = Array.from(
                                      { length: draft.children },
                                      (_, j) =>
                                        j === childIndex
                                          ? event.target.value
                                          : (draft.childBirthDates[j] ?? ""),
                                    );
                                    update({
                                      childBirthDates,
                                      childAges: childBirthDates.map(
                                        (date, j) =>
                                          date
                                            ? ageOnDate(date, draft.start)
                                            : (draft.childAges[j] ?? null),
                                      ),
                                    });
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
            {draft.step === 2 && (
              <>
                <p className="flow-muted">
                  {mainIsCabin
                    ? "Välj boende för din period. Vi visar totalpriset och antal stugor som behövs för sällskapet."
                    : draft.entry === "rental"
                      ? "Välj vilka deltagare som vill hyra utrustning och fyll i deras mått. Olika deltagare kan välja olika utrustning."
                    : draft.entry === "school"
                      ? "Välj lektion och nivå. Boka sedan dag och ledig tid för varje deltagare."
                      : draft.entry === "activity"
                        ? "Välj aktiviteter och boka dag och ledig tid för deltagarna."
                        : "Välj ditt huvudpass. Du kan lägga till boende och aktiviteter på nästa sida."}
                </p>
                  {draft.entry === "rental" ? (
                    equipmentCards()
                  ) : mainIsCabin ? (
                  cabinCards(false)
                ) : draft.entry === "school" ? (
                  schoolCards(false)
                ) : draft.entry === "activity" ? (
                  activityCards()
                ) : (
                  passCards(false)
                )}
              </>
            )}
            {draft.step === 3 && (
              <>
                {openAddon ? (
                  <div className="flow-addon-vertical">
                    <button type="button" className="flow-text-button flow-addon-return" onClick={() => { setOpenAddon(null); setError(""); }}>
                      <ArrowLeft size={16} /> {language === "en" ? "All add-ons" : "Alla tillägg"}
                    </button>
                    {optionalAddons.find((addon) => addon.id === openAddon)?.content()}
                  </div>
                ) : <>
                  <p className="flow-muted">
                    {language === "en"
                      ? "Add more to your visit if you like. Each choice opens on its own page; when you're done, you can choose another."
                      : "Lägg till mer i din vistelse om du vill. Varje tillägg öppnas för sig. När du är klar kan du välja ett till."}
                  </p>
                  <div className="flow-addon-list">
                    {optionalAddons.map((addon) => (
                      <section className={`flow-addon-card ${addon.selected ? "selected" : ""}`} key={addon.id}>
                        <button type="button" className="flow-addon-trigger"
                          onClick={() => { setOpenAddon(addon.id); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                          <span className="flow-addon-icon" aria-hidden="true">{addon.icon}</span>
                          <span className="flow-addon-heading"><strong>{addon.title}</strong><small>{addon.description}</small></span>
                          <span className="flow-addon-state">{addon.summary}</span>
                          <ArrowRight size={19} className="flow-addon-chevron" aria-hidden="true" />
                        </button>
                      </section>
                    ))}
                  </div>
                </>}
              </>
            )}
            {draft.step === 7 && (
              <>
                <div className="flow-subhead">
                  <h3>Kontaktperson</h3>
                </div>
                {!group && (
                  <p className="flow-muted">
                    Kontaktpersonen kan vara en vuxen som bokar för barnen utan
                    att själv delta i aktiviteterna.
                  </p>
                )}
                <div className="flow-fields">
                  <label>
                    För- och efternamn
                    <input
                      value={draft.name}
                      onChange={(e) =>
                        update({
                          name: e.target.value,
                          contact: {
                            ...draft.contact,
                            contactPerson: e.target.value,
                          },
                        })
                      }
                      placeholder="Sara Lind"
                    />
                  </label>
                  <label>
                    E-post
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(e) => update({ email: e.target.value })}
                      placeholder="sara@example.se"
                    />
                  </label>
                  <label>
                    Telefon
                    <input
                      type="tel"
                      value={draft.contact.phone}
                      onChange={(e) =>
                        update({
                          contact: { ...draft.contact, phone: e.target.value },
                        })
                      }
                      placeholder="070-123 45 67"
                    />
                  </label>
                  {group && (
                    <>
                      <label>
                        Roll eller befattning
                        <input
                          value={draft.contact.position ?? ""}
                          onChange={(e) =>
                            update({
                              contact: {
                                ...draft.contact,
                                position: e.target.value,
                              },
                            })
                          }
                          placeholder="Lärare"
                        />
                      </label>
                      <label>
                        Organisationsnummer
                        <input
                          value={draft.contact.organisationNumber ?? ""}
                          onChange={(e) =>
                            update({
                              contact: {
                                ...draft.contact,
                                organisationNumber: e.target.value,
                              },
                            })
                          }
                          placeholder="212000-1234"
                        />
                      </label>
                      <label>
                        Fakturareferens
                        <input
                          value={draft.contact.invoiceReference ?? ""}
                          onChange={(e) =>
                            update({
                              contact: {
                                ...draft.contact,
                                invoiceReference: e.target.value,
                              },
                            })
                          }
                          placeholder="Skidresa 2027"
                        />
                      </label>
                    </>
                  )}
                </div>
                <h3>{group ? "Adress och fakturauppgifter" : "Adress"}</h3>
                <div className="flow-fields">
                  <CountrySelect
                    value={draft.contact.country ?? ""}
                    language={language}
                    onChange={(country) => update({
                      contact: { ...draft.contact, country },
                    })}
                  />
                  <label>
                    Gatuadress
                    <input
                      value={draft.contact.street}
                      onChange={(e) =>
                        update({
                          contact: { ...draft.contact, street: e.target.value },
                        })
                      }
                      placeholder="Björkvägen 12"
                    />
                  </label>
                  <label>
                    Adressrad 2 (valfri)
                    <input
                      value={draft.contact.addressLine2 ?? ""}
                      onChange={(e) =>
                        update({
                          contact: {
                            ...draft.contact,
                            addressLine2: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    Postnummer
                    <input
                      autoComplete="postal-code"
                      value={draft.contact.postalCode}
                      onChange={(e) =>
                        update({
                          contact: {
                            ...draft.contact,
                            postalCode: e.target.value,
                          },
                        })
                      }
                      placeholder="141 45"
                    />
                  </label>
                  <label>
                    Ort
                    <input
                      value={draft.contact.city}
                      onChange={(e) =>
                        update({
                          contact: { ...draft.contact, city: e.target.value },
                        })
                      }
                      placeholder="Huddinge"
                    />
                  </label>
                  {group && (
                    <label>
                      Fakturaadress för e-post
                      <input
                        type="email"
                        value={draft.contact.billingEmail ?? ""}
                        onChange={(e) =>
                          update({
                            contact: {
                              ...draft.contact,
                              billingEmail: e.target.value,
                            },
                          })
                        }
                        placeholder="faktura@skola.se"
                      />
                    </label>
                  )}
                </div>
                <div className="flow-account-summary">
                  <div>
                    <strong>
                      {draft.checkoutMode === "login"
                        ? "Inloggad bokning"
                        : "Bokning som gäst"}
                    </strong>
                    <span>Du valde detta när du påbörjade bokningen.</span>
                  </div>
                  <button type="button" onClick={() => onChangeAccount(draft)}>
                    Ändra
                  </button>
                </div>
              </>
            )}
            {draft.step === 8 && (
              <>
                {quickRebook && (
                  <div className="flow-rebook-quick">
                    <div>
                      <strong>Samma upplägg, nytt datum</strong>
                      <p>Personer, utrustning och tillval är hämtade från din tidigare bokning. Kontrollera priset och välj ett nytt startdatum.</p>
                    </div>
                    <label>
                      Nytt startdatum
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={draft.start}
                        onChange={(event) => event.target.value && shiftRebookStart(event.target.value)}
                      />
                    </label>
                    <span>Slutdatum: {draft.end}</span>
                    <button
                      type="button"
                      className="flow-text-button"
                      onClick={() => {
                        update({ step: 0, rebookQuick: false });
                      }}
                    >
                      Ändra deltagare eller tillval
                    </button>
                  </div>
                )}
                <p className="flow-muted">
                  Kontrollera din bokning innan du går vidare till betalning.
                </p>
                <div className="flow-review">
                  <div>
                    <span>Period</span>
                    <strong>
                      {draft.start} – {draft.end}
                    </strong>
                  </div>
                  <div>
                    <span>Sällskap</span>
                    <strong>
                      {guests} {guests === 1 ? "person" : "personer"}
                      {group ? ` · ${teachers} lärare` : ""}
                    </strong>
                  </div>
                  <div>
                    <span>Kontakt</span>
                    <strong>
                      {draft.name} · {draft.email}
                    </strong>
                  </div>
                  {group ? (
                    <div>
                      <span>Organisation</span>
                      <strong>{draft.org}</strong>
                    </div>
                  ) : (
                    <div>
                      <span>Resenärer</span>
                      <strong>
                        {draft.guests.join(", ")}
                        {draft.childBirthDates.length
                          ? ` · barn födda ${draft.childBirthDates.join(", ")}`
                          : ""}
                      </strong>
                    </div>
                  )}
                  {sessionRows.length > 0 && (
                    <div className="flow-review-sessions">
                      <span>Bokade pass</span>
                      <div>
                        {sessionRows.map((row) => (
                          <p key={row.key}>
                            <strong>
                              {row.label} · {dateText(row.date, language)} kl {row.time}
                            </strong>
                            <small>{row.people.join(", ")}</small>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span>Adress</span>
                    <strong>
                      {[draft.contact.street, draft.contact.addressLine2, `${draft.contact.postalCode} ${draft.contact.city}`, countryLabel(draft.contact.country, language)].filter(Boolean).join(", ")}
                    </strong>
                  </div>
                  {itemized.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong>{money(item.value)}</strong>
                    </div>
                  ))}
                  <div className="flow-review-total">
                    <span>Totalt</span>
                    <strong>{money(total)}</strong>
                  </div>
                </div>
                <details className="flow-terms-details">
                  <summary>Läs exempelvillkor</summary>
                  <p>
                    Priser och tillgänglighet är exempel. Bokningen sparas i
                    denna version av tjänsten och inga pengar dras. Verkliga
                    bokningsvillkor behöver fastställas före lansering.
                  </p>
                </details>
                <label className="flow-terms">
                  <input
                    type="checkbox"
                    checked={draft.terms}
                    onChange={(e) => update({ terms: e.target.checked })}
                  />{" "}
                  Jag har läst och godkänner exempelvillkoren ovan.
                </label>
              </>
            )}
            {draft.step === 9 && (
              <>
                <p className="flow-muted">
                  {language === "en"
                    ? group
                      ? "Choose how to complete the group booking. No money is charged in this flow."
                      : "Choose how to pay. No money is charged in this flow."
                    : group
                      ? "Välj hur du vill slutföra gruppbokningen. Inga pengar dras i det här flödet."
                      : "Välj hur du vill betala. Inga pengar dras i det här flödet."}
                </p>
                <fieldset
                  className="flow-payment-list"
                  aria-label="Välj betalningssätt"
                >
                  {(
                    [
                      "card",
                      "klarna",
                      "swish",
                      "applepay",
                      "googlepay",
                      ...(group ? ["invoice"] : []),
                    ] as PaymentId[]
                  ).map((method) => (
                    <label
                      key={method}
                      className={`flow-payment-choice ${draft.payment === method ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={method}
                        checked={draft.payment === method}
                        onChange={() => {
                          update({ payment: method });
                          setMockApproval(false);
                        }}
                      />
                      <span className="flow-payment-label">
                        {
                          {
                            card: "Betalkort",
                            klarna: "Klarna",
                            swish: "Swish",
                            applepay: "Apple Pay",
                            googlepay: "Google Pay",
                            invoice: "Faktura",
                          }[method]
                        }
                      </span>
                      <span className="flow-payment-brands" aria-hidden="true">
                        {method === "card" && (
                          <>
                            <span className="flow-payment-brand">
                              <Brand icon={siVisa} color="#1434CB" size={29} />
                            </span>
                            <span className="flow-payment-brand">
                              <Brand
                                icon={siMastercard}
                                color="#EB001B"
                                size={27}
                              />
                            </span>
                            <span className="flow-payment-brand">
                              <Brand
                                icon={siAmericanexpress}
                                color="#006FCF"
                                size={25}
                              />
                            </span>
                            <span className="flow-payment-brand">
                              <Brand icon={siJcb} color="#1D5A97" size={26} />
                            </span>
                          </>
                        )}
                        {method === "klarna" && (
                          <span className="flow-payment-brand klarna">
                            <Brand icon={siKlarna} color="#111" size={31} />
                          </span>
                        )}
                        {method === "swish" && (
                          <span className="flow-payment-wordmark swish">
                            swish
                          </span>
                        )}
                        {method === "applepay" && (
                          <span className="flow-payment-brand wallet">
                            <Brand icon={siApplepay} color="#111" size={38} />
                          </span>
                        )}
                        {method === "googlepay" && (
                          <span className="flow-payment-brand wallet">
                            <Brand
                              icon={siGooglepay}
                              color="#4285F4"
                              size={38}
                            />
                          </span>
                        )}
                        {method === "invoice" && (
                          <span className="flow-payment-wordmark invoice">
                            Fakturaunderlag
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </fieldset>
              </>
            )}
            {draft.step === 11 && (
              <div className="flow-verification">
                <div className="flow-verification-heading">
                  <h3>
                    {draft.payment === "card"
                      ? "Ange testkort"
                      : draft.payment === "invoice"
                        ? "Signera fakturaunderlaget"
                        : "Godkänn betalningen"}
                  </h3>
                  <p>
                    Detta är ett demomoment. Inga pengar dras och ingen extern
                    betaltjänst kontaktas.
                  </p>
                </div>
                <div className="flow-verification-total">
                  <span>
                    {draft.editBookingId
                      ? total >= (draft.editOriginalTotal ?? 0) ? "Ändring att godkänna" : "Minskning att godkänna"
                      : draft.payment === "invoice"
                      ? "Fakturaunderlag för"
                      : "Att betala"}
                  </span>
                  <strong>{money(draft.editBookingId ? Math.abs(total - (draft.editOriginalTotal ?? 0)) : total)}</strong>
                </div>
                {draft.editBookingId && <p className="flow-muted">Tidigare total {money(draft.editOriginalTotal ?? 0)} · nytt totalpris {money(total)}. Betalningen eller fakturan justeras i denna simulering.</p>}
                {draft.payment === "card" ? (
                  <>
                    <p className="flow-test-card-hint">
                      Använd endast testkortet: <strong>4242 4242 4242 4242</strong>
                      {" · "}giltigt till <strong>12/29</strong>{" · "}CVC <strong>123</strong>.
                    </p>
                    <div className="flow-fields flow-verification-fields">
                      <label className="flow-verification-wide">
                        Namn på kortet
                        <input
                          type="text"
                          autoComplete="off"
                          value={testCard.holder}
                          onChange={(event) =>
                            setTestCard({ ...testCard, holder: event.target.value })
                          }
                        />
                      </label>
                      <label className="flow-verification-wide">
                        Testkortsnummer
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={19}
                          placeholder="4242 4242 4242 4242"
                          value={testCard.number}
                          onChange={(event) =>
                            setTestCard({ ...testCard, number: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Giltigt till
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={5}
                          placeholder="12/29"
                          value={testCard.expiry}
                          onChange={(event) =>
                            setTestCard({ ...testCard, expiry: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        CVC
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={3}
                          placeholder="123"
                          value={testCard.cvc}
                          onChange={(event) =>
                            setTestCard({ ...testCard, cvc: event.target.value })
                          }
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="flow-mock-signature">
                    <div className="flow-mock-signature-icon">
                      <Check size={24} />
                    </div>
                    <div>
                      <strong>
                        {draft.payment === "invoice"
                          ? "Godkänn som kontaktperson"
                          : draft.payment === "swish"
                            ? "Simulera signering med BankID"
                            : draft.payment === "klarna"
                              ? "Simulera godkännande hos Klarna"
                              : draft.payment === "applepay"
                                ? "Simulera godkännande med Apple Pay"
                                : "Simulera godkännande med Google Pay"}
                      </strong>
                      <p>
                        {draft.name || draft.contact.contactPerson || "Kontaktpersonen"}
                        {draft.payment === "invoice" && draft.org
                          ? ` · ${draft.org}`
                          : ""}
                      </p>
                    </div>
                    <label className="flow-mock-approval">
                      <input
                        type="checkbox"
                        checked={mockApproval}
                        onChange={(event) => setMockApproval(event.target.checked)}
                      />
                      Jag godkänner den simulerade signeringen.
                    </label>
                  </div>
                )}
              </div>
            )}
            {error && (
              <div role="alert" className="flow-error">
                {error}
                {group && draft.step === 8 && incompleteCount > 0 && (
                  <button
                    type="button"
                    className="flow-text-button"
                    onClick={() => update({ step: 1 })}
                  >
                    Gå till deltagare
                  </button>
                )}
                {draft.step >= 8 && error === "Fyll i utrustningsuppgifterna för alla som hyr." && (
                  <button type="button" className="flow-text-button" onClick={() => {
                    setOpenAddon(draft.entry === "rental" ? null : "equipment");
                    update({ step: draft.entry === "rental" ? 2 : 3 });
                  }}>
                    Gå till utrustning
                  </button>
                )}
                {quickRebook && draft.step === 8 && (
                  <button
                    type="button"
                    className="flow-text-button"
                    onClick={() => {
                      update({ step: 0, rebookQuick: false });
                    }}
                  >
                    Anpassa bokningen
                  </button>
                )}
                {(draft.step === 3 || draft.step >= 8) && unscheduledOfferings.length > 0 && (
                  <button
                    type="button"
                    className="flow-text-button"
                    onClick={() => {
                      const offering = unscheduledOfferings[0];
                      const mainOffering = offering === "school"
                        ? draft.entry === "school"
                        : draft.entry === "activity";
                      if (!mainOffering) setOpenAddon(offering === "school" ? "school" : "activities");
                      update({ step: mainOffering ? 2 : 3 });
                    }}
                  >
                    Gå till dagar och tider
                  </button>
                )}
              </div>
            )}
            <div className="flow-actions">
              {stepPosition > 0 && (
                <button
                  type="button"
                  className="flow-back"
                  onClick={() => {
                    if (draft.step === 3 && openAddon) setOpenAddon(null);
                    else update({ step: previousStep });
                    setError("");
                  }}
                >
                  <ArrowLeft size={17} /> Tillbaka
                </button>
              )}
              <button type="button" className="flow-primary" onClick={draft.step === 3 && openAddon ? finishAddon : next}>
                {draft.step === 11
                  ? group && draft.payment === "invoice"
                    ? "Signera & skapa fakturaunderlag"
                    : draft.payment === "card"
                      ? "Simulera kortbetalning"
                      : "Simulera signering & slutför"
                  : draft.step === 9
                    ? "Fortsätt till bekräftelse"
                  : draft.step === 8
                    ? "Godkänn och välj betalning"
                    : draft.step === 3
                      ? openAddon ? language === "en" ? "Done, back to add-ons" : "Klart, tillbaka till tillägg" : "Fortsätt till uppgifter"
                      : draft.step === 2
                        ? "Se tillägg"
                    : "Fortsätt"}
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        </div>
        <aside className="flow-summary">
          <h3>
            {draft.start} – {draft.end}
          </h3>
          <p>
            {guests} {guests === 1 ? "person" : "personer"} · {days}{" "}
            {days === 1 ? "dag" : "dagar"}
            {selectedCabin
              ? ` · ${Math.max(1, nights)} ${Math.max(1, nights) === 1 ? "natt" : "nätter"}`
              : ""}
          </p>
          <div className="flow-summary-items">
            {itemized.length ? (
              itemized.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{money(item.value)}</strong>
                </div>
              ))
            ) : (
              <p>Gör dina val för att se priset.</p>
            )}
          </div>
          <div className="flow-summary-total">
            <span>Totalt</span>
            <strong>{money(total)}</strong>
          </div>
          {group && (
            <small>
              Lärare är kostnadsfria för aktiviteter. Boende beräknas för hela
              gruppen.
            </small>
          )}
        </aside>
      </div>
      <button
        type="button"
        className="auto-fill-button"
        onClick={autoFillStep}
        title="Fyll i exempeluppgifter för detta steg"
        aria-label="Fyll i exempeluppgifter för detta steg"
      >
        <WandSparkles size={19} />
      </button>
    </main>
  );
}
