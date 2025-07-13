import { Config } from './configService';

export interface Lead {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  company: string | null;
  title: string | null;
  product_interest: 'cat' | 'dog' | 'cat+dog' | null;
  notes: string | null;
  customer_facing_notes: string | null;
}

export abstract class LeadService {
  protected _headerMapping: Record<string, string>;
  constructor(config: Config) {
    this._headerMapping = config.headerMapping!;
  }

  abstract getLeads(options?: {
    [key: string]: any;
  }): Promise<{ [key: string]: string | null | undefined }[]>;

  getReservedTemplateKeys(): Promise<Set<string>> {
    return Promise.resolve(
      new Set<keyof Lead>([
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'company',
        'title',
        'product_interest',
        'notes',
        'customer_facing_notes',
      ])
    );
  }
}
