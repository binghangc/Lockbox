import * as Calendar from 'expo-calendar';

type EventInput = {
  title: string;
  startDate: Date | string;
  endDate: Date | string;
  notes?: string;
};

export default async function createCalendarEvent({
  title,
  startDate,
  endDate,
  notes = 'Added by Lockbox',
}: EventInput): Promise<string> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Calendar permission not granted');
  }

  const calendars = await Calendar.getCalendarsAsync();
  const defaultCalendar = calendars.find((c) => c.allowsModifications);

  if (!defaultCalendar) {
    throw new Error('No writable calendar found');
  }

  const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
    title,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    notes,
    timeZone: 'Asia/Singapore',
  });

  return eventId;
}
