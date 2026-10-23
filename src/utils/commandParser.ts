import { ByeDpiConfig, DesyncMethod, SplitAnchor, HostsMode, AutoTrigger } from '../types/byedpi';

export const DEFAULT_CONFIG: ByeDpiConfig = {
  id: 'default-profile',
  name: 'Smart Unli Data Bypass',
  description: 'Smart Telecom / Mobile Carrier bypass with fake SNI and QUIC UDP disabled',
  category: 'mobile',
  
  listenIp: '127.0.0.1',
  port: 1080,
  maxConnections: 512,
  bufferSize: 16384,
  defaultTtl: 0,
  noDomain: false,
  tcpFastOpen: false,
  httpConnect: false,
  blockUdpQuic: true,
  hotspotShare: false,
  
  desyncMethod: 'fake',
  splitPosition: 1,
  splitAnchor: 'none',
  
  fakeTtl: 4,
  fakeSni: 'opensignal.com',
  fakeOffset: 0,
  dropSack: false,
  tcpMd5Sig: false,
  oobChar: 'a',
  
  tlsRecordSplit: false,
  tlsRecordPosition: 1,
  tlsRecordAtSni: false,
  
  hostMixedCase: false,
  domainMixedCase: false,
  hostRemoveSpaces: false,
  
  desyncHttp: true,
  desyncHttps: true,
  desyncUdp: false,
  udpFakeCount: 0,
  
  autoEnabled: false,
  autoTriggers: ['torst'],
  autoMode: 1,
  
  hostsMode: 'disable',
  hostsList: [],
  
  dnsServer: '94.140.14.14', // AdGuard DNS (Ad-free)
  blockAds: true,
};

/**
 * Builds the exact ciadpi command string from a configuration
 */
export function buildCommandString(config: ByeDpiConfig, includeBinaryName = false): string {
  const parts: string[] = [];
  
  if (includeBinaryName) {
    parts.push('ciadpi');
  }

  // Network & Listen
  if (config.hotspotShare) {
    parts.push('-i 0.0.0.0');
  } else if (config.listenIp && config.listenIp !== '127.0.0.1' && config.listenIp !== '0.0.0.0') {
    parts.push(`-i ${config.listenIp}`);
  }

  if (config.port && config.port !== 1080) {
    parts.push(`-p ${config.port}`);
  }

  if (config.maxConnections && config.maxConnections !== 512) {
    parts.push(`-c ${config.maxConnections}`);
  }

  if (config.bufferSize && config.bufferSize !== 16384) {
    parts.push(`-b ${config.bufferSize}`);
  }

  if (config.defaultTtl > 0) {
    parts.push(`-g ${config.defaultTtl}`);
  }

  if (config.noDomain) {
    parts.push('-N');
  }

  if (config.tcpFastOpen) {
    parts.push('-F');
  }

  if (config.httpConnect) {
    parts.push('-G');
  }

  // Desync Method & Split
  const anchorSuffix = config.splitAnchor === '+s' ? '+s' : config.splitAnchor === '+h' ? '+h' : '';
  const posStr = `${config.splitPosition}${anchorSuffix}`;

  switch (config.desyncMethod) {
    case 'split':
      parts.push(`-s ${posStr}`);
      break;
    case 'disorder':
      parts.push(`-d ${posStr}`);
      break;
    case 'fake':
      parts.push(`-f -1`);
      break;
    case 'oob':
      parts.push(`-o ${posStr}`);
      break;
    case 'disoob':
      parts.push(`--disoob ${posStr}`);
      break;
    case 'none':
      break;
  }

  // Fake Packet Tweaks
  if (config.desyncMethod === 'fake' || config.fakeTtl > 0) {
    if (config.fakeTtl > 0) {
      parts.push(`-t ${config.fakeTtl}`);
    }
    if (config.fakeSni && config.fakeSni.trim().length > 0) {
      parts.push(`-n ${config.fakeSni.trim()}`);
    }
    if (config.fakeOffset > 0) {
      parts.push(`--fake-offset ${config.fakeOffset}`);
    }
  }

  if (config.dropSack) {
    parts.push('-K');
  }

  if (config.tcpMd5Sig) {
    parts.push('-S');
  }

  if (config.desyncMethod === 'oob' && config.oobChar && config.oobChar !== 'a') {
    parts.push(`--oob-data ${config.oobChar}`);
  }

  // TLS Record Layer Splitting
  if (config.tlsRecordSplit) {
    const tlsPos = `${config.tlsRecordPosition}${config.tlsRecordAtSni ? '+s' : ''}`;
    parts.push(`-r ${tlsPos}`);
  }

  // HTTP Header Obfuscation
  const mods: string[] = [];
  if (config.hostMixedCase) mods.push('hmix');
  if (config.domainMixedCase) mods.push('dmix');
  if (config.hostRemoveSpaces) mods.push('space');
  if (mods.length > 0) {
    parts.push(`-m ${mods.join(',')}`);
  }

  // Protocol specification
  const protos: string[] = [];
  if (config.desyncHttp) protos.push('http');
  if (config.desyncHttps) protos.push('https');
  if (config.desyncUdp) protos.push('udp');
  if (protos.length > 0 && protos.length < 3) {
    parts.push(`--proto=${protos.join(',')}`);
  }

  if (config.udpFakeCount > 0) {
    parts.push(`-u ${config.udpFakeCount}`);
  }

  // Auto Adaptive Mode
  if (config.autoEnabled && config.autoTriggers.length > 0) {
    parts.push(`-A ${config.autoTriggers.join(',')}`);
    if (config.autoMode > 0) {
      parts.push(`-L ${config.autoMode}`);
    }
  }

  // Block UDP QUIC
  if (config.blockUdpQuic) {
    parts.push('-Q');
  }

  return parts.join(' ').trim();
}

