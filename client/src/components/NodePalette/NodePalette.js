import React, { useState } from 'react';
import {
  Zap,
  Bot,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  GitBranch,
  Sliders,
  Plus,
  Sparkles,
  Search,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const nodeTemplates = [
  // Triggers
  {
    category: 'Triggers',
    items: [
      {
        label: 'Webhook Trigger',
        type: 'trigger',
        category: 'trigger',
        provider: 'system',
        action: 'webhook_received',
        icon: Zap,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        params: { path: '/webhook/custom-event' },
      },
      {
        label: 'Cron Schedule',
        type: 'trigger',
        category: 'trigger',
        provider: 'system',
        action: 'cron_schedule',
        icon: Zap,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        params: { cron: '0 9 * * 1-5' },
      },
      {
        label: 'Gmail New Email',
        type: 'trigger',
        category: 'trigger',
        provider: 'gmail',
        action: 'read_emails',
        icon: Mail,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        params: { query: 'is:unread' },
      },
    ],
  },
  // AI Agents
  {
    category: 'AI Agents',
    items: [
      {
        label: 'Gemini Reasoning',
        type: 'ai_action',
        category: 'ai',
        provider: 'gemini',
        action: 'reasoning',
        icon: Sparkles,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        params: { prompt: 'Analyze inputs and formulate decision' },
      },
      {
        label: 'OpenRouter Claude',
        type: 'ai_action',
        category: 'ai',
        provider: 'openrouter',
        action: 'extract_entities',
        icon: Bot,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        params: { prompt: 'Extract structured attributes from payload' },
      },
    ],
  },
  // Integrations
  {
    category: 'Integrations',
    items: [
      {
        label: 'Gmail Send Email',
        type: 'integration_action',
        category: 'integration',
        provider: 'gmail',
        action: 'send_email',
        icon: Mail,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        params: { to: 'operator@company.com', subject: 'Automated Notice', body: '{{node_1.summary}}' },
      },
      {
        label: 'Slack Post Message',
        type: 'integration_action',
        category: 'integration',
        provider: 'slack',
        action: 'post_message',
        icon: MessageSquare,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        params: { channel: '#ops-alerts', text: '🚀 Notification: {{node_2.summary}}' },
      },
      {
        label: 'Discord Send Embed',
        type: 'integration_action',
        category: 'integration',
        provider: 'discord',
        action: 'send_embed',
        icon: MessageSquare,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        params: { channelId: 'general', title: 'System Event', description: 'Action executed' },
      },
      {
        label: 'Google Sheets Append',
        type: 'integration_action',
        category: 'integration',
        provider: 'google-sheets',
        action: 'append_row',
        icon: FileSpreadsheet,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        params: { spreadsheetId: 'ops_ledger', sheetName: 'Sheet1', values: ['{{node_1.timestamp}}', 'OK'] },
      },
    ],
  },
  // Logic & Flow
  {
    category: 'Logic & Flow',
    items: [
      {
        label: 'Condition / Filter',
        type: 'condition',
        category: 'logic',
        provider: 'system',
        action: 'filter',
        icon: GitBranch,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        params: { condition: '{{node_1.status}} == "SUCCESS"' },
      },
      {
        label: 'Data Transformer',
        type: 'transformer',
        category: 'transform',
        provider: 'system',
        action: 'transform_json',
        icon: Sliders,
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        params: { format: 'json' },
      },
    ],
  },
];

export default function NodePalette() {
  const [search, setSearch] = useState('');
  const addNode = useWorkflowStore((s) => s.addNode);

  const onDragStart = (event, nodeItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeItem));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-[#0a0f1d]/95 border-r border-slate-800 p-4 flex flex-col shrink-0 h-full overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Node Palette</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">Drag to canvas or click to add</p>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {nodeTemplates.map((cat, idx) => {
          const filteredItems = cat.items.filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase()) ||
            item.provider.toLowerCase().includes(search.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={idx}>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                {cat.category}
              </h4>
              <div className="space-y-1.5">
                {filteredItems.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={itemIdx}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      onClick={() => addNode(item)}
                      className={`p-2.5 rounded-xl border ${item.border} ${item.bg} hover:border-indigo-500/50 cursor-grab active:cursor-grabbing transition-all flex items-center justify-between group`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <div>
                          <p className="text-xs font-medium text-slate-200 group-hover:text-white">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono capitalize">
                            {item.provider}
                          </p>
                        </div>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
