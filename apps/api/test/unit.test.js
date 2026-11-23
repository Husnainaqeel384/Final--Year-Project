import { describe, expect, it } from 'vitest';
import { allocate } from '../src/utils/split.js';
import { buildForecast } from '../src/utils/forecast.js';
import { shiftMonth } from '../src/utils/months.js';
import { assertSafeWebhookUrl, isPublicAddress } from '../src/utils/safeRequest.js';
import { buildCalendar } from '../src/utils/ics.js';
import { neutralizeFormula } from '../src/services/integration.service.js';
import { nextDueDate } from '../src/services/reminder.service.js';
import { providerForUrl } from '../src/services/webhook.service.js';
import { msUntilNextReset } from '../src/services/demo.service.js';

describe('allocate', () => {
  it('never loses or invents a cent', () => {
    const shares = allocate(100, 3);
    expect(shares).toEqual([33.34, 33.33, 33.33]);
    expect(shares.reduce((sum, value) => sum + Math.round(value * 100), 0)).toBe(10000);
  });
});

describe('shiftMonth', () => {
  it('crosses year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2025-12', 1)).toBe('2026-01');
  });
});

describe('buildForecast', () => {
  const now = new Date(2026, 2, 10);

  it('projects repeated spending from the pace so far', () => {
    const categories = [{ planned: 500, spent: 1000, count: 5 }];
    const forecast = buildForecast({ spent: 1000, month: '2026-03', categories, previousSpend: [], now });
    expect(forecast.dailyAverage).toBe(100);
    expect(forecast.projectedSpend).toBe(3100);
  });

  it('does not extrapolate a bill paid once, such as rent', () => {
    const categories = [{ planned: 1650, spent: 1650, count: 1 }];
    const forecast = buildForecast({ spent: 1650, month: '2026-03', categories, previousSpend: [], now });
    expect(forecast.projectedSpend).toBe(1650);
  });

  it('expects planned categories with no spending yet to reach their plan', () => {
    const categories = [{ planned: 200, spent: 0, count: 0 }];
    const forecast = buildForecast({ spent: 0, month: '2026-03', categories, previousSpend: [], now });
    expect(forecast.projectedSpend).toBe(200);
  });

  it('uses the real total for a finished month', () => {
    const forecast = buildForecast({ spent: 2000, month: '2026-02', categories: [], previousSpend: [], now });
    expect(forecast.isCurrentMonth).toBe(false);
    expect(forecast.projectedSpend).toBe(2000);
  });

  it('weights recent months more heavily', () => {
    const forecast = buildForecast({ spent: 0, month: '2026-03', categories: [], previousSpend: [600, 300, 300], now });
    expect(forecast.nextMonth).toBe(450);
  });
});

describe('webhook address safety', () => {
  it.each(['127.0.0.1', '10.1.2.3', '169.254.169.254', '192.168.0.1', '::1', 'fd00::1', '::ffff:127.0.0.1'])(
    'blocks %s',
    (address) => expect(isPublicAddress(address)).toBe(false),
  );

  it('allows a public address', () => expect(isPublicAddress('8.8.8.8')).toBe(true));

  it('rejects unsafe URLs', () => {
    expect(() => assertSafeWebhookUrl('http://example.com/hook')).toThrow();
    expect(() => assertSafeWebhookUrl('https://169.254.169.254/latest')).toThrow();
    expect(() => assertSafeWebhookUrl('https://example.com:8443/hook')).toThrow();
    expect(() => assertSafeWebhookUrl('https://user:pass@example.com/')).toThrow();
  });
});

describe('neutralizeFormula', () => {
  it('disarms spreadsheet formulas', () => {
    expect(neutralizeFormula('=HYPERLINK("http://evil")')).toBe('\'=HYPERLINK("http://evil")');
    expect(neutralizeFormula('Rent')).toBe('Rent');
    expect(neutralizeFormula(12.5)).toBe(12.5);
  });
});

describe('buildCalendar', () => {
  it('produces escaped all-day events', () => {
    const calendar = buildCalendar([{ id: 1, title: 'Pay, rent; now', due_date: '2026-03-05' }]);
    expect(calendar).toContain('DTSTART;VALUE=DATE:20260305');
    expect(calendar).toContain('SUMMARY:Pay\\, rent\\; now');
    expect(calendar).toContain('\r\n');
  });
});

describe('nextDueDate', () => {
  it('repeats weekly across month ends', () => {
    expect(nextDueDate('2026-01-29', 'weekly', null)).toBe('2026-02-05');
  });

  it('keeps a monthly bill on its day, using the last day of shorter months', () => {
    expect(nextDueDate('2026-01-31', 'monthly', 31)).toBe('2026-02-28');
    expect(nextDueDate('2026-02-28', 'monthly', 31)).toBe('2026-03-31');
    expect(nextDueDate('2026-12-15', 'monthly', 15)).toBe('2027-01-15');
  });

  it('handles a yearly bill on 29 February', () => {
    expect(nextDueDate('2028-02-29', 'yearly', 29)).toBe('2029-02-28');
    expect(nextDueDate('2031-02-28', 'yearly', 29)).toBe('2032-02-29');
  });
});

describe('msUntilNextReset', () => {
  const hours = (ms) => ms / 3600000;

  it('waits until 03:00 UTC later the same day', () => {
    expect(hours(msUntilNextReset(new Date('2026-05-10T01:00:00Z')))).toBe(2);
  });

  it('moves to the next day once 03:00 UTC has passed', () => {
    expect(hours(msUntilNextReset(new Date('2026-05-10T03:00:00Z')))).toBe(24);
    expect(hours(msUntilNextReset(new Date('2026-12-31T22:00:00Z')))).toBe(5);
  });
});

describe('providerForUrl', () => {
  it('recognises Slack and Discord addresses, and nothing else', () => {
    expect(providerForUrl('https://hooks.slack.com/services/T000/B000/xyz')).toBe('slack');
    expect(providerForUrl('https://discord.com/api/webhooks/1/abc')).toBe('discord');
    expect(providerForUrl('https://canary.discordapp.com/api/webhooks/1/abc')).toBe('discord');
    expect(providerForUrl('https://hooks.zapier.com/hooks/catch/1/abc')).toBeNull();
    // A look-alike host must not count as Discord.
    expect(providerForUrl('https://discordXcom.example/api/webhooks/1')).toBeNull();
    expect(providerForUrl('https://discord.com/channels/1')).toBeNull();
  });
});
