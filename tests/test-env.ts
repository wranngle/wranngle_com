/**
 * Test environment configuration
 * Loads environment variables for testing
 */

import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

// Load .env from project root or parent .claude directory
const envPaths = [
  join(process.cwd(), '.env'),
  join(process.env.HOME || process.env.USERPROFILE || '', '.claude', '.env'),
];

for (const envPath of envPaths) {
  if (!existsSync(envPath)) continue;

  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Validate required environment variables for testing
const requiredVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'N8N_API_KEY',
  'ELEVENLABS_API_KEY',
];

for (const variable of requiredVars) {
  if (!process.env[variable]) {
    console.warn(`⚠️  Missing environment variable: ${variable}`);
  }
}
