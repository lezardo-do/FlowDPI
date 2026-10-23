import React from 'react';
import { ShieldCheck, Sparkles, Moon, Sun, Volume2, VolumeX, Info, Flame } from 'lucide-react';
import { ByeDpiConfig } from '../types/byedpi';

interface HeaderProps {
  activeConfig: ByeDpiConfig;
  isConnected: boolean;
  theme: 'dark' | 'amoled' | 'slate' | 'light';
  setTheme: (t: 'dark' | 'amoled' | 'slate' | 'light') => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
  onOpenPacketSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeConfig,
  isConnected,
  theme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  onOpenPacketSimulator,
}) => {
  const cycleTheme = () => {
    const list: ('dark' | 'amoled' | 'slate' | 'light')[] = ['dark', 'amoled', 'slate', 'light'];
    const nextIdx = (list.indexOf(theme) + 1) % list.length;
    setTheme(list[nextIdx]);
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'amoled': return 'AMOLED';
      case 'slate': return 'Slate';
      case 'light': return 'Light';
      default: return 'Obsidian';
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-opacity-80 border-b border-white/5 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-cyan-400/20 border border-teal-500/30 text-teal-400 shadow-lg shadow-teal-500/10">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
            {isConnected && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-400"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-300 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
                FlowDPI
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/25">
                v1.4 ByeDPI
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate max-w-[210px] sm:max-w-none">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span className="truncate">{activeConfig.name}</span>
            </p>
          </div>
        </div>

        {/* Center: Privacy Notice Chip */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Offline • Zero Ads • No Remote Telemetry</span>
        </div>

        {/* Right: Quick actions (Visualizer, Sound, Theme) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Packet Inspector Modal Button */}
          <button
            onClick={onOpenPacketSimulator}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-teal-300 border border-slate-700/50 text-xs font-medium transition-all"
            title="Inspect how DPI packets are split"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">DPI Visualizer</span>
          </button>

          {/* Haptic sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              soundEnabled
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Mute haptics' : 'Enable haptics'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme switcher */}
          <button
            onClick={cycleTheme}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 text-xs font-medium transition-all"
            title="Cycle theme (Obsidian / AMOLED / Slate / Light)"
          >
            {theme === 'light' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-teal-400" />
            )}
            <span className="hidden sm:inline">{getThemeLabel()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
