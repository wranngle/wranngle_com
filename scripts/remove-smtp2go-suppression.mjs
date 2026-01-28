import { chromium } from 'playwright';

const EMAIL_TO_REMOVE = 'sales@wranngle.com';
const SMTP2GO_USER = 'cody@wranngle.com';
const SMTP2GO_PASS = 'mt3TXaruThYGL7';

async function removeSupression() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to SMTP2GO login...');
    await page.goto('https://app.smtp2go.com/login/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Debug: print available form elements
    const formHTML = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form ? form.innerHTML : 'No form found';
    });
    console.log('Form structure:', formHTML.substring(0, 1000));

    // Try multiple selector strategies for email field
    console.log('Filling login credentials...');
    const emailSelectors = ['#username', 'input[name="username"]', '#email', 'input[name="email"]', 'input[type="email"]', 'input[placeholder*="Email"]'];
    for (const sel of emailSelectors) {
      const el = await page.$(sel);
      if (el) {
        console.log(`Found email field with: ${sel}`);
        await el.fill(SMTP2GO_USER);
        break;
      }
    }

    await page.waitForTimeout(500);

    // Try multiple selector strategies for password field
    const passSelectors = ['#password', 'input[name="password"]', 'input[type="password"]'];
    for (const sel of passSelectors) {
      const el = await page.$(sel);
      if (el) {
        console.log(`Found password field with: ${sel}`);
        await el.fill(SMTP2GO_PASS);
        break;
      }
    }

    await page.waitForTimeout(500);

    // Screenshot before submit
    await page.screenshot({ path: 'C:\\Users\\root\\Documents\\dev\\wranngle.com\\smtp2go-before-login.png' });

    // Submit using multiple strategies
    console.log('Submitting login...');
    const submitSelectors = ['#login-submit', 'input[type="submit"]', 'button[type="submit"]', 'button:has-text("Log in")', '.btn.blue'];
    for (const sel of submitSelectors) {
      const el = await page.$(sel);
      if (el) {
        console.log(`Found submit button with: ${sel}`);
        await el.click({ force: true });
        break;
      }
    }

    // Wait for navigation/redirect
    console.log('Waiting for login to complete...');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Screenshot after login attempt
    await page.screenshot({ path: 'C:\\Users\\root\\Documents\\dev\\wranngle.com\\smtp2go-after-login.png' });

    if (currentUrl.includes('login')) {
      console.log('Still on login page - login may have failed');
      // Try again with keyboard
      console.log('Trying keyboard submit...');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000);
    }

    // Navigate to suppressions - use current domain (may redirect to app-us)
    console.log('Navigating to Suppressions...');
    const baseUrl = new URL(page.url()).origin;
    console.log('Base URL:', baseUrl);
    await page.goto(`${baseUrl}/reports/suppressions/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // Screenshot
    await page.screenshot({ path: 'C:\\Users\\root\\Documents\\dev\\wranngle.com\\smtp2go-suppressions.png' });
    console.log('Suppressions page screenshot saved');

    // Check page content
    const pageContent = await page.content();
    console.log('Page contains email:', pageContent.includes(EMAIL_TO_REMOVE));

    if (pageContent.includes(EMAIL_TO_REMOVE)) {
      console.log('Found email! Looking for delete controls...');

      // Try to find the delete X icon - common patterns in SMTP2GO
      // Based on docs: click the "x" icon to remove
      const deleteSelectors = [
        `tr:has-text("${EMAIL_TO_REMOVE}") .fa-times`,
        `tr:has-text("${EMAIL_TO_REMOVE}") .glyphicon-remove`,
        `tr:has-text("${EMAIL_TO_REMOVE}") .close`,
        `tr:has-text("${EMAIL_TO_REMOVE}") [class*="remove"]`,
        `tr:has-text("${EMAIL_TO_REMOVE}") [class*="delete"]`,
        `tr:has-text("${EMAIL_TO_REMOVE}") a[href*="delete"]`,
        `tr:has-text("${EMAIL_TO_REMOVE}") button`,
        `tr:has-text("${EMAIL_TO_REMOVE}") svg`,
        `tr:has-text("${EMAIL_TO_REMOVE}") i`,
      ];

      for (const sel of deleteSelectors) {
        const el = await page.locator(sel).first();
        if (await el.count() > 0) {
          console.log(`Found delete element with: ${sel}`);
          await el.click({ force: true });
          await page.waitForTimeout(2000);
          break;
        }
      }

      // Try checkbox approach
      const checkbox = await page.locator(`tr:has-text("${EMAIL_TO_REMOVE}") input[type="checkbox"]`).first();
      if (await checkbox.count() > 0) {
        console.log('Trying checkbox + delete selected...');
        await checkbox.click({ force: true });
        await page.waitForTimeout(1000);

        // Look for bulk delete button
        const bulkDelete = await page.locator('button:has-text("Delete Selected"), a:has-text("Delete Selected"), .delete-selected').first();
        if (await bulkDelete.count() > 0) {
          await bulkDelete.click({ force: true });
          await page.waitForTimeout(2000);
        }
      }

      // Handle any confirmation modal
      const confirmSelectors = ['button:has-text("Confirm")', 'button:has-text("Yes")', 'button:has-text("OK")', '.modal .btn-danger', '.modal .btn-primary'];
      for (const sel of confirmSelectors) {
        const el = await page.$(sel);
        if (el) {
          console.log(`Clicking confirm: ${sel}`);
          await el.click({ force: true });
          await page.waitForTimeout(2000);
          break;
        }
      }
    }

    // Final screenshot
    await page.screenshot({ path: 'C:\\Users\\root\\Documents\\dev\\wranngle.com\\smtp2go-final.png' });
    console.log('Done! Check screenshots for results.');

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'C:\\Users\\root\\Documents\\dev\\wranngle.com\\smtp2go-error.png' });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

removeSupression();
