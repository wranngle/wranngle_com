# Change: Add Database Infrastructure

## Why
The application currently has no data persistence layer. All customer data, subscription information, agent configurations, and usage metrics need to be stored in a database. This is a foundational requirement for transitioning from a lead capture landing page to a full SaaS platform.

## What Changes
- **Database Provisioning**: Set up Neon Serverless PostgreSQL instance
- **ORM Configuration**: Configure Drizzle ORM (already in package.json)
- **Database Schema**: Define tables for users, subscriptions, agents, usage, invoices
- **Migration System**: Set up database migration workflow
- **Connection Pooling**: Configure connection pool for serverless environment
- **Backup Strategy**: Implement automated backups and point-in-time recovery

## Impact
- **Affected specs**: New `database` capability
- **Affected code**:
  - `shared/db/schema.ts` - New database schema definitions
  - `shared/db/connection.ts` - New database connection client
  - `shared/db/migrations/` - Migration files
  - `functions/api/*` - Add database queries to API endpoints
  - `package.json` - Add database-related scripts
- **Infrastructure**: Neon PostgreSQL database (free tier: 512 MB storage, 1 compute unit)
- **Environment Variables**: Add `DATABASE_URL` to Cloudflare Pages

## Breaking Changes
- None (additive change)

## Technical Approach

### Database Provider: Neon Serverless Postgres
**Why Neon over alternatives:**
- **Serverless-native**: Automatic scaling, pay-per-use
- **Free tier**: 512 MB storage, sufficient for MVP (1000+ customers)
- **Instant branching**: Create database copies for testing/staging
- **Auto-scaling**: Scales compute to zero when idle
- **Built-in connection pooling**: Works perfectly with Cloudflare Workers
- **PostgreSQL compatible**: Full SQL support, excellent ecosystem

**Alternatives considered:**
- PlanetScale MySQL: Good but less generous free tier
- Supabase: Great but overkill (we don't need their auth/storage/realtime features)
- Turso SQLite: Excellent edge database but less mature ecosystem
- **Verdict**: Neon provides the best balance of features, cost, and serverless compatibility

### ORM: Drizzle
**Why Drizzle over alternatives:**
- **Already in package.json**: Minimal new dependencies
- **Type-safe**: Full TypeScript support with inferred types
- **Lightweight**: Small bundle size, perfect for edge functions
- **SQL-like syntax**: Easy to learn, close to raw SQL
- **Migration system**: Built-in schema migrations
- **Serverless-friendly**: Works well with connection pooling

**Alternatives considered:**
- Prisma: Heavy, slow cold starts on serverless
- TypeORM: More complex, larger bundle
- **Verdict**: Drizzle is the best choice for Cloudflare Workers

## Database Schema

### Core Tables

**users**
- `id` (uuid, primary key)
- `clerk_user_id` (text, unique) - Links to Clerk authentication
- `email` (text, unique)
- `name` (text)
- `business_name` (text)
- `industry` (text)
- `phone` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**subscriptions**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key → users.id)
- `stripe_subscription_id` (text, unique)
- `stripe_customer_id` (text)
- `plan_id` (text) - 'basic' | 'premium'
- `status` (text) - 'active' | 'canceled' | 'past_due' | 'trialing'
- `current_period_start` (timestamp)
- `current_period_end` (timestamp)
- `cancel_at_period_end` (boolean)
- `trial_end` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**agents**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key → users.id)
- `name` (text) - Agent display name
- `elevenlabs_agent_id` (text, unique)
- `twilio_phone_number` (text, unique)
- `voice_id` (text) - ElevenLabs voice identifier
- `status` (text) - 'provisioning' | 'active' | 'suspended' | 'deleted'
- `knowledge_base` (jsonb) - Agent configuration and training data
- `created_at` (timestamp)
- `updated_at` (timestamp)

