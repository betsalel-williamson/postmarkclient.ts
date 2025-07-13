// we are assuming the params company, title, notes, product_interest and so on and these need to be validated and we need to make sure there is a mapping

export function validateAndTransformLead(rawData: { [key: string]: string | null | undefined }): {
  [key: string]: string | null | undefined;
} {
  const lead: { [key: string]: string | null | undefined } = { ...rawData };

  if (typeof lead.company === 'string') {
    lead.company = lead.company.substring(0, 128);
  }

  if (typeof lead.title === 'string') {
    lead.title = lead.title.substring(0, 128);
  }

  if (typeof lead.notes === 'string') {
    lead.notes = lead.notes.substring(0, 5000);
  }

  if (typeof lead.product_interest === 'string') {
    const hasCat = lead.product_interest.toLowerCase().includes('cat');
    const hasDog = lead.product_interest.toLowerCase().includes('dog');

    if (hasCat && hasDog) {
      lead.product_interest = 'cat+dog';
    } else if (hasCat) {
      lead.product_interest = 'cat';
    } else if (hasDog) {
      lead.product_interest = 'dog';
    } else {
      lead.product_interest = null;
    }
  }

  return lead;
}
