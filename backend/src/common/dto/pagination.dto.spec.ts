import { paginateMeta } from './pagination.dto';

describe('paginateMeta', () => {
  it('computes total pages from total and limit', () => {
    expect(paginateMeta(45, 2, 20)).toEqual({
      total: 45,
      page: 2,
      limit: 20,
      totalPages: 3,
    });
  });

  it('returns at least one page when there are no rows', () => {
    expect(paginateMeta(0, 1, 20).totalPages).toBe(1);
  });
});
