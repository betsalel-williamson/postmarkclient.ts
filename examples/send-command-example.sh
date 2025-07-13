#!/bin/bash

set -e

cd "$(dirname "$0")/.."

npm start -- send "saul@willcos.us" "./dist/templates/b2b-template.html" \
  --source google-sheets \
  --subject "Important Update" \
  --template-data '{
    "company_name": "My company",
    "company_address": "123 Main St",
    "legal_entity": "My company inc",
    "facebook_url": "https://facebook.com/",
    "instagram_url": "https://instagram.com/",
    "product_url": "https://example.com",
    "product_name": "My product",
    "action_url": {
      "baseUrl": "https://example.com/pages/b2b-marketing-opt-in",
      "searchParams": {
        "utm_source": "postmark",
        "utm_medium": "email",
        "utm_campaign": "b2b_campaign_default",
        "first_name": "{{first_name}}",
        "last_name": "{{last_name}}",
        "email": "{{email}}",
        "phone_number": "{{phone_number}}",
        "custom#company": "{{company}}",
        "custom#title": "{{title}}",
        "custom#what_type_of_products_are_you_interested_in": "{{product_interest}}",
        "custom#notes": "{{notes}}"
        }
      }
    }' \
  --header-mapping '{
    "company": "company",
    "title": "title",
    "first_name": "first_name",
    "last_name": "last_name",
    "email": "email",
    "cell_phone": "phone_number",
    "product_interest": "product_interest",
    "customer_notes": "notes"
  }'