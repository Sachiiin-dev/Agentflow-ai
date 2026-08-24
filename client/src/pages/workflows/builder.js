import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import {
  Sparkles,
  Bot,
  Layers,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Zap,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  Workflow,
  ExternalLink,
  Code,
} from 'lucide-react';

const promptPresets = [
  {
    title: '📄 Invoice Processing & Slack Approval',
    prompt: 'When an email with an invoice arrives, extract the vendor name and total amount using AI, log the invoice to Google Sheets, and send an approval notification to Slack channel #finance-approvals.',
  },
  {
    title: '🚨 Operational Incident & Discord Broadcast',
    prompt: 'Listen for incident alert webhooks, classify urgency and summarize key metrics with AI, and dispatch a rich alert embed to Discord #ops-broadcast.',
  },
  {
    title: '✉️ Lead Auto-Responder & CRM Sync',
    prompt: 'When a new customer inquiry arrives via Gmail, draft an empathetic response using Gemini, send the reply, and append customer contact details to Google Sheets.',
  },
  {
    title: '📊 Hourly Health Audit & Team Alert',
    prompt: 'Run on an hourly cron schedule, analyze database and server uptime metrics with LLM reasoning, and broadcast a summary report to Slack #monitoring.',
  },
];

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (selectedPrompt) => {
    const promptToUse = selectedPrompt || prompt;
    if (!promptToUse.trim()) {
      setError('Please provide a prompt describing your automation.');
      return;
    }

    setError('');
    setIsGenerating(true);
    try {
      const res = await api.post('/workflows/generate', { prompt: promptToUse });
      setGeneratedResult(res.data);
    } catch (err) {
      setError(err.message || 'Failed to generate workflow.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenCanvas = () => {
    if (generatedResult) {
      router.push(`/workflows/${generatedResult._id || generatedResult.id}`);
    }
  };

  const handleExecuteNow = async () => {
    if (generatedResult) {
      try {
        const res = await api.post(`/workflows/${generatedResult._id || generatedResult.id}/execute`, {});
        router.push(`/executions/${res.data._id || res.data.id}`);
      } catch (err) {
        alert(`Execution failed: ${err.message}`);
      }
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Agent AI Workflow Compiler</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Prompt-to-Workflow Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Describe your automation logic in natural language. The AI engine synthesizes topological nodes,
              edge connections, tool bindings, and parameter variables automatically.
            </p>
          </div>

          {/* Prompt Input Panel */}
          <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" /> Automation Description Prompt
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                OpenRouter • Gemini • Deterministic Engine
              </span>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., When a customer emails support, summarize the problem with AI, notify the team in Slack, and append the ticket to our Google Sheet..."
              className="w-full p-4 text-sm bg-slate-950/90 border border-slate-800 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition leading-relaxed"
            />

            {error && (
              <p className="text-xs text-rose-400 font-medium">{error}</p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400">
                Click a preset below or type your own custom scenario.
              </div>
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-60"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isGenerating ? 'Synthesizing Workflow...' : 'Generate Workflow Graph'}</span>
              </button>
            </div>

            {/* Presets Pills */}
            <div className="pt-4 border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-3 font-semibold">
                Quick Sample Automation Prompts:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {promptPresets.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      setPrompt(preset.prompt);
                      handleGenerate(preset.prompt);
                    }}
                    className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800/90 text-left transition group"
                  >
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                      {preset.title}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {preset.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Graph Preview Panel */}
          {generatedResult && (
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/40 shadow-2xl space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-bold text-white">{generatedResult.name}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{generatedResult.description}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleOpenCanvas}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <Workflow className="w-4 h-4 text-indigo-400" />
                    <span>Open in Visual Studio</span>
                  </button>
                  <button
                    onClick={handleExecuteNow}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Execute Workflow Now</span>
                  </button>
                </div>
              </div>

              {/* Step Sequence Preview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4">
                  Synthesized Agent Pipeline ({generatedResult.nodes?.length || 0} Steps)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {generatedResult.nodes?.map((node, nIdx) => (
                    <div
                      key={node.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>STEP 0{nIdx + 1}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 capitalize">
                          {node.data?.provider || 'system'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{node.data?.label || node.id}</h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        Action: {node.data?.action || 'run'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
