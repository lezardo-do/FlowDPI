import React from 'react';
import { Power, Sliders, Layers, Split, Terminal } from 'lucide-react';

export type TabType = 'dashboard' | 'builder' | 'presets' | 'split' | 'cli';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isConnected: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, isConnected }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Connect', icon: Power, badge: isConnected ? 'ON' : null },
    { id: 'builder' as TabType, label: 'Commands', icon: Sliders },
    { id: 'presets' as TabType, label: 'Profiles', icon: Layers },
    { id: 'split' as TabType, label: 'Bypass & DNS', icon: Split },
    { id: 'cli' as TabType, label: 'Terminal / I/O', icon: Terminal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0B0F19]/90 backdrop-blur-lg border-t border-white/5 py-1.5 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all group"
            >
              {/* Material 3 active indicator pill */}
              <div
                className={`relative flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 text-[9px] font-extrabold rounded-full bg-emerald-500 text-slate-950">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-teal-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
