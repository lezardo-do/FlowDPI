import React, { useState } from 'react';
import { 
  Split, 
  ShieldCheck, 
  Radio, 
  Wifi, 
  Globe, 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  Server,
  Filter,
  Tv,
  MessageSquare,
  Send,
  Video,
  Gamepad2,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import { ByeDpiConfig, SplitTunnelApp, HostsMode } from '../types/byedpi';
import { getSplitApps, saveSplitApps, INITIAL_HOSTS_PRESETS } from '../utils/storage';
import { playHapticSound } from '../utils/audioFeedback';

interface SplitTunnelingTabProps {
  config: ByeDpiConfig;
  setConfig: (cfg: ByeDpiConfig) => void;
  soundEnabled: boolean;
}

export const SplitTunnelingTab: React.FC<SplitTunnelingTabProps> = ({
  config,
  setConfig,
  soundEnabled,
}) => {
  const [apps, setApps] = useState<SplitTunnelApp[]>(getSplitApps());
  const [searchQuery, setSearchQuery] = useState('');
  const [newHostDomain, setNewHostDomain] = useState('');
  const [hostsList, setHostsList] = useState<string[]>(
    config.hostsList && config.hostsList.length > 0 ? config.hostsList : INITIAL_HOSTS_PRESETS
  );

  const updateConfig = (patch: Partial<ByeDpiConfig>) => {
    if (soundEnabled) playHapticSound('switch');
    setConfig({ ...config, ...patch });
  };

  const handleToggleApp = (id: string) => {
    const updated = apps.map(app => 
      app.id === id ? { ...app, bypassVpn: !app.bypassVpn } : app
    );
    setApps(updated);
    saveSplitApps(updated);
    if (soundEnabled) playHapticSound('click');
  };

  const handleAddHost = (e: React.FormEvent) => {
    e.preventDefault();
    const domain = newHostDomain.trim().toLowerCase();
    if (!domain || hostsList.includes(domain)) return;
    const updated = [...hostsList, domain];
    setHostsList(updated);
    updateConfig({ hostsList: updated });
    setNewHostDomain('');
    if (soundEnabled) playHapticSound('click');
  };

  const handleRemoveHost = (domain: string) => {
    const updated = hostsList.filter(d => d !== domain);
    setHostsList(updated);
    updateConfig({ hostsList: updated });
    if (soundEnabled) playHapticSound('click');
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const DNS_OPTIONS = [
    { name: 'AdGuard Ad-Block DNS (No Ads)', ip: '94.140.14.14', desc: 'Blocks tracker ads across all apps & browsers' },
    { name: 'Cloudflare Privacy 1.1.1.1', ip: '1.1.1.1', desc: 'Ultra-fast resolution with strict zero-log privacy' },
    { name: 'Quad9 Malware Blocker', ip: '9.9.9.9', desc: 'Blocks malicious phish & surveillance hosts' },
    { name: 'Google DNS 8.8.8.8', ip: '8.8.8.8', desc: 'Standard public Anycast DNS' },
  ];

  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return Globe;
      case 'Tv': return Tv;
      case 'MessageSquare': return MessageSquare;
      case 'Send': return Send;
      case 'Video': return Video;
      case 'Gamepad2': return Gamepad2;
      case 'CreditCard': return CreditCard;
      case 'ShieldAlert': return ShieldAlert;
      default: return Globe;
    }
  };

  return (
    <div className="pb-32 pt-2 px-4 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Split className="w-5 h-5 text-teal-400" />
          Bypass Rules, Split Tunneling & DNS
        </h2>
        <p className="text-xs text-slate-400">
          Exclude apps (like banking), enforce ad-blocking DNS, and share connection over tethering.
        </p>
      </div>

      {/* Card 1: Core Bypass Toggles */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 md-elevation-1 space-y-3.5">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          General Network Policies
        </h3>

        {/* Ad-Block DNS Switch */}
        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">Block Ads (AdGuard Secure DNS)</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/20">Ad-Free</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Filters annoying banner and tracker ads across all apps, games, and browsers offline.
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.blockAds}
            onChange={(e) => updateConfig({ 
              blockAds: e.target.checked,
              dnsServer: e.target.checked ? '94.140.14.14' : '1.1.1.1'
            })}
            className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-slate-800 border-slate-700"
          />
        </label>

        {/* Block UDP QUIC */}
        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Block UDP (Disable QUIC)</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Fixes YouTube & Facebook buffering by forcing standard TCP where DPI evasion works reliably.
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.blockUdpQuic}
            onChange={(e) => updateConfig({ blockUdpQuic: e.target.checked })}
            className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-slate-800 border-slate-700"
          />
        </label>

        {/* Hotspot Share Tethering */}
        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">Hotspot Share (Tethering)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20">192.168.43.1:1080</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Allows connected devices to use the bypass (set HTTP/SOCKS proxy on connected PC or console).
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.hotspotShare}
            onChange={(e) => updateConfig({ 
              hotspotShare: e.target.checked,
              listenIp: e.target.checked ? '0.0.0.0' : '127.0.0.1'
            })}
            className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-slate-800 border-slate-700"
          />
        </label>
      </div>

      {/* Card 2: DNS Selection */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 md-elevation-1 space-y-3.5">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          Encrypted & Private DNS Provider
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DNS_OPTIONS.map((dns) => {
            const isSelected = config.dnsServer === dns.ip;
            return (
              <button
                key={dns.ip}
                onClick={() => updateConfig({ dnsServer: dns.ip, blockAds: dns.ip === '94.140.14.14' })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{dns.name}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />}
                </div>
                <div className="text-[11px] font-mono text-cyan-400/80 mt-0.5">{dns.ip}</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{dns.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card 3: Hosts Whitelist / Blacklist */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 md-elevation-1 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400" />
              Target Hosts Filter (-H)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Apply desynchronization only to specific censored domain names
            </p>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['disable', 'blacklist', 'whitelist'] as HostsMode[]).map((m) => (
              <button
                key={m}
                onClick={() => updateConfig({ hostsMode: m })}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-colors ${
                  config.hostsMode === m
                    ? 'bg-purple-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Add Host form */}
        <form onSubmit={handleAddHost} className="flex gap-2">
          <input
            type="text"
            value={newHostDomain}
            onChange={(e) => setNewHostDomain(e.target.value)}
            placeholder="Add domain, e.g. googlevideo.com"
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Domain chips */}
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
          {hostsList.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
            >
              <span>{domain}</span>
              <button
                type="button"
                onClick={() => handleRemoveHost(domain)}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Card 4: Split Tunneling App List */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 md-elevation-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Split className="w-4 h-4 text-teal-400" />
              Split Tunneling (Apps Management)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose apps that should bypass the VPN (e.g. banking or local streaming)
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* List of Apps */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredApps.map((app) => {
            const Icon = getAppIcon(app.iconName);
            return (
              <div
                key={app.id}
                onClick={() => handleToggleApp(app.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  app.bypassVpn
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${
                    app.bypassVpn 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{app.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{app.packageName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold ${app.bypassVpn ? 'text-amber-400' : 'text-slate-400'}`}>
                    {app.bypassVpn ? 'Bypass' : 'Routed'}
                  </span>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                    app.bypassVpn ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                  }`}>
                    {app.bypassVpn && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
