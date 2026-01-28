/**
 * Generate Preview Files for All Templates
 *
 * This script builds HTML previews for all email templates with sample data.
 * Run with: bun run email:preview:all
 */

import { EmailTemplateBuilder } from './template-builder';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const builder = new EmailTemplateBuilder();

async function generateAllPreviews() {
  console.log('📧 Generating email template previews...\n');

  const templates = await builder.listTemplates();
  const previewDir = join(__dirname, '../preview');

  // Ensure preview directory exists
  await mkdir(previewDir, { recursive: true });

  let successCount = 0;
  let errorCount = 0;

  for (const templateName of templates) {
    try {
      console.log(`🔨 Building ${templateName}...`);

      // Generate standard preview
      const previewHtml = await builder.preview(templateName);
      const previewPath = join(previewDir, `${templateName}-preview.html`);
      await writeFile(previewPath, previewHtml);
      console.log(`   ✓ Preview: ${templateName}-preview.html`);

      // Generate inlined version (production-ready)
      try {
        const sampleData = builder['getSampleData'](templateName);
        const inlinedHtml = await builder.build(templateName, sampleData, {
          inlineCSS: true,
          minify: false, // Keep readable for debugging
        });
        const inlinedPath = join(previewDir, `${templateName}-inlined.html`);
        await writeFile(inlinedPath, inlinedHtml);
        console.log(`   ✓ Inlined: ${templateName}-inlined.html`);
      } catch (error) {
        console.warn(`   ⚠ CSS inlining skipped (juice not installed)`);
      }

      successCount++;
      console.log('');
    } catch (error) {
      console.error(`   ✗ Error building ${templateName}:`, error);
      errorCount++;
      console.log('');
    }
  }

  // Summary
  console.log('─'.repeat(50));
  console.log(`✓ ${successCount} template(s) generated successfully`);
  if (errorCount > 0) {
    console.log(`✗ ${errorCount} template(s) failed`);
  }
  console.log('─'.repeat(50));
  console.log(`\n📂 Preview files saved to: ${previewDir}`);
  console.log(`🌐 Open preview/index.html in your browser to view\n`);

  // Create an index with direct links
  await generatePreviewIndex(templates, previewDir);
}

async function generatePreviewIndex(templates: string[], previewDir: string) {
  const links = templates
    .map(
      (name) => `
    <li>
      <strong>${name}</strong>:
      <a href="${name}-preview.html" target="_blank">Standard</a> |
      <a href="${name}-inlined.html" target="_blank">Inlined</a>
    </li>`
    )
    .join('\n');

  const indexContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Previews - Quick Links</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #f9fafb;
    }
    h1 {
      color: #12111a;
      border-bottom: 4px solid #ff5f00;
      padding-bottom: 12px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      background: white;
      margin: 12px 0;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #ff5f00;
    }
    a {
      color: #ff5f00;
      text-decoration: none;
      font-weight: 600;
    }
    a:hover {
      text-decoration: underline;
    }
    .note {
      background: #fffbeb;
      border: 1px solid #fde68a;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <h1>📧 Wranngle Email Template Previews</h1>

  <div class="note">
    <strong>💡 Tip:</strong> Use the main <a href="index.html">preview dashboard</a> for a better experience.
  </div>

  <h2>Available Templates</h2>
  <ul>
    ${links}
  </ul>

  <div class="note">
    <strong>Standard:</strong> Original template with external CSS<br>
    <strong>Inlined:</strong> Production-ready with inlined CSS
  </div>
</body>
</html>
  `.trim();

  const quickLinksPath = join(previewDir, 'quick-links.html');
  await writeFile(quickLinksPath, indexContent);
  console.log(`📋 Quick links page: preview/quick-links.html`);
}

// Run if executed directly
if (import.meta.main) {
  generateAllPreviews().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateAllPreviews };
