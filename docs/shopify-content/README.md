# Shopify content pack

Content for the pages the storefront links to, taken from https://jawharajewellery.com
(HTML cleaned of theme markup, page titles and hero banners removed). The storefront
renders whatever is published in Shopify at these URLs; until a page exists there the
URL shows the 404 page. Nothing here is bundled into the site.

## Pages — Admin → Online Store → Pages → Add page

For each `page-*.html` file: set **Title**, set the **URL handle** exactly as shown,
click **Show HTML** (`<>`) in the editor, paste the file contents, then Save.

| File | Title | Handle |
| --- | --- | --- |
| page-about.html | About Us | `about` |
| page-faq.html | FAQ | `faq` |
| page-contact.html | Contact Us | `contact` (already exists, empty — fill it) |
| page-career.html | Careers | `career` |
| page-user-responsibilities.html | User Responsibilities | `user-responsibilities` |
| page-limitation-of-liability.html | Limitation of Liability | `limitation-of-liability` |

## Policies — Admin → Settings → Policies

Shopify keeps these separate from Pages (the storefront reads them from the Storefront
API's `shop` object and serves them at `/policies/<handle>`). Paste each `policy-*.html`
into the matching field:

| File | Policies field | URL |
| --- | --- | --- |
| policy-privacy-policy.html | Privacy policy | `/policies/privacy-policy` |
| policy-shipping-policy.html | Shipping policy | `/policies/shipping-policy` |
| policy-terms-of-service.html | Terms of service | `/policies/terms-of-service` |
| policy-refund-policy.html | Refund policy | `/policies/refund-policy` |

## Arabic

Use Shopify's **Translate & Adapt** app (Content → Pages / Policies → Arabic). The storefront
requests each page in the shopper's language and falls back to English until a translation
exists.

## Review before publishing

- The user-responsibilities text had a `[email address]` placeholder on the live site; it is
  replaced here with Customerservice@jawharajewellery.ae (taken from the live Contact page).
- The live Careers page lists open roles with "Apply Now" links to a wishlist-app page; the
  links are dropped here — add your real application route or email.
- The live FAQ groups questions under section headings that did not survive extraction
  (Shipping, Jewellery, Diamonds, Contact & Visit, Warranty & Care); the questions and
  answers are complete, add headings in the editor if you want the groups back.
- The live site's Journal is a blog listing and is not included (no blog route yet).
- Phone numbers, addresses and legal wording are copied as published — confirm they are current.
