# Municipal directory provenance

The directory contains all **5,054 census subdivisions** in Statistics Canada's **2025 Census Subdivision Boundary File**, with a geographic reference date of **January 1, 2025**. It is a complete municipal and municipal-equivalent directory for that release, not a claim that every Canadian neighbourhood is a separately incorporated city or that boundaries remain unchanged forever.

- Catalogue: https://www150.statcan.gc.ca/n1/en/catalogue/92-162-X2025001
- Official ArcGIS layer: https://geo.statcan.gc.ca/geo_wa/rest/services/2025/lcsd000a25s_e/MapServer/0
- Classification definitions: https://www150.statcan.gc.ca/n1/pub/92-500-g/2025001/tbl/tbl4_2-eng.htm
- Licence: https://www.statcan.gc.ca/en/terms-conditions/open-licence
- Retrieved: September 13, 2026.

Adapted from Statistics Canada, Census Subdivision Boundary File, 2025, reference date January 1, 2025. This does not constitute an endorsement by Statistics Canada of this product.

`scripts/import-places.py` consumes the three paginated ArcGIS query responses, ordered by `CSDUID`, with offsets 0, 2000 and 4000. Query fields: `CSDUID,CSDNAME,CSDTYPE,CDUID,CDNAME,CDTYPE,PRUID,PRNAME,Shape_Area`; geometry requested in WGS84, precision 4 and maximum allowable offset 0.003 degrees. Raw responses belong in ignored `work/nationwide/statcan-2025-*.json`.

The importer checks the full count and unique source identifiers, preserves existing matching page URLs, disambiguates repeated names, and derives lightweight generalized SVG outlines. Stored bounds are geographic extents, not town-centre coordinates or land-only areas. Boundary illustrations may include water and are not parcel surveys. Regional links are ordered by approximate geographic midpoints within the census division, or the province when the division contains no alternative. No travel-time or property-availability inference is made.

The 12 editorial region and community guides that are not independent census subdivisions remain on their original URLs. They are distinguished from official municipal pages. Population, market prices, listings and agent availability are not fabricated from geographic records.

All location routes are linked through province A–Z directories and included once in the sitemap. Filter/search query variants are `noindex,follow` with a clean canonical. Large source geometry stays on the server; a location page receives only its own generalized outline.
