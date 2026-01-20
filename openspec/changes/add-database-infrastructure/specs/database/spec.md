## ADDED Requirements

### Requirement: Database Connection
The system SHALL establish secure connections to the PostgreSQL database using connection pooling.

#### Scenario: Successful connection
- **WHEN** a Cloudflare Worker executes a database query
- **THEN** a connection is established from the pool
- **AND** the query executes successfully
- **AND** the connection is returned to the pool

#### Scenario: Connection failure
- **WHEN** the database is unreachable
- **THEN** the connection attempt times out after 10 seconds
- **AND** an error is logged
- **AND** a 503 Service Unavailable response is returned to the client

#### Scenario: Connection pool exhaustion
- **WHEN** all connections in the pool are in use
- **THEN** new requests wait up to 5 seconds for an available connection
- **AND** if no connection becomes available, an error is returned

### Requirement: Users Table
The system SHALL store user account information in the users table.

#### Scenario: User record creation
- **WHEN** a new user signs up via Clerk
- **THEN** a corresponding record is created in the users table
- **AND** the Clerk user ID is stored as a unique identifier
- **AND** email and name are synced from Clerk
- **AND** timestamps are automatically set

#### Scenario: User record retrieval
- **WHEN** a user ID is provided
- **THEN** the complete user record is retrieved from the database
- **AND** includes all profile information and metadata

#### Scenario: Duplicate email prevention
- **WHEN** an attempt is made to create a user with an existing email
- **THEN** the database rejects the insert with a unique constraint violation
- **AND** the application handles the error gracefully

### Requirement: Subscriptions Table
The system SHALL store subscription and billing information in the subscriptions table.

#### Scenario: Subscription creation
- **WHEN** a user subscribes to a plan via Stripe
- **THEN** a subscription record is created
- **AND** links to the user via foreign key
- **AND** stores Stripe subscription and customer IDs
- **AND** stores plan tier (basic or premium)
- **AND** stores billing period dates

#### Scenario: Subscription status update
- **WHEN** Stripe sends a subscription status webhook
- **THEN** the subscription record is updated with the new status
- **AND** status is one of: active, canceled, past_due, trialing
- **AND** cancellation date is set if applicable

#### Scenario: Active subscription query
- **WHEN** checking if a user has an active subscription
- **THEN** the system queries for subscriptions with status 'active' or 'trialing'
- **AND** where current_period_end is in the future
- **AND** returns true if such a subscription exists

### Requirement: Agents Table
The system SHALL store AI agent configurations in the agents table.

#### Scenario: Agent creation
- **WHEN** a new AI agent is provisioned for a user
- **THEN** an agent record is created
- **AND** links to the user via foreign key
- **AND** stores ElevenLabs agent ID and Twilio phone number
- **AND** stores agent name and voice configuration
- **AND** status is set to 'provisioning'

#### Scenario: Agent status transition
- **WHEN** an agent completes provisioning
- **THEN** the status is updated to 'active'
- **AND** the agent is available for handling calls

#### Scenario: Agent knowledge base update
- **WHEN** a user updates their agent's knowledge base
- **THEN** the knowledge_base JSONB field is updated
- **AND** the updated_at timestamp is set
- **AND** the change is reflected in the ElevenLabs agent configuration

### Requirement: Usage Events Table
The system SHALL log all usage events for billing and analytics.

#### Scenario: Voice call logging
- **WHEN** a voice call is completed
- **THEN** a usage event record is created with type 'voice_call'
- **AND** includes duration in seconds
- **AND** includes Twilio call SID as external_id
- **AND** includes cost calculation in cents
- **AND** occurred_at timestamp is set to call start time

#### Scenario: SMS message logging
- **WHEN** an SMS is sent or received
- **THEN** a usage event record is created with type 'sms_sent' or 'sms_received'
- **AND** includes Twilio message SID as external_id
- **AND** includes cost in cents
- **AND** duration_seconds is null for SMS events

#### Scenario: Usage aggregation query
- **WHEN** calculating monthly usage for a user
- **THEN** all usage events for the billing period are summed
- **AND** voice minutes are calculated from duration_seconds
- **AND** SMS counts are retrieved by counting SMS events
- **AND** total cost is summed across all events

### Requirement: Invoices Table
The system SHALL store invoice records synced from Stripe.

#### Scenario: Invoice creation
- **WHEN** Stripe generates an invoice
- **THEN** an invoice record is created in the database
- **AND** links to the user via foreign key
- **AND** stores Stripe invoice ID, amount, and status
- **AND** stores invoice and PDF URLs

#### Scenario: Invoice payment
- **WHEN** an invoice is paid
- **THEN** the status is updated to 'paid'
- **AND** paid_at timestamp is set
- **AND** the user's subscription status remains active

#### Scenario: Unpaid invoice handling
- **WHEN** an invoice becomes overdue
- **THEN** the status is updated to 'open' or 'uncollectible'
- **AND** the associated subscription status is updated to 'past_due'

