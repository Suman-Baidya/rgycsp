/**
 * Lightweight helper to parse browser, OS, and device type from user-agent string
 */
export function parseUserAgentDetails(ua: string = ""): {
  device: string;
  browser: string;
  os: string;
} {
  const lower = ua.toLowerCase();

  // Device Detection
  let device = "Desktop";
  if (lower.includes("tablet") || lower.includes("ipad")) {
    device = "Tablet";
  } else if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    device = "Mobile";
  }

  // OS Detection
  let os = "Unknown OS";
  if (lower.includes("windows nt 10.0") || lower.includes("windows 11")) {
    os = "Windows 11 / 10";
  } else if (lower.includes("windows nt 6.3")) {
    os = "Windows 8.1";
  } else if (lower.includes("windows nt 6.1")) {
    os = "Windows 7";
  } else if (lower.includes("windows")) {
    os = "Windows";
  } else if (lower.includes("mac os x")) {
    os = "macOS";
  } else if (lower.includes("android")) {
    os = "Android";
  } else if (lower.includes("iphone") || lower.includes("ipad") || lower.includes("ios")) {
    os = "iOS";
  } else if (lower.includes("linux")) {
    os = "Linux";
  }

  // Browser Detection
  let browser = "Web Browser";
  if (lower.includes("edg/")) {
    browser = "Microsoft Edge";
  } else if (lower.includes("chrome") && !lower.includes("chromium")) {
    browser = "Google Chrome";
  } else if (lower.includes("safari") && !lower.includes("chrome")) {
    browser = "Apple Safari";
  } else if (lower.includes("firefox")) {
    browser = "Mozilla Firefox";
  } else if (lower.includes("opr") || lower.includes("opera")) {
    browser = "Opera";
  }

  return { device, browser, os };
}
