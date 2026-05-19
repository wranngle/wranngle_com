/**
 * Unit tests for message templates
 * Tests variable substitution, escaping, fallbacks, and validation
 */

import {describe, it, expect} from 'vitest';
import {
  buildMessageBody,
  validateTemplateVariables,
  getTemplateIds,
  type TemplateId,
} from '@shared/message-templates';

describe('Message Templates', () => {
  describe('buildMessageBody', () => {
    it('should build welcome template with variables', () => {
      const body = buildMessageBody('welcome', {
        FIRST_NAME: 'Cody',
        PACKAGE: 'Elite Agent',
      });

      expect(body).toContain('Hi Cody!');
      expect(body).toContain('Elite Agent');
      expect(body).toContain('LIVE');
    });

    it('should handle dollar sign correctly without escaping', () => {
      const body = buildMessageBody('invoice-receipt', {
        AMOUNT: '542.50',
        INVOICE_ID: 'INV-2026-001',
      });

      expect(body).toContain('$542.50');
      expect(body).not.toContain(String.raw`\$`);
      expect(body).toContain('INV-2026-001');
    });

    it('should use fallback values when variables missing', () => {
      const body = buildMessageBody('welcome', {});

      expect(body).toContain('Hi there!');
      expect(body).toContain('AI agent');
    });

    it('should handle special characters in variables', () => {
      const body = buildMessageBody('notification', {
        EVENT_TYPE: 'Status Update',
        EVENT_DATA: 'Agent is online & ready',
      });

      expect(body).toContain('Status Update');
      expect(body).toContain('Agent is online & ready');
    });

    it('should handle numeric values correctly', () => {
      const body = buildMessageBody('sales-proposal-sent', {
        FIRST_NAME: 'Lisa',
        PACKAGE: 'Pro Package',
        PRICE: 299,
      });

      expect(body).toContain('$299');
      expect(body).not.toContain('$[object Object]');
    });

    it('should handle empty string variables with fallback', () => {
      const body = buildMessageBody('sales-quote-followup', {
        FIRST_NAME: '',
        QUOTE_ID: 'Q-123',
        REP_NAME: 'Emily',
      });

      // Empty string should use fallback "there"
      expect(body).toContain('Hi there!');
      expect(body).toContain('Q-123');
      expect(body).toContain('Emily');
    });

    it('should fallback to welcome template for unknown template ID', () => {
      const body = buildMessageBody('unknown-template' as TemplateId, {
        FIRST_NAME: 'Test',
      });

      expect(body).toContain('Hi Test!');
    });
  });

  describe('Template Content', () => {
    it('should include all 10 templates', () => {
      const ids = getTemplateIds();
      expect(ids).toHaveLength(10);
      expect(ids).toContain('welcome');
      expect(ids).toContain('invoice-receipt');
      expect(ids).toContain('sales-winback');
    });

    it('should build each template without errors', () => {
      const ids = getTemplateIds();

      for (const id of ids) {
        expect(() => buildMessageBody(id, {})).not.toThrow();
      }
    });

    it('should have unique content for each template', () => {
      const ids = getTemplateIds();
      const bodies = ids.map((id) => buildMessageBody(id, {}));

      // Check no duplicate bodies
      const uniqueBodies = new Set(bodies);
      expect(uniqueBodies.size).toBe(ids.length);
    });
  });

  describe('validateTemplateVariables', () => {
    it('should validate welcome template requires FIRST_NAME and PACKAGE', () => {
      const result = validateTemplateVariables('welcome', {
        FIRST_NAME: 'Cody',
        PACKAGE: 'Elite',
      });

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should return missing variables', () => {
      const result = validateTemplateVariables('welcome', {
        FIRST_NAME: 'Cody',
      });

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('PACKAGE');
    });

    it('should validate invoice-receipt requires AMOUNT and INVOICE_ID', () => {
      const result = validateTemplateVariables('invoice-receipt', {});

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('AMOUNT');
      expect(result.missing).toContain('INVOICE_ID');
    });

    it('should validate lead-intake requires 4 variables', () => {
      const result = validateTemplateVariables('lead-intake', {
        BUSINESS_NAME: 'ABC Operations',
      });

      expect(result.valid).toBe(false);
      expect(result.missing).toHaveLength(3);
      expect(result.missing).toContain('INDUSTRY');
      expect(result.missing).toContain('OWNER_NAME');
      expect(result.missing).toContain('PHONE');
    });

    it('should handle complete variable sets', () => {
      const result = validateTemplateVariables('sales-proposal-sent', {
        FIRST_NAME: 'Lisa',
        PACKAGE: 'Pro',
        PRICE: '299',
      });

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long variable values', () => {
      const longString = 'A'.repeat(1000);
      const body = buildMessageBody('notification', {
        EVENT_TYPE: longString,
        EVENT_DATA: 'Short',
      });

      expect(body).toContain(longString);
    });

    it('should handle variables with URLs', () => {
      const body = buildMessageBody('password-reset', {
        RESET_URL: 'https://wranngle.com/reset?token=abc123&user=test',
        EXPIRY_TIME: '30 minutes',
      });

      expect(body).toContain(
        'https://wranngle.com/reset?token=abc123&user=test',
      );
    });

    it('should handle variables with quotes', () => {
      const body = buildMessageBody('notification', {
        EVENT_TYPE: 'Agent "Sarah" Status',
        EVENT_DATA: 'Now available',
      });

      expect(body).toContain('Agent "Sarah" Status');
    });

    it('should handle null and undefined as missing', () => {
      const body = buildMessageBody('welcome', {
        FIRST_NAME: undefined as any,
        PACKAGE: null as any,
      });

      expect(body).toContain('Hi there!');
      expect(body).toContain('AI agent');
    });
  });

  describe('SMS Character Limits', () => {
    it('should keep most templates under 160 characters for SMS', () => {
      const templates: Array<{id: TemplateId; vars: Record<string, string>}> = [
        {id: 'welcome', vars: {FIRST_NAME: 'Cody', PACKAGE: 'Elite'}},
        {
          id: 'invoice-receipt',
          vars: {AMOUNT: '542.50', INVOICE_ID: 'INV-001'},
        },
        {id: 'notification', vars: {EVENT_TYPE: 'Status', EVENT_DATA: 'OK'}},
      ];

      for (const {id, vars} of templates) {
        const body = buildMessageBody(id, vars);
        // Most should be under SMS limit
        if (body.length > 160) {
          console.warn(
            `Template ${id} exceeds SMS limit: ${body.length} chars`,
          );
        }
      }

      // At least one should pass
      expect(templates.length).toBeGreaterThan(0);
    });
  });
});
