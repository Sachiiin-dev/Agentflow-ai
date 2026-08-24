import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { getSocket, joinExecutionRoom, leaveExecutionRoom } from '../../services/socket';
import {
  ArrowLeft,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  Terminal,
  Activity,
  ShieldCheck,
  Loader2,
  FileCode,
  Check,
} from 'lucide-react';

const agentColors = {
  planner: { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', bar: 'bg-purple-500' },
  execution: { badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', bar: 'bg-blue-500' },
  validation: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', bar: 'bg-emerald-500' },
  recovery: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', bar: 'bg-amber-500' },
  monitoring: { badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', bar: 'bg-cyan-500' },
};

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'outputs' | 'snapshot'

  const fetchExecutionData = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/executions/${id}`);
      setExecution(res.data);
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load execution details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutionData();
  }, [id]);

  // Live streaming via Socket.IO
  useEffect(() => {
    if (!id) return;

    joinExecutionRoom(id);
    const socket = getSocket();

    if (socket) {
      const onAgentEvent = (eventData) => {
        setLogs((prev) => [...prev, eventData]);
      };

      const onExecutionStatus = (statusData) => {
        setExecution((prev) => (prev ? { ...prev, status: statusData.status, duration: statusData.duration || prev.duration } : prev));
      };

      socket.on('agent_event', onAgentEvent);
      socket.on('execution_status', onExecutionStatus);

      return () => {
        socket.off('agent_event', onAgentEvent);
        socket.off('execution_status', onExecutionStatus);
        leaveExecutionRoom(id);
      };
    }
  }, [id]);

  const handlePause = async () => {
    setIsActionLoading(true);
    try {
      await api.post(`/executions/${id}/pause`);
      fetchExecutionData();
    } catch (err) {
      alert(`Pause failed: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResume = async () => {
    setIsActionLoading(true);
    try {
      await api.post(`/executions/${id}/resume`);
      fetchExecutionData();
    } catch (err) {
      alert(`Resume failed: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (confirm('Cancel this running execution?')) {
      setIsActionLoading(true);
      try {
        await api.post(`/executions/${id}/cancel`);
        fetchExecutionData();
      } catch (err) {
        alert(`Cancel failed: ${err.message}`);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-3 font-mono">Loading Execution Timeline...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (!execution) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-10 text-center text-slate-400">
            <p>Execution not found.</p>
            <Link href="/executions" className="text-xs text-indigo-400 underline mt-2 block">
              Back to Executions
            </Link>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <Link
                href="/executions"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {execution.workflowSnapshot?.name || 'Execution Run'}
                  </h1>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono uppercase ${
                      execution.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : execution.status === 'RUNNING'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
                        : execution.status === 'FAILED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {execution.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Run ID: {execution._id || execution.id} • Substrate: {execution.langGraphStatus || 'available'}
                </p>
              </div>
            </div>

            {/* Lifecycle Control Buttons */}
            <div className="flex items-center space-x-2.5">
              {execution.status === 'RUNNING' && (
                <>
                  <button
                    onClick={handlePause}
                    disabled={isActionLoading}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isActionLoading}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </>
              )}

              {execution.status === 'PAUSED' && (
                <button
                  onClick={handleResume}
                  disabled={isActionLoading}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Execution</span>
                </button>
              )}

              <Link
                href={`/workflows/${execution.workflowId}`}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition"
              >
                <span>Edit Graph</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Duration</span>
              <p className="text-lg font-bold text-white mt-1 font-mono">
                {execution.duration ? `${(execution.duration / 1000).toFixed(2)}s` : 'active'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Agent Events</span>
              <p className="text-lg font-bold text-indigo-400 mt-1 font-mono">{logs.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Self-Heal Retries</span>
              <p className="text-lg font-bold text-amber-400 mt-1 font-mono">{execution.retryCount || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Start Time</span>
              <p className="text-xs font-semibold text-slate-300 mt-1.5 font-mono">
                {new Date(execution.startTime).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-4 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-3 text-xs font-bold transition flex items-center space-x-2 border-b-2 ${
                activeTab === 'timeline'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Multi-Agent Live Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab('outputs')}
              className={`pb-3 text-xs font-bold transition flex items-center space-x-2 border-b-2 ${
                activeTab === 'outputs'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Accumulated Node Outputs</span>
            </button>
            <button
              onClick={() => setActiveTab('snapshot')}
              className={`pb-3 text-xs font-bold transition flex items-center space-x-2 border-b-2 ${
                activeTab === 'snapshot'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Workflow DAG Snapshot</span>
            </button>
          </div>

          {/* Tab 1: Timeline View */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-mono">
                  Waiting for agent chain to emit events...
                </div>
              ) : (
                logs.map((log, index) => {
                  const cfg = agentColors[log.agent] || agentColors.monitoring;
                  return (
                    <div
                      key={log._id || log.id || index}
                      className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-2 relative overflow-hidden group hover:border-slate-700 transition"
                    >
                      <div className={`absolute top-0 bottom-0 left-0 w-1 ${cfg.bar}`} />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono border ${cfg.badge}`}
                          >
                            {log.agent} Agent
                          </span>
                          {log.nodeId && (
                            <span className="text-[11px] font-mono text-slate-400">
                              Node: {log.nodeId}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-mono">
                        {log.message}
                      </p>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 overflow-x-auto">
                          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Node Outputs */}
          {activeTab === 'outputs' && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Accumulated Context Outputs
              </h3>
              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto">
                {JSON.stringify(execution.outputs || {}, null, 2)}
              </pre>
            </div>
          )}

          {/* Tab 3: Workflow Snapshot */}
          {activeTab === 'snapshot' && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Immutable Runtime Graph
              </h3>
              <pre className="p-4 rounded-xl bg-slate-950 text-cyan-400 font-mono text-xs overflow-x-auto">
                {JSON.stringify(execution.workflowSnapshot || {}, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