/**
 * Parses an arbitrary ByeDPI / ciadpi command line string into a structured ByeDpiConfig
 */
export function parseCommandString(cmd: string, baseConfig: ByeDpiConfig = DEFAULT_CONFIG): ByeDpiConfig {
  const result: ByeDpiConfig = { ...baseConfig };
  
  if (!cmd || cmd.trim().length === 0) {
    return result;
  }

  // Normalize and split while respecting quotes
  let cleaned = cmd.trim();
  if (cleaned.startsWith('ciadpi')) {
    cleaned = cleaned.substring(6).trim();
  }

  // Tokenize arguments
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const tokens: string[] = [];
  let match;
  while ((match = regex.exec(cleaned)) !== null) {
    tokens.push(match[1] || match[2] || match[0]);
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];

    if (token === '-i' || token === '--ip') {
      if (nextToken) {
        result.listenIp = nextToken;
        if (nextToken === '0.0.0.0') result.hotspotShare = true;
        i++;
      }
    } else if (token === '-p' || token === '--port') {
      if (nextToken) {
        const p = parseInt(nextToken, 10);
        if (!isNaN(p)) result.port = p;
        i++;
      }
    } else if (token === '-s' || token === '--split') {
      result.desyncMethod = 'split';
      if (nextToken && !nextToken.startsWith('-')) {
        parseSplitPos(nextToken, result);
        i++;
      }
    } else if (token === '-d' || token === '--disorder') {
      result.desyncMethod = 'disorder';
      if (nextToken && !nextToken.startsWith('-')) {
        parseSplitPos(nextToken, result);
        i++;
      }
    } else if (token === '-f' || token === '--fake') {
      result.desyncMethod = 'fake';
      if (nextToken && !nextToken.startsWith('-')) {
        i++;
      }
    } else if (token === '-o' || token === '--oob') {
      result.desyncMethod = 'oob';
      if (nextToken && !nextToken.startsWith('-')) {
        parseSplitPos(nextToken, result);
        i++;
      }
    } else if (token === '--disoob') {
      result.desyncMethod = 'disoob';
      if (nextToken && !nextToken.startsWith('-')) {
        parseSplitPos(nextToken, result);
        i++;
      }
    } else if (token === '-t' || token === '--ttl') {
      if (nextToken) {
        const ttl = parseInt(nextToken, 10);
        if (!isNaN(ttl)) result.fakeTtl = ttl;
        i++;
      }
    } else if (token === '-n' || token === '--fake-sni') {
      if (nextToken) {
        result.fakeSni = nextToken;
        i++;
      }
    } else if (token === '-r' || token === '--tlsrec') {
      result.tlsRecordSplit = true;
      if (nextToken && !nextToken.startsWith('-')) {
        if (nextToken.includes('+s')) {
          result.tlsRecordAtSni = true;
          const pos = parseInt(nextToken.replace('+s', ''), 10);
          if (!isNaN(pos)) result.tlsRecordPosition = pos;
        } else {
          const pos = parseInt(nextToken, 10);
          if (!isNaN(pos)) result.tlsRecordPosition = pos;
        }
        i++;
      }
    } else if (token === '-K' || token === '--drop-sack') {
      result.dropSack = true;
    } else if (token === '-S' || token === '--md5sig') {
      result.tcpMd5Sig = true;
    } else if (token === '-Q' || token === '--block-udp' || token === '-U') {
      result.blockUdpQuic = true;
    } else if (token === '-N' || token === '--no-domain') {
      result.noDomain = true;
    } else if (token === '-F' || token === '--tfo') {
      result.tcpFastOpen = true;
    } else if (token === '-G' || token === '--http-connect') {
      result.httpConnect = true;
    } else if (token === '-c' || token === '--max-conn') {
      if (nextToken) {
        const c = parseInt(nextToken, 10);
        if (!isNaN(c)) result.maxConnections = c;
        i++;
      }
    } else if (token === '-g' || token === '--def-ttl') {
      if (nextToken) {
        const g = parseInt(nextToken, 10);
        if (!isNaN(g)) result.defaultTtl = g;
        i++;
      }
    } else if (token === '-m' || token.startsWith('--mod-http')) {
      const val = token.includes('=') ? token.split('=')[1] : nextToken;
      if (val) {
        if (val.includes('hmix')) result.hostMixedCase = true;
        if (val.includes('dmix')) result.domainMixedCase = true;
        if (val.includes('space')) result.hostRemoveSpaces = true;
        if (!token.includes('=')) i++;
      }
    } else if (token.startsWith('--proto')) {
      const val = token.includes('=') ? token.split('=')[1] : nextToken;
      if (val) {
        result.desyncHttp = val.includes('http');
        result.desyncHttps = val.includes('https');
        result.desyncUdp = val.includes('udp');
        if (!token.includes('=')) i++;
      }
    } else if (token === '-A' || token.startsWith('--auto')) {
      result.autoEnabled = true;
      const val = token.includes('=') ? token.split('=')[1] : nextToken;
      if (val && !val.startsWith('-')) {
        result.autoTriggers = val.split(',') as AutoTrigger[];
        if (!token.includes('=')) i++;
      }
    } else if (token === '-L' || token.startsWith('--auto-mode')) {
      const val = token.includes('=') ? token.split('=')[1] : nextToken;
      if (val) {
        const m = parseInt(val, 10);
        if (!isNaN(m)) result.autoMode = m;
        if (!token.includes('=')) i++;
      }
    }
  }

  return result;
}

