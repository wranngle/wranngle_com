/**
 * Email Template Testing Suite
 *
 * Validates email templates against common issues:
 * - Missing required variables
 * - Broken HTML structure
 * - Missing alt text on images
 * - Broken links
 * - Email size limits
 *
 * Run with: bun run email:test
 */

import { EmailTemplateBuilder } from './template-builder';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Email type classification - transactional emails are CAN-SPAM exempt */
const EMAIL_TYPES: Record<string, 'transactional' | 'marketing' | 'internal'> = {
  'password-reset': 'transactional',
  'invoice-receipt': 'transactional',
  'welcome': 'marketing',
  'notification': 'marketing',
  'lead-intake': 'internal',
};

interface TestResult {
  template: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  info: {
    size: number;
    imageCount: number;
    linkCount: number;
  };
}

const builder = new EmailTemplateBuilder();

async function testTemplate(templateName: string): Promise<TestResult> {
  const result: TestResult = {
    template: templateName,
    passed: true,
    errors: [],
    warnings: [],
    info: {
      size: 0,
      imageCount: 0,
      linkCount: 0,
    },
  };

  try {
    // Build template with sample data
    const sampleData = builder['getSampleData'](templateName);
    const html = await builder.build(templateName, sampleData, {
      inlineCSS: false,
      minify: false,
    });

    // Check 1: Email size (Gmail clips at 102KB)
    const size = Buffer.byteLength(html, 'utf8');
    result.info.size = size;

    if (size > 102000) {
      result.errors.push(
        `Email size (${Math.round(size / 1024)}KB) exceeds 102KB - Gmail will clip`
      );
      result.passed = false;
    } else if (size > 80000) {
      result.warnings.push(
        `Email size (${Math.round(size / 1024)}KB) is large - consider optimization`
      );
    }

    // Check 2: Image alt text
    const imgTagsWithoutAlt = html.match(/<img(?![^>]*alt=)[^>]*>/gi) || [];
    result.info.imageCount = (html.match(/<img/gi) || []).length;

    if (imgTagsWithoutAlt.length > 0) {
      result.warnings.push(
        `${imgTagsWithoutAlt.length} image(s) missing alt text`
      );
    }

    // Check 3: Broken links (check for placeholder URLs)
    const placeholderLinks =
      html.match(/href=["'](#|javascript:|{{[^}]+}})/gi) || [];
    result.info.linkCount = (html.match(/href=/gi) || []).length;

    if (placeholderLinks.length > 0) {
      result.warnings.push(
        `${placeholderLinks.length} placeholder link(s) detected - replace before sending`
      );
    }

    // Check 4: Unsubscribe link (required by CAN-SPAM for marketing emails only)
    const emailType = EMAIL_TYPES[templateName] || 'marketing';

    if (emailType === 'marketing') {
      // Marketing emails MUST have unsubscribe
      if (!html.includes('unsubscribe') && !html.includes('Unsubscribe')) {
        result.errors.push(
          'Missing unsubscribe link (required by CAN-SPAM Act for marketing emails)'
        );
        result.passed = false;
      }
    } else if (emailType === 'transactional') {
      // Transactional emails should NOT have unsubscribe (CAN-SPAM exempt)
      // but should have a transactional footer
      if (!html.includes('transactional email')) {
        result.warnings.push(
          'Transactional email should indicate it is account-related'
        );
      }
    } else if (emailType === 'internal') {
      // Internal emails should have preference management, not consumer unsubscribe
      if (html.includes('Unsubscribe from these emails')) {
        result.warnings.push(
          'Internal email should use internal preference management, not consumer unsubscribe'
        );
      }
    }

    // Check 5: Unreplaced variables
    const unreplacedVars = html.match(/{{[A-Z_]+}}/g) || [];
    const uniqueVars = [...new Set(unreplacedVars)];

    if (uniqueVars.length > 0) {
      // Some variables are optional (TRACKING_PIXEL, etc.)
      const requiredVars = uniqueVars.filter(
        (v) => !['{{TRACKING_PIXEL}}', '{{CONTENT_BLOCK}}'].includes(v)
      );

      if (requiredVars.length > 0) {
        result.warnings.push(
          `Unreplaced variables: ${requiredVars.join(', ')}`
        );
      }
    }

    // Check 6: HTML validation (basic)
    const unclosedTables = countOccurrences(html, '<table') - countOccurrences(html, '</table>');
    const unclosedTds = countOccurrences(html, '<td') - countOccurrences(html, '</td>');

    if (unclosedTables !== 0) {
      result.errors.push(`Unclosed table tags detected (${unclosedTables})`);
      result.passed = false;
    }

    if (unclosedTds !== 0) {
      result.errors.push(`Unclosed td tags detected (${unclosedTds})`);
      result.passed = false;
    }

    // Check 7: Title tag
    if (!html.includes('<title>') || html.includes('<title>{{EMAIL_TITLE}}')) {
      result.warnings.push('Missing or unreplaced <title> tag');
    }

    // Check 8: Preheader text
    if (!html.includes('PREHEADER_TEXT') && !html.includes('display:none;max-height:0') && !html.includes('display: none; max-height: 0')) {
      result.warnings.push(
        'Consider adding preheader text for inbox preview'
      );
    }

    // Check 9: Mobile viewport meta tag
    if (!html.includes('viewport')) {
      result.errors.push('Missing viewport meta tag for mobile rendering');
      result.passed = false;
    }

    // Check 10: Accessibility - ARIA roles
    if (!html.includes('role="presentation"')) {
      result.warnings.push('Consider adding role="presentation" to layout tables');
    }

    // Check 11: Design system enforcement — button padding must be 14px 32px
    const buttonPaddingRegex = /class="btn-[^"]*"[^>]*padding:\s*(\d+px\s+\d+px)/gi;
    let btnMatch;
    while ((btnMatch = buttonPaddingRegex.exec(html)) !== null) {
      if (btnMatch[1].replace(/\s+/g, ' ') !== '14px 32px') {
        result.errors.push(
          `Non-standard button padding: ${btnMatch[1]} (must be 14px 32px)`
        );
        result.passed = false;
      }
    }

    // Check 12: Design system enforcement — h1 font-size must be 28px
    const h1FontRegex = /<h1[^>]*font-size:\s*(\d+)px/gi;
    let h1Match;
    while ((h1Match = h1FontRegex.exec(html)) !== null) {
      if (h1Match[1] !== '28') {
        result.errors.push(
          `Non-standard h1 font-size: ${h1Match[1]}px (must be 28px)`
        );
        result.passed = false;
      }
    }

    // Check 13: Design system enforcement — h2 font-size must be 20px
    const h2FontRegex = /<h2[^>]*font-size:\s*(\d+)px/gi;
    let h2Match;
    while ((h2Match = h2FontRegex.exec(html)) !== null) {
      if (h2Match[1] !== '20') {
        result.errors.push(
          `Non-standard h2 font-size: ${h2Match[1]}px (must be 20px)`
        );
        result.passed = false;
      }
    }

  } catch (error) {
    result.errors.push(`Build failed: ${error}`);
    result.passed = false;
  }

  return result;
}

function countOccurrences(str: string, substr: string): number {
  return (str.match(new RegExp(substr, 'gi')) || []).length;
}

async function runAllTests() {
  console.log('🧪 Running email template tests...\n');

  const templates = await builder.listTemplates();
  const results: TestResult[] = [];

  for (const templateName of templates) {
    console.log(`Testing ${templateName}...`);
    const result = await testTemplate(templateName);
    results.push(result);

    // Display results
    if (result.passed && result.errors.length === 0 && result.warnings.length === 0) {
      console.log(`  ✓ All checks passed`);
    } else {
      if (result.errors.length > 0) {
        console.log(`  ✗ Errors:`);
        result.errors.forEach((err) => console.log(`    - ${err}`));
      }
      if (result.warnings.length > 0) {
        console.log(`  ⚠ Warnings:`);
        result.warnings.forEach((warn) => console.log(`    - ${warn}`));
      }
    }

    console.log(
      `  ℹ Info: ${Math.round(result.info.size / 1024)}KB, ${result.info.imageCount} images, ${result.info.linkCount} links\n`
    );
  }

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log('─'.repeat(60));
  console.log(`Summary:`);
  console.log(`  ✓ ${passedCount}/${templates.length} templates passed`);
  console.log(`  ✗ ${totalErrors} total errors`);
  console.log(`  ⚠ ${totalWarnings} total warnings`);
  console.log('─'.repeat(60));

  // Exit with error code if any tests failed
  if (passedCount < templates.length) {
    console.log('\n❌ Some tests failed. Please fix errors before deploying.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All templates passed validation!\n');
  }
}

// Run if executed directly
if (import.meta.main) {
  runAllTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { testTemplate, runAllTests };
