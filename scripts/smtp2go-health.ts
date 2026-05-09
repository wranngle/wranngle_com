/**
 * SMTP2GO Health Check & Observability
 *
 * Checks for:
 * - Suppressed email addresses (bounces, complaints)
 * - Recent delivery failures
 * - Email delivery rates
 *
 * Run: bun run scripts/smtp2go-health.ts
 *
 * IMPORTANT: If sales@wranngle.com is on suppression list,
 * run with --clear-suppression flag to remove it.
 */

const {SMTP2GO_API_KEY} = process.env;
if (!SMTP2GO_API_KEY) {
  console.error('❌ Missing required environment variable: SMTP2GO_API_KEY');
  process.exit(1);
}

const CRITICAL_EMAILS = new Set(['sales@wranngle.com', 'noreply@wranngle.com']);

interface SuppressionEntry {
  email_address: string;
  reason: string;
  block_description: string;
  timestamp: string;
}

interface EmailEvent {
  email_id: string;
  date: string;
  event: string;
  recipient: string;
  subject: string;
  smtp_response?: string;
}

async function apiCall<T>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`https://api.smtp2go.com/v3/${endpoint}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({api_key: SMTP2GO_API_KEY, ...body}),
  });
  const data = (await response.json()) as {data: T};
  return data.data;
}

async function checkSuppressions(): Promise<SuppressionEntry[]> {
  const result = await apiCall<{results: SuppressionEntry[]}>(
    'suppression/view',
    {},
  );
  return result.results;
}

async function clearSuppression(email: string): Promise<void> {
  console.log(`🔓 Removing ${email} from suppression list...`);
  await apiCall('suppression/remove', {email_address: email, reason: 'bounce'});
  console.log(`✅ Removed ${email} from suppression list`);
}

async function getRecentActivity(days = 1): Promise<EmailEvent[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await apiCall<{events: EmailEvent[]}>('activity/search', {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  });
  return result.events;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear-suppression');

  console.log('═══════════════════════════════════════════');
  console.log('  SMTP2GO Health Check');
  console.log('═══════════════════════════════════════════\n');

  // Check suppressions
  console.log('📋 Checking suppression list...');
  const suppressions = await checkSuppressions();

  if (suppressions.length === 0) {
    console.log('✅ No suppressed addresses\n');
  } else {
    console.log(`⚠️  ${suppressions.length} suppressed address(es):\n`);
    for (const s of suppressions) {
      const isCritical = CRITICAL_EMAILS.has(s.email_address);
      const icon = isCritical ? '🚨' : '⚠️';
      console.log(`${icon} ${s.email_address}`);
      console.log(`   Reason: ${s.reason}`);
      console.log(`   Since: ${s.timestamp}`);
      console.log(`   Details: ${s.block_description}\n`);

      if (isCritical && shouldClear) {
        await clearSuppression(s.email_address);
      }
    }

    const criticalSuppressed = suppressions.filter((s) =>
      CRITICAL_EMAILS.has(s.email_address),
    );
    if (criticalSuppressed.length > 0 && !shouldClear) {
      console.log('🚨 CRITICAL: sales@wranngle.com is suppressed!');
      console.log('   Run with --clear-suppression to remove it.\n');
    }
  }

  // Check recent activity
  console.log('📊 Recent email activity (last 24h)...');
  const events = await getRecentActivity(1);

  const delivered = events.filter((e) => e.event === 'delivered').length;
  const bounced = events.filter(
    (e) => e.event === 'hard-bounced' || e.event === 'soft-bounced',
  ).length;
  const rejected = events.filter((e) => e.event === 'rejected').length;
  const processed = events.filter((e) => e.event === 'processed').length;

  console.log(`   Processed: ${processed}`);
  console.log(`   Delivered: ${delivered}`);
  console.log(`   Bounced:   ${bounced}`);
  console.log(`   Rejected:  ${rejected}\n`);

  // Alert on failures
  if (bounced > 0 || rejected > 0) {
    console.log('⚠️  Recent failures detected:\n');
    const failures = events.filter(
      (e) =>
        e.event === 'hard-bounced' ||
        e.event === 'soft-bounced' ||
        e.event === 'rejected',
    );
    for (const f of failures.slice(0, 5)) {
      console.log(`   ${f.event}: ${f.recipient}`);
      console.log(`   Subject: ${f.subject}`);
      console.log(`   Response: ${f.smtp_response || 'N/A'}\n`);
    }
  }

  // Summary
  console.log('═══════════════════════════════════════════');
  const hasIssues = suppressions.length > 0 || bounced > 0 || rejected > 0;
  if (hasIssues) {
    console.log('⚠️  STATUS: Issues detected - review above');
    process.exit(1);
  } else {
    console.log('✅ STATUS: Healthy');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});
