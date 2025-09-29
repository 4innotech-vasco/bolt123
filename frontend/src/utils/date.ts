export const toDateKey = (input: Date | string): string => {
  const date = typeof input === 'string' ? new Date(input) : input;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLastNDates = (days: number, endDate: Date = new Date()): string[] => {
  const dates: string[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - offset);
    dates.push(toDateKey(date));
  }
  return dates;
};

export const getDateRangeForDays = (days: number, endDate: Date = new Date()) => {
  const dates = getLastNDates(days, endDate);
  return {
    start: dates[0],
    end: dates[dates.length - 1]
  };
};

export const formatDisplayDate = (date: string): string => {
  const instance = new Date(date);
  return instance.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
};

export const isDateWithinRange = (date: string, start: string, end: string) => {
  return date >= start && date <= end;
};
