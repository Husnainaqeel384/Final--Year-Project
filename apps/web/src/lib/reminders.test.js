import { describe, expect, it } from 'vitest';
import { groupByDue, nextDueDate } from './reminders.js';

describe('nextDueDate', () => {
  it('matches the API for weekly, month-end and yearly dates', () => {
    expect(nextDueDate('2026-01-29', 'weekly')).toBe('2026-02-05');
    expect(nextDueDate('2026-01-31', 'monthly')).toBe('2026-02-28');
    expect(nextDueDate('2026-02-28', 'monthly', 31)).toBe('2026-03-31');
    expect(nextDueDate('2028-02-29', 'yearly')).toBe('2029-02-28');
  });
});

describe('groupByDue', () => {
  it('groups overdue, this week and later, and drops empty groups', () => {
    const days = { a: -2, b: 0, c: 6, d: 7 };
    const groups = groupByDue(
      Object.keys(days).map((id) => ({ id, dueDate: id })),
      (id) => days[id],
    );
    expect(groups.map((group) => [group.key, group.items.map((item) => item.id)])).toEqual([
      ['overdue', ['a']],
      ['week', ['b', 'c']],
      ['later', ['d']],
    ]);
    expect(groupByDue([{ id: 'x', dueDate: 'x' }], () => 30).map((group) => group.key)).toEqual(['later']);
  });
});
