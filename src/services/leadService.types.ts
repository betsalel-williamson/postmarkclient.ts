export interface Lead {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  company: string | null;
  title: string | null;
  product_interest: 'cat' | 'dog' | 'cat+dog' | null | undefined;
  notes: string | null;
  customer_facing_notes: string | null;
}

export interface LeadService {
  getLeads(options?: { [key: string]: any }): Promise<Lead[]>;
  getReservedTemplateKeys(): Promise<Set<string>>; // Changed to return a Promise
}
