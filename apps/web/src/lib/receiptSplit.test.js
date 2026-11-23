import { describe, expect, it } from 'vitest';
import { describeGroup, splitByCategory } from './receiptSplit.js';

const item = (description, amount, categoryName, include = true) => ({ description, amount, categoryName, include });

describe('splitByCategory', () => {
  const items = [item('Milk', 3.2, 'Groceries'), item('Bread', 2.5, 'Groceries'), item('Soap', 4.8, 'Personal Supplies')];

  it('groups lines by category and spreads tax so the parts add up to the total', () => {
    const result = splitByCategory(items, 11.55);
    expect(result.extra).toBe(1.05);
    expect(result.groups.map((group) => [group.categoryName, group.amount])).toEqual([
      ['Groceries', 6.27],
      ['Personal Supplies', 5.28],
    ]);
    const sum = result.groups.reduce((total, group) => total + Math.round(group.amount * 100), 0);
    expect(sum).toBe(1155);
  });

  it('never loses a cent when the tax divides unevenly', () => {
    const three = [item('A', 1, 'One'), item('B', 1, 'Two'), item('C', 1, 'Three')];
    const result = splitByCategory(three, 3.1);
    expect(result.groups.reduce((total, group) => total + Math.round(group.amount * 100), 0)).toBe(310);
  });

  it('can leave the tax out', () => {
    const result = splitByCategory(items, 11.55, { spread: false });
    expect(result.groups.map((group) => group.amount)).toEqual([5.7, 4.8]);
  });

  it('spreads a receipt-level discount as well', () => {
    const result = splitByCategory(items, 9.5);
    expect(result.extra).toBe(-1);
    expect(result.groups.reduce((total, group) => total + Math.round(group.amount * 100), 0)).toBe(950);
  });

  it('drops unticked lines without moving their cost elsewhere', () => {
    const result = splitByCategory([...items.slice(0, 2), item('Soap', 4.8, 'Personal Supplies', false)], 10.5);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].amount).toBe(5.7);
    expect(result.included).toBe(2);
  });

  it('lets an unticked line take its own share of the tax with it', () => {
    // Lines 10.00 + 10.00, tax 2.00. Dropping one line keeps only its half of the tax.
    const lines = [item('Food', 10, 'Groceries'), item('Gift card', 10, 'Gifts', false)];
    const result = splitByCategory(lines, 22);
    expect(result.extraKept).toBe(1);
    expect(result.groups).toEqual([expect.objectContaining({ categoryName: 'Groceries', amount: 11 })]);
    expect(result.allIncluded).toBe(false);
  });

  it('counts lines that still need a category', () => {
    expect(splitByCategory([...items, item('Mystery', 1, null)], null).uncategorised).toBe(1);
  });
});

describe('describeGroup', () => {
  it('names the shop, the first line and how many more', () => {
    expect(describeGroup('Maple Grocers', ['Milk', 'Bread', 'Eggs'])).toBe('Maple Grocers: Milk +2 more');
    expect(describeGroup(null, ['Soap'])).toBe('Soap');
  });
});
