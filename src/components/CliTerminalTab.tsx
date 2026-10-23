import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Share2,
  Code2
} from 'lucide-react';
import { ByeDpiConfig, LogEntry } from '../types/byedpi';
import { buildCommandString, parseCommandString } from '../utils/commandParser';
import { exportAllDataAsJson, importAllDataFromJson, resetAllDataToDefault } from '../utils/storage';
import { playHapticSound } from '../utils/audioFeedback';

interface CliTerminalTabProps {
  config: ByeDpiConfig;
  setConfig: (cfg: ByeDpiConfig) => void;
  isConnected: boolean;
  logs: LogEntry[];
  onClearLogs: () => void;
  soundEnabled: boolean;
}

export const CliTerminalTab: React.FC<CliTerminalTabProps> = ({
  config,
  setConfig,
  isConnected,
  logs,
  onClearLogs,
  soundEnabled,
}) => {
  const [cliInput, setCliInput] = useState(buildCommandString(config));
  const [parseStatus, setParseStatus] = useState<string | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleApplyCli = () => {
    try {
      const parsed = parseCommandString(cliInput, config);
      setConfig(parsed);
      if (soundEnabled) playHapticSound('click');
      setParseStatus('Successfully parsed command into multiple-choice settings!');
      setTimeout(() => setParseStatus(null), 3000);
    } catch (e: any) {
      setParseStatus('Parse error: ' + (e?.message || 'Invalid syntax'));
    }
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(`ciadpi ${buildCommandString(config)}`);
    if (soundEnabled) playHapticSound('click');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleExportJson = () => {
    const jsonStr = exportAllDataAsJson();
    navigator.clipboard.writeText(jsonStr);
    if (soundEnabled) playHapticSound('click');
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleDownloadFile = () => {
    const jsonStr = exportAllDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowdpi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (soundEnabled) playHapticSound('click');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    if (!importJsonText.trim()) return;

    // Check if it's a CLI command string or JSON
    const trimmed = importJsonText.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('ciadpi')) {
      const parsed = parseCommandString(trimmed, config);
      setConfig(parsed);
      setCliInput(buildCommandString(parsed));
      setShowImportDialog(false);
      setImportJsonText('');
      if (soundEnabled) playHapticSound('click');
      return;
    }

    const success = importAllDataFromJson(trimmed);
    if (success) {
      setShowImportDialog(false);
      setImportJsonText('');
      if (soundEnabled) playHapticSound('click');
      window.location.reload();
    } else {
      setImportError('Failed to parse backup JSON. Please check formatting.');
    }
  };

  const handleResetStorage = () => {
    if (window.confirm('Reset all local storage to factory defaults? This removes all custom presets.')) {
      resetAllDataToDefault();
      if (soundEnabled) playHapticSound('click');
      window.location.reload();
    }
  };

  return (
    <div className="pb-32 pt-2 px-4 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-teal-400" />
          Command Line & Privacy Data Management
        </h2>
        <p className="text-xs text-slate-400">
          Raw ByeDPI terminal arguments, real-time daemon logs, and local export/import.
        </p>
      </div>

      {/* Card 1: Command Line Editor */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 md-elevation-1 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            Direct ByeDPI Command Line Arguments
          </h3>
          <button
            onClick={handleCopyCli}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all"
          >
            {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCli ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Enter or paste arbitrary ByeDPI flags here. Clicking <strong>Parse to Settings</strong> will automatically detect and populate all multiple-choice switches.
        </p>

        <div className="relative">
          <span className="absolute left-3.5 top-3 text-slate-500 font-mono text-xs select-none">
            ciadpi
          </span>
          <textarea
            rows={2}
            value={cliInput}
            onChange={(e) => setCliInput(e.target.value)}
            placeholder="-s 1 -d 1 -f -1 -t 4 -n opensignal.com -Q"
            className="w-full pl-16 pr-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleApplyCli}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            Parse to Settings
          </button>

          <button
            onClick={() => setCliInput(buildCommandString(config))}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Sync from Active Config
          </button>
        </div>

        {parseStatus && (
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{parseStatus}</span>
          </div>
        )}
      </div>

      {/* Card 2: Live Proxy Daemon Event Logs */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 md-elevation-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <h3 className="text-sm font-bold text-slate-100">Live SOCKS5 Daemon Logs</h3>
          </div>
          <button
            onClick={onClearLogs}
            className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear logs
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/90 font-mono text-[11px] h-48 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">No activity logs recorded. Connect to start session.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-400 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                  log.tag === 'PROXY' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50' :
                  log.tag === 'DESYNC' ? 'bg-teal-950 text-teal-300 border border-teal-800/50' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {log.tag}
                </span>
                <span className={
                  log.level === 'warn' ? 'text-amber-400' :
                  log.level === 'success' ? 'text-emerald-300' :
                  'text-slate-300'
                }>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Card 3: Privacy, Local Storage & Backup Sovereignty */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 md-elevation-1 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-teal-400" />
            Local Data Sovereignty & Portability
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            100% of your configuration resides in your device's local storage. No external servers ever receive your data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={handleExportJson}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {copiedExport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-teal-400" />}
            <span>{copiedExport ? 'Copied JSON' : 'Copy Backup JSON'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download .json</span>
          </button>

          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Restore / Import</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 block">Factory Reset Local Storage</span>
            <span className="text-[11px] text-slate-400">Purge all configs, custom presets, and logs</span>
          </div>
          <button
            onClick={handleResetStorage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Data</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-5 rounded-3xl bg-slate-900 border border-slate-800 md-elevation-3">
            <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-400" />
              Import Configuration or Backup
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Paste a FlowDPI backup JSON or any raw ByeDPI / ciadpi command string.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-3">
              <textarea
                rows={5}
                required
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Paste {"activeConfig": ...} OR raw "-s 1 -d 1 -f -1 -t 4 -Q"'
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />

              {importError && (
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportDialog(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950"
                >
                  Restore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
