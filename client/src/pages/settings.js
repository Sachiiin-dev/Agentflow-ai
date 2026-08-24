import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import {
  User,
  Shield,
  Key,
  Database,
  Lock,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Activity,
  Layers,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [health, setHealth] = useState(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        setHealth(res);
      } catch (err) {
        console.error('Failed to fetch system health:', err);
      } finally {
        setIsLoadingHealth(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Settings & Security Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage operator credentials, encryption health checks, and engine substrate settings.
            </p>
          </div>

          <div className="space-y-6">
            {/* Operator Profile Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                <User className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Operator Identity
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || 'Operator'}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'operator@agentflow.ai'}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Role</label>
                  <div className="flex items-center space-x-2 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-mono uppercase font-bold text-purple-300">
                      {user?.role || 'operator'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Session Protocol</label>
                  <input
                    type="text"
                    disabled
                    value="JWT (HMAC-SHA256) • 7d Expiration"
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* System & Encryption Health Checks */}
            <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Encryption & Substrate Health
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Database Layer</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {health?.database?.uri || 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    MongoDB with zero-dependency in-memory failover ready.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Token Vault</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      AES-256-GCM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Credentials encrypted at rest using application-level 256-bit key.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Agent Substrate</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      LangGraph Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    5-Agent chain (Planner, Executor, Validator, Recovery, Monitor).
                  </p>
                </div>
              </div>
            </div>

            {/* Security Controls */}
            <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Platform Security Enforcements
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Password hashing enforcements: Bcrypt salt rounds at cost factor 12.</span>
                </div>
                <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>HTTP security headers enforced via Helmet and CORS locked to client URL.</span>
                </div>
                <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Brute-force protection: Express Rate Limiter active on auth endpoints.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
