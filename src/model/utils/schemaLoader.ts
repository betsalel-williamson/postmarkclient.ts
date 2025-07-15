import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import { OpenAPIV3 } from 'openapi-types';

export async function loadSchema(schemaPath: string): Promise<OpenAPIV3.Document> {
  try {
    const fileContent = await fs.readFile(schemaPath, 'utf-8');
    const schema = yaml.load(fileContent) as OpenAPIV3.Document;
    // Basic validation to ensure it's at least a valid OpenAPI document structure
    if (!schema.openapi || !schema.info || !schema.paths || !schema.components) {
      throw new Error('Invalid OpenAPI document structure.');
    }
    return schema;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to load or parse schema from ${schemaPath}: ${error.message}`);
    } else {
      throw new Error(`Failed to load or parse schema from ${schemaPath}: Unknown error`);
    }
  }
}
