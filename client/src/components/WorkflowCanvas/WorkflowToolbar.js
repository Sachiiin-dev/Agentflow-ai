import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Save,
  Play,
  Copy,
  Sparkles,
  ArrowLeft,
  Check,
  Loader2,
  Share2,
  Tag,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function WorkflowToolbar({ onExecute }) {
  const router = useRouter();
  const workflow = useWorkflowStore((s) => s.workflow);
  const isDirty = useWorkflowStore((s) => s.isDirty);
  const isSaving = useWorkflowStore((s) => s.isSaving);
  const isExecuting = useWorkflowStore((s) => s.isExecuting);
  const saveWorkflow = useWorkflowStore((s) => s.saveWorkflow);

  if (!workflow) return null;

  return (
    <div className="h-14 bg-[#090e1c]/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between z-10">
      {/* Left: Back Link & Workflow Metadata */}
      <div className="flex items-center space-x-3">
        <Link
          href="/workflows"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
          title="Back to Workflows"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-white tracking-tight">{workflow.name}</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              v{workflow.version || 1}
            </span>
            {isDirty && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Unsaved changes
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-sm">
            {workflow.description || 'Custom Agentflow Automation'}
          </p>
        </div>
      </div>

      {/* Right: Actions (Save, Run, Prompt Assistant) */}
      <div className="flex items-center space-x-3">
        {/* AI Assistant Link */}
        <Link
          href="/workflows/builder"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Builder</span>
        </Link>

        {/* Save Button */}
        <button
          onClick={saveWorkflow}
          disabled={isSaving || !isDirty}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
            isDirty
              ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
              : 'bg-slate-900/50 text-slate-400 border border-slate-800 cursor-default'
          }`}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>

        {/* Run Execution Button */}
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
        >
          {isExecuting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isExecuting ? 'Running Agents...' : 'Execute Run'}</span>
        </button>
      </div>
    </div>
  );
}
