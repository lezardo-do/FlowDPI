export type DesyncMethod = 'none' | 'split' | 'disorder' | 'fake' | 'oob' | 'disoob';

export type HostsMode = 'disable' | 'blacklist' | 'whitelist';

export type AutoTrigger = 'torst' | 'redirect' | 'ssl_err' | 'none';

export type SplitAnchor = 'none' | '+s' | '+h';

export interface ByeDpiConfig {
  id: string;
  name: string;
  description: string;
  category: 'mobile' | 'broadband' | 'streaming' | 'gaming' | 'custom';
  
  // Proxy & Network
  listenIp: string; // '127.0.0.1' or '0.0.0.0'
  port: number; // 1080
  maxConnections: number; // 512
  bufferSize: number; // 16384
  defaultTtl: number; // 0 (auto) or custom 64
  noDomain: boolean; // -N
  tcpFastOpen: boolean; // -F
  httpConnect: boolean; // -G
  blockUdpQuic: boolean; // -Q (block UDP QUIC)
  hotspotShare: boolean; // -i 0.0.0.0
  
  // Desync Core
  desyncMethod: DesyncMethod; // -s, -d, -f, -o, etc.
  splitPosition: number; // 1, 2, 3
  splitAnchor: SplitAnchor; // none, +s (SNI), +h (Host)
  
  // Fake Packet Settings
  fakeTtl: number; // 1 to 12
  fakeSni: string; // 'opensignal.com', 'www.google.com', 'www.iana.org'
  fakeOffset: number; // 0
  dropSack: boolean; // -K
  tcpMd5Sig: boolean; // -S
  oobChar: string; // 'a'
  
  // TLS Record Layer Splitting
  tlsRecordSplit: boolean; // -r
  tlsRecordPosition: number; // 1
  tlsRecordAtSni: boolean; // 1+s
  
  // HTTP Protocol Desync Modifiers
  hostMixedCase: boolean; // hmix
  domainMixedCase: boolean; // dmix
  hostRemoveSpaces: boolean; // space
  
  // Protocols
  desyncHttp: boolean;
  desyncHttps: boolean;
  desyncUdp: boolean;
  udpFakeCount: number; // -u
  
  // Adaptive / Auto Mode
  autoEnabled: boolean;
  autoTriggers: AutoTrigger[]; // ['torst', 'ssl_err']
  autoMode: number; // 0, 1, 2, 3
  
  // Hosts Filtering
  hostsMode: HostsMode;
  hostsList: string[]; // ['googlevideo.com', 'youtube.com']

  // DNS settings
  dnsServer: string; // '94.140.14.14' (AdGuard), '1.1.1.1', etc.
  blockAds: boolean;
}

export interface PresetProfile {
  id: string;
  name: string;
  regionOrTarget: string;
  category: 'mobile' | 'broadband' | 'streaming' | 'gaming' | 'custom';
  description: string;
  tags: string[];
  recommendedFor: string;
  command: string;
  config: Partial<ByeDpiConfig>;
}

export interface TrafficStats {
  downloadSpeedKbps: number;
  uploadSpeedKbps: number;
  totalDownloadBytes: number;
  totalUploadBytes: number;
  pingMs: number;
  connectedSince: number | null;
  activeSockets: number;
  packetFragmentsCount: number;
  droppedFakesCount: number;
}

export interface SplitTunnelApp {
  id: string;
  name: string;
  packageName: string;
  category: 'browser' | 'social' | 'streaming' | 'gaming' | 'tools';
  bypassVpn: boolean;
  iconName: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'debug';
  message: string;
  tag: 'PROXY' | 'DESYNC' | 'DNS' | 'SOCKS5' | 'CORE';
}
