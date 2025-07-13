import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';
import { GoogleSheetsApi } from './services/googleSheetsApi';
import { Config } from './services/configService';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { run, main } from './index';
import { UrlConfig } from './utils/url';

vi.mock('./services/googleSheetsApi');

describe('CLI', () => {
  const baseConfig: Config = {
    postmarkServerToken: 'test-token',
    googleSheetsKeyFilePath: 'test-path',
    googleSheetsSpreadsheetId: 'test-id',
    dbPath: 'test-db-path',
  };

  let tempHtmlFilePath: string;
  let sendEmailMock: ReturnType<typeof vi.fn>;
  let mockGetValues: ReturnType<typeof vi.fn>;

  const createMockUrlConfig = (overrides?: Partial<UrlConfig>): UrlConfig => ({
    baseUrl: overrides?.baseUrl || 'https://example.com/pages/b2b-marketing-opt-in',
    staticParams: {
      utm_source: 'postmark',
      utm_medium: 'email',
      utm_campaign: 'test_campaign',
      ...overrides?.staticParams,
    },
    dbParamMapping: {
      first_name: 'first_name',
      'custom#company': 'company',
      'custom#what_type_of_products_are_you_interested_in': 'product_interest',
      ...overrides?.dbParamMapping,
    },
  });

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
    mockGetValues = vi.fn().mockResolvedValueOnce([
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
        'CustomName',
        'LastName',
        'john.doe@example.com',
        null,
        'cat+dog',
        'test note',
      ],
    ]);
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

    await run(
      {
        from: 'test@example.com',
        htmlTemplatePath: tempHtmlFilePath,
        source: 'google-sheets',
        subject: 'Test Subject',
        textBody: 'Test Text Body',
        templateData: {},
        urlConfig: createMockUrlConfig(),
      },
      baseConfig
    );

    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('should send an email if it has been sent before but is in the forceSend list', async () => {
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 1 });
      })
    );

    await run(
      {
        from: 'test@example.com',
        htmlTemplatePath: tempHtmlFilePath,
        source: 'google-sheets',
        forceSend: ['john.doe@example.com'],
        subject: 'Test Subject',
        textBody: 'Test Text Body',
        templateData: {},
        urlConfig: createMockUrlConfig(),
      },
      baseConfig
    );

    expect(sendEmailMock).toHaveBeenCalled();
    const firstCallArgs = sendEmailMock.mock.calls[0][0];
    expect(firstCallArgs.HtmlBody).toContain('Hello CustomName');
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

    await run(
      {
        from: 'test@example.com',
        htmlTemplatePath: tempHtmlFilePath,
        source: 'google-sheets',
        subject: 'Test Subject',
        templateData: {},
        urlConfig: createMockUrlConfig(),
      },
      baseConfig
    );

    expect(sendEmailMock).toHaveBeenCalledOnce();
    const firstCallArgs = sendEmailMock.mock.calls[0][0];
    expect(firstCallArgs).toHaveProperty('TextBody');
    const expectedPlaintext =
      'Hello CustomName, This is a test email for test_campaign. Click here';
    expect(firstCallArgs.TextBody).toContain(expectedPlaintext);
  });

  it('should replace first_name, campaign, and action_url from templateData', async () => {
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 0 });
      })
    );

    const customFirstName = 'CustomName';
    const customCampaign = 'CustomCampaign';
    const customActionUrl = 'https://custom.action.url';

    await run(
      {
        from: 'test@example.com',
        htmlTemplatePath: tempHtmlFilePath,
        source: 'google-sheets',
        subject: 'Test Subject',
        templateData: {
          first_name: customFirstName,
          campaign: customCampaign,
          action_url: customActionUrl,
        },
        urlConfig: createMockUrlConfig({
          baseUrl: customActionUrl, // Override baseUrl for this test
          staticParams: { utm_campaign: customCampaign }, // Override utm_campaign
        }),
      },
      baseConfig
    );

    expect(sendEmailMock).toHaveBeenCalledOnce();
    const firstCallArgs = sendEmailMock.mock.calls[0][0];
    expect(firstCallArgs.HtmlBody).toContain(`Hello ${customFirstName}`);
    expect(firstCallArgs.HtmlBody).toContain(`This is a test email for ${customCampaign}.`);
    expect(firstCallArgs.HtmlBody).toContain(`href="${customActionUrl}`);
  });

  it('should replace placeholders in the subject line', async () => {
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 0 });
      })
    );

    const customFirstName = 'SubjectName';
    const customCampaign = 'SubjectCampaign';
    const customSubject = `Welcome, {{first_name}} to {{campaign}}!`;

    await run(
      {
        from: 'test@example.com',
        htmlTemplatePath: tempHtmlFilePath,
        source: 'google-sheets',
        subject: customSubject,
        templateData: {
          first_name: customFirstName,
          campaign: customCampaign,
        },
        urlConfig: createMockUrlConfig({
          staticParams: { utm_campaign: customCampaign },
        }),
      },
      baseConfig
    );

    expect(sendEmailMock).toHaveBeenCalledOnce();
    const firstCallArgs = sendEmailMock.mock.calls[0][0];
    expect(firstCallArgs.Subject).toBe(`Welcome, ${customFirstName} to ${customCampaign}!`);
  });
});
