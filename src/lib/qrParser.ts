import { TBoxConnectionMode } from '../types/motohub';

export enum TBoxQrOrigin {
  RECOGNISED = 'RECOGNISED',
  UNVERIFIED = 'UNVERIFIED',
}

export interface TBoxQrTopology {
  bits: number;
  accessPoint: boolean;
  wifiDirect: boolean;
  phoneHostsHotspot: boolean;
  description: string;
}

export interface TBoxQrPayload {
  ssid: string;
  password: string;
  encryption: string | null;
  modelId: string | null;
  displayName: string | null;
  origin: TBoxQrOrigin;
  suggestedConnectionMode: TBoxConnectionMode | null;
  topology: TBoxQrTopology;
  dashMacAddress: string | null;
  dialect: string;
}

export type QrParseResult =
  | { ok: true; payload: TBoxQrPayload }
  | { ok: false; error: string };

const BIT_AP = 1;
const BIT_AP_INTERNET = 1 << 1;
const BIT_P2P = 1 << 3;
const BIT_PHONE_HOTSPOT = 1 << 7;

const KNOWN_PROVISIONING_DOMAINS = ['carbit.com', 'carbit.com.cn', 'motomorini.com'];
const THINKER_RIDE_DOMAINS = ['thinkerride.com'];
const EYLINK_PREFIXES = ['EY_', 'KTEY_'];

const TRY_THE_IOS_CODE =
  ' If the dash shows two codes, use the one marked for iPhone / CarPlay - despite the label, it pairs Android too.';

const OR_THE_IOS_ACCESS_POINT =
  ' If the dash also offers iPhone / CarPlay, picking that turns on an access point of its own - joining it is easier, and it pairs Android too.';

function parseTopology(raw?: string | null): TBoxQrTopology {
  const bits = raw ? Number.parseInt(raw.trim(), 10) || 0 : 0;
  const accessPoint = (bits & (BIT_AP | BIT_AP_INTERNET)) !== 0;
  const wifiDirect = (bits & BIT_P2P) !== 0;
  const phoneHostsHotspot = (bits & BIT_PHONE_HOTSPOT) !== 0;
  let description = 'nothing (no action bitmask in the code)';
  if (bits !== 0) {
    const claims: string[] = [];
    if ((bits & BIT_AP) !== 0) claims.push('access point');
    if ((bits & BIT_AP_INTERNET) !== 0) claims.push('access point with internet');
    if (wifiDirect) claims.push('Wi-Fi Direct');
    if (phoneHostsHotspot) claims.push('phone hosts the hotspot');
    description = claims.length ? `${claims.join(', ')} (action=${bits})` : `unknown (action=${bits})`;
  }
  return { bits, accessPoint, wifiDirect, phoneHostsHotspot, description };
}

function suggestedModeFromTopology(topology: TBoxQrTopology): TBoxConnectionMode | null {
  if (topology.phoneHostsHotspot && !topology.accessPoint && !topology.wifiDirect) {
    return TBoxConnectionMode.PHONE_HOTSPOT;
  }
  if (topology.wifiDirect && !topology.accessPoint && !topology.phoneHostsHotspot) {
    return TBoxConnectionMode.WIFI_DIRECT;
  }
  return null;
}

function normaliseMac(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.trim().replace(/[:-]/g, '');
  if (!/^[0-9a-fA-F]{12}$/.test(digits)) return null;
  return digits.toLowerCase().match(/.{2}/g)?.join(':') ?? null;
}

function safeDecodeComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function hostOf(rawValue: string): string | null {
  try {
    return new URL(rawValue).hostname.toLowerCase();
  } catch {
    const idx = rawValue.indexOf('://');
    if (idx === -1) return null;
    const after = rawValue.slice(idx + 3);
    const authority = after.split(/[/?#]/)[0] || '';
    const host = authority.split('@').pop()?.split(':')[0] || '';
    return host ? host.toLowerCase() : null;
  }
}

function isKnownProvisioningHost(host: string): boolean {
  return KNOWN_PROVISIONING_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}

function queryParameters(rawValue: string): Record<string, string> {
  const qIdx = rawValue.indexOf('?');
  if (qIdx === -1) return {};
  const query = rawValue.slice(qIdx + 1).split('#')[0];
  const map: Record<string, string> = {};
  for (const item of query.split('&')) {
    if (!item) continue;
    const eq = item.indexOf('=');
    const k = eq === -1 ? item : item.slice(0, eq);
    const v = eq === -1 ? '' : item.slice(eq + 1);
    map[safeDecodeComponent(k).toLowerCase()] = safeDecodeComponent(v);
  }
  return map;
}

function splitWifiFields(body: string): Record<string, string> {
  const fields: Record<string, string> = {};
  let buffer = '';
  let key: string | null = null;
  let escaped = false;

  const commit = () => {
    if (key && key.length > 0 && !(key.toUpperCase() in fields)) {
      fields[key.toUpperCase()] = buffer;
    }
    key = null;
    buffer = '';
  };

  for (const ch of body) {
    if (escaped) {
      buffer += ch;
      escaped = false;
    } else if (ch === '\\') {
      escaped = true;
    } else if (ch === ':' && key === null) {
      key = buffer;
      buffer = '';
    } else if (ch === ';') {
      commit();
    } else {
      buffer += ch;
    }
  }
  commit();
  return fields;
}

function parseEyLink(rawValue: string): TBoxQrPayload | null {
  const params = queryParameters(rawValue);
  const productId = params['productid'] ?? '';
  const device = (params['device'] ?? '').trim();
  const isEyLink =
    productId.toUpperCase() === 'EYLINK' ||
    EYLINK_PREFIXES.some((p) => device.toUpperCase().startsWith(p));
  if (!isEyLink) return null;

  const peerName = (params['name'] || params['ssid'] || '').trim();
  if (!peerName) {
    if (device) {
      return {
        ssid: device,
        password: '',
        encryption: null,
        modelId: 'EYLINK',
        displayName: device,
        origin: TBoxQrOrigin.RECOGNISED,
        suggestedConnectionMode: TBoxConnectionMode.BLE_PROVISIONED,
        topology: parseTopology(null),
        dashMacAddress: normaliseMac(params['mac']),
        dialect: 'EyLink (BLE)',
      };
    }
    return null;
  }

  return {
    ssid: peerName,
    password: params['pwd'] ?? '',
    encryption: null,
    modelId: 'EYLINK',
    displayName: peerName,
    origin: TBoxQrOrigin.RECOGNISED,
    suggestedConnectionMode: TBoxConnectionMode.WIFI_DIRECT,
    topology: parseTopology(null),
    dashMacAddress: null,
    dialect: 'EyLink (Wi-Fi Direct)',
  };
}

function parseWifiCode(rawValue: string): TBoxQrPayload | null {
  if (!rawValue.toUpperCase().startsWith('WIFI:')) return null;
  const fields = splitWifiFields(rawValue.slice(5));
  const ssid = (fields['S'] ?? '').trim();
  if (!ssid) return null;
  return {
    ssid,
    password: fields['P'] ?? '',
    encryption: fields['T'] ?? null,
    modelId: null,
    displayName: null,
    origin: TBoxQrOrigin.UNVERIFIED,
    suggestedConnectionMode: null,
    topology: parseTopology(null),
    dashMacAddress: null,
    dialect: 'Standard Wi-Fi QR',
  };
}

function parseCarbitToken(rawValue: string): TBoxQrPayload | null {
  const m = /^CARBIT([0-9A-Fa-f]{12})$/i.exec(rawValue);
  if (!m) return null;
  const digits = m[1].toUpperCase();
  const advertisedName = `EC${digits.slice(-8)}`;
  return {
    ssid: advertisedName,
    password: '',
    encryption: null,
    modelId: null,
    displayName: advertisedName,
    origin: TBoxQrOrigin.RECOGNISED,
    suggestedConnectionMode: TBoxConnectionMode.BLE_PROVISIONED,
    topology: parseTopology(null),
    dashMacAddress: normaliseMac(digits),
    dialect: 'Carbit BLE Token',
  };
}

function parseMotoFun(rawValue: string): TBoxQrPayload | null {
  const m = /(?:^|[?&])wifi=([^&#\s]+)/i.exec(rawValue);
  if (!m) return null;
  const ssid = m[1].trim();
  if (!ssid) return null;
  const remainder = rawValue.slice(m.index + m[0].length);
  if (!remainder.startsWith('#')) return null;
  const password = remainder.slice(1).split(/[#&]/)[0].trim();
  if (!password) return null;

  const machineId = /machineid=([^&#\s]+)/i.exec(rawValue)?.[1] ?? null;
  const productId = /productid=([^&#\s]+)/i.exec(rawValue)?.[1] ?? null;
  const host = hostOf(rawValue);
  const corroborated = (host !== null && isKnownProvisioningHost(host)) || Boolean(machineId || productId);

  return {
    ssid,
    password,
    encryption: 'wpa2-psk',
    modelId: productId,
    displayName: null,
    origin: corroborated ? TBoxQrOrigin.RECOGNISED : TBoxQrOrigin.UNVERIFIED,
    suggestedConnectionMode: null,
    topology: parseTopology(null),
    dashMacAddress: normaliseMac(machineId),
    dialect: 'MotoFun (Moto Morini)',
  };
}

function parseThinkerRide(rawValue: string): TBoxQrPayload | null {
  const qIdx = rawValue.indexOf('?');
  if (qIdx === -1) return null;
  const query = rawValue.slice(qIdx + 1).split('#')[0];
  const components = query.split('&').filter(Boolean);
  if (components.length < 2) return null;
  const [c0, c1] = components;
  if (c0.includes('=') || c1.includes('=')) return null;

  const host = hostOf(rawValue);
  const thinkerHost = host !== null && THINKER_RIDE_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  const apMarker = components.slice(2).some((c) => c.toLowerCase() === 'ap=1');
  if (!thinkerHost && !apMarker) return null;

  const ssid = safeDecodeComponent(c0).trim();
  if (!ssid) return null;

  return {
    ssid,
    password: safeDecodeComponent(c1),
    encryption: 'wpa2-psk',
    modelId: 'THINKERRIDE',
    displayName: null,
    origin: thinkerHost ? TBoxQrOrigin.RECOGNISED : TBoxQrOrigin.UNVERIFIED,
    suggestedConnectionMode: TBoxConnectionMode.THINKERRIDE,
    topology: parseTopology(null),
    dashMacAddress: null,
    dialect: 'ThinkerRide (KOVE)',
  };
}

function describeUnusableCode(rawValue: string): string {
  const lower = rawValue.toLowerCase();
  if (lower.includes('vin:') && (lower.includes('color:') || lower.includes('engine:') || lower.startsWith('code:'))) {
    return (
      'That is the vehicle information code (VIN, engine, colour), not the Wi-Fi pairing code. Open the phone-connection screen on the dash and scan the code shown there.' +
      TRY_THE_IOS_CODE
    );
  }
  if (lower.includes('motomorini') || lower.includes('motofun')) {
    return 'This Moto Morini code carries no Wifi= field, so it is not the pairing code. Open the phone-link / MotoFun screen on the dash and scan the code there.';
  }
  const host = hostOf(rawValue);
  if (host && isKnownProvisioningHost(host)) {
    return (
      'This dash connects the other way round: it joins a hotspot your phone creates, so its code carries no network to join. On the dash, read the Ssid and Password it shows, set your Android hotspot to exactly those values, turn it on, and the dash will connect by itself.' +
      OR_THE_IOS_ACCESS_POINT
    );
  }
  if (lower.startsWith('http')) {
    return (
      'That is a web address with no network credentials in it. Scan the dash pairing code instead (MotoPlay / EasyConnect / MotoFun).' +
      TRY_THE_IOS_CODE
    );
  }
  return 'The QR code does not carry a T-Box network name.' + TRY_THE_IOS_CODE;
}

export function parseTBoxQr(rawValue: string): QrParseResult {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { ok: false, error: 'Paste or scan a dashboard QR code payload first.' };
  }

  const direct =
    parseEyLink(trimmed) ??
    parseWifiCode(trimmed) ??
    parseCarbitToken(trimmed) ??
    parseMotoFun(trimmed) ??
    parseThinkerRide(trimmed);

  if (direct) {
    return { ok: true, payload: direct };
  }

  const params = queryParameters(trimmed);
  const host = hostOf(trimmed);
  const origin = host !== null && isKnownProvisioningHost(host) ? TBoxQrOrigin.RECOGNISED : TBoxQrOrigin.UNVERIFIED;
  const topology = parseTopology(params['action']);
  const dashMac = normaliseMac(params['mac'] || params['bm']);
  const ssid = (params['ssid'] ?? '').trim();

  if (!ssid && topology.phoneHostsHotspot && dashMac) {
    const tail = dashMac.replace(/:/g, '').slice(-6).toUpperCase();
    const dashName = `EC${dashMac.replace(/:/g, '').slice(-8).toUpperCase()}`;
    return {
      ok: true,
      payload: {
        ssid: dashName,
        password: '',
        encryption: null,
        modelId: params['modelid'] ?? null,
        displayName: `Phone hotspot (${tail})`,
        origin,
        suggestedConnectionMode: TBoxConnectionMode.BLE_PROVISIONED,
        topology,
        dashMacAddress: dashMac,
        dialect: 'Carbit (BLE / Phone Hotspot)',
      },
    };
  }

  if (!ssid) {
    return { ok: false, error: describeUnusableCode(trimmed) };
  }

  return {
    ok: true,
    payload: {
      ssid,
      password: params['pwd'] ?? '',
      encryption: params['auth'] ?? null,
      modelId: params['modelid'] ?? null,
      displayName: params['name'] ?? null,
      origin,
      suggestedConnectionMode: suggestedModeFromTopology(topology),
      topology,
      dashMacAddress: dashMac,
      dialect: origin === TBoxQrOrigin.RECOGNISED ? 'Carbit / EasyConn' : 'Generic Provisioning URL',
    },
  };
}

export const SAMPLE_QR_CODES: Array<{ label: string; brand: string; raw: string }> = [
  {
    label: 'CFMOTO 700MT-ADV (EasyConn)',
    brand: 'CFMOTO',
    raw: 'https://www.carbit.com.cn/app?ssid=CFMOTO_700MT_8F2A&pwd=88888888&auth=wpa2-psk&modelid=66660742&action=1&name=CFMOTO%20700MT-ADV',
  },
  {
    label: 'Moto Morini X-Cape 700 (MotoFun)',
    brand: 'Moto Morini',
    raw: 'http://admin.motomorini.com/app.html?Wifi=ML174167#12345678#dc0d30da1b6c&MachineID=dc0d30da1b6c&ProductID=00297',
  },
  {
    label: 'KOVE 800X (ThinkerRide BLE)',
    brand: 'KOVE',
    raw: 'http://g.thinkerride.com/?KOVE_800X_4912&12345678&ap=1',
  },
  {
    label: 'Zontes S350 (Carbit BLE Token)',
    brand: 'Zontes',
    raw: 'CARBITDC0D301738D4',
  },
  {
    label: 'KOVE 350 RR (EyLink Wi-Fi Direct)',
    brand: 'KOVE',
    raw: 'https://appstore.eryanet.com?productid=EYLINK&device=EY_350RR_11A4&ssid=EY_350RR_11A4&pwd=12345678&name=EY_350RR_11A4',
  },
];
