/** Mirrors nextDueDate in the API, so the form can say when the next reminder will appear. */
export function nextDueDate(dueDate, frequency, anchorDay) {
  const [year, month, day] = dueDate.split('-').map(Number);
  const iso = (date) => date.toISOString().slice(0, 10);
  if (frequency === 'weekly') return iso(new Date(Date.UTC(year, month - 1, day + 7)));
  const target = new Date(Date.UTC(year, month - 1 + (frequency === 'yearly' ? 12 : 1), 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(anchorDay || day, lastDay));
  return iso(target);
}

/** Splits open reminders into the groups the list shows, keeping their order. */
export function groupByDue(items, daysUntil) {
  const groups = [
    { key: 'overdue', label: 'Overdue', items: [] },
    { key: 'week', label: 'Next 7 days', items: [] },
    { key: 'later', label: 'Later', items: [] },
  ];
  for (const item of items) {
    const days = daysUntil(item.dueDate);
    groups[days < 0 ? 0 : days < 7 ? 1 : 2].items.push(item);
  }
  return groups.filter((group) => group.items.length > 0);
}
