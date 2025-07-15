import { UrlConfig } from '../utils';

export interface CampaignConfig {
  description: string;
  from: string;
  htmlTemplatePath: string;
  source: 'duckdb' | 'google-sheets';
  headerMapping: Record<string, string>;
  forceSend?: string[] | string;
  subject: string;
  templateData: Record<string, string | UrlConfig>;
  leadSchemaPath?: string;
}
