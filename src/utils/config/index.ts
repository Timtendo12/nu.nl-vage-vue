import config from '@/utils/config/config.json';

export type Config = {
  [ID: string]: string;
};

export function getEnvVariable(id: string): string | undefined;
export function getEnvVariable(id: string, defaultValue: string): string;
export function getEnvVariable(id: string, defaultValue?: string): string | undefined {
  // if process is not production (i.e. development or test): use config.json
  if (process.env.NODE_ENV !== 'production') {
    return (config as Record<string, string>)[id] || defaultValue;
  }
  // else if window is defined (i.e. client in the browser): use window.config
  if (typeof window !== 'undefined' && window.config) {
    return window.config[id] || defaultValue;
  }
  // else use process.env
  const p = process;
  return p['env'][id] || defaultValue;
}
