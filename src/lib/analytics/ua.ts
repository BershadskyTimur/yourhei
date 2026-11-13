// Reads the browser and the operating system out of the "User-Agent" line every browser sends.
// Pure function: used when a visit is saved (api/track) and in the admin panel (address of the last sign-in).

export interface UaInfo {
  /** e.g. "Chrome 130", or null when not recognised */
  browser: string | null;
  /** e.g. "Windows 10/11", "Android 14", "iOS 17" */
  os: string | null;
}

const BROWSERS: [RegExp, string][] = [
  [/\bEdg(?:e|A|iOS)?\/(\d+)/, 'Edge'],
  [/\bYaBrowser\/(\d+)/, 'Yandex'],
  [/\bOPR\/(\d+)/, 'Opera'],
  [/\bSamsungBrowser\/(\d+)/, 'Samsung Internet'],
  [/\bUCBrowser\/(\d+)/, 'UC Browser'],
  [/\bFxiOS\/(\d+)/, 'Firefox'],
  [/\bFirefox\/(\d+)/, 'Firefox'],
  [/\bCriOS\/(\d+)/, 'Chrome'],
  [/\bChrome\/(\d+)/, 'Chrome'],
  [/\bVersion\/(\d+)[\d.]* (?:Mobile\/\w+ )?Safari\//, 'Safari'],
];

function osOf(ua: string): string | null {
  let m: RegExpMatchArray | null;
  if ((m = ua.match(/Windows NT (\d+\.\d+)/))) {
    const names: Record<string, string> = { '10.0': 'Windows 10/11', '6.3': 'Windows 8.1', '6.2': 'Windows 8', '6.1': 'Windows 7' };
    return names[m[1]] ?? 'Windows';
  }
  if ((m = ua.match(/Android (\d+)/))) return `Android ${m[1]}`;
  if (/Android/.test(ua)) return 'Android';
  if ((m = ua.match(/iPhone OS (\d+)/))) return `iOS ${m[1]}`;
  if ((m = ua.match(/iPad; CPU OS (\d+)/))) return `iPadOS ${m[1]}`;
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Linux/.test(ua)) return 'Linux';
  return null;
}

export function parseUserAgent(userAgent: string | null | undefined): UaInfo {
  const ua = typeof userAgent === 'string' ? userAgent.slice(0, 400) : '';
  if (!ua) return { browser: null, os: null };
  let browser: string | null = null;
  for (const [re, name] of BROWSERS) {
    const m = ua.match(re);
    if (m) {
      browser = `${name} ${m[1]}`;
      break;
    }
  }
  return { browser, os: osOf(ua) };
}
