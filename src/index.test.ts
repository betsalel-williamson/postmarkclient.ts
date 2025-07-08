import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';
import { run, main } from './index';
import * as duckdb from 'duckdb';
import * as fs from 'fs';

describe('CLI', () => {
  const testDbPath = './test_business_cards_cli.duckdb';

  beforeAll(() => new Promise<void>((resolve, reject) => {
    process.env.POSTMARK_SERVER_TOKEN = 'test-token';

    // Clean up old test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    const db = new duckdb.Database(testDbPath, (err: Error | null) => {
      if (err) return reject(err);

      db.exec(
        "CREATE TABLE stg_cards_data (first_name VARCHAR, last_name VARCHAR, email VARCHAR, cell VARCHAR, phone VARCHAR, company VARCHAR, title VARCHAR, products VARCHAR, notes VARCHAR);",
        (err: Error | null) => {
          if (err) return reject(err);

          db.exec(
            "INSERT INTO stg_cards_data VALUES ('John', 'Doe', 'john.doe@example.com', '123-456-7890', null, 'ACME Inc', 'CEO', 'cat', 'Test note')",
            (err: Error | null) => {
              if (err) return reject(err);
              db.close((closeErr: Error | null) => {
                if (closeErr) return reject(closeErr);
                resolve();
              });
            }
          );
        }
      );
    });
  }));

  afterAll(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('should log an error and exit if the database does not exist', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as (code?: number | string | null) => never);

    // Mock argv to simulate command line arguments
    process.argv = ['node', 'index.js', 'send', 'from@example.com', 'campaign', 'template', '--dbPath', './non_existent_db.duckdb'];

    await main();

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error: Database file not found at: ./non_existent_db.duckdb");
    expect(processExitSpy).toHaveBeenCalledWith(1);

    vi.restoreAllMocks();
  });

  it('should fetch leads and send emails', async () => {
    const sendEmailMock = vi.fn();

    server.use(
      http.post('https://api.postmarkapp.com/email/withTemplate', async ({ request }) => {
        const body = await request.json();
        sendEmailMock(body);
        return HttpResponse.json({ MessageID: 'test-message-id' });
      })
    );

    await run({ from: 'test@example.com', campaign: 'test_campaign', template: 'test_template' }, testDbPath);

    expect(sendEmailMock).toHaveBeenCalled();
    const firstCallArgs = sendEmailMock.mock.calls[0][0];
    expect(firstCallArgs.TemplateModel.first_name).toBe('John');
    expect(firstCallArgs.TemplateModel.action_url).toContain('utm_campaign=test_campaign');
  });
});
