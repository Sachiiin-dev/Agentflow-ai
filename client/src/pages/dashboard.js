import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import api from '../services/api';
import {
  Sparkles,
  Workflow,
  Play,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Layers,
  ShieldCheck,
  Plus,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/workflows/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          {/* Header & Quick Action Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Operator Console
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-semibold">
                  Multi-Agent Live
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Real-time overview of AI agent pipelines, third-party integrations, and execution audits.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchStats}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                title="Refresh stats"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link
                href="/workflows/builder"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Prompt to Graph</span>
              </Link>
            </div>
          </div>

          {/* Metric Grid KPIs */}
          <MetricGrid metrics={stats?.metrics || {}} />

          {/* 2-Column Section: Recent Executions & Active Agent Pipelines */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Executions Panel (2 cols) */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-sm text-white">Recent Execution Runs</h3>
                </div>
                <Link
                  href="/executions"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-800/80">
                {!stats?.recentExecutions || stats.recentExecutions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No execution runs recorded yet. Create or trigger a workflow to start.
                  </div>
                ) : (
                  stats.recentExecutions.map((exec) => (
                    <div
                      key={exec._id || exec.id}
                      className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {exec.status === 'COMPLETED' ? (
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : exec.status === 'RUNNING' ? (
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-spin">
                            <RefreshCw className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <Link
                            href={`/executions/${exec._id || exec.id}`}
                            className="text-xs font-bold text-slate-200 hover:text-indigo-400 truncate block"
                          >
                            {exec.workflowSnapshot?.name || 'Automation Run'}
                          </Link>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span>ID: {(exec._id || exec.id).substring(0, 8)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'running'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase ${
                            exec.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : exec.status === 'RUNNING'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {exec.status}
                        </span>
                        <Link
                          href={`/executions/${exec._id || exec.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="View Live Timeline"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Agent Activity & Substrate Status (1 col) */}
            <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Agent Substrate Mesh</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Planner Agent</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      DAG Kahn Sort
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Resolves dependency acyclic graphs and emits step confidence metrics.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Execution Agent</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      Live Tool Dispatch
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Evaluates template interpolations and calls OAuth tool services.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Recovery Agent</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Exponential Backoff
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Auto-classifies errors (Rate Limit, Auth Expired, Transient) with self-healing.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/workflows/builder"
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-xs flex items-center justify-center space-x-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create with AI Prompt</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
