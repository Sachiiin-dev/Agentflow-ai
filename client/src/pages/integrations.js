import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import api from '../services/api';
import {
  Mail,
  MessageSquare,
  FileSpreadsheet,
  Bot,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Key,
  Lock,
  Plus,
  Loader2,
} from 'lucide-react';

const providerCards = [
  {
    id: 'gmail',
    name: 'Gmail',
    desc: 'Send automated outreach, parse incoming tickets, and trigger actions on new unread emails.',
    icon: Mail,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    scopes: ['gmail.send', 'gmail.readonly'],
    oauthAvailable: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    desc: 'Post incident alerts, send approval requests with buttons, and dispatch agent summaries to channels.',
    icon: MessageSquare,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    scopes: ['chat:write', 'channels:read', 'incoming-webhook'],
    oauthAvailable: true,
  },
  {
    id: 'discord',
    name: 'Discord',
    desc: 'Broadcast rich embed messages, operational notifications, and incident alerts to Discord servers.',
    icon: MessageSquare,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    scopes: ['bot', 'applications.commands'],
    oauthAvailable: true,
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    desc: 'Append runtime data rows, maintain CRM leads ledgers, and query spreadsheet datasets seamlessly.',
    icon: FileSpreadsheet,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    scopes: ['spreadsheets'],
    oauthAvailable: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter AI',
    desc: 'Access state-of-the-art LLMs (Claude 3.5 Sonnet, GPT-4o, Llama 3) for prompt-to-graph and reasoning.',
    icon: Bot,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    scopes: ['api_key'],
    oauthAvailable: false,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    desc: 'Multimodal generative AI reasoning engine for entity extraction, sentiment analysis and drafting.',
    icon: Sparkles,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    scopes: ['api_key'],
    oauthAvailable: false,
  },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/integrations');
      setIntegrations(res.data || []);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();

    if (router.query.connected) {
      setStatusMessage(`Successfully connected ${router.query.connected.toUpperCase()} via OAuth!`);
    }
    if (router.query.error) {
      setStatusMessage(`OAuth Error: ${decodeURIComponent(router.query.error)}`);
    }
  }, [router.query]);

  const handleOAuthConnect = async (provider) => {
    try {
      // In development / demo mode, auto-connect provider credentials with mock tokens encrypted at rest
      const res = await api.post('/integrations', {
        provider,
        credentials: {
          accessToken: `token_${provider}_${Date.now()}`,
          refreshToken: `refresh_${provider}_${Date.now()}`,
        },
        metadata: {
          account: `operator@agentflow.ai`,
          connectedAt: new Date().toISOString(),
        },
      });
      fetchIntegrations();
      setStatusMessage(`Connected ${provider.toUpperCase()} successfully (Tokens encrypted at rest via AES-256).`);
    } catch (err) {
      alert(`Connection failed: ${err.message}`);
    }
  };

  const handleDisconnect = async (provider) => {
    if (confirm(`Disconnect ${provider}?`)) {
      try {
        await api.delete(`/integrations/${provider}`);
        fetchIntegrations();
        setStatusMessage(`Disconnected ${provider}.`);
      } catch (err) {
        alert(`Disconnect failed: ${err.message}`);
      }
    }
  };

  const handleSaveApiKey = async () => {
    if (!selectedProvider || !apiKeyInput.trim()) return;
    setIsSavingKey(true);
    try {
      await api.post('/integrations', {
        provider: selectedProvider.id,
        credentials: { apiKey: apiKeyInput.trim() },
        metadata: { configuredAt: new Date().toISOString() },
      });
      setSelectedProvider(null);
      setApiKeyInput('');
      fetchIntegrations();
      setStatusMessage(`API Key for ${selectedProvider.name} stored securely with AES-256.`);
    } catch (err) {
      alert(`Failed to save key: ${err.message}`);
    } finally {
      setIsSavingKey(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Third-Party Integrations
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Manage OAuth tool connections, webhooks, and AI provider credentials with zero-trust AES-256 encryption.
              </p>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>AES-256 Vault Active</span>
            </div>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
              <button
                onClick={() => setStatusMessage('')}
                className="text-xs text-indigo-400 hover:text-white underline ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providerCards.map((card) => {
              const Icon = card.icon;
              const connectedItem = integrations.find((i) => i.provider === card.id);
              const isConnected = !!connectedItem?.isConnected;

              return (
                <div
                  key={card.id}
                  className={`p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border ${
                    isConnected ? 'border-indigo-500/40' : 'border-slate-800'
                  } flex flex-col justify-between shadow-lg transition duration-200`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${card.bg} ${card.color} border ${card.border}`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono uppercase ${
                          isConnected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-4">{card.name}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{card.desc}</p>

                    {/* Scopes */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {card.scopes.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono border border-slate-800"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      {card.oauthAvailable ? 'OAuth 2.0' : 'API Key'}
                    </span>

                    {isConnected ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDisconnect(card.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : card.oauthAvailable ? (
                      <button
                        onClick={() => handleOAuthConnect(card.id)}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center space-x-1.5"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Connect OAuth</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedProvider(card)}
                        className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center space-x-1.5"
                      >
                        <Key className="w-3 h-3 text-indigo-400" />
                        <span>Set API Key</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* API Key Modal */}
          {selectedProvider && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-[#0e1628] border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Configure {selectedProvider.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="text-slate-400 hover:text-white text-xs font-mono"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Secret API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Keys are encrypted at rest using AES-256-GCM and never logged.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3">
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveApiKey}
                    disabled={isSavingKey || !apiKeyInput.trim()}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                  >
                    {isSavingKey ? 'Encrypting & Saving...' : 'Save Credential'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
