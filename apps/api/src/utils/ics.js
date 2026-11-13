const escapeText = (value) =>
  String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

const compactDate = (date) => String(date).slice(0, 10).replace(/-/g, '');

/** Reminders become all-day events (RFC 5545), which every major calendar app can subscribe to. */
export function buildCalendar(reminders, now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Budget Book//Reminders//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Budget Book reminders',
  ];
  for (const reminder of reminders) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:reminder-${reminder.id}@budget-book`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compactDate(reminder.due_date)}`,
      `SUMMARY:${escapeText(reminder.title)}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
}
