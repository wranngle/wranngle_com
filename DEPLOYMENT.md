# Cloudflare Pages Deployment Guide

This guide covers deploying wranngle.com to Cloudflare Pages with continuous deployment from GitHub.

## Prerequisites

- GitHub repository: `https://github.com/wranngle/wranngle.com`
- Cloudflare account (free tier is sufficient)
- n8n instance with configured webhook workflow

## Step 1: Connect GitHub to Cloudflare Pages

### 1.1 Create Cloudflare Pages Project

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create a project** → **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select repository: `wranngle/wranngle.com`

### 1.2 Configure Build Settings

Set the following build configuration:

- **Production branch**: `main`
- **Build command**: `bun run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave as default)

Click **Save and Deploy**

### 1.3 Wait for Initial Deployment

The first deployment will take 2-3 minutes. You can monitor progress in the deployment logs.

## Step 2: Configure Environment Variables

### 2.1 Add N8N_WEBHOOK_URL

1. In Cloudflare Pages, go to your project
2. Navigate to **Settings** → **Environment variables**
3. Click **Add variable**
4. Set:
   - **Variable name**: `N8N_WEBHOOK_URL`
   - **Value**: Your n8n webhook URL (e.g., `https://n8n.wranngle.com/webhook/wranngle-intake-form`)
   - **Environment**: Production (and optionally Preview)
5. Click **Save**

### 2.2 Optional: Add ALLOWED_ORIGIN

For stricter CORS security (optional):

1. Click **Add variable**
2. Set:
   - **Variable name**: `ALLOWED_ORIGIN`
   - **Value**: `https://wranngle.com` (or your custom domain)
   - **Environment**: Production
3. Click **Save**

### 2.3 Optional: Add Stripe Checkout

Stripe Checkout has no setup or monthly fee on standard pricing, but Stripe
does charge per successful transaction. To enable checkout from the order
receipt and route paid sessions into fulfillment:

1. Click **Add variable**
2. Set:
   - **Variable name**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe secret key, preferably a restricted key that can create Checkout Sessions
   - **Environment**: Production
3. Click **Add variable**
4. Set:
   - **Variable name**: `SITE_URL`
   - **Value**: `https://wranngle.com`
   - **Environment**: Production
5. In Stripe Dashboard, set public business policy URLs if you want Checkout
   to show the required Terms checkbox. Checkout will still work without this,
   but the site retries without `terms_of_service` consent if Stripe rejects it.
6. Add a Stripe webhook endpoint in Stripe Workbench:
   - **Endpoint URL**: `https://wranngle.com/api/stripe-webhook`
   - **Events**: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
7. Copy the endpoint signing secret from Stripe.
8. Click **Add variable**
9. Set:
   - **Variable name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: The Stripe webhook endpoint signing secret (`whsec_...`)
   - **Environment**: Production
10. Click **Save**

### 2.4 Trigger Redeploy

After adding environment variables:

1. Go to **Deployments**
2. Click **···** on the latest deployment
3. Click **Retry deployment**

Environment variables only take effect after a new deployment.

## Step 3: Configure Custom Domain (Optional)

### 3.1 Add Custom Domain

1. In your Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `wranngle.com`
4. Click **Continue**

### 3.2 DNS Configuration

If your domain is managed by Cloudflare DNS (recommended):

- DNS records will be automatically configured
- SSL certificate will be automatically provisioned

If using external DNS:

1. Add CNAME record:
   - **Name**: `@` (or your subdomain)
   - **Target**: `<project-name>.pages.dev`
2. Wait for DNS propagation (up to 48 hours, typically <1 hour)

## Step 4: Verify Deployment

### 4.1 Check Site Loads

1. Visit your deployment URL: `https://<project-name>.pages.dev`
2. Verify the site loads correctly
3. Check browser console for errors (F12 → Console)

### 4.2 Test Lead Capture Flow

1. Fill out the contact form with test data:
   - Business Name: `Test Business`
   - Industry: `HVAC`
   - Owner Name: `John Doe`
   - Phone: `+1-555-0100`
   - Email: `test@example.com`
   - Package: Select one
2. Submit the form
3. Verify in n8n:
   - Check **Executions** → Latest execution shows success
   - Verify Google Sheets has new row (if configured)
   - Check email was sent (if configured)

### 4.3 Test Rate Limiting

Use curl to test rate limiting (10 requests/minute limit):

