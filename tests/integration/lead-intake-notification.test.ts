// @vitest-environment node

/**
 * Integration tests for Lead Intake → RCS/SMS Notification flow
 * Tests that submitting a lead triggers the Universal Message Sender
 * with the lead-intake template and correct variable mapping.
 *
 * Workflow: Wranngle Lead Intake (SY5XCbzxX32eCIeO)
 * Downstream: Universal Message Sender (CBoXlSNiDOHA5YmA)
 */

// Load from ~/.claude/.env if not in process.env
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, it, expect} from 'vitest';

const INTAKE_WEBHOOK = 'https://n8n.wranngle.com/webhook/wranngle-intake-form';
const UMS_WEBHOOK = 'https://n8n.wranngle.com/webhook/universal-message-v1';
const RUN_LIVE_INTEGRATION = ['1', 'true'].includes(
  process.env.RUN_LIVE_INTEGRATION ?? '',
);

function loadEnvKey(key: string): string {
  if (process.env[key]) return process.env[key];
  const envPath = join(
    process.env.USERPROFILE || process.env.HOME || '',
    '.claude',
    '.env',
  );
  if (existsSync(envPath)) {
    const match = readFileSync(envPath, 'utf8')
      .split('\n')
      .find((l) => l.startsWith(`${key}=`));
    if (match) return match.split('=').slice(1).join('=');
  }

  return '';
}

const N8N_API_KEY = RUN_LIVE_INTEGRATION ? loadEnvKey('N8N_API_KEY') : '';
const WEBHOOK_SECRET = RUN_LIVE_INTEGRATION
  ? loadEnvKey('SMS_WEBHOOK_SECRET') || loadEnvKey('N8N_WEBHOOK_SECRET')
  : '';
const N8N_API = 'https://n8n.wranngle.com/api/v1';
// Skip unless explicitly requested: this suite hits production n8n webhooks
// and reads production execution state through the n8n API.
const describeIfLive =
  RUN_LIVE_INTEGRATION && N8N_API_KEY && WEBHOOK_SECRET
    ? describe
    : describe.skip;

const LEAD_INTAKE_WORKFLOW_ID = 'SY5XCbzxX32eCIeO';
const UMS_WORKFLOW_ID = 'CBoXlSNiDOHA5YmA';

const mockLead = {
  businessName: 'Integration Test Corp',
  industry: 'Software',
  ownerName: 'Test Runner',
  phone: '+15559876543',
  email: 'test@integration.dev',
  package: 'Elite Agent',
  agentName: 'Sarah',
  status: 'new',
  notes: 'Automated integration test',
};

async function getLatestExecution(workflowId: string) {
  const response = await fetch(
    `${N8N_API}/executions?workflowId=${workflowId}&limit=1`,
    {
      headers: {'X-N8N-API-KEY': N8N_API_KEY},
    },
  );
  const data = (await response.json()) as {
    data: Array<{
      id: string;
      status: string;
      startedAt: string;
      stoppedAt: string;
      finished: boolean;
    }>;
  };
  return data.data?.[0];
}

describeIfLive('Lead Intake Notification Flow', () => {
  describe('RUNTIME: Workflow executes without errors', () => {
    it('should accept a lead submission and return success', async () => {
      const response = await fetch(INTAKE_WEBHOOK, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(mockLead),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as {message?: string};
      expect(data.message).toBeDefined();
    });

    it('should complete lead intake execution successfully', async () => {
      // Wait for execution to complete
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });

      const exec = await getLatestExecution(LEAD_INTAKE_WORKFLOW_ID);
      expect(exec).toBeDefined();
      expect(exec.finished).toBe(true);
      expect(exec.status).toBe('success');
    });

    it('should trigger UMS workflow execution', async () => {
      const exec = await getLatestExecution(UMS_WORKFLOW_ID);
      expect(exec).toBeDefined();
      expect(exec.finished).toBe(true);
      // UMS may succeed or fail (Twilio delivery) but should execute
      expect(['success', 'error']).toContain(exec.status);
    });
  });

  describe('MOCKED: Variable mapping validation', () => {
    it('should call UMS with lead-intake template via direct test', async () => {
      const response = await fetch(UMS_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': WEBHOOK_SECRET,
        },
        body: JSON.stringify({
          phone_number: '+12602217355',
          template: 'lead-intake',
          variables: {
            BUSINESS_NAME: mockLead.businessName,
            INDUSTRY: mockLead.industry,
            OWNER_NAME: mockLead.ownerName,
            PHONE: mockLead.phone,
          },
        }),
      });

      // Should pass validation (not 400)
      expect(response.status).not.toBe(400);
      const data = (await response.json()) as {
        success?: boolean;
        request_id?: string;
        error?: string;
      };
      // If validation passed, should have request_id
      if (response.ok) {
        expect(data.request_id).toBeDefined();
      }
    });

    it('should reject lead-intake with missing required variables', async () => {
      const response = await fetch(UMS_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': WEBHOOK_SECRET,
        },
        body: JSON.stringify({
          phone_number: '+12602217355',
          template: 'lead-intake',
          variables: {
            BUSINESS_NAME: mockLead.businessName,
            // Missing: INDUSTRY, OWNER_NAME, PHONE
          },
        }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as {error?: string};
      expect(data.error).toContain('MISSING_VARIABLES');
    });
  });

  describe('INTEGRATED: Fire-and-forget behavior', () => {
    it('should return 200 even when notification would fail', async () => {
      const badLead = {
        ...mockLead,
        businessName: 'Fire-and-Forget Verify',
        phone: 'not-a-valid-phone',
      };

      const response = await fetch(INTAKE_WEBHOOK, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(badLead),
      });

      // Lead intake should still succeed
      expect(response.status).toBe(200);
    });

    it('should complete lead intake even if UMS errors', async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });

      const exec = await getLatestExecution(LEAD_INTAKE_WORKFLOW_ID);
      expect(exec).toBeDefined();
      expect(exec.finished).toBe(true);
      expect(exec.status).toBe('success');
    });
  });
});
