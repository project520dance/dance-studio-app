const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function dateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dateTimeParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function validateTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
  } catch {
    throw new Error("Season time zone is invalid.");
  }
}

export function validateDate(value: string, label: string) {
  if (!DATE_PATTERN.test(value)) {
    throw new Error(`${label} is invalid.`);
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    throw new Error(`${label} is invalid.`);
  }
}

export function validateTime(value: string, label: string) {
  if (!TIME_PATTERN.test(value)) throw new Error(`${label} is invalid.`);
}

export function todayInTimeZone(timeZone: string) {
  validateTimeZone(timeZone);
  return dateParts(new Date(), timeZone);
}

export function addDays(date: string, days: number) {
  validateDate(date, "Date");
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function dayOfWeek(date: string) {
  validateDate(date, "Date");
  return [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][new Date(`${date}T00:00:00Z`).getUTCDay()];
}

export function localDateTimeToDate(date: string, time: string, timeZone: string) {
  validateDate(date, "Occurrence date");
  validateTime(time, "Occurrence time");
  validateTimeZone(timeZone);

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute);
  let result = new Date(desiredUtc);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const actual = dateTimeParts(result, timeZone);
    const [actualDate, actualTime] = actual.split("T");
    const [actualYear, actualMonth, actualDay] = actualDate.split("-").map(Number);
    const [actualHour, actualMinute] = actualTime.split(":").map(Number);
    const actualUtc = Date.UTC(
      actualYear,
      actualMonth - 1,
      actualDay,
      actualHour,
      actualMinute,
    );
    result = new Date(result.getTime() + desiredUtc - actualUtc);
  }

  const expected = `${date}T${time}`;
  const matchingInstants: Date[] = [];
  for (let minutes = -180; minutes <= 180; minutes += 15) {
    const candidate = new Date(result.getTime() + minutes * 60_000);
    if (dateTimeParts(candidate, timeZone) === expected) matchingInstants.push(candidate);
  }

  if (matchingInstants.length === 0) {
    throw new Error(`${expected} does not exist in ${timeZone}.`);
  }

  return matchingInstants.sort((a, b) => a.getTime() - b.getTime())[0];
}
