import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'Unknown';

    const includesTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
    const timestamp = new Date(includesTimezone ? value : `${value}Z`).getTime();
    if (Number.isNaN(timestamp)) return 'Unknown';

    const differenceInSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (differenceInSeconds >= 0 && differenceInSeconds < 60) return 'just now';
    if (differenceInSeconds < 0 && differenceInSeconds > -60) return 'in a few seconds';

    const absoluteSeconds = Math.abs(differenceInSeconds);
    const intervals: [number, string][] = [
      [31_536_000, 'year'],
      [2_592_000, 'month'],
      [604_800, 'week'],
      [86_400, 'day'],
      [3_600, 'hour'],
      [60, 'minute'],
    ];

    for (const [secondsPerUnit, unit] of intervals) {
      const count = Math.floor(absoluteSeconds / secondsPerUnit);
      if (count > 0) {
        const quantity = `${count} ${unit}${count === 1 ? '' : 's'}`;
        return differenceInSeconds > 0 ? `${quantity} ago` : `in ${quantity}`;
      }
    }

    return 'just now';
  }
}