```bash
# Send 11 requests rapidly
for i in {1..11}; do
  curl -X POST https://wranngle.com/api/leads \
    -H "Content-Type: application/json" \
    -d '{
      "businessName": "Test",
      "industry": "HVAC",
      "ownerName": "Test",
      "phone": "555-0100",
      "email": "test@example.com",
      "package": "basic"
    }'
  echo ""
done
```

The 11th request should return `429 Too Many Requests`.

## Step 5: Enable Continuous Deployment

Continuous deployment is automatically enabled. Any push to `main` branch will trigger a new deployment.

### 5.1 Deployment Workflow

```
git push origin main
  ↓
GitHub webhook triggers Cloudflare
  ↓
Cloudflare runs: bun run build
  ↓
Cloudflare deploys dist/ globally
  ↓
Production site updated (~2 min)
```

### 5.2 Preview Deployments

Pull requests automatically get preview deployments:

- Each PR gets a unique URL: `<commit-hash>.<project>.pages.dev`
- Preview deployments use Preview environment variables
- Useful for testing before merging to main

## Monitoring & Logs

### Application Logs

View Cloudflare Workers logs:

1. Go to **Workers & Pages** → Your project
2. Click **Logs** → **Begin log stream**
3. Trigger an API request (e.g., submit form)
4. View real-time logs including `console.log()` output

### Analytics

View traffic analytics:

1. Go to **Analytics** → **Web Analytics**
2. View page views, visitors, top pages
3. Monitor API endpoint usage

### Error Tracking

Monitor errors:

1. Go to **Logs** → **Errors**
2. View recent errors with stack traces
3. Filter by time range, status code, path

## Troubleshooting

### Build Fails

**Error**: `bun: command not found`

- **Fix**: Cloudflare Pages supports Bun natively. Ensure `bun.lock` is committed.

**Error**: Type checking fails

- **Fix**: Run `bun run check` locally to catch TypeScript errors before pushing.

### Lead Capture Not Working

**Error**: `Service temporarily unavailable`

- **Cause**: `N8N_WEBHOOK_URL` environment variable not set
- **Fix**: Add the environment variable in Cloudflare Pages settings and redeploy

**Error**: `Failed to process request`

- **Cause**: n8n webhook returned non-200 status
- **Fix**: Check n8n workflow is active and webhook path is correct

### Stripe Fulfillment Not Working

**Error**: Checkout succeeds but n8n fulfillment does not run

- **Cause**: Stripe webhook endpoint or `STRIPE_WEBHOOK_SECRET` is missing
- **Fix**: Create the Stripe webhook for `https://wranngle.com/api/stripe-webhook`, set `STRIPE_WEBHOOK_SECRET`, and redeploy

**Error**: Stripe webhook returns 400

- **Cause**: Missing or invalid `Stripe-Signature` header, often from using the wrong webhook signing secret
- **Fix**: Use the `whsec_...` secret from the exact live-mode endpoint that points at `https://wranngle.com/api/stripe-webhook`

### Rate Limiting Issues

**Error**: All requests return 429

- **Cause**: Rate limit store persists across requests but resets on worker restart
- **Fix**: Wait 60 seconds for rate limit window to reset

### CORS Errors

**Error**: `blocked by CORS policy`

- **Cause**: Frontend domain not matching `ALLOWED_ORIGIN`
- **Fix**: Either remove `ALLOWED_ORIGIN` (allows all origins) or set it to your domain

## Security Checklist

- [x] Rate limiting enabled (10 req/min per IP)
- [x] Input sanitization (HTML stripped, length limits)
- [x] Security headers (CSP, XSS, Clickjacking protection)
- [x] HTTPS only (automatic via Cloudflare)
- [x] Environment variables (secrets not in code)
- [x] Error messages (generic, no internal details leaked)

## Performance

Expected metrics:

- **Time to First Byte (TTFB)**: <100ms (Cloudflare global CDN)
- **Largest Contentful Paint (LCP)**: <1.5s
- **API Response Time**: <200ms (serverless function)
- **Build Time**: ~30-60 seconds

## Rollback

To rollback a deployment:

1. Go to **Deployments**
2. Find the last working deployment
3. Click **···** → **Rollback to this deployment**
4. Confirm rollback

Changes are instant (no rebuild required).

## Cost

Cloudflare Pages Free Tier:

- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds/month
- ✅ 1 build at a time
- ✅ Custom domains
- ✅ SSL certificates

This project stays within free tier limits.
