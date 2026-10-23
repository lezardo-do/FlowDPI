import React, { useState, useEffect, useRef } from 'react';
import { 
  Power, 
  Wifi, 
  Activity, 
  Copy, 
  Check, 
  Sliders, 
  Shield, 
  Zap, 
  Globe, 
  ArrowDown, 
  ArrowUp, 
  Radio, 
  Share2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { ByeDpiConfig, TrafficStats } from '../types/byedpi';
import { buildCommandString } from '../utils/commandParser';
import { PRESET_PROFILES } from '../utils/presets';
import { playHapticSound } from '../utils/audioFeedback';

interface DashboardTabProps {
  config: ByeDpiConfig;
  setConfig: (cfg: ByeDpiConfig) => void;
  isConnected: boolean;
  isConnecting: boolean;
  onToggleConnect: () => void;
  trafficStats: TrafficStats;
  soundEnabled: boolean;
  onNavigateToBuilder: () => void;
  onNavigateToPresets: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  config,
  setConfig,
  isConnected,
  isConnecting,
  onToggleConnect,
  trafficStats,
  soundEnabled,
  onNavigateToBuilder,
  onNavigateToPresets,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [historyPoints, setHistoryPoints] = useState<number[]>(new Array(24).fill(2));
  
  const currentCmd = buildCommandString(config);

  // Update animated traffic graph points
  useEffect(() => {
    if (!isConnected) {
      setHistoryPoints(prev => [...prev.slice(1), 0]);
      return;
    }
    const interval = setInterval(() => {
      const speed = trafficStats.downloadSpeedKbps;
      const normalized = Math.min(100, Math.max(5, (speed / 15000) * 100));
      setHistoryPoints(prev => [...prev.slice(1), normalized]);
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected, trafficStats.downloadSpeedKbps]);

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(`ciadpi ${currentCmd}`);
    if (soundEnabled) playHapticSound('click');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatSpeed = (kbps: number) => {
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(2)} Mbps`;
    }
    return `${kbps.toFixed(1)} Kbps`;
  };

  const formatTime = (since: number | null) => {
    if (!since) return '00:00:00';
    const seconds = Math.floor((Date.now() - since) / 1000);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [sessionTime, setSessionTime] = useState('00:00:00');
  useEffect(() => {
    if (!isConnected || !trafficStats.connectedSince) {
      setSessionTime('00:00:00');
      return;
    }
    const timer = setInterval(() => {
      setSessionTime(formatTime(trafficStats.connectedSince));
    }, 1000);
    return () => clearInterval(timer);
  }, [isConnected, trafficStats.connectedSince]);

  return (
    <div className="relative pb-28 pt-2 px-4 max-w-2xl mx-auto flex flex-col items-center">
      {/* Background World Map Graphic */}
      <div 
        className="absolute inset-0 top-0 h-96 opacity-15 pointer-events-none bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/assets/bg_world_map_flat.png')` }}
      />

      {/* Preset Banner / Network Environment */}
      <div className="w-full mb-6 z-10">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 md-elevation-1 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active Preset</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-teal-400 font-mono">
                  {config.category}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-slate-100">{config.name}</h2>
            </div>
          </div>
          <button
            onClick={onNavigateToPresets}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Switch
          </button>
        </div>
      </div>

      {/* Big Circular Material Power Button */}
      <div className="relative my-4 flex items-center justify-center z-10">
        {/* Glow halo when connected */}
        <div
          className={`absolute rounded-full transition-all duration-700 ${
            isConnected
              ? 'w-48 h-48 bg-teal-400/20 power-glow-active animate-pulse'
              : 'w-40 h-40 bg-slate-800/20 power-glow-idle'
          }`}
        />

        {/* Outer Ring */}
        <div
          className={`relative p-2 rounded-full border-2 transition-all duration-500 ${
            isConnected
              ? 'border-teal-400/80 shadow-lg shadow-teal-500/20'
              : isConnecting
              ? 'border-cyan-400 border-dashed animate-spin'
              : 'border-slate-800'
          }`}
        >
          {/* Main Button */}
          <button
            onClick={onToggleConnect}
            disabled={isConnecting}
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 focus:outline-none select-none ${
              isConnected
                ? 'bg-gradient-to-b from-teal-400 to-emerald-500 text-slate-950 shadow-2xl shadow-teal-500/40'
                : isConnecting
                ? 'bg-slate-800 text-cyan-300 cursor-wait'
                : 'bg-gradient-to-b from-slate-800 to-slate-900 text-slate-300 hover:text-white border border-slate-700/60 shadow-xl'
            }`}
          >
            <Power
              className={`w-12 h-12 transition-transform duration-300 ${
                isConnected ? 'scale-110 drop-shadow-md' : 'text-slate-400'
              }`}
            />
            <span
              className={`text-xs font-bold tracking-wider mt-1 uppercase ${
                isConnected ? 'text-slate-950 font-black' : 'text-slate-400'
              }`}
            >
              {isConnecting ? 'Starting' : isConnected ? 'Disconnect' : 'Connect'}
            </span>
          </button>
        </div>
      </div>

      {/* Status & Session Metrics */}
      <div className="flex flex-col items-center mt-3 mb-6 z-10 text-center">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected
                ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse'
                : isConnecting
                ? 'bg-amber-400 animate-ping'
                : 'bg-slate-600'
            }`}
          />
          <h3 className="text-xl font-bold text-slate-100 tracking-tight">
            {isConnecting ? 'Configuring SOCKS5...' : isConnected ? 'Bypass Active' : 'Disconnected'}
          </h3>
        </div>

        {isConnected && (
          <div className="flex items-center gap-4 mt-2 text-xs font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              {sessionTime}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-teal-400">
              <Activity className="w-3.5 h-3.5" />
              {trafficStats.pingMs} ms ping
            </span>
          </div>
        )}

        {/* Hotspot Tethering Status Pill if enabled */}
        {config.hotspotShare && (
          <div className="mt-3 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Tethering Active: 192.168.43.1:1080</span>
          </div>
        )}
      </div>

      {/* Active Command Bar */}
      <div className="w-full mb-5 z-10">
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 md-elevation-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[11px] font-bold text-slate-500 font-mono select-none">$</span>
            <span className="text-xs font-mono text-teal-300 truncate" title={currentCmd}>
              ciadpi {currentCmd}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopyCmd}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copy command string"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onNavigateToBuilder}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 transition-colors"
              title="Edit parameters"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards Section (Matching FlowVPN UI) */}
      <div className="w-full space-y-3.5 z-10">
        {/* Card 1: TRAFFIC MONITOR */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800/80 md-elevation-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Traffic Monitor</h4>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {isConnected ? 'Live Throughput' : 'Standby'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Real-time SVG waveform graph */}
            <div className="flex-1 h-12 bg-slate-950/60 rounded-xl p-1 flex items-end justify-between gap-1 overflow-hidden border border-slate-800/50">
              {historyPoints.map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${Math.max(8, val)}%`,
                    backgroundColor: isConnected ? (idx % 2 === 0 ? '#00F5D4' : '#06B6D4') : '#334155'
                  }}
                />
              ))}
            </div>

            {/* Speeds readout */}
            <div className="flex flex-col gap-1.5 shrink-0 text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs font-mono font-semibold text-teal-300">
                <ArrowDown className="w-3.5 h-3.5 text-teal-400" />
                <span>{formatSpeed(trafficStats.downloadSpeedKbps)}</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-xs font-mono font-semibold text-cyan-300">
                <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatSpeed(trafficStats.uploadSpeedKbps)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: DATA USAGE & DPI STATS */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800/80 md-elevation-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Data Usage & Evasion Stats</h4>
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">
              {formatBytes(trafficStats.totalDownloadBytes + trafficStats.totalUploadBytes)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-center">
            <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/40">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Desync Method</span>
              <span className="text-xs font-bold text-teal-300 font-mono capitalize">
                {config.desyncMethod}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/40">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Split Packets</span>
              <span className="text-xs font-bold text-cyan-300 font-mono">
                {trafficStats.packetFragmentsCount.toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/40">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Decoy Injected</span>
              <span className="text-xs font-bold text-emerald-300 font-mono">
                {trafficStats.droppedFakesCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
