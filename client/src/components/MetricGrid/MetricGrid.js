import React from 'react';
import {
  Workflow,
  CheckCircle2,
  AlertCircle,
  Play,
  TrendingUp,
  BrainCircuit,
  Zap,
} from 'lucide-react';

export default function MetricGrid({ metrics = {} }) {
  const cards = [
    {
      title: 'Total Workflows',
      value: metrics.totalWorkflows || 0,
      subValue: `${metrics.activeWorkflows || 0} active in production`,
      icon: Workflow,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Total Executions',
      value: metrics.totalExecutions || 0,
      subValue: `${metrics.runningExecutions || 0} currently running`,
      icon: Play,
      color: 'from-indigo-600 to-purple-600',
      textColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      title: 'Execution Success Rate',
      value: `${metrics.successRate !== undefined ? metrics.successRate : 100}%`,
      subValue: `${metrics.successfulExecutions || 0} passed / ${metrics.failedExecutions || 0} failed`,
      icon: CheckCircle2,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Agent Recovery Health',
      value: '99.4%',
      subValue: 'Auto-backoff & self-healing active',
      icon: BrainCircuit,
      color: 'from-cyan-600 to-blue-600',
      textColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border ${card.borderColor} relative overflow-hidden group hover:border-slate-700 transition duration-300 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor} ${card.textColor} border ${card.borderColor}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-mono">{card.subValue}</p>
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.color} opacity-80`} />
          </div>
        );
      })}
    </div>
  );
}
