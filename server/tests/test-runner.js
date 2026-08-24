const assert = require('assert');
const { encrypt, decrypt } = require('../src/utils/encryption');
const authService = require('../src/services/authService');
const workflowService = require('../src/services/workflowService');
const aiService = require('../src/services/aiService');
const executionService = require('../src/services/executionService');
const orchestrator = require('../src/agents/orchestrator');
const { connectDB } = require('../src/config/db');

async function runTests() {
  console.log('🧪 Starting Agentflow_AI Automated Test Suite...\n');

  // 1. Connect DB (In-memory fallback if Mongo not running)
  await connectDB();
  console.log('✅ [1/6] DB Initialized');

  // 2. Test Encryption & Decryption
  const secretData = { token: 'oauth_token_secret_123', secret: 'abc_xyz' };
  const cipher = encrypt(secretData);
  assert(typeof cipher === 'string' && cipher.includes(':'), 'Encryption format must be iv:tag:ciphertext');
  const decrypted = decrypt(cipher);
  assert.deepStrictEqual(decrypted, secretData, 'Decrypted data must match original payload');
  console.log('✅ [2/6] AES-256-GCM Credential Encryption & Decryption passed');

  // 3. Test User Registration & Login
  const testEmail = `operator_${Date.now()}@agentflow.ai`;
  const regResult = await authService.register({
    name: 'Ops Architect',
    email: testEmail,
    password: 'Password123!',
    role: 'operator',
  });
  assert(regResult.token, 'Token must be returned upon registration');
  assert.strictEqual(regResult.user.email, testEmail);

  const loginResult = await authService.login({
    email: testEmail,
    password: 'Password123!',
  });
  assert(loginResult.token, 'Token must be returned on login');
  const userId = loginResult.user.id;
  console.log('✅ [3/6] User Auth & JWT Generation passed');

  // 4. Test AI Workflow Generation & Fallback Rule Engine
  const generatedWorkflow = await aiService.generateWorkflowFromPrompt('Extract invoices from email and notify on Slack');
  assert(generatedWorkflow.nodes.length >= 3, 'Generated workflow should contain at least 3 nodes');
  assert(generatedWorkflow.edges.length >= 2, 'Generated workflow should contain edges');
  console.log(`✅ [4/6] AI Prompt-to-Workflow Engine passed (${generatedWorkflow.name})`);

  // 5. Test Workflow CRUD
  const createdWorkflow = await workflowService.createWorkflow(userId, {
    name: 'Customer Support Auto-Responder',
    description: 'Auto-categorizes leads and syncs to CRM',
    nodes: generatedWorkflow.nodes,
    edges: generatedWorkflow.edges,
    tags: ['crm', 'email'],
  });
  const workflowId = createdWorkflow._id || createdWorkflow.id;
  assert(workflowId, 'Workflow ID must be present');

  const cloned = await workflowService.duplicateWorkflow(userId, workflowId);
  assert(cloned.name.includes('(Copy)'), 'Cloned workflow should have copy title');
  console.log('✅ [5/6] Workflow CRUD & Cloning passed');

  // 6. Test Multi-Agent Execution Lifecycle
  const execution = await executionService.triggerExecution(userId, workflowId);
  const executionId = execution._id || execution.id;
  assert(executionId, 'Execution ID must be created');

  // Wait 1.5 seconds for multi-agent chain to progress
  await new Promise((r) => setTimeout(r, 1500));

  const runResult = await executionService.getExecutionById(userId, executionId);
  assert(runResult.execution, 'Execution record must exist');
  assert(runResult.logs.length > 0, 'Agent logs must be recorded');
  
  const agentNames = runResult.logs.map((l) => l.agent);
  console.log(`   Logged Agents: ${[...new Set(agentNames)].join(', ')}`);
  console.log(`   Execution Status: ${runResult.execution.status}`);
  console.log('✅ [6/6] Multi-Agent Orchestration & Timeline Logging passed');

  console.log('\n🎉 ALL 6 TEST PHASES PASSED SUCCESSFULLY!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
