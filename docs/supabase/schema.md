# Database Schema

## Tables

### links
Main table for storing affiliate links.

**Columns:**
- `id` - UUID, Primary Key
- `user_id` - UUID, Foreign Key to users (Supabase Auth)
- `url` - VARCHAR, the affiliate link URL
- `name` - VARCHAR, link name/description
- `short_url` - VARCHAR, optional short URL
- `category` - VARCHAR, optional (Amazon, Social Media, etc.)
- `tags` - VARCHAR, optional comma-separated tags
- `status` - ENUM ('active', 'checking', 'broken', 'warning')
- `tracking_enabled` - BOOLEAN, default true
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP
- `last_checked_at` - TIMESTAMP, optional

**Indexes:**
- `idx_links_tracking_enabled` - For efficient filtering

**RLS (Row Level Security):**
Users can only access their own links via `user_id` filter.

---

### link_checks
Stores health check history for links.

**Columns:**
- `id` - UUID, Primary Key
- `link_id` - UUID, Foreign Key to links
- `checked_at` - TIMESTAMP
- `status_code` - INTEGER, HTTP status code
- `response_time` - INTEGER, milliseconds
- `error_message` - TEXT, optional error details

---

### users
Auto-managed by Supabase Auth. Contains user authentication data.
