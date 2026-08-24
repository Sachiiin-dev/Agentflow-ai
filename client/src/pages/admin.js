import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import {
  ShieldAlert,
  Users,
  UserCheck,
  Trash2,
  RefreshCw,
  Cpu,
  Activity,
  Server,
  Key,
  Shield,
  Bot,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function AdminConsolePage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  const [users, setUsers] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, diagRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/auth/admin/diagnostics'),
      ]);
      setUsers(usersRes.data || []);
      setDiagnostics(diagRes.data || null);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/auth/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setActionMessage(`Updated user role to ${newRole.toUpperCase()}`);
    } catch (err) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (confirm(`Are you sure you want to permanently delete user "${userName}"?`)) {
      try {
        await api.delete(`/auth/users/${userId}`);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setActionMessage(`Deleted user "${userName}" successfully.`);
      } catch (err) {
        alert(`Failed to delete user: ${err.message}`);
      }
    }
  };

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-10 max-w-2xl mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Privileges Required</h2>
            <p className="text-xs text-slate-400">
              Your current account role is <span className="font-bold text-indigo-400 capitalize">{currentUser?.role || 'User'}</span>. The Admin Console is restricted to platform administrators.
            </p>
            <div className="pt-4">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Admin Governance Console | Agentflow_AI</title>
      </Head>
      <AppShell>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Admin Governance Console
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Full platform governance, user directory management, role authorization, and engine diagnostics.
              </p>
            </div>

            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition flex items-center space-x-2 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          {/* Action Message Alert */}
          {actionMessage && (
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{actionMessage}</span>
              </div>
              <button
                onClick={() => setActionMessage('')}
                className="text-xs text-purple-400 hover:text-white underline ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* System Diagnostics KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Total Accounts</span>
              <p className="text-2xl font-extrabold text-white font-mono">{diagnostics?.userCounts?.total || users.length}</p>
              <span className="text-[11px] text-slate-400">Registered platform identities</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-purple-500/20 space-y-1">
              <span className="text-[11px] font-mono text-purple-400 uppercase font-semibold">Administrators</span>
              <p className="text-2xl font-extrabold text-purple-300 font-mono">{diagnostics?.userCounts?.admin || 1}</p>
              <span className="text-[11px] text-slate-400">Super admins with root access</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-indigo-500/20 space-y-1">
              <span className="text-[11px] font-mono text-indigo-400 uppercase font-semibold">Operators</span>
              <p className="text-2xl font-extrabold text-indigo-300 font-mono">{diagnostics?.userCounts?.operator || 0}</p>
              <span className="text-[11px] text-slate-400">Workflow creators & runners</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-1">
              <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">Standard Users</span>
              <p className="text-2xl font-extrabold text-cyan-300 font-mono">{diagnostics?.userCounts?.user || 0}</p>
              <span className="text-[11px] text-slate-400">Workflow consumers</span>
            </div>
          </div>

          {/* User Management Table */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Platform User Directory & Role Delegation</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{users.length} Users Listed</span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2 font-mono">Loading User Directory...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0e1628] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">User / Email</th>
                      <th className="px-6 py-3.5">Current Role</th>
                      <th className="px-6 py-3.5">Registered</th>
                      <th className="px-6 py-3.5">Role Promotion / Delegation</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.map((u) => {
                      const isSelf = u.id === currentUser?.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  u.role === 'admin'
                                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                                    : u.role === 'operator'
                                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                                    : 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                                }`}
                              >
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-white flex items-center gap-1.5">
                                  {u.name}
                                  {isSelf && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-mono">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                u.role === 'admin'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : u.role === 'operator'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}
                            >
                              {u.role || 'user'}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-mono text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1.5">
                              {['user', 'operator', 'admin'].map((roleOpt) => (
                                <button
                                  key={roleOpt}
                                  onClick={() => handleRoleChange(u.id, roleOpt)}
                                  disabled={u.role === roleOpt}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold capitalize transition ${
                                    u.role === roleOpt
                                      ? 'bg-slate-800 text-slate-400 cursor-default opacity-50'
                                      : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300'
                                  }`}
                                >
                                  Make {roleOpt}
                                </button>
                              ))}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
