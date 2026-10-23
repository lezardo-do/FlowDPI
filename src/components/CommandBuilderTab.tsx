import React, { useState } from 'react';
import { 
  Sliders, 
  Copy, 
  Check, 
  RotateCcw, 
  HelpCircle, 
  Shield, 
  Globe, 
  Radio, 
  Network, 
  Zap, 
  Layers, 
  FileCode, 
  Save, 
  BookmarkCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ByeDpiConfig, DesyncMethod, SplitAnchor, AutoTrigger } from '../types/byedpi';
import { buildCommandString, explainCommand, DEFAULT_CONFIG } from '../utils/commandParser';
import { playHapticSound } from '../utils/audioFeedback';

interface CommandBuilderTabProps {
  config: ByeDpiConfig;
  setConfig: (cfg: ByeDpiConfig) => void;
  onSaveAsPreset: (cfg: ByeDpiConfig) => void;
  soundEnabled: boolean;
}

export const CommandBuilderTab: React.FC<CommandBuilderTabProps> = ({
  config,
  setConfig,
  onSaveAsPreset,
  soundEnabled,
}) => {
  const [copied, setCopied] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const commandStr = buildCommandString(config);
  const flagExplanations = explainCommand(commandStr);

  const updateConfig = (patch: Partial<ByeDpiConfig>) => {
    if (soundEnabled) playHapticSound('switch');
    setConfig({ ...config, ...patch });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`ciadpi ${commandStr}`);
    if (soundEnabled) playHapticSound('click');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePreset = () => {
    onSaveAsPreset(config);
    if (soundEnabled) playHapticSound('click');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReset = () => {
    if (soundEnabled) playHapticSound('click');
    setConfig({ ...DEFAULT_CONFIG });
  };

  const SNI_PRESETS = [
    { label: 'OpenSignal (Smart PH)', domain: 'opensignal.com' },
    { label: 'Speedtest (Globe PH)', domain: 'speedtest.net' },
    { label: 'Google CDN (Global)', domain: 'www.google.com' },
    { label: 'IANA (Neutral)', domain: 'www.iana.org' },
    { label: 'Cloudflare', domain: 'cloudflare.com' },
    { label: 'Fast.com (Netflix)', domain: 'fast.com' },
  ];

  return (
    <div className="pb-32 pt-2 px-4 max-w-3xl mx-auto space-y-6">
      {/* Top Banner with live command */}
      <div className="sticky top-16 z-20 p-4 rounded-3xl bg-slate-900/95 border border-teal-500/30 backdrop-blur-md md-elevation-2 shadow-teal-500/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Generated Command</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleSavePreset}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              {saveSuccess ? <BookmarkCheck className="w-3.5 h-3.5 text-teal-400" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
              title="Reset parameters to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-teal-300 select-all overflow-x-auto whitespace-nowrap">
          ciadpi {commandStr || '(none)'}
        </div>

        {/* Flag Explainer Toggle */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="flex items-center gap-1 text-slate-400 hover:text-teal-300 transition-colors font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showExplainer ? 'Hide parameter breakdown' : 'Explain selected flags'}</span>
            {showExplainer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <span className="text-[11px] text-slate-500">
            {flagExplanations.length} evasion flags active
          </span>
        </div>

        {/* Flag explanation details */}
        {showExplainer && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 max-h-56 overflow-y-auto pr-1">
            {flagExplanations.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No DPI desynchronization flags selected yet.</p>
            ) : (
              flagExplanations.map((item, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-teal-400">{item.flag}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">{item.category}</span>
                  </div>
                  <p className="text-slate-200 mt-0.5">{item.summary}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.technicalRole}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* SECTION 1: Desynchronization Method (Core Evasion) */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 md-elevation-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-400" />
              1. Desynchronization Method
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Primary technique used to desynchronize stateful DPI filters
            </p>
          </div>
        </div>

        {/* Multiple choice chips for Desync Method */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'fake', label: 'Fake (-f)', desc: 'Injects low-TTL decoy packet' },
            { id: 'disorder', label: 'Disorder (-d)', desc: 'Sends packets out of sequence' },
            { id: 'split', label: 'Split (-s)', desc: 'Splits stream into fragments' },
            { id: 'oob', label: 'Out-Of-Band (-o)', desc: 'TCP Urgent pointer marker' },
            { id: 'disoob', label: 'Disordered OOB', desc: 'Hybrid OOB with reordering' },
            { id: 'none', label: 'None (Pass)', desc: 'Standard SOCKS proxying' },
          ].map((item) => {
            const isSelected = config.desyncMethod === item.id;
            return (
              <button
                key={item.id}
                onClick={() => updateConfig({ desyncMethod: item.id as DesyncMethod })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                    {item.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-teal-400 shadow-sm shadow-teal-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Split Position & Anchor relative selector */}
        {config.desyncMethod !== 'none' && (
          <div className="pt-3 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Split Byte Position: <span className="text-teal-300 font-mono font-bold">{config.splitPosition}</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 8].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateConfig({ splitPosition: pos })}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                      config.splitPosition === pos
                        ? 'bg-teal-500 text-slate-950 border-teal-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Offset Anchor: <span className="text-cyan-300 font-mono font-bold">{config.splitAnchor}</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'none', label: 'Beginning (0)' },
                  { id: '+s', label: 'At SNI (+s)' },
                  { id: '+h', label: 'At Host (+h)' },
                ].map((anchor) => (
                  <button
                    key={anchor.id}
                    onClick={() => updateConfig({ splitAnchor: anchor.id as SplitAnchor })}
                    className={`flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-semibold transition-all ${
                      config.splitAnchor === anchor.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {anchor.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Fake Packet & SNI Spoofing */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 md-elevation-1 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            2. Fake Decoy Packet & SNI Spoofing (-f, -t, -n)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure TTL hop expiration and whitelisted decoy domain headers
          </p>
        </div>

        {/* Fake SNI domain selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Fake SNI Decoy Domain (-n)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2.5">
            {SNI_PRESETS.map((item) => (
              <button
                key={item.domain}
                onClick={() => updateConfig({ fakeSni: item.domain })}
                className={`p-2 rounded-xl border text-left text-xs transition-all ${
                  config.fakeSni === item.domain
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold truncate">{item.label}</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">{item.domain}</div>
              </button>
            ))}
          </div>

          <input
            type="text"
            value={config.fakeSni}
            onChange={(e) => updateConfig({ fakeSni: e.target.value })}
            placeholder="Custom SNI, e.g. www.google.com"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Fake TTL slider / multiple choice */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Decoy Time-To-Live TTL (-t)
            </label>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
              {config.fakeTtl} hops
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((ttl) => (
              <button
                key={ttl}
                onClick={() => updateConfig({ fakeTtl: ttl })}
                className={`flex-1 py-1 rounded-lg border text-xs font-mono transition-all ${
                  config.fakeTtl === ttl
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {ttl}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Optimal TTL: 3-5 hops reaches your ISP's DPI hardware node without reaching the target web server.
          </p>
        </div>

        {/* Drop SACK & TCP MD5 Signature switches */}
        <div className="pt-3 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Drop SACK (-K)</span>
              <span className="text-[11px] text-slate-400">Ignore TCP selective acknowledgment</span>
            </div>
            <input
              type="checkbox"
              checked={config.dropSack}
              onChange={(e) => updateConfig({ dropSack: e.target.checked })}
              className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">TCP MD5 Signature (-S)</span>
              <span className="text-[11px] text-slate-400">Forces destination server to drop fake</span>
            </div>
            <input
              type="checkbox"
              checked={config.tcpMd5Sig}
              onChange={(e) => updateConfig({ tcpMd5Sig: e.target.checked })}
              className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
          </label>
        </div>
      </div>

      {/* SECTION 3: TLS Record Splitting & Protocols */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 md-elevation-1 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            3. TLS Record Layer & Protocols (-r, -Q)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Fragment encrypted TLS handshakes and control UDP QUIC traffic
          </p>
        </div>

        {/* TLS Record switch */}
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Split TLS Record Layer (-r)</span>
              <span className="text-[11px] text-slate-400">Fragments TLS ClientHello across record boundaries</span>
            </div>
            <input
              type="checkbox"
              checked={config.tlsRecordSplit}
              onChange={(e) => updateConfig({ tlsRecordSplit: e.target.checked })}
              className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
          </label>

          {config.tlsRecordSplit && (
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/50 flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-300 font-medium">Record Split Target:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { pos: 1, atSni: true, label: '1+s (At SNI)' },
                  { pos: 1, atSni: false, label: '1 (Byte 1)' },
                  { pos: 2, atSni: false, label: '2 (Byte 2)' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => updateConfig({ tlsRecordPosition: item.pos, tlsRecordAtSni: item.atSni })}
                    className={`px-3 py-1 text-xs rounded-xl border transition-all ${
                      config.tlsRecordPosition === item.pos && config.tlsRecordAtSni === item.atSni
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Block UDP QUIC */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">Block UDP (Disable QUIC) (-Q)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">Recommended</span>
              </div>
              <span className="text-[11px] text-slate-400">Forces YouTube, Discord & Facebook to use TCP where bypass works reliably</span>
            </div>
            <input
              type="checkbox"
              checked={config.blockUdpQuic}
              onChange={(e) => updateConfig({ blockUdpQuic: e.target.checked })}
              className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
          </label>
        </div>

        {/* HTTP header obfuscation */}
        <div className="pt-3 border-t border-slate-800/60">
          <span className="text-xs font-semibold text-slate-300 block mb-2">HTTP Header Obfuscation (-m)</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { key: 'hostMixedCase', label: 'Host Mixed Case', desc: 'hOsT: header' },
              { key: 'domainMixedCase', label: 'Domain Mixed Case', desc: 'dOmAiN.cOm' },
              { key: 'hostRemoveSpaces', label: 'Remove Host Spaces', desc: 'Host:domain' },
            ].map((mod) => (
              <label
                key={mod.key}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70 text-xs cursor-pointer hover:border-slate-700"
              >
                <div>
                  <span className="font-semibold text-slate-200 block text-[11px]">{mod.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{mod.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean((config as any)[mod.key])}
                  onChange={(e) => updateConfig({ [mod.key]: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-teal-500 bg-slate-800 border-slate-700"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Network, Tethering & Auto Mode */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 md-elevation-1 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            4. Network Interface, Hotspot & Adaptive Auto (-i, -A)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure local listening address and adaptive blockage recovery
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Hotspot tethering switch */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Hotspot Tethering (-i 0.0.0.0)</span>
              <span className="text-[11px] text-slate-400">Binds to all interfaces for LAN devices</span>
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

          {/* TCP Fast Open */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">TCP Fast Open (-F)</span>
              <span className="text-[11px] text-slate-400">Reduces handshake latency</span>
            </div>
            <input
              type="checkbox"
              checked={config.tcpFastOpen}
              onChange={(e) => updateConfig({ tcpFastOpen: e.target.checked })}
              className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
          </label>
        </div>

        {/* Auto Adaptive Mode */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Adaptive Auto Mode (-A)</span>
              <span className="text-[11px] text-slate-400">Automatically switches strategy on connection timeout</span>
            </div>
            <input
              type="checkbox"
              checked={config.autoEnabled}
              onChange={(e) => updateConfig({ autoEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
          </div>

          {config.autoEnabled && (
            <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 font-medium">Triggers:</span>
              {[
                { id: 'torst', label: 'Timeout/RST (torst)' },
                { id: 'ssl_err', label: 'SSL Error (ssl_err)' },
                { id: 'redirect', label: 'HTTP Redirect' },
              ].map((t) => {
                const isSelected = config.autoTriggers.includes(t.id as AutoTrigger);
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      const next = isSelected 
                        ? config.autoTriggers.filter(x => x !== t.id)
                        : [...config.autoTriggers, t.id as AutoTrigger];
                      updateConfig({ autoTriggers: next.length > 0 ? next : ['torst'] });
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
