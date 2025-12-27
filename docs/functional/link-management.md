# Link Management Module

## Overview
Core functionality for managing affiliate links with CRUD operations, bulk import, and filtering.

## Features
- Create, read, update, delete affiliate links
- Bulk CSV import with validation
- Link categorization and tagging
- Status tracking (active, checking, broken, warning)
- Search, filter, and sort capabilities
- Toggle tracking per link

## Components
- [AddLinkForm](../../components/links/add-link-form.tsx) - Form for add/edit
- [LinksTable](../../components/links/links-table.tsx) - Table with actions
- [BulkImportDialog](../../components/links/bulk-import-dialog.tsx) - CSV import
- [LinksFilters](../../components/links/links-filters.tsx) - Filter controls
- [LinkStatsDialog](../../components/links/link-stats-dialog.tsx) - Statistics modal

## API Routes
- `POST /api/links` - Create link
- `GET /api/links` - List links (supports filters)
- `GET /api/links/[id]` - Get single link
- `PUT /api/links/[id]` - Update link
- `DELETE /api/links/[id]` - Delete link
- `POST /api/links/bulk-import` - Bulk import from CSV

## CSV Import Format
```csv
url;name;category;tags
https://example.com/ref;Example Link;Amazon;promo,sale
```

## Categories
Amazon, Social Media, E-commerce, SaaS, Digital Products, Other
