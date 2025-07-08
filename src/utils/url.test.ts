import { describe, it, expect } from 'vitest';
import { buildOptInUrl } from './url';
import { Lead } from '../services/leadService';

describe('url', () => {
  it('should build a URL with autofill and UTM parameters', () => {
    const baseUrl = 'https://example.com/page?utm_source=postmark&utm_medium=email';
    const lead: Lead = {
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane.doe@example.com',
      phone_number: '555-123-4567',
      company: 'Example Corp',
      title: 'Developer',
      product_interest: 'dog',
      notes: 'Test notes here',
      customer_facing_notes: null,
    };

    const finalUrl = buildOptInUrl(baseUrl, 'b2b_campaign_1', lead);

    const url = new URL(finalUrl);

    // Check UTM parameters
    expect(url.searchParams.get('utm_source')).toBe('postmark');
    expect(url.searchParams.get('utm_medium')).toBe('email');
    expect(url.searchParams.get('utm_campaign')).toBe('b2b_campaign_1');

    // Check autofill parameters
    expect(url.searchParams.get('first_name')).toBe('Jane');
    expect(url.searchParams.get('custom#company')).toBe('Example Corp');
    expect(url.searchParams.get('custom#what_type_of_products_are_you_interested_in')).toBe('dog');
  });
});