### Requirement: Audit Logs Table
The system SHALL log significant user actions for security and compliance.

#### Scenario: User action logging
- **WHEN** a user performs a significant action (login, subscription change, agent creation)
- **THEN** an audit log entry is created
- **AND** includes user ID, action type, and affected resource
- **AND** includes IP address and user agent
- **AND** includes occurred_at timestamp

#### Scenario: Admin action logging
- **WHEN** an admin performs an action on behalf of a user
- **THEN** an audit log entry indicates the admin user ID
- **AND** metadata includes the target user ID

#### Scenario: Audit log querying
- **WHEN** retrieving audit logs for a user
- **THEN** logs are returned in reverse chronological order
- **AND** can be filtered by action type or date range
- **AND** pagination is supported for large result sets

### Requirement: Database Migrations
The system SHALL use a migration system to manage schema changes.

#### Scenario: Migration generation
- **WHEN** the database schema is modified
- **THEN** a new migration file is generated by Drizzle Kit
- **AND** the migration includes SQL for both up and down operations
- **AND** the migration is version-controlled in the repository

#### Scenario: Migration execution
- **WHEN** a migration is applied
- **THEN** the SQL is executed in a transaction
- **AND** if successful, the migration is recorded as applied
- **AND** if failed, the transaction is rolled back

#### Scenario: Migration rollback
- **WHEN** a migration needs to be reverted
- **THEN** the down migration SQL is executed
- **AND** the database returns to the previous state
- **AND** the migration is marked as unapplied

### Requirement: Database Indexes
The system SHALL maintain indexes for optimal query performance.

#### Scenario: Primary key indexes
- **WHEN** a table is created
- **THEN** the primary key column has an automatic index
- **AND** queries by ID use the index

#### Scenario: Foreign key indexes
- **WHEN** a foreign key relationship exists
- **THEN** an index exists on the foreign key column
- **AND** join queries use the index for performance

#### Scenario: Unique constraint indexes
- **WHEN** a unique constraint is defined (email, clerk_user_id)
- **THEN** a unique index is created
- **AND** duplicate value insertion is prevented

#### Scenario: Query performance indexes
- **WHEN** a column is frequently queried (occurred_at for time-range queries)
- **THEN** an index exists on that column
- **AND** queries use the index as confirmed by EXPLAIN ANALYZE

### Requirement: Data Integrity
The system SHALL enforce data integrity through constraints and validation.

#### Scenario: Foreign key constraint enforcement
- **WHEN** inserting a record with a foreign key
- **THEN** the referenced record must exist
- **AND** insertion fails with a foreign key violation if not

#### Scenario: Not-null constraint enforcement
- **WHEN** inserting a record with required fields
- **THEN** all not-null columns must have values
- **AND** insertion fails if any required field is missing

#### Scenario: Cascading deletes
- **WHEN** a user is deleted (soft or hard)
- **THEN** related records are handled according to cascade rules
- **AND** orphaned records are prevented

### Requirement: Transaction Support
The system SHALL support database transactions for atomic operations.

#### Scenario: Multi-table transaction
- **WHEN** an operation requires changes to multiple tables
- **THEN** all changes are wrapped in a transaction
- **AND** either all changes commit or all are rolled back

#### Scenario: Transaction rollback
- **WHEN** an error occurs during a transaction
- **THEN** the transaction is automatically rolled back
- **AND** the database remains in a consistent state
- **AND** the error is propagated to the caller

#### Scenario: Transaction commit
- **WHEN** all operations in a transaction succeed
- **THEN** the transaction is committed
- **AND** all changes are persisted to the database

### Requirement: Connection Pooling
The system SHALL use connection pooling to efficiently manage database connections.

#### Scenario: Connection reuse
- **WHEN** multiple requests are processed
- **THEN** connections are reused from the pool
- **AND** connection overhead is minimized

#### Scenario: Idle connection cleanup
- **WHEN** connections remain idle beyond the timeout period
- **THEN** they are closed and removed from the pool
- **AND** resources are freed

#### Scenario: Connection pool scaling
- **WHEN** request volume increases
- **THEN** the pool creates new connections up to the maximum limit
- **AND** excess requests wait for available connections

### Requirement: Backup and Recovery
The system SHALL maintain automated backups for disaster recovery.

#### Scenario: Automatic backup
- **WHEN** using Neon's built-in backup system
- **THEN** continuous backups are maintained
- **AND** point-in-time recovery is available within retention period

#### Scenario: Manual backup creation
- **WHEN** a manual backup is requested
- **THEN** a pg_dump is executed
- **AND** the backup file is stored securely
- **AND** the backup is tested for restorability

#### Scenario: Database restore
- **WHEN** a database restore is needed
- **THEN** the system can restore from any point within the retention window
- **AND** the restore is tested on a staging branch first
- **AND** data integrity is verified post-restore
