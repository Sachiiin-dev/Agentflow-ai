import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Zap,
  Bot,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  GitBranch,
  Sliders,
  Terminal,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const providerConfig = {
  gmail: { icon: Mail, color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' },
  slack: { icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  discord: { icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30' },
  'google-sheets': { icon: FileSpreadsheet, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  gemini: { icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30' },
  openrouter: { icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  system: { icon: Sliders, color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30' },
};

function CustomNode({ id, data, selected }) {
  const activeNodeId = useWorkflowStore((s) => s.activeNodeId);
  const isCurrentlyExecuting = activeNodeId === id;

  const provider = data.provider || 'system';
  const cfg = providerConfig[provider] || providerConfig.system;
  const Icon = cfg.icon;

  const isTrigger = data.category === 'trigger' || data.type === 'trigger';

  return (
    <div
      className={`relative rounded-2xl p-4 min-w-[240px] max-w-[280px] transition-all duration-200 ${
        isCurrentlyExecuting
          ? 'bg-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/30 animate-pulse-glow'
          : selected
          ? 'bg-slate-900/95 border-2 border-indigo-500 shadow-lg shadow-indigo-500/20'
          : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      {/* Input Handle (Not for triggers) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-slate-900"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className={`p-2 rounded-xl ${cfg.bg} ${cfg.color} ${cfg.border} border shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block truncate">
              {provider} • {data.action || 'action'}
            </span>
            <h4 className="text-xs font-semibold text-white truncate">{data.label || 'Step Node'}</h4>
          </div>
        </div>

        {/* Live Execution Spinner */}
        {isCurrentlyExecuting && (
          <div className="shrink-0 flex items-center justify-center p-1">
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Parameter / Prompt Preview */}
      {data.params && Object.keys(data.params).length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono space-y-1">
          {data.params.prompt && (
            <p className="line-clamp-2 italic text-slate-300">"{data.params.prompt}"</p>
          )}
          {data.params.to && <p className="truncate">To: {data.params.to}</p>}
          {data.params.channel && <p className="truncate">Channel: {data.params.channel}</p>}
          {data.params.spreadsheetId && <p className="truncate">Sheet: {data.params.spreadsheetId}</p>}
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-slate-900"
      />
    </div>
  );
}

export default memo(CustomNode);
