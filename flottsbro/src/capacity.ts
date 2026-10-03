import type { FlowDraft } from "./booking-flow";

export type CapacityRecord = {
  id: string;
  status: string;
  flowSnapshot?: FlowDraft;
};

export const cabinStock = { forest: 8, family: 6, view: 4 } as const;
export const equipmentStock = { ski: 120, snowboard: 30, bike: 80 } as const;
export const passStock = { winter: 200, summer: 160 } as const;
export type EquipmentKind = keyof typeof equipmentStock;

const otherDrafts = (bookings: CapacityRecord[], ignoreId?: string) =>
  bookings
    .filter((booking) => booking.id !== ignoreId && booking.status !== "Avbokad")
    .flatMap((booking) => booking.flowSnapshot ? [booking.flowSnapshot] : []);

const partySize = (draft: FlowDraft) =>
  draft.entry === "group" ? draft.groupCount : draft.adults + draft.children;
export const passDemand = (draft: FlowDraft) => draft.pass === "none" ? 0 : partySize(draft);
export const passUnitsLeft = (
  bookings: CapacityRecord[],
  season: FlowDraft["season"],
  date: string,
  ignoreId?: string,
) => passStock[season] - otherDrafts(bookings, ignoreId)
  .filter((draft) => draft.season === season && draft.start <= date && date <= draft.end)
  .reduce((used, draft) => used + passDemand(draft), 0);

export const cabinUnitsNeeded = (draft: FlowDraft, beds: number) =>
  Math.ceil(partySize(draft) / beds);

export const cabinUnitsLeft = (
  bookings: CapacityRecord[],
  cabin: keyof typeof cabinStock,
  beds: number,
  start: string,
  end: string,
  ignoreId?: string,
) => {
  if (end <= start) return cabinStock[cabin];
  const others = otherDrafts(bookings, ignoreId).filter((draft) => draft.cabin === cabin);
  const startTime = new Date(`${start}T12:00:00Z`).getTime();
  const endTime = new Date(`${end}T12:00:00Z`).getTime();
  let fewest: number = cabinStock[cabin];
  for (let day = startTime; day < endTime; day += 86400000) {
    const date = new Date(day).toISOString().slice(0, 10);
    const used = others.filter((draft) => draft.start <= date && date < draft.end)
      .reduce((sum, draft) => sum + cabinUnitsNeeded(draft, beds), 0);
    fewest = Math.min(fewest, cabinStock[cabin] - used);
  }
  return fewest;
};

export const sessionCapacity = (offering: string, lesson?: FlowDraft["schoolLesson"]) =>
  offering === "school" ? (lesson === "private" ? 1 : 8) : 12;

export const sessionSeatsLeft = (
  bookings: CapacityRecord[],
  offering: string,
  date: string,
  time: string,
  lesson?: FlowDraft["schoolLesson"],
  ignoreId?: string,
) => sessionCapacity(offering, lesson) - otherDrafts(bookings, ignoreId)
  .reduce((used, draft) => used + Object.values(
    draft.sessionAssignments?.[`${offering}:${date}`] ?? {},
  ).filter((slot) => slot === time).length, 0);

export const equipmentKind = (activity: string | undefined, season: FlowDraft["season"]): EquipmentKind =>
  activity === "Snowboard" ? "snowboard" : activity === "Cykling" || season === "summer" ? "bike" : "ski";

export const equipmentDemand = (draft: FlowDraft, kind: EquipmentKind) => {
  if (draft.entry === "group") return draft.participants.slice(0, draft.groupCount)
    .filter((person) => person.equipment === "borrow" && equipmentKind(person.activity, draft.season) === kind).length;
  return (draft.borrowGuests ?? [])
    .filter((index) => index < partySize(draft) && equipmentKind(draft.rentalDetails[index]?.activity, draft.season) === kind).length;
};

export const equipmentUnitsLeft = (
  bookings: CapacityRecord[],
  kind: EquipmentKind,
  date: string,
  ignoreId?: string,
) => equipmentStock[kind] - otherDrafts(bookings, ignoreId)
  .filter((draft) => draft.start <= date && date <= draft.end)
  .reduce((used, draft) => used + equipmentDemand(draft, kind), 0);

export const capacityIssues = (
  draft: FlowDraft,
  bookings: CapacityRecord[],
  cabinBeds: Record<string, number>,
  ignoreId?: string,
) => {
  const issues: string[] = [];
  if (draft.cabin !== "none" && draft.end > draft.start) {
    const left = cabinUnitsLeft(bookings, draft.cabin, cabinBeds[draft.cabin], draft.start, draft.end, ignoreId);
    if (cabinUnitsNeeded(draft, cabinBeds[draft.cabin]) > left)
      issues.push("Det valda boendet har inte tillräckligt många lediga stugor för perioden.");
  }
  const start = new Date(`${draft.start}T12:00:00Z`).getTime();
  const end = new Date(`${draft.end}T12:00:00Z`).getTime();
  for (let day = start; day <= end; day += 86400000) {
    const date = new Date(day).toISOString().slice(0, 10);
    if (passDemand(draft) > passUnitsLeft(bookings, draft.season, date, ignoreId))
      issues.push(`Det finns inte tillräckligt många lediga pass den ${date}.`);
    for (const kind of Object.keys(equipmentStock) as EquipmentKind[]) {
      if (equipmentDemand(draft, kind) > equipmentUnitsLeft(bookings, kind, date, ignoreId))
        issues.push(`Det finns inte tillräckligt med ${kind === "bike" ? "cyklar" : kind === "snowboard" ? "snowboardutrustning" : "skidutrustning"} den ${date}.`);
    }
    for (const [key, assignments] of Object.entries(draft.sessionAssignments ?? {})) {
      if (!key.endsWith(date)) continue;
      const offering = key.slice(0, -(date.length + 1));
      for (const time of new Set(Object.values(assignments))) {
        if (!time) continue;
        const chosen = Object.values(assignments).filter((value) => value === time).length;
        if (chosen > sessionSeatsLeft(bookings, offering, date, time, draft.schoolLesson, ignoreId))
          issues.push(`Passet ${date} kl ${time} har inte tillräckligt många lediga platser.`);
      }
    }
  }
  return [...new Set(issues)];
};
