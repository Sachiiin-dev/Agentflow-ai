import React, { useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { useAuthStore } from '../store/authStore';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

export default function App({ Component, pageProps }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('agentflow-theme');
    document.documentElement.classList.toggle('light', savedTheme === 'light');
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Head>
        <title>Agentflow_AI | Agentic AI Operations Automation Platform</title>
        <meta
          name="description"
          content="Enterprise-grade AI operations automation platform with multi-agent orchestration (Planner, Executor, Validator, Recovery, Monitor) and visual workflow studio."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeToggle />
      <Component {...pageProps} />
    </>
  );
}
