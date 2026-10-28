# Acreages verification — September 13, 2026

- Production build and TypeScript checks passed.
- All 157 sitemap pages returned HTTP 200 with one H1, unique titles and descriptions, canonical URLs, and parseable JSON-LD. Internal content links resolve to known routes; an unknown route returns 404.
- Search preferences carry into buyer enquiries. Query-result pages are noindex and canonicalize to the discovery page.
- Buyer and seller forms were exercised against local D1 storage. Failure retains entries; retries preserve their request ID. API checks covered invalid inputs, origin checks, size limits, idempotency and the atomic submission limit.
- Representative pages fit desktop, 390px and 320px viewports. Mobile navigation opens and closes with Escape.
- All photographs on the homepage, representative city guide and seller page loaded after scrolling on desktop and mobile.
- 38 licensed photographs produce 300 responsive derivatives; largest file is 194,845 bytes. Hero images load eagerly; other images load lazily with explicit dimensions.
- The optional WebMCP search tool stages visible preferences without submitting a form.

These are local checks. They do not claim search-engine indexing, rankings, authorized listing inventory, verified drive-time matches, or email notification delivery. Enquiries are stored privately in D1. The custom domain is not connected by this build.

## Nationwide directory and logo update

- Audited all 5,117 sitemap pages, including every one of the 5,054 official 2025 municipal/equivalent-area records. All returned 200 with one H1, unique titles/descriptions, correct canonicals and valid structured data.
- Verified each municipality is linked from its province directory and is represented by its correct source identifier and a generalized boundary map. No municipality is an orphaned page.
- Checked accented names, St. John’s, regional aliases such as Sydney, province codes, pagination, filtered-directory canonicals and enquiry-context transfer. Corrected an abbreviated-province search collision during testing.
- Checked 18 responsive page/viewport combinations at 1440px, 390px and 320px, with no horizontal overflow or browser errors. Header, mobile menu, footer and favicon use the new field-line A symbol.
- Geographic datasets remain in the server bundle; only the relevant outline is rendered into each community page. The logo asset is 15,469 bytes.
- A full local crawl initially stopped after about 2,000 pages. The in-memory page cache was limited to 8 MiB; the subsequent complete 5,117-page crawl succeeded.
- Production build and TypeScript checks passed. The enquiry-storage schema and provider integrations are unchanged.

## Formspree connection

- Added the official `@formspree/react` integration for `maeygble` to the shared buyer, seller, specialist and partner form.
- Browser checks exercised real local D1 storage with intercepted Formspree responses; no external test enquiries were sent.
- Verified complete intent-specific payloads, contact and property details, subject lines, source pages and reference IDs.
- Verified pending state, duplicate-submit protection, receipt focus, provider validation and form errors, network failure, retained inputs, retry references, consent checks and storage-failure handling.
- Confirmation requires both private storage and Formspree acceptance. A lost provider response can still cause duplicate Formspree delivery on retry; the private record remains idempotent.
- Checked the mobile form without horizontal overflow, the privacy disclosure and zero browser exceptions after refreshing the development server for the newly installed dependency.
- Production build and TypeScript checks passed. The D1 schema is unchanged.
- Actual recipient delivery, Formspree account activation and any account domain restrictions require a real submission from the owner; they were not verified by the intercepted tests.

## October 2026 follow-up browser QA

- Restored ignored managed execution profile using the Sites helper; preview now starts successfully.
- Inspected desktop homepage and 390px / 768px responsive frame viewports.
- Verified mobile navigation opens and exposes all primary destinations.
- Verified FAQ expansion displays the matching answer.
- Searched Calgary, Alberta and confirmed the community guide result.
- Followed the planner CTA: Alberta and Calgary were carried correctly; generated the six-question plan.
- Verified guide contents anchors navigate below the sticky header.
- Improved hero image source sizing for tall mobile crops, expanded mobile budget control, and increased select tap areas.
- Corrected singular result wording.
- No real enquiries submitted. Physical-device testing and Search Console account metrics were not part of these browser checks.
