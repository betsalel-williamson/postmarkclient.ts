import { convert } from 'html-to-text';
import { UrlConfig, buildUrl, isUrlConfig } from './url';

export function customReviver(
  key: string,
  value: unknown
): Record<string, string | UrlConfig | number | boolean | null | undefined> | unknown {
  if (key === '') {
    // Top-level object
    return value;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'baseUrl' in value &&
    'searchParams' in value // Changed from staticParams
  ) {
    return value as UrlConfig;
  }
  return value;
}

export function processTemplate(
  htmlTemplate: string,
  subjectTemplate: string,
  templateData: Record<string, string | UrlConfig>,
  keyValueMap: { [key: string]: string | null | undefined }
): { personalizedHtml: string; personalizedSubject: string; personalizedText: string } {
  let personalizedHtml = htmlTemplate;
  let personalizedSubject = subjectTemplate;

  // Start with keyValueMap data, then overlay user-provided templateData
  const combinedData: Record<string, string | UrlConfig> = {};
  for (const key in keyValueMap) {
    if (Object.prototype.hasOwnProperty.call(keyValueMap, key)) {
      combinedData[key] = String(keyValueMap[key] || '');
    }
  }
  // Overlay user-provided templateData, allowing it to override keyValueMap properties
  Object.assign(combinedData, templateData);

  // Dynamically replace placeholders from combinedData
  for (const key in combinedData) {
    if (Object.prototype.hasOwnProperty.call(combinedData, key)) {
      const value = combinedData[key];
      if (typeof value === 'string') {
        personalizedHtml = personalizedHtml.replace(
          new RegExp(`{{[ ]*${key}[ ]*}}`, 'g'),
          String(value || '')
        );
        personalizedSubject = personalizedSubject.replace(
          new RegExp(`{{[ ]*${key}[ ]*}}`, 'g'),
          String(value || '')
        );
        continue;
      }

      if (isUrlConfig(value as object)) {
        const urlValue = buildUrl(value as UrlConfig, keyValueMap);
        personalizedHtml = personalizedHtml.replace(
          new RegExp(`{{[ ]*${key}[ ]*}}`, 'g'),
          urlValue || ''
        );
      }
    }
  }

  const personalizedText = convert(personalizedHtml, {
    wordwrap: 130,
    selectors: [
      { selector: 'h1', options: { uppercase: false } },
      { selector: 'h2', options: { uppercase: false } },
      { selector: 'h3', options: { uppercase: false } },
      { selector: 'h4', options: { uppercase: false } },
      { selector: 'h5', options: { uppercase: false } },
      { selector: 'h6', options: { uppercase: false } },
    ],
  });

  return { personalizedHtml, personalizedSubject, personalizedText };
}
