import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    setIsLightTheme(document.documentElement.classList.contains('light'));
  }, []);

  const toggleTheme = () => {
    const nextIsLight = !isLightTheme;
    document.documentElement.classList.toggle('light', nextIsLight);
    window.localStorage.setItem('agentflow-theme', nextIsLight ? 'light' : 'dark');
    setIsLightTheme(nextIsLight);
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed right-4 bottom-4 z-[60] p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-indigo-400 hover:border-slate-700 transition shadow-lg"
      aria-label={`Switch to ${isLightTheme ? 'dark' : 'light'} theme`}
      title={`Switch to ${isLightTheme ? 'dark' : 'light'} theme`}
    >
      {isLightTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
