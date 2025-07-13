import { describe, it, expect } from 'vitest';
import { validateAndTransformLead } from './validation';
import { Lead } from '../services/leadService.types';

describe('validation', () => {
  it('should correctly validate and transform a lead', () => {
    const rawData = {
      company: 'a'.repeat(129), // Exceeds limit
      title: 'b'.repeat(129), // Exceeds limit
      product_interest: 'cats+dogs', // Needs mapping
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

  it.each([
    ['cat', 'cat'],
    ['dog', 'dog'],
    ['cat, dog', 'cat+dog'],
    ['DOG and CAT', 'cat+dog'],
    ['kitty', null],
    ['puppy', null],
  ])('should map product interest %s to %s', (input, expected) => {
    expect(validateAndTransformLead({ product_interest: input }).product_interest).toBe(expected);
  });
});
