#!/usr/bin/env bun

/**
 * Activate n8n workflow by ID
 * Usage: bun run scripts/activate-workflow.ts <workflow-id>
 */

const WORKFLOW_ID = process.argv[2] || 'CBoXlSNiDOHA5YmA';
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_BASE_URL = 'https://n8n.wranngle.com/api/v1';

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY not found in environment');
  process.exit(1);
}

async function activateWorkflow(workflowId: string): Promise<void> {
  console.log(`🔄 Fetching workflow ${workflowId}...`);

  // Fetch current workflow
  const getResponse = await fetch(`${N8N_BASE_URL}/workflows/${workflowId}`, {
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
    },
  });

  if (!getResponse.ok) {
    throw new Error(`Failed to fetch workflow: ${getResponse.statusText}`);
  }

  const workflow = await getResponse.json();
  console.log(`📋 Workflow: ${workflow.name} (currently ${workflow.active ? 'active' : 'inactive'})`);

  if (workflow.active) {
    console.log('✅ Workflow is already active');
    return;
  }

  // Try dedicated activation endpoint
  console.log('🔄 Activating workflow...');
  let updateResponse = await fetch(`${N8N_BASE_URL}/workflows/${workflowId}/activate`, {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  // If dedicated endpoint doesn't exist, try settings update
  if (!updateResponse.ok && updateResponse.status === 404) {
    console.log('⚠️  Trying alternate method...');
    updateResponse = await fetch(`${N8N_BASE_URL}/workflows/${workflowId}`, {
      method: 'PATCH',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        active: true,
      }),
    });
  }

  if (!updateResponse.ok) {
    const error = await updateResponse.text();
    throw new Error(`Failed to activate workflow: ${error}`);
  }

  const updated = await updateResponse.json();
  console.log(`✅ Workflow activated successfully!`);
  console.log(`📍 Webhook URL: https://n8n.wranngle.com/webhook/${workflow.nodes.find((n: any) => n.type === 'n8n-nodes-base.webhook')?.parameters?.path || 'unknown'}`);
}

activateWorkflow(WORKFLOW_ID).catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
