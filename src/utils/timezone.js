const TOKYO_TIME_ZONE = 'Asia/Tokyo';

const TOKYO_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: TOKYO_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const TOKYO_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: TOKYO_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatTokyoDateTime(value, fallback = '-') {
  if (!value) return fallback;
  if (typeof value === 'string' && !hasExplicitTimeZone(value)) {
    const normalized = value.replace('T', ' ').trim();
    return normalized.length > 19 ? normalized.slice(0, 19) : normalized;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return formatParts(TOKYO_DATE_TIME_FORMATTER.formatToParts(date), true);
}

export function formatTokyoDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return formatParts(TOKYO_DATE_FORMATTER.formatToParts(date), false);
}

export function formatTokyoDateStart(value = new Date()) {
  const date = formatTokyoDate(value);
  return date ? `${date} 00:00:00` : '';
}

function hasExplicitTimeZone(value) {
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(String(value).trim());
}

function formatParts(parts, includeTime) {
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = `${values.year}-${values.month}-${values.day}`;
  if (!includeTime) return date;
  return `${date} ${values.hour}:${values.minute}:${values.second}`;
}
