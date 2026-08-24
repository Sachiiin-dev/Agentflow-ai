import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import {
  Workflow,
  Sparkles,
  Plus,
  Play,
  Copy,
  Trash2,
  Search,
  Layers,
  Clock,
  CheckCircle2,
  Tag,
  ExternalLink,
  Loader2,
  MoreVertical,
} from 'lucide-react';

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(null);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/workflows', {
        params: { search, status: statusFilter },
      });
      setWorkflows(res.data || []);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [search, statusFilter]);

  const handleCreateManual = async () => {
    try {
      const res = await api.post('/workflows', {
        name: 'New Custom Automation',
        description: 'Visual workflow created in studio',
      });
      router.push(`/workflows/${res.data._id || res.data.id}`);
    } catch (err) {
      alert(`Error creating workflow: ${err.message}`);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (err) {
      alert(`Error duplicating workflow: ${err.message}`);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        await api.delete(`/workflows/${id}`);
        fetchWorkflows();
      } catch (err) {
        alert(`Error deleting workflow: ${err.message}`);
      }
    }
  };

  const handleExecute = async (id, e) => {
    e.stopPropagation();
    setIsTriggering(id);
    try {
      const res = await api.post(`/workflows/${id}/execute`, {});
      const execId = res.data._id || res.data.id;
      router.push(`/executions/${execId}`);
    } catch (err) {
      alert(`Execution failed: ${err.message}`);
      setIsTriggering(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Workflows Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Manage, design, and trigger your multi-agent automations.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/workflows/builder"
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Prompt to Graph</span>
              </Link>

              <button
                onClick={handleCreateManual}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Workflow</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search workflows by title or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-mono">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Workflows Grid */}
          {isLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 mt-3 font-mono">Loading workflows...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800 p-8">
              <Workflow className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No workflows found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Generate an automation with natural language or create a new graph on the React Flow canvas.
              </p>
              <div className="mt-6 flex items-center justify-center space-x-3">
                <Link
                  href="/workflows/builder"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate with AI</span>
                </Link>
                <button
                  onClick={handleCreateManual}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs"
                >
                  Create Manually
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((wf) => {
                const nodeCount = wf.nodes?.length || 0;
                const isRunning = isTriggering === (wf._id || wf.id);

                return (
                  <div
                    key={wf._id || wf.id}
                    onClick={() => router.push(`/workflows/${wf._id || wf.id}`)}
                    className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition duration-200 flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          v{wf.version || 1}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                            wf.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {wf.status || 'draft'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-white mt-3 group-hover:text-indigo-400 transition">
                        {wf.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {wf.description || 'No description provided.'}
                      </p>

                      {/* Tags */}
                      {wf.tags && wf.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {wf.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{nodeCount} steps</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleDuplicate(wf._id || wf.id, e)}
                          title="Duplicate Workflow"
                          className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(wf._id || wf.id, e)}
                          title="Delete Workflow"
                          className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleExecute(wf._id || wf.id, e)}
                          disabled={isRunning}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition"
                        >
                          {isRunning ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          <span>Run</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
