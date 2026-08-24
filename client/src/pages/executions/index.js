import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Filter,
  Layers,
  Search,
  Loader2,
  PauseCircle,
} from 'lucide-react';

export default function ExecutionsListPage() {
  const [executions, setExecutions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchExecutions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/executions', {
        params: { status: statusFilter },
      });
      setExecutions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch executions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [statusFilter]);

  // Real-time updates over Socket.IO
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleExecutionUpdate = ({ executionId, event, data }) => {
        setExecutions((prev) =>
          prev.map((exec) => {
            if ((exec._id || exec.id) === executionId) {
              if (event === 'execution_status') {
                return { ...exec, status: data.status, duration: data.duration || exec.duration };
              }
            }
            return exec;
          })
        );
      };

      socket.on('execution_update', handleExecutionUpdate);
      return () => {
        socket.off('execution_update', handleExecutionUpdate);
      };
    }
  }, []);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Execution Audits & Logs
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Live stream and historical timeline of all agentic workflow runs.
              </p>
            </div>

            <button
              onClick={fetchExecutions}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition flex items-center space-x-2 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300 font-semibold">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="RUNNING">RUNNING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
                <option value="RETRYING">RETRYING</option>
                <option value="PAUSED">PAUSED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Total: {executions.length} runs
            </div>
          </div>

          {/* Executions Table */}
          {isLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 mt-3 font-mono">Loading execution history...</p>
            </div>
          ) : executions.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800 p-8">
              <PlayCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No execution runs recorded</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Trigger a workflow from the Workflows Studio or AI Builder to start an agentic run.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e1628] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Workflow Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Started At</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Retries</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {executions.map((exec) => {
                    const execId = exec._id || exec.id;
                    return (
                      <tr
                        key={execId}
                        className="hover:bg-slate-800/40 transition cursor-pointer"
                        onClick={() => (window.location.href = `/executions/${execId}`)}
                      >
                        <td className="px-6 py-4 font-bold text-white">
                          <div className="flex items-center space-x-3">
                            {exec.status === 'COMPLETED' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {exec.status === 'RUNNING' && (
                              <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0 animate-spin" />
                            )}
                            {exec.status === 'FAILED' && (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            {exec.status === 'RETRYING' && (
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                            )}
                            {exec.status === 'PAUSED' && (
                              <PauseCircle className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <div>
                              <p className="truncate max-w-xs">{exec.workflowSnapshot?.name || 'Automation'}</p>
                              <span className="text-[10px] font-mono text-slate-400">ID: {execId.substring(0, 10)}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono uppercase ${
                              exec.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : exec.status === 'RUNNING'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
                                : exec.status === 'FAILED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {exec.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-mono text-slate-400">
                          {new Date(exec.startTime).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 font-mono text-slate-300">
                          {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'running...'}
                        </td>

                        <td className="px-6 py-4 font-mono text-slate-400">
                          {exec.retryCount || 0}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/executions/${execId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-semibold text-xs border border-indigo-500/30 transition"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
