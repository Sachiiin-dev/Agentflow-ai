import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Bot, Lock, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.post('/auth/reset-password', {
        token: router.query.token,
        password,
      });
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError.message || 'Unable to reset your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[2px]">
            <div className="w-full h-full bg-[#080d1a] rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white">Agentflow_AI</span>
        </Link>
        <h1 className="mt-6 text-2xl font-extrabold text-white">Choose a new password</h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <form onSubmit={handleSubmit} className="bg-slate-900/80 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 space-y-5">
          {(error || message) && <p className={`text-xs ${error ? 'text-rose-300' : 'text-emerald-400'}`}>{error || message}</p>}
          <label className="block text-xs font-medium text-slate-300">
            New password
            <div className="relative mt-1.5">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white" />
            </div>
          </label>
          <label className="block text-xs font-medium text-slate-300">
            Confirm password
            <input type="password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full mt-1.5 px-4 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white" />
          </label>
          <button type="submit" disabled={isSubmitting || !router.query.token} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center space-x-2 disabled:opacity-60">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Reset password</span>}
          </button>
          <Link href="/login" className="flex items-center justify-center space-x-2 text-xs font-semibold text-indigo-400">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
