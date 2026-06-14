# ship

Pastebin for AI-generated web apps. Publish raw HTML at a short URL.

**Live:** [ship.tanav.me](https://ship.tanav.me)

## Tech Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **Vercel Blob** for HTML storage
- **Upstash Redis** for metadata + rate limiting
- **Zod** for input validation
- **Vitest** for testing

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob storage token |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST token |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL (defaults to `https://ship.tanav.me`) |

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run typecheck    # TypeScript type checking
npm run check        # Run typecheck + lint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## API

### Publish HTML

```http
POST /api/publish
Content-Type: application/json

{"html":"<!DOCTYPE html><html><body>Hello</body></html>"}
```

**Response (201):**
```json
{
  "success": true,
  "id": "abc123",
  "url": "https://ship.tanav.me/abc123"
}
```

### Fetch Stored HTML

```http
GET /api/page/[id]
```

### View Published Page

Open `https://ship.tanav.me/[id]` in a browser.

### Health Check

```http
GET /api/health
```

### Rate Limits

- **Global:** 200 requests/60s per IP
- **Publish:** 20 requests/60s per IP

Rate-limited responses include a `code` field and `retryAfter` in seconds.

## Project Structure

```
app/
  [id]/route.ts              # GET /[id] - Serve published HTML
  api/
    health/route.ts          # GET /api/health
    page/[id]/route.ts       # GET /api/page/[id]
    publish/route.ts         # POST /api/publish
  docs/page.tsx              # API documentation page
  layout.tsx                 # Root layout
  page.tsx                   # Home page
components/
  copy-button.tsx            # Clipboard copy button
lib/
  config.ts                  # Site URL configuration
  env.ts                     # Environment detection
  http.ts                    # HTTP response helpers
  id.ts                      # Unique ID generation
  log.ts                     # Structured logging
  rate-limit.ts              # Rate limiting with Redis fallback
  redis.ts                   # Upstash Redis client
  sanitize.ts                # HTML sanitization
  site.ts                    # Page storage/retrieval
  types.ts                   # TypeScript types
```

## Security

- HTML is sanitized before storage (strips `on*` handlers, `javascript:` URLs, meta refresh)
- Content Security Policy headers on all HTML responses
- `x-content-type-options: nosniff` prevents MIME sniffing
- `referrer-policy: no-referrer` prevents data leakage
- `x-robots-tag: noindex, nofollow` keeps pages out of search engines
- `frame-ancestors 'none'` prevents clickjacking

## License

MIT
