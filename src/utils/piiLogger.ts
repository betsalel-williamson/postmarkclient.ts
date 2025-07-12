import * as fs from 'fs';
import * as path from 'path';

const PII_LOG_FILE = path.join(process.cwd(), 'pii.log');

export function piiLog(message: string): void {
  if (process.env.ENABLE_PII_LOGGING === 'true') {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(PII_LOG_FILE, `[${timestamp}] ${message}\n`);
  }
}
