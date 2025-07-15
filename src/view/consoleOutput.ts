export function logInfo(message: string): void {
  console.log(message);
}

export function logWarn(message: string): void {
  console.warn(message);
}

export function logError(message: string): void {
  console.error(message);
}

export function logValidationSummary(
  totalRecords: number,
  validRecords: number,
  invalidRecords: number,
  errorsByType: Record<string, number>
): void {
  logInfo(`\n--- Lead Validation Summary ---`);
  logInfo(`Total records processed: ${totalRecords}`);
  logInfo(`Valid records: ${validRecords}`);
  logInfo(`Invalid records: ${invalidRecords}`);
  if (invalidRecords > 0) {
    logInfo(`Errors by type:`);
    for (const errorType in errorsByType) {
      logInfo(`  - ${errorType}: ${errorsByType[errorType]}`);
    }
  }
  logInfo(`-------------------------------\n`);
}
