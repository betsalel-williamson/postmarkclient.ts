export interface UrlConfig {
  baseUrl: string;
  searchParams: { [key: string]: string };
}

export function isUrlConfig(obj: object) {
  return 'baseUrl' in obj && 'searchParams' in obj;
}

export function buildUrl(
  config: UrlConfig,
  keyValueMap: { [key: string]: string | null | undefined }
): string {
  const url = new URL(config.baseUrl);
  const searchParams = new URLSearchParams(url.search);

  // Set parameters from searchParams, resolving placeholders
  for (const key in config.searchParams) {
    let value = config.searchParams[key];
    const placeholderMatch = value.match(/^{{(.*)}}$/);

    if (placeholderMatch) {
      const placeholderKey = placeholderMatch[1];
      value = String(keyValueMap[placeholderKey] || '');
    }
    searchParams.set(key, value);
  }

  url.search = searchParams.toString();
  return url.toString();
}
