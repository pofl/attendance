const padTimePart = (value: number): string => value.toString().padStart(2, "0");

export const formatOffsetLabel = (offsetMinutes: number): string => {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `UTC${sign}${padTimePart(hours)}:${padTimePart(minutes)}`;
};

export const formatLocalDateTime = (utcIso: string, offsetMinutes: number): string => {
  const date = new Date(utcIso);
  if (Number.isNaN(date.getTime())) return "-";
  const localMs = date.getTime() + offsetMinutes * 60_000;
  const local = new Date(localMs);
  const year = local.getUTCFullYear();
  const month = padTimePart(local.getUTCMonth() + 1);
  const day = padTimePart(local.getUTCDate());
  const hours = padTimePart(local.getUTCHours());
  const minutes = padTimePart(local.getUTCMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatDateForInput = (utcIso: string, offsetMinutes: number): string => {
  const date = new Date(utcIso);
  if (Number.isNaN(date.getTime())) return "";
  const localMs = date.getTime() + offsetMinutes * 60_000;
  const local = new Date(localMs);
  const year = local.getUTCFullYear();
  const month = padTimePart(local.getUTCMonth() + 1);
  const day = padTimePart(local.getUTCDate());
  const hours = padTimePart(local.getUTCHours());
  const minutes = padTimePart(local.getUTCMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDateTimeWithOffset = (utcIso: string, offsetMinutes: number): string => {
  const local = formatLocalDateTime(utcIso, offsetMinutes);
  const offsetLabel = formatOffsetLabel(offsetMinutes);
  return `${local} (${offsetLabel})`;
};

export const formatDepartureDateTime = (utcIso: string, offsetMinutes: number): string =>
  `🛫 ${formatDateTimeWithOffset(utcIso, offsetMinutes)}`;

export const formatArrivalDateTime = (utcIso: string, offsetMinutes: number): string =>
  `🛬 ${formatDateTimeWithOffset(utcIso, offsetMinutes)}`;
