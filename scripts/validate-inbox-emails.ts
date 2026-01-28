/**
 * Validate emails in inbox against design system
 */

import { spawn } from 'child_process';

interface Email {
  subject: string;
  body: { content: string };
  receivedDateTime: string;
}

const DEPRECATED_COLORS = ['#0ea5e9', '#f0f9ff', '#bae6fd'];
const REQUIRED_COLORS = ['#ff5f00', '#12111a'];

// Coherence issues to check for
const COHERENCE_ISSUES = [
  { pattern: /reply to this email/i, issue: '"Reply to this email" with noreply sender' },
  { pattern: /contact support(?!@)/i, issue: 'Vague "contact support" without email' },
  { pattern: /contact our support team(?!.*@)/i, issue: 'Vague support reference without email' },
];

async function getEmails(): Promise<Email[]> {
  return new Promise((resolve, reject) => {
    const proc = spawn('m365', ['outlook', 'message', 'list', '--output', 'json'], { shell: true });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data; });
    proc.stderr.on('data', (data) => { stderr += data; });
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr));
      } else {
        resolve(JSON.parse(stdout));
      }
    });
  });
}

async function main() {
  const testRunId = process.argv[2] || '1769293686299';

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  INBOX VALIDATION - ALL TEMPLATE TYPES');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Test Run ID: ${testRunId}\n`);

  const emails = await getEmails();
  const testEmails = emails.filter((e) => e.subject.includes(testRunId));

  if (testEmails.length === 0) {
    console.log('❌ No test emails found in inbox');
    process.exit(1);
  }

  console.log(`  Found ${testEmails.length} test emails\n`);

  let allPassed = true;

  for (const email of testEmails) {
    const html = email.body.content.toLowerCase();
    const subject = email.subject.replace(`[${testRunId}]`, '').trim();

    const hasDeprecated = DEPRECATED_COLORS.some((c) => html.includes(c.toLowerCase()));
    const hasRequired = REQUIRED_COLORS.every((c) => html.includes(c.toLowerCase()));

    // Check for coherence issues
    const coherenceIssues = COHERENCE_ISSUES.filter((check) => check.pattern.test(html));
    const hasCoherenceIssues = coherenceIssues.length > 0;

    const passed = !hasDeprecated && hasRequired && !hasCoherenceIssues;

    if (!passed) allPassed = false;

    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${subject}`);
    console.log(`   Deprecated colors: ${hasDeprecated ? '❌ FOUND' : '✅ None'}`);
    console.log(`   Required colors:   ${hasRequired ? '✅ Present' : '❌ Missing'}`);
    console.log(`   Coherence:         ${hasCoherenceIssues ? '❌ Issues found' : '✅ Pass'}`);
    if (hasCoherenceIssues) {
      coherenceIssues.forEach((issue) => {
        console.log(`     ⚠️  ${issue.issue}`);
      });
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(allPassed ? '✅ ALL TEMPLATES PASS DESIGN SYSTEM VALIDATION' : '❌ SOME TEMPLATES FAILED');
  console.log('═══════════════════════════════════════════════════════════════');

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
