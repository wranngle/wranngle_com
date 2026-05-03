/**
 * Example: Send Welcome Email
 *
 * This is a reference implementation showing how to integrate the email template system
 * with Cloudflare Pages Functions.
 *
 * Usage: POST /api/send-welcome-email
 *
 * NOTE: This is a template/example file. Uncomment and configure for production use.
 */

// import { EmailTemplateBuilder } from '../../email-templates/build/template-builder';
import {type} from 'arktype';
import {welcomeEmailRequestSchema} from '../../shared/schema';

type Env = {
  SENDGRID_API_KEY: string;
  FROM_EMAIL: string;
};

export const onRequestPost: PagesFunction<Env> = async ({request, env}) => {
  try {
    const raw: unknown = await request.json();
    const body = welcomeEmailRequestSchema(raw);

    // ArkType returns a `type.errors` instance on validation failure
    if (body instanceof type.errors) {
      return new Response(`Missing or invalid fields: ${body.summary}`, {
        status: 400,
      });
    }

    // Uncomment to use email templates in production:
    /*
    const builder = new EmailTemplateBuilder();

    const html = await builder.build('welcome', {
      USER_NAME: body.name,
      PACKAGE_NAME: body.packageName,
      DASHBOARD_URL: 'https://wranngle.com/dashboard',
      COMPANY_ADDRESS: 'San Francisco, CA',
      UNSUBSCRIBE_URL: `https://wranngle.com/unsubscribe?email=${encodeURIComponent(body.email)}`,
    }, {
      inlineCSS: true,
      minify: true,
    });

    // Send via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: body.email, name: body.name }],
          subject: 'Welcome to Wranngle',
        }],
        from: {
          email: env.FROM_EMAIL || 'hello@wranngle.com',
          name: 'Wranngle Systems',
        },
        content: [{
          type: 'text/html',
          value: html,
        }],
        tracking_settings: {
          click_tracking: { enable: true },
          open_tracking: { enable: true },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SendGrid error:', error);
      return new Response('Failed to send email', { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    */

    // Placeholder response for now
    return new Response(
      JSON.stringify({
        message: 'Email template example - uncomment code to enable',
        recipient: body.email,
      }),
      {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      },
    );
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return new Response('Internal server error', {status: 500});
  }
};
