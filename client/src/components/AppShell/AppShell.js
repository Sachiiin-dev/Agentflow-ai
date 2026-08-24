import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  LayoutDashboard,
  Workflow,
  Sparkles,
  PlayCircle,
  Puzzle,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Bot,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Layers,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

export default function AppShell({ children }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        // silently handle
      }
    };

    fetchNotifications();

    // Listen to live notifications from Socket.IO
    const socket = getSocket();
    if (socket) {
      setSocketConnected(socket.connected);

      const onConnect = () => setSocketConnected(true);
      const onDisconnect = () => setSocketConnected(false);
      const onNotification = (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('notification', onNotification);

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('notification', onNotification);
      };
    }
  }, []);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Workflows', href: '/workflows', icon: Workflow },
    { label: 'AI Builder', href: '/workflows/builder', icon: Sparkles, badge: 'AI' },
    { label: 'Executions', href: '/executions', icon: PlayCircle },
    { label: 'Integrations', href: '/integrations', icon: Puzzle },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0c1222]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                  Agentflow
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-widest uppercase">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Agentic Ops Platform</p>
            </div>
          </Link>

          {/* Multi-Agent Orchestration Chain Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 text-[11px] font-mono bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Multi-Agent Chain:
            </span>
            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">Planner</span>
            <span className="text-slate-600">→</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">Executor</span>
            <span className="text-slate-600">→</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Validator</span>
            <span className="text-slate-600">→</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">Recovery</span>
            <span className="text-slate-600">→</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Monitor</span>
          </div>
        </div>

        {/* Right Section: Socket Status, Notification Bell, User Profile */}
        <div className="flex items-center space-x-4">
          {/* Socket Live Indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-2.5 py-1 rounded-full">
            <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-mono text-[11px]">{socketConnected ? 'Live Socket' : 'Connecting'}</span>
          </div>

          {/* Quick AI Builder CTA */}
          <Link
            href="/workflows/builder"
            className="hidden md:flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Workflow</span>
          </Link>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User Profile / Logout */}
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
            <Link href="/settings" className="flex items-center space-x-3 rounded-lg hover:bg-slate-900/60 p-1.5 -m-1.5 transition" aria-label="Open operator profile">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-slate-200 truncate max-w-[120px]">{user?.name || 'Operator'}</p>
                <p className="text-[10px] text-slate-400 font-mono capitalize">{user?.role || 'Operator'}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900/80 rounded transition"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-[#090e1a]/95 border-r border-slate-800/80 hidden md:flex flex-col justify-between p-4 shrink-0">
          <nav className="space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Operations
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href) && item.href !== '/workflows/builder');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* System Card */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Engine Substrate
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono">
                LangGraph
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Multi-agent chain & AES-256 encrypted credential vault active.
            </div>
          </div>
        </aside>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto relative bg-gradient-to-b from-[#090e1c] to-[#060912]">
          {children}
        </main>
      </div>

      {/* Notifications Sliding Drawer */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNotifOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#0d1424] border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-white">Execution Notifications</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      No notifications recorded yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id || notif.id}
                        className={`p-3.5 rounded-xl border transition ${
                          notif.isRead
                            ? 'bg-slate-900/40 border-slate-800 text-slate-300'
                            : 'bg-indigo-950/30 border-indigo-500/40 text-white shadow-sm'
                        }`}
                      >
                        <div className="flex items-start space-x-2.5">
                          {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
                          {notif.type === 'escalation' && <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />}
                          {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
                          {notif.type === 'info' && <Activity className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />}

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">{notif.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 break-words">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                              {new Date(notif.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
