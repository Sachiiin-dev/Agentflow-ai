import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Settings,
  Sparkles,
  Sliders,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function NodeConfigPanel() {
  const selectedNode = useWorkflowStore((s) => s.selectedNode);
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const removeNode = useWorkflowStore((s) => s.removeNode);

  const [label, setLabel] = useState('');
  const [provider, setProvider] = useState('system');
  const [action, setAction] = useState('default');
  const [params, setParams] = useState({});

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || '');
      setProvider(selectedNode.data?.provider || 'system');
      setAction(selectedNode.data?.action || 'default');
      setParams(selectedNode.data?.params || {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const handleParamChange = (key, value) => {
    const updated = { ...params, [key]: value };
    setParams(updated);
    updateNodeData(selectedNode.id, { params: updated });
  };

  const handleLabelChange = (newLabel) => {
    setLabel(newLabel);
    updateNodeData(selectedNode.id, { label: newLabel });
  };

  const handleActionChange = (newAction) => {
    setAction(newAction);
    updateNodeData(selectedNode.id, { action: newAction });
  };

  return (
    <aside className="w-80 bg-[#0a0f1d]/95 border-l border-slate-800 p-5 flex flex-col justify-between shrink-0 h-full overflow-y-auto z-20 shadow-2xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Node Inspector
            </h3>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Node ID & Type Pill */}
        <div className="flex items-center justify-between text-[11px] font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400">ID: {selectedNode.id}</span>
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 capitalize">
            {selectedNode.type}
          </span>
        </div>

        {/* Step Label */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Step Name</label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Provider Display */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Provider / Runtime</label>
          <input
            type="text"
            disabled
            value={provider.toUpperCase()}
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800/80 rounded-lg text-slate-400 font-mono"
          />
        </div>

        {/* Action Type */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Action Method</label>
          <input
            type="text"
            value={action}
            onChange={(e) => handleActionChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Dynamic Parameter Fields based on Node Type / Provider */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Action Parameters
          </h4>

          {/* AI Prompt Input */}
          {(provider === 'gemini' || provider === 'openrouter' || selectedNode.type === 'ai_action') && (
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">AI Prompt / Instruction</label>
              <textarea
                rows={4}
                value={params.prompt || ''}
                onChange={(e) => handleParamChange('prompt', e.target.value)}
                placeholder="Instruct the AI agent on what to synthesize..."
                className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Gmail Parameters */}
          {provider === 'gmail' && (
            <>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">To Email</label>
                <input
                  type="text"
                  value={params.to || ''}
                  onChange={(e) => handleParamChange('to', e.target.value)}
                  placeholder="recipient@company.com"
                  className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={params.subject || ''}
                  onChange={(e) => handleParamChange('subject', e.target.value)}
                  placeholder="Subject title..."
                  className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* Slack Parameters */}
          {provider === 'slack' && (
            <>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Slack Channel</label>
                <input
                  type="text"
                  value={params.channel || ''}
                  onChange={(e) => handleParamChange('channel', e.target.value)}
                  placeholder="#ops-alerts"
                  className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Message Text / Template</label>
                <textarea
                  rows={3}
                  value={params.text || ''}
                  onChange={(e) => handleParamChange('text', e.target.value)}
                  placeholder="Message with {{node_1.field}} variables..."
                  className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* Google Sheets Parameters */}
          {provider === 'google-sheets' && (
            <>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Spreadsheet ID</label>
                <input
                  type="text"
                  value={params.spreadsheetId || ''}
                  onChange={(e) => handleParamChange('spreadsheetId', e.target.value)}
                  placeholder="sheet_id_or_name"
                  className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Sheet Tab Name</label>
                <input
                  type="text"
                  value={params.sheetName || 'Sheet1'}
                  onChange={(e) => handleParamChange('sheetName', e.target.value)}
                  placeholder="Sheet1"
                  className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* Discord Parameters */}
          {provider === 'discord' && (
            <>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Channel / Webhook</label>
                <input
                  type="text"
                  value={params.channelId || ''}
                  onChange={(e) => handleParamChange('channelId', e.target.value)}
                  placeholder="Channel ID or general"
                  className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Embed Title</label>
                <input
                  type="text"
                  value={params.title || ''}
                  onChange={(e) => handleParamChange('title', e.target.value)}
                  placeholder="Embed title..."
                  className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* Interpolation helper guide */}
          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300">
            <span className="font-semibold block mb-1">💡 Template Variables</span>
            Reference previous node outputs using <code className="bg-indigo-900/60 px-1 py-0.5 rounded text-indigo-200">{'{{node_id.field}}'}</code>.
          </div>
        </div>
      </div>

      {/* Footer / Delete Button */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={() => removeNode(selectedNode.id)}
          className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center space-x-2 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Node</span>
        </button>
      </div>
    </aside>
  );
}
