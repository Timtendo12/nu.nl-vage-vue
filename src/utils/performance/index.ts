export function parseServerTimingHeader(header: string): ServerTimingMetric[] {
  return header.split(',').map((metric) => {
    const extractedMetric = {} as ServerTimingMetric;
    const parts = metric.split(';');
    for (const part of parts) {
      if (part.startsWith('desc=')) {
        extractedMetric.description = part.substring('desc='.length);
      } else if (part.startsWith('dur=')) {
        extractedMetric.timing = +part.substring('dur='.length);
      } else {
        extractedMetric.name = part;
      }
    }
    return extractedMetric;
  });
}
export interface ServerTimingMetric {
  name?: string;
  description?: string;
  timing?: number;
}
