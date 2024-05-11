const getCETDayName = (input: Date) => input.toLocaleDateString('nl-NL', { timeZone: 'CET', weekday: 'long' });
const getCETDateString = (input: Date, showYear = true) => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'CET',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  if (showYear) options.year = 'numeric';
  return input.toLocaleDateString('nl-NL', options);
};

export const formatToCETTime = (input: Date) =>
  input.toLocaleTimeString('nl-NL', { timeZone: 'CET', hour: '2-digit', minute: '2-digit' });

/**
 * Returns relative datetime difference in human readable text.
 * Rules:
 * Within a minute:     een paar seconden geleden
 * Within 55 minutes:   <X> minuten geleden
 * Within 6 hours:      <X> uur geleden
 * Same day:            <time>
 * Yesterday:           Gisteren om <time>
 * This week:           <Dayname> om <time>
 * < 365 days ago:      <Dayname day monthname> om <time>
 * > 365 days ago:      <Dayname day monthname year> om <time>
 * Any dates in future: empty string
 * Invalid date:        empty string
 **/
export const humanizeDatetimeToCET = (publishedDate: Date) => {
  const now = new Date();
  const minute = 60000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const difference = now.getTime() - publishedDate.getTime();

  if (difference <= 0 - 5 * minute) {
    return '';
  } else if (difference <= minute) {
    return 'een paar seconden geleden';
  } else if (difference < 55 * minute) {
    return `${Math.ceil(difference / minute)} minuten geleden`;
  } else if (difference < 6 * hour) {
    return `${Math.round(difference / hour)} uur geleden`;
  } else if (difference < day && publishedDate.getDate() === now.getDate()) {
    return formatToCETTime(publishedDate);
  } else if (difference < 2 * day && new Date(now.getTime() - day).getDate() === publishedDate.getDate()) {
    return `gisteren om ${formatToCETTime(publishedDate)}`;
  } else if (difference <= (now.getDay() + 1) * day) {
    return `${getCETDayName(publishedDate)} om ${formatToCETTime(publishedDate)}`;
  } else if (difference <= 365 * day) {
    return `${getCETDateString(publishedDate, false)} om ${formatToCETTime(publishedDate)}`;
  } else {
    return `${getCETDateString(publishedDate, true)} om ${formatToCETTime(publishedDate)}`;
  }
};
