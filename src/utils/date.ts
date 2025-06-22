import dayjs from 'dayjs';

export default function getTripDays(start: string, end: string): string[] {
  const days: string[] = [];
  let current = dayjs(start);
  const last = dayjs(end);

  while (current.isBefore(last) || current.isSame(last)) {
    days.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'day');
  }

  return days;
}
