import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { main } from './cli';
import * as emailSender from './emailSender';
import * as configService from './services/configService';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

vi.mock('./emailSender');
vi.mock('./services/configService');

describe('CLI', () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;
  let tempConfigFilePath: string;

  beforeEach(() => {
    process.argv = ['node', 'cli.js'];
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit was called');
    }) as () => never);
    vi.mocked(configService.getConfig).mockReturnValue({
      postmarkServerToken: 'test-token',
    });
    vi.mocked(emailSender.sendEmails).mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
    vi.restoreAllMocks();
    if (tempConfigFilePath) {
      fs.unlink(tempConfigFilePath).catch(() => {});
    }
  });

  it('should call sendEmails with correct arguments for "send" command', async () => {
    process.argv.push(
      'send',
      'test@example.com',
      './template.html',
      '--source',
      'google-sheets',
      '--subject',
      'Test Subject',
      '--template-data',
      '{"key":"value"}',
      '--header-mapping',
      '{"header":"map"}',
      '--lead-schema-path',
      './src/schemas/lead/lead.yaml'
    );

    await main();

    expect(emailSender.sendEmails).toHaveBeenCalledWith({
      from: 'test@example.com',
      htmlTemplatePath: './template.html',
      source: 'google-sheets',
      forceSend: undefined,
      subject: 'Test Subject',
      textBody: undefined,
      templateData: { key: 'value' },
      headerMapping: { header: 'map' },
      config: {
        postmarkServerToken: 'test-token',
      },
      leadSchema: expect.any(Object),
    });
  });

  it('should call sendEmails with correct arguments for "send-from-config" command', async () => {
    const configContent = {
      from: 'config@example.com',
      htmlTemplatePath: './config-template.html',
      source: 'duckdb',
      subject: 'Config Subject',
      templateData: { configKey: 'configValue' },
      headerMapping: { configHeader: 'configMap' },
      forceSend: 'user1@example.com,user2@example.com',
      leadSchemaPath: './src/schemas/lead/lead.yaml',
    };
    tempConfigFilePath = path.join(os.tmpdir(), 'test-config.json');
    await fs.writeFile(tempConfigFilePath, JSON.stringify(configContent));

    process.argv.push('send-from-config', tempConfigFilePath);

    await main();

    expect(emailSender.sendEmails).toHaveBeenCalledWith({
      from: 'config@example.com',
      htmlTemplatePath: './config-template.html',
      source: 'duckdb',
      subject: 'Config Subject',
      templateData: { configKey: 'configValue' },
      headerMapping: { configHeader: 'configMap' },
      forceSend: ['user1@example.com', 'user2@example.com'],
      config: {
        postmarkServerToken: 'test-token',
      },
      leadSchema: expect.any(Object),
    });
  });

  it('should throw an error if headerMapping is missing in config file for send-from-config', async () => {
    const configContent = {
      from: 'config@example.com',
      htmlTemplatePath: './config-template.html',
      source: 'duckdb',
      subject: 'Config Subject',
      templateData: { configKey: 'configValue' },
    };
    tempConfigFilePath = path.join(os.tmpdir(), 'test-config-no-header.json');
    await fs.writeFile(tempConfigFilePath, JSON.stringify(configContent));

    process.argv.push('send-from-config', tempConfigFilePath);

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit was called');
    });

    await expect(main()).rejects.toThrow('process.exit was called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should throw an error when mutually exclusive options are provided', async () => {
    process.argv.push(
      'send',
      'test@example.com',
      './template.html',
      '--source',
      'google-sheets',
      '--subject',
      'Test Subject',
      '--header-mapping',
      '{"header":"map"}',
      '--google-sheets-url',
      'http://example.com',
      '--db-path',
      './test.duckdb',
      '--lead-schema-path',
      './src/schemas/lead/lead.yaml'
    );

    await expect(main()).rejects.toThrow(
      'Arguments google-sheets-url and db-path are mutually exclusive'
    );
  });
});
