import React, { useState } from 'react';
import { 
  Layers, 
  Check, 
  Copy, 
  Plus, 
  Trash2, 
  Sparkles, 
  Smartphone, 
  Globe, 
  Tv, 
  Gamepad2, 
  Radio, 
  ArrowRight,
  BookmarkCheck
} from 'lucide-react';
import { ByeDpiConfig, PresetProfile } from '../types/byedpi';
import { PRESET_PROFILES } from '../utils/presets';
import { getCustomPresets, saveCustomPresets } from '../utils/storage';
import { parseCommandString, buildCommandString } from '../utils/commandParser';
import { playHapticSound } from '../utils/audioFeedback';

interface PresetsTabProps {
  currentConfig: ByeDpiConfig;
  onSelectPreset: (preset: PresetProfile) => void;
  soundEnabled: boolean;
}

export const PresetsTab: React.FC<PresetsTabProps> = ({
  currentConfig,
  onSelectPreset,
  soundEnabled,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'mobile' | 'broadband' | 'streaming' | 'gaming' | 'custom'>('all');
  const [customPresets, setCustomPresets] = useState<PresetProfile[]>(getCustomPresets());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [newPresetCmd, setNewPresetCmd] = useState('-s 1 -d 1 -f -1 -t 4');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allPresets = [...PRESET_PROFILES, ...customPresets];

  const filteredPresets = activeCategory === 'all' 
    ? allPresets 
    : allPresets.filter(p => p.category === activeCategory);

  const handleCopyCmd = (id: string, cmd: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`ciadpi ${cmd}`);
    if (soundEnabled) playHapticSound('click');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (preset: PresetProfile) => {
    if (soundEnabled) playHapticSound('click');
    onSelectPreset(preset);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const parsedConfig = parseCommandString(newPresetCmd);
    const newProfile: PresetProfile = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      regionOrTarget: 'Custom Profile',
      category: 'custom',
      description: newPresetDesc.trim() || 'Custom user configuration',
      tags: ['Custom', 'User Created'],
      recommendedFor: 'Custom network environment',
      command: newPresetCmd.trim(),
      config: { ...parsedConfig, name: newPresetName.trim() }
    };

    const updated = [newProfile, ...customPresets];
    setCustomPresets(updated);
    saveCustomPresets(updated);
    if (soundEnabled) playHapticSound('click');
    setShowAddModal(false);
    setNewPresetName('');
    setNewPresetDesc('');
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    saveCustomPresets(updated);
    if (soundEnabled) playHapticSound('click');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'mobile': return Smartphone;
      case 'broadband': return Globe;
      case 'streaming': return Tv;
      case 'gaming': return Gamepad2;
      default: return Radio;
    }
  };

  return (
    <div className="pb-32 pt-2 px-4 max-w-3xl mx-auto space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            Network Environment Profiles
          </h2>
          <p className="text-xs text-slate-400">
            Pre-tuned ByeDPI command setups for diverse cellular carriers & ISP firewalls
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Preset</span>
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Environments' },
          { id: 'mobile', label: 'Mobile Carrier 4G/5G' },
          { id: 'streaming', label: 'YouTube & Streaming' },
          { id: 'broadband', label: 'Fixed Broadband' },
          { id: 'gaming', label: 'Gaming & Voice' },
          { id: 'custom', label: 'Custom' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (soundEnabled) playHapticSound('switch');
              setActiveCategory(tab.id as any);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border whitespace-nowrap transition-all ${
              activeCategory === tab.id
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Presets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredPresets.map((preset) => {
          const Icon = getCategoryIcon(preset.category);
          const isCurrent = currentConfig.name === preset.name || buildCommandString(currentConfig) === preset.command;

          return (
            <div
              key={preset.id}
              onClick={() => handleApply(preset)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer relative md-elevation-1 group ${
                isCurrent
                  ? 'bg-gradient-to-br from-teal-950/40 to-slate-900 border-teal-500/50 ring-1 ring-teal-500/30'
                  : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${
                    isCurrent 
                      ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      {preset.name}
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-teal-500 text-slate-950">
                          Active
                        </span>
                      )}
                    </h3>
                    <span className="text-[11px] text-teal-400/90 font-medium">
                      {preset.regionOrTarget}
                    </span>
                  </div>
                </div>

                {preset.category === 'custom' && (
                  <button
                    onClick={(e) => handleDeleteCustom(preset.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete custom preset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 mb-3 line-clamp-2">
                {preset.description}
              </p>

              {/* Command Pill */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/60 mb-3">
                <code className="text-[11px] font-mono text-cyan-300 truncate mr-2">
                  ciadpi {preset.command}
                </code>
                <button
                  onClick={(e) => handleCopyCmd(preset.id, preset.command, e)}
                  className="p-1 rounded-md text-slate-400 hover:text-white shrink-0 hover:bg-slate-800 transition-colors"
                  title="Copy command"
                >
                  {copiedId === preset.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Tag Chips & Apply Button */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                <div className="flex flex-wrap gap-1">
                  {preset.tags.slice(0, 2).map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                      {t}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-semibold text-teal-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  {isCurrent ? 'Current' : 'Select'}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Preset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-5 rounded-3xl bg-slate-900 border border-slate-800 md-elevation-3">
            <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Create Custom Network Preset
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Save your unique ByeDPI parameters for quick 1-click loading.
            </p>

            <form onSubmit={handleCreateCustom} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Preset Name
                </label>
                <input
                  type="text"
                  required
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g. My ISP YouTube Fix"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  placeholder="Optional brief notes"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ByeDPI Command Line Arguments
                </label>
                <input
                  type="text"
                  required
                  value={newPresetCmd}
                  onChange={(e) => setNewPresetCmd(e.target.value)}
                  placeholder="-s 1 -d 1 -f -1 -t 4 -Q"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-teal-300 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
