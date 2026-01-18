## 1. Research & Documentation
- [x] 1.1 Research Digital Ocean vs Cloudflare costs
- [x] 1.2 Document serverless refactor requirements
- [x] 1.3 Save documentation to OpenSpec

## 2. Refactor (Proposed)
- [ ] 2.1 Remove Express dependencies and server entry point
- [ ] 2.2 Create `/functions/api/leads.ts` for Cloudflare
- [ ] 2.3 Implement n8n webhook integration for data persistence
- [ ] 2.4 Verify build compatibility with Bun/Vite for Cloudflare

## 3. Deployment (Proposed)
- [ ] 3.1 Connect GitHub repository to Cloudflare Pages
- [ ] 3.2 Configure environment variables (n8n Webhook URL)
- [ ] 3.3 Verify production URL and lead capture flow
