# Proposal: SEO & Site Metadata Configuration

## Objective
Establish essential "due diligence" technical SEO properties and metadata to ensure the Wranngle Systems website is correctly indexed by search engines and displays professionally when shared on social media.

## Current Status
- **Title:** Missing (defaults to URL or empty).
- **Meta Description:** Missing.
- **Social Previews (OG/Twitter):** Missing.
- **Robots.txt:** Missing.
- **Favicon:** Present (`/favicon.png`), but full manifest/icons for different devices could be improved.

## Proposed Changes

### 1. Page Title & Meta Data
Update `client/index.html` to include:
- **Title:** `Wranngle Systems | AI Voice Agents for Trades`
- **Description:** `Automate your after-hours calls with Wranngle Systems. 24/7 AI Voice Agents and lead capture for HVAC, Plumbing, and Electrical businesses.`
- **Keywords:** `AI Voice Agent, HVAC Answering Service, Plumbing Automation, Lead Capture, Wranngle Systems`

### 2. Social Media Protocol (Open Graph & Twitter)
Add standard meta tags for social sharing:
- `og:title`: Same as page title.
- `og:description`: Same as meta description.
- `og:type`: `website`
- `og:url`: `https://wranngle.com`
- `og:image`: `https://i.ibb.co/WWFmbjKJ/wranngle-wordmark-4096w.png` (using existing logo asset for now, or generate a specific social card).
- `twitter:card`: `summary_large_image`

### 3. Robots.txt
Create `client/public/robots.txt`:
```txt
User-agent: *
Allow: /
Sitemap: https://wranngle.com/sitemap.xml
```

### 4. Sitemap (Optional for Phase 1)
- Generate a static `sitemap.xml` listing the root URL.

## Implementation Plan
1.  Modify `client/index.html`.
2.  Create `client/public/robots.txt`.
3.  Verify metadata using a local linter or inspector.