**usage_events**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key → users.id)
- `agent_id` (uuid, foreign key → agents.id)
- `event_type` (text) - 'voice_call' | 'sms_sent' | 'sms_received'
- `duration_seconds` (integer, nullable) - For voice calls
- `external_id` (text) - Twilio call SID or message SID
- `cost_cents` (integer) - Cost in cents
- `metadata` (jsonb) - Additional event data
- `occurred_at` (timestamp)
- `created_at` (timestamp)

**invoices**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key → users.id)
- `stripe_invoice_id` (text, unique)
- `amount_cents` (integer)
- `status` (text) - 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
- `due_date` (timestamp)
- `paid_at` (timestamp, nullable)
- `invoice_url` (text)
- `invoice_pdf` (text)
- `created_at` (timestamp)

**audit_logs**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key → users.id, nullable)
- `action` (text) - Action performed
- `resource_type` (text) - Type of resource affected
- `resource_id` (text) - ID of affected resource
- `metadata` (jsonb) - Additional context
- `ip_address` (text)
- `user_agent` (text)
- `occurred_at` (timestamp)

### Indexes
- `users.clerk_user_id` (unique)
- `users.email` (unique)
- `subscriptions.user_id`
- `subscriptions.stripe_subscription_id` (unique)
- `agents.user_id`
- `agents.elevenlabs_agent_id` (unique)
- `usage_events.user_id`
- `usage_events.agent_id`
- `usage_events.occurred_at` (for time-range queries)
- `invoices.user_id`
- `audit_logs.user_id`
- `audit_logs.occurred_at`

## Migration Strategy
1. **Phase 1**: Core tables (users, subscriptions)
2. **Phase 2**: Agent tables (agents, usage_events)
3. **Phase 3**: Billing tables (invoices, audit_logs)
4. Each phase has rollback capability
5. Migrations tested on Neon branch before production

## Backup & Recovery
- **Automatic Backups**: Neon provides continuous backups (point-in-time recovery)
- **Retention**: 7 days for free tier, 30 days for paid
- **Recovery**: Can restore to any point in time within retention period
- **Manual Backups**: `pg_dump` for critical milestones
- **Testing**: Restore backups to staging branch monthly

## Security Considerations
- **Encryption at Rest**: Neon encrypts all data at rest (AES-256)
- **Encryption in Transit**: TLS 1.3 for all connections
- **Access Control**: Least-privilege principle for database users
- **Connection Security**: Use connection pooling with authentication
- **Secrets Management**: Database URL stored as environment variable, never in code
- **SQL Injection Prevention**: Drizzle ORM parameterized queries only

## Performance Considerations
- **Connection Pooling**: Use Neon's serverless driver (no connection overhead)
- **Query Optimization**: Add indexes on foreign keys and frequently queried columns
- **Pagination**: Implement cursor-based pagination for large result sets
- **Caching**: Consider adding Redis (Upstash) for hot data (later phase)
- **Read Replicas**: Available on Neon paid plans if needed

## Cost Estimation
- **Free Tier**: $0/month (up to 512 MB storage, sufficient for MVP)
- **Scale Plan**: $19/month (3 GB storage, ~10,000 customers)
- **Business Plan**: $69/month (15 GB storage, ~50,000 customers)

## Testing Requirements
- [ ] Database connection successful from Cloudflare Workers
- [ ] All migrations run successfully
- [ ] CRUD operations work for all tables
- [ ] Foreign key constraints enforced
- [ ] Indexes improve query performance
- [ ] Backup and restore process works
- [ ] Connection pooling handles concurrent requests
- [ ] Database scales to zero when idle (cost savings)

## Open Questions
1. Should we use UUID v4 or v7 (time-sortable) for primary keys? **Recommendation**: UUIDv7 for better index performance
2. Should we add soft deletes (deleted_at column) or hard delete records? **Recommendation**: Soft deletes for compliance and recovery
3. Should we partition the usage_events table by date? **Recommendation**: Not in MVP, add when table exceeds 1M rows
