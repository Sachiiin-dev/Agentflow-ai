const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');
const AgentMemory = require('../models/AgentMemory');
const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const { emitToExecution } = require('../config/socket');

// In-memory active execution control map for pause / cancel flags
const activeControlFlags = new Map();

class MultiAgentOrchestrator {
  constructor() {
    this.langGraphStatus = 'available'; // Reports 'available' | 'not-installed'
  }

  setExecutionControl(executionId, action) {
    activeControlFlags.set(String(executionId), action); // 'pause' | 'cancel' | 'resume'
  }

  getExecutionControl(executionId) {
    return activeControlFlags.get(String(executionId)) || null;
  }

  clearExecutionControl(executionId) {
    activeControlFlags.delete(String(executionId));
  }

  /**
   * Main Agentic Orchestration Loop
   */
  async runExecution(executionId) {
    const execution = await Execution.findById(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found.`);
    }

    const userId = String(execution.owner);
    const workflowId = String(execution.workflowId);
    const workflowSnapshot = execution.workflowSnapshot;

    const startTime = Date.now();
    let accumulatedContext = {
      inputs: execution.inputs || {},
      steps: {},
    };

    try {
      // 1. Update status to RUNNING
      await Execution.findByIdAndUpdate(executionId, {
        status: 'RUNNING',
        startTime: new Date(startTime),
        langGraphStatus: this.langGraphStatus,
      });

      emitToExecution(executionId, 'execution_status', {
        status: 'RUNNING',
        executionId,
      });

      // 2. Monitoring Agent emits lifecycle event
      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        agent: 'monitoring',
        level: 'info',
        message: `Agentic execution started for workflow "${workflowSnapshot.name}". Substrate: LangGraph (${this.langGraphStatus}).`,
      });

      // 3. Planner Agent generates execution graph plan
      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'info',
        message: 'Planner Agent analyzing workflow DAG topological dependencies and compiling node sequence...',
      });

      const plan = await plannerAgent.plan(workflowSnapshot);

      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'success',
        message: plan.reasoning,
        metadata: {
          plannedOrder: plan.plannedOrder,
          confidenceScore: plan.confidenceScore,
          totalSteps: plan.totalSteps,
        },
      });

      // Store Planner decision in AgentMemory
      await AgentMemory.create({
        workflowId,
        executionId,
        agentId: 'planner',
        key: 'execution_plan',
        value: plan,
        confidenceScore: plan.confidenceScore,
      });

      // 4. Sequential execution of planned nodes
      for (let i = 0; i < plan.plannedNodes.length; i++) {
        const node = plan.plannedNodes[i];
        const nodeId = node.id;

        // Check for pause / cancel flags
        const control = this.getExecutionControl(executionId);
        if (control === 'cancel') {
          await Execution.findByIdAndUpdate(executionId, {
            status: 'CANCELLED',
            endTime: new Date(),
            duration: Date.now() - startTime,
          });
          await monitoringAgent.emitEvent({
            executionId,
            workflowId,
            nodeId,
            agent: 'monitoring',
            level: 'warning',
            message: `Execution cancelled by operator at node ${nodeId}.`,
          });
          emitToExecution(executionId, 'execution_status', { status: 'CANCELLED', executionId });
          this.clearExecutionControl(executionId);
          return;
        }

        if (control === 'pause') {
          await Execution.findByIdAndUpdate(executionId, {
            status: 'PAUSED',
            currentNode: nodeId,
          });
          await monitoringAgent.emitEvent({
            executionId,
            workflowId,
            nodeId,
            agent: 'monitoring',
            level: 'warning',
            message: `Execution paused by operator before executing node ${nodeId}.`,
          });
          emitToExecution(executionId, 'execution_status', { status: 'PAUSED', executionId });
          return;
        }

        // Update current executing node
        await Execution.findByIdAndUpdate(executionId, { currentNode: nodeId });
        emitToExecution(executionId, 'node_start', { nodeId, step: i + 1, total: plan.totalSteps });

        let stepSuccess = false;
        let retryAttempt = 0;
        let stepOutput = null;

        while (!stepSuccess && retryAttempt <= 3) {
          try {
            // Execution Agent runs node
            await monitoringAgent.emitEvent({
              executionId,
              workflowId,
              nodeId,
              agent: 'execution',
              level: 'info',
              message: `Execution Agent running step ${i + 1}/${plan.totalSteps}: "${node.data?.label || nodeId}" [${node.data?.provider || 'system'}]`,
              metadata: { attempt: retryAttempt + 1 },
            });

            stepOutput = await executionAgent.executeNode(userId, node, accumulatedContext);

            // Validation Agent verifies output contracts
            await monitoringAgent.emitEvent({
              executionId,
              workflowId,
              nodeId,
              agent: 'validation',
              level: 'info',
              message: `Validation Agent verifying output schema for node ${nodeId}...`,
            });

            const validation = await validationAgent.validate(node, stepOutput);

            if (!validation.isValid) {
              throw new Error(validation.message);
            }

            await monitoringAgent.emitEvent({
              executionId,
              workflowId,
              nodeId,
              agent: 'validation',
              level: 'success',
              message: validation.message,
            });

            // Store in accumulated context
            accumulatedContext.steps[nodeId] = stepOutput.output;
            accumulatedContext[nodeId] = stepOutput.output;

            stepSuccess = true;
            emitToExecution(executionId, 'node_complete', { nodeId, output: stepOutput.output });
          } catch (stepErr) {
            // Recovery Agent classifies error & determines strategy
            const recoveryStrategy = recoveryAgent.classifyAndPlan(stepErr, retryAttempt);

            await monitoringAgent.emitEvent({
              executionId,
              workflowId,
              nodeId,
              agent: 'recovery',
              level: recoveryStrategy.decision === 'retry_with_backoff' ? 'warning' : 'error',
              message: recoveryStrategy.message,
              metadata: {
                errorCategory: recoveryStrategy.errorCategory,
                decision: recoveryStrategy.decision,
                originalError: stepErr.message,
              },
            });

            if (recoveryStrategy.decision === 'retry_with_backoff') {
              retryAttempt++;
              await Execution.findByIdAndUpdate(executionId, {
                status: 'RETRYING',
                retryCount: retryAttempt,
              });
              emitToExecution(executionId, 'execution_status', { status: 'RETRYING', executionId });
              // Wait backoff delay
              await new Promise((resolve) => setTimeout(resolve, Math.min(recoveryStrategy.backoffDelayMs, 3000)));
            } else {
              // Escalation to operator
              await monitoringAgent.notifyOperator({
                userId,
                workflowId,
                executionId,
                type: 'escalation',
                title: `Workflow Execution Failed: ${workflowSnapshot.name}`,
                message: `Failed at step "${node.data?.label || nodeId}". Error: ${stepErr.message}. Classification: ${recoveryStrategy.errorCategory}`,
              });
              throw stepErr;
            }
          }
        }
      }

      // 5. Complete Execution Successfully
      const duration = Date.now() - startTime;
      await Execution.findByIdAndUpdate(executionId, {
        status: 'COMPLETED',
        currentNode: null,
        endTime: new Date(),
        duration,
        outputs: accumulatedContext.steps,
      });

      // Update workflow lastExecutedAt
      await Workflow.findByIdAndUpdate(workflowId, { lastExecutedAt: new Date() });

      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        agent: 'monitoring',
        level: 'success',
        message: `Workflow "${workflowSnapshot.name}" completed successfully in ${(duration / 1000).toFixed(2)}s.`,
        metadata: { duration, completedSteps: plan.totalSteps },
      });

      await monitoringAgent.notifyOperator({
        userId,
        workflowId,
        executionId,
        type: 'success',
        title: `Workflow Succeeded: ${workflowSnapshot.name}`,
        message: `Completed all ${plan.totalSteps} steps in ${(duration / 1000).toFixed(2)}s without errors.`,
      });

      emitToExecution(executionId, 'execution_status', {
        status: 'COMPLETED',
        executionId,
        duration,
        outputs: accumulatedContext.steps,
      });

      this.clearExecutionControl(executionId);
    } catch (finalErr) {
      const duration = Date.now() - startTime;
      await Execution.findByIdAndUpdate(executionId, {
        status: 'FAILED',
        endTime: new Date(),
        duration,
        error: {
          message: finalErr.message,
          stack: finalErr.stack,
        },
      });

      emitToExecution(executionId, 'execution_status', {
        status: 'FAILED',
        executionId,
        duration,
        error: finalErr.message,
      });

      this.clearExecutionControl(executionId);
    }
  }
}

module.exports = new MultiAgentOrchestrator();
