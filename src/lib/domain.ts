/**
 * Utility to handle domain and subdomain logic across client and server.
 */

export function getRootDomain() {
  // 1. Check environment variable (highest priority)
  if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    return process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  }

  // 2. Client-side detection
  if (typeof window !== "undefined") {
    const host = window.location.host;
    return extractRootDomain(host);
  }

  // Fallback for build time or server-side when headers aren't available
  return "localhost:3000";
}

/**
 * Extracts the root domain from a hostname.
 * e.g., super-admin.abcd-edu.com -> abcd-edu.com
 * e.g., localhost:3000 -> localhost:3000
 */
export function extractRootDomain(host: string) {
  if (!host) return "localhost:3000";
  
  const cleanHost = host.split(':')[0];
  const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost) || cleanHost === '::1' || cleanHost === '[::1]';

  // Handle IP addresses and localhost (no subdomains possible)
  if (isIp || cleanHost === 'localhost' || host.includes('127.0.0.1')) {
    return host;
  }

  // Handle Vercel preview URLs (they usually don't have subdomains we want to strip)
  if (host.endsWith('.vercel.app')) {
    return host;
  }

  const parts = host.split('.');
  
  // If it's a simple domain like example.com
  if (parts.length <= 2) {
    return host;
  }

  // If it's a subdomain like super-admin.example.com, take the last two parts
  // Note: This is a simplification and might not work for .co.uk etc without a list of TLDs
  // But for this platform's use case, it's usually [tenant].[domain].[tld]
  return parts.slice(-2).join('.');
}
