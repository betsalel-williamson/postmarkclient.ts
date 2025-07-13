import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';
import { GoogleSheetsApi } from './services/googleSheetsApi';
import { Config } from './services/configService';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { sendEmails } from './emailSender';
import { UrlConfig } from './utils/url';

vi.mock('./services/googleSheetsApi');

describe('Email Sender', () => {
  const baseConfig: Config = {
    postmarkServerToken: 'test-token',
    googleSheetsKeyFilePath: 'test-path',
    googleSheetsSpreadsheetId: 'test-id',
    dbPath: 'test-db-path',
    headerMapping: {
      company: 'company',
      title: 'title',
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      cell_phone: 'phone_number',
      product_interest: 'product_interest',
      customer_notes: 'notes',
    },
  };

  let tempHtmlFilePath: string;
  let sendEmailMock: ReturnType<typeof vi.fn>;
  let mockGetValues: ReturnType<typeof vi.fn>;

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

  // Helper to get expected reserved keys dynamically
  const getExpectedReservedKeys = (googleSheetHeaders: string[]) => {
    const allReservedKeys = new Set<string>([...googleSheetHeaders]);
    return Array.from(allReservedKeys).sort().join(', ');
  };

  beforeAll(async () => {
    const tempDir = os.tmpdir();
    tempHtmlFilePath = path.join(tempDir, 'test-template.html');
    await fs.writeFile(
      tempHtmlFilePath,
      `<html><body>Hello {{first_name}}, This is a test email for {{campaign}}. <a href="{{action_url}}">Click here</a></body></html>`
    );
  });

  afterAll(async () => {
    await fs.unlink(tempHtmlFilePath);
  });

  beforeEach(() => {
    sendEmailMock = vi.fn();
    // Mock getValues to always return a header row, and then the data rows
    mockGetValues = vi.fn((spreadsheetId: string, range: string) => {
      if (range.includes('A1:Z')) {
        // This is a call for headers and data
        return Promise.resolve([
          [
            '#',
            'company',
            'title',
            'first_name',
            'last_name',
            'email',
            'cell_phone',
            'product_interest',
            'customer_notes',
          ],
          [
            '1',
            'Example Company',
            'Example Title',
            'GenericFirstName',
            'GenericLastName',
            'john.doe@example.com',
            null,
            'cat+dog',
            'test note',
          ],
        ]);
      } else {
        // This is a call for just headers (e.g., from getReservedTemplateKeys)
        return Promise.resolve([
          [
            '#',
            'company',
            'title',
            'first_name',
            'last_name',
            'email',
            'cell_phone',
            'product_interest',
            'customer_notes',
          ],
        ]);
      }
    });
    GoogleSheetsApi.prototype.getValues = mockGetValues;
    server.use(
      http.post('https://api.postmarkapp.com/email', async ({ request }) => {
        const body = await request.json();
        sendEmailMock(body);
        return HttpResponse.json({ MessageID: 'test-message-id' });
      })
    );
  });

  it('should not send an email if it has been sent before', async () => {
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 1 });
      })
    );

    await sendEmails({
      from: 'test@example.com',
      htmlTemplatePath: tempHtmlFilePath,
      source: 'google-sheets',
      subject: 'Test Subject',
      textBody: 'Test Text Body',
      templateData: {},
      headerMapping: baseConfig.headerMapping!, // Use non-null assertion
      config: baseConfig,
    });

    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('should send an email if it has been sent before but is in the forceSend list', async () => {
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 1 });
      })
    );

    await sendEmails({
      from: 'test@example.com',
      htmlTemplatePath: tempHtmlFilePath,
      source: 'google-sheets',
      forceSend: ['john.doe@example.com'],
      subject: 'Test Subject',
      textBody: 'Test Text Body',
      templateData: {
        campaign: 'test_campaign',
        action_url: createMockUrlConfig(),
      },
      headerMapping: baseConfig.headerMapping!, // Pass headerMapping
      config: baseConfig,
    });

    expect(sendEmailMock).toHaveBeenCalled();
    const firstCallArgs = sendEmailMock.mock.calls[0][0];
    expect(firstCallArgs.HtmlBody).toContain('Hello GenericFirstName');
    expect(firstCallArgs.HtmlBody).toContain('This is a test email for test_campaign.');
    expect(firstCallArgs.HtmlBody).toContain('Click here');
    expect(firstCallArgs.Subject).toBe('Test Subject');
    expect(firstCallArgs.TextBody).toBe('Test Text Body');
  });

  it('should generate TextBody from HTML when not provided', async () => {
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 0 });
      })
    );

    await sendEmails({
      from: 'test@example.com',
      htmlTemplatePath: tempHtmlFilePath,
      source: 'google-sheets',
      subject: 'Test Subject',
      templateData: {
        campaign: 'test_campaign',
        action_url: createMockUrlConfig(),
      },
      headerMapping: baseConfig.headerMapping!, // Pass headerMapping
      config: baseConfig,
    });

    expect(sendEmailMock).toHaveBeenCalledOnce();
    const firstCallArgs = sendEmailMock.mock.calls[0][0];
    expect(firstCallArgs).toHaveProperty('TextBody');
    const expectedPlaintext =
      'Hello GenericFirstName, This is a test email for test_campaign. Click here';
    expect(firstCallArgs.TextBody).toContain(expectedPlaintext);
  });

  it('should replace first_name, campaign, and action_url from auto-generated data', async () => {
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 0 });
      })
    );

    // No templateData provided for these keys, relying on auto-generation
    await sendEmails({
      from: 'test@example.com',
      htmlTemplatePath: tempHtmlFilePath,
      source: 'google-sheets',
      subject: 'Test Subject',
      templateData: {
        campaign: 'test_campaign',
        action_url: {
          baseUrl: 'https://example.com/pages/b2b-marketing-opt-in',
          searchParams: {
            utm_source: 'postmark',
            utm_medium: 'email',
            utm_campaign: 'test_campaign',
            first_name: '{{first_name}}',
            'custom#company': '{{company}}',
          },
        },
      },
      headerMapping: baseConfig.headerMapping!, // Use non-null assertion
      config: baseConfig,
    });

    expect(sendEmailMock).toHaveBeenCalledOnce();
    const firstCallArgs = sendEmailMock.mock.calls[0][0];
    expect(firstCallArgs.HtmlBody).toContain(`Hello GenericFirstName`);
    expect(firstCallArgs.HtmlBody).toContain(`This is a test email for test_campaign.`);
    // The action_url will contain query params, so we check for the base URL
    expect(firstCallArgs.HtmlBody).toContain(
      `href="https://example.com/pages/b2b-marketing-opt-in?utm_source=postmark&utm_medium=email&utm_campaign=test_campaign&first_name=GenericFirstName&custom%23company=Example+Company`
    );
  });

  it('should replace placeholders in the subject line from auto-generated data', async () => {
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        // Corrected URL
        return HttpResponse.json({ TotalCount: 0 });
      })
    );

    const customSubject = `Welcome, {{first_name}} to {{campaign}}!`;

    // No templateData provided for these keys, relying on auto-generation
    await sendEmails({
      from: 'test@example.com',
      htmlTemplatePath: tempHtmlFilePath,
      source: 'google-sheets',
      subject: customSubject,
      templateData: {
        campaign: 'test_campaign',
      },
      headerMapping: baseConfig.headerMapping!, // Pass headerMapping
      config: baseConfig,
    });

    expect(sendEmailMock).toHaveBeenCalledOnce();
    const firstCallArgs = sendEmailMock.mock.calls[0][0];
    expect(firstCallArgs.Subject).toBe(`Welcome, GenericFirstName to test_campaign!`);
  });

  it('should throw an error if templateData conflicts with auto-generated keys', async () => {
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 0 });
      })
    );

    const conflictingTemplateData = {
      first_name: 'UserProvidedFirstName', // Conflicts with auto-generated
    };

    const mockUrlConf = createMockUrlConfig();
    // Updated expectedReservedKeys to include #
    const expectedReservedKeys = getExpectedReservedKeys([
      '#',
      'cell_phone',
      'company',
      'customer_facing_notes',
      'customer_notes',
      'email',
      'first_name',
      'last_name',
      'notes',
      'phone_number',
      'product_interest',
      'title',
    ]);

    const expectedErrorMessage = `Conflict detected in templateData keys: first_name. Reserved keys are: ${expectedReservedKeys}. These keys are automatically generated and cannot be overridden.`;

    await expect(
      sendEmails({
        from: 'test@example.com',
        htmlTemplatePath: tempHtmlFilePath,
        source: 'google-sheets',
        subject: 'Test Subject',
        templateData: conflictingTemplateData,
        headerMapping: baseConfig.headerMapping!, // Pass headerMapping
        config: baseConfig,
      })
    ).rejects.toThrow(expectedErrorMessage);
  });

  it('should throw an error if templateData conflicts with a custom urlTemplateKey', async () => {
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 0 });
      })
    );

    const customUrlKey = 'first_name';
    const conflictingTemplateData = {
      [customUrlKey]: 'UserProvidedUrl',
    };

    const mockUrlConf = createMockUrlConfig({});
    // Updated expectedReservedKeys to include #
    const expectedReservedKeys = getExpectedReservedKeys([
      '#',
      'cell_phone',
      'company',
      'customer_facing_notes',
      'customer_notes',
      'email',
      'first_name',
      'last_name',
      'notes',
      'phone_number',
      'product_interest',
      'title',
    ]);

    const expectedErrorMessage = `Conflict detected in templateData keys: ${customUrlKey}. Reserved keys are: ${expectedReservedKeys}. These keys are automatically generated and cannot be overridden.`;

    await expect(
      sendEmails({
        from: 'test@example.com',
        htmlTemplatePath: tempHtmlFilePath,
        source: 'google-sheets',
        subject: 'Test Subject',
        templateData: conflictingTemplateData,
        headerMapping: baseConfig.headerMapping!, // Pass headerMapping
        config: baseConfig,
      })
    ).rejects.toThrow(expectedErrorMessage);
  });
});
