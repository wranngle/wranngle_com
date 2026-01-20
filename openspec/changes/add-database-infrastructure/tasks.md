## 1. Neon Database Setup
- [ ] 1.1 Create Neon account and project
- [ ] 1.2 Provision PostgreSQL database (free tier)
- [ ] 1.3 Create database branches (main, staging, development)
- [ ] 1.4 Copy connection strings to environment variables
- [ ] 1.5 Configure connection pooling
- [ ] 1.6 Test database connectivity

## 2. Drizzle ORM Configuration
- [ ] 2.1 Install required packages (@neondatabase/serverless, drizzle-orm, drizzle-kit)
- [ ] 2.2 Create drizzle.config.ts configuration file
- [ ] 2.3 Set up database connection client in shared/db/connection.ts
- [ ] 2.4 Configure Drizzle for Cloudflare Workers compatibility
- [ ] 2.5 Add database scripts to package.json (migrate, generate, studio)

## 3. Database Schema Definition
- [ ] 3.1 Create shared/db/schema/ directory
- [ ] 3.2 Define users table schema
- [ ] 3.3 Define subscriptions table schema
- [ ] 3.4 Define agents table schema
- [ ] 3.5 Define usage_events table schema
- [ ] 3.6 Define invoices table schema
- [ ] 3.7 Define audit_logs table schema
- [ ] 3.8 Add indexes and foreign key constraints
- [ ] 3.9 Export all schemas from shared/db/schema.ts

## 4. Migration System
- [ ] 4.1 Generate initial migration from schema
- [ ] 4.2 Review generated SQL for correctness
- [ ] 4.3 Test migration on development branch
- [ ] 4.4 Run migration on staging branch
- [ ] 4.5 Verify schema applied correctly
- [ ] 4.6 Document rollback procedure

## 5. Database Access Layer
- [ ] 5.1 Create database query helpers in shared/db/queries/
- [ ] 5.2 Implement user CRUD operations
- [ ] 5.3 Implement subscription CRUD operations
- [ ] 5.4 Implement agent CRUD operations
- [ ] 5.5 Implement usage event logging functions
- [ ] 5.6 Implement invoice CRUD operations
- [ ] 5.7 Add transaction support for multi-table operations

## 6. API Integration
- [ ] 6.1 Add database client to Cloudflare Workers context
- [ ] 6.2 Update /api/leads to insert into database
- [ ] 6.3 Create /api/users endpoints (get, update)
- [ ] 6.4 Create /api/subscriptions endpoints
- [ ] 6.5 Create /api/agents endpoints
- [ ] 6.6 Create /api/usage endpoints (for analytics)
- [ ] 6.7 Add authentication middleware to validate user access

## 7. Seed Data
- [ ] 7.1 Create seed script for development data
- [ ] 7.2 Add sample users for testing
- [ ] 7.3 Add sample subscriptions (basic and premium)
- [ ] 7.4 Add sample agents
- [ ] 7.5 Add sample usage events
- [ ] 7.6 Document seed data reset process

## 8. Testing
- [ ] 8.1 Write unit tests for query functions
- [ ] 8.2 Test foreign key constraints
- [ ] 8.3 Test unique constraints (email, clerk_user_id)
- [ ] 8.4 Test pagination queries
- [ ] 8.5 Test transaction rollbacks
- [ ] 8.6 Load test with concurrent requests
- [ ] 8.7 Test connection pooling under load

## 9. Monitoring & Observability
- [ ] 9.1 Set up database query logging (development only)
- [ ] 9.2 Add slow query detection
- [ ] 9.3 Monitor connection pool usage
- [ ] 9.4 Set up Neon dashboard alerts (storage, compute usage)
- [ ] 9.5 Add database error tracking to Sentry

## 10. Backup & Recovery
- [ ] 10.1 Verify Neon automatic backups enabled
- [ ] 10.2 Document point-in-time recovery process
- [ ] 10.3 Create manual backup script (pg_dump)
- [ ] 10.4 Test restore from backup to staging branch
- [ ] 10.5 Schedule monthly backup tests
- [ ] 10.6 Document disaster recovery runbook

## 11. Documentation
- [ ] 11.1 Document database schema with ERD diagram
- [ ] 11.2 Document migration workflow
- [ ] 11.3 Document query patterns and best practices
- [ ] 11.4 Update README with database setup instructions
- [ ] 11.5 Create database troubleshooting guide
- [ ] 11.6 Document environment variables needed

## 12. Deployment
- [ ] 12.1 Add DATABASE_URL to Cloudflare Pages environment variables
- [ ] 12.2 Run migrations on production database
- [ ] 12.3 Verify production database connectivity
- [ ] 12.4 Test API endpoints with real database
- [ ] 12.5 Monitor for database errors in production
- [ ] 12.6 Set up database performance monitoring
