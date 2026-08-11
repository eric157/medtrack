import type { DoseLog, Medication, TimeOfDay } from '@/lib/types';

export type DoseUiStatus = 'taken' | 'missed' | 'skipped' | 'due' | 'overdue' | 'upcoming';

export interface TimeWindow {
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  label: string;
  timeRange: string;
}

export const TIME_BLOCK_WINDOWS: Record<TimeOfDay, TimeWindow> = {
  morning: { startHour: 7, startMin: 0, endHour: 11, endMin: 0, label: 'Morning', timeRange: '7:00 AM - 11:00 AM' },
  afternoon: { startHour: 12, startMin: 0, endHour: 15, endMin: 0, label: 'Afternoon', timeRange: '12:00 PM - 3:00 PM' },
  evening: { startHour: 17, startMin: 0, endHour: 20, endMin: 0, label: 'Evening', timeRange: '5:00 PM - 8:00 PM' },
  night: { startHour: 21, startMin: 0, endHour: 23, endMin: 0, label: 'Night', timeRange: '9:00 PM - 11:00 PM' },
};

export const TIME_BLOCK_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];

export function getMedtrackTimezone(): string {
  return process.env.NEXT_PUBLIC_MEDTRACK_TIMEZONE || 'America/New_York';
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(p => p.type === type)?.value ?? 0);

  let hour = get('hour');
  if (hour === 24) hour = 0;

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour,
    minute: get('minute'),
  };
}

function toMinutes(hour: number, minute: number): number {
  return hour * 60 + minute;
}

export function getTodayKey(now: Date, timeZone: string): string {
  const { year, month, day } = getZonedParts(now, timeZone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function isLogOnDate(log: Pick<DoseLog, 'logged_at'>, dateKey: string, timeZone: string): boolean {
  return getTodayKey(new Date(log.logged_at), timeZone) === dateKey;
}

export function hasBlockEnded(timeBlock: TimeOfDay, now: Date, timeZone: string): boolean {
  const { hour, minute } = getZonedParts(now, timeZone);
  const nowMin = toMinutes(hour, minute);
  const window = TIME_BLOCK_WINDOWS[timeBlock];
  return nowMin >= toMinutes(window.endHour, window.endMin);
}

export function isBlockActive(timeBlock: TimeOfDay, now: Date, timeZone: string): boolean {
  const { hour, minute } = getZonedParts(now, timeZone);
  const nowMin = toMinutes(hour, minute);
  const window = TIME_BLOCK_WINDOWS[timeBlock];
  return nowMin >= toMinutes(window.startHour, window.startMin)
    && nowMin < toMinutes(window.endHour, window.endMin);
}

export function getCurrentTimeBlock(now = new Date(), timeZone = getMedtrackTimezone()): TimeOfDay | null {
  for (const block of TIME_BLOCK_ORDER) {
    if (isBlockActive(block, now, timeZone)) return block;
  }
  return null;
}

export function getMedicationDoseStatus(
  medication: Medication,
  doseLogs: DoseLog[],
  now = new Date(),
  timeZone = getMedtrackTimezone(),
): DoseUiStatus {
  const todayKey = getTodayKey(now, timeZone);
  const logToday = doseLogs.find(
    l => l.medication_id === medication.id && isLogOnDate(l, todayKey, timeZone),
  );

  if (logToday) {
    if (logToday.status === 'taken') return 'taken';
    if (logToday.status === 'missed') return 'missed';
    return 'skipped';
  }

  if (hasBlockEnded(medication.time_of_day, now, timeZone)) return 'overdue';
  if (isBlockActive(medication.time_of_day, now, timeZone)) return 'due';
  return 'upcoming';
}

export function getTimeBlockProgress(
  timeBlock: TimeOfDay,
  medications: Medication[],
  doseLogs: DoseLog[],
  now = new Date(),
  timeZone = getMedtrackTimezone(),
): { taken: number; missed: number; total: number } {
  const todayKey = getTodayKey(now, timeZone);
  const blockMeds = medications.filter(m => m.time_of_day === timeBlock);
  let taken = 0;
  let missed = 0;

  for (const med of blockMeds) {
    const log = doseLogs.find(
      l => l.medication_id === med.id && isLogOnDate(l, todayKey, timeZone),
    );
    if (log?.status === 'taken') taken++;
    else if (log?.status === 'missed') missed++;
    else if (!log && hasBlockEnded(timeBlock, now, timeZone)) missed++;
  }

  return { taken, missed, total: blockMeds.length };
}
