import { lookupCompanyEntity } from "./company_registry";

const LOGO_CACHE = new Map<string, string>();

/**
 * Custom branded SVG index icons for NIFTY 50 & SENSEX
 */
export function generateIndexAvatarSvg(indexName: string): string {
  const isNifty = /NIFTY/i.test(indexName);
  const title = isNifty ? "NIFTY 50" : "SENSEX";
  const strokeColor = isNifty ? "#f97316" : "#3b82f6";
  const textColor = isNifty ? "#38bdf8" : "#60a5fa";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#0f172a"/>
    <path d="M12 42 L26 26 L36 34 L52 18" stroke="${strokeColor}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="52" cy="18" r="4" fill="${strokeColor}"/>
    <text x="32" y="54" font-family="Inter, system-ui, sans-serif" font-size="10" font-weight="900" fill="${textColor}" text-anchor="middle" letter-spacing="0.5">${title}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Returns a high-res SVG data URI initial avatar as fallback
 */
export function generateInitialAvatarSvg(ticker: string): string {
  const clean = (ticker || "??").toUpperCase().replace(/\.NS$/, "");
  const initials = clean.substring(0, 2);

  // Derive deterministic color theme from ticker characters
  const charCodeSum = clean.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = (charCodeSum * 137) % 360;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="hsl(${hue}, 60%, 20%)"/>
    <text x="32" y="39" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="800" fill="hsl(${hue}, 85%, 85%)" text-anchor="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Company Logo Resolver Service
 */
export class CompanyLogoService {
  /**
   * Resolve logo URL for a ticker or company name with caching and fallback
   */
  public static getLogoUrl(symbolOrName: string): string {
    if (!symbolOrName) return generateInitialAvatarSvg("??");

    const cleanKey = symbolOrName.trim().toUpperCase();
    if (LOGO_CACHE.has(cleanKey)) {
      return LOGO_CACHE.get(cleanKey)!;
    }

    if (/NIFTY|^NSEI|SENSEX|^BSESN/i.test(cleanKey)) {
      const indexLogo = generateIndexAvatarSvg(cleanKey);
      LOGO_CACHE.set(cleanKey, indexLogo);
      return indexLogo;
    }

    const entity = lookupCompanyEntity(cleanKey);

    let logoUrl = "";
    if (entity && entity.domain && entity.domain !== "niftyindices.com" && entity.domain !== "bseindia.com") {
      // Primary logo provider using domain
      logoUrl = `https://unavatar.io/${entity.domain}?fallback=https://logo.clearbit.com/${entity.domain}`;
    } else {
      // Initial avatar SVG fallback
      logoUrl = generateInitialAvatarSvg(symbolOrName);
    }

    LOGO_CACHE.set(cleanKey, logoUrl);
    return logoUrl;
  }

  /**
   * Preload and cache logo URL explicitly
   */
  public static setCustomLogo(symbol: string, url: string): void {
    if (symbol && url) {
      LOGO_CACHE.set(symbol.trim().toUpperCase(), url);
    }
  }
}
