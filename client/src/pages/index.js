import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import {
  Bot,
  Sparkles,
  Zap,
  ShieldCheck,
  PlayCircle,
  Layers,
  ArrowRight,
  CheckCircle2,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  Cpu,
  Workflow,
  RefreshCw,
  GitBranch,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  const features = [
    {
      title: 'Natural Language to Graph',
      desc: 'Type an operational prompt in plain English and watch a complete, executable React Flow DAG materialize in seconds.',
      icon: Sparkles,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      title: '5-Agent Co-Operative Chain',
      desc: 'Planner, Execution, Validation, Recovery, and Monitoring agents work in sync to run, verify, and heal every workflow step.',
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      title: 'Autonomous Self-Healing',
      desc: 'Automatic error classification (rate limits, expired tokens, transient errors) with exponential backoff & operator escalation.',
      icon: RefreshCw,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Real Third-Party Integrations',
      desc: 'Production-ready OAuth and bot connections for Gmail, Slack, Discord, and Google Sheets with AES-256 encrypted credential vault.',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
  ];

  const agentPillars = [
    {
      name: 'Planner Agent',
      role: 'Topological DAG Dependency Sorting & Confidence Scoring',
      badge: 'Violet Substrate',
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
    },
    {
      name: 'Execution Agent',
      role: 'Dynamic Parameter Interpolation & Third-Party Tool Dispatch',
      badge: 'Blue Substrate',
      color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
    },
    {
      name: 'Validation Agent',
      role: 'Schema Enforcement & Contract Verification',
      badge: 'Emerald Substrate',
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
    },
    {
      name: 'Recovery Agent',
      role: 'Failure Classification, Exponential Backoff & Escalation',
      badge: 'Amber Substrate',
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
    },
    {
      name: 'Monitoring Agent',
      role: 'Live Socket.IO Stream & Audit Trail Persisting',
      badge: 'Cyan Substrate',
      color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-slate-800/80 bg-[#0c1222]/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              Agentflow
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-widest uppercase">
              AI
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
            >
              <span>Go to Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-20 pb-24 max-w-7xl mx-auto text-center">
        {/* Glow background orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Generation Multi-Agent Automation Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Turn Natural Language into{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            Autonomous Workflows
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Describe complex business operations in plain English. Agentflow automatically compiles visual graphs,
          orchestrates a cooperating 5-agent chain, and executes across your tools in real time.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition transform hover:-translate-y-0.5"
          >
            <span>Launch Operator Console</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/workflows/builder"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base flex items-center justify-center space-x-2 transition"
          >
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Try AI Prompt Generator</span>
          </Link>
        </div>

        {/* Multi-Agent Architecture Card */}
        <div className="mt-20 p-8 rounded-3xl bg-slate-900/70 border border-slate-800 text-left shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
                Cooperating Multi-Agent Chain
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Autonomous Execution Lifecycle</h2>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Substrate: LangGraph Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            {agentPillars.map((agent, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${agent.color} flex flex-col justify-between`}>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                    Step 0{i + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{agent.name}</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-snug">{agent.role}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[10px] font-mono font-semibold">
                  {agent.badge}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 lg:px-12 py-20 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white">Enterprise Automation Capabilities</h2>
          <p className="text-slate-400 text-sm mt-3">
            Engineered with zero-trust token encryption, real-time Socket.IO timeline events, and robust failover.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`p-7 rounded-2xl bg-slate-900/60 border ${feat.border} hover:border-slate-700 transition duration-300 shadow-lg`}
              >
                <div className={`w-12 h-12 rounded-xl ${feat.bg} ${feat.color} border ${feat.border} flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 px-6 text-center text-xs text-slate-400 font-mono">
        <p>© 2026 Agentflow_AI. Agentic AI Operations Automation Platform.</p>
      </footer>
    </div>
  );
}
