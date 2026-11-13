import { describe, expect, it } from 'vitest';
import { pageNumbers } from './pagination.js';

describe('pageNumbers', () => {
  it('lists every page when there are only a few', () => {
    expect(pageNumbers(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('keeps the first and last pages and folds the middle', () => {
    expect(pageNumbers(1, 20)).toEqual([1, 2, 3, 4, 'gap', 20]);
    expect(pageNumbers(10, 20)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20]);
    expect(pageNumbers(20, 20)).toEqual([1, 'gap', 17, 18, 19, 20]);
  });
});
