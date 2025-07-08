import { Lead } from '../services/leadService';

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

  if (typeof data.products === 'string') {
    const products = data.products.toLowerCase();
    const hasCat = products.includes('cat') || products.includes('feline');
    const hasDog = products.includes('dog') || products.includes('canine');

    if (hasCat && hasDog) {
      lead.product_interest = 'cat+dog';
    } else if (hasCat) {
      lead.product_interest = 'cat';
    } else if (hasDog) {
      lead.product_interest = 'dog';
    } else {
      lead.product_interest = null;
    }
  } else {
    lead.product_interest = null;
  }

  return lead;
}