function parseSplitPos(raw: string, target: ByeDpiConfig) {
  if (raw.includes('+s')) {
    target.splitAnchor = '+s';
    const num = parseInt(raw.replace('+s', ''), 10);
    target.splitPosition = isNaN(num) ? 1 : num;
  } else if (raw.includes('+h')) {
    target.splitAnchor = '+h';
    const num = parseInt(raw.replace('+h', ''), 10);
    target.splitPosition = isNaN(num) ? 1 : num;
  } else {
    target.splitAnchor = 'none';
    const num = parseInt(raw, 10);
    target.splitPosition = isNaN(num) ? 1 : num;
  }
}

/**
 * Returns a breakdown of arguments for user educational inspection
 */
export interface CommandFlagExplainer {
  flag: string;
  category: string;
  summary: string;
  technicalRole: string;
}

export function explainCommand(cmd: string): CommandFlagExplainer[] {
  const flags: CommandFlagExplainer[] = [];
  const parts = cmd.split(/\s+/);
  
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === '-s') {
      flags.push({
        flag: `-s ${parts[i+1] || '1'}`,
        category: 'TCP Stream Splitting',
        summary: 'Splits TCP data stream into segments',
        technicalRole: 'Forces DPI middlebox to inspect only half the SNI/Host, causing state mismatch.'
      });
    } else if (p === '-d') {
      flags.push({
        flag: `-d ${parts[i+1] || '1'}`,
        category: 'Packet Disorder',
        summary: 'Transmits packet segments reversed in TCP sequence',
        technicalRole: 'DPI buffer cannot reconstruct stream before timeout; destination OS reassembles TCP correctly.'
      });
    } else if (p === '-f') {
      flags.push({
        flag: `-f ${parts[i+1] || '-1'}`,
        category: 'Fake Packet Injection',
        summary: 'Precedes real connection with a decoy packet',
        technicalRole: 'Poisons DPI flow tracker cache so real stream passes uninspected.'
      });
    } else if (p === '-t') {
      flags.push({
        flag: `-t ${parts[i+1] || '4'}`,
        category: 'Time To Live (TTL)',
        summary: `Decoy hop limit set to ${parts[i+1] || '4'}`,
        technicalRole: 'Decoy packet expires at the DPI firewall node before reaching destination server.'
      });
    } else if (p === '-n') {
      flags.push({
        flag: `-n ${parts[i+1] || 'domain'}`,
        category: 'Fake SNI Header',
        summary: `Spoofed domain: ${parts[i+1] || 'opensignal.com'}`,
        technicalRole: 'Unrestricted whitelisted domain inserted into decoy TLS ClientHello.'
      });
    } else if (p === '-r') {
      flags.push({
        flag: `-r ${parts[i+1] || '1+s'}`,
        category: 'TLS Record Fragmentation',
        summary: 'Fragments TLS Record layer',
        technicalRole: 'Splits TLS ClientHello across multiple TLS records at the SNI boundary.'
      });
    } else if (p === '-Q' || p === '-U') {
      flags.push({
        flag: p,
        category: 'UDP / QUIC Blocker',
        summary: 'Disables UDP QUIC protocol',
        technicalRole: 'Forces YouTube, Discord, and browsers to fallback to TCP, where DPI desync succeeds.'
      });
    } else if (p === '-K') {
      flags.push({
        flag: '-K',
        category: 'Drop SACK',
        summary: 'Disables TCP Selective Acknowledgment',
        technicalRole: 'Prevents DPI from requesting retransmission of dropped decoy packets.'
      });
    } else if (p === '-i' && parts[i+1] === '0.0.0.0') {
      flags.push({
        flag: '-i 0.0.0.0',
        category: 'Hotspot Tethering',
        summary: 'Binds proxy to all network interfaces',
        technicalRole: 'Allows connected phones, PCs, smart TVs, and consoles to route through the bypass.'
      });
    }
  }
  
  return flags;
}
