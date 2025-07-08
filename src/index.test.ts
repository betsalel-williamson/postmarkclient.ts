import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';
import { run } from './index';
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
