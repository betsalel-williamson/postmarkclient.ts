import { describe, it, expect } from 'vitest';
import { processTemplate } from './templateProcessor';
import { UrlConfig } from './url';

describe('templateProcessor', () => {
  const keyValueMap = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone_number: '123-456-7890',
    company: 'Example Corp',
    title: 'Software Engineer',
    product_interest: 'cat',
    notes: 'Some notes',
    customer_facing_notes: 'Customer notes',
  };

  const createMockUrlConfig = (overrides?: Partial<UrlConfig>): UrlConfig => ({
    baseUrl: overrides?.baseUrl || 'https://example.com/pages/b2b-marketing-opt-in',
    searchParams: {
      utm_source: 'postmark',
      utm_medium: 'email',
      utm_campaign: 'test_campaign',
      first_name: '{{first_name}}',
      'custom#company': '{{company}}',
      'custom#what_type_of_products_are_you_interested_in': '{{product_interest}}',
      ...overrides?.searchParams,
    },
  });

  it('should correctly personalize HTML, subject, and text body', () => {
    const htmlTemplate = `<html><body>Hello {{first_name}}, This is a test email for {{campaign}}. <a href="{{action_url}}">Click here</a></body></html>`;
    const subjectTemplate = `Welcome, {{first_name}} to {{campaign}}!`;
    const templateData = {
      campaign: 'test_campaign',
      action_url: createMockUrlConfig(),
    };

    const { personalizedHtml, personalizedSubject, personalizedText } = processTemplate(
      htmlTemplate,
      subjectTemplate,
      templateData,
      keyValueMap
    );

    expect(personalizedHtml).toContain('Hello John');
    expect(personalizedHtml).toContain('This is a test email for test_campaign.');
    expect(personalizedHtml).toContain(
      'href="https://example.com/pages/b2b-marketing-opt-in?utm_source=postmark&utm_medium=email&utm_campaign=test_campaign&first_name=John&custom%23company=Example+Corp&custom%23what_type_of_products_are_you_interested_in=cat"'
    );

    expect(personalizedSubject).toBe('Welcome, John to test_campaign!');

    expect(personalizedText).toContain(
      'Hello John, This is a test email for test_campaign. Click here'
    );
  });

  it('should handle missing template data gracefully', () => {
    const htmlTemplate = `<html><body>Hello {{missing_key}}.</body></html>`;
    const subjectTemplate = `Subject: {{another_missing_key}}`;
    const templateData = {};

    const { personalizedHtml, personalizedSubject, personalizedText } = processTemplate(
      htmlTemplate,
      subjectTemplate,
      templateData,
      keyValueMap
    );

    expect(personalizedHtml).toContain('Hello {{missing_key}}.');
    expect(personalizedSubject).toContain('Subject: {{another_missing_key}}');
    expect(personalizedText).toContain('Hello {{missing_key}}.');
  });

  it('should correctly handle complex HTML and convert to text', () => {
    const complexHtmlTemplate = `
      <html>
        <body>
          <h1>Welcome, {{first_name}}!</h1>
          <p>This is a <strong>test</strong> email with some <em>formatting</em>.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
          <p>Visit our <a href="{{product_url}}">website</a>.</p>
        </body>
      </html>
    `;
    const subjectTemplate = 'Test Subject';
    const templateData = {
      product_url: 'https://example.com/product',
    };

    const { personalizedHtml, personalizedSubject, personalizedText } = processTemplate(
      complexHtmlTemplate,
      subjectTemplate,
      templateData,
      keyValueMap
    );

    expect(personalizedHtml).toContain('<h1>Welcome, John!</h1>');
    expect(personalizedHtml).toContain('<a href="https://example.com/product">website</a>');
    expect(personalizedSubject).toBe('Test Subject');

    expect(personalizedText).toContain('Welcome, John!');
    expect(personalizedText).toContain('This is a test email with some formatting.');
    expect(personalizedText).toContain('Item 1');
    expect(personalizedText).toContain('Item 2');
    expect(personalizedText).toContain('Visit our website [https://example.com/product]');
  });
});
