import getTripDays from '../../utils/date';

describe('getTripDays', () => {
  it('returns correct list of dates for a short trip', () => {
    const result = getTripDays('2025-07-01', '2025-07-03');
    expect(result).toEqual(['2025-07-01', '2025-07-02', '2025-07-03']);
  });

  it('returns a single date if start and end are the same', () => {
    const result = getTripDays('2025-07-15', '2025-07-15');
    expect(result).toEqual(['2025-07-15']);
  });

  it('returns an empty array if start is after end', () => {
    const result = getTripDays('2025-07-10', '2025-07-05');
    expect(result).toEqual([]);
  });
});
