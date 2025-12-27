# API Reference

## Link Management APIs

### POST /api/links
Create a new affiliate link.

**Auth:** Required
**Body:**
```json
{
  "url": "https://example.com/ref",
  "name": "Example Link",
  "category": "Amazon",
  "tags": "promo,sale"
}
```
**Response:** 201 Created

---

### GET /api/links
List all user's links.

**Auth:** Required
**Query Params:**
- `category` (optional) - Filter by category
- `status` (optional) - Filter by status

**Response:** 200 OK, Array of links

---

### GET /api/links/[id]
Get single link details.

**Auth:** Required
**Response:** 200 OK, Link object

---

### PUT /api/links/[id]
Update entire link.

**Auth:** Required
**Body:** Same as POST
**Response:** 200 OK, Updated link

---

### PATCH /api/links/[id]
Partial update of link.

**Auth:** Required
**Body:** Partial link object
**Response:** 200 OK, Updated link

---

### DELETE /api/links/[id]
Delete a link.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/links/bulk-import
Bulk import links from CSV.

**Auth:** Required
**Body:**
```json
{
  "links": [
    { "url": "...", "name": "...", "category": "...", "tags": "..." }
  ]
}
```
**Response:** 201 Created, Array of created links

---

## Contact API

### POST /api/contact
Send contact form email.

**Auth:** Not required
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "subject": "Question",
  "message": "Message text"
}
```
**Response:** 200 OK
