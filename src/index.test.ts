import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';
import { GoogleSheetsApi } from './services/googleSheetsApi';
import { Config } from './services/configService';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { run, main } from './index';

vi.mock('./services/googleSheetsApi');

describe('CLI', () => {
  const baseConfig: Config = {
    postmarkServerToken: 'test-token',
    googleSheetsKeyFilePath: 'test-path',
    googleSheetsSpreadsheetId: 'test-id',
    dbPath: 'test-db-path',
  };

  let tempHtmlFilePath: string;

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

  it('should not send an email if it has been sent before', async () => {
    const sendEmailMock = vi.fn();
    const mockGetValues = vi.fn().mockResolvedValueOnce([
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
        'Nuzzle Pet',
        'Marketing Director',
        'Mimiko',
        'Mao',
        'john.doe@example.com',
        null,
        'cat+dog',
        'test note',
      ],
    ]);
    GoogleSheetsApi.prototype.getValues = mockGetValues;
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 1 });
      }),
      http.post('https://api.postmarkapp.com/email', async ({ request }) => {
        const body = await request.json();
        sendEmailMock(body);
        return HttpResponse.json({ MessageID: 'test-message-id' });
      })
    );

    await run(
      {
        from: 'test@example.com',
        campaign: 'test_campaign',
        htmlTemplatePath: tempHtmlFilePath,
        source: 'google-sheets',
        subject: 'Test Subject',
        textBody: 'Test Text Body',
        templateData: {},
      },
      baseConfig
    );

    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('should send an email if it has been sent before but is in the forceSend list', async () => {
    const sendEmailMock = vi.fn();
    const mockGetValues = vi.fn().mockResolvedValueOnce([
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
        'Nuzzle Pet',
        'Marketing Director',
        'Mimiko',
        'Mao',
        'john.doe@example.com',
        null,
        'cat+dog',
        'test note',
      ],
    ]);
    GoogleSheetsApi.prototype.getValues = mockGetValues;
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 1 });
      }),
      http.post('https://api.postmarkapp.com/email', async ({ request }) => {
        const body = await request.json();
        sendEmailMock(body);
        return HttpResponse.json({ MessageID: 'test-message-id' });
      })
    );

    await run(
      {
        from: 'test@example.com',
        campaign: 'test_campaign',
        htmlTemplatePath: tempHtmlFilePath,
        source: 'google-sheets',
        forceSend: ['john.doe@example.com'],
        subject: 'Test Subject',
        textBody: 'Test Text Body',
        templateData: {},
      },
      baseConfig
    );

    expect(sendEmailMock).toHaveBeenCalled();
    const firstCallArgs = sendEmailMock.mock.calls[0][0];
    expect(firstCallArgs.HtmlBody).toContain('Hello Mimiko');
    expect(firstCallArgs.HtmlBody).toContain('This is a test email for test_campaign.');
    expect(firstCallArgs.HtmlBody).toContain('Click here');
    expect(firstCallArgs.Subject).toBe('Test Subject');
    expect(firstCallArgs.TextBody).toBe('Test Text Body');
  });

  it('should generate TextBody from HTML when not provided', async () => {
    const sendEmailMock = vi.fn();
    const mockGetValues = vi.fn().mockResolvedValueOnce([
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
        'Nuzzle Pet',
        'Marketing Director',
        'Mimiko',
        'Mao',
        'john.doe@example.com',
        null,
        'cat+dog',
        'test note',
      ],
    ]);
    GoogleSheetsApi.prototype.getValues = mockGetValues;
    server.use(
      http.get('https://api.postmarkapp.com/messages/outbound', () => {
        return HttpResponse.json({ TotalCount: 0 });
      }),
      http.post('https://api.postmarkapp.com/email', async ({ request }) => {
        const body = await request.json();
        sendEmailMock(body);
        return HttpResponse.json({ MessageID: 'test-message-id' });
      })
    );

    await run(
      {
        from: 'test@example.com',
        campaign: 'test_campaign',
        htmlTemplatePath: tempHtmlFilePath,
        source: 'google-sheets',
        subject: 'Test Subject',
        templateData: {},
      },
      baseConfig
    );

    expect(sendEmailMock).toHaveBeenCalledOnce();
    const firstCallArgs = sendEmailMock.mock.calls[0][0];
    expect(firstCallArgs).toHaveProperty('TextBody');
    // Expected plaintext from `<html><body>Hello {{first_name}}, This is a test email for {{campaign}}. <a href="{{action_url}}">Click here</a></body></html>`
    // with placeholders replaced by empty strings for simplicity in test
    const expectedPlaintext = 'Hello Mimiko, This is a test email for test_campaign. Click here';
    expect(firstCallArgs.TextBody).toContain(expectedPlaintext);
  });
});
