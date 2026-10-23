import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Copy, 
  Check, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Terminal, 
  ExternalLink,
  Code2,
  Package,
  CheckCircle2,
  FileCode,
  Radio
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { ByeDpiConfig } from '../types/byedpi';
import { buildCommandString } from '../utils/commandParser';
import { playHapticSound } from '../utils/audioFeedback';

interface ApkPackagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ByeDpiConfig;
  soundEnabled: boolean;
}

export const ApkPackagerModal: React.FC<ApkPackagerModalProps> = ({
  isOpen,
  onClose,
  config,
  soundEnabled,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'icons' | 'bubblewrap' | 'vpnbridge'>('install');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCmd = buildCommandString(config);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    if (soundEnabled) playHapticSound('click');
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleInstallClick = async () => {
    if (soundEnabled) playHapticSound('click');
    await install();
  };

  // Capacitor config code
  const capacitorConfig = JSON.stringify(
    {
      appId: "io.github.dovecoteescapee.byedpi",
      appName: "FlowDPI",
      webDir: "dist",
      bundledWebRuntime: false,
      server: {
        androidScheme: "https"
      }
    },
    null,
    2
  );

  // Bubblewrap instructions
  const bubblewrapCommand = `# 1. Install Google's official Bubblewrap PWA to APK tool:
npm i -g @bubblewrap/cli

# 2. Initialize project from your live Web App Manifest:
bubblewrap init --manifest="${window.location.origin}/manifest.json"

# 3. Build signed Android APK:
bubblewrap build

# Result: app-release-signed.apk ready to sideload!`;

  // Android VpnService manifest snippet
  const androidVpnSnippet = `<!-- AndroidManifest.xml VpnService permission -->
<service
    android:name=".services.ByeDpiVpnService"
    android:permission="android.permission.BIND_VPN_SERVICE"
    android:exported="false">
    <intent-filter>
        <action android:name="android.net.VpnService"/>
    </intent-filter>
</service>

<!-- Active ByeDPI Launch Arguments -->
<!-- ciadpi ${currentCmd} -->`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl bg-slate-900 border border-teal-500/30 md-elevation-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30 text-teal-300">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">APK & Local VPN Packager</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 font-bold border border-teal-500/25">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Install as a standalone app or package into an Android `.apk`
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-4 p-1 rounded-2xl bg-slate-950 border border-slate-800/80 overflow-x-auto no-scrollbar">
          {[
            { id: 'install', label: '1-Click Install', icon: Smartphone },
            { id: 'icons', label: 'App Icons & Assets', icon: Layers },
            { id: 'bubblewrap', label: 'Make APK (Bubblewrap)', icon: Package },
            { id: 'vpnbridge', label: 'Local VPN Bridge', icon: Radio },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (soundEnabled) playHapticSound('switch');
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: 1-Click Install */}
        {activeTab === 'install' && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <img
                  src="/pwa-192x192.png"
                  alt="FlowDPI Icon"
                  className="w-16 h-16 rounded-2xl shadow-lg border border-teal-500/30 shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">FlowDPI Android Web App</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Installs directly to your home screen with a standalone app frame, custom icon, and complete offline capability.
                  </p>
                </div>
              </div>

              {isInstalled ? (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Already Installed</span>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Install to Device</span>
                </button>
              ) : (
                <div className="text-xs text-slate-400 p-2 rounded-xl bg-slate-900 border border-slate-800 text-center sm:text-right shrink-0">
                  <span>To install: Tap browser menu <strong>⋮</strong> &gt; <strong>Add to Home screen</strong></span>
                </div>
              )}
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                'Offline Service Worker caching enabled',
                'Android adaptive maskable icon included',
                'Standalone native display mode (no URL bar)',
                'Local data storage in IndexedDB / localStorage',
                'Zero ads & zero analytics telemetry',
                'Instant launch with splash screen theme'
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: App Icons & Assets */}
        {activeTab === 'icons' && (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-400">
              The project includes the exact standard icon assets required by Android, Google Play Store, and iOS:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Standard 512px', file: '/pwa-512x512.png', size: '512x512 PNG', desc: 'Google Play & Web' },
                { name: 'Maskable 512px', file: '/pwa-maskable-512x512.png', size: 'Safe-zone Padded', desc: 'Android Adaptive Icons' },
                { name: 'Standard 192px', file: '/pwa-192x192.png', size: '192x192 PNG', desc: 'Android Home Screen' },
                { name: 'Apple Touch', file: '/apple-touch-icon.png', size: '180x180 PNG', desc: 'iOS Safari Home Screen' },
              ].map((icon, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center text-center">
                  <img
                    src={icon.file}
                    alt={icon.name}
                    className="w-14 h-14 rounded-xl shadow-md border border-slate-700/60 mb-2 object-cover"
                  />
                  <span className="text-xs font-bold text-slate-200">{icon.name}</span>
                  <span className="text-[10px] font-mono text-teal-400">{icon.size}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{icon.desc}</span>
                  <a
                    href={icon.file}
                    download
                    className="mt-2 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>

            {/* Manifest link */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Web App Manifest (`manifest.json`)</span>
                <span className="text-[11px] text-slate-400 font-mono">/manifest.json</span>
              </div>
              <a
                href="/manifest.json"
                download="manifest.json"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Manifest</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: Make APK (Bubblewrap / PWABuilder) */}
        {activeTab === 'bubblewrap' && (
          <div className="mt-4 space-y-3.5">
            <p className="text-xs text-slate-400">
              You can package this web app into a signed Android `.apk` in 2 minutes using Google's official <strong>Bubblewrap CLI</strong> or <strong>PWABuilder</strong>:
            </p>

            <div className="relative">
              <div className="flex items-center justify-between p-2 rounded-t-xl bg-slate-800/80 border-t border-x border-slate-700 text-xs text-slate-300">
                <span className="font-mono text-[11px]">Terminal (Bubblewrap APK Builder)</span>
                <button
                  onClick={() => copyText(bubblewrapCommand, 'bubblewrap')}
                  className="flex items-center gap-1 text-[11px] text-teal-300 hover:text-white"
                >
                  {copiedCode === 'bubblewrap' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'bubblewrap' ? 'Copied' : 'Copy Commands'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-b-xl bg-slate-950 border border-slate-800 font-mono text-xs text-teal-300 overflow-x-auto whitespace-pre leading-relaxed">
                {bubblewrapCommand}
              </pre>
            </div>

            {/* PWABuilder Alternative */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Online 1-Click APK Generator (PWABuilder)</span>
                <span className="text-[11px] text-slate-400">Paste your app URL to generate ready-to-install Android APK</span>
              </div>
              <a
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <span>PWABuilder</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 4: Local VPN Bridge */}
        {activeTab === 'vpnbridge' && (
          <div className="mt-4 space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
              <strong>How Local VPN Works:</strong> Unlike commercial VPNs that route through remote servers, ByeDPI operates locally on device (`127.0.0.1:1080`). Android's <code>VpnService</code> redirects device traffic through a local `hev-socks5-tunnel` into the ByeDPI C daemon, so you get full DPI bypass with <strong>zero server lag</strong>, <strong>zero data logs</strong>, and <strong>no subscription</strong>.
            </div>

            {/* Android Manifest VpnService */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-300">Android VpnService Manifest Hook</span>
                <button
                  onClick={() => copyText(androidVpnSnippet, 'vpn')}
                  className="flex items-center gap-1 text-[11px] text-teal-300 hover:text-white"
                >
                  {copiedCode === 'vpn' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'vpn' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre">
                {androidVpnSnippet}
              </pre>
            </div>

            {/* Active Command String for ByeDPI Android */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-slate-200 block">Copy Current Parameters for ByeDPI Android APK:</span>
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-teal-300">
                <span className="truncate">{currentCmd}</span>
                <button
                  onClick={() => copyText(currentCmd, 'cmd')}
                  className="px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0"
                >
                  {copiedCode === 'cmd' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
