import { describe, it, expect } from 'vitest';
import { validateAndTransformLead } from './validation';
import { Lead } from '../services/leadService';

describe('validation', () => {
  it('should correctly validate and transform a lead', () => {
    const rawData = {
      company: 'a'.repeat(129), // Exceeds limit
      title: 'b'.repeat(129), // Exceeds limit
      products: 'feline and canine', // Needs mapping
      notes: 'c'.repeat(5001), // Exceeds limit
    };

    const expectedLead: Partial<Lead> = {
      company: 'a'.repeat(128),
      title: 'b'.repeat(128),
      product_interest: 'cat+dog',
      notes: 'c'.repeat(5000),
    };

    const result = validateAndTransformLead(rawData);

    expect(result.company).toBe(expectedLead.company);
    expect(result.title).toBe(expectedLead.title);
    expect(result.product_interest).toBe(expectedLead.product_interest);
    expect(result.notes).toBe(expectedLead.notes);
  });

  it('should handle various product interest mappings', () => {
    expect(validateAndTransformLead({ products: 'cat' }).product_interest).toBe('cat');
    expect(validateAndTransformLead({ products: 'dog' }).product_interest).toBe('dog');
    expect(validateAndTransformLead({ products: 'cat, dog' }).product_interest).toBe('cat+dog');
    expect(validateAndTransformLead({ products: 'DOG and CAT' }).product_interest).toBe('cat+dog');
    expect(validateAndTransformLead({ products: 'something else' }).product_interest).toBe(null);
  });
});
