import { Lead } from '../services/leadService.types';

export function buildOptInUrl(baseUrl: string, campaign: string, lead: Lead): string {
  const url = new URL(baseUrl);
  const searchParams = new URLSearchParams(url.search);

  // Set UTM parameters
  searchParams.set('utm_campaign', campaign);

  // Set autofill parameters
  if (lead.first_name) searchParams.set('first_name', lead.first_name);
  if (lead.last_name) searchParams.set('last_name', lead.last_name);
  if (lead.email) searchParams.set('email', lead.email);
  if (lead.phone_number) searchParams.set('phone_number', lead.phone_number);
  if (lead.company) searchParams.set('custom#company', lead.company);
  if (lead.title) searchParams.set('custom#title', lead.title);
  if (lead.product_interest)
    searchParams.set('custom#what_type_of_products_are_you_interested_in', lead.product_interest);
  if (lead.notes) searchParams.set('custom#notes', lead.notes);

  url.search = searchParams.toString();
  return url.toString();
}
