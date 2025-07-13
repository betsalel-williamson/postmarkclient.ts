import { Lead } from '../services/leadService.types';

export interface UrlConfig {
  baseUrl: string;
  staticParams: { [key: string]: string };
  dbParamMapping: { [key: string]: keyof Lead };
}

export function buildUrl(config: UrlConfig, lead: Lead): string {
  const url = new URL(config.baseUrl);
  const searchParams = new URLSearchParams(url.search);

  // Set static parameters
  for (const key in config.staticParams) {
    searchParams.set(key, config.staticParams[key]);
  }

  // Set dynamic parameters from lead data
  for (const paramName in config.dbParamMapping) {
    const leadKey = config.dbParamMapping[paramName];
    const value = lead[leadKey];
    if (value) {
      searchParams.set(paramName, String(value));
    }
  }

  url.search = searchParams.toString();
  return url.toString();
}
