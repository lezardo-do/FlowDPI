import { ByeDpiConfig, PresetProfile, SplitTunnelApp, LogEntry } from '../types/byedpi';
import { DEFAULT_CONFIG } from './commandParser';
import { PRESET_PROFILES } from './presets';

const STORAGE_KEYS = {
  ACTIVE_CONFIG: 'flowdpi_active_config',
  CUSTOM_PRESETS: 'flowdpi_custom_presets',
  SPLIT_TUNNEL_APPS: 'flowdpi_split_apps',
  HOSTS_LISTS: 'flowdpi_hosts_lists',
  THEME: 'flowdpi_theme',
  SOUND_ENABLED: 'flowdpi_sound_enabled',
  STATISTICS: 'flowdpi_lifetime_stats',
};

export const INITIAL_SPLIT_APPS: SplitTunnelApp[] = [
  { id: '1', name: 'Google Chrome', packageName: 'com.android.chrome', category: 'browser', bypassVpn: false, iconName: 'Globe' },
  { id: '2', name: 'YouTube', packageName: 'com.google.android.youtube', category: 'streaming', bypassVpn: false, iconName: 'Tv' },
  { id: '3', name: 'Discord', packageName: 'com.discord', category: 'social', bypassVpn: false, iconName: 'MessageSquare' },
  { id: '4', name: 'Telegram', packageName: 'org.telegram.messenger', category: 'social', bypassVpn: false, iconName: 'Send' },
  { id: '5', name: 'TikTok', packageName: 'com.zhiliaoapp.musically', category: 'social', bypassVpn: false, iconName: 'Video' },
  { id: '6', name: 'Steam Mobile', packageName: 'com.valvesoftware.android.steam.community', category: 'gaming', bypassVpn: false, iconName: 'Gamepad2' },
  { id: '7', name: 'Mobile Banking (Bypass)', packageName: 'com.bpi.ng.app', category: 'tools', bypassVpn: true, iconName: 'CreditCard' },
  { id: '8', name: 'Local Bank PH (Bypass)', packageName: 'com.bdo.mobile', category: 'tools', bypassVpn: true, iconName: 'ShieldAlert' },
];

export const INITIAL_HOSTS_PRESETS = [
  'googlevideo.com',
  'youtube.com',
  'ytimg.com',
  'discord.com',
  'discord.gg',
  'discordapp.com',
  'gateway.discord.gg',
  'instagram.com',
  'cdninstagram.com',
  'twitter.com',
  'x.com',
  'twimg.com',
  'speedtest.net',
  'opensignal.com',
  'cloudflare.com',
  'wikipedia.org'
];

export function getActiveConfig(): ByeDpiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_CONFIG);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load active config from local storage', e);
  }
  return DEFAULT_CONFIG;
}

export function saveActiveConfig(config: ByeDpiConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config to local storage', e);
  }
}

export function getCustomPresets(): PresetProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRESETS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load custom presets', e);
  }
  return [];
}

export function saveCustomPresets(presets: PresetProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(presets));
  } catch (e) {
    console.error('Failed to save custom presets', e);
  }
}

export function getAllPresets(): PresetProfile[] {
  const custom = getCustomPresets();
  return [...PRESET_PROFILES, ...custom];
}

export function getSplitApps(): SplitTunnelApp[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPLIT_TUNNEL_APPS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load split apps', e);
  }
  return INITIAL_SPLIT_APPS;
}

export function saveSplitApps(apps: SplitTunnelApp[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SPLIT_TUNNEL_APPS, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save split apps', e);
  }
}

export function getAppTheme(): 'dark' | 'amoled' | 'slate' | 'light' {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'amoled' || raw === 'slate' || raw === 'light' || raw === 'dark') {
      return raw;
    }
  } catch (e) {
    // fallback
  }
  return 'dark';
}

export function saveAppTheme(theme: 'dark' | 'amoled' | 'slate' | 'light'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    // fallback
  }
}

export function getSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return raw !== null ? raw === 'true' : true;
  } catch (e) {
    return true;
  }
}

export function saveSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
  } catch (e) {
    // fallback
  }
}

export function exportAllDataAsJson(): string {
  const payload = {
    appName: 'FlowDPI',
    exportDate: new Date().toISOString(),
    version: '1.4.0',
    activeConfig: getActiveConfig(),
    customPresets: getCustomPresets(),
    splitApps: getSplitApps(),
    privacyNotice: '100% Client-Side Local Storage. Zero telemetry, zero external trackers, zero ads.'
  };
  return JSON.stringify(payload, null, 2);
}

export function importAllDataFromJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.activeConfig) {
      saveActiveConfig(parsed.activeConfig);
    }
    if (Array.isArray(parsed.customPresets)) {
      saveCustomPresets(parsed.customPresets);
    }
    if (Array.isArray(parsed.splitApps)) {
      saveSplitApps(parsed.splitApps);
    }
    return true;
  } catch (e) {
    console.error('Invalid import data format', e);
    return false;
  }
}

export function resetAllDataToDefault(): void {
  localStorage.clear();
}
