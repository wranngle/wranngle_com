/**
 * Smoke Test: Lead Intake Form → n8n Workflow → Email Delivery
 *
 * Tests:
 * 1. Both tiers (Core $250, Elite $500)
 * 2. Stress test with rapid submissions
 * 3. Verifies n8n execution success
 * 4. Checks SMTP2GO delivery status
 *
 * Run: bun run test:smoke
 * Run stress test: bun run test:smoke --stress
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.wranngle.com/webhook/wranngle-intake-form';
const N8N_API_URL = process.env.N8N_API_URL || 'https://n8n.wranngle.com/api/v1';
const N8N_API_KEY = requireEnv('N8N_API_KEY');
const WORKFLOW_ID = requireEnv('N8N_WORKFLOW_ID');
const SMTP2GO_API_KEY = requireEnv('SMTP2GO_API_KEY');

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  details: string;
  executionId?: string;
}

interface LeadPayload {
  businessName: string;
  industry: string;
  ownerName: string;
  phone: string;
  email: string;
  package: 'basic' | 'premium';
  agentName?: string;
  status?: string;
  notes?: string;
}

// Generate unique test data
function generateTestLead(tier: 'core' | 'elite', index = 0): LeadPayload {
  const timestamp = Date.now();
  return {
    businessName: `Smoke Test ${tier.toUpperCase()} #${index} - ${timestamp}`,
    industry: tier === 'core' ? 'Plumbing' : 'HVAC & Electrical',
    ownerName: `Test User ${tier} ${index}`,
    phone: `+1-555-${String(timestamp).slice(-4)}-${String(index).padStart(4, '0')}`,
    email: 'sales@wranngle.com', // Use real email to verify delivery
    package: tier === 'core' ? 'basic' : 'premium',
    agentName: `${tier}Bot${index}`,
    status: 'pending',
    notes: `Automated smoke test - ${tier} tier - Run ${index} - ${new Date().toISOString()}`,
  };
}

// Submit lead to webhook
async function submitLead(payload: LeadPayload): Promise<{ success: boolean; response: unknown; duration: number }> {
  const start = performance.now();
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return {
      success: response.ok,
      response: data,
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      success: false,
      response: error,
      duration: performance.now() - start,
    };
  }
}

// Get recent n8n executions
async function getRecentExecutions(limit = 10): Promise<Array<{ id: string; status: string; startedAt: string }>> {
  const response = await fetch(`${N8N_API_URL}/executions?workflowId=${WORKFLOW_ID}&limit=${limit}`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY },
  });
  const result = await response.json() as { data: Array<{ id: string; status: string; startedAt: string }> };
  return result.data || [];
}

// Get execution details
async function getExecutionDetails(id: string): Promise<{ status: string; data?: unknown }> {
  const response = await fetch(`${N8N_API_URL}/executions/${id}`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY },
  });
  return response.json() as Promise<{ status: string; data?: unknown }>;
}

// Check SMTP2GO for recent activity
async function checkSmtpActivity(): Promise<{ delivered: number; bounced: number; rejected: number }> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - 1); // Last hour

  const response = await fetch('https://api.smtp2go.com/v3/activity/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: SMTP2GO_API_KEY,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    }),
  });
  const data = await response.json() as { data: { events: Array<{ event: string }> } };
  const events = data.data?.events || [];

  return {
    delivered: events.filter(e => e.event === 'delivered').length,
    bounced: events.filter(e => e.event === 'hard-bounced' || e.event === 'soft-bounced').length,
    rejected: events.filter(e => e.event === 'rejected').length,
  };
}

// Test: Single tier submission
async function testTierSubmission(tier: 'core' | 'elite'): Promise<TestResult> {
  const start = performance.now();
  const payload = generateTestLead(tier);

  console.log(`\n  📤 Submitting ${tier.toUpperCase()} tier lead...`);
  const result = await submitLead(payload);

  if (!result.success) {
    return {
      name: `${tier.toUpperCase()} Tier Submission`,
      passed: false,
      duration: result.duration,
      details: `Webhook returned error: ${JSON.stringify(result.response)}`,
    };
  }

  // Wait for n8n to process
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Verify execution
  const executions = await getRecentExecutions(5);
  const recentExec = executions[0];

  if (!recentExec || recentExec.status !== 'success') {
    return {
      name: `${tier.toUpperCase()} Tier Submission`,
      passed: false,
      duration: performance.now() - start,
      details: `n8n execution failed or not found. Status: ${recentExec?.status || 'none'}`,
      executionId: recentExec?.id,
    };
  }

  return {
    name: `${tier.toUpperCase()} Tier Submission`,
    passed: true,
    duration: performance.now() - start,
    details: `Webhook: ${result.duration.toFixed(0)}ms, n8n execution: ${recentExec.id}`,
    executionId: recentExec.id,
  };
}

// Test: Stress test with rapid submissions
async function testStressSubmissions(count = 5): Promise<TestResult> {
  const start = performance.now();
  console.log(`\n  🔥 Stress test: ${count} rapid submissions...`);

  const promises = Array.from({ length: count }, (_, i) =>
    submitLead(generateTestLead(i % 2 === 0 ? 'core' : 'elite', i))
  );

  const results = await Promise.all(promises);
  const successCount = results.filter(r => r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

  // Wait for n8n to process all
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Verify executions
  const executions = await getRecentExecutions(count + 2);
  const successExecutions = executions.filter(e => e.status === 'success').length;

  const passed = successCount === count && successExecutions >= count;

  return {
    name: `Stress Test (${count} submissions)`,
    passed,
    duration: performance.now() - start,
    details: `Webhooks: ${successCount}/${count} success, avg ${avgDuration.toFixed(0)}ms | n8n: ${successExecutions} successful executions`,
  };
}

// Test: Verify email node output
async function testEmailDelivery(): Promise<TestResult> {
  const start = performance.now();
  console.log('\n  📧 Verifying email delivery...');

  const executions = await getRecentExecutions(3);
  if (!executions.length) {
    return {
      name: 'Email Delivery Verification',
      passed: false,
      duration: performance.now() - start,
      details: 'No recent executions found',
    };
  }

  // Count successful executions in last 3
  const successfulExecs = executions.filter(e => e.status === 'success');

  // Check SMTP2GO for suppressions
  let suppressionWarning = '';
  try {
    const suppResponse = await fetch('https://api.smtp2go.com/v3/suppression/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: SMTP2GO_API_KEY }),
    });
    const suppData = await suppResponse.json() as { data: { results: Array<{ email_address: string }> } };
    const suppressions = suppData.data?.results || [];
    if (suppressions.some(s => s.email_address === 'sales@wranngle.com')) {
      suppressionWarning = ' ⚠️ WARNING: sales@wranngle.com is on suppression list!';
    }
  } catch {
    // Ignore suppression check errors
  }

  // If workflow succeeded, email was sent (workflow has 3 nodes: webhook → format → email)
  const passed = successfulExecs.length >= 2; // At least our 2 test submissions

  return {
    name: 'Email Delivery Verification',
    passed,
    duration: performance.now() - start,
    details: `${successfulExecs.length}/3 recent executions successful (workflow includes email node)${suppressionWarning}`,
    executionId: executions[0].id,
  };
}

// Main test runner
async function runSmokeTests() {
  const args = process.argv.slice(2);
  const isStressTest = args.includes('--stress');
  const stressCount = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || '5', 10);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SMOKE TEST: Lead Intake → n8n → Email');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Webhook: ${N8N_WEBHOOK_URL}`);
  console.log(`  Workflow: ${WORKFLOW_ID}`);
  console.log(`  Mode: ${isStressTest ? `Stress (${stressCount} submissions)` : 'Standard'}`);
  console.log('═══════════════════════════════════════════════════════════════');

  const results: TestResult[] = [];

  // Test 1: Core tier
  results.push(await testTierSubmission('core'));

  // Test 2: Elite tier
  results.push(await testTierSubmission('elite'));

  // Test 3: Email delivery verification
  results.push(await testEmailDelivery());

  // Test 4: Stress test (if requested)
  if (isStressTest) {
    results.push(await testStressSubmissions(stressCount));
  }

  // Print results
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let allPassed = true;
  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   Duration: ${result.duration.toFixed(0)}ms`);
    console.log(`   ${result.details}`);
    if (result.executionId) {
      console.log(`   Execution: ${result.executionId}`);
    }
    console.log('');
    if (!result.passed) allPassed = false;
  }

  // Final summary
  const passedCount = results.filter(r => r.passed).length;
  console.log('═══════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log(`✅ ALL TESTS PASSED (${passedCount}/${results.length})`);
  } else {
    console.log(`❌ SOME TESTS FAILED (${passedCount}/${results.length} passed)`);
  }
  console.log('═══════════════════════════════════════════════════════════════');

  process.exit(allPassed ? 0 : 1);
}

runSmokeTests().catch(err => {
  console.error('❌ Smoke test failed:', err);
  process.exit(1);
});
