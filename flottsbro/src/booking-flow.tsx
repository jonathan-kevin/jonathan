import { type CSSProperties, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Plus,
  Search,
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
  activity: "Skidåkning" | "Snowboard" | "Cykling";
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
  flowVersion?: 3 | 4 | 5;
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
  { name: string; season: FlowSeason; price: number; detail: string }
> = {
  snowshoe: {
    name: "Snöskovandring",
    season: "winter",
    price: 149,
    detail: "Guidad tur · från 8 år",
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
const sessionCapacity = (offering: string, lesson?: SchoolLesson) =>
  offering === "school" ? (lesson === "private" ? 1 : 8) : 12;
const dateText = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("sv-SE", {
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
export const createFlowDraft = (
  entry: FlowEntry,
  season: FlowSeason,
): FlowDraft => {
  const start = season === "winter" ? "2027-02-10" : "2027-07-12";
  return {
    flowVersion: 5,
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
}: {
  start: string;
  end: string;
  onChange: (from: string, to: string) => void;
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
    new Date(`${value}T12:00:00Z`).toLocaleDateString("sv-SE", {
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
          {first.toLocaleDateString("sv-SE", {
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
        {["Må", "Ti", "On", "To", "Fr", "Lö", "Sö"].map((day) => (
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
  initial,
  onDraft,
  onComplete,
  onUpdate,
  onFinish,
  onHome,
  onChangeAccount,
}: {
  entry: FlowEntry;
  season: FlowSeason;
  initial?: FlowDraft;
  onDraft: (draft: FlowDraft) => void;
  onComplete: (booking: FlowBooking) => void;
  onUpdate: (id: string, booking: FlowBooking) => void;
  onFinish: () => void;
  onHome: () => void;
  onChangeAccount: (draft: FlowDraft) => void;
}) {
  const [draft, setDraft] = useState<FlowDraft>(() => {
    if (!initial) return createFlowDraft(entry, season);
    const savedDraft: FlowDraft & { meal?: unknown; mealDays?: unknown } = {
      ...initial,
    };
    delete savedDraft.meal;
    delete savedDraft.mealDays;
    const previousStep =
      initial.flowVersion === 5 || initial.flowVersion === 4
        ? initial.step
        : initial.flowVersion === 3
          ? ([0, 2, 3, 4, 1, 5, 6, 7, 8][initial.step] ?? 0)
          : ([0, 2, 3, 1, 5, 6, 7, 8][initial.step] ?? 0);
    const migratedStep =
      initial.flowVersion === 5
        ? previousStep
        : previousStep >= 5
          ? previousStep + 1
          : previousStep;
    const activeStep =
      migratedStep === 6
        ? 7
        : initial.entry === "activity" && migratedStep === 4
          ? 3
          : initial.entry === "school" && migratedStep === 5
            ? 4
            : migratedStep;
    return {
      ...savedDraft,
      flowVersion: 5,
      step: activeStep,
    };
  });
  const [active, setActive] = useState(Boolean(initial));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState(false);
  const [visibleParticipants, setVisibleParticipants] = useState(12);
  const [participantSearch, setParticipantSearch] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [newPersonIndex, setNewPersonIndex] = useState<number | null>(null);
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
  const extraPassStep = ["rental", "school", "activity"].includes(draft.entry);
  const stageLabels: Record<number, string> = {
    0: "Period & sällskap",
    1: "Deltagare",
    2: mainIsCabin
      ? "Boende"
      : draft.entry === "rental"
        ? "Hyra"
        : draft.entry === "school"
          ? draft.season === "winter"
            ? "Skidskola"
            : "Cykelskola"
          : draft.entry === "activity"
            ? "Aktiviteter"
            : draft.season === "winter"
              ? "SkiPass"
              : "Cykelpass",
    3: mainIsCabin
      ? draft.season === "winter"
        ? "SkiPass"
        : "Cykelpass"
      : "Boende",
    4: "Aktiviteter",
    5: draft.season === "winter" ? "Skidskola" : "Cykelskola",
    7: "Uppgifter",
    8: "Granska",
    9: "Betala",
    10: draft.season === "winter" ? "SkiPass" : "Cykelpass",
  };
  // Keep saved step IDs stable while placing the optional pass after lodging.
  const visibleSteps = [
    0,
    1,
    2,
    3,
    ...(extraPassStep ? [10] : []),
    4,
    5,
    7,
    8,
    9,
  ].filter(
    (index) =>
      !(draft.entry === "activity" && index === 4) &&
      !(draft.entry === "school" && index === 5),
  );
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
          (_, index) => draft.guests[index] ?? "",
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
  const setCabin = (cabin: CabinId) =>
    update({
      cabin,
      end:
        cabin !== "none" && nights === 0
          ? offsetDate(draft.start, 1)
          : draft.end,
    });
  const setPass = (pass: PassId) => update({ pass });
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
      id ?? `${group ? "GR" : "FL"}-${Math.floor(1000 + Math.random() * 8999)}`,
    kind: group ? "group" : selectedCabin ? "stay" : "day",
    sourceEntry: draft.entry,
    status,
    payment:
      status === "Preliminär"
        ? "Faktura väntar"
        : draft.payment === "invoice"
          ? "Fakturaunderlag skapat"
          : `Betalsätt valt · ${{ swish: "Swish", card: "kort", applepay: "Apple Pay", googlepay: "Google Pay", klarna: "Klarna", invoice: "faktura" }[draft.payment ?? "card"]}`,
    name: group ? draft.org : draft.name,
    email: draft.email,
    contact: draft.contact,
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
            `${draft.pass === "bike" ? "Cykelpass" : draft.pass === "three" ? "SkiPass 3 timmar" : "SkiPass heldag"} · ${days} dagar · ${money(passTotal)}`,
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
            `Utrustningshyra · ${borrowCount} ${borrowCount === 1 ? "person" : "personer"} · ${money(equipmentTotal)}`,
          ]
        : []),
      ...(group ? [`${students} elever · ${teachers} lärare`] : []),
    ],
    details: `${draft.start}–${draft.end} · ${guests} ${guests === 1 ? "person" : "personer"}`,
    history: [
      `${status === "Preliminär" ? "Preliminär bokning" : "Bokning"} skapad ${new Date().toISOString().slice(0, 10)}`,
    ],
  });
  useEffect(() => {
    if (active && !done) onDraft({ ...draft, total });
  }, [active, done, draft, total]);
  useEffect(() => {
    if (group && draft.draftBookingId && !done)
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
      draft.step === 1 &&
      !group &&
      (draft.borrowGuests ?? []).some(
        (index) =>
          index < guests &&
          (!draft.rentalDetails?.[index]?.activity ||
            !draft.rentalDetails[index].height ||
            (draft.season === "winter" &&
              (!draft.rentalDetails[index].shoe ||
                !draft.rentalDetails[index].weight))),
      )
    ) {
      setError("Fyll i utrustningsuppgifterna för alla som lånar.");
      return;
    }
    if (draft.step === 1 && draft.entry === "rental" && borrowCount === 0) {
      setError("Markera minst en person som ska hyra utrustning.");
      return;
    }
    if (draft.step === 2 && mainIsCabin && draft.cabin === "none") {
      setError("Välj ett boende för att fortsätta.");
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
    if (
      (draft.step === 2 ||
        draft.step === 4 ||
        draft.step === 5 ||
        draft.step === 8 ||
        draft.step === 9) &&
      unscheduledOfferings.length > 0
    ) {
      setError(
        "Välj minst en deltagare, dag och ledig tid för varje vald lektion eller aktivitet.",
      );
      return;
    }
    if (draft.step === 7) {
      if (
        !draft.name.trim() ||
        !/^\S+@\S+\.\S+$/.test(draft.email) ||
        !/^\d{3}\s?\d{2}$/.test(draft.contact.postalCode) ||
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
      const final = booking("Bekräftad", draft.draftBookingId);
      if (draft.draftBookingId) onUpdate(draft.draftBookingId, final);
      else onComplete(final);
      onFinish();
      setDone(true);
      return;
    }
    if (draft.step === 0 && group && !draft.draftBookingId) {
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
      Boolean(person.birthDate && person.birthDate < draft.start)) &&
    (person.equipment === "own" ||
      Boolean(
        person.activity && person.shoe && person.height && person.weight,
      ));
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
          activity: draft.season === "winter" ? "Skidåkning" : "Cykling",
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
          activity:
            activity || (draft.season === "winter" ? "Skidåkning" : "Cykling"),
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
      participants: group
        ? Array.from({ length: draft.groupCount }, (_, i) => ({
            name: names[i % names.length],
            role: i === 0 ? "teacher" : null,
            birthDate: i === 0 ? "1986-04-18" : "2012-05-14",
            activity: draft.pass === "bike" ? "Cykling" : "Skidåkning",
            equipment: i < draft.borrowCount && i !== 0 ? "borrow" : "own",
            shoe: "38",
            height: "155",
            weight: "48",
          }))
        : draft.participants,
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
              Array.from(
                { length: Math.min(guests, times.length * capacity) },
                (_, index) => [index, times[Math.floor(index / capacity)]],
              ),
            ),
          ];
        }),
      ),
    );
  const autoFillStep = () => {
    if (draft.step === 0) {
      if (group) update({ org: "Björkängsskolan", groupCount: 24 });
      else if (draft.entry === "school")
        update({ adults: 0, children: 2, childAges: [8, 10] });
      else update({ adults: 2, children: 1, childAges: [8] });
    } else if (draft.step === 1) {
      fillExampleParticipants();
    } else if (draft.step === 2) {
      if (mainIsCabin) setCabin("family");
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
      } else if (draft.entry === "rental") update({ borrowGuests: [0] });
      else setPass(draft.season === "winter" ? "full" : "bike");
    } else if (draft.step === 3) {
      if (mainIsCabin) setPass(draft.season === "winter" ? "full" : "bike");
      else setCabin("forest");
    } else if (draft.step === 10) {
      setPass(draft.season === "winter" ? "full" : "bike");
    } else if (draft.step === 4) {
      const id: ActivityId = draft.season === "winter" ? "snowshoe" : "canoe";
      const selected = [...new Set([...draft.activities, id])];
      update({
        activities: selected,
        sessionAssignments: {
          ...draft.sessionAssignments,
          ...exampleSessionAssignments(selected),
        },
      });
    } else if (draft.step === 5)
      update({
        schoolLesson: "group",
        schoolLevel: "beginner",
        sessionAssignments: {
          ...draft.sessionAssignments,
          ...exampleSessionAssignments(["school"], "group"),
        },
      });
    else if (draft.step === 7) fillExampleContact();
    else if (draft.step === 8) update({ terms: true });
    else if (draft.step === 9) update({ payment: group ? "invoice" : "card" });
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
          {draft.cabin === "none" && <Check size={19} />}
        </button>
      )}
      {(
        Object.entries(cabins) as [
          Exclude<CabinId, "none">,
          typeof cabins.forest,
        ][]
      ).map(([id, cabin]) => (
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
            onClick={() => setCabin(id)}
          >
            <span className="flow-lodging-info">
              <strong>{cabin.name}</strong>
              <small>{cabin.detail}</small>
              <span className="flow-lodging-meta">
                <span>{cabin.beds} bäddar</span>
                <span>Tillgänglig för din period</span>
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
      ))}
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
          {draft.pass === "none" && <Check size={19} />}
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
          </span>
          <span className="flow-option-price">
            <strong>
              {money(pass === "bike" ? 300 : pass === "three" ? 240 : 370)}
            </strong>
            <small>från / vuxen / dag</small>
          </span>
          {draft.pass === pass && <Check size={19} />}
        </button>
      ))}
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
    const capacity = sessionCapacity(offering, draft.schoolLesson);
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
                <strong>{dateText(date)}</strong>
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
                      {Math.max(0, capacity - used(time))} platser kvar
                    </span>
                  ))}
                </div>
                <div className="flow-session-actions">
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...assignments };
                      for (let index = 0; index < guests; index++) {
                        if (times.includes(next[index])) continue;
                        const available = times.find(
                          (time) =>
                            Object.entries(next).filter(
                              ([person, value]) =>
                                Number(person) < guests && value === time,
                            ).length < capacity,
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
                  {Array.from({ length: guests }, (_, index) => (
                    <label key={index}>
                      <span>
                        <strong>{participantLabel(index)}</strong>
                        {group &&
                          draft.participants[index]?.role === "teacher" && (
                            <small>Lärare · gratis</small>
                          )}
                      </span>
                      <select
                        aria-label={`${participantLabel(index)}, ${dateText(date)}`}
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
                          const remaining = Math.max(0, capacity - used(time));
                          return (
                            <option
                              key={time}
                              value={time}
                              disabled={
                                remaining === 0 && assignments[index] !== time
                              }
                            >
                              kl {time} · {remaining} kvar
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  ))}
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
            {(!draft.schoolLesson || draft.schoolLesson === "none") && (
              <Check size={19} />
            )}
          </button>
        )}
        {(["group", "private"] as SchoolLesson[]).map((lesson) => (
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
            </span>
            <span className="flow-option-price">
              <strong>{money(lesson === "group" ? 495 : 895)}</strong>
              <small>per person / pass</small>
            </span>
            {draft.schoolLesson === lesson && <Check size={19} />}
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
              </span>
              <span className="flow-option-price">
                <strong>{money(activities[id].price)}</strong>
                <small>per person / pass</small>
              </span>
              {draft.activities.includes(id) && <Check size={19} />}
            </button>
          ))}
      </div>
      {draft.activities.map((id) => sessionPlanner(id, activities[id].name))}
    </>
  );
  const itemized = [
    draft.pass !== "none" && {
      label: draft.pass === "bike" ? "Cykelpass" : "SkiPass",
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
      label: `Utrustning · ${borrowCount} ${borrowCount === 1 ? "person" : "personer"}`,
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
              : "Bokningen är klar"}
          </h1>
          <p>
            Bokningen är sparad. Du hittar den och
            {group ? " deltagarlistan" : " dina uppgifter"} under Mina
            bokningar.
          </p>
          <button className="flow-primary" onClick={onHome}>
            Till startsidan <ArrowRight size={17} />
          </button>
        </div>
      </main>
    );
  return (
    <main className="flow-shell">
      <div className="flow-intro">
        <span className="eyebrow">BOKA FLOTTSBRO</span>
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
            onClick={() => position < stepPosition && update({ step })}
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
              <span className="flow-kicker">
                STEG {stepPosition + 1} AV {visibleSteps.length}
              </span>
              <h2>{stageLabels[draft.step]}</h2>
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
                      födelsedatum. Utrustningsmått krävs bara för den som
                      lånar. Du kan fortsätta med en ofullständig lista och
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
                            <th scope="col">Aktivitet</th>
                            <th scope="col">Låna</th>
                            <th scope="col">Skostorlek</th>
                            <th scope="col">Längd (cm)</th>
                            <th scope="col">Vikt (kg)</th>
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
                                  {person.equipment === "borrow" ? (
                                    <select
                                      value={person.activity}
                                      onChange={(event) =>
                                        participantChange(index, {
                                          activity: event.target.value,
                                        })
                                      }
                                      aria-label={`Aktivitet för deltagare ${index + 1}`}
                                    >
                                      {draft.season === "winter" ? (
                                        <>
                                          <option value="Skidåkning">
                                            Skidor
                                          </option>
                                          <option value="Snowboard">
                                            Snowboard
                                          </option>
                                        </>
                                      ) : (
                                        <option value="Cykling">Cykel</option>
                                      )}
                                    </select>
                                  ) : (
                                    <span className="flow-people-na">–</span>
                                  )}
                                </td>
                                <td className="flow-people-loan-cell">
                                  <input
                                    type="checkbox"
                                    checked={person.equipment === "borrow"}
                                    onChange={(event) =>
                                      participantChange(index, {
                                        equipment: event.target.checked
                                          ? "borrow"
                                          : "own",
                                      })
                                    }
                                    aria-label={`Låna utrustning för ${person.name || `deltagare ${index + 1}`}`}
                                  />
                                </td>
                                {(["shoe", "height", "weight"] as const).map(
                                  (field) => (
                                    <td key={field}>
                                      <input
                                        value={
                                          person.equipment === "borrow"
                                            ? person[field]
                                            : ""
                                        }
                                        disabled={person.equipment !== "borrow"}
                                        onChange={(event) =>
                                          participantChange(index, {
                                            [field]: event.target.value,
                                          })
                                        }
                                        inputMode="numeric"
                                        aria-label={`${field === "shoe" ? "Skostorlek" : field === "height" ? "Längd i centimeter" : "Vikt i kilogram"} för deltagare ${index + 1}`}
                                      />
                                    </td>
                                  ),
                                )}
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
                              <td colSpan={11} className="flow-people-empty">
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
                        className="flow-text-button"
                        onClick={() =>
                          setVisibleParticipants(filteredParticipants.length)
                        }
                      >
                        Visa fler deltagare (
                        {filteredParticipants.length - visibleParticipants})
                      </button>
                    )}
                    <p className="flow-hint">
                      Din preliminära bokning sparas automatiskt. Du kan
                      fortsätta med deltagarlistan senare.
                    </p>
                    <button
                      type="button"
                      className="flow-text-button"
                      onClick={onHome}
                    >
                      Spara och fortsätt senare
                    </button>
                  </>
                ) : (
                  <>
                    <p className="flow-muted">
                      Ange namn och utrustningsbehov för varje person. Barn
                      behöver också födelsedatum. Utrustningsuppgifter visas
                      bara när du markerar lån.
                    </p>
                    {Array.from({ length: guests }, (_, i) => {
                      const isChild = i >= draft.adults;
                      const childIndex = i - draft.adults;
                      const borrows = (draft.borrowGuests ?? []).includes(i);
                      const details = draft.rentalDetails?.[i] ?? {
                        activity:
                          draft.season === "winter" ? "Skidåkning" : "Cykling",
                        shoe: "",
                        height: "",
                        weight: "",
                      };
                      const changeDetail = (
                        field: keyof RentalDetails,
                        value: string,
                      ) =>
                        update({
                          rentalDetails: {
                            ...draft.rentalDetails,
                            [i]: { ...details, [field]: value },
                          },
                        });
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
                          <label className="flow-guest-borrow">
                            <input
                              type="checkbox"
                              checked={borrows}
                              onChange={(event) =>
                                update({
                                  borrowGuests: event.target.checked
                                    ? [...(draft.borrowGuests ?? []), i]
                                    : (draft.borrowGuests ?? []).filter(
                                        (index) => index !== i,
                                      ),
                                })
                              }
                            />
                            <span>Låna utrustning</span>
                            {(borrows || draft.entry === "rental") && (
                              <small>
                                {borrows
                                  ? `${money(equipmentUnit)} per dag`
                                  : "Ingen hyra för den här personen"}
                              </small>
                            )}
                          </label>
                          {borrows && (
                            <div className="flow-fields flow-guest-gear">
                              {draft.season === "winter" && (
                                <label>
                                  Utrustning
                                  <select
                                    value={details.activity}
                                    onChange={(event) =>
                                      changeDetail(
                                        "activity",
                                        event.target.value,
                                      )
                                    }
                                  >
                                    <option value="Skidåkning">Skidor</option>
                                    <option value="Snowboard">Snowboard</option>
                                  </select>
                                </label>
                              )}
                              <label>
                                Längd (cm)
                                <input
                                  inputMode="numeric"
                                  value={details.height}
                                  onChange={(event) =>
                                    changeDetail("height", event.target.value)
                                  }
                                />
                              </label>
                              {draft.season === "winter" && (
                                <>
                                  <label>
                                    Skostorlek
                                    <input
                                      inputMode="numeric"
                                      value={details.shoe}
                                      onChange={(event) =>
                                        changeDetail("shoe", event.target.value)
                                      }
                                    />
                                  </label>
                                  <label>
                                    Vikt (kg)
                                    <input
                                      inputMode="numeric"
                                      value={details.weight}
                                      onChange={(event) =>
                                        changeDetail(
                                          "weight",
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </label>
                                </>
                              )}
                            </div>
                          )}
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
                      ? "Din utrustning baseras på deltagarnas val. Kontrollera hyran här innan du fortsätter."
                      : draft.entry === "school"
                        ? "Välj lektion och nivå. Boka sedan dag och ledig tid för varje deltagare."
                        : draft.entry === "activity"
                          ? "Välj aktiviteter och boka dag och ledig tid för deltagarna."
                          : "Välj ditt huvudpass. Du kan komplettera med boende och aktiviteter i de följande stegen."}
                </p>
                {mainIsCabin ? (
                  cabinCards(false)
                ) : draft.entry === "rental" ? (
                  <div className="flow-rental-main">
                    <strong>
                      {borrowCount}{" "}
                      {borrowCount === 1 ? "person hyr" : "personer hyr"}{" "}
                      {draft.season === "winter"
                        ? "skidor eller snowboard"
                        : "cykel"}
                    </strong>
                    <span>
                      {money(equipmentTotal)} för perioden ·{" "}
                      {money(equipmentUnit)} per person och dag
                    </span>
                    <button
                      type="button"
                      className="flow-text-button"
                      onClick={() => update({ step: 1 })}
                    >
                      Ändra deltagare och utrustning
                    </button>
                  </div>
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
                <p className="flow-muted">
                  {mainIsCabin
                    ? "Vill du lägga till ett pass för vistelsen? Du kan också fortsätta utan pass."
                    : "Vill du lägga till boende för vistelsen? Du kan också fortsätta utan boende."}
                </p>
                {mainIsCabin ? (
                  passCards(true)
                ) : (
                  cabinCards(true)
                )}
              </>
            )}
            {draft.step === 10 && (
              <>
                <p className="flow-muted">
                  Vill du lägga till {draft.season === "winter" ? "SkiPass" : "cykelpass"}?
                  Du kan också fortsätta utan pass.
                </p>
                {passCards(true)}
              </>
            )}
            {draft.step === 4 && (
              <>
                <p className="flow-muted">
                  Välj aktiviteter för sällskapet. För varje aktivitet väljer
                  du sedan dag, ledig tid och vilka personer som deltar.
                </p>
                {activityCards()}
              </>
            )}
            {draft.step === 5 && (
              <>
                <p className="flow-muted">
                  Vill du lägga till {draft.season === "winter" ? "skidskola" : "cykelskola"}?
                  Välj lektion och boka dag, tid och deltagare, eller fortsätt
                  utan lektion.
                </p>
                {schoolCards(true)}
              </>
            )}
            {draft.step === 7 && (
              <>
                <div className="flow-subhead">
                  <h3>Kontaktperson</h3>
                  <button
                    type="button"
                    className="flow-example"
                    onClick={fillExampleContact}
                  >
                    <WandSparkles size={15} /> Fyll i exempeluppgifter
                  </button>
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
                              {row.label} · {dateText(row.date)} kl {row.time}
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
                      {draft.contact.street}, {draft.contact.postalCode}{" "}
                      {draft.contact.city}
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
                  Välj hur du vill{" "}
                  {group ? "slutföra gruppbokningen" : "betala"}. Inga pengar
                  dras i det här flödet.
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
                        onChange={() => update({ payment: method })}
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
                {draft.step >= 8 && unscheduledOfferings.length > 0 && (
                  <button
                    type="button"
                    className="flow-text-button"
                    onClick={() =>
                      update({
                        step:
                          unscheduledOfferings[0] === "school"
                            ? draft.entry === "school"
                              ? 2
                              : 5
                            : draft.entry === "activity"
                              ? 2
                              : 4,
                      })
                    }
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
                    update({ step: previousStep });
                    setError("");
                  }}
                >
                  <ArrowLeft size={17} /> Tillbaka
                </button>
              )}
              <button type="button" className="flow-primary" onClick={next}>
                {draft.step === 9
                  ? group && draft.payment === "invoice"
                    ? "Slutför & skapa fakturaunderlag"
                    : "Bekräfta bokning"
                  : draft.step === 8
                    ? "Godkänn och välj betalning"
                    : "Fortsätt"}
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        </div>
        <aside className="flow-summary">
          <span className="eyebrow">DIN VISTELSE</span>
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
