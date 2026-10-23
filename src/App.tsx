import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { CommandBuilderTab } from './components/CommandBuilderTab';
import { PresetsTab } from './components/PresetsTab';
import { SplitTunnelingTab } from './components/SplitTunnelingTab';
import { CliTerminalTab } from './components/CliTerminalTab';
import { PacketSimulatorModal } from './components/PacketSimulatorModal';
import { ApkPackagerModal } from './components/ApkPackagerModal';
import { ByeDpiConfig, TrafficStats, PresetProfile, LogEntry } from './types/byedpi';
import { getActiveConfig, saveActiveConfig, getAppTheme, saveAppTheme, getSoundEnabled, saveSoundEnabled, saveCustomPresets, getCustomPresets } from './utils/storage';
import { buildCommandString } from './utils/commandParser';
import { playHapticSound } from './utils/audioFeedback';

export default function App() {
  const [config, setConfig] = useState<ByeDpiConfig>(getActiveConfig);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [theme, setThemeState] = useState<'dark' | 'amoled' | 'slate' | 'light'>(getAppTheme);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(getSoundEnabled);
  const [packetModalOpen, setPacketModalOpen] = useState<boolean>(false);
  const [apkPackagerOpen, setApkPackagerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [trafficStats, setTrafficStats] = useState<TrafficStats>({
    downloadSpeedKbps: 0,
    uploadSpeedKbps: 0,
    totalDownloadBytes: 0,
    totalUploadBytes: 0,
    pingMs: 24,
    connectedSince: null,
    activeSockets: 0,
    packetFragmentsCount: 0,
    droppedFakesCount: 0,
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      tag: 'CORE',
      message: 'FlowDPI offline engine initialized. Local storage ready.'
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
      tag: 'PROXY',
      message: 'Proxy engine configured with zero external tracking & ad filters active.'
    }
  ]);

  // Persist config changes
  useEffect(() => {
    saveActiveConfig(config);
  }, [config]);

  // Persist theme & apply to <html>
  const setTheme = (t: 'dark' | 'amoled' | 'slate' | 'light') => {
    setThemeState(t);
    saveAppTheme(t);
    const root = document.documentElement;
    if (t === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  };

  const setSoundEnabled = (s: boolean) => {
    setSoundEnabledState(s);
    saveSoundEnabled(s);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addLog = (tag: LogEntry['tag'], level: LogEntry['level'], message: string) => {
    setLogs(prev => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        tag,
        level,
        message
      },
      ...prev.slice(0, 99) // keep max 100 logs
    ]);
  };

  // Toggle Connect / Disconnect
  const handleToggleConnect = () => {
    if (isConnected) {
      // Disconnect
      if (soundEnabled) playHapticSound('powerOff');
      setIsConnected(false);
      setTrafficStats(prev => ({
        ...prev,
        downloadSpeedKbps: 0,
        uploadSpeedKbps: 0,
        activeSockets: 0,
      }));
      addLog('CORE', 'info', 'VPN tunnel closed. ByeDPI proxy listener detached.');
      showToast('Disconnected from ByeDPI proxy');
    } else {
      // Connect
      if (soundEnabled) playHapticSound('powerOn');
      setIsConnecting(true);
      const cmd = buildCommandString(config);

      addLog('PROXY', 'info', `Starting ciadpi SOCKS5 server on ${config.listenIp}:${config.port}`);
      addLog('DESYNC', 'info', `Desync rules active: [method=${config.desyncMethod}, split=${config.splitPosition}${config.splitAnchor}, fakeSni=${config.fakeSni}, fakeTtl=${config.fakeTtl}]`);
      addLog('DNS', 'success', `DNS resolver bound to ${config.dnsServer} (AdGuard Ad-blocking ${config.blockAds ? 'Active' : 'Disabled'})`);

      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        setTrafficStats(prev => ({
          ...prev,
          connectedSince: Date.now(),
          pingMs: Math.floor(Math.random() * 15) + 20,
          activeSockets: 8,
        }));
        addLog('CORE', 'success', `TUN interface tun0 active. Traffic successfully routed via 127.0.0.1:${config.port}`);
        showToast(`Connected with ${config.name}`);
      }, 700);
    }
  };

  // Traffic simulation ticker when connected
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      // Realistic random variation in throughput
      const baseDown = Math.floor(Math.random() * 12000) + 4000; // 4 - 16 Mbps
      const baseUp = Math.floor(Math.random() * 3500) + 800;    // 0.8 - 4.3 Mbps

      const downBytes = Math.floor((baseDown * 1024) / 8);
      const upBytes = Math.floor((baseUp * 1024) / 8);

      const splitInc = Math.floor(Math.random() * 12) + 4;
      const fakeInc = config.desyncMethod === 'fake' || config.fakeTtl > 0 ? Math.floor(Math.random() * 4) + 1 : 0;

      setTrafficStats(prev => ({
        ...prev,
        downloadSpeedKbps: baseDown,
        uploadSpeedKbps: baseUp,
        totalDownloadBytes: prev.totalDownloadBytes + downBytes,
        totalUploadBytes: prev.totalUploadBytes + upBytes,
        pingMs: Math.max(18, Math.min(85, prev.pingMs + (Math.floor(Math.random() * 7) - 3))),
        packetFragmentsCount: prev.packetFragmentsCount + splitInc,
        droppedFakesCount: prev.droppedFakesCount + fakeInc,
      }));

      // Occasionally add desync event to logs
      if (Math.random() < 0.25) {
        const sites = ['googlevideo.com', 'discord.gg', 'cdn.discordapp.com', 'youtube.com', 'i.ytimg.com'];
        const randomSite = sites[Math.floor(Math.random() * sites.length)];
        addLog('DESYNC', 'success', `TLS ClientHello [${randomSite}] successfully segmented & desynchronized`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, config.desyncMethod, config.fakeTtl]);

  const handleSelectPreset = (preset: PresetProfile) => {
    setConfig({
      ...config,
      ...preset.config,
      id: preset.id,
      name: preset.name,
      description: preset.description,
      category: preset.category,
    });
    showToast(`Loaded preset: ${preset.name}`);
    setCurrentTab('dashboard');
  };

  const handleSaveAsPreset = (cfg: ByeDpiConfig) => {
    const custom = getCustomPresets();
    const newProfile: PresetProfile = {
      id: `custom-${Date.now()}`,
      name: `${cfg.name} (Custom)`,
      regionOrTarget: 'User Config',
      category: 'custom',
      description: cfg.description || 'User customized configuration',
      tags: ['Custom', 'User Preset'],
      recommendedFor: 'Custom network environment',
      command: buildCommandString(cfg),
      config: { ...cfg },
    };
    const updated = [newProfile, ...custom];
    saveCustomPresets(updated);
    showToast('Saved to Custom Presets library');
  };

  const getThemeBgClass = () => {
    switch (theme) {
      case 'amoled': return 'bg-black text-[#E2E8F0]';
      case 'slate': return 'bg-[#0F172A] text-[#F1F5F9]';
      case 'light': return 'bg-[#F8FAFC] text-[#0F172A]';
      default: return 'bg-[#0B0F19] text-[#E2E8F0]';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeBgClass()} transition-colors duration-200 flex flex-col font-sans select-none`}>
      {/* Top Header */}
      <Header
        activeConfig={config}
        isConnected={isConnected}
        theme={theme}
        setTheme={setTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenPacketSimulator={() => setPacketModalOpen(true)}
        onOpenApkPackager={() => setApkPackagerOpen(true)}
      />

      {/* Main Tab View */}
      <main className="flex-1 w-full overflow-x-hidden">
        {currentTab === 'dashboard' && (
          <DashboardTab
            config={config}
            setConfig={setConfig}
            isConnected={isConnected}
            isConnecting={isConnecting}
            onToggleConnect={handleToggleConnect}
            trafficStats={trafficStats}
            soundEnabled={soundEnabled}
            onNavigateToBuilder={() => setCurrentTab('builder')}
            onNavigateToPresets={() => setCurrentTab('presets')}
            onOpenApkPackager={() => setApkPackagerOpen(true)}
          />
        )}

        {currentTab === 'builder' && (
          <CommandBuilderTab
            config={config}
            setConfig={setConfig}
            onSaveAsPreset={handleSaveAsPreset}
            soundEnabled={soundEnabled}
          />
        )}

        {currentTab === 'presets' && (
          <PresetsTab
            currentConfig={config}
            onSelectPreset={handleSelectPreset}
            soundEnabled={soundEnabled}
          />
        )}

        {currentTab === 'split' && (
          <SplitTunnelingTab
            config={config}
            setConfig={setConfig}
            soundEnabled={soundEnabled}
          />
        )}

        {currentTab === 'cli' && (
          <CliTerminalTab
            config={config}
            setConfig={setConfig}
            isConnected={isConnected}
            logs={logs}
            onClearLogs={() => setLogs([])}
            soundEnabled={soundEnabled}
            onOpenApkPackager={() => setApkPackagerOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (soundEnabled) playHapticSound('switch');
          setCurrentTab(tab);
        }}
        isConnected={isConnected}
      />

      {/* DPI Packet Evasion Visualizer Modal */}
      <PacketSimulatorModal
        isOpen={packetModalOpen}
        onClose={() => setPacketModalOpen(false)}
        config={config}
      />

      {/* APK & Local VPN Packager Modal */}
      <ApkPackagerModal
        isOpen={apkPackagerOpen}
        onClose={() => setApkPackagerOpen(false)}
        config={config}
        soundEnabled={soundEnabled}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900 border border-teal-500/40 text-teal-300 text-xs font-semibold shadow-2xl shadow-teal-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
