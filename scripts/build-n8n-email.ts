/**
 * Build n8n-compatible email HTML from templates
 *
 * IMPORTANT: n8n emailSend node parameters:
 * - emailFormat: "html" | "text" (NOT emailType)
 * - html: string (NOT message) - for HTML content
 * - text: string - for plain text content
 *
 * Reference: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.sendemail/
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const root = 'C:/Users/root/Documents/dev/wranngle.com';

// Read templates
const masterTemplate = readFileSync(join(root, 'email-templates/master/master-template.html'), 'utf8');
const contentTemplate = readFileSync(join(root, 'email-templates/templates/lead-intake.html'), 'utf8');

// Combine: insert content into master
let fullHtml = masterTemplate.replace('{{CONTENT_BLOCK}}', contentTemplate);

// Replace template placeholders with n8n expressions
const replacements: Record<string, string> = {
  '{{EMAIL_TITLE}}': 'New Lead: {{ $json.businessName }}',
  '{{PREHEADER_TEXT}}': 'New lead from {{ $json.businessName }} - {{ $json.industry }}',
  '{{BUSINESS_NAME}}': '{{ $json.businessName }}',
  '{{INDUSTRY}}': '{{ $json.industry }}',
  '{{OWNER_NAME}}': '{{ $json.ownerName }}',
  '{{EMAIL}}': '{{ $json.email }}',
  '{{PHONE}}': '{{ $json.phone }}',
  '{{PACKAGE}}': '{{ $json.package }}',
  '{{AGENT_NAME}}': '{{ $json.agentName }}',
  '{{NOTES}}': '{{ $json.notes }}',
  '{{STATUS}}': '{{ $json.status }}',
  '{{TIMESTAMP}}': '{{ $json.timestamp }}',
  '{{UNSUBSCRIBE_URL}}': '#',
  '{{COMPANY_ADDRESS}}': 'Wranngle Systems LLC',
  '{{TRACKING_PIXEL}}': '',
};

for (const [placeholder, n8nExpr] of Object.entries(replacements)) {
  fullHtml = fullHtml.split(placeholder).join(n8nExpr);
}

// Create n8n workflow JSON
const workflow = {
  name: "Wranngle Lead Intake",
  nodes: [
    {
      id: "webhook-1",
      name: "Webhook Trigger",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [250, 300],
      webhookId: "wranngle-intake-form",
      parameters: {
        path: "wranngle-intake-form",
        httpMethod: "POST",
        responseMode: "onReceived",
        responseData: "{ \"success\": true, \"message\": \"Lead received\" }",
        options: {}
      }
    },
    {
      id: "set-1",
      name: "Format Lead Data",
      type: "n8n-nodes-base.set",
      typeVersion: 3,
      position: [450, 300],
      parameters: {
        mode: "manual",
        assignments: {
          assignments: [
            {id: "timestamp", name: "timestamp", value: "={{ $now.format(\"yyyy-MM-dd HH:mm:ss\") }} UTC", type: "string"},
            {id: "businessName", name: "businessName", value: "={{ $json.businessName }}", type: "string"},
            {id: "industry", name: "industry", value: "={{ $json.industry }}", type: "string"},
            {id: "ownerName", name: "ownerName", value: "={{ $json.ownerName }}", type: "string"},
            {id: "phone", name: "phone", value: "={{ $json.phone }}", type: "string"},
            {id: "email", name: "email", value: "={{ $json.email }}", type: "string"},
            {id: "package", name: "package", value: "={{ $json.package }}", type: "string"},
            {id: "agentName", name: "agentName", value: "={{ $json.agentName || \"Not specified\" }}", type: "string"},
            {id: "status", name: "status", value: "={{ $json.status || \"PENDING\" }}", type: "string"},
            {id: "notes", name: "notes", value: "={{ $json.notes || \"None provided\" }}", type: "string"}
          ]
        },
        options: {}
      }
    },
    {
      id: "email-1",
      name: "Send Email Notification",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 2,
      position: [650, 300],
      parameters: {
        fromEmail: "noreply@wranngle.com",
        toEmail: "sales@wranngle.com",
        subject: "=New Lead: {{ $json.businessName }}",
        emailFormat: "html",
        html: fullHtml,
        options: {}
      },
      credentials: {
        smtp: {
          id: "QvWyMis1VpdNR7WV",
          name: "SMTP2GO Wranngle"
        }
      }
    }
  ],
  connections: {
    "Webhook Trigger": {main: [[{node: "Format Lead Data", type: "main", index: 0}]]},
    "Format Lead Data": {main: [[{node: "Send Email Notification", type: "main", index: 0}]]}
  },
  settings: {executionOrder: "v1"}
};

// Write workflow JSON
writeFileSync(join(root, 'workflows/n8n/branded-lead-intake.json'), JSON.stringify(workflow, null, 2));

console.log('✅ Workflow JSON created: workflows/n8n/branded-lead-intake.json');
console.log(`   HTML size: ${fullHtml.length} bytes`);

// Validation assertions
const emailNode = workflow.nodes.find(n => n.name === 'Send Email Notification');
if (!emailNode) {
  console.error('❌ VALIDATION FAILED: Email node not found');
  process.exit(1);
}

const params = emailNode.parameters as Record<string, unknown>;
if (params.emailFormat !== 'html') {
  console.error(`❌ VALIDATION FAILED: emailFormat is "${params.emailFormat}", expected "html"`);
  process.exit(1);
}

if (typeof params.html !== 'string' || params.html.length < 1000) {
  console.error(`❌ VALIDATION FAILED: html content missing or too small (${String(params.html).length} bytes)`);
  process.exit(1);
}

console.log('✅ Validation passed: emailFormat=html, html content present');

// Deploy if --deploy flag is passed
if (process.argv.includes('--deploy')) {
  const N8N_API_KEY = process.env.N8N_API_KEY || 'REDACTED_N8N_JWT';
  const WORKFLOW_ID = 'SY5XCbzxX32eCIeO';

  console.log('\n📤 Deploying to n8n...');

  const response = await fetch(`https://n8n.wranngle.com/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflow),
  });

  if (!response.ok) {
    console.error(`❌ DEPLOY FAILED: ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const result = await response.json() as Record<string, unknown>;
  console.log(`✅ Deployed to n8n (workflow: ${result.id})`);

  // Verify deployment
  console.log('\n🔍 Verifying deployment...');
  const verifyResponse = await fetch(`https://n8n.wranngle.com/api/v1/workflows/${WORKFLOW_ID}`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY },
  });
  const deployed = await verifyResponse.json() as { nodes: Array<{ name: string; parameters: Record<string, unknown> }> };
  const deployedEmailNode = deployed.nodes.find(n => n.name === 'Send Email Notification');

  if (deployedEmailNode?.parameters?.emailFormat !== 'html') {
    console.error('❌ VERIFY FAILED: Deployed workflow has wrong emailFormat');
    process.exit(1);
  }

  const deployedHtmlLength = String(deployedEmailNode?.parameters?.html || '').length;
  if (deployedHtmlLength < 1000) {
    console.error(`❌ VERIFY FAILED: Deployed html content too small (${deployedHtmlLength} bytes)`);
    process.exit(1);
  }

  console.log(`✅ Verified: emailFormat=html, html=${deployedHtmlLength} bytes`);
  console.log('\n✅ Deploy complete with verification');
}
