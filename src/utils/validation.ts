import { Lead } from '../services/leadService.types';

export function validateAndTransformLead(rawData: unknown): Partial<Lead> {
  const lead: Partial<Lead> = {};

  if (typeof rawData !== 'object' || rawData === null) {
    return lead;
  }

  const data = rawData as { [key: string]: any };

  if (typeof data.company === 'string') {
    lead.company = data.company.substring(0, 128);
  }

  if (typeof data.title === 'string') {
    lead.title = data.title.substring(0, 128);
  }

  if (typeof data.notes === 'string') {
    lead.notes = data.notes.substring(0, 5000);
  }

  const combinedText = [data.title, data.email, data.company, data.products, data.notes]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const hasCat =
    combinedText.includes('cat') ||
    combinedText.includes('feline') ||
    combinedText.includes('kitty') ||
    combinedText.includes('purr');
  const hasDog =
    combinedText.includes('dog') ||
    combinedText.includes('canine') ||
    combinedText.includes('puppy') ||
    combinedText.includes('woof') ||
    combinedText.includes('bark') ||
    combinedText.includes('bulldog');

  if (hasCat && hasDog) {
    lead.product_interest = 'cat+dog';
  } else if (hasCat) {
    lead.product_interest = 'cat';
  } else if (hasDog) {
    lead.product_interest = 'dog';
  } else {
    lead.product_interest = null;
  }

  return lead;
}
