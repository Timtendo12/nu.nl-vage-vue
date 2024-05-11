import { OutputMode } from '@server/middleware/OutputMode';

export interface BfffetchConfig {
  passHeaders: boolean;
  setCookies: boolean;
}

const configs = new Map<OutputMode, BfffetchConfig>();
configs.set(OutputMode.DEFAULT, { passHeaders: true, setCookies: true });
configs.set(OutputMode.FALLBACK, { passHeaders: false, setCookies: false });

export function getBfffetchConfig(mode: OutputMode = OutputMode.DEFAULT) {
  return configs.get(mode)!;
}
