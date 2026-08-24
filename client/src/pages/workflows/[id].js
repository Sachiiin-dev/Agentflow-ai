import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodePalette from '../../components/NodePalette/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import WorkflowToolbar from '../../components/WorkflowCanvas/WorkflowToolbar';
import { useWorkflowStore } from '../../store/workflowStore';
import { getSocket, joinExecutionRoom, leaveExecutionRoom } from '../../services/socket';
import {
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Layers,
  Terminal,
  X,
  ExternalLink,
} from 'lucide-react';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const fetchWorkflow = useWorkflowStore((s) => s.fetchWorkflow);
  const triggerWorkflowExecution = useWorkflowStore((s) => s.triggerWorkflowExecution);
  const isLoading = useWorkflowStore((s) => s.isLoading);
  const error = useWorkflowStore((s) => s.error);
  const currentExecution = useWorkflowStore((s) => s.currentExecution);
  const executionLogs = useWorkflowStore((s) => s.executionLogs);
  const addExecutionLog = useWorkflowStore((s) => s.addExecutionLog);
  const setActiveNodeId = useWorkflowStore((s) => s.setActiveNodeId);
  const setCurrentExecutionStatus = useWorkflowStore((s) => s.setCurrentExecutionStatus);

  const [isExecutionDrawerOpen, setIsExecutionDrawerOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkflow(id).catch((err) => console.error('Workflow load error:', err));
    }
  }, [id, fetchWorkflow]);

  // Socket listener for live execution stream
  useEffect(() => {
    if (!currentExecution) return;
    const executionId = currentExecution._id || currentExecution.id;
    if (!executionId) return;

    joinExecutionRoom(executionId);
    const socket = getSocket();

    if (socket) {
      const handleAgentEvent = (eventData) => {
        addExecutionLog(eventData);
        if (eventData.nodeId) {
          setActiveNodeId(eventData.nodeId);
        }
      };

      const handleStatus = (statusData) => {
        setCurrentExecutionStatus(statusData.status);
      };

      socket.on('agent_event', handleAgentEvent);
      socket.on('execution_status', handleStatus);

      return () => {
        socket.off('agent_event', handleAgentEvent);
        socket.off('execution_status', handleStatus);
        leaveExecutionRoom(executionId);
      };
    }
  }, [currentExecution, addExecutionLog, setActiveNodeId, setCurrentExecutionStatus]);

  const handleExecute = async () => {
    if (!id) return;
    setIsExecutionDrawerOpen(true);
    try {
      await triggerWorkflowExecution(id);
    } catch (err) {
      alert(`Trigger failed: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="h-[calc(100vh-64px)] flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Loading Workflow Canvas...</p>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Workflow Studio | Agentflow_AI</title>
      </Head>
      <AppShell>
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden relative">
          {/* Top Canvas Toolbar */}
          <WorkflowToolbar onExecute={handleExecute} />

          {/* Canvas Workspace: Left Palette, Center React Flow, Right Config Inspector */}
          <div className="flex-1 flex overflow-hidden relative">
            <NodePalette />
            <WorkflowCanvas />
            <NodeConfigPanel />
          </div>

          {/* Real-time Execution Drawer / Live Agent Console */}
          {isExecutionDrawerOpen && currentExecution && (
            <div className="absolute bottom-4 right-4 w-96 max-h-[420px] bg-slate-950/95 border border-indigo-500/50 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col z-30 overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="p-3.5 bg-[#0e1628] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white font-mono">
                    Live Agent Timeline
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                      currentExecution.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : currentExecution.status === 'RUNNING'
                        ? 'bg-indigo-500/20 text-indigo-300 animate-pulse'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {currentExecution.status}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      router.push(`/executions/${currentExecution._id || currentExecution.id}`)
                    }
                    title="Open Full Execution Page"
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsExecutionDrawerOpen(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Logs Stream */}
              <div className="p-4 space-y-2.5 overflow-y-auto flex-1 font-mono text-[11px] max-h-[300px]">
                {executionLogs.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Orchestrating agent pipeline...</span>
                  </div>
                ) : (
                  executionLogs.map((log, lIdx) => (
                    <div
                      key={lIdx}
                      className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded uppercase ${
                            log.agent === 'planner'
                              ? 'bg-purple-500/20 text-purple-300'
                              : log.agent === 'execution'
                              ? 'bg-blue-500/20 text-blue-300'
                              : log.agent === 'validation'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : log.agent === 'recovery'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {log.agent}
                        </span>
                        <span className="text-slate-400">
                          {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-snug">{log.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
